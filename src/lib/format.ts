import type { Timestamp } from "firebase/firestore";

const LOCALE = "it-IT";

export function formatDay(ts: Timestamp): string {
  return ts.toDate().toLocaleDateString(LOCALE, { day: "numeric" });
}

export function formatMonth(ts: Timestamp): string {
  return ts.toDate().toLocaleDateString(LOCALE, { month: "short" }).replace(".", "");
}

export function formatYear(ts: Timestamp): string {
  return ts.toDate().toLocaleDateString(LOCALE, { year: "numeric" });
}

export function formatTime(ts: Timestamp): string {
  return ts.toDate().toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
}

export function formatFullDate(ts: Timestamp): string {
  return ts.toDate().toLocaleDateString(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(ts: Timestamp): string {
  return ts.toDate().toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
