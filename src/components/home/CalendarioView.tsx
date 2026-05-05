"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarX } from "lucide-react";
import { EventCard } from "./EventCard";
import { getUpcomingEvents } from "@/lib/events";
import type { Event } from "@/lib/types";

function groupByMonth(events: Event[]): { label: string; events: Event[] }[] {
  const groups = new Map<string, Event[]>();
  for (const e of events) {
    const d = e.date.toDate();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }
  return Array.from(groups.entries()).map(([, evts]) => {
    const d = evts[0].date.toDate();
    const label = d.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
    return {
      label: label.charAt(0).toUpperCase() + label.slice(1),
      events: evts,
    };
  });
}

function Skeleton() {
  return (
    <div className="flex gap-5 p-5 rounded-2xl border border-border bg-card animate-pulse">
      <div className="flex-shrink-0 w-14 flex flex-col items-center gap-2">
        <div className="h-10 w-10 rounded bg-muted" />
        <div className="h-3 w-8 rounded bg-muted" />
      </div>
      <div className="w-px self-stretch bg-border" />
      <div className="flex-1 space-y-2.5 py-1">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-5 w-3/4 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
      </div>
    </div>
  );
}

export function CalendarioView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getUpcomingEvents()
      .then(setEvents)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => <Skeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center py-16 text-muted-foreground">
        Impossibile caricare gli appuntamenti. Riprova più tardi.
      </p>
    );
  }

  if (!events.length) {
    return (
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
    );
  }

  const groups = groupByMonth(events);

  return (
    <div className="space-y-10">
      {groups.map(({ label, events: monthEvents }) => (
        <div key={label}>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest whitespace-nowrap">
              {label}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-3">
            {monthEvents.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
