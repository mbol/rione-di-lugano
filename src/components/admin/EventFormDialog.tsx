"use client";

import { useEffect, useRef, useState, type FormEvent, type ChangeEvent, type DragEvent } from "react";
import { Timestamp } from "firebase/firestore";
import { Upload, X, CheckCircle, Star, Bell, LayoutList } from "lucide-react";
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
import type { Event, FlyerType, EventCategory } from "@/lib/types";

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

const ACCEPTED_FLYERS = "application/pdf,image/jpeg,image/png,image/webp";

function detectFlyerType(file: File): Exclude<FlyerType, "none"> | null {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (file.type === "application/pdf" || extension === "pdf") return "pdf";
  if (
    file.type.startsWith("image/") ||
    extension === "jpg" ||
    extension === "jpeg" ||
    extension === "png" ||
    extension === "webp"
  ) {
    return "image";
  }
  return null;
}

export function EventFormDialog({ open, onClose, onSaved, event }: Props) {
  const isEdit = !!event;
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [detailedText, setDetailedText] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("19:00");
  const [category, setCategory] = useState<EventCategory>("generale");
  const [zoomUrl, setZoomUrl] = useState("");
  const [published, setPublished] = useState(false);

  // File upload state
  const [newFile, setNewFile] = useState<File | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const [draggingFlyer, setDraggingFlyer] = useState(false);
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
        setCategory(event.category ?? "generale");
        setZoomUrl(event.zoomUrl ?? "");
        setPublished(event.published);
      } else {
        const today = new Date();
        setTitle("");
        setDescription("");
        setDetailedText("");
        setDateStr(tpDate(Timestamp.fromDate(today)));
        setTimeStr("19:00");
        setCategory("generale");
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

  function selectFlyerFile(file: File | null) {
    setOcrSuggestion(null);

    if (!file) {
      setNewFile(null);
      return;
    }

    const detectedType = detectFlyerType(file);
    if (!detectedType) {
      toast.error("Formato locandina non supportato. Usa PDF, JPG, PNG o WebP.");
      setNewFile(null);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setNewFile(file);
    setRemoveExisting(false);
    runOcr(file);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    selectFlyerFile(e.target.files?.[0] ?? null);
  }

  function handleFlyerDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDraggingFlyer(false);
    selectFlyerFile(e.dataTransfer.files?.[0] ?? null);
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
      let nextFlyerType: FlyerType = isEdit && !removeExisting ? event?.flyerType ?? "none" : "none";

      // Delete old flyer if replacing or explicitly removing
      if ((removeExisting || newFile) && isEdit && event?.flyerPath) {
        await deleteFlyer(event.flyerPath);
        flyerUrl = undefined;
        flyerPath = undefined;
      }

      // Upload new file
      if (newFile) {
        const detectedType = detectFlyerType(newFile);
        if (!detectedType) {
          toast.error("Formato locandina non supportato. Usa PDF, JPG, PNG o WebP.");
          return;
        }
        setUploadProgress(0);
        const result = await uploadFlyer(newFile, setUploadProgress);
        flyerUrl = result.url;
        flyerPath = result.path;
        nextFlyerType = detectedType;
      } else if (removeExisting) {
        nextFlyerType = "none";
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
        flyerType: nextFlyerType,
        flyerUrl,
        flyerPath,
        category,
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
      <DialogContent className="w-[calc(100vw-2rem)] max-w-none sm:w-[95vw] sm:max-w-6xl max-h-[95vh] overflow-y-auto">
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

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <div className="flex gap-1.5">
              {(
                [
                  { value: "generale", label: "Generale", icon: LayoutList },
                  { value: "sacramentale", label: "Sacr.", icon: Star },
                  { value: "annunci", label: "Annunci", icon: Bell },
                ] as { value: EventCategory; label: string; icon: React.ElementType }[]
              ).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  className={`flex-1 min-w-0 flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-[11px] font-medium whitespace-nowrap transition-all ${
                    category === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <Label>File locandina</Label>

              {/* Existing flyer indicator */}
              {hasExistingFlyer && (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="flex-1 text-foreground truncate">Locandina già caricata</span>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors whitespace-nowrap"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Sostituisci
                  </button>
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
                  className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                    draggingFlyer
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40"
                  }`}
                  onClick={() => fileRef.current?.click()}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDraggingFlyer(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = "copy";
                    setDraggingFlyer(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                      setDraggingFlyer(false);
                    }
                  }}
                  onDrop={handleFlyerDrop}
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
                        Clicca o trascina qui la locandina
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        PDF, JPG, PNG o WebP - max 10 MB
                      </p>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept={ACCEPTED_FLYERS}
                onChange={handleFileChange}
                className="hidden"
              />

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
                  onApplyAll={applyOcrAll}
                  onDismiss={() => setOcrSuggestion(null)}
                />
              )}
            </div>

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

          {/* Zoom URL + Published side by side */}
          <div className={`grid grid-cols-1 gap-4 items-end ${isEdit ? "sm:grid-cols-2" : ""}`}>
            {isEdit && (
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
            )}
            <div className="flex items-center justify-between p-3 rounded-xl border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Pubblicato</p>
                <p className="text-xs text-muted-foreground">Visibile sul sito</p>
              </div>
              <Switch
                checked={published}
                onCheckedChange={setPublished}
                aria-label="Pubblicato"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-nowrap gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="flex-1 whitespace-nowrap"
            >
              Annulla
            </Button>
            <Button type="submit" disabled={saving} className="flex-1 whitespace-nowrap">
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
