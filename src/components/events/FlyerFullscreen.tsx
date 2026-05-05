"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Info, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import type { Event } from "@/lib/types";

function renderWithLinks(text: string): React.ReactNode[] {
  const parts = text.split(/(https?:\/\/[^\s<>"']+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-300 underline underline-offset-2 hover:text-blue-200 break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}

const PdfFullscreen = dynamic(
  () => import("./PdfFullscreen").then((m) => ({ default: m.PdfFullscreen })),
  { ssr: false, loading: () => null }
);

interface Props {
  events: Event[];
  initialIndex: number;
  onClose?: () => void;
}

const THRESHOLD = 50;

export function FlyerFullscreen({ events, initialIndex, onClose }: Props) {
  const [idx, setIdx] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfNumPages, setPdfNumPages] = useState(0);
  const [showDesc, setShowDesc] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const event = events[idx];

  useEffect(() => {
    setPdfPage(1);
    setPdfNumPages(0);
    setShowDesc(false);
    const url = new URL(window.location.href);
    url.searchParams.set("id", event.id);
    window.history.replaceState(null, "", url.toString());
  }, [idx, event.id]);

  const goTo = useCallback(
    (next: number) => {
      setDirection(next > idx ? 1 : -1);
      setIdx(next);
    },
    [idx]
  );

  const goLeft = useCallback(() => {
    if (idx > 0) goTo(idx - 1);
  }, [idx, goTo]);

  const goRight = useCallback(() => {
    if (idx < events.length - 1) goTo(idx + 1);
  }, [idx, events.length, goTo]);

  const close = useCallback(() => {
    if (onClose) { onClose(); return; }
    window.history.back();
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goLeft();
      else if (e.key === "ArrowRight") goRight();
      else if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goLeft, goRight, close, event.flyerType, pdfPage, pdfNumPages]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > THRESHOLD) {
      if (dx < 0) goRight();
      else goLeft();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Info (top-left, mirrors Close) */}
      {event.detailedText?.trim() && (
        <button
          onClick={() => setShowDesc((v) => !v)}
          aria-label="Informazioni aggiuntive"
          className="absolute top-4 left-4 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
        >
          <Info className="w-5 h-5" />
        </button>
      )}

      {/* Close */}
      <button
        onClick={close}
        aria-label="Chiudi"
        className="absolute top-4 right-4 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Description overlay */}
      <AnimatePresence>
        {showDesc && (
          <motion.div
            key="desc-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.75)" }}
            onClick={() => setShowDesc(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full max-h-[70vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowDesc(false)}
                aria-label="Chiudi"
                className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="pr-8 mb-4 space-y-0.5">
                <h2 className="font-heading text-lg text-white leading-snug">
                  {event.title}
                </h2>
              </div>

              <div className="text-sm leading-relaxed whitespace-pre-wrap text-white/80">
                {renderWithLinks(event.detailedText!)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prev */}
      {idx > 0 && (
        <button
          onClick={goLeft}
          aria-label="Locandina precedente"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next */}
      {idx < events.length - 1 && (
        <button
          onClick={goRight}
          aria-label="Locandina successiva"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Flyer */}
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={event.id}
          custom={direction}
          initial={{ opacity: 0, x: direction * 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -80 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="w-full h-full flex items-center justify-center"
        >
          {event.flyerType === "pdf" && event.flyerUrl && (
            <PdfFullscreen
              url={event.flyerUrl}
              page={pdfPage}
              onNumPages={setPdfNumPages}
            />
          )}

          {event.flyerType === "image" && event.flyerUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.flyerUrl}
              alt={event.title}
              className="max-w-full max-h-full object-contain select-none"
              draggable={false}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Download */}
      {event.flyerUrl && (
        <button
          onClick={async () => {
            const url = event.flyerUrl!;
            const ext = url.split("?")[0].split(".").pop() ?? (event.flyerType === "pdf" ? "pdf" : "jpg");
            const filename = `${event.title}.${ext}`;
            try {
              const res = await fetch(url);
              const blob = await res.blob();
              const blobUrl = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = blobUrl;
              a.download = filename;
              a.click();
              URL.revokeObjectURL(blobUrl);
            } catch {
              window.open(url, "_blank");
            }
          }}
          aria-label="Scarica locandina"
          className="absolute bottom-4 right-4 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
        >
          <Download className="w-5 h-5" />
        </button>
      )}

      {/* PDF page counter with prev/next */}
      {event.flyerType === "pdf" && pdfNumPages > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-full bg-black/50 text-white/70 text-xs select-none">
          <button
            onClick={() => setPdfPage((p) => Math.max(1, p - 1))}
            disabled={pdfPage <= 1}
            aria-label="Pagina precedente"
            className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="tabular-nums px-1">{pdfPage} / {pdfNumPages}</span>
          <button
            onClick={() => setPdfPage((p) => Math.min(pdfNumPages, p + 1))}
            disabled={pdfPage >= pdfNumPages}
            aria-label="Pagina successiva"
            className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
