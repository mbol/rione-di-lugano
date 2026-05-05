import type { Timestamp } from "firebase/firestore";

export type FlyerType = "pdf" | "image" | "none";

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
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type EventInput = Omit<Event, "id" | "createdAt" | "updatedAt">;
