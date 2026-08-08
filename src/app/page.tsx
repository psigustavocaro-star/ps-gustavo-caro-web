import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import TrustBar from "@/components/TrustBar/TrustBar";
import TCCFocus from "@/components/TCCFocus/TCCFocus";
import About from "@/components/About/About";
import Services from "@/components/Services/Services";
import Testimonials from "@/components/Testimonials/Testimonials";
import EmpathySection from "@/components/EmpathySection/EmpathySection";
import FAQ from "@/components/FAQ/FAQ";
import Newsletter from "@/components/Newsletter/Newsletter";
import Footer from "@/components/Footer/Footer";
import ResourcesLibrary from "@/components/Resources/ResourcesLibrary";


export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <TrustBar />
      <TCCFocus />
      <About />

      <Services />
      <Testimonials />
      <EmpathySection />
      <ResourcesLibrary compact />
      <FAQ />
      <Newsletter />
      <Footer />
    </main>
  );
}
