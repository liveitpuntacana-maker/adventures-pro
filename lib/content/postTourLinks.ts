import type { AppLocale } from "@/i18n/routing";

/**
 * Enlaces desde los articulos del blog hacia el catalogo.
 *
 * El cuerpo de un post es texto plano en Sanity, asi que hasta ahora un
 * articulo no podia enlazar a ningun tour: el blog se llevaba el 86% de los
 * clics de busqueda y no repartia nada. Este mapa esta curado a mano, articulo
 * por articulo, contra el catalogo real — no hay coincidencia difusa en runtime.
 *
 * Cada entrada alimenta dos superficies: el bloque de tours al pie del articulo
 * y, si trae `concept`, un enlace dentro del propio texto. Las frases de cada
 * concepto se verificaron contra los cuerpos en los tres idiomas; un concepto
 * que no aparecia en ningun idioma se dejo sin enlazar en vez de forzarlo.
 */

/** Frases que disparan un enlace en texto, por idioma. Se prueban en orden. */
const CONCEPT_PHRASES: Record<string, Record<AppLocale, readonly string[]>> = {
  "buggy": {
    en: ["buggy tour", "buggy"],
    es: ["tour en buggy", "buggy"],
    "fr-ca": ["tour en buggy", "buggy"],
  },
  "cap-cana": {
    en: ["Cap Cana"],
    es: ["Cap Cana"],
    "fr-ca": ["Cap Cana"],
  },
  "catalina": {
    en: ["Catalina Island", "Catalina"],
    es: ["Isla Catalina", "Catalina"],
    "fr-ca": ["île Catalina", "Catalina"],
  },
  "catamaran": {
    en: ["catamaran cruise", "catamaran"],
    es: ["crucero en catamarán", "catamarán"],
    "fr-ca": ["croisière en catamaran", "catamaran"],
  },
  "cenote": {
    en: ["cenote"],
    es: ["cenote"],
    "fr-ca": ["cénote", "cenote"],
  },
  "cocotal": {
    en: ["Cocotal Golf and Country Club", "Cocotal Golf & Country Club", "Cocotal"],
    es: ["Cocotal"],
    "fr-ca": ["Cocotal"],
  },
  "corales": {
    en: ["Corales Golf Course", "Corales"],
    es: ["Corales"],
    "fr-ca": ["Corales"],
  },
  "cultural": {
    en: ["cultural tours", "cultural tour", "cultural excursion"],
    es: ["tours culturales", "tour cultural", "excursión cultural"],
    "fr-ca": ["tours culturels", "tour culturel", "excursion culturelle"],
  },
  "excursions": {
    en: ["excursions"],
    es: ["excursiones"],
    "fr-ca": ["excursions"],
  },
  "fishing": {
    en: ["deep-sea fishing", "deep sea fishing", "fishing charter", "fishing"],
    es: ["pesca de altura", "pesca"],
    "fr-ca": ["pêche en haute mer", "pêche"],
  },
  "golf": {
    en: ["golf"],
    es: ["golf"],
    "fr-ca": ["golf"],
  },
  "hard-rock": {
    en: ["Hard Rock Golf Club at Cana Bay", "Hard Rock Golf Club", "Hard Rock"],
    es: ["Hard Rock"],
    "fr-ca": ["Hard Rock"],
  },
  "horseback": {
    en: ["horseback riding", "horseback"],
    es: ["paseo a caballo", "cabalgata", "a caballo"],
    "fr-ca": ["équitation", "à cheval"],
  },
  "iberostar": {
    en: ["Iberostar Bávaro Golf Club", "Iberostar Golf Club", "Iberostar"],
    es: ["Iberostar"],
    "fr-ca": ["Iberostar"],
  },
  "la-cana": {
    en: ["La Cana Golf Club", "La Cana Golf Course", "La Cana"],
    es: ["La Cana"],
    "fr-ca": ["La Cana"],
  },
  "macao": {
    en: ["Macao"],
    es: ["Macao"],
    "fr-ca": ["Macao"],
  },
  "party-boat": {
    en: ["party boat"],
    es: ["party boat", "barco de fiesta"],
    "fr-ca": ["party boat", "bateau de fête"],
  },
  "punta-espada": {
    en: ["Punta Espada Golf Club", "Punta Espada"],
    es: ["Punta Espada"],
    "fr-ca": ["Punta Espada"],
  },
  "samana": {
    en: ["Samaná", "Samana"],
    es: ["Samaná", "Samana"],
    "fr-ca": ["Samaná", "Samana"],
  },
  "santo-domingo": {
    en: ["Santo Domingo"],
    es: ["Santo Domingo"],
    "fr-ca": ["Saint-Domingue", "Santo Domingo"],
  },
  "saona": {
    en: ["Saona Island", "Saona"],
    es: ["Isla Saona", "Saona"],
    "fr-ca": ["île Saona", "Saona"],
  },
  "snorkel": {
    en: ["snorkeling", "snorkelling", "snorkel"],
    es: ["snorkel", "esnórquel", "buceo de superficie"],
    "fr-ca": ["plongée en apnée", "snorkeling", "snorkel"],
  },
  "speedboat": {
    en: ["speedboat"],
    es: ["lancha rápida", "lancha"],
    "fr-ca": ["hors-bord", "bateau rapide"],
  },
  "transfer": {
    en: ["airport transfers", "airport transfer", "private transfer", "vip transportation"],
    es: ["traslados al aeropuerto", "traslado al aeropuerto", "transporte privado", "transporte vip"],
    "fr-ca": ["transferts aéroport", "transfert aéroport", "transport privé", "transport vip"],
  },
  "yacht": {
    en: ["yacht"],
    es: ["yate", "yacht"],
    "fr-ca": ["yacht"],
  },
  "zipline": {
    en: ["zipline", "zip line", "zip-line"],
    es: ["tirolesa", "tirolina"],
    "fr-ca": ["tyrolienne"],
  },
};

