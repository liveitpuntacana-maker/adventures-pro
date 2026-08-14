import type { AppLocale } from "@/i18n/routing";

export type FaqItem = {
  question: string;
  /** Plain-text paragraphs. Rendered in order and reused for FAQPage JSON-LD. */
  answer: string[];
  /** Optional bullet list rendered after the first paragraph. */
  steps?: string[];
};

const en: FaqItem[] = [
  {
    question: "How do I book a tour?",
    answer: [
      "Booking a tour is simple and convenient through our website. Here's a step-by-step guide on how to do it:",
      "If you have any questions or need further assistance during the booking process, feel free to reach out to us via email at reservations@adventuresfinder.com. Additionally, you can chat with us in real time via WhatsApp; just click on the WhatsApp icon on our webpage for instant support.",
    ],
    steps: [
      "Visit our webpage and select the tour you are interested in.",
      "Click on the \"Book Now\" button.",
      "Choose your preferred date and starting time (if multiple options are listed).",
      "Select the number of participants joining the tour.",
      "Click on \"Pay Now\" to proceed with the payment process.",
    ],
  },
  {
    question: "What payment methods are accepted?",
    answer: [
      "Tours are paid online through our secure booking platform, which accepts the main credit and debit cards. Your card details are handled by the payment provider and are never stored on our website.",
      "For group bookings, private tours or corporate reservations we can also arrange a bank transfer. Write to reservations@adventuresfinder.com and we will send you the details.",
    ],
  },
  {
    question: "How do I receive my booking confirmation and itinerary?",
    answer: [
      "Upon successfully booking your tour, a confirmation email will be sent to you, which includes a unique confirmation number along with pickup details and other essential information. Please ensure you provide an accurate hotel name during the booking process.",
      "For those staying in a condo or another type of accommodation, kindly select any listed location initially, and promptly send us an email at reservations@adventuresfinder.com with your exact location details post-booking. Failure to provide precise location details prior to the tour date may result in a missed pickup, which could lead to a situation where the booking is considered a 'no show', and guarantees for refunds may not be available.",
    ],
  },
  {
    question: "What is the cancellation or rescheduling policy?",
    answer: [
      "Our cancellation and rescheduling policies are crafted to be as fair and flexible as possible. To thoroughly understand the specifics, terms and conditions related to cancellations or rescheduling of tours, we highly recommend visiting our cancellation policy page. There you'll find detailed information ensuring that any decision you make is well-informed, aligning with our policies and procedures.",
    ],
  },
  {
    question: "Is transportation included, and where are the pickup and drop-off points?",
    answer: [
      "Yes, transportation is included in all our tours, ensuring you a seamless and convenient travel experience. The pickup and drop-off points vary depending on your accommodation. For some hotels, we provide direct pickup from the main lobby, while others have designated meeting points for tour pickups. If you're staying in a private condo, once we receive the exact location, we'll inform you of the nearest pickup point, making sure your journey is as comfortable and hassle-free as possible.",
    ],
  },
  {
    question: "Are there any age or health restrictions for the tours?",
    answer: [
      "Yes, the age and health restrictions vary depending on the tour chosen. Some tours are suitable for all ages, while others may have specific age limits or health considerations due to the physical demands of the activity. It's essential to check the individual tour descriptions for detailed information on age and health restrictions to ensure the chosen tour is appropriate and safe for all participants.",
    ],
  },
  {
    question: "Are meals or refreshments included?",
    answer: [
      "The inclusion of meals and refreshments depends on the specific tour you choose. Some tours offer meals and drinks as part of the package, ensuring that you are well-fed and hydrated during your adventure. Other tours might offer only drinks or just water to keep you refreshed. We recommend checking the detailed description of each tour on our website to know exactly what is included.",
    ],
  },
  {
    question: "Do the tours operate in all weather conditions?",
    answer: [
      "Most of our tours operate under various weather conditions, and some, like our buggy tours, become even more exciting with a bit of rain. However, certain tours, especially those on the water, might be affected by severe weather such as hurricanes or strong winds and rain. Safety is our priority, so in cases where a tour needs to be cancelled due to adverse weather, we will inform you in advance. Options for refunds or rescheduling in such scenarios are outlined in our cancellation policy.",
    ],
  },
  {
    question: "Are the tours guided, and what languages are spoken?",
    answer: [
      "Yes, all our tours are conducted by certified guides who are knowledgeable and passionate about providing a rich and engaging tour experience. Our guides are bilingual, fluently speaking both Spanish and English, ensuring that a wide array of visitors can fully enjoy and understand the information shared during the tour. We also provide tours in French.",
    ],
  },
  {
    question: "Can I book a private tour, and what is the cost?",
    answer: [
      "Absolutely, private tours are an excellent way to enjoy a more personalized and exclusive experience. To get detailed information tailored just for you, including costs and customization options, please reach out to us directly at reservations@adventuresfinder.com. Our team is here to assist you in creating a unique adventure that suits your preferences and needs.",
    ],
  },
];

