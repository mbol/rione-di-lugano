"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ChevronRight, FileText, ImageIcon, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDay, formatMonth, formatTime } from "@/lib/format";
import type { Event } from "@/lib/types";

const flyerLabels: Record<Event["flyerType"], string> = {
  pdf: "Locandina PDF",
  image: "Locandina",
  none: "Evento",
};

const flyerIcons: Record<Event["flyerType"], React.ElementType> = {
  pdf: FileText,
  image: ImageIcon,
  none: Calendar,
};

interface EventCardProps {
  event: Event;
  index: number;
}

export function EventCard({ event, index }: EventCardProps) {
  const Icon = flyerIcons[event.flyerType];
  const day = formatDay(event.date);
  const month = formatMonth(event.date);
  const time = formatTime(event.date);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
    >
      <Link href={`/events?id=${event.id}`} className="group block">
        <div className="relative flex gap-5 p-5 sm:p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:bg-card/80 transition-all duration-300">
          {/* Date badge */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 sm:w-16 text-center select-none">
            <span className="text-3xl sm:text-4xl font-heading font-bold text-primary leading-none">
              {day}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5 font-medium">
              {month}
            </span>
          </div>

          {/* Vertical divider */}
          <div className="w-px self-stretch bg-border group-hover:bg-primary/20 transition-colors" />

          {/* Content */}
          <div className="flex flex-1 items-start justify-between gap-3 min-w-0">
            <div className="min-w-0">
              {/* Time + type badge */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {time}
                </span>
                <Badge variant="outline" className="gap-1 text-[11px] py-0">
                  <Icon className="w-3 h-3" />
                  {flyerLabels[event.flyerType]}
                </Badge>
              </div>

              {/* Title */}
              <h3 className="font-heading text-base sm:text-lg text-foreground leading-snug group-hover:text-primary transition-colors">
                {event.title}
              </h3>

              {/* Description */}
              {event.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
