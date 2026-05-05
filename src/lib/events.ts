import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Event, EventInput } from "./types";

function toEvent(id: string, data: Record<string, unknown>): Event {
  return { id, ...data } as Event;
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, "events"),
    where("published", "==", true),
    where("date", ">=", Timestamp.fromDate(startOfToday)),
    orderBy("date", "asc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toEvent(d.id, d.data()));
}

export async function getAllEvents(): Promise<Event[]> {
  const q = query(collection(db, "events"), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toEvent(d.id, d.data()));
}

export async function getEventById(id: string): Promise<Event | null> {
  const snap = await getDoc(doc(db, "events", id));
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
