/**
 * SEO / GEO (Generative Engine Optimization) helpers
 *
 * Produces JSON-LD structured data that follows Schema.org standards,
 * plus utilities for canonical URLs, meta descriptions, and locale-aware text.
 *
 * GEO principles applied:
 *  - Factual, self-contained content in each schema node
 *  - BreadcrumbList for clear navigation hierarchy
 *  - Vehicle + Product + Offer combo for listings (Google's preferred pattern)
 *  - Article + author + datePublished + keywords for editorial
 *  - All URLs are absolute (required by AI engines to crawl/cite)
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://car2hand.app').replace(/\/$/, '');
export const SITE_NAME = 'Car2Hand';
export const SITE_DESCRIPTION = 'Car2Hand — แพลตฟอร์มซื้อขายรถมือสองในประเทศไทย พร้อมระบบประเมินราคาด้วย AI และตรวจเช็คสภาพรถโดยช่างผู้เชี่ยวชาญ';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * Build an absolute URL from a pathname.
 * Ensures trailing-slash and double-slash safety for canonical/og:url.
 */
export function absoluteUrl(pathname: string): string {
  if (!pathname) return SITE_URL;
  if (pathname.startsWith('http')) return pathname;
  return `${SITE_URL}${pathname.startsWith('/') ? '' : '/'}${pathname}`;
}

/** Safe, character-limited description for meta tags (Google caps around 160). */
export function truncateDescription(text: string, max = 160): string {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/[,.;: ]+$/, '') + '…';
}

/** Organization schema for the root layout. Identifies the publisher across all content. */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: 'คาร์ทูแฮนด์',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.webp`,
    description: SITE_DESCRIPTION,
    inLanguage: 'th-TH',
    areaServed: {
      '@type': 'Country',
      name: 'Thailand',
    },
    sameAs: [
      'https://www.facebook.com/car2hand',
      'https://line.me/ti/p/~@car2hand',
    ],
  };
}

/** WebSite schema — enables Google sitelinks search box. */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'th-TH',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/buy?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

/** BreadcrumbList — critical for GEO so AI engines understand page hierarchy. */
export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

/* ─── Vehicle Listing ─────────────────────────────────────────────────── */

export interface VehicleSchemaInput {
  id: string;
  title: string;
  description: string | null | undefined;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage?: number | null;
  color?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  bodyType?: string | null;
  vehicleType: 'CAR' | 'MOTORCYCLE';
  condition?: string | null;
  engineSize?: number | null;
  seats?: number | null;
  province?: string | null;
  district?: string | null;
  images: string[];
  seller?: { fullName: string } | null;
  createdAt: string;
  updatedAt?: string;
}

const FUEL_MAP: Record<string, string> = {
  PETROL: 'Gasoline',
  DIESEL: 'Diesel',
  HYBRID: 'Hybrid',
  PLUGIN_HYBRID: 'Plug-in Hybrid',
  EV: 'Electric',
  LPG: 'LPG',
  NGV: 'NGV',
};

const TRANSMISSION_MAP: Record<string, string> = {
  AUTOMATIC: 'Automatic',
  MANUAL: 'Manual',
  CVT: 'CVT',
  DCT: 'DCT',
  SEMI_AUTO: 'Semi-Automatic',
};

/**
 * Vehicle + Offer combo schema. Google's rich results for used cars expect this shape.
 * Also usable for motorcycles (uses @type: 'Motorcycle').
 */
export function vehicleListingSchema(listing: VehicleSchemaInput, pathname: string) {
  const url = absoluteUrl(pathname);
  const type = listing.vehicleType === 'MOTORCYCLE' ? 'Motorcycle' : 'Car';

  const vehicle: Record<string, unknown> = {
    '@type': type,
    name: listing.title,
    description: truncateDescription(listing.description || listing.title, 300),
    brand: { '@type': 'Brand', name: listing.brand },
    model: listing.model,
    vehicleModelDate: String(listing.year),
    productionDate: String(listing.year),
    itemCondition: 'https://schema.org/UsedCondition',
    image: listing.images.length > 0 ? listing.images : [DEFAULT_OG_IMAGE],
    url,
  };

  if (listing.mileage != null) {
    vehicle.mileageFromOdometer = {
      '@type': 'QuantitativeValue',
      value: listing.mileage,
      unitCode: 'KMT',
    };
  }
  if (listing.color) vehicle.color = listing.color;
  if (listing.fuelType) vehicle.fuelType = FUEL_MAP[listing.fuelType] || listing.fuelType;
  if (listing.transmission) vehicle.vehicleTransmission = TRANSMISSION_MAP[listing.transmission] || listing.transmission;
  if (listing.bodyType) vehicle.bodyType = listing.bodyType;
  if (listing.seats) vehicle.seatingCapacity = listing.seats;
  if (listing.engineSize) {
    vehicle.vehicleEngine = {
      '@type': 'EngineSpecification',
      engineDisplacement: {
        '@type': 'QuantitativeValue',
        value: listing.engineSize,
        unitCode: 'CMQ',
      },
    };
  }

  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    url,
    priceCurrency: 'THB',
    price: listing.price,
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/UsedCondition',
  };
  if (listing.seller?.fullName) {
    offer.seller = {
      '@type': 'Person',
      name: listing.seller.fullName,
    };
  }
  if (listing.province) {
    offer.areaServed = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressRegion: listing.province,
        addressLocality: listing.district || undefined,
        addressCountry: 'TH',
      },
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    ...vehicle,
    offers: offer,
    category: type === 'Motorcycle' ? 'Motorcycle' : 'Used Car',
  };
}

/* ─── Article ────────────────────────────────────────────────────────── */

export interface ArticleSchemaInput {
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featuredImage?: string | null;
  author?: { fullName: string } | null;
  category?: { name: string; slug: string } | null;
  tags?: string[];
  viewCount?: number;
  createdAt: string;
  updatedAt?: string;
}

/** Article schema — for editorial content (reviews, guides, news). */
export function articleSchema(article: ArticleSchemaInput, pathname: string) {
  const url = absoluteUrl(pathname);
  const images = article.featuredImage ? [article.featuredImage] : [DEFAULT_OG_IMAGE];

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline: article.title,
    description: truncateDescription(article.excerpt || article.content, 200),
    image: images,
    datePublished: article.createdAt,
    dateModified: article.updatedAt || article.createdAt,
    author: {
      '@type': 'Person',
      name: article.author?.fullName || 'ทีมงาน Car2Hand',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.webp`,
      },
    },
    articleSection: article.category?.name || undefined,
    keywords: article.tags && article.tags.length > 0 ? article.tags.join(', ') : undefined,
    inLanguage: 'th-TH',
  };
}

/**
 * Render JSON-LD as a <script> tag.
 * Use like: <JsonLd data={articleSchema(article, path)} />
 */
export function jsonLdScript(data: unknown | unknown[]): string {
  return JSON.stringify(data);
}
