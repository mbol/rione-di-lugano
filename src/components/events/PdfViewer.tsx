"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfViewerProps {
  url: string;
  title?: string;
}

export function PdfViewer({ url, title }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(Math.floor(entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const next = useCallback(() => {
    setDirection(1);
    setPage((p) => Math.min(numPages, p + 1));
  }, [numPages]);

  return (
    <div className="flex flex-col gap-4">
      {/* Download bar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-muted-foreground">
          {numPages > 0 ? `${numPages} ${numPages === 1 ? "pagina" : "pagine"}` : ""}
        </span>
        <a
          href={url}
          download={title ?? "locandina.pdf"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <Download className="w-3.5 h-3.5" />
          Scarica PDF
        </a>
      </div>

      {/* PDF canvas */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border border-border bg-card shadow-lg"
      >
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Document
              file={url}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={
                <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                  Caricamento…
                </div>
              }
              error={
                <div className="flex items-center justify-center h-32 text-destructive text-sm p-6 text-center">
                  Impossibile caricare il PDF. Prova a scaricarlo direttamente.
                </div>
              }
            >
              {containerWidth > 0 && (
                <Page
                  pageNumber={page}
                  width={containerWidth}
                  renderAnnotationLayer
                  renderTextLayer
                />
              )}
            </Document>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Page navigation */}
      {numPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prev}
            disabled={page <= 1}
            aria-label="Pagina precedente"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground tabular-nums">
            {page} / {numPages}
          </span>
          <button
            onClick={next}
            disabled={page >= numPages}
            aria-label="Pagina successiva"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
