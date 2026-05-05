import { Navbar } from "@/components/layout/Navbar";
import { CalendarioView } from "@/components/home/CalendarioView";

export const metadata = { title: "Calendario — Rione di Lugano" };

export default function CalendarioPage() {
  return (
    <>
      <Navbar />
      <div className="pt-16">
        <div
          className="py-10 px-6 text-center"
          style={{ background: "linear-gradient(135deg, oklch(0.20 0.10 255) 0%, oklch(0.28 0.13 252) 100%)" }}
        >
          <h1 className="font-heading text-2xl sm:text-3xl text-white">Calendario</h1>
          <p className="text-blue-200 mt-1 text-sm">Tutti gli eventi del rione</p>
        </div>
        <main className="mx-auto max-w-3xl px-4 py-8">
          <CalendarioView />
        </main>
        <footer className="border-t border-gray-200 py-8 px-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Rione di Lugano
        </footer>
      </div>
    </>
  );
}
