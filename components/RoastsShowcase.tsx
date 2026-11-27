"use client";

import { ChevronDown, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { formatPrice, roasts } from "@/lib/data";
import type { RoastItem, RoastLevel } from "@/lib/types";
import SectionHeading from "./SectionHeading";

const roastLabels: Record<RoastLevel, string> = {
  1: "Sehr hell",
  2: "Hell",
  3: "Mittel",
  4: "Mitteldunkel",
  5: "Dunkel",
};

function RoastMeter({ level }: { level: RoastLevel }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[11px] uppercase tracking-[0.18em] text-espresso/55">Röstgrad</span>
        <span className="text-xs text-espresso/60">{roastLabels[level]}</span>
      </div>
      <div
        role="meter"
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={level}
        aria-valuetext={`${level} von 5 – ${roastLabels[level]}`}
        aria-label="Röstgrad"
        className="grid grid-cols-5 gap-1.5"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-colors duration-300 ${i < level ? "bg-copper" : "bg-sand/70"}`}
          />
        ))}
      </div>
    </div>
  );
}

function RoastCard({ roast }: { roast: RoastItem }) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = `roast-details-${roast.id}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-sand/60 bg-cream transition-all duration-300 ease-out hover:-translate-y-1 hover:border-sand hover:shadow-xl hover:shadow-espresso/5">
      <div className="relative aspect-[4/3] overflow-hidden bg-sand/40">
        <Image
          src={roast.image.src}
          alt={roast.image.alt}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-cream/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-espresso backdrop-blur-md">
          {roast.process}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-copper">{roast.origin}</p>
        <h3 className="mt-2 font-serif text-2xl font-medium leading-tight">{roast.name}</h3>
        <p className="mt-1 text-sm text-espresso/60">{roast.variety}</p>

        <ul aria-label="Geschmacksnoten" className="mt-5 flex flex-wrap gap-2">
          {roast.tastingNotes.map((note) => (
            <li key={note} className="rounded-full bg-linen px-3 py-1 text-xs text-espresso/75 ring-1 ring-sand/70">
              {note}
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <RoastMeter level={roast.roastLevel} />
        </div>

        <div
          id={detailsId}
          className={`grid transition-all duration-300 ease-out ${
            expanded ? "mt-6 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden" inert={!expanded}>
            <p className="text-sm leading-relaxed text-espresso/70">{roast.description}</p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-sand/60 pt-4 text-xs">
              <div>
                <dt className="uppercase tracking-[0.15em] text-espresso/45">Höhe</dt>
                <dd className="mt-0.5 text-espresso/80">{roast.altitude}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.15em] text-espresso/45">Ideal für</dt>
                <dd className="mt-0.5 text-espresso/80">{roast.recommendedFor}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-sand/60 pt-5">
          <p>
            <span className="font-serif text-2xl font-medium">{formatPrice(roast.price)}</span>
            <span className="ml-1.5 text-xs text-espresso/50">/ {roast.weight} g</span>
          </p>
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={detailsId}
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-copper transition-all duration-300 ease-out hover:text-copper-dark"
          >
            {expanded ? "Weniger" : "Details"}
            <ChevronDown
              aria-hidden="true"
              className={`h-4 w-4 transition-transform duration-300 ease-out ${expanded ? "rotate-180" : ""}`}
              strokeWidth={1.75}
            />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function RoastsShowcase() {
  return (
    <section id="roestungen" aria-labelledby="roestungen-heading" className="bg-linen py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="roestungen-heading"
            eyebrow="Aktuelle Röstungen"
            title={
              <>
                Vier Herkünfte, <em className="font-normal text-copper">vier Charaktere.</em>
              </>
            }
          >
            Jede Charge wird wöchentlich frisch geröstet und innerhalb von 48 Stunden verschickt – ganze Bohne
            oder auf Wunsch passend für deine Zubereitung gemahlen.
          </SectionHeading>
          <a
            href="#besuch"
            className="inline-flex shrink-0 items-center gap-2 self-start border-b border-espresso/30 pb-1 text-sm tracking-wide text-espresso transition-all duration-300 ease-out hover:border-copper hover:text-copper md:self-auto"
          >
            <ShoppingBag aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
            Im Café erhältlich
          </a>
        </div>

        <div className="mt-16 grid items-start gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {roasts.map((roast) => (
            <RoastCard key={roast.id} roast={roast} />
          ))}
        </div>
      </div>
    </section>
  );
}
