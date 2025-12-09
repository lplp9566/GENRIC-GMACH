import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    _paq?: any[];
  }
}

export const MatomoTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (!window._paq) return;

    const url = window.location.origin + location.pathname + location.search;

    window._paq.push(["setCustomUrl", url]);
    window._paq.push(["setDocumentTitle", document.title]);
    window._paq.push(["trackPageView"]);
  }, [location]);

  return null;
};

