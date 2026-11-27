interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  id?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  children?: React.ReactNode;
}

export default function SectionHeading({
  eyebrow,
  title,
  id,
  align = "left",
  tone = "light",
  children,
}: SectionHeadingProps) {
  const centered = align === "center";
  const dark = tone === "dark";

  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p
        className={`mb-4 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-copper ${
          centered ? "justify-center" : ""
        }`}
      >
        <span aria-hidden="true" className="h-px w-8 bg-copper/60" />
        {eyebrow}
      </p>
      <h2
        id={id}
        className={`font-serif text-4xl font-medium leading-[1.1] sm:text-5xl ${dark ? "text-cream" : "text-espresso"}`}
      >
        {title}
      </h2>
      {children && (
        <p className={`mt-6 text-base leading-relaxed ${dark ? "text-sand/80" : "text-espresso/70"}`}>{children}</p>
      )}
    </div>
  );
}
