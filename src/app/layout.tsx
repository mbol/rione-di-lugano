import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Rione di Lugano",
    template: "%s | Rione di Lugano",
  },
  description:
    "Sito ufficiale del Rione di Lugano — eventi, annunci e appuntamenti della comunità.",
  keywords: ["rione", "lugano", "comunità", "eventi", "chiesa", "svizzera"],
  authors: [{ name: "Rione di Lugano" }],
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://rionelugano.com",
    siteName: "Rione di Lugano",
    title: "Rione di Lugano",
    description: "Sito ufficiale del Rione di Lugano — eventi e appuntamenti della comunità.",
  },
  twitter: {
    card: "summary",
    title: "Rione di Lugano",
    description: "Sito ufficiale del Rione di Lugano — eventi e appuntamenti della comunità.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Rione di Lugano",
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0f10",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
