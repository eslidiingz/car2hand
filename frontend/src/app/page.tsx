import { Suspense } from "react";
import QuickCategories from "@/components/QuickCategories";
import { MOTORCYCLE_ENABLED } from "@/lib/featureFlags";
import MotorcycleListings from "@/components/MotorcycleListings";
import {
  HeroSection,
  FeaturedSection,
  RecommendedSection,
  NewCarsSection,
  HeroSkeleton,
  RailSkeleton,
  GridSkeleton,
} from "@/components/home/HomeSections";

/**
 * Homepage is a Server Component. Each data section fetches server-side
 * (in parallel) and streams into its own <Suspense> boundary, so the shell
 * + skeletons paint immediately and content fills in as it resolves —
 * instead of the old client-fetch waterfall (blank → JS → hydrate → 4 API
 * round-trips → spinners) that crawled on slow 4G.
 */
export default function Home() {
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>
      <QuickCategories />
      {/* ประกาศแนะนำ — CAR only, Dealer */}
      <Suspense fallback={<RailSkeleton />}>
        <FeaturedSection />
      </Suspense>
      {/* ประกาศเด่น — CAR only, Pro */}
      <Suspense fallback={<RailSkeleton />}>
        <RecommendedSection />
      </Suspense>
      {/* รถมาใหม่วันนี้ — CAR only, ล่าสุด */}
      <Suspense fallback={<GridSkeleton />}>
        <NewCarsSection />
      </Suspense>
      {/* มอเตอร์ไซค์ — hidden this phase; flip MOTORCYCLE_ENABLED to re-enable */}
      {MOTORCYCLE_ENABLED && <MotorcycleListings />}
    </>
  );
}
