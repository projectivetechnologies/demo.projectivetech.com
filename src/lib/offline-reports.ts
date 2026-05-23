import { useEffect, useState } from "react";

export type CachedReportConfig = {
  title: string;
  embedUrl: string;
  isSecure?: boolean;
  reportId?: string;
  accessToken?: string;
  groupId?: string;
  datasetId?: string;
  updatedAt: string;
};

export type OfflineReportSnapshot = {
  title?: string;
  lastSynced?: string;
  metrics?: Array<{ label: string; value: string | number; delta?: string }>;
  columns?: string[];
  rows?: Array<Record<string, unknown>>;
  imageDataUrl?: string;
  updatedAt: string;
};

const REPORT_CACHE_PREFIX = "image-i:report-cache:";
const REPORT_SNAPSHOT_PREFIX = "image-i:report-snapshot:";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    update();

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return isOnline;
}

export function readCachedReport(cacheKey?: string) {
  if (!cacheKey || typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(`${REPORT_CACHE_PREFIX}${cacheKey}`);
    return raw ? (JSON.parse(raw) as CachedReportConfig) : null;
  } catch {
    return null;
  }
}

export function writeCachedReport(cacheKey: string | undefined, config: Omit<CachedReportConfig, "updatedAt">) {
  if (!cacheKey || typeof window === "undefined" || !config.embedUrl) return;

  try {
    window.localStorage.setItem(
      `${REPORT_CACHE_PREFIX}${cacheKey}`,
      JSON.stringify({
        ...config,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch {
    /* ignore */
  }
}

export function readCachedReportSnapshot(cacheKey?: string) {
  if (!cacheKey || typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(`${REPORT_SNAPSHOT_PREFIX}${cacheKey}`);
    return raw ? (JSON.parse(raw) as OfflineReportSnapshot) : null;
  } catch {
    return null;
  }
}

export function writeCachedReportSnapshot(
  cacheKey: string | undefined,
  snapshot: Omit<OfflineReportSnapshot, "updatedAt">,
) {
  if (!cacheKey || typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      `${REPORT_SNAPSHOT_PREFIX}${cacheKey}`,
      JSON.stringify({
        ...snapshot,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch {
    /* ignore */
  }
}

export function isSnapshotFresh(snapshot: OfflineReportSnapshot | null, maxAgeMs = 60 * 60 * 1000) {
  if (!snapshot?.updatedAt) return false;
  const updatedAt = new Date(snapshot.updatedAt).getTime();
  return Number.isFinite(updatedAt) && Date.now() - updatedAt < maxAgeMs;
}

export function registerOfflineCacheWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline caching is optional */
    });
  });
}
