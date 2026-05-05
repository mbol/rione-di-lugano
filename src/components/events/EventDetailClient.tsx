"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Video, Calendar, FileText, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { ImageViewer } from "./ImageViewer";

const PdfViewer = dynamic(
  () => import("./PdfViewer").then((m) => ({ default: m.PdfViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 rounded-xl border border-border bg-card text-muted-foreground text-sm animate-pulse">
        Caricamento PDF…
      </div>
    ),
  }
);
import { getEventById } from "@/lib/events";
import { formatFullDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Event } from "@/lib/types";

const flyerIcons = {
  pdf: FileText,
  image: ImageIcon,
  none: Calendar,
};

const flyerLabels = {
  pdf: "Locandina PDF",
  image: "Locandina",
  none: "Evento",
};

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-10 w-3/4 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
      </div>
      <div className="h-[480px] rounded-xl bg-muted" />
    </div>
  );
}

export function EventDetailClient({ id }: { id: string }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getEventById(id)
      .then((e) => {
        if (!e) setNotFound(true);
        else setEvent(e);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-6 pt-24 pb-20">
        <DetailSkeleton />
      </main>
    );
  }

  if (notFound || !event) {
    return (
      <main className="mx-auto max-w-3xl px-6 pt-24 pb-20 flex flex-col items-center gap-6 text-center">
        <Calendar className="w-12 h-12 text-muted-foreground/30 mt-12" />
        <h1 className="font-heading text-2xl text-foreground">Evento non trovato</h1>
        <p className="text-muted-foreground">
          Questo evento potrebbe essere stato rimosso o non esiste.
        </p>
        <Link href="/#agenda" className={cn(buttonVariants(), "gap-2")}>
          <ArrowLeft className="w-4 h-4" />
          Torna all&apos;agenda
        </Link>
      </main>
    );
  }

  const FlyerIcon = flyerIcons[event.flyerType];

  return (
    <main className="mx-auto max-w-3xl px-6 pt-24 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="space-y-8"
      >
        {/* Back link */}
        <Link
          href="/#agenda"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna all&apos;agenda
        </Link>

        {/* Header */}
        <header className="space-y-4">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 text-primary border-primary/30">
              <Calendar className="w-3 h-3" />
              {formatFullDate(event.date)}
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <Clock className="w-3 h-3" />
              {formatTime(event.date)}
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <FlyerIcon className="w-3 h-3" />
              {flyerLabels[event.flyerType]}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl leading-tight text-foreground">
            {event.title}
          </h1>

          {/* Short description */}
          {event.description && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          )}
        </header>

        <Separator className="opacity-40" />

        {/* Content section */}
        <section>
          {event.flyerType === "pdf" && event.flyerUrl && (
            <PdfViewer url={event.flyerUrl} title={event.title} />
          )}

          {event.flyerType === "image" && event.flyerUrl && (
            <ImageViewer url={event.flyerUrl} title={event.title} />
          )}

          {event.flyerType === "none" && event.detailedText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="prose prose-invert prose-lg max-w-none"
            >
              <div className="text-foreground/90 leading-[1.85] text-[1.0625rem] whitespace-pre-wrap">
                {event.detailedText}
              </div>
            </motion.div>
          )}

          {event.flyerType === "none" && !event.detailedText && (
            <p className="text-muted-foreground italic">
              Nessun dettaglio aggiuntivo disponibile.
            </p>
          )}
        </section>

        {/* Zoom CTA (per-event) */}
        {event.zoomUrl && (
          <>
            <Separator className="opacity-40" />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 rounded-2xl border border-primary/20 bg-primary/5"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">Partecipa online</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Unisciti a questo evento tramite Zoom
                </p>
              </div>
              <a
                href={event.zoomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants(),
                  "gap-2 shadow-lg shadow-primary/20 whitespace-nowrap"
                )}
              >
                <Video className="w-4 h-4" />
                Apri Zoom
              </a>
            </motion.div>
          </>
        )}
      </motion.div>
    </main>
  );
}
