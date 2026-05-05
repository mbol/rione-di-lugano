"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { OcrSuggestion } from "@/lib/ocr";

interface OcrStatusProps {
  message: string;
  progress: number;
}

export function OcrStatus({ message, progress }: OcrStatusProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border text-sm">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
        <span className="text-muted-foreground flex-1">{message || "Analisi in corso…"}</span>
        <span className="text-xs text-muted-foreground/60 tabular-nums">{progress}%</span>
      </div>
      <Progress value={progress} className="h-0.5 mt-0.5 rounded-none" />
    </motion.div>
  );
}

interface SuggestionRowProps {
  label: string;
  value: string;
  onApply: () => void;
}

function SuggestionRow({ label, value, onApply }: SuggestionRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium">{label}</p>
        <p className="text-sm text-foreground font-medium truncate mt-0.5">{value}</p>
      </div>
      <button
        type="button"
        onClick={onApply}
        className="text-xs text-primary hover:underline whitespace-nowrap font-medium"
      >
        Applica
      </button>
    </div>
  );
}

interface OcrSuggestionsProps {
  suggestion: OcrSuggestion;
  onApplyDate: (date: string) => void;
  onApplyTime: (time: string) => void;
  onApplyTitle: (title: string) => void;
  onApplyAll: () => void;
  onDismiss: () => void;
}

export function OcrSuggestions({
  suggestion,
  onApplyDate,
  onApplyTime,
  onApplyTitle,
  onApplyAll,
  onDismiss,
}: OcrSuggestionsProps) {
  const rows = [
    suggestion.date && { label: "Data rilevata", value: suggestion.date, apply: () => onApplyDate(suggestion.date!) },
    suggestion.time && { label: "Orario rilevato", value: suggestion.time, apply: () => onApplyTime(suggestion.time!) },
    suggestion.title && { label: "Titolo rilevato", value: suggestion.title, apply: () => onApplyTitle(suggestion.title!) },
  ].filter(Boolean) as { label: string; value: string; apply: () => void }[];

  if (rows.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="rounded-xl border border-primary/25 bg-primary/5 p-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary uppercase tracking-wider">
              Dati rilevati dalla locandina
            </span>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            aria-label="Ignora suggerimenti"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Suggestion rows */}
        <div className="space-y-3">
          {rows.map((row) => (
            <SuggestionRow
              key={row.label}
              label={row.label}
              value={row.value}
              onApply={row.apply}
            />
          ))}
        </div>

        {/* Apply all */}
        {rows.length > 1 && (
          <div className="mt-3 pt-3 border-t border-primary/15 flex justify-end">
            <button
              type="button"
              onClick={onApplyAll}
              className="text-xs text-primary hover:underline font-medium"
            >
              Applica tutto
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
