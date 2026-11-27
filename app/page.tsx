import CafeMenu from "@/components/CafeMenu";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import LocationContact from "@/components/LocationContact";
import Navbar from "@/components/Navbar";
import Philosophy from "@/components/Philosophy";
import RoastsShowcase from "@/components/RoastsShowcase";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Philosophy />
        <RoastsShowcase />
        <CafeMenu />
        <LocationContact />
      </main>
      <Footer />
    </>
  );
}
