"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md"
    >
      <nav className="mx-auto max-w-5xl flex items-center justify-between px-6 h-16">
        <Link
          href="/"
          className="font-heading text-lg text-foreground hover:text-primary transition-colors"
        >
          Rione di Lugano
        </Link>

        <div className="flex items-center gap-6">
          <a
            href="#agenda"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Agenda
          </a>
          <Link
            href="/admin"
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            Admin
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
