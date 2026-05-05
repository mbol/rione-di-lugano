import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface GlobalSettings {
  zoomUrl?: string;
}

export async function getSettings(): Promise<GlobalSettings> {
  try {
    const snap = await getDoc(doc(db, "settings", "global"));
    return snap.exists() ? (snap.data() as GlobalSettings) : {};
  } catch {
    return {};
  }
}

export async function saveSettings(settings: Partial<GlobalSettings>): Promise<void> {
  await setDoc(doc(db, "settings", "global"), settings, { merge: true });
}
