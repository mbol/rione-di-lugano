export interface OcrSuggestion {
  date?: string;  // "YYYY-MM-DD"
  time?: string;  // "HH:MM"
  title?: string;
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

  if (file.type === "application/pdf") {
    onProgress?.("Elaborazione PDF…", 10);
    source = await renderPdfFirstPage(file);
  }

  onProgress?.("Caricamento motore OCR…", 20);

  const { createWorker } = await import("tesseract.js");

  const worker = await createWorker("eng", 1, {
    langPath: "https://tessdata.projectnaptha.com/4.0.0",
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") {
        onProgress?.("Riconoscimento testo…", 40 + Math.round(m.progress * 55));
      } else if (m.status === "loading language traineddata") {
        onProgress?.("Caricamento dizionario…", 25 + Math.round(m.progress * 10));
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

  // DATE — long Italian form: "15 gennaio 2025"
  const longDateRe =
    /\b(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(\d{4})\b/;
  const longDate = lc.match(longDateRe);
  if (longDate) {
    const d = longDate[1].padStart(2, "0");
    const m = String(MONTHS_IT[longDate[2]]).padStart(2, "0");
    result.date = `${longDate[3]}-${m}-${d}`;
  } else {
    // DATE — short form: "15/01/2025", "15.01.2025", "15-01-2025"
    const shortDate = text.match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})\b/);
    if (shortDate) {
      result.date = `${shortDate[3]}-${shortDate[2].padStart(2, "0")}-${shortDate[1].padStart(2, "0")}`;
    }
  }

  // TIME — "ore 19:00", "h. 19.00", "alle 19:30", or standalone "19:00"
  const timePrefix = lc.match(/(?:ore|h\.?\s*|alle\s+)(\d{1,2})[:.](\d{2})/);
  if (timePrefix) {
    result.time = `${timePrefix[1].padStart(2, "0")}:${timePrefix[2]}`;
  } else {
    const standalone = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    if (standalone) {
      result.time = `${standalone[1].padStart(2, "0")}:${standalone[2]}`;
    }
  }

  // TITLE — prefer first ALL-CAPS line (common in Italian flyers)
  const SKIP = new Set(["DATA", "ORA", "ORARIO", "DOVE", "QUANDO", "INFO"]);
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 4 && l.length < 90);

  const capsLine = lines.find(
    (l) =>
      l === l.toUpperCase() &&
      /[A-ZÀÈÉÌÒÙ]{4,}/.test(l) &&
      !/^\d/.test(l) &&
      !SKIP.has(l.toUpperCase())
  );
  if (capsLine) {
    result.title = capsLine;
  } else {
    const first = lines.find(
      (l) => l.length > 8 && !/^\d/.test(l) && !SKIP.has(l.toUpperCase())
    );
    if (first) result.title = first.substring(0, 80);
  }

  return result;
}

export function hasAnySuggestion(s: OcrSuggestion): boolean {
  return !!(s.date || s.time || s.title);
}
