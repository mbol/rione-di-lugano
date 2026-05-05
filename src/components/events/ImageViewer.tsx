"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

interface ImageViewerProps {
  url: string;
  title?: string;
}

export function ImageViewer({ url, title }: ImageViewerProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end px-1">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Apri originale
        </a>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="overflow-hidden rounded-xl border border-border shadow-lg bg-card"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={title ?? "Locandina evento"}
          className="w-full h-auto max-h-[80vh] object-contain"
        />
      </motion.div>
    </div>
  );
}
