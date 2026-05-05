"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[oklch(0.22_0.08_252)] shadow-md">
      <nav className="mx-auto max-w-5xl flex items-center justify-between px-6 h-16">
        <Link
          href="/"
          className="font-heading text-lg text-white hover:text-blue-200 transition-colors"
        >
          Rione di Lugano
        </Link>

        <div className="flex items-center gap-6">
          <a
            href="#agenda"
            className="text-sm text-blue-200 hover:text-white transition-colors"
          >
            Agenda
          </a>
          <Link
            href="/admin"
            className="text-xs text-blue-300/60 hover:text-blue-200 transition-colors"
          >
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}
