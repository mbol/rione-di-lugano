"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Star, Bell, CalendarDays } from "lucide-react";

const NAV_LINKS = [
  { href: "/sacramentale", label: "Sacramentale", icon: Star },
  { href: "/annunci",      label: "Annunci",       icon: Bell },
  { href: "/calendario",  label: "Calendario",    icon: CalendarDays },
];

export function Navbar() {
  const path = usePathname();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="mx-auto max-w-5xl flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left: home + category links */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            aria-label="Home"
            className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
              path === "/" ? "text-primary bg-primary/8" : "text-gray-500 hover:text-primary hover:bg-gray-100"
            }`}
          >
            <Home className="w-5 h-5" />
          </Link>

          <span className="w-px h-5 bg-gray-200 mx-1" />

          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  active
                    ? "text-primary bg-primary/8"
                    : "text-gray-600 hover:text-primary hover:bg-gray-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0 hidden sm:block" />
                <span>{label}</span>
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 sm:left-3 sm:right-3 h-[2px] bg-primary rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: admin */}
        <Link
          href="/admin"
          aria-label="Admin"
          className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors"
        >
          <User className="w-5 h-5" />
        </Link>
      </nav>
    </header>
  );
}
