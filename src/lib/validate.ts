export const isMobile = (v: string) => /^[6-9]\d{9}$/.test(String(v ?? "").replace(/\D/g, "").slice(-10));
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(v ?? "").trim());
export const isFutureDate = (v: string) => {
  if (!v) return false;
  const d = new Date(`${v}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const max = new Date(today);
  max.setMonth(max.getMonth() + 6);
  return d >= today && d <= max;
};
export const clean = (v: unknown, max = 120) =>
  String(v ?? "")
    .trim()
    .slice(0, max);

export interface FieldErrors {
  [field: string]: string | undefined;
}

export function todayISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
