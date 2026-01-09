export const getYearFromDate = (date: string | Date): number => {
  const newDate = new Date(date);
  return newDate.getFullYear();
}
export const getMonthFromDate = (date: string | Date): number => {
  const newDate = new Date(date);
  return newDate.getMonth() + 1;
}
export function parseDate(raw: any): Date | null {
  if (!raw) return null;
  const d = raw instanceof Date ? raw : new Date(String(raw));
  return isNaN(d.getTime()) ? null : d;
}
export function formatDate(d: Date | null) {
  if (!d) return "—";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}/${m}/${y}`;
}
export const ddmmyyyyToInputDate = (s: string) => {
  if (!s) return "";

  const match = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";

  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD
};

export function normalizeKey(s: any) {
  return String(s ?? "")
    .trim()
    .toLowerCase();
}

