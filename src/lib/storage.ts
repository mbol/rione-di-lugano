import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadFlyer(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ url: string; path: string }> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const safeName = file.name.replace(/[^\w.-]/g, "_");
  const path = `flyers/${year}/${month}/${Date.now()}_${safeName}`;

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(ref(storage, path), file);
    task.on(
      "state_changed",
      (snap) => onProgress?.((snap.bytesTransferred / snap.totalBytes) * 100),
      (err) => { console.error("[upload error]", err.code, err.message, err); reject(err); },
      () =>
        getDownloadURL(task.snapshot.ref)
          .then((url) => resolve({ url, path }))
          .catch(reject)
    );
  });
}

export async function deleteFlyer(path: string): Promise<void> {
  try {
    await deleteObject(ref(storage, path));
  } catch {
    // Silently ignore "object not found"
  }
}
