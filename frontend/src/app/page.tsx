import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CarList from "@/components/CarList";
import ServiceShortcuts from "@/components/ServiceShortcuts";
import CommunityHighlight from "@/components/CommunityHighlight";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <CarList />
      <ServiceShortcuts />
      <CommunityHighlight />
    </>
  );
}
