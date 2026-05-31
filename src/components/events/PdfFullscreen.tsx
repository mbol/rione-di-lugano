"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface Props {
  url: string;
  page: number;
  onNumPages: (n: number) => void;
}

export function PdfFullscreen({ url, page, onNumPages }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setDims({
        w: Math.floor(entry.contentRect.width),
        h: Math.floor(entry.contentRect.height),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // For portrait A4 (aspect ≈ 0.707), use height when the container is wide
  // enough; otherwise constrain by width to avoid horizontal overflow.
  const sizeProp: { width?: number; height?: number } =
    dims.w > 0 && dims.h > 0
      ? dims.w >= dims.h * 0.75
        ? { height: dims.h }
        : { width: dims.w }
      : {};

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
    >
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => onNumPages(numPages)}
        loading={null}
        error={
          <p className="text-white/50 text-sm">Impossibile caricare il PDF.</p>
        }
      >
        {sizeProp.width !== undefined || sizeProp.height !== undefined ? (
          <Page
            pageNumber={page}
            {...sizeProp}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        ) : null}
      </Document>
    </div>
  );
}
