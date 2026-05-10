export interface OcrSuggestion {
  date?: string; // "YYYY-MM-DD"
  time?: string; // "HH:MM"
}

const MONTHS_IT: Record<string, number> = {
  gennaio: 1, febbraio: 2, marzo: 3, aprile: 4,
  maggio: 5, giugno: 6, luglio: 7, agosto: 8,
  settembre: 9, ottobre: 10, novembre: 11, dicembre: 12,
  gen: 1, feb: 2, mar: 3, apr: 4, mag: 5, giu: 6,
  lug: 7, ago: 8, set: 9, ott: 10, nov: 11, dic: 12,
};

async function renderPdfFirstPage(file: File): Promise<HTMLCanvasElement> {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
  const { version } = await import("pdfjs-dist") as { version: string };
  GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

  const data = await file.arrayBuffer();
  const pdf = await getDocument({ data }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2.0 });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return canvas;
}

export async function extractTextFromFlyer(
  file: File,
  onProgress?: (msg: string, pct: number) => void
): Promise<string> {
  let source: HTMLCanvasElement | File = file;

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    onProgress?.("Elaborazione PDF...", 10);
    source = await renderPdfFirstPage(file);
  }

  onProgress?.("Caricamento motore OCR...", 20);

  const { createWorker } = await import("tesseract.js");

  const worker = await createWorker("eng", 1, {
    langPath: "https://tessdata.projectnaptha.com/4.0.0",
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") {
        onProgress?.("Riconoscimento testo...", 40 + Math.round(m.progress * 55));
      } else if (m.status === "loading language traineddata") {
        onProgress?.("Caricamento dizionario...", 25 + Math.round(m.progress * 10));
      }
    },
  });

  try {
    const { data } = await worker.recognize(source);
    return data.text;
  } finally {
    await worker.terminate();
  }
}

export function parseOcrSuggestion(text: string): OcrSuggestion {
  const lc = text.toLowerCase();
  const result: OcrSuggestion = {};

  const longDateRe =
    /\b(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(\d{4})\b/;
  const longDate = lc.match(longDateRe);
  if (longDate) {
    const d = longDate[1].padStart(2, "0");
    const m = String(MONTHS_IT[longDate[2]]).padStart(2, "0");
    result.date = `${longDate[3]}-${m}-${d}`;
  } else {
    const shortDate = text.match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})\b/);
    if (shortDate) {
      result.date = `${shortDate[3]}-${shortDate[2].padStart(2, "0")}-${shortDate[1].padStart(2, "0")}`;
    }
  }

  const prefixedTime = lc.match(
    /(?:ore|h\.?\s*|alle\s+)([01]?\d|2[0-3])(?:\s*[:.,h]\s*([0-5]\d))?/
  );
  if (prefixedTime) {
    result.time = `${prefixedTime[1].padStart(2, "0")}:${prefixedTime[2] ?? "00"}`;
  } else {
    const standaloneTime = text.match(/\b([01]?\d|2[0-3])\s*[:.,h]\s*([0-5]\d)\b/i);
    if (standaloneTime) {
      result.time = `${standaloneTime[1].padStart(2, "0")}:${standaloneTime[2]}`;
    }
  }

  return result;
}

export function hasAnySuggestion(s: OcrSuggestion): boolean {
  return !!(s.date || s.time);
}
