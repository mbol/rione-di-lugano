"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Bell, CalendarDays } from "lucide-react";
import { EventList } from "./EventList";
import { CalendarioView } from "./CalendarioView";
import type { EventCategory } from "@/lib/types";

type Tab = EventCategory | "calendario";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "sacramentale", label: "Sacramentale", icon: Star },
  { id: "annunci",      label: "Annunci",       icon: Bell },
  { id: "calendario",  label: "Calendario",    icon: CalendarDays },
];

export function AgendaSection() {
  const [active, setActive] = useState<Tab>("calendario");
  const prevIdx = useRef(TABS.findIndex((t) => t.id === "calendario"));

  function handleTab(id: Tab) {
    prevIdx.current = TABS.findIndex((t) => t.id === active);
    setActive(id);
  }

  const direction =
    TABS.findIndex((t) => t.id === active) > prevIdx.current ? 1 : -1;

  return (
    <section id="agenda">
      {/* Sticky tab bar — hugs under the fixed navbar (top-16 = 64px) */}
      <div className="sticky top-16 z-40 bg-white border-b border-border shadow-sm">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTab(id)}
                className={`relative flex flex-1 items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
                  active === id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden text-xs">{label}</span>

                {/* Animated underline */}
                {active === id && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-12">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={active}
            custom={direction}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {active === "sacramentale" && <EventList category="sacramentale" />}
            {active === "annunci"      && <EventList category="annunci" />}
            {active === "calendario"   && <CalendarioView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
