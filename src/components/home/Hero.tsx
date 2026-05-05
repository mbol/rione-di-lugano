"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Video } from "lucide-react";
import { getSettings } from "@/lib/settings";

export function Hero() {
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);

  useEffect(() => {
    getSettings().then((s) => setZoomUrl(s.zoomUrl || null));
  }, []);

  return (
    <section
      className="relative pt-16 overflow-hidden"
      style={{ background: "linear-gradient(135deg, oklch(0.20 0.10 255) 0%, oklch(0.28 0.13 252) 100%)" }}
    >
      {/* Subtle radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 100%, oklch(0.48 0.22 252 / 18%) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-14 sm:py-20 flex flex-col items-center text-center gap-5">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="font-heading text-3xl sm:text-4xl md:text-5xl leading-tight text-white"
        >
          Chiesa di Gesù Cristo dei Santi degli Ultimi Giorni
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl sm:text-2xl text-blue-200 font-semibold"
        >
          Rione di Lugano
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.32 }}
          className="text-base sm:text-lg text-blue-100/90 max-w-xl leading-relaxed space-y-1"
        >
          <div>
            <a
              href="https://maps.app.goo.gl/XTyWiNNwmzYPuHmW6"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-200"
            >
              Via alla Bozzoreda 27<br />6963 Pregassona
            </a>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.38 }}
          className="bg-blue-400/30 rounded-xl px-6 py-4 mt-2 text-blue-900 shadow-lg w-full max-w-md border border-blue-200"
        >
          <div className="font-heading font-semibold text-lg mb-2 text-white">Riunioni domenicali:</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-base">
            <div className="text-right text-white">9:30 – 10:30</div>
            <div className="text-left text-white">Sacramentale</div>
            <div className="text-right text-white">10:40 – 11:30</div>
            <div className="text-left text-white">Classi</div>
          </div>
        </motion.div>

        {zoomUrl && (
          <motion.a
            href={zoomUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.46 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="mt-2 inline-flex items-center gap-3 bg-[oklch(0.55_0.24_252)] hover:bg-[oklch(0.60_0.24_252)] text-white text-base sm:text-lg font-semibold px-8 sm:px-10 py-4 rounded-2xl shadow-xl shadow-blue-900/40 transition-colors"
          >
            <Video className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            Partecipa alla Riunione
          </motion.a>
        )}
      </div>

      {/* Bottom wave divider */}
      <div className="relative h-10 overflow-hidden">
        <svg
          viewBox="0 0 1440 40"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          style={{ fill: "oklch(0.97 0.003 255)" }}
        >
          <path d="M0,40 C360,0 1080,0 1440,40 L1440,40 L0,40 Z" />
        </svg>
      </div>
    </section>
  );
}
