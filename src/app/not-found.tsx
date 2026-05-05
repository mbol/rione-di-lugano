import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center min-h-screen px-6 text-center">
        <p className="text-8xl font-heading font-bold text-primary/20 leading-none select-none">
          404
        </p>
        <h1 className="font-heading text-2xl text-foreground mt-4">
          Pagina non trovata
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xs">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          ← Torna alla homepage
        </Link>
      </main>
    </>
  );
}
