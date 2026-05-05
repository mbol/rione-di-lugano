"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getUpcomingEvents, getEventById } from "@/lib/events";
import { FlyerFullscreen } from "./FlyerFullscreen";
import type { Event } from "@/lib/types";

export function EventDetailWrapper() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [events, setEvents] = useState<Event[]>([]);
  const [initialIdx, setInitialIdx] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!id) { window.location.href = "/#agenda"; return; }

    Promise.all([getUpcomingEvents(), getEventById(id)])
      .then(([upcoming, current]) => {
        if (!current) { window.location.href = "/#agenda"; return; }

        const flyerEvents = upcoming.filter(
          (e) => e.flyerType !== "none" && e.flyerUrl
        );
        const idx = flyerEvents.findIndex((e) => e.id === id);

        if (idx >= 0) {
          setEvents(flyerEvents);
          setInitialIdx(idx);
        } else if (current.flyerType !== "none" && current.flyerUrl) {
          setEvents([current]);
          setInitialIdx(0);
        } else {
          window.location.href = "/#agenda";
          return;
        }
        setReady(true);
      })
      .catch(() => { window.location.href = "/#agenda"; });
  }, [id]);

  if (!ready) return <div className="fixed inset-0 bg-black" />;

  return <FlyerFullscreen events={events} initialIndex={initialIdx} />;
}
