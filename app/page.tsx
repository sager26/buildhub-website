import Preloader from "@/components/ui/Preloader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Marquee from "@/components/ui/Marquee";
import WhyChoose from "@/components/WhyChoose";
import Products from "@/components/Products";
import ProductGallery from "@/components/ProductGallery";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { PRODUCTS } from "@/lib/constants";

export default function Home() {
  return (
    <>
      <Preloader />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Marquee items={PRODUCTS.map((p) => p.name)} />
        <WhyChoose />
        <Products />
        <ProductGallery />
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
