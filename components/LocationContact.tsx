"use client";

import { CalendarDays, CheckCircle2, Clock, Mail, MapPin, Phone, Users } from "lucide-react";
import { useId, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { contact, openingHours } from "@/lib/data";
import type { ReservationRequest } from "@/lib/types";
import SectionHeading from "./SectionHeading";

type FormErrors = Partial<Record<keyof ReservationRequest, string>>;

const initialForm: ReservationRequest = {
  name: "",
  email: "",
  guests: 2,
  date: "",
  time: "10:00",
};

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

const todayIso = (): string => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
};

function validate(form: ReservationRequest): FormErrors {
  const errors: FormErrors = {};
  if (form.name.trim().length < 2) errors.name = "Bitte gib deinen Namen an.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Bitte gib eine gültige E-Mail-Adresse an.";
  if (!Number.isInteger(form.guests) || form.guests < 1 || form.guests > 8)
    errors.guests = "Wir reservieren für 1 bis 8 Personen.";
  if (!form.date) errors.date = "Bitte wähle ein Datum.";
  else if (form.date < todayIso()) errors.date = "Das Datum liegt in der Vergangenheit.";
  return errors;
}

const inputClass =
  "w-full rounded-xl border border-sand bg-cream/70 px-4 py-3 text-sm text-espresso placeholder:text-espresso/35 transition-all duration-300 ease-out focus:border-copper focus:bg-cream focus:outline-none focus:ring-4 focus:ring-copper/10 aria-[invalid=true]:border-red-700/60";

