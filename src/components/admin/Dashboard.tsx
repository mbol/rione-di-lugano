"use client";

import { useCallback, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, LogOut, Globe, Calendar, FileText, ImageIcon, Star, Bell, LayoutList } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { getAllEvents, deleteEvent } from "@/lib/events";
import { deleteFlyer } from "@/lib/storage";
import { getSettings, saveSettings } from "@/lib/settings";
import { formatShortDate, formatTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EventFormDialog } from "./EventFormDialog";
import type { Event } from "@/lib/types";

const typeIcon = { pdf: FileText, image: ImageIcon, none: Calendar };
const typeLabel = { pdf: "PDF", image: "Immagine", none: "Testo" };
const categoryIcon = { sacramentale: Star, annunci: Bell, generale: LayoutList };
const categoryLabel = { sacramentale: "Sacr.", annunci: "Annunci", generale: "Generale" };

export function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Event | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Settings state
  const [globalZoomUrl, setGlobalZoomUrl] = useState("");
  const [savingZoom, setSavingZoom] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllEvents();
      setEvents(data);
    } catch {
      toast.error("Impossibile caricare gli eventi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    getSettings().then((s) => setGlobalZoomUrl(s.zoomUrl ?? ""));
  }, [refresh]);

  async function handleSaveZoom() {
    setSavingZoom(true);
    try {
      await saveSettings({ zoomUrl: globalZoomUrl.trim() || undefined });
      toast.success("Impostazioni salvate.");
    } catch {
      toast.error("Errore nel salvataggio delle impostazioni.");
    } finally {
      setSavingZoom(false);
    }
  }

  function openCreate() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(event: Event) {
    setEditTarget(event);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.flyerPath) await deleteFlyer(deleteTarget.flyerPath);
      await deleteEvent(deleteTarget.id);
      toast.success("Evento eliminato.");
      setDeleteTarget(null);
      refresh();
    } catch {
      toast.error("Errore durante l'eliminazione.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
          <span className="font-heading text-base text-foreground">
            Rione di Lugano — Admin
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              Sito pubblico
            </Link>
            <Separator orientation="vertical" className="h-4 opacity-40" />
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Esci
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 mx-auto max-w-6xl w-full px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl text-foreground">Gestione Eventi</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {events.length} {events.length === 1 ? "evento" : "eventi"} totali
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuovo Evento
          </Button>
        </div>

        {/* Events table */}
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-24 text-muted-foreground"
          >
            <Calendar className="w-10 h-10 opacity-30" />
            <p className="font-heading text-lg">Nessun evento ancora</p>
            <p className="text-sm">Crea il tuo primo evento con il pulsante in alto.</p>
          </motion.div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Data</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Titolo</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium hidden sm:table-cell">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">Categoria</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium hidden lg:table-cell">Stato</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-muted-foreground font-medium">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, i) => {
                  const Icon = typeIcon[event.flyerType];
                  const isPast = event.date.toDate() < new Date();
                  return (
                    <motion.tr
                      key={event.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.04 }}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        <span className={isPast ? "opacity-50" : ""}>{formatShortDate(event.date)}</span>
                        <span className="block text-xs opacity-60">{formatTime(event.date)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground line-clamp-1">{event.title}</span>
                        {event.description && (
                          <span className="block text-xs text-muted-foreground line-clamp-1 mt-0.5">{event.description}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Icon className="w-3 h-3" />
                          {typeLabel[event.flyerType]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {(() => {
                          const cat = event.category ?? "generale";
                          const CatIcon = categoryIcon[cat];
                          return (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <CatIcon className="w-3 h-3" />
                              {categoryLabel[cat]}
                            </Badge>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <Badge
                          variant="outline"
                          className={`text-xs ${event.published ? "border-green-500/40 text-green-400 bg-green-500/10" : "border-muted-foreground/30 text-muted-foreground"}`}
                        >
                          {event.published ? "Pubblicato" : "Bozza"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(event)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label="Modifica"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(event)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            aria-label="Elimina"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Settings panel */}
        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="font-heading text-lg text-foreground mb-1">Impostazioni</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Configurazione globale del sito pubblico
          </p>
          <div className="max-w-md space-y-2">
            <Label htmlFor="global-zoom">Link Zoom predefinito</Label>
            <p className="text-xs text-muted-foreground">
              Visualizzato come pulsante principale nella hero della homepage
            </p>
            <div className="flex gap-2 mt-1">
              <Input
                id="global-zoom"
                type="url"
                value={globalZoomUrl}
                onChange={(e) => setGlobalZoomUrl(e.target.value)}
                placeholder="https://zoom.us/j/..."
              />
              <Button onClick={handleSaveZoom} disabled={savingZoom} className="shrink-0">
                {savingZoom ? "…" : "Salva"}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Create / Edit form dialog */}
      <EventFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={refresh}
        event={editTarget}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questo evento?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-foreground">{deleteTarget?.title}</strong> verrà eliminato
              definitivamente. Se presente, la locandina verrà rimossa dallo storage.
              Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? "Eliminazione…" : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
