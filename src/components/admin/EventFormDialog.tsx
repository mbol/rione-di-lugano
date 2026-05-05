"use client";

import { useEffect, useRef, useState, type FormEvent, type ChangeEvent } from "react";
import { Timestamp } from "firebase/firestore";
import { FileText, ImageIcon, Calendar, Upload, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { createEvent, updateEvent } from "@/lib/events";
import { uploadFlyer, deleteFlyer } from "@/lib/storage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { extractTextFromFlyer, parseOcrSuggestion, hasAnySuggestion, type OcrSuggestion } from "@/lib/ocr";
import { OcrStatus, OcrSuggestions } from "./OcrSuggestions";
import type { Event, FlyerType } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  event?: Event | null;
}

function tpDate(ts: Timestamp) {
  const d = ts.toDate();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function tpTime(ts: Timestamp) {
  const d = ts.toDate();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const flyerOptions: { value: FlyerType; label: string; icon: React.ElementType }[] = [
  { value: "none", label: "Solo testo", icon: Calendar },
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "image", label: "Immagine", icon: ImageIcon },
];

const ACCEPTED = { pdf: "application/pdf", image: "image/jpeg,image/png,image/webp" };

export function EventFormDialog({ open, onClose, onSaved, event }: Props) {
  const isEdit = !!event;
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [detailedText, setDetailedText] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("19:00");
  const [flyerType, setFlyerType] = useState<FlyerType>("none");
  const [zoomUrl, setZoomUrl] = useState("");
  const [published, setPublished] = useState(false);

  // File upload state
  const [newFile, setNewFile] = useState<File | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // OCR state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrSuggestion, setOcrSuggestion] = useState<OcrSuggestion | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (open) {
      if (event) {
        setTitle(event.title);
        setDescription(event.description ?? "");
        setDetailedText(event.detailedText ?? "");
        setDateStr(tpDate(event.date));
        setTimeStr(tpTime(event.date));
        setFlyerType(event.flyerType);
        setZoomUrl(event.zoomUrl ?? "");
        setPublished(event.published);
      } else {
        const today = new Date();
        setTitle("");
        setDescription("");
        setDetailedText("");
        setDateStr(tpDate(Timestamp.fromDate(today)));
        setTimeStr("19:00");
        setFlyerType("none");
        setZoomUrl("");
        setPublished(false);
      }
      setNewFile(null);
      setRemoveExisting(false);
      setUploadProgress(null);
      setOcrSuggestion(null);
      setOcrLoading(false);
    }
  }, [open, event]);

  // When flyerType changes to "none", clear any file selection
  useEffect(() => {
    if (flyerType === "none") {
      setNewFile(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [flyerType]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setNewFile(file);
    setOcrSuggestion(null);
    if (file) {
      setRemoveExisting(false);
      runOcr(file);
    }
  }

  async function runOcr(file: File) {
    setOcrLoading(true);
    setOcrMessage("Analisi locandina…");
    setOcrProgress(0);
    try {
      const text = await extractTextFromFlyer(file, (msg, pct) => {
        setOcrMessage(msg);
        setOcrProgress(pct);
      });
      const suggestion = parseOcrSuggestion(text);
      if (hasAnySuggestion(suggestion)) setOcrSuggestion(suggestion);
    } catch {
      // OCR is best-effort; silently ignore errors
    } finally {
      setOcrLoading(false);
    }
  }

  function applyOcrAll() {
    if (!ocrSuggestion) return;
    if (ocrSuggestion.date) setDateStr(ocrSuggestion.date);
    if (ocrSuggestion.time) setTimeStr(ocrSuggestion.time);
    if (ocrSuggestion.title && !title) setTitle(ocrSuggestion.title);
    setOcrSuggestion(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dateStr || !timeStr) {
      toast.error("Compila tutti i campi obbligatori.");
      return;
    }
    setSaving(true);
    setUploadProgress(null);

    try {
      let flyerUrl: string | undefined = isEdit ? event?.flyerUrl : undefined;
      let flyerPath: string | undefined = isEdit ? event?.flyerPath : undefined;

      // Delete old flyer if replacing or explicitly removing
      if ((removeExisting || newFile) && isEdit && event?.flyerPath) {
        await deleteFlyer(event.flyerPath);
        flyerUrl = undefined;
        flyerPath = undefined;
      }

      // Upload new file
      if (newFile && flyerType !== "none") {
        setUploadProgress(0);
        const result = await uploadFlyer(newFile, setUploadProgress);
        flyerUrl = result.url;
        flyerPath = result.path;
      }

      // Clear flyer fields if type is none
      if (flyerType === "none") {
        flyerUrl = undefined;
        flyerPath = undefined;
      }

      // Build Timestamp
      const [y, mo, d] = dateStr.split("-").map(Number);
      const [h, mi] = timeStr.split(":").map(Number);
      const date = Timestamp.fromDate(new Date(y, mo - 1, d, h, mi));

      const input = {
        title: title.trim(),
        description: description.trim(),
        detailedText: detailedText.trim() || undefined,
        date,
        flyerType,
        flyerUrl,
        flyerPath,
        zoomUrl: zoomUrl.trim() || undefined,
        published,
      };

      if (isEdit && event) {
        await updateEvent(event.id, input);
        toast.success("Evento aggiornato con successo.");
      } else {
        await createEvent(input);
        toast.success("Evento creato con successo.");
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("[save error]", err);
      toast.error("Errore durante il salvataggio. Riprova.");
    } finally {
      setSaving(false);
      setUploadProgress(null);
    }
  }

  const hasExistingFlyer = isEdit && event?.flyerUrl && !removeExisting && !newFile;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {isEdit ? "Modifica Evento" : "Nuovo Evento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="ef-title">Titolo *</Label>
            <Input
              id="ef-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Riunione mensile"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="ef-desc">Descrizione breve</Label>
            <Input
              id="ef-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Una riga di presentazione"
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ef-date">Data *</Label>
              <Input
                id="ef-date"
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ef-time">Orario *</Label>
              <Input
                id="ef-time"
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                required
              />
            </div>
          </div>

          <Separator className="opacity-40" />

          {/* Flyer type */}
          <div className="space-y-2">
            <Label>Tipo di locandina</Label>
            <div className="flex gap-2">
              {flyerOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFlyerType(value)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-xs font-medium transition-all ${
                    flyerType === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* File upload (pdf / image) */}
          {flyerType !== "none" && (
            <div className="space-y-2">
              <Label>File locandina</Label>

              {/* Existing flyer indicator */}
              {hasExistingFlyer && (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="flex-1 text-foreground truncate">Locandina già caricata</span>
                  <button
                    type="button"
                    onClick={() => setRemoveExisting(true)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Rimuovi locandina"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* File input */}
              {!hasExistingFlyer && (
                <div
                  className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors cursor-pointer"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  {newFile ? (
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">{newFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(newFile.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Clicca per selezionare
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {flyerType === "pdf" ? "PDF" : "JPG, PNG, WebP"} — max 10 MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPTED[flyerType]}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {/* Upload progress */}
              {uploadProgress !== null && (
                <div className="space-y-1">
                  <Progress value={uploadProgress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground text-right">
                    {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}

              {/* OCR status */}
              {ocrLoading && (
                <OcrStatus message={ocrMessage} progress={ocrProgress} />
              )}

              {/* OCR suggestions */}
              {!ocrLoading && ocrSuggestion && (
                <OcrSuggestions
                  suggestion={ocrSuggestion}
                  onApplyDate={(d) => { setDateStr(d); setOcrSuggestion((s) => s ? { ...s, date: undefined } : null); }}
                  onApplyTime={(t) => { setTimeStr(t); setOcrSuggestion((s) => s ? { ...s, time: undefined } : null); }}
                  onApplyTitle={(t) => { setTitle(t); setOcrSuggestion((s) => s ? { ...s, title: undefined } : null); }}
                  onApplyAll={applyOcrAll}
                  onDismiss={() => setOcrSuggestion(null)}
                />
              )}
            </div>
          )}

          <Separator className="opacity-40" />

          {/* Detailed text */}
          <div className="space-y-1.5">
            <Label htmlFor="ef-body">Testo dettagliato</Label>
            <Textarea
              id="ef-body"
              value={detailedText}
              onChange={(e) => setDetailedText(e.target.value)}
              placeholder="Descrizione completa dell'evento (opzionale)"
              className="min-h-[100px] resize-y"
            />
          </div>

          {/* Zoom URL */}
          <div className="space-y-1.5">
            <Label htmlFor="ef-zoom">Link Zoom (opzionale)</Label>
            <Input
              id="ef-zoom"
              type="url"
              value={zoomUrl}
              onChange={(e) => setZoomUrl(e.target.value)}
              placeholder="https://zoom.us/j/..."
            />
          </div>

          {/* Published toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-foreground">Pubblicato</p>
              <p className="text-xs text-muted-foreground">
                Visibile sul sito pubblico
              </p>
            </div>
            <Switch
              checked={published}
              onCheckedChange={setPublished}
              aria-label="Pubblicato"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="flex-1"
            >
              Annulla
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving
                ? uploadProgress !== null
                  ? "Caricamento…"
                  : "Salvataggio…"
                : isEdit
                ? "Salva modifiche"
                : "Crea evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
