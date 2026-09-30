import Image from "next/image";
import { formatPrice, menuItems, unsplash } from "@/lib/data";
import type { MenuCategory, MenuItem } from "@/lib/types";
import SectionHeading from "./SectionHeading";

const categories: MenuCategory[] = ["Espresso & Milch", "Filterkaffee", "Gebäck"];

const groupByCategory = (items: MenuItem[]): Record<MenuCategory, MenuItem[]> =>
  categories.reduce(
    (acc, category) => ({ ...acc, [category]: items.filter((item) => item.category === category) }),
    {} as Record<MenuCategory, MenuItem[]>,
  );

export default function CafeMenu() {
  const grouped = groupByCategory(menuItems);

  return (
    <section id="cafe" aria-labelledby="cafe-heading" className="relative isolate overflow-hidden bg-espresso py-24 sm:py-32">
      <div aria-hidden="true" className="absolute -right-40 -top-40 -z-10 h-[32rem] w-[32rem] rounded-full bg-copper/10 blur-3xl" />

      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-12 lg:gap-20 lg:px-10">
        {/* Atmosphäre */}
        <div className="lg:col-span-5">
          <SectionHeading
            id="cafe-heading"
            eyebrow="Das Café"
            tone="dark"
            title={
              <>
                Ein Ort zum <em className="font-normal text-copper">Ankommen.</em>
              </>
            }
          >
            Zwischen Röstmaschine und Bohnensäcken servieren wir, was wir selbst am liebsten trinken. Nimm dir
            Zeit – der Duft frisch gerösteten Kaffees ist inklusive.
          </SectionHeading>

          <div className="relative mt-12 aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-[3/4]">
            <Image
              src={unsplash("photo-1554118811-1e0d58224f24", 1200)}
              alt="Gemütlicher Innenraum des Cafés mit Holztischen und warmem Licht"
              fill
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out hover:scale-105"
            />
            <div className="absolute inset-x-4 bottom-4 rounded-xl border border-cream/10 bg-espresso/40 p-5 backdrop-blur-md">
              <p className="font-serif text-lg italic text-cream">„Kaffee ist die Pause, die man sich schenkt.“</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-sand/70">Unser Leitsatz</p>
            </div>
          </div>
        </div>

        {/* Menükarte */}
        <div className="lg:col-span-7 lg:pt-4">
          <div className="rounded-2xl border border-sand/10 bg-roast/60 p-8 sm:p-12">
            <div className="flex items-baseline justify-between border-b border-sand/15 pb-6">
              <h3 className="font-serif text-3xl font-medium text-cream">Karte</h3>
              <p className="text-xs uppercase tracking-[0.2em] text-sand/60">Auszug</p>
            </div>

            <div className="mt-8 space-y-12">
              {categories.map((category) => (
                <div key={category}>
                  <h4 className="mb-6 text-xs font-medium uppercase tracking-[0.25em] text-copper">{category}</h4>
                  <ul className="space-y-6">
                    {grouped[category].map((item) => (
                      <li key={item.name} className="group">
                        <div className="flex items-baseline gap-4">
                          <p className="font-serif text-xl text-cream transition-colors duration-300 ease-out group-hover:text-sand">
                            {item.name}
                            {item.tag && (
                              <span className="ml-3 rounded-full border border-copper/40 px-2 py-0.5 align-middle font-sans text-[10px] uppercase tracking-[0.15em] text-copper">
                                {item.tag}
                              </span>
                            )}
                          </p>
                          <span
                            aria-hidden="true"
                            className="flex-1 border-b border-dotted border-sand/20 transition-colors duration-300 group-hover:border-sand/40"
                          />
                          <p className="font-serif text-xl text-sand">{formatPrice(item.price)}</p>
                        </div>
                        <p className="mt-1 max-w-md text-sm leading-relaxed text-sand/60">{item.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="mt-12 border-t border-sand/15 pt-6 text-xs leading-relaxed text-sand/50">
              Alle Milchgetränke auch mit Hafer- oder Mandeldrink (+0,40 €). Unser Gebäck stammt von einer kleinen
              Backstube aus der Nachbarschaft.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