export type PostLink = {
  /** Slug de tour, o ruta de listado sin prefijo de idioma. */
  tour?: string;
  listing?: string;
  /** Cuando esta, la primera aparicion de la frase en el cuerpo se enlaza. */
  concept?: string;
};

const POST_LINKS: Record<string, readonly PostLink[]> = {
  "10-best-tours-in-punta-cana-worth-booking": [
    { tour: "saona-island-classic-tour", concept: "saona" },
    { tour: "power-cruise-catamaran-snorkeling", concept: "catamaran" },
    { tour: "dune-buggy-punta-cana", concept: "buggy" },
    { tour: "dominican-culture-safari-punta-cana" },
    { tour: "catalina-island-snorkeling-punta-cana" },
  ],
  "10-family-friendly-punta-cana-activities": [
    { tour: "zipline-punta-cana", concept: "zipline" },
    { tour: "power-cruise-catamaran-snorkeling", concept: "catamaran" },
    { tour: "monkeyland-safari-punta-cana" },
    { tour: "dolphin-funtastic" },
    { tour: "saona-island-classic-tour", concept: "saona" },
  ],
  "10-solo-travel-punta-cana-tips-that-matter": [
    { tour: "power-cruise-catamaran-snorkeling", concept: "catamaran" },
    { listing: "/transfers", concept: "transfer" },
    { tour: "saona-island-classic-tour" },
    { tour: "party-boat-tour-in-punta-cana" },
  ],
  "12-best-punta-cana-family-resorts": [
    { listing: "/transfers", concept: "transfer" },
    { tour: "dolphin-funtastic" },
    { tour: "monkeyland-safari-punta-cana" },
    { tour: "saona-island-classic-tour" },
  ],
  "7-tourist-traps-in-punta-cana-that-waste-your-money": [
    { tour: "saona-island-classic-tour" },
    { tour: "catalina-island-snorkeling-punta-cana" },
    { tour: "private-catamaran-bavaro-coast-punta-cana" },
  ],
  "8-romantic-punta-cana-experiences-to-book": [
    { tour: "private-catamaran-bavaro-coast-punta-cana", concept: "catamaran" },
    { tour: "private-luxury-yacht-experience-punta-cana", concept: "yacht" },
    { tour: "vip-brunch-private-boat-tour-punta-cana" },
    { tour: "swim-with-horses-in-punta-cana", concept: "horseback" },
    { tour: "private-infinity-catamaran-punta-cana" },
  ],
  "9-best-golf-courses-in-punta-cana-2": [
    { tour: "punta-espada-golf-club", concept: "punta-espada" },
    { tour: "corales-golf-course", concept: "corales" },
    { tour: "la-cana-golf-course", concept: "la-cana" },
    { tour: "cocotal-golf-country-club", concept: "cocotal" },
    { tour: "hard-rock-golf-club-at-cana-bay", concept: "hard-rock" },
    { tour: "iberostar-golf-club-bavaro", concept: "iberostar" },
    { tour: "punta-blanca-golf-country-club" },
    { tour: "the-lakes-barcelo-bavaro-golf-course" },
    { tour: "vista-cana-golf-club" },
  ],
  "are-catamaran-tours-worth-it-the-honest-answer": [
    { tour: "power-cruise-catamaran-snorkeling", concept: "catamaran" },
    { tour: "private-catamaran-bavaro-coast-punta-cana" },
    { tour: "cap-cana-adventure-park-juanillo-vip" },
    { tour: "party-boat-tour-in-punta-cana" },
  ],
  "best-all-inclusive-resorts-punta-cana-deals": [
    { listing: "/transfers", concept: "transfer" },
    { listing: "/excursions/categoria/golf-tours", concept: "golf" },
    { tour: "escape-to-caribbean-package" },
    { tour: "saona-island-classic-tour" },
  ],
  "catalina-island-snorkeling-trip-what-to-expect": [
    { tour: "catalina-island-snorkeling-punta-cana", concept: "catalina" },
    { tour: "catalina-island-vip-punta-cana" },
    { tour: "catalina-island-and-altos-de-chavon" },
    { tour: "power-diving-snorkeling-in-punta-cana", concept: "snorkel" },
  ],
  "catamaran-cruise-vs-speedboat-excursion": [
    { tour: "power-cruise-catamaran-snorkeling", concept: "catamaran" },
    { tour: "private-express-cruise-punta-cana", concept: "speedboat" },
    { tour: "sunshine-cruise-standalone" },
    { tour: "party-boat-tour-in-punta-cana" },
  ],
  "custom-punta-cana-vacation-packages-that-fit": [
    { tour: "power-cruise-catamaran-snorkeling", concept: "catamaran" },
    { tour: "escape-to-caribbean-package" },
    { tour: "stairway-to-heaven" },
    { tour: "golf-escape-package", concept: "golf" },
  ],
  "do-i-need-airport-transfer-for-my-trip": [
    { listing: "/transfers", concept: "transfer" },
  ],
  "dominican-republic-cultural-tours-worth-taking": [
    { tour: "dominican-culture-safari-punta-cana", concept: "cultural" },
    { tour: "santo-domingo-city-tour", concept: "santo-domingo" },
    { tour: "catalina-island-and-altos-de-chavon" },
    { tour: "los-haitises-national-park-montana-redonda" },
  ],
  "dominican-republic-island-hopping-what-works": [
    { tour: "saona-island-classic-tour", concept: "saona" },
    { tour: "catalina-island-snorkeling-punta-cana", concept: "catalina" },
    { tour: "samana-waterfall-el-limon-bacardi-island-punta-cana", concept: "samana" },
    { tour: "cap-cana-adventure-park-juanillo-vip" },
  ],
  "dominican-republic-resort-transfer-review": [
    { listing: "/transfers", concept: "transfer" },
  ],
  "group-tours-vs-private-tours-which-fits": [
    { tour: "private-catamaran-bavaro-coast-punta-cana", concept: "catamaran" },
    { tour: "saona-island-classic-tour" },
    { tour: "private-express-cruise-punta-cana" },
    { tour: "power-cruise-catamaran-snorkeling" },
  ],
  "horseback-riding-punta-cana-what-to-know": [
    { tour: "swim-with-horses-in-punta-cana", concept: "horseback" },
    { tour: "montana-redonda-punta-cana" },
    { tour: "dominican-culture-safari-punta-cana" },
  ],
  "how-adventures-finder-simplifies-your-trip": [
    { listing: "/transfers", concept: "transfer" },
    { listing: "/excursions", concept: "excursions" },
    { tour: "saona-island-classic-tour" },
    { tour: "power-cruise-catamaran-snorkeling" },
  ],
  "how-much-a-real-day-in-punta-cana-actually-costs": [
    { listing: "/excursions", concept: "excursions" },
    { tour: "party-boat-tour-in-punta-cana" },
    { tour: "power-cruise-catamaran-snorkeling" },
    { tour: "saona-island-classic-tour" },
    { tour: "private-catamaran-bavaro-coast-punta-cana" },
  ],
  "how-to-book-dominican-excursions-right": [
    { tour: "power-cruise-catamaran-snorkeling", concept: "catamaran" },
    { tour: "dune-buggy-punta-cana", concept: "buggy" },
    { tour: "saona-island-classic-tour" },
    { tour: "dominican-culture-safari-punta-cana", concept: "cultural" },
  ],
  "how-to-choose-a-punta-cana-dmc": [
    { listing: "/transfers", concept: "transfer" },
    { listing: "/excursions/categoria/golf-tours", concept: "golf" },
    { tour: "saona-island-classic-tour" },
    { tour: "private-catamaran-bavaro-coast-punta-cana" },
  ],
  "luxury-tours-punta-cana-that-feel-worth-it": [
    { tour: "private-luxury-yacht-experience-punta-cana", concept: "yacht" },
    { tour: "private-catamaran-bavaro-coast-punta-cana", concept: "catamaran" },
    { tour: "saona-island-vip-a-tropical-escape-to-remember" },
    { tour: "helicopter-tour-punta-cana-bavaro-cap-cana" },
    { tour: "golf-escape-package", concept: "golf" },
  ],
  "luxury-travel-trends-punta-cana-guests-want": [
    { tour: "private-catamaran-bavaro-coast-punta-cana", concept: "catamaran" },
    { tour: "private-luxury-yacht-experience-punta-cana", concept: "yacht" },
    { tour: "vip-brunch-private-boat-tour-punta-cana" },
    { tour: "helicopter-tour-punta-cana-bavaro-cap-cana" },
  ],
  "private-excursions-punta-cana-worth-booking": [
    { tour: "private-catamaran-bavaro-coast-punta-cana", concept: "catamaran" },
    { tour: "private-express-cruise-punta-cana" },
    { tour: "private-infinity-catamaran-punta-cana" },
    { tour: "private-tour-higuey-montana-redonda-punta-cana" },
  ],
  "private-punta-cana-tours-worth-booking": [
    { tour: "private-catamaran-bavaro-coast-punta-cana", concept: "catamaran" },
    { tour: "private-luxury-yacht-experience-punta-cana" },
    { tour: "private-deep-sea-fishing-punta-cana" },
    { tour: "montana-redonda-punta-cana" },
  ],
  "private-vs-shared-tours-in-punta-cana-what-s-really-worth-it": [
    { tour: "party-boat-tour-in-punta-cana", concept: "party-boat" },
    { tour: "private-catamaran-bavaro-coast-punta-cana" },
    { tour: "power-cruise-catamaran-snorkeling" },
    { tour: "private-express-cruise-punta-cana" },
  ],
  "punta-cana-airport-transfers-done-right": [
    { listing: "/transfers", concept: "transfer" },
  ],
  "punta-cana-beach-club-experiences-that-fit-you": [
    { tour: "cap-cana-adventure-park-juanillo-vip", concept: "cap-cana" },
    { tour: "cap-cana-adventure-park" },
    { tour: "sunshine-cruise-standalone" },
    { tour: "party-boat-tour-in-punta-cana" },
  ],
  "punta-cana-beyond-resorts-what-life-outside-the-gates-really-looks-like": [
    { tour: "dominican-culture-safari-punta-cana" },
    { tour: "santo-domingo-city-tour" },
    { tour: "montana-redonda-punta-cana" },
  ],
  "punta-cana-buggy-adventure-what-to-expect": [
    { tour: "dune-buggy-punta-cana", concept: "buggy" },
    { tour: "macao-beach-buggy-punta-cana", concept: "macao" },
    { tour: "evening-buggy-tour-punta-cana" },
    { tour: "buggy-monkeyland-combo-punta-cana" },
    { tour: "honda-beach-buggy-adventure" },
  ],
  "punta-cana-catamaran-cruise-what-to-expect": [
    { tour: "power-cruise-catamaran-snorkeling", concept: "catamaran" },
    { tour: "private-catamaran-bavaro-coast-punta-cana" },
    { tour: "cap-cana-adventure-park-juanillo-vip" },
    { tour: "party-boat-tour-in-punta-cana" },
    { tour: "parasailing-punta-cana" },
  ],
  "punta-cana-corporate-retreat-planning-tips": [
    { tour: "private-catamaran-bavaro-coast-punta-cana", concept: "catamaran" },
    { listing: "/excursions/categoria/golf-tours", concept: "golf" },
    { tour: "dominican-culture-safari-punta-cana", concept: "cultural" },
    { tour: "coco-bongo-punta-cana" },
  ],
  "punta-cana-excursion-planning-guide": [
    { tour: "saona-island-classic-tour", concept: "saona" },
    { tour: "power-cruise-catamaran-snorkeling", concept: "catamaran" },
    { tour: "catalina-island-snorkeling-punta-cana" },
    { tour: "dune-buggy-punta-cana", concept: "buggy" },
  ],
  "punta-cana-for-families-couples-and-friends-what-works-and-what-doesn-t": [
    { tour: "deep-sea-fishing-share", concept: "fishing" },
    { tour: "monkeyland-safari-punta-cana" },
    { tour: "private-catamaran-bavaro-coast-punta-cana" },
    { tour: "saona-island-classic-tour" },
  ],
  "punta-cana-golf-packages-that-fit-your-trip": [
    { tour: "golf-escape-package", concept: "golf" },
    { tour: "paradise-swing-unforgettable-golf-in-punta-cana" },
    { tour: "punta-espada-golf-club" },
    { tour: "corales-golf-course" },
    { tour: "la-cana-golf-course" },
  ],
  "punta-cana-neighborhoods-explained-where-to-stay-rent-or-relocate": [
    { tour: "cap-cana-adventure-park-juanillo-vip", concept: "cap-cana" },
    { tour: "macao-beach-buggy-punta-cana", concept: "macao" },
    { tour: "dominican-culture-safari-punta-cana" },
  ],
  "punta-cana-travel-trends-2026-to-watch": [
    { tour: "private-catamaran-bavaro-coast-punta-cana", concept: "catamaran" },
    { tour: "helicopter-tour-punta-cana-bavaro-cap-cana" },
    { tour: "saona-island-vip-a-tropical-escape-to-remember" },
    { tour: "cenote-punta-cana-los-ojos-indigenas" },
  ],
  "resort-booking-vs-travel-planner-which-fits": [
    { listing: "/transfers", concept: "transfer" },
    { listing: "/excursions/categoria/golf-tours", concept: "golf" },
    { tour: "saona-island-classic-tour" },
    { tour: "power-cruise-catamaran-snorkeling" },
  ],
  "samana-beyond-instagram-the-side-of-paradise-most-tourists-never-see": [
    { tour: "samana-full-day-tour-punta-cana", concept: "samana" },
    { tour: "samana-waterfall-el-limon-bacardi-island-punta-cana" },
    { tour: "echoes-of-the-soul-package" },
    { tour: "los-haitises-national-park-montana-redonda" },
  ],
  "santo-domingo-day-trip-from-punta-cana": [
    { tour: "santo-domingo-city-tour", concept: "santo-domingo" },
    { tour: "catalina-island-and-altos-de-chavon" },
    { tour: "dominican-culture-safari-punta-cana", concept: "cultural" },
  ],
  "saona-island-tour-from-punta-cana-what-to-expect": [
    { tour: "saona-island-classic-tour", concept: "saona" },
    { tour: "saona-island-vip-a-tropical-escape-to-remember" },
    { tour: "saona-island-monkeyland-combo" },
    { tour: "catalina-island-snorkeling-punta-cana" },
  ],
  "sea-turtles-in-the-dominican-republic-when-where-and-how-to-see-them-responsibly": [
    { tour: "catalina-island-snorkeling-punta-cana" },
    { tour: "power-diving-snorkeling-in-punta-cana" },
    { tour: "eco-tour-punta-cana" },
    { tour: "los-haitises-national-park-montana-redonda" },
  ],
  "the-best-excursions-in-punta-cana-ranked-by-experience-not-price": [
    { tour: "catalina-island-snorkeling-punta-cana", concept: "snorkel" },
    { tour: "dominican-culture-safari-punta-cana", concept: "cultural" },
    { tour: "saona-island-classic-tour" },
    { tour: "eco-tour-punta-cana" },
  ],
  "vip-transportation-punta-cana-what-to-expect": [
    { listing: "/transfers", concept: "transfer" },
  ],
  "what-to-do-in-punta-cana-11-best-ideas": [
    { tour: "power-cruise-catamaran-snorkeling", concept: "catamaran" },
    { tour: "cenote-punta-cana-los-ojos-indigenas", concept: "cenote" },
    { tour: "zipline-punta-cana", concept: "zipline" },
    { tour: "saona-island-classic-tour" },
    { tour: "coco-bongo-punta-cana" },
  ],
  "what-you-should-know-before-booking-excursions-in-punta-cana": [
    { listing: "/excursions", concept: "excursions" },
    { tour: "saona-island-classic-tour" },
    { tour: "power-cruise-catamaran-snorkeling" },
    { tour: "catalina-island-snorkeling-punta-cana" },
  ],
  "when-not-to-visit-punta-cana-costly-mistakes-tourists-make-and-the-best-months-instead": [
    { listing: "/excursions", concept: "excursions" },
    { tour: "saona-island-classic-tour" },
    { tour: "power-cruise-catamaran-snorkeling" },
    { tour: "catalina-island-snorkeling-punta-cana" },
    { tour: "dune-buggy-punta-cana" },
  ],
};

export function postLinks(slug: string): readonly PostLink[] {
  return POST_LINKS[slug] ?? [];
}

export function conceptPhrases(concept: string, locale: AppLocale): readonly string[] {
  return CONCEPT_PHRASES[concept]?.[locale] ?? [];
}
