// Eigene (leere) PostCSS-Config: Tailwind läuft über den Turbopack-Loader (siehe next.config.ts).
// Verhindert, dass Next.js die postcss.config.mjs eines übergeordneten Ordners verwendet.
const config = { plugins: {} };

export default config;
