import { Coffee } from "lucide-react";
import { contact, navLinks } from "@/lib/data";

const legalLinks = [
  { label: "Impressum", href: "#" },
  { label: "Datenschutz", href: "#" },
  { label: "AGB", href: "#" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-espresso text-sand">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <a href="#top" className="inline-flex items-center gap-2.5 text-cream">
              <Coffee aria-hidden="true" className="h-5 w-5 text-copper" strokeWidth={1.5} />
              <span className="font-serif text-2xl font-medium">Glut &amp; Bohne</span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-sand/60">
              Kaffeerösterei &amp; Café. Direkt gehandelt, langsam geröstet, mit Ruhe serviert.
            </p>
          </div>

          <nav aria-label="Footer-Navigation" className="md:col-span-3">
            <h2 className="text-xs font-medium uppercase tracking-[0.25em] text-copper">Entdecken</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sand/70 transition-colors duration-300 hover:text-cream">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <h2 className="text-xs font-medium uppercase tracking-[0.25em] text-copper">Kontakt</h2>
            <address className="mt-5 space-y-1 text-sm not-italic leading-relaxed text-sand/70">
              <p>{contact.street}</p>
              <p>{contact.city}</p>
              <p className="pt-3">
                <a href={contact.phoneHref} className="transition-colors duration-300 hover:text-cream">
                  {contact.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${contact.email}`} className="transition-colors duration-300 hover:text-cream">
                  {contact.email}
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-sand/10 pt-8 text-xs text-sand/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {contact.name}. Alle Rechte vorbehalten.
          </p>
          <ul className="flex gap-6">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="transition-colors duration-300 hover:text-cream">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