const es: FaqItem[] = [
  {
    question: "¿Cómo reservo un tour?",
    answer: [
      "Reservar un tour desde nuestra web es simple y rápido. Estos son los pasos:",
      "Si tienes cualquier duda o necesitas ayuda durante la reserva, escríbenos a reservations@adventuresfinder.com. También puedes chatear con nosotros en tiempo real por WhatsApp: solo haz clic en el icono de WhatsApp de la web para recibir atención inmediata.",
    ],
    steps: [
      "Entra en nuestra web y elige el tour que te interesa.",
      "Haz clic en el botón «Reservar ahora».",
      "Elige la fecha y la hora de salida que prefieras (si hay varias opciones).",
      "Indica el número de participantes.",
      "Haz clic en «Pagar ahora» para completar el pago.",
    ],
  },
  {
    question: "¿Qué métodos de pago se aceptan?",
    answer: [
      "Los tours se pagan en línea a través de nuestra plataforma de reservas segura, que acepta las principales tarjetas de crédito y débito. Los datos de tu tarjeta los gestiona el proveedor de pagos y nunca se almacenan en nuestra web.",
      "Para reservas de grupo, tours privados o reservas corporativas también podemos gestionar una transferencia bancaria. Escríbenos a reservations@adventuresfinder.com y te enviamos los datos.",
    ],
  },
  {
    question: "¿Cómo recibo la confirmación de mi reserva y el itinerario?",
    answer: [
      "Al completar la reserva recibirás un correo de confirmación con un número único, los datos de recogida y el resto de información esencial. Asegúrate de indicar correctamente el nombre de tu hotel durante la reserva.",
      "Si te alojas en un condominio u otro tipo de alojamiento, selecciona inicialmente cualquiera de las ubicaciones de la lista y escríbenos enseguida a reservations@adventuresfinder.com con tu ubicación exacta. No facilitar la ubicación precisa antes de la fecha del tour puede provocar una recogida fallida, que se considera «no show» y en ese caso no se garantiza el reembolso.",
    ],
  },
  {
    question: "¿Cuál es la política de cancelación o cambio de fecha?",
    answer: [
      "Nuestras políticas de cancelación y cambio de fecha están pensadas para ser lo más justas y flexibles posible. Para conocer los detalles, términos y condiciones exactos, te recomendamos visitar nuestra página de política de cancelación, donde encontrarás toda la información para tomar una decisión informada.",
    ],
  },
  {
    question: "¿El transporte está incluido? ¿Dónde son la recogida y el regreso?",
    answer: [
      "Sí, el transporte está incluido en todos nuestros tours. Los puntos de recogida y regreso varían según tu alojamiento: en algunos hoteles recogemos directamente en el lobby principal y otros tienen puntos de encuentro designados para las excursiones. Si te alojas en un condominio privado, en cuanto recibamos la ubicación exacta te indicaremos el punto de recogida más cercano para que el trayecto sea lo más cómodo posible.",
    ],
  },
  {
    question: "¿Hay restricciones de edad o de salud para los tours?",
    answer: [
      "Sí, las restricciones de edad y salud varían según el tour elegido. Algunos son aptos para todas las edades y otros tienen límites de edad o consideraciones de salud por la exigencia física de la actividad. Es importante revisar la descripción de cada tour para conocer las restricciones concretas y asegurarte de que la actividad es adecuada y segura para todos los participantes.",
    ],
  },
  {
    question: "¿Se incluyen comidas o bebidas?",
    answer: [
      "Depende del tour que elijas. Algunos incluyen comida y bebidas dentro del paquete, otros ofrecen solo bebidas o agua. Te recomendamos revisar la descripción detallada de cada tour en la web para saber exactamente qué incluye.",
    ],
  },
  {
    question: "¿Los tours operan con cualquier condición climática?",
    answer: [
      "La mayoría de nuestros tours operan con distintas condiciones climáticas, y algunos, como los de buggy, se vuelven aún más divertidos con un poco de lluvia. Sin embargo, ciertos tours, sobre todo los acuáticos, pueden verse afectados por condiciones severas como huracanes o vientos y lluvias fuertes. La seguridad es nuestra prioridad, así que si hay que cancelar un tour por mal tiempo te avisaremos con antelación. Las opciones de reembolso o cambio de fecha en esos casos están detalladas en nuestra política de cancelación.",
    ],
  },
  {
    question: "¿Los tours son guiados? ¿En qué idiomas?",
    answer: [
      "Sí, todos nuestros tours los realizan guías certificados, con amplio conocimiento y verdadera pasión por ofrecer una experiencia rica y cercana. Nuestros guías son bilingües y hablan español e inglés con fluidez. También ofrecemos tours en francés.",
    ],
  },
  {
    question: "¿Puedo reservar un tour privado? ¿Cuánto cuesta?",
    answer: [
      "Por supuesto. Los tours privados son una excelente forma de disfrutar de una experiencia más personalizada y exclusiva. Para recibir información a medida, incluyendo precios y opciones de personalización, escríbenos directamente a reservations@adventuresfinder.com. Nuestro equipo te ayudará a crear una aventura única adaptada a lo que buscas.",
    ],
  },
];

