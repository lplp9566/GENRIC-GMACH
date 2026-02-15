// ClarityRouteTracker.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}

export function ClarityRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    if (window.clarity) {
      const page = location.pathname + location.search;
      window.clarity("set", "page", page);
    }
  }, [location.pathname, location.search]);

  return null;
}
