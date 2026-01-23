import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import TrustBadges from "@/components/TrustBadges/TrustBadges";
import About from "@/components/About/About";
import Services from "@/components/Services/Services";
import Testimonials from "@/components/Testimonials/Testimonials";
import EmpathySection from "@/components/EmpathySection/EmpathySection";
import Booking from "@/components/Booking/Booking";
import FAQ from "@/components/FAQ/FAQ";
import BlogSection from "@/components/Blog/BlogSection";
import Newsletter from "@/components/Newsletter/Newsletter";
import Footer from "@/components/Footer/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <TrustBadges />
      <About />
      <Services />
      <Testimonials />
      <EmpathySection />
      <Booking />
      <FAQ />
      <BlogSection />
      <Newsletter />
      <Footer />
    </main>
  );
}
