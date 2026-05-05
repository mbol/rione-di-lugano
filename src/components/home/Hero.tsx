"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Video } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSettings } from "@/lib/settings";

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

function FadeIn({ delay, children, className }: { delay: number; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={fade.hidden}
      animate={fade.show}
      transition={{ duration: 0.6, delay, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);

  useEffect(() => {
    getSettings().then((s) => setZoomUrl(s.zoomUrl || null));
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] pt-16 pb-24 px-6 overflow-hidden">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[700px] h-[700px] rounded-full bg-primary/5 blur-3xl" />
      </div>
      {/* Second soft glow offset */}
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-end justify-start">
        <div className="w-[400px] h-[400px] rounded-full bg-primary/3 blur-3xl -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto gap-6">
        <FadeIn delay={0.15}>
          <p className="text-xs uppercase tracking-widest text-primary font-medium">
            Comunità — Lugano
          </p>
        </FadeIn>

        <FadeIn delay={0.28}>
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl leading-[1.1] text-foreground">
            Rione di Lugano
          </h1>
        </FadeIn>

        <FadeIn delay={0.42}>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
            Benvenuti nel sito ufficiale del Rione di Lugano.
            Consulta l&apos;agenda degli appuntamenti e unisciti alle nostre attività.
          </p>
        </FadeIn>

        {/* Zoom CTA — shown once settings resolve and URL is present */}
        {zoomUrl && (
          <FadeIn delay={0.56}>
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <a
                href={zoomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 px-8 py-6 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 font-semibold"
                )}
              >
                <Video className="w-5 h-5" />
                Unisciti alla Riunione Zoom
              </a>
            </motion.div>
          </FadeIn>
        )}

        <FadeIn delay={0.70}>
          <div className="flex flex-col items-center gap-2 mt-8 text-muted-foreground/50">
            <span className="text-xs uppercase tracking-widest">Prossimi appuntamenti</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" as const }}
              className="w-px h-8 bg-gradient-to-b from-muted-foreground/40 to-transparent"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
