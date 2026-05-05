import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <footer className="border-t border-gray-200 py-8 px-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Rione di Lugano
      </footer>
    </>
  );
}
