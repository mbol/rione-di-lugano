"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ChevronRight, FileText, ImageIcon, Calendar, Info, X, Share2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDay, formatMonth, formatTime, formatFullDate } from "@/lib/format";
import type { Event } from "@/lib/types";

const flyerLabels: Record<Event["flyerType"], string> = {
  pdf: "Locandina PDF",
  image: "Locandina",
  none: "Evento",
};

const flyerIcons: Record<Event["flyerType"], React.ElementType> = {
  pdf: FileText,
  image: ImageIcon,
  none: Calendar,
};

interface EventCardProps {
  event: Event;
  index: number;
  linkHref?: string;
  onOpen?: (event: Event) => void;
}

function renderWithLinks(text: string): React.ReactNode[] {
  const parts = text.split(/(https?:\/\/[^\s<>"']+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:text-primary/80 break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}

export function EventCard({ event, index, linkHref, onOpen }: EventCardProps) {
  const [showDesc, setShowDesc] = useState(false);
  const [copied, setCopied] = useState(false);
  const Icon = flyerIcons[event.flyerType];
  const hasFlyer = event.flyerType !== "none" && !!event.flyerUrl;

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/${event.category}?id=${event.id}`;
    if (typeof navigator.share === "function") {
      await navigator.share({ title: event.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }
  const day = formatDay(event.date);
  const month = formatMonth(event.date);
  const time = formatTime(event.date);
  const hasDescription = !!event.detailedText?.trim();

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      >
        <div className="relative group">
          <Link
            href={linkHref ?? `/events?id=${event.id}`}
            className="block"
            onClick={onOpen ? (e) => { e.preventDefault(); onOpen(event); } : undefined}
          >
            <div className="flex gap-5 p-5 sm:p-6 rounded-2xl border border-border bg-card group-hover:border-primary/30 group-hover:bg-card/80 transition-all duration-300">
              {/* Date badge */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 sm:w-16 text-center select-none">
                <span className="text-3xl sm:text-4xl font-heading font-bold text-primary leading-none">
                  {day}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5 font-medium">
                  {month}
                </span>
              </div>

              {/* Vertical divider */}
              <div className="w-px self-stretch bg-border group-hover:bg-primary/20 transition-colors" />

              {/* Content */}
              <div className="flex flex-1 items-start min-w-0">
                <div className="min-w-0 flex-1">
                  {/* Time + type badge */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {time}
                    </span>
                    <Badge variant="outline" className="gap-1 text-[11px] py-0">
                      <Icon className="w-3 h-3" />
                      {flyerLabels[event.flyerType]}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading text-base sm:text-lg text-foreground leading-snug group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>

                  {/* Description */}
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>

                {/* Spacer so content doesn't overlap action buttons */}
                <div className={`flex-shrink-0 ${hasDescription && hasFlyer ? "w-24" : hasDescription || hasFlyer ? "w-16" : "w-7"}`} />
              </div>
            </div>
          </Link>

          {/* Action buttons — siblings of Link, absolutely positioned */}
          <div className="absolute top-1/2 -translate-y-1/2 right-5 sm:right-6 flex items-center gap-1.5 z-10">
            {hasDescription && (
              <button
                onClick={() => setShowDesc(true)}
                aria-label="Informazioni aggiuntive"
                title="Mostra informazioni aggiuntive"
                className="flex items-center justify-center w-9 h-9 rounded-full text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Info className="w-5 h-5" />
              </button>
            )}
            {hasFlyer && (
              <button
                onClick={handleShare}
                aria-label="Condividi locandina"
                title="Condividi link locandina"
                className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
              </button>
            )}
            <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </motion.article>

      {/* Description modal */}
      {hasDescription && showDesc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowDesc(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-card rounded-2xl border border-border shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDesc(false)}
              aria-label="Chiudi"
              className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="pr-8 mb-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                {formatFullDate(event.date)} · {time}
              </p>
              <h2 className="font-heading text-xl text-foreground leading-snug">
                {event.title}
              </h2>
            </div>

            <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
              {renderWithLinks(event.detailedText!)}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
