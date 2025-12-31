export const getYearFromDate = (date: string | Date): number => {
  const newDate = new Date(date);
  return newDate.getFullYear();
}
export const getMonthFromDate = (date: string | Date): number => {
  const newDate = new Date(date);
  return newDate.getMonth() + 1;
}