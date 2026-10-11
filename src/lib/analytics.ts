declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    beresinAnalyticsAllowed?: boolean;
  }
}

export function track(name: string, properties: Record<string, string | number> = {}): void {
  if (!window.beresinAnalyticsAllowed || !window.gtag) return;
  window.gtag('event', name, { ...properties, page_location: location.origin + location.pathname });
}
