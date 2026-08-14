import type { AppLocale } from "@/i18n/routing";

export type ListingIntro = {
  /** Short lead paragraph shown under the hero. */
  intro: string;
  /** Secondary paragraph with practical detail (season, logistics, who it suits). */
  detail: string;
  /** Page-specific questions, also emitted as FAQPage structured data. */
  faqs: Array<{ question: string; answer: string }>;
};

type LocalizedIntro = Record<AppLocale, ListingIntro>;

/* -------------------------------------------------------------------------- */
/*  Categories                                                                 */
/* -------------------------------------------------------------------------- */

const CATEGORY_INTRO: Record<string, LocalizedIntro> = {
  "water-tours": {
    en: {
      intro:
        "Punta Cana's water tours run on the calm Caribbean side of the island, where the reef keeps the sea flat most of the year. Catamarans and speedboats leave from Bávaro and Cap Cana toward the natural pool, the snorkelling reefs off Cabeza de Toro, and the beaches of Saona and Catalina.",
      detail:
        "Most departures are in the morning, when the water is clearest and the wind is lowest, and run four to eight hours with hotel pickup included. Snorkelling gear, guides and drinks are part of nearly every trip; bring reef-safe sunscreen, a towel and a dry bag for your phone.",
      faqs: [
        {
          question: "Do I need to know how to swim for a water tour in Punta Cana?",
          answer:
            "Not for most of them. Life jackets are provided on every boat and the natural pool is waist to chest deep. For open-water snorkelling stops, being comfortable floating with a vest is enough — the guides stay in the water with the group.",
        },
        {
          question: "What is the best time of year for boat tours in Punta Cana?",
          answer:
            "December to April has the calmest seas and the least rain. Tours run year-round, but between August and October a passing tropical system can cancel a departure; in that case we reschedule or refund according to our cancellation policy.",
        },
        {
          question: "Is hotel pickup included in water tours?",
          answer:
            "Yes. Transport from your hotel in Punta Cana, Bávaro, Uvero Alto or Cap Cana is included. If you are staying in a private condo, send us the exact address after booking and we will confirm the nearest pickup point.",
        },
      ],
    },
    es: {
      intro:
        "Los tours acuáticos de Punta Cana salen por el lado caribeño de la isla, donde la barrera de coral mantiene el mar en calma casi todo el año. Catamaranes y lanchas parten desde Bávaro y Cap Cana hacia la piscina natural, los arrecifes de snorkel de Cabeza de Toro y las playas de Saona y Catalina.",
      detail:
        "La mayoría de las salidas son por la mañana, cuando el agua está más clara y hay menos viento, y duran entre cuatro y ocho horas con recogida en el hotel incluida. El equipo de snorkel, los guías y las bebidas van incluidos en casi todas; lleva protector solar respetuoso con el arrecife, toalla y una bolsa estanca para el móvil.",
      faqs: [
        {
          question: "¿Hay que saber nadar para hacer un tour acuático en Punta Cana?",
          answer:
            "En la mayoría no. Todos los barcos llevan chalecos salvavidas y la piscina natural cubre hasta la cintura o el pecho. Para las paradas de snorkel en mar abierto basta con estar cómodo flotando con chaleco: los guías se meten al agua con el grupo.",
        },
        {
          question: "¿Cuál es la mejor época del año para los tours en barco?",
          answer:
            "De diciembre a abril el mar está más tranquilo y llueve menos. Los tours operan todo el año, pero entre agosto y octubre un sistema tropical puede cancelar una salida; en ese caso se reprograma o se reembolsa según nuestra política de cancelación.",
        },
        {
          question: "¿La recogida en el hotel está incluida?",
          answer:
            "Sí. El transporte desde tu hotel en Punta Cana, Bávaro, Uvero Alto o Cap Cana está incluido. Si te alojas en un condominio privado, envíanos la dirección exacta tras reservar y te confirmamos el punto de recogida más cercano.",
        },
      ],
    },
    "fr-ca": {
      intro:
        "Les excursions nautiques de Punta Cana partent du côté caribéen de l'île, où la barrière de corail garde la mer calme presque toute l'année. Catamarans et bateaux rapides quittent Bávaro et Cap Cana vers la piscine naturelle, les récifs de plongée en apnée de Cabeza de Toro et les plages de Saona et Catalina.",
      detail:
        "La plupart des départs ont lieu le matin, quand l'eau est la plus claire et le vent le plus faible, et durent de quatre à huit heures, prise en charge à l'hôtel incluse. L'équipement de plongée en apnée, les guides et les boissons sont compris dans presque toutes; apportez une crème solaire sans danger pour les récifs, une serviette et un sac étanche pour votre téléphone.",
      faqs: [
        {
          question: "Faut-il savoir nager pour une excursion nautique à Punta Cana?",
          answer:
            "Pas pour la plupart. Des gilets de sauvetage sont fournis sur chaque bateau et la piscine naturelle arrive à la taille ou à la poitrine. Pour les arrêts en mer ouverte, il suffit d'être à l'aise en flottant avec un gilet : les guides restent dans l'eau avec le groupe.",
        },
        {
          question: "Quelle est la meilleure période pour les excursions en bateau?",
          answer:
            "De décembre à avril, la mer est la plus calme et il pleut moins. Les excursions ont lieu toute l'année, mais entre août et octobre un système tropical peut annuler un départ; dans ce cas, nous reportons ou remboursons selon notre politique d'annulation.",
        },
        {
          question: "La prise en charge à l'hôtel est-elle incluse?",
          answer:
            "Oui. Le transport depuis votre hôtel à Punta Cana, Bávaro, Uvero Alto ou Cap Cana est inclus. Si vous logez dans un condo privé, envoyez-nous l'adresse exacte après la réservation et nous confirmerons le point de prise en charge le plus proche.",
        },
      ],
    },
  },

  "land-tours": {
    en: {
      intro:
        "Inland from the resorts, the east of the Dominican Republic is sugar cane, cacao farms, caves and red-dirt tracks. Land tours in Punta Cana cover buggy and ATV rides to Macao beach, horseback riding, zip lines, and cultural stops at local ranches and cigar workshops.",
      detail:
        "These are the driest and dustiest tours we run, so wear closed shoes and clothes you don't mind ruining — the red dust of the buggy trails does not wash out easily. Half-day departures leave morning and afternoon, and most have no swimming involved, which makes them a good pick for non-swimmers and families.",
      faqs: [
        {
          question: "Do I need a driving licence for a buggy tour?",
          answer:
            "To drive your own buggy, yes — bring a valid licence. Passengers do not need one, and couples or families often share a buggy so one person drives and the rest ride along.",
        },
        {
          question: "Are land tours suitable for children?",
          answer:
            "Most are. Children usually ride as passengers rather than drivers, and minimum ages vary by activity. Check the age requirement on each tour page before booking.",
        },
        {
          question: "What should I bring on a land tour?",
          answer:
            "Closed shoes, sunglasses, sunscreen and clothes you don't mind getting dusty or muddy. Bandanas and goggles are provided on buggy tours. Leave valuables at the hotel.",
        },
      ],
    },
    es: {
      intro:
        "Tierra adentro, más allá de los resorts, el este de República Dominicana es caña de azúcar, fincas de cacao, cuevas y caminos de tierra roja. Los tours terrestres en Punta Cana incluyen rutas en buggy y cuatriciclo hasta la playa de Macao, paseos a caballo, tirolinas y paradas culturales en ranchos locales y talleres de tabaco.",
      detail:
        "Son los tours más secos y polvorientos que operamos: usa zapatos cerrados y ropa que no te importe estropear, porque el polvo rojo de los senderos no sale fácil. Hay salidas de medio día por la mañana y por la tarde, y en su mayoría no implican nadar, lo que los hace ideales para quienes no nadan y para familias.",
      faqs: [
        {
          question: "¿Necesito licencia de conducir para un tour en buggy?",
          answer:
            "Para conducir tu propio buggy, sí: trae una licencia válida. Los acompañantes no la necesitan, y es común que parejas o familias compartan buggy para que conduzca una sola persona.",
        },
        {
          question: "¿Los tours terrestres son aptos para niños?",
          answer:
            "La mayoría sí. Los niños suelen ir como acompañantes y no como conductores, y la edad mínima varía según la actividad. Revisa el requisito de edad en la página de cada tour antes de reservar.",
        },
        {
          question: "¿Qué debo llevar a un tour terrestre?",
          answer:
            "Zapatos cerrados, gafas de sol, protector solar y ropa que no te importe manchar de polvo o barro. En los tours de buggy se entregan pañuelo y gafas protectoras. Deja los objetos de valor en el hotel.",
        },
      ],
    },
    "fr-ca": {
      intro:
        "À l'intérieur des terres, l'est de la République dominicaine, c'est la canne à sucre, les fermes de cacao, les grottes et les pistes de terre rouge. Les excursions terrestres à Punta Cana comprennent le buggy et le VTT jusqu'à la plage de Macao, l'équitation, les tyroliennes et des arrêts culturels dans des ranchs et des ateliers de cigares.",
      detail:
        "Ce sont nos excursions les plus sèches et les plus poussiéreuses : portez des chaussures fermées et des vêtements que vous ne craignez pas d'abîmer, car la poussière rouge des sentiers part difficilement. Les départs d'une demi-journée ont lieu matin et après-midi, et la plupart n'impliquent pas de nager, ce qui convient bien aux non-nageurs et aux familles.",
      faqs: [
        {
          question: "Faut-il un permis de conduire pour une excursion en buggy?",
          answer:
            "Pour conduire votre propre buggy, oui : apportez un permis valide. Les passagers n'en ont pas besoin, et les couples ou familles partagent souvent un buggy.",
        },
        {
          question: "Les excursions terrestres conviennent-elles aux enfants?",
          answer:
            "La plupart, oui. Les enfants sont généralement passagers plutôt que conducteurs, et l'âge minimal varie selon l'activité. Vérifiez l'exigence d'âge sur la page de chaque excursion.",
        },
        {
          question: "Que dois-je apporter?",
          answer:
            "Chaussures fermées, lunettes de soleil, crème solaire et vêtements que vous ne craignez pas de salir. Bandana et lunettes de protection sont fournis pour le buggy. Laissez les objets de valeur à l'hôtel.",
        },
      ],
    },
  },

  "combo-tours": {
    en: {
      intro:
        "Combo tours pair two experiences in a single day with one pickup and one price — typically a land activity in the morning and water in the afternoon, or a beach day paired with a cultural stop.",
      detail:
        "They are the most efficient way to see more of the east coast if your stay is short, and they work out cheaper than booking each activity separately. Days run long, usually eight to ten hours door to door, so they suit travellers who would rather fill one day completely than spread activities across several.",
      faqs: [
        {
          question: "How long does a combo tour last?",
          answer:
            "Most combos run eight to ten hours from hotel pickup to drop-off, including transfers between the two activities and lunch.",
        },
        {
          question: "Is lunch included in combo tours?",
          answer:
            "In most of them, yes, along with drinks during the day. The tour page for each combo lists exactly what is included.",
        },
        {
          question: "Can I book the two activities on separate days instead?",
          answer:
            "Yes — each activity is also sold on its own. The combo is priced lower than the two separate tours, so book separately only if you prefer a lighter schedule.",
        },
      ],
    },
    es: {
      intro:
        "Los tours combinados unen dos experiencias en un mismo día con una sola recogida y un solo precio: normalmente una actividad terrestre por la mañana y una acuática por la tarde, o un día de playa con una parada cultural.",
      detail:
        "Son la forma más eficiente de conocer más de la costa este si tu estancia es corta, y salen más económicos que reservar cada actividad por separado. Son jornadas largas, de ocho a diez horas de puerta a puerta, así que encajan mejor con quien prefiere llenar un día completo antes que repartir actividades en varios.",
      faqs: [
        {
          question: "¿Cuánto dura un tour combinado?",
          answer:
            "La mayoría dura entre ocho y diez horas desde la recogida en el hotel hasta el regreso, incluidos los traslados entre las dos actividades y el almuerzo.",
        },
        {
          question: "¿El almuerzo está incluido?",
          answer:
            "En la mayoría sí, junto con las bebidas del día. La página de cada combo detalla exactamente qué incluye.",
        },
        {
          question: "¿Puedo reservar las dos actividades en días distintos?",
          answer:
            "Sí, cada actividad se vende también por separado. El combo tiene un precio menor que los dos tours sueltos, así que resérvalos aparte solo si prefieres una agenda más ligera.",
        },
      ],
    },
    "fr-ca": {
      intro:
        "Les excursions combinées réunissent deux expériences dans une même journée, avec une seule prise en charge et un seul prix : en général une activité terrestre le matin et une activité nautique l'après-midi, ou une journée de plage avec un arrêt culturel.",
      detail:
        "C'est la façon la plus efficace de voir davantage de la côte est si votre séjour est court, et cela revient moins cher que de réserver chaque activité séparément. Les journées sont longues, de huit à dix heures porte à porte, et conviennent à ceux qui préfèrent remplir une journée complète.",
      faqs: [
        {
          question: "Combien de temps dure une excursion combinée?",
          answer:
            "La plupart durent de huit à dix heures, de la prise en charge au retour, incluant les transferts entre les deux activités et le dîner.",
        },
        {
          question: "Le repas est-il inclus?",
          answer:
            "Dans la plupart, oui, ainsi que les boissons de la journée. La page de chaque combiné précise ce qui est inclus.",
        },
        {
          question: "Puis-je réserver les deux activités des jours différents?",
          answer:
            "Oui, chaque activité se vend aussi séparément. Le combiné coûte moins cher que les deux excursions prises à part.",
        },
      ],
    },
  },

  "private-tours": {
    en: {
      intro:
        "Private tours run with your group only: your own vehicle, your own guide, and a schedule you set. No other travellers, no waiting for a full bus, and pickup at the time that suits you.",
      detail:
        "They cost more per person than a shared departure but make sense for families with small children, travellers with limited mobility, photographers who need time at each stop, and anyone celebrating something. Itineraries can be adjusted before or during the day — tell us what matters and we build the route around it.",
      faqs: [
        {
          question: "How much does a private tour cost in Punta Cana?",
          answer:
            "It depends on the itinerary, the vehicle and the size of your group, since the price is per group rather than per person. Write to reservations@adventuresfinder.com with your dates and group size for a quote.",
        },
        {
          question: "Can I customise the itinerary?",
          answer:
            "Yes, that is the point of a private tour. You can change the order of stops, add or remove them, and adjust the pace and the pickup time.",
        },
        {
          question: "What is the maximum group size?",
          answer:
            "It depends on the vehicle: sedans for couples, SUVs and vans for families, and buses for larger groups. Tell us how many you are and we assign the right vehicle.",
        },
      ],
    },
    es: {
      intro:
        "Los tours privados se realizan solo con tu grupo: vehículo propio, guía propio y un horario que decides tú. Sin otros viajeros, sin esperar a que se llene un autobús y con recogida a la hora que te convenga.",
      detail:
        "Cuestan más por persona que una salida compartida, pero tienen todo el sentido para familias con niños pequeños, viajeros con movilidad reducida, fotógrafos que necesitan tiempo en cada parada y para quien celebra algo especial. El itinerario se puede ajustar antes o durante el día: dinos qué te importa y construimos la ruta alrededor de eso.",
      faqs: [
        {
          question: "¿Cuánto cuesta un tour privado en Punta Cana?",
          answer:
            "Depende del itinerario, el vehículo y el tamaño del grupo, porque el precio es por grupo y no por persona. Escríbenos a reservations@adventuresfinder.com con tus fechas y número de personas y te enviamos una cotización.",
        },
        {
          question: "¿Puedo personalizar el itinerario?",
          answer:
            "Sí, esa es justamente la ventaja de un tour privado. Puedes cambiar el orden de las paradas, añadirlas o quitarlas, y ajustar el ritmo y la hora de recogida.",
        },
        {
          question: "¿Cuál es el tamaño máximo del grupo?",
          answer:
            "Depende del vehículo: sedán para parejas, SUV y van para familias, y autobús para grupos grandes. Dinos cuántos son y asignamos el vehículo adecuado.",
        },
      ],
    },
    "fr-ca": {
      intro:
        "Les excursions privées se déroulent uniquement avec votre groupe : votre véhicule, votre guide et un horaire que vous choisissez. Aucun autre voyageur, aucune attente et une prise en charge à l'heure qui vous convient.",
      detail:
        "Elles coûtent plus cher par personne qu'un départ partagé, mais conviennent parfaitement aux familles avec de jeunes enfants, aux voyageurs à mobilité réduite, aux photographes et à ceux qui célèbrent une occasion spéciale. L'itinéraire peut être ajusté avant ou pendant la journée.",
      faqs: [
        {
          question: "Combien coûte une excursion privée à Punta Cana?",
          answer:
            "Cela dépend de l'itinéraire, du véhicule et de la taille du groupe, car le prix est par groupe et non par personne. Écrivez-nous à reservations@adventuresfinder.com pour une soumission.",
        },
        {
          question: "Puis-je personnaliser l'itinéraire?",
          answer:
            "Oui, c'est tout l'intérêt d'une excursion privée. Vous pouvez modifier l'ordre des arrêts, en ajouter ou en retirer, et ajuster le rythme.",
        },
        {
          question: "Quelle est la taille maximale du groupe?",
          answer:
            "Cela dépend du véhicule : berline pour les couples, VUS et fourgonnette pour les familles, autobus pour les grands groupes.",
        },
      ],
    },
  },

  "golf-tours": {
    en: {
      intro:
        "The east coast holds some of the best-known courses in the Caribbean, several of them designed along the cliffs and the shoreline. Our golf packages cover tee times, transfers from your hotel and, where needed, club rental.",
      detail:
        "Morning tee times are the norm — the wind picks up after midday and the heat is heaviest in the afternoon. Book ahead in high season, from December to April, when the courses closest to Punta Cana and Cap Cana fill up weeks in advance.",
      faqs: [
        {
          question: "Are transfers to the golf course included?",
          answer:
            "Yes, round-trip transport from your hotel is included, timed to your tee time.",
        },
        {
          question: "Can I rent clubs?",
          answer:
            "Yes. Club rental can be added to your booking; tell us whether you need right or left-handed clubs when you reserve.",
        },
        {
          question: "How far in advance should I book a tee time?",
          answer:
            "In high season, two to three weeks ahead. Outside those months, a few days is usually enough.",
        },
      ],
    },
    es: {
      intro:
        "La costa este alberga algunos de los campos más conocidos del Caribe, varios de ellos diseñados junto a los acantilados y la línea de costa. Nuestros paquetes de golf incluyen la hora de salida, los traslados desde tu hotel y, si lo necesitas, el alquiler de palos.",
      detail:
        "Lo habitual son las salidas de la mañana: el viento aprieta pasado el mediodía y el calor es más fuerte por la tarde. Reserva con antelación en temporada alta, de diciembre a abril, cuando los campos más cercanos a Punta Cana y Cap Cana se llenan con semanas de margen.",
      faqs: [
        {
          question: "¿Los traslados al campo están incluidos?",
          answer:
            "Sí, el transporte de ida y vuelta desde tu hotel está incluido y se ajusta a tu hora de salida.",
        },
        {
          question: "¿Puedo alquilar palos?",
          answer:
            "Sí. El alquiler de palos se puede añadir a la reserva; indícanos si los necesitas para diestro o zurdo al reservar.",
        },
        {
          question: "¿Con cuánta antelación debo reservar?",
          answer:
            "En temporada alta, de dos a tres semanas. Fuera de esos meses, unos pocos días suelen bastar.",
        },
      ],
    },
    "fr-ca": {
      intro:
        "La côte est abrite certains des parcours les plus réputés des Caraïbes, plusieurs dessinés le long des falaises et du littoral. Nos forfaits de golf comprennent l'heure de départ, les transferts depuis votre hôtel et, au besoin, la location de bâtons.",
      detail:
        "Les départs du matin sont la norme : le vent se lève après midi et la chaleur est plus forte l'après-midi. Réservez à l'avance en haute saison, de décembre à avril, quand les parcours près de Punta Cana et Cap Cana affichent complet des semaines d'avance.",
      faqs: [
        {
          question: "Les transferts au parcours sont-ils inclus?",
          answer: "Oui, le transport aller-retour depuis votre hôtel est inclus et ajusté à votre heure de départ.",
        },
        {
          question: "Puis-je louer des bâtons?",
          answer:
            "Oui. La location peut être ajoutée à votre réservation; précisez si vous jouez droitier ou gaucher.",
        },
        {
          question: "Combien de temps à l'avance faut-il réserver?",
          answer: "En haute saison, deux à trois semaines. Hors saison, quelques jours suffisent.",
        },
      ],
    },
  },

  packages: {
    en: {
      intro:
        "Packages bundle several days of activities into one booking, with transfers and scheduling handled for you. They are built for travellers who want their week planned before they land.",
      detail:
        "A typical package spreads activities across your stay so no two heavy days run back to back, and leaves beach time in between. Tell us your arrival and departure dates and how active you want the week to be, and we adjust the mix.",
      faqs: [
        {
          question: "Do packages include accommodation?",
          answer:
            "Our packages cover activities and ground transport. If you also need a hotel, write to reservations@adventuresfinder.com and we will quote it with our partner hotels.",
        },
        {
          question: "Can a package be adjusted after booking?",
          answer:
            "Yes, within availability. Changes are easiest more than 48 hours before the affected activity.",
        },
        {
          question: "Are airport transfers part of the package?",
          answer:
            "They can be added. Send us your flight numbers and arrival times and we will include the airport pickup and drop-off.",
        },
      ],
    },
    es: {
      intro:
        "Los paquetes agrupan varios días de actividades en una sola reserva, con los traslados y la organización ya resueltos. Están pensados para quien quiere su semana planificada antes de aterrizar.",
      detail:
        "Un paquete típico reparte las actividades a lo largo de la estancia para que no coincidan dos días exigentes seguidos, y deja tiempo de playa entre medias. Dinos tus fechas de llegada y salida y cuánta actividad quieres, y ajustamos la combinación.",
      faqs: [
        {
          question: "¿Los paquetes incluyen alojamiento?",
          answer:
            "Nuestros paquetes cubren actividades y transporte terrestre. Si también necesitas hotel, escríbenos a reservations@adventuresfinder.com y te lo cotizamos con nuestros hoteles asociados.",
        },
        {
          question: "¿Se puede modificar un paquete después de reservar?",
          answer:
            "Sí, según disponibilidad. Los cambios son más sencillos con más de 48 horas de antelación respecto a la actividad afectada.",
        },
        {
          question: "¿Los traslados al aeropuerto están incluidos?",
          answer:
            "Se pueden añadir. Envíanos los números de vuelo y las horas de llegada e incluimos la recogida y el regreso al aeropuerto.",
        },
      ],
    },
    "fr-ca": {
      intro:
        "Les forfaits regroupent plusieurs jours d'activités en une seule réservation, transferts et organisation compris. Ils s'adressent aux voyageurs qui veulent leur semaine planifiée avant d'atterrir.",
      detail:
        "Un forfait type répartit les activités sur le séjour pour éviter deux journées exigeantes de suite, et laisse du temps de plage entre les deux. Donnez-nous vos dates d'arrivée et de départ et le rythme souhaité, et nous ajustons le tout.",
      faqs: [
        {
          question: "Les forfaits incluent-ils l'hébergement?",
          answer:
            "Nos forfaits couvrent les activités et le transport terrestre. Si vous avez aussi besoin d'un hôtel, écrivez à reservations@adventuresfinder.com.",
        },
        {
          question: "Un forfait peut-il être modifié après la réservation?",
          answer:
            "Oui, selon les disponibilités. Les changements sont plus simples plus de 48 heures avant l'activité concernée.",
        },
        {
          question: "Les transferts aéroport sont-ils inclus?",
          answer:
            "Ils peuvent être ajoutés. Envoyez-nous vos numéros de vol et heures d'arrivée.",
        },
      ],
    },
  },

  "multidays-tours": {
    en: {
      intro:
        "Multi-day tours leave the east coast behind and reach the parts of the Dominican Republic that don't fit into a day trip: the whale bay and waterfalls of Samaná, the mountains around Jarabacoa, and the colonial centre of Santo Domingo.",
      detail:
        "Overnight stays, meals and all ground transport are arranged, so the only thing you carry is a small bag. Distances are real — four to six hours of driving on some legs — which is exactly why these places stay quieter than the beaches near the resorts.",
      faqs: [
        {
          question: "Is accommodation included in multi-day tours?",
          answer:
            "Yes. Hotel nights, listed meals and all transport between destinations are included. Each tour page specifies the standard of accommodation.",
        },
        {
          question: "How much luggage should I bring?",
          answer:
            "A small overnight bag. You can leave the rest of your luggage at your hotel in Punta Cana, since you return to the same hotel at the end.",
        },
        {
          question: "Are these tours suitable for children?",
          answer:
            "Older children usually handle them well; the long drives are the hardest part for very young ones. Ask us about your specific dates and ages and we will tell you honestly whether it is a good fit.",
        },
      ],
    },
    es: {
      intro:
        "Los tours de varios días dejan atrás la costa este y llegan a las zonas de República Dominicana que no caben en una excursión de un día: la bahía de las ballenas y los saltos de Samaná, la montaña de Jarabacoa y el centro colonial de Santo Domingo.",
      detail:
        "Las noches de hotel, las comidas y todo el transporte terrestre van organizados, así que lo único que cargas es una mochila pequeña. Las distancias son reales —entre cuatro y seis horas de carretera en algunos tramos— y justamente por eso estos lugares siguen siendo más tranquilos que las playas cercanas a los resorts.",
      faqs: [
        {
          question: "¿El alojamiento está incluido?",
          answer:
            "Sí. Las noches de hotel, las comidas indicadas y todo el transporte entre destinos están incluidos. La página de cada tour especifica la categoría del alojamiento.",
        },
        {
          question: "¿Cuánto equipaje debo llevar?",
          answer:
            "Una bolsa pequeña para la noche. El resto del equipaje puede quedarse en tu hotel de Punta Cana, porque al final regresas al mismo hotel.",
        },
        {
          question: "¿Son adecuados para niños?",
          answer:
            "Los niños más mayores suelen llevarlos bien; los trayectos largos son lo más duro para los más pequeños. Consúltanos tus fechas y edades y te decimos con franqueza si encaja.",
        },
      ],
    },
    "fr-ca": {
      intro:
        "Les excursions de plusieurs jours laissent derrière la côte est et atteignent les régions de la République dominicaine qui ne tiennent pas dans une journée : la baie des baleines et les cascades de Samaná, les montagnes de Jarabacoa et le centre colonial de Saint-Domingue.",
      detail:
        "Les nuitées, les repas et tout le transport terrestre sont organisés; vous ne portez qu'un petit sac. Les distances sont réelles — quatre à six heures de route sur certains trajets — et c'est précisément pourquoi ces lieux restent plus tranquilles que les plages près des complexes.",
      faqs: [
        {
          question: "L'hébergement est-il inclus?",
          answer:
            "Oui. Les nuitées, les repas indiqués et tout le transport entre les destinations sont inclus.",
        },
        {
          question: "Combien de bagages apporter?",
          answer:
            "Un petit sac pour la nuit. Le reste peut rester à votre hôtel de Punta Cana, où vous revenez à la fin.",
        },
        {
          question: "Ces excursions conviennent-elles aux enfants?",
          answer:
            "Les plus grands s'en tirent bien; les longs trajets sont difficiles pour les tout-petits. Parlez-nous de vos dates et des âges et nous vous dirons franchement.",
        },
      ],
    },
  },
};

