import Hero from "@/components/Hero";
import CarList from "@/components/CarList";
import FeaturedListings from "@/components/FeaturedListings";
import RecommendedListings from "@/components/RecommendedListings";
import QuickCategories from "@/components/QuickCategories";
import { MOTORCYCLE_ENABLED } from "@/lib/featureFlags";
import MotorcycleListings from "@/components/MotorcycleListings";

export default function Home() {
  return (
    <>
      <Hero />
      <QuickCategories />
      {/* ประกาศแนะนำ — CAR only, Dealer */}
      <FeaturedListings />
      {/* ประกาศเด่น — CAR only, Pro */}
      <RecommendedListings />
      {/* รถมาใหม่วันนี้ — CAR only, ล่าสุด */}
      <CarList />
      {/* มอเตอร์ไซค์ — hidden this phase; flip MOTORCYCLE_ENABLED to re-enable */}
      {MOTORCYCLE_ENABLED && <MotorcycleListings />}
    </>
  );
}
