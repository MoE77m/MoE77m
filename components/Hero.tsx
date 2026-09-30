import { ArrowDown, ArrowRight } from "lucide-react";
import Image from "next/image";
import { unsplash } from "@/lib/data";

export default function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-svh items-center overflow-hidden bg-espresso"
    >
      <Image
        src={unsplash("photo-1495474472287-4d71bcdd2085", 2400)}
        alt="Dampfende Tasse Kaffee auf einem Holztisch im warmen Morgenlicht"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      {/* Overlay: dunkler Verlauf für Lesbarkeit, warmer Ton für Stimmung */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-espresso/70 via-espresso/45 to-espresso/90"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-espresso/60 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-6 pb-24 pt-36 lg:px-10">
        <div className="max-w-3xl">
          <p className="mb-6 flex animate-fade-up items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-sand">
            <span aria-hidden="true" className="h-px w-10 bg-copper" />
            Rösterei &amp; Café · seit 2014
          </p>

          <h1
            id="hero-heading"
            className="animate-fade-up font-serif text-5xl font-medium leading-[1.05] text-cream [animation-delay:120ms] sm:text-6xl lg:text-7xl"
          >
            Die Kunst der Entschleunigung <em className="font-normal text-sand">in jeder Tasse.</em>
          </h1>

          <p className="mt-8 max-w-xl animate-fade-up text-base leading-relaxed text-cream/75 [animation-delay:240ms] sm:text-lg">
            Direkt gehandelte Bohnen, langsam in der Trommel geröstet und mit Ruhe zubereitet – für Momente, die
            nachklingen.
          </p>

          <div className="mt-12 flex animate-fade-up flex-col items-start gap-6 [animation-delay:360ms] sm:flex-row sm:items-center sm:gap-10">
            <a
              href="#roestungen"
              className="group inline-flex items-center gap-3 rounded-full border border-copper/80 bg-copper/15 px-8 py-4 text-sm font-medium tracking-wide text-cream shadow-[0_0_30px_-6px_rgba(184,107,67,0.55)] backdrop-blur-md transition-all duration-300 ease-out hover:bg-copper hover:shadow-[0_0_45px_-4px_rgba(184,107,67,0.8)]"
            >
              Röstungen entdecken
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1"
                strokeWidth={1.5}
              />
            </a>
            <a
              href="#besuch"
              className="border-b border-sand/40 pb-1 text-sm tracking-wide text-sand transition-all duration-300 ease-out hover:border-cream hover:text-cream"
            >
              Café besuchen
            </a>
          </div>
        </div>
      </div>

      <a
        href="#philosophie"
        aria-label="Weiter zur Philosophie"
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-sand/70 transition-colors duration-300 hover:text-cream sm:flex"
      >
        Scrollen
        <ArrowDown aria-hidden="true" className="h-4 w-4 animate-bounce" strokeWidth={1.5} />
      </a>
    </section>
  );
}
