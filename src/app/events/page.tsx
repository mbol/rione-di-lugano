import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { EventDetailWrapper } from "@/components/events/EventDetailWrapper";

function LoadingSkeleton() {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-24 pb-20 space-y-6 animate-pulse">
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="h-6 w-36 rounded-full bg-muted" />
          <div className="h-6 w-20 rounded-full bg-muted" />
        </div>
        <div className="h-10 w-3/4 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
      </div>
      <div className="h-[480px] rounded-xl bg-muted" />
    </main>
  );
}

export default function EventsPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<LoadingSkeleton />}>
        <EventDetailWrapper />
      </Suspense>
      <footer className="border-t border-border py-8 px-6 text-center text-xs text-muted-foreground/50">
        © {new Date().getFullYear()} Rione di Lugano
      </footer>
    </>
  );
}