const frCA: FaqItem[] = [
  {
    question: "Comment réserver une excursion?",
    answer: [
      "Réserver une excursion sur notre site est simple et rapide. Voici les étapes :",
      "Si vous avez des questions ou besoin d'aide pendant la réservation, écrivez-nous à reservations@adventuresfinder.com. Vous pouvez aussi clavarder avec nous en direct sur WhatsApp : cliquez simplement sur l'icône WhatsApp du site pour une réponse immédiate.",
    ],
    steps: [
      "Visitez notre site et choisissez l'excursion qui vous intéresse.",
      "Cliquez sur le bouton « Réserver ».",
      "Choisissez la date et l'heure de départ souhaitées (si plusieurs options sont offertes).",
      "Indiquez le nombre de participants.",
      "Cliquez sur « Payer » pour finaliser le paiement.",
    ],
  },
  {
    question: "Quels modes de paiement sont acceptés?",
    answer: [
      "Les excursions se paient en ligne au moyen de notre plateforme de réservation sécurisée, qui accepte les principales cartes de crédit et de débit. Les données de votre carte sont traitées par le fournisseur de paiement et ne sont jamais conservées sur notre site.",
      "Pour les réservations de groupe, les excursions privées ou les réservations d'entreprise, nous pouvons aussi organiser un virement bancaire. Écrivez-nous à reservations@adventuresfinder.com et nous vous transmettrons les détails.",
    ],
  },
  {
    question: "Comment vais-je recevoir ma confirmation et mon itinéraire?",
    answer: [
      "Dès votre réservation confirmée, vous recevrez un courriel contenant un numéro de confirmation unique, les détails de la prise en charge et les autres renseignements essentiels. Assurez-vous d'indiquer correctement le nom de votre hôtel au moment de la réservation.",
      "Si vous logez dans un condo ou un autre type d'hébergement, sélectionnez d'abord l'un des emplacements proposés, puis envoyez-nous rapidement un courriel à reservations@adventuresfinder.com avec votre adresse exacte. Sans emplacement précis avant la date de l'excursion, la prise en charge peut être manquée, ce qui est considéré comme une absence (« no show ») et le remboursement n'est alors pas garanti.",
    ],
  },
  {
    question: "Quelle est la politique d'annulation ou de report?",
    answer: [
      "Nos politiques d'annulation et de report se veulent aussi justes et souples que possible. Pour connaître les modalités exactes, nous vous invitons à consulter notre page de politique d'annulation, où vous trouverez toute l'information nécessaire pour prendre une décision éclairée.",
    ],
  },
  {
    question: "Le transport est-il inclus? Où se font les prises en charge?",
    answer: [
      "Oui, le transport est inclus dans toutes nos excursions. Les points de prise en charge et de retour varient selon votre hébergement : dans certains hôtels, nous venons directement au hall principal, tandis que d'autres disposent de points de rencontre désignés. Si vous logez dans un condo privé, dès que nous aurons votre adresse exacte, nous vous indiquerons le point de prise en charge le plus proche.",
    ],
  },
  {
    question: "Y a-t-il des restrictions d'âge ou de santé?",
    answer: [
      "Oui, les restrictions d'âge et de santé varient selon l'excursion choisie. Certaines conviennent à tous les âges, d'autres comportent des limites d'âge ou des considérations de santé en raison de l'effort physique exigé. Il est important de consulter la description de chaque excursion pour vous assurer qu'elle convient à tous les participants.",
    ],
  },
  {
    question: "Les repas et les boissons sont-ils inclus?",
    answer: [
      "Cela dépend de l'excursion choisie. Certaines comprennent les repas et les boissons, d'autres offrent seulement des boissons ou de l'eau. Nous vous recommandons de consulter la description détaillée de chaque excursion pour savoir exactement ce qui est inclus.",
    ],
  },
  {
    question: "Les excursions ont-elles lieu par tous les temps?",
    answer: [
      "La plupart de nos excursions se déroulent par différentes conditions météo, et certaines, comme les excursions en buggy, deviennent encore plus amusantes sous une petite pluie. Toutefois, certaines excursions, surtout sur l'eau, peuvent être touchées par des conditions sévères comme un ouragan ou des vents et pluies violents. La sécurité étant notre priorité, si une excursion doit être annulée pour cause de mauvais temps, nous vous préviendrons à l'avance. Les options de remboursement ou de report sont détaillées dans notre politique d'annulation.",
    ],
  },
  {
    question: "Les excursions sont-elles guidées? Dans quelles langues?",
    answer: [
      "Oui, toutes nos excursions sont menées par des guides certifiés, passionnés et bien informés. Nos guides sont bilingues et parlent couramment l'espagnol et l'anglais. Nous offrons également des excursions en français.",
    ],
  },
  {
    question: "Puis-je réserver une excursion privée? À quel prix?",
    answer: [
      "Absolument. Les excursions privées sont une excellente façon de vivre une expérience plus personnalisée et exclusive. Pour obtenir une information sur mesure, incluant les prix et les options de personnalisation, écrivez-nous directement à reservations@adventuresfinder.com. Notre équipe vous aidera à créer une aventure unique adaptée à vos préférences.",
    ],
  },
];

const BY_LOCALE: Record<AppLocale, FaqItem[]> = { en, es, "fr-ca": frCA };

export function getFaqs(locale: AppLocale): FaqItem[] {
  return BY_LOCALE[locale] ?? en;
}

/** Flattens an FAQ answer into the single string FAQPage schema expects. */
export function faqAnswerText(item: FaqItem): string {
  const parts = [...item.answer];
  if (item.steps?.length) parts.splice(1, 0, item.steps.join(" "));
  return parts.join(" ");
}
