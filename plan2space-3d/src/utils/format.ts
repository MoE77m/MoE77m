const eur = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const eur2 = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
const num1 = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const num2 = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatEUR = (v: number) => eur.format(v);
export const formatEUR2 = (v: number) => eur2.format(v);
export const formatM2 = (v: number) => `${num1.format(v)} m²`;
export const formatMeters = (v: number) => `${num2.format(v)} m`;
export const formatNum1 = (v: number) => num1.format(v);
