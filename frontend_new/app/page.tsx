import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import Benefits from "@/components/landing/Benefits";
import HowItWorks from "@/components/landing/HowItWorks";
import WhoItsFor from "@/components/landing/WhoItsFor";
import TrustPrivacy from "@/components/landing/TrustPrivacy";
import FinalCta from "@/components/landing/FinalCta";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <Benefits />
        <HowItWorks />
        <WhoItsFor />
        <TrustPrivacy />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
