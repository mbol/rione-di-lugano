"use client";

import { useSearchParams } from "next/navigation";
import { EventDetailClient } from "./EventDetailClient";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function EventDetailWrapper() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <main className="mx-auto max-w-3xl px-6 pt-24 pb-20 flex flex-col items-center gap-6 text-center">
        <Calendar className="w-12 h-12 text-muted-foreground/30 mt-12" />
        <h1 className="font-heading text-2xl text-foreground">Evento non trovato</h1>
        <p className="text-muted-foreground">Nessun evento specificato.</p>
        <Link href="/#agenda" className={cn(buttonVariants(), "gap-2")}>
          <ArrowLeft className="w-4 h-4" />
          Torna all&apos;agenda
        </Link>
      </main>
    );
  }

  return <EventDetailClient id={id} />;
}
