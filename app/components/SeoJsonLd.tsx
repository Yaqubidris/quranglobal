export default function SeoJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Qur’an Global",
    url: "https://quran-global.vercel.app",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://quran-global.vercel.app/surahs?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
