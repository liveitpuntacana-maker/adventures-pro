/**
 * Renders one or more schema.org graphs as <script type="application/ld+json">.
 *
 * `<` is escaped so a stray "</script>" inside CMS text can never break out of
 * the tag.
 */
export default function JsonLd({ data }: { data: unknown | unknown[] }) {
  const blocks = Array.isArray(data) ? data : [data];

  return (
    <>
      {blocks.filter(Boolean).map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(block).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
