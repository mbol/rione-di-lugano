import type { Timestamp } from "firebase/firestore";

export type FlyerType = "pdf" | "image" | "none";
export type EventCategory = "sacramentale" | "annunci" | "generale";

export interface Event {
  id: string;
  title: string;
  description: string;
  detailedText?: string;
  date: Timestamp;
  flyerType: FlyerType;
  flyerUrl?: string;
  flyerPath?: string;
  zoomUrl?: string;
  category: EventCategory;
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type EventInput = Omit<Event, "id" | "createdAt" | "updatedAt">;
