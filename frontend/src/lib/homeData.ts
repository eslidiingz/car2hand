/**
 * Server-side data fetching for the homepage.
 *
 * These run during SSR (inside async Server Components) so the homepage's
 * content is fetched server-to-server in parallel and streamed as HTML —
 * eliminating the old client-side "blank → JS → hydrate → 4 API round-trips
 * → spinners" waterfall that made the page crawl on slow 4G.
 *
 * `next.revalidate = 60` gives ISR-style caching: the backend is hit at most
 * once per minute per endpoint, and returning/repeat visitors get the cached
 * HTML data instantly. Homepage content is marketing material — 60s of
 * staleness is an acceptable trade for the large perceived-speed win.
 */
import type { VehicleListing } from "@/components/ListingCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const REVALIDATE = 60;

export interface HomeBrand {
  id: string;
  name: string;
  nameTh?: string | null;
  logo?: string | null;
  isPopular?: boolean;
}

export async function getBrands(): Promise<HomeBrand[]> {
  try {
    const res = await fetch(`${API_URL}/master-data/brands?vehicleType=CAR`, {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.brands || [];
  } catch {
    return [];
  }
}

async function getListings(path: string): Promise<VehicleListing[]> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.listings || [];
  } catch {
    return [];
  }
}

export const getFeaturedListings = () => getListings("/listings/featured");
export const getRecommendedListings = () => getListings("/listings/recommended");
export const getNewListings = async (): Promise<VehicleListing[]> =>
  (await getListings("/listings/new")).slice(0, 12);
