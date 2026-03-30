import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CarList from "@/components/CarList";
import FeaturedListings from "@/components/FeaturedListings";
import ServiceShortcuts from "@/components/ServiceShortcuts";
import CommunityHighlight from "@/components/CommunityHighlight";
import QuickCategories from "@/components/QuickCategories";

export default function Home() {
  return (
    <>
      <Hero />
      <QuickCategories />
      <FeaturedListings />
      {/* <Features /> */}
      <CarList />
      {/* <ServiceShortcuts /> */}
      {/* <CommunityHighlight /> */}
    </>
  );
}
