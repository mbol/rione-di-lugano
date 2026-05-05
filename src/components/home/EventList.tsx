"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarX } from "lucide-react";
import { EventCard } from "./EventCard";
import { getUpcomingEvents } from "@/lib/events";
import type { Event } from "@/lib/types";

function EventSkeleton() {
  return (
    <div className="flex gap-5 p-5 sm:p-6 rounded-2xl border border-border bg-card animate-pulse">
      <div className="flex-shrink-0 w-14 sm:w-16 flex flex-col items-center gap-2">
        <div className="h-10 w-10 rounded bg-muted" />
        <div className="h-3 w-8 rounded bg-muted" />
      </div>
      <div className="w-px self-stretch bg-border" />
      <div className="flex-1 space-y-2.5 py-1">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-5 w-3/4 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
      </div>
    </div>
  );
}

export function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getUpcomingEvents()
      .then(setEvents)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      id="agenda"
      className="py-16 sm:py-24 px-6"
    >
      <div className="mx-auto max-w-3xl">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-14"
        >
          <p className="text-xs uppercase tracking-widest text-primary font-medium mb-2">
            Agenda
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl text-foreground">
            Prossimi Appuntamenti
          </h2>
        </motion.div>

        {/* List */}
        {loading && (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <EventSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16 text-muted-foreground">
            <p>Impossibile caricare gli appuntamenti. Riprova più tardi.</p>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-20 text-muted-foreground"
          >
            <CalendarX className="w-10 h-10 opacity-40" />
            <p className="text-lg font-heading">Nessun appuntamento in programma</p>
            <p className="text-sm text-center max-w-xs">
              Gli eventi futuri appariranno qui non appena saranno aggiunti.
            </p>
          </motion.div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="space-y-4">
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
