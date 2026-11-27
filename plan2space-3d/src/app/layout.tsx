import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Plan2Space 3D – Grundriss zu 3D & Renovierungs-Simulator",
  description:
    "Interaktiver Grundriss-zu-3D- und Renovierungs-Simulator mit Echtzeit-Budgetrechner: Materialien wählen, Möbel einrichten, Kosten live sehen.",
};

export const viewport: Viewport = {
  themeColor: "#0b0d12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
