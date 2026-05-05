import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { AgendaSection } from "@/components/home/AgendaSection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <AgendaSection />
      <footer className="border-t border-border py-8 px-6 text-center text-xs text-muted-foreground/50">
        © {new Date().getFullYear()} Rione di Lugano
      </footer>
    </>
  );
}