/* -------------------------------------------------------------------------- */
/*  Destinations                                                               */
/* -------------------------------------------------------------------------- */

const DESTINATION_INTRO: Record<string, LocalizedIntro> = {
  "punta-cana": {
    en: {
      intro:
        "Punta Cana sits on the easternmost tip of the Dominican Republic, where fifty kilometres of reef-sheltered beach run from Cap Cana up to Uvero Alto. It is the base for almost everything we operate: boats leave from its marinas, buggies head inland from its resorts, and the airport is twenty minutes from most hotels.",
      detail:
        "Nearly every tour on this page includes pickup from hotels in Punta Cana, Bávaro, Cap Cana and Uvero Alto. If you are staying here and only have a few days, the water tours and buggy trips are the shortest to reach and the easiest to fit around a flight.",
      faqs: [
        {
          question: "Which tours are closest to Punta Cana hotels?",
          answer:
            "Buggy rides to Macao, catamaran trips from Bávaro and the party boat all start within thirty minutes of most hotels, which makes them workable even on an arrival or departure day.",
        },
        {
          question: "How far is Saona Island from Punta Cana?",
          answer:
            "About two hours by road to Bayahibe, then a boat crossing. It is a full-day tour, usually leaving around 7 a.m. and returning late afternoon.",
        },
      ],
    },
    es: {
      intro:
        "Punta Cana está en el extremo más oriental de República Dominicana, donde cincuenta kilómetros de playa protegida por el arrecife se extienden desde Cap Cana hasta Uvero Alto. Es la base de casi todo lo que operamos: los barcos salen de sus marinas, los buggies parten hacia el interior desde sus resorts y el aeropuerto está a veinte minutos de la mayoría de los hoteles.",
      detail:
        "Casi todos los tours de esta página incluyen recogida en hoteles de Punta Cana, Bávaro, Cap Cana y Uvero Alto. Si te alojas aquí y solo tienes unos días, los tours acuáticos y las salidas en buggy son los más cercanos y los más fáciles de encajar con un vuelo.",
      faqs: [
        {
          question: "¿Qué tours están más cerca de los hoteles de Punta Cana?",
          answer:
            "Los buggies a Macao, los catamaranes desde Bávaro y el party boat empiezan a menos de treinta minutos de la mayoría de los hoteles, así que funcionan incluso el día de llegada o de salida.",
        },
        {
          question: "¿A qué distancia está la isla Saona de Punta Cana?",
          answer:
            "Unas dos horas por carretera hasta Bayahibe y después la travesía en barco. Es un tour de día completo, con salida sobre las 7 de la mañana y regreso a media tarde.",
        },
      ],
    },
    "fr-ca": {
      intro:
        "Punta Cana occupe la pointe la plus orientale de la République dominicaine, où cinquante kilomètres de plage protégée par le récif s'étendent de Cap Cana à Uvero Alto. C'est la base de presque tout ce que nous opérons : les bateaux partent de ses marinas et l'aéroport est à vingt minutes de la plupart des hôtels.",
      detail:
        "Presque toutes les excursions de cette page incluent la prise en charge dans les hôtels de Punta Cana, Bávaro, Cap Cana et Uvero Alto. Si votre séjour est court, les excursions nautiques et le buggy sont les plus faciles à intégrer.",
      faqs: [
        {
          question: "Quelles excursions sont les plus proches des hôtels de Punta Cana?",
          answer:
            "Le buggy vers Macao, les catamarans depuis Bávaro et le party boat commencent à moins de trente minutes de la plupart des hôtels.",
        },
        {
          question: "À quelle distance se trouve l'île Saona?",
          answer:
            "Environ deux heures de route jusqu'à Bayahibe, puis une traversée en bateau. C'est une excursion d'une journée complète.",
        },
      ],
    },
  },

  samana: {
    en: {
      intro:
        "Samaná is a peninsula on the northeast coast, four hours from Punta Cana and a different country in feel: forested hills dropping into the sea, the El Limón waterfall inland, and Cayo Levantado offshore.",
      detail:
        "From mid-January to mid-March, humpback whales come into the bay to breed, and the whale-watching trips out of Samaná town are among the most reliable in the Caribbean. Outside those months the draw is the waterfall, the beaches at Las Galeras and Rincón, and how few people are on them.",
      faqs: [
        {
          question: "When can you see whales in Samaná?",
          answer:
            "From roughly 15 January to 25 March, when humpback whales gather in the bay to mate and calve. Outside that window the whale-watching boats do not run.",
        },
        {
          question: "How long is the trip from Punta Cana to Samaná?",
          answer:
            "About four hours each way by road. Day tours start very early; if you would rather not spend eight hours driving in one day, look at the multi-day options.",
        },
      ],
    },
    es: {
      intro:
        "Samaná es una península en la costa noreste, a cuatro horas de Punta Cana y con un aire completamente distinto: colinas boscosas que caen al mar, el salto de El Limón tierra adentro y Cayo Levantado frente a la costa.",
      detail:
        "Entre mediados de enero y mediados de marzo las ballenas jorobadas entran en la bahía para reproducirse, y las salidas de avistamiento desde el pueblo de Samaná son de las más fiables del Caribe. Fuera de esos meses el atractivo es la cascada, las playas de Las Galeras y Rincón, y lo poco concurridas que están.",
      faqs: [
        {
          question: "¿Cuándo se pueden ver ballenas en Samaná?",
          answer:
            "Aproximadamente del 15 de enero al 25 de marzo, cuando las ballenas jorobadas se concentran en la bahía para aparearse y parir. Fuera de esa ventana no operan los barcos de avistamiento.",
        },
        {
          question: "¿Cuánto se tarda de Punta Cana a Samaná?",
          answer:
            "Unas cuatro horas por trayecto. Los tours de un día salen muy temprano; si prefieres no pasar ocho horas de carretera en un mismo día, mira las opciones de varios días.",
        },
      ],
    },
    "fr-ca": {
      intro:
        "Samaná est une péninsule de la côte nord-est, à quatre heures de Punta Cana, avec une atmosphère toute différente : des collines boisées plongeant dans la mer, la cascade El Limón et Cayo Levantado au large.",
      detail:
        "De la mi-janvier à la mi-mars, les baleines à bosse entrent dans la baie pour se reproduire, et les sorties d'observation depuis Samaná comptent parmi les plus fiables des Caraïbes. Hors saison, l'attrait, ce sont la cascade et les plages de Las Galeras et Rincón.",
      faqs: [
        {
          question: "Quand peut-on voir les baleines à Samaná?",
          answer:
            "Environ du 15 janvier au 25 mars. En dehors de cette période, les bateaux d'observation ne sortent pas.",
        },
        {
          question: "Combien de temps dure le trajet depuis Punta Cana?",
          answer:
            "Environ quatre heures par direction. Les excursions d'une journée partent très tôt; sinon, regardez les options de plusieurs jours.",
        },
      ],
    },
  },

  "santo-domingo": {
    en: {
      intro:
        "Santo Domingo holds the oldest continuously inhabited European settlement in the Americas. The Zona Colonial — its cathedral, the Alcázar de Colón and Calle Las Damas — is a UNESCO World Heritage site you can walk end to end in an afternoon.",
      detail:
        "It is a three-hour drive west from Punta Cana, and day tours combine the colonial centre with the Malecón and lunch in the old town. Wear comfortable shoes: the streets are cobbled and the tour is mostly on foot.",
      faqs: [
        {
          question: "How far is Santo Domingo from Punta Cana?",
          answer:
            "Roughly three hours by road each way on the toll highway. Day tours leave early and return in the evening.",
        },
        {
          question: "Is the Santo Domingo tour a walking tour?",
          answer:
            "Largely, yes. The Zona Colonial is explored on foot over cobbled streets, with the vehicle covering the distances between areas.",
        },
      ],
    },
    es: {
      intro:
        "Santo Domingo alberga el asentamiento europeo habitado de forma continua más antiguo de América. La Zona Colonial —su catedral, el Alcázar de Colón y la Calle Las Damas— es Patrimonio de la Humanidad de la UNESCO y se recorre entera a pie en una tarde.",
      detail:
        "Está a tres horas en coche al oeste de Punta Cana, y los tours de un día combinan el centro colonial con el Malecón y el almuerzo en la ciudad vieja. Lleva calzado cómodo: las calles son empedradas y el recorrido es sobre todo a pie.",
      faqs: [
        {
          question: "¿A qué distancia está Santo Domingo de Punta Cana?",
          answer:
            "Unas tres horas por carretera en cada sentido por la autopista de peaje. Los tours de un día salen temprano y regresan por la noche.",
        },
        {
          question: "¿El tour de Santo Domingo es a pie?",
          answer:
            "En gran parte sí. La Zona Colonial se recorre caminando por calles empedradas, y el vehículo cubre las distancias entre zonas.",
        },
      ],
    },
    "fr-ca": {
      intro:
        "Saint-Domingue abrite le plus ancien établissement européen habité sans interruption des Amériques. La Zone coloniale — sa cathédrale, l'Alcázar de Colón et la Calle Las Damas — est inscrite au patrimoine mondial de l'UNESCO.",
      detail:
        "C'est à trois heures de route à l'ouest de Punta Cana, et les excursions d'une journée combinent le centre colonial, le Malecón et le dîner dans la vieille ville. Portez des chaussures confortables : les rues sont pavées.",
      faqs: [
        {
          question: "À quelle distance se trouve Saint-Domingue de Punta Cana?",
          answer: "Environ trois heures de route par direction sur l'autoroute à péage.",
        },
        {
          question: "L'excursion se fait-elle à pied?",
          answer:
            "En grande partie. La Zone coloniale se visite à pied sur des rues pavées.",
        },
      ],
    },
  },

  "bayahibe-la-romana": {
    en: {
      intro:
        "Bayahibe is a fishing village turned departure point: almost every boat to Saona and Catalina leaves from here. La Romana, twenty minutes west, adds Altos de Chavón, a replica sixteenth-century Mediterranean village above the Chavón river.",
      detail:
        "The water here is inside the Cotubanamá National Park, which is why the reefs are in better shape than most of the coast. From Punta Cana it is a two-hour drive, so departures are early and the day runs long.",
      faqs: [
        {
          question: "Do all Saona Island tours leave from Bayahibe?",
          answer:
            "Yes. Saona lies within the national park and boats depart from Bayahibe, with road transfer from Punta Cana included in the tour.",
        },
        {
          question: "What is there to do in La Romana besides the beaches?",
          answer:
            "Altos de Chavón, with its amphitheatre and craft workshops overlooking the river, is the main stop, and it is often combined with Catalina Island in the same day.",
        },
      ],
    },
    es: {
      intro:
        "Bayahibe es un pueblo de pescadores convertido en punto de salida: casi todos los barcos hacia Saona y Catalina zarpan de aquí. La Romana, veinte minutos al oeste, añade Altos de Chavón, una réplica de aldea mediterránea del siglo XVI sobre el río Chavón.",
      detail:
        "Estas aguas están dentro del Parque Nacional Cotubanamá, y por eso los arrecifes están mejor conservados que en el resto de la costa. Desde Punta Cana son dos horas de coche, así que las salidas son temprano y la jornada es larga.",
      faqs: [
        {
          question: "¿Todos los tours a la isla Saona salen de Bayahibe?",
          answer:
            "Sí. Saona está dentro del parque nacional y los barcos zarpan de Bayahibe, con el traslado por carretera desde Punta Cana incluido en el tour.",
        },
        {
          question: "¿Qué hay que ver en La Romana además de las playas?",
          answer:
            "Altos de Chavón, con su anfiteatro y sus talleres de artesanía sobre el río, es la parada principal, y suele combinarse con la isla Catalina en el mismo día.",
        },
      ],
    },
    "fr-ca": {
      intro:
        "Bayahibe est un village de pêcheurs devenu point de départ : presque tous les bateaux vers Saona et Catalina partent d'ici. La Romana, vingt minutes à l'ouest, ajoute Altos de Chavón, une réplique de village méditerranéen du XVIe siècle.",
      detail:
        "Ces eaux se trouvent dans le parc national Cotubanamá, ce qui explique le bon état des récifs. Depuis Punta Cana, il faut deux heures de route; les départs sont donc tôt.",
      faqs: [
        {
          question: "Toutes les excursions vers Saona partent-elles de Bayahibe?",
          answer:
            "Oui. Saona est dans le parc national et les bateaux partent de Bayahibe, le transfert routier étant inclus.",
        },
        {
          question: "Que voir à La Romana à part les plages?",
          answer:
            "Altos de Chavón, avec son amphithéâtre et ses ateliers d'artisanat, souvent combiné avec l'île Catalina.",
        },
      ],
    },
  },

  miches: {
    en: {
      intro:
        "Miches faces the Bay of Samaná on the north side of the eastern tip, an hour and a half from Punta Cana over a road that only opened up the area recently. Montaña Redonda and the dunes above Playa Esmeralda are what people come for.",
      detail:
        "This is the least developed stretch of coast we visit, and it shows: wide empty beaches, no vendors, and a view from the top of Montaña Redonda over the lagoon and the bay. Go in the morning for the clearest light.",
      faqs: [
        {
          question: "What is Montaña Redonda?",
          answer:
            "A round hill above Miches, about 300 metres high, with swings and hammocks at the summit looking over the Redonda lagoon and the Bay of Samaná. Vehicles take you up the last stretch.",
        },
        {
          question: "How long does it take to get to Miches from Punta Cana?",
          answer:
            "About ninety minutes each way, which makes it a comfortable half-day or relaxed full-day trip.",
        },
      ],
    },
    es: {
      intro:
        "Miches mira a la bahía de Samaná por el lado norte del extremo oriental, a hora y media de Punta Cana por una carretera que abrió la zona hace poco. Montaña Redonda y las dunas sobre Playa Esmeralda son lo que la gente viene a ver.",
      detail:
        "Es el tramo de costa menos desarrollado que visitamos, y se nota: playas amplias y vacías, sin vendedores, y una vista desde lo alto de Montaña Redonda sobre la laguna y la bahía. Ve por la mañana, cuando la luz es más limpia.",
      faqs: [
        {
          question: "¿Qué es Montaña Redonda?",
          answer:
            "Un cerro redondo sobre Miches, de unos 300 metros, con columpios y hamacas en la cima con vistas a la laguna Redonda y a la bahía de Samaná. Unos vehículos te suben el último tramo.",
        },
        {
          question: "¿Cuánto se tarda de Punta Cana a Miches?",
          answer:
            "Unos noventa minutos por trayecto, lo que lo convierte en una excursión cómoda de medio día o de día completo sin prisas.",
        },
      ],
    },
    "fr-ca": {
      intro:
        "Miches fait face à la baie de Samaná, à une heure et demie de Punta Cana par une route récente. Montaña Redonda et les dunes au-dessus de Playa Esmeralda sont les attraits principaux.",
      detail:
        "C'est la portion de côte la moins développée que nous visitons : de larges plages désertes, aucun vendeur, et une vue du sommet de Montaña Redonda sur la lagune et la baie. Allez-y le matin.",
      faqs: [
        {
          question: "Qu'est-ce que Montaña Redonda?",
          answer:
            "Une colline ronde d'environ 300 mètres au-dessus de Miches, avec balançoires et hamacs au sommet donnant sur la lagune et la baie de Samaná.",
        },
        {
          question: "Combien de temps depuis Punta Cana?",
          answer: "Environ quatre-vingt-dix minutes par direction.",
        },
      ],
    },
  },

  "juan-dolio": {
    en: {
      intro:
        "Juan Dolio is a quiet beach town on the south coast, between Santo Domingo and La Romana, with calm shallow water and a seafront that stays low-rise.",
      detail:
        "It works well as a stop on the way to or from Santo Domingo, and as a calmer alternative to the busier east-coast beaches. The reef sits close to shore, so the water stays flat enough for children.",
      faqs: [
        {
          question: "Where is Juan Dolio?",
          answer:
            "On the southern coast, about forty minutes east of Santo Domingo and roughly two and a half hours from Punta Cana.",
        },
        {
          question: "Is Juan Dolio good for families?",
          answer:
            "Yes. The reef keeps the water shallow and calm along most of the beach, and the town is small and easy to walk.",
        },
      ],
    },
    es: {
      intro:
        "Juan Dolio es un pueblo de playa tranquilo en la costa sur, entre Santo Domingo y La Romana, con agua poco profunda y en calma y un frente marítimo de baja altura.",
      detail:
        "Funciona bien como parada de camino a Santo Domingo o de vuelta, y como alternativa más tranquila a las playas más concurridas de la costa este. El arrecife está cerca de la orilla, así que el agua se mantiene mansa para los niños.",
      faqs: [
        {
          question: "¿Dónde está Juan Dolio?",
          answer:
            "En la costa sur, a unos cuarenta minutos al este de Santo Domingo y a unas dos horas y media de Punta Cana.",
        },
        {
          question: "¿Es buen destino para familias?",
          answer:
            "Sí. El arrecife mantiene el agua poco profunda y tranquila en casi toda la playa, y el pueblo es pequeño y fácil de recorrer a pie.",
        },
      ],
    },
    "fr-ca": {
      intro:
        "Juan Dolio est une paisible ville balnéaire de la côte sud, entre Saint-Domingue et La Romana, avec une eau calme et peu profonde.",
      detail:
        "Elle constitue une bonne halte sur la route de Saint-Domingue et une solution plus tranquille que les plages achalandées de la côte est. Le récif proche du rivage garde l'eau calme pour les enfants.",
      faqs: [
        {
          question: "Où se trouve Juan Dolio?",
          answer:
            "Sur la côte sud, à environ quarante minutes à l'est de Saint-Domingue et à deux heures et demie de Punta Cana.",
        },
        {
          question: "Est-ce adapté aux familles?",
          answer: "Oui, l'eau reste peu profonde et calme sur la majeure partie de la plage.",
        },
      ],
    },
  },

  "puerto-plata": {
    en: {
      intro:
        "Puerto Plata is on the Atlantic north coast, under the Isabel de Torres mountain and its cable car. The 27 waterfalls of Damajagua, the amber museum and the Victorian centre of the city are the usual stops.",
      detail:
        "It is the furthest destination we reach from Punta Cana, around five hours by road, so it is normally visited as part of a multi-day itinerary rather than a single day out. The Atlantic here is rougher than the Caribbean side, which is why it is the country's windsurfing coast.",
      faqs: [
        {
          question: "How far is Puerto Plata from Punta Cana?",
          answer:
            "About five hours by road. We recommend it as part of a multi-day tour rather than a day trip.",
        },
        {
          question: "What are the 27 waterfalls of Damajagua?",
          answer:
            "A chain of natural pools and cascades you climb and then jump or slide back down, with a guide, helmet and life jacket. How many of the 27 you do depends on the water level and the group.",
        },
      ],
    },
    es: {
      intro:
        "Puerto Plata está en la costa atlántica del norte, bajo la montaña Isabel de Torres y su teleférico. Los 27 charcos de Damajagua, el museo del ámbar y el centro victoriano de la ciudad son las paradas habituales.",
      detail:
        "Es el destino más lejano al que llegamos desde Punta Cana, unas cinco horas por carretera, así que normalmente se visita dentro de un itinerario de varios días y no como excursión de un solo día. El Atlántico aquí es más bravo que el lado caribeño, y por eso esta es la costa del windsurf del país.",
      faqs: [
        {
          question: "¿A qué distancia está Puerto Plata de Punta Cana?",
          answer:
            "Unas cinco horas por carretera. Lo recomendamos dentro de un tour de varios días y no como excursión de un día.",
        },
        {
          question: "¿Qué son los 27 charcos de Damajagua?",
          answer:
            "Una sucesión de pozas y cascadas naturales que se suben y luego se bajan saltando o deslizándose, con guía, casco y chaleco. Cuántos de los 27 se hacen depende del nivel del agua y del grupo.",
        },
      ],
    },
    "fr-ca": {
      intro:
        "Puerto Plata se trouve sur la côte atlantique nord, au pied du mont Isabel de Torres et de son téléphérique. Les 27 cascades de Damajagua, le musée de l'ambre et le centre victorien sont les arrêts habituels.",
      detail:
        "C'est la destination la plus éloignée depuis Punta Cana, environ cinq heures de route; elle se visite donc dans un itinéraire de plusieurs jours. L'Atlantique y est plus agité que le côté caribéen.",
      faqs: [
        {
          question: "À quelle distance de Punta Cana?",
          answer:
            "Environ cinq heures de route. Nous la recommandons dans une excursion de plusieurs jours.",
        },
        {
          question: "Que sont les 27 cascades de Damajagua?",
          answer:
            "Une série de bassins et de cascades naturels que l'on remonte puis redescend en sautant ou en glissant, avec guide, casque et gilet.",
        },
      ],
    },
  },
};

