"use client";

import { Coffee, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/data";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile-Menü mit Escape schließen und Body-Scroll sperren, solange es offen ist
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out ${
        solid ? "border-b border-sand/10 bg-espresso/70 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav aria-label="Hauptnavigation" className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-10">
        <a href="#top" className="group flex items-center gap-2.5 text-cream" onClick={() => setOpen(false)}>
          <Coffee
            aria-hidden="true"
            className="h-5 w-5 text-copper transition-transform duration-300 ease-out group-hover:-rotate-12"
            strokeWidth={1.5}
          />
          <span className="font-serif text-2xl font-medium tracking-wide">Glut &amp; Bohne</span>
        </a>

        <ul className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="relative text-sm tracking-wide text-cream/80 transition-all duration-300 ease-out after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-copper after:transition-all after:duration-300 hover:text-cream hover:after:w-full"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#reservierung"
          className="hidden rounded-full border border-copper/70 px-5 py-2 text-sm text-cream transition-all duration-300 ease-out hover:border-copper hover:bg-copper md:inline-block"
        >
          Tisch reservieren
        </a>

        <button
          type="button"
          className="-mr-2 rounded-full p-2 text-cream transition-colors duration-300 hover:bg-cream/10 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
        </button>
      </nav>

      {/* Mobile Menü */}
      <div
        id="mobile-menu"
        className={`overflow-hidden transition-all duration-300 ease-out md:hidden ${
          open ? "max-h-[28rem] opacity-100" : "pointer-events-none max-h-0 opacity-0"
        }`}
        aria-hidden={!open}
      >
        <ul className="flex flex-col gap-1 px-6 pb-8 pt-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className="block border-b border-sand/10 py-4 font-serif text-2xl text-cream/90 transition-colors duration-300 hover:text-copper"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-6">
            <a
              href="#reservierung"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="block rounded-full bg-copper py-3.5 text-center text-sm font-medium text-cream transition-colors duration-300 hover:bg-copper-dark"
            >
              Tisch reservieren
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
