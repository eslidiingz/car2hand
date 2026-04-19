/**
 * Server-rendered JSON-LD script.
 * Uses dangerouslySetInnerHTML (standard practice for schema.org injection).
 */
export default function JsonLd({ data }: { data: unknown | unknown[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
