/**
 * Posiciones en Google, tour por tour, a partir de una exportacion de Search
 * Console.
 *
 * Uso:
 *   node scripts/posiciones-por-tour.mjs "informes/<mes>/gsc"
 *
 * La carpeta debe contener los Pages.csv y Queries.csv que descarga Search
 * Console en Rendimiento -> Exportar.
 *
 * Dos tablas por tour:
 *
 *   Paginas   suma los tres idiomas de una misma ficha. Search Console las
 *             cuenta por separado, y leerlas sueltas hace parecer que un tour
 *             rinde peor de lo que rinde.
 *
 *   Consultas se emparejan por el termino distintivo del tour ("saona",
 *             "domitai"), porque la exportacion estandar no cruza consulta con
 *             pagina. Es fiable cuando el termino es propio del tour y por eso
 *             solo se listan los que lo son; un tour cuyo nombre son palabras
 *             genericas se queda sin esa tabla en lugar de mostrar consultas
 *             que podrian ser de otra pagina.
 */

import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
if (!dir) {
  console.error('Falta la carpeta. Ejemplo: node scripts/posiciones-por-tour.mjs "informes/julio - agosto 2026/gsc"');
  process.exit(1);
}

/** Terminos propios de cada tour. Solo entran los que no se confunden con otro. */
const TERMINOS = {
  "domitai-park-punta-cana-adventures": ["domitai"],
  "vista-cana-golf-club": ["vista cana"],
  "swim-with-dolphins-explorer": ["dolphin explorer", "swim with dolphins"],
  "iberostar-golf-club-bavaro": ["iberostar golf"],
  "hard-rock-golf-club-at-cana-bay": ["hard rock golf", "cana bay"],
  "golf-n-shots-punta-cana": ["golf n shots", "golf and shots"],
  "saona-island-classic-tour": ["saona"],
  "coco-bongo-punta-cana": ["coco bongo"],
  "dolphin-funtastic": ["dolphin funtastic"],
  "the-lakes-barcelo-bavaro-golf-course": ["the lakes", "barcelo bavaro golf"],
  "private-catamaran-bavaro-coast-punta-cana": ["catamaran"],
  "deep-sea-fishing-share": ["fishing charter", "fishing excursion", "deep sea fishing"],
  "monkeyland-safari-punta-cana": ["monkeyland"],
  "catalina-island-snorkeling-punta-cana": ["catalina"],
  "dune-buggy-punta-cana": ["buggy"],
  "santo-domingo-city-tour": ["santo domingo"],
};

function leerCsv(archivo) {
  const texto = fs.readFileSync(path.join(dir, archivo), "utf8").replace(/^﻿/, "");
  const lineas = texto.split(/\r?\n/).filter(Boolean);
  const cabecera = partir(lineas[0]);
  return lineas.slice(1).map((l) => {
    const celdas = partir(l);
    return Object.fromEntries(cabecera.map((c, i) => [c, celdas[i] ?? ""]));
  });
}

/** Divide una linea de CSV respetando las comillas. */
function partir(linea) {
  const salida = [];
  let actual = "";
  let dentro = false;
  for (let i = 0; i < linea.length; i += 1) {
    const c = linea[i];
    if (c === '"') {
      if (dentro && linea[i + 1] === '"') { actual += '"'; i += 1; }
      else dentro = !dentro;
    } else if (c === "," && !dentro) {
      salida.push(actual); actual = "";
    } else actual += c;
  }
  salida.push(actual);
  return salida;
}

const paginas = leerCsv("Pages.csv");
const consultas = leerCsv("Queries.csv");
const colPagina = Object.keys(paginas[0])[0];
const colConsulta = Object.keys(consultas[0])[0];

/** Media de posicion ponderada por apariciones: 40 apariciones pesan mas que 1. */
const posicionMedia = (filas) => {
  const total = filas.reduce((s, f) => s + Number(f.Impressions), 0);
  if (total === 0) return 0;
  return filas.reduce((s, f) => s + Number(f.Position) * Number(f.Impressions), 0) / total;
};

// --- agrupamos las paginas por tour, sumando idiomas ---
const porTour = new Map();
for (const fila of paginas) {
  const m = /\/(en|es|fr-ca)\/excursions\/([a-z0-9-]+)$/.exec(fila[colPagina]);
  if (!m) continue;
  const slug = m[2];
  if (slug === "categoria" || slug === "destino") continue;
  if (!porTour.has(slug)) porTour.set(slug, []);
  porTour.get(slug).push(fila);
}

const ranking = [...porTour.entries()]
  .map(([slug, filas]) => ({
    slug,
    apariciones: filas.reduce((s, f) => s + Number(f.Impressions), 0),
    clics: filas.reduce((s, f) => s + Number(f.Clicks), 0),
    posicion: posicionMedia(filas),
    idiomas: filas.length,
  }))
  .sort((a, b) => b.apariciones - a.apariciones);

const pad = (v, n) => String(v).padEnd(n);
const num = (v, n) => String(v).padStart(n);

console.log(`\nPOSICIONES POR TOUR   ·   fuente: ${dir}\n`);
console.log(pad("TOUR", 46) + num("APARIC.", 8) + num("CLICS", 7) + num("POSICION", 10) + num("CTR", 8));
console.log("-".repeat(79));
for (const t of ranking.slice(0, 15)) {
  const ctr = t.apariciones ? (100 * t.clics) / t.apariciones : 0;
  console.log(
    pad(t.slug.slice(0, 44), 46) + num(t.apariciones, 8) + num(t.clics, 7) +
    num(t.posicion.toFixed(1), 10) + num(ctr.toFixed(1) + "%", 8),
  );
}

console.log("\n\nCONSULTAS DE CADA TOUR\n");
for (const t of ranking.slice(0, 15)) {
  const terminos = TERMINOS[t.slug];
  if (!terminos) continue;

  const suyas = consultas
    .filter((c) => terminos.some((termino) => c[colConsulta].toLowerCase().includes(termino)))
    .sort((a, b) => Number(b.Impressions) - Number(a.Impressions));
  if (suyas.length === 0) continue;

  console.log(`  ${t.slug}`);
  for (const c of suyas.slice(0, 8)) {
    console.log(
      "    " + pad(c[colConsulta].slice(0, 44), 46) +
      num(c.Impressions, 7) + " aparic." + num(c.Clicks, 5) + " clics" +
      num("pos " + c.Position, 12),
    );
  }
  console.log("");
}

const sinTermino = ranking.slice(0, 15).filter((t) => !TERMINOS[t.slug]).map((t) => t.slug);
if (sinTermino.length > 0) {
  console.log("Sin termino propio definido (anadelo en TERMINOS si lo necesitas):");
  for (const s of sinTermino) console.log("  " + s);
}
