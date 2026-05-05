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
      style={{ background: "linear-gradient(160deg, oklch(0.92 0.05 252) 0%, oklch(0.97 0.02 250) 100%)" }}
    >
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-8 sm:py-10 flex flex-col items-center text-center gap-3">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-sm font-semibold tracking-widest uppercase text-blue-600"
        >
          Rione di Lugano
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="font-heading text-2xl sm:text-3xl md:text-4xl leading-snug text-gray-900 max-w-xl"
        >
          Chiesa di Gesù Cristo dei Santi degli Ultimi Giorni
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="text-sm text-gray-500"
        >
          <a
            href="https://maps.app.goo.gl/XTyWiNNwmzYPuHmW6"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors"
          >
            Via alla Bozzoreda 27 · 6963 Pregassona
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="mt-1 bg-white/80 rounded-xl px-6 py-4 border border-blue-100 shadow-sm w-full max-w-xs"
        >
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2.5">
            Riunioni domenicali
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <div className="text-right font-medium text-gray-800">9:30 – 10:30</div>
            <div className="text-left text-gray-500">Sacramentale</div>
            <div className="text-right font-medium text-gray-800">10:40 – 11:30</div>
            <div className="text-left text-gray-500">Classi</div>
          </div>
        </motion.div>

        {zoomUrl && (
          <motion.a
            href={zoomUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.38 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-1 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-blue-200/60 transition-colors"
          >
            <Video className="w-4 h-4 flex-shrink-0" />
            Partecipa alla Riunione
          </motion.a>
        )}
      </div>

    </section>
  );
}
