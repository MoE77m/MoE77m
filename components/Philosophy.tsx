import { Flame, Handshake, Leaf } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { unsplash } from "@/lib/data";
import SectionHeading from "./SectionHeading";

interface Pillar {
  icon: LucideIcon;
  title: string;
  text: string;
}

const pillars: Pillar[] = [
  {
    icon: Handshake,
    title: "Direct Trade",
    text: "Persönliche Partnerschaften mit Farmen – fair bezahlt, transparent dokumentiert.",
  },
  {
    icon: Flame,
    title: "Trommelröstung",
    text: "Kleine Chargen, bis zu 20 Minuten Röstzeit für volle Aromenentwicklung.",
  },
  {
    icon: Leaf,
    title: "Café-Kultur",
    text: "Ein ruhiger Ort zum Verweilen – ohne Hektik, mit Blick auf die Röstmaschine.",
  },
];

export default function Philosophy() {
  return (
    <section id="philosophie" aria-labelledby="philosophie-heading" className="bg-cream py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:gap-24 lg:px-10">
        {/* Redaktioneller Text */}
        <div>
          <SectionHeading
            id="philosophie-heading"
            eyebrow="Unsere Philosophie"
            title={
              <>
                Handwerk braucht Zeit. <em className="font-normal text-copper">Guter Kaffee auch.</em>
              </>
            }
          />

          <div className="mt-8 space-y-5 text-base leading-relaxed text-espresso/75">
            <p>
              Jede Bohne, die wir rösten, hat eine Geschichte – und wir kennen sie. Wir kaufen unseren Rohkaffee
              direkt bei kleinen Farmen und Kooperativen in Äthiopien, Kolumbien, Brasilien und Indonesien. Das
              bedeutet faire Preise weit über dem Weltmarktniveau, langfristige Beziehungen und volle Transparenz
              von der Pflanze bis in die Tasse.
            </p>
            <p>
              Geröstet wird in unserer Werkstatt auf einer traditionellen Trommelröstmaschine: in kleinen Chargen,
              bei moderater Temperatur und mit viel Geduld. Die schonende Langzeitröstung lässt Säuren harmonisch
              abbauen und Zucker sanft karamellisieren – für Kaffee, der bekömmlich ist und trotzdem Charakter hat.
            </p>
          </div>

          <ul className="mt-12 grid gap-8 border-t border-sand pt-10 sm:grid-cols-3">
            {pillars.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon aria-hidden="true" className="mb-4 h-6 w-6 text-copper" strokeWidth={1.25} />
                <h3 className="font-serif text-xl font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-espresso/65">{text}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Bildkomposition */}
        <div className="relative mx-auto w-full max-w-xl pb-16 lg:max-w-none">
          <div className="relative aspect-[4/5] w-[82%] overflow-hidden rounded-2xl shadow-2xl shadow-espresso/10">
            <Image
              src={unsplash("photo-1442512595331-e89e73853f31", 1200)}
              alt="Barista bei der Zubereitung eines Filterkaffees an der Theke"
              fill
              sizes="(min-width: 1024px) 40vw, 82vw"
              className="object-cover transition-transform duration-700 ease-out hover:scale-105"
            />
          </div>
          <div className="absolute bottom-0 right-0 aspect-square w-[52%] overflow-hidden rounded-2xl border-8 border-cream shadow-2xl shadow-espresso/15">
            <Image
              src={unsplash("photo-1587734195503-904fca47e0e9", 800)}
              alt="Frisch geröstete Kaffeebohnen in Nahaufnahme"
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out hover:scale-105"
            />
          </div>
          <div className="absolute -left-2 top-10 hidden rounded-2xl border border-sand/60 bg-cream/60 px-5 py-4 backdrop-blur-md sm:block lg:-left-8">
            <p className="font-serif text-3xl font-medium text-copper">18 min</p>
            <p className="text-xs uppercase tracking-[0.2em] text-espresso/60">Ø Röstzeit</p>
          </div>
        </div>
      </div>
    </section>
  );
}
