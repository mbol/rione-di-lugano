"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { getCategoryEvents } from "@/lib/events";
import { EventList } from "@/components/home/EventList";
import { FlyerFullscreen } from "./FlyerFullscreen";
import type { Event, EventCategory } from "@/lib/types";

interface Props {
  category: EventCategory;
}

export function CategoryPageClient({ category }: Props) {
  const params = useSearchParams();
  const pathname = usePathname();

  const [events, setEvents] = useState<Event[]>([]);
  const [ready, setReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(() => params.get("id") ?? "");
  // showList starts true unless ?open or ?id= is in the URL
  const [showList, setShowList] = useState(
    () => !params.has("open") && !params.get("id")
  );

  useEffect(() => {
    getCategoryEvents(category)
      .then(setEvents)
      .catch(() => {})
      .finally(() => setReady(true));
  }, [category]);

  const flyerEvents = useMemo(
    () => events.filter((e) => e.flyerType !== "none" && e.flyerUrl),
    [events]
  );

  // Resolve the index to display:
  // - user-selected id   → that event
  // - no selection yet   → auto-open the first flyer
  // - showList is true   → -1 (show the list)
  const selectedIdx = useMemo(() => {
    if (!ready || showList) return -1;
    if (selectedId) {
      const found = flyerEvents.findIndex((e) => e.id === selectedId);
      if (found >= 0) return found;
      // stale/bad id: fall through to auto-open
    }
    return flyerEvents.length > 0 ? 0 : -1;
  }, [ready, showList, selectedId, flyerEvents]);

  const openEvent = (event: Event) => {
    window.history.pushState(null, "", `${pathname}?id=${event.id}`);
    setSelectedId(event.id);
    setShowList(false);
  };

  const handleClose = () => {
    window.history.replaceState(null, "", pathname);
    setSelectedId("");
    setShowList(true); // prevent auto-reopen until user navigates away
  };

  if (!ready) {
    // Only use fullscreen black while loading a flyer; use inline for list view
    if (showList) return <div className="py-20 text-center text-sm text-gray-400">Caricamento…</div>;
    return <div className="fixed inset-0 bg-black z-50" />;
  }

  // Show fullscreen (auto-first or user-selected)
  if (selectedIdx >= 0) {
    return (
      <FlyerFullscreen
        events={flyerEvents}
        initialIndex={selectedIdx}
        onClose={handleClose}
      />
    );
  }

  // No flyers in this category, or user pressed X
  return (
    <EventList
      category={category}
      events={events}
      onOpenEvent={openEvent}
    />
  );
}
