/**
 * Server Components that fetch homepage data during SSR and render the
 * (client) presentational components with the data as props.
 *
 * Each one is meant to be wrapped in its own <Suspense> boundary in
 * page.tsx so sections stream in independently — the page shell + skeletons
 * paint immediately, then each block pops in as its server fetch resolves
 * (in parallel, server-to-server). No client fetch waterfall.
 */
import Hero from "@/components/Hero";
import FeaturedListings from "@/components/FeaturedListings";
import RecommendedListings from "@/components/RecommendedListings";
import CarList from "@/components/CarList";
import {
  getBrands,
  getFeaturedListings,
  getRecommendedListings,
  getNewListings,
} from "@/lib/homeData";

/* ── Async data sections ─────────────────────────────────────────── */

export async function HeroSection() {
  const brands = await getBrands();
  return <Hero brands={brands} />;
}

export async function FeaturedSection() {
  const listings = await getFeaturedListings();
  return <FeaturedListings listings={listings} />;
}

export async function RecommendedSection() {
  const listings = await getRecommendedListings();
  return <RecommendedListings listings={listings} />;
}

export async function NewCarsSection() {
  const listings = await getNewListings();
  return <CarList listings={listings} />;
}

/* ── Skeletons (layout-matched to avoid CLS) ─────────────────────── */

function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="aspect-3/2 bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-3 bg-gray-100 rounded animate-pulse" />
          <div className="h-3 bg-gray-100 rounded animate-pulse" />
          <div className="h-3 bg-gray-100 rounded animate-pulse" />
          <div className="h-3 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="h-7 w-1/2 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <header className="bg-linear-to-br from-[#0F3460] to-[#16213E] pt-28 pb-24 rounded-b-[40px] px-4 text-center relative shadow-xl">
      <div className="h-9 md:h-12 w-72 max-w-[80%] bg-white/15 rounded-lg mx-auto mb-4 animate-pulse" />
      <div className="h-4 w-96 max-w-[90%] bg-white/10 rounded mx-auto mb-8 animate-pulse" />
      <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-4xl mx-auto border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 h-16 bg-gray-100 rounded-xl animate-pulse" />
          <div className="flex-1 h-16 bg-gray-100 rounded-xl animate-pulse" />
          <div className="flex-1 h-16 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="h-16 bg-gray-200 rounded-2xl mt-4 animate-pulse" />
      </div>
    </header>
  );
}

export function RailSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-12">
      <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
      <div className="flex gap-6 overflow-hidden pb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[280px] sm:w-[300px]">
            <CardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}

export function GridSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 pt-12 pb-16">
      <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
