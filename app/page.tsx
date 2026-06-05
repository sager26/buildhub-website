import Preloader from "@/components/ui/Preloader";
import Navbar from "@/components/Navbar";
import Showroom3D from "@/components/Showroom3D";
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
        {/* 3D showroom = the entrance */}
        <Showroom3D />
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
