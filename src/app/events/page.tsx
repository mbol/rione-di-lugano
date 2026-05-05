import { Suspense } from "react";
import { EventDetailWrapper } from "@/components/events/EventDetailWrapper";

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
      <EventDetailWrapper />
    </Suspense>
  );
}
