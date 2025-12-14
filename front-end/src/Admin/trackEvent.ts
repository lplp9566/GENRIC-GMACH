// src/matomoEvents.ts
declare global {
  interface Window {
    _paq?: any[];
  }
}

/**
 * שליחת event למאטומו
 * @param category - קבוצה כללית ("Payments", "Loans", "Users")
 * @param action   - מה קרה ("Click Delete", "Create", "Update")
 * @param name     - תיאור נוסף (למשל "Monthly payment", "Loan #123")
 * @param value    - ערך מספרי (סכום, כמות וכו') - לא חובה
 */
export function trackEvent(
  category: string,
  action: string,
  name?: string,
  value?: number
) {
  if (!window._paq) return;

  const args: (string | number)[] = ["trackEvent", category, action];

  if (name !== undefined) args.push(name);
  if (value !== undefined) args.push(value);

  window._paq.push(args);
}
