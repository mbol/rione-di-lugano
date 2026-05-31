import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDocsFromServer,
  doc,
  getDocFromServer,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Event, EventInput } from "./types";

function toEvent(id: string, data: Record<string, unknown>): Event {
  return { category: "generale", ...data, id } as Event;
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function hasFlyer(event: Event) {
  return event.flyerType !== "none" && !!event.flyerUrl;
}

function sortForCategoryPage(events: Event[]): Event[] {
  const today = startOfToday().getTime();

  return [...events].sort((a, b) => {
    const aTime = a.date.toDate().getTime();
    const bTime = b.date.toDate().getTime();
    const aUpcoming = aTime >= today;
    const bUpcoming = bTime >= today;

    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
    return aUpcoming ? aTime - bTime : bTime - aTime;
  });
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const today = startOfToday();

  const q = query(
    collection(db, "events"),
    where("published", "==", true),
    where("date", ">=", Timestamp.fromDate(today)),
    orderBy("date", "asc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toEvent(d.id, d.data()));
}

export async function getPublishedEvents(): Promise<Event[]> {
  const q = query(
    collection(db, "events"),
    where("published", "==", true),
    orderBy("date", "asc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toEvent(d.id, d.data()));
}

export async function getCategoryEvents(category: Event["category"]): Promise<Event[]> {
  const today = startOfToday().getTime();

  const q = query(
    collection(db, "events"),
    where("published", "==", true),
    where("category", "==", category)
  );

  const snapshot = await getDocs(q);
  const events = snapshot.docs.map((d) => toEvent(d.id, d.data()));

  return sortForCategoryPage(
    events.filter((event) => {
      const isTodayOrFuture = event.date.toDate().getTime() >= today;
      if (isTodayOrFuture) return true;
      return category === "sacramentale" && hasFlyer(event);
    })
  );
}

export async function getAllEvents(): Promise<Event[]> {
  const q = query(collection(db, "events"), orderBy("date", "desc"));
  const snapshot = await getDocsFromServer(q);
  return snapshot.docs.map((d) => toEvent(d.id, d.data()));
}

export async function getEventById(id: string): Promise<Event | null> {
  const snap = await getDocFromServer(doc(db, "events", id));
  if (!snap.exists()) return null;
  return toEvent(snap.id, snap.data());
}

export async function createEvent(input: EventInput): Promise<string> {
  const ref = await addDoc(collection(db, "events"), {
    ...stripUndefined(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateEvent(id: string, input: Partial<EventInput>): Promise<void> {
  await updateDoc(doc(db, "events", id), {
    ...stripUndefined(input),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, "events", id));
}