function Field({
  id,
  label,
  icon: Icon,
  error,
  children,
}: {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label id={`${id}-label`} htmlFor={id} className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-espresso/60">
        {Icon && <Icon aria-hidden className="h-3.5 w-3.5 text-copper" strokeWidth={1.75} />}
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}

function ReservationForm() {
  const uid = useId();
  const [form, setForm] = useState<ReservationRequest>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const minDate = useMemo(todayIso, []);

  const ids = {
    name: `${uid}-name`,
    email: `${uid}-email`,
    guests: `${uid}-guests`,
    date: `${uid}-date`,
    time: `${uid}-time`,
  };

  const update = <K extends keyof ReservationRequest>(key: K, value: ReservationRequest[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const errorProps = (key: keyof ReservationRequest) =>
    errors[key] ? { "aria-invalid": true, "aria-describedby": `${ids[key]}-error` } : {};

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    // Platzhalter für einen echten API-Call, z. B. fetch("/api/reservation", { method: "POST", body: JSON.stringify(form) })
    await new Promise((resolve) => setTimeout(resolve, 900));
    setStatus("success");
  };

  if (status === "success") {
    const formattedDate = new Date(`${form.date}T00:00:00`).toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    return (
      <div role="status" className="flex h-full flex-col items-center justify-center py-10 text-center">
        <CheckCircle2 aria-hidden="true" className="h-12 w-12 text-copper" strokeWidth={1.25} />
        <h3 className="mt-6 font-serif text-3xl font-medium">Danke, {form.name.split(" ")[0]}!</h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-espresso/70">
          Deine Anfrage für {form.guests} {form.guests === 1 ? "Person" : "Personen"} am {formattedDate} um{" "}
          {form.time} Uhr ist bei uns eingegangen. Wir bestätigen per E-Mail an{" "}
          <span className="text-espresso">{form.email}</span>.
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(initialForm);
            setStatus("idle");
          }}
          className="mt-8 border-b border-espresso/30 pb-1 text-sm text-espresso transition-all duration-300 ease-out hover:border-copper hover:text-copper"
        >
          Neue Anfrage stellen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field id={ids.name} label="Name" error={errors.name}>
          <input
            id={ids.name}
            type="text"
            autoComplete="name"
            placeholder="Vor- und Nachname"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
            required
            {...errorProps("name")}
          />
        </Field>
      </div>

      <div className="sm:col-span-2">
        <Field id={ids.email} label="E-Mail" icon={Mail} error={errors.email}>
          <input
            id={ids.email}
            type="email"
            autoComplete="email"
            placeholder="du@beispiel.de"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
            required
            {...errorProps("email")}
          />
        </Field>
      </div>

      <Field id={ids.guests} label="Gäste" icon={Users} error={errors.guests}>
        <select
          id={ids.guests}
          value={form.guests}
          onChange={(e) => update("guests", Number(e.target.value))}
          className={inputClass}
          {...errorProps("guests")}
        >
          {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "Person" : "Personen"}
            </option>
          ))}
        </select>
      </Field>

      <Field id={ids.date} label="Datum" icon={CalendarDays} error={errors.date}>
        <input
          id={ids.date}
          type="date"
          min={minDate}
          value={form.date}
          onChange={(e) => update("date", e.target.value)}
          className={inputClass}
          required
          {...errorProps("date")}
        />
      </Field>

      <div className="sm:col-span-2">
        <Field id={ids.time} label="Uhrzeit" icon={Clock}>
          <div role="radiogroup" aria-labelledby={`${ids.time}-label`} className="grid grid-cols-4 gap-2">
            {timeSlots.map((slot) => {
              const active = form.time === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => update("time", slot)}
                  className={`rounded-lg border py-2 text-xs transition-all duration-300 ease-out ${
                    active
                      ? "border-copper bg-copper text-cream"
                      : "border-sand bg-cream/70 text-espresso/70 hover:border-copper/60 hover:text-espresso"
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 rounded-full bg-espresso px-8 py-4 text-sm font-medium tracking-wide text-cream transition-all duration-300 ease-out hover:bg-copper hover:shadow-[0_0_30px_-6px_rgba(184,107,67,0.6)] disabled:cursor-wait disabled:opacity-70 sm:col-span-2"
      >
        {status === "submitting" ? "Wird gesendet …" : "Tisch anfragen"}
      </button>
      <p className="text-center text-xs text-espresso/50 sm:col-span-2">
        Für Gruppen ab 9 Personen ruf uns gerne direkt an.
      </p>
    </form>
  );
}

export default function LocationContact() {
  return (
    <section id="besuch" aria-labelledby="besuch-heading" className="bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          id="besuch-heading"
          eyebrow="Besuch & Kontakt"
          align="center"
          title={
            <>
              Wir freuen uns <em className="font-normal text-copper">auf dich.</em>
            </>
          }
        >
          Komm vorbei für einen Espresso an der Bar, eine Röstführung am Samstag oder reserviere einen Tisch für
          dein nächstes Treffen.
        </SectionHeading>

        <div className="mt-16 grid gap-8 lg:grid-cols-12">
          {/* Adresse & Öffnungszeiten */}
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            <address className="rounded-2xl border border-sand/70 bg-linen p-8 not-italic transition-all duration-300 ease-out hover:border-sand">
              <MapPin aria-hidden="true" className="h-6 w-6 text-copper" strokeWidth={1.25} />
              <h3 className="mt-5 font-serif text-2xl font-medium">Adresse</h3>
              <p className="mt-3 text-sm leading-relaxed text-espresso/70">
                {contact.name}
                <br />
                {contact.street}
                <br />
                {contact.city}
              </p>
              <ul className="mt-6 space-y-2 text-sm">
                <li>
                  <a
                    href={contact.phoneHref}
                    className="inline-flex items-center gap-2 text-espresso/80 transition-colors duration-300 hover:text-copper"
                  >
                    <Phone aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
                    {contact.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-2 text-espresso/80 transition-colors duration-300 hover:text-copper"
                  >
                    <Mail aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
                    {contact.email}
                  </a>
                </li>
              </ul>
              <a
                href={contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block border-b border-espresso/30 pb-1 text-sm text-espresso transition-all duration-300 ease-out hover:border-copper hover:text-copper"
              >
                Route planen
              </a>
            </address>

            <div className="rounded-2xl border border-sand/70 bg-linen p-8 transition-all duration-300 ease-out hover:border-sand">
              <Clock aria-hidden="true" className="h-6 w-6 text-copper" strokeWidth={1.25} />
              <h3 className="mt-5 font-serif text-2xl font-medium">Öffnungszeiten</h3>
              <dl className="mt-4 divide-y divide-sand/70 text-sm">
                {openingHours.map((entry) => (
                  <div key={entry.days} className="flex justify-between gap-4 py-3">
                    <dt className="text-espresso/70">{entry.days}</dt>
                    <dd className="font-medium tabular-nums text-espresso">{entry.hours}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-espresso/50">Röstführungen jeden Samstag um 11 Uhr.</p>
            </div>
          </div>

          {/* Reservierung */}
          <div
            id="reservierung"
            className="scroll-mt-24 rounded-2xl border border-sand/70 bg-linen/60 p-8 shadow-xl shadow-espresso/5 backdrop-blur-md sm:p-10 lg:col-span-7"
          >
            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-copper">Tischreservierung</p>
              <h3 className="mt-3 font-serif text-3xl font-medium">Reserviere deinen Platz</h3>
              <p className="mt-2 text-sm text-espresso/60">
                Wir melden uns innerhalb von 24 Stunden mit einer Bestätigung.
              </p>
            </div>
            <ReservationForm />
          </div>
        </div>
      </div>
    </section>
  );
}