/* -------------------------------------------------------------------------- */
/*  Lookup                                                                     */
/* -------------------------------------------------------------------------- */

function genericIntro(name: string, locale: AppLocale): ListingIntro {
  if (locale === "es") {
    return {
      intro: `Estas son nuestras excursiones de ${name} en República Dominicana, todas operadas con guías locales y con recogida en tu hotel incluida.`,
      detail:
        "Cada ficha detalla la duración, el punto de recogida, lo que incluye el precio y lo que conviene llevar. Si no encuentras lo que buscas o quieres una salida privada, escríbenos a reservations@adventuresfinder.com y lo organizamos.",
      faqs: [],
    };
  }
  if (locale === "fr-ca") {
    return {
      intro: `Voici nos excursions de ${name} en République dominicaine, toutes menées par des guides locaux, prise en charge à l'hôtel incluse.`,
      detail:
        "Chaque fiche précise la durée, le point de prise en charge, ce que comprend le prix et ce qu'il faut apporter. Si vous ne trouvez pas ce que vous cherchez ou souhaitez un départ privé, écrivez-nous à reservations@adventuresfinder.com.",
      faqs: [],
    };
  }
  return {
    intro: `These are our ${name} tours in the Dominican Republic, all run with local guides and with hotel pickup included.`,
    detail:
      "Each listing sets out the duration, the pickup point, what the price covers and what to bring. If you can't find what you're after, or you'd rather go privately, write to reservations@adventuresfinder.com and we'll arrange it.",
    faqs: [],
  };
}

export function getCategoryIntro(
  slug: string,
  locale: AppLocale,
  fallbackName: string,
): ListingIntro {
  return CATEGORY_INTRO[slug]?.[locale] ?? genericIntro(fallbackName, locale);
}

export function getDestinationIntro(
  slug: string,
  locale: AppLocale,
  fallbackName: string,
): ListingIntro {
  return DESTINATION_INTRO[slug]?.[locale] ?? genericIntro(fallbackName, locale);
}
