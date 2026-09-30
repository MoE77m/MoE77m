import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Glut & Bohne – Kaffeerösterei & Café",
  description:
    "Handwerkliche Trommelröstung, Direct-Trade-Bohnen und ein Café zum Entschleunigen. Besuche unsere Rösterei in Berlin.",
  keywords: ["Kaffeerösterei", "Specialty Coffee", "Café", "Trommelröstung", "Direct Trade", "Berlin"],
  openGraph: {
    title: "Glut & Bohne – Kaffeerösterei & Café",
    description: "Die Kunst der Entschleunigung in jeder Tasse.",
    type: "website",
    locale: "de_DE",
  },
};

export const viewport: Viewport = {
  themeColor: "#181412",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${cormorant.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
