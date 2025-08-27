 export const fmtDate = (v?: string | Date | null) => {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("he-IL");
};
