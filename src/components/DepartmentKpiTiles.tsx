import { useEffect, useMemo, useState } from "react";
import { Settings2, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ReportEmbed } from "@/components/ReportEmbed";
import { readCachedReport, useOnlineStatus, writeCachedReport } from "@/lib/offline-reports";
import { cn } from "@/lib/utils";
import { authHeader, getCsrfToken, API_BASE as REPORTS_API_BASE_URL_FROM_CLIENT } from "@/lib/api-client";

export interface KpiTile {
  id: string;
  label: string;
  value: string;
  delta: string;
  reportTitle?: string;
  reportSubtitle?: string;
  reportDataId?: string;
  embedURL?: string;
  orgId?: string;
}

type ReportConfig = {
  title: string;
  embedUrl: string;
  isSecure?: boolean;
  reportId?: string;
  accessToken?: string;
  groupId?: string;
  datasetId?: string;
};

type KpiDataRow = {
  name?: string;
  date?: string;
  sales?: number | string;
  cost_of_sales?: number | string;
  gross_profit?: number | string;
  net_profit?: number | string;
  target?: number | string;
};

type KpiDataPayload = {
  kpis?: Array<Partial<KpiTile> & { title?: string; metric?: string; current?: string; change?: string }>;
  cards?: Record<string, { title?: string; data?: KpiDataRow[] }>;
  last_synced?: string;
};

type PowerBiService = {
  embed: (container: HTMLElement, config: Record<string, unknown>) => EmbeddedPowerBiReport;
  reset: (container: HTMLElement) => void;
};

type PowerBiModels = {
  TokenType: { Embed: number };
};

type EmbeddedPowerBiReport = {
  on?: (eventName: string, handler: (event?: { detail?: unknown }) => void) => void;
};

interface Props {
  department: string;
  catalog: KpiTile[];
  defaultSelected?: string[];
  maxVisible?: number;
}

const STORAGE_PREFIX = "image-i:kpi-selection:";
const KPI_DATA_STORAGE_PREFIX = "image-i:kpi-data:";
const REPORTS_API_BASE_URL = REPORTS_API_BASE_URL_FROM_CLIENT;
const KPI_DATA_URLS = (department: string) => [
  `${REPORTS_API_BASE_URL}/user/department_kpi_data/?department=${encodeURIComponent(department)}`,
  `${REPORTS_API_BASE_URL}/user/kpi_cards/?department=${encodeURIComponent(department)}`,
];

export function DepartmentKpiTiles({
  department,
  catalog,
  defaultSelected,
  maxVisible = 4,
}: Props) {
  const storageKey = `${STORAGE_PREFIX}${department}`;
  const kpiDataStorageKey = `${KPI_DATA_STORAGE_PREFIX}${department}`;
  const initial = defaultSelected ?? catalog.slice(0, maxVisible).map((c) => c.id);

  const [hydratedCatalog, setHydratedCatalog] = useState<KpiTile[]>(() => readCachedKpiCatalog(kpiDataStorageKey) ?? catalog);
  const [selected, setSelected] = useState<string[]>(initial);
  const [openTile, setOpenTile] = useState<KpiTile | null>(null);
  const [reportConfig, setReportConfig] = useState<ReportConfig | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    setHydratedCatalog(readCachedKpiCatalog(kpiDataStorageKey) ?? catalog);
  }, [catalog, kpiDataStorageKey]);

  // Load persisted selection
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        const valid = parsed.filter((id) => hydratedCatalog.some((c) => c.id === id));
        if (valid.length) setSelected(valid);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, hydratedCatalog]);

  useEffect(() => {
    if (!isOnline) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    const loadKpiData = async () => {
      try {
        const payload = await fetchKpiData(department, controller.signal);
        const nextCatalog = mergeKpiData(catalog, payload);
        writeCachedKpiCatalog(kpiDataStorageKey, nextCatalog);
        setHydratedCatalog(nextCatalog);
      } catch (error) {
        console.error("KPI card data sync failed:", error);
        const cached = readCachedKpiCatalog(kpiDataStorageKey);
        if (cached) setHydratedCatalog(cached);
      } finally {
        window.clearTimeout(timeout);
      }
    };

    void loadKpiData();
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [catalog, department, isOnline, kpiDataStorageKey]);

  const persist = (next: string[]) => {
    setSelected(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length <= 1) return; // keep at least one
      persist(selected.filter((s) => s !== id));
    } else {
      if (selected.length >= maxVisible) {
        // replace oldest
        persist([...selected.slice(1), id]);
      } else {
        persist([...selected, id]);
      }
    }
  };

  const visible = useMemo(
    () =>
      selected
        .map((id) => hydratedCatalog.find((c) => c.id === id))
        .filter(Boolean) as KpiTile[],
    [selected, hydratedCatalog],
  );

  const isPositive = (delta: string) =>
    !delta.trim().startsWith("-") && delta.trim() !== "0";

  const openReportTile = async (tile: KpiTile) => {
    setOpenTile(tile);
    setReportConfig(null);
    setReportError(null);

    if (!tile.reportDataId && !tile.embedURL) return;

    await loadAllocatedReport(tile);
  };

  const loadAllocatedReport = async (tile: KpiTile) => {
    setReportLoading(true);

    const fallbackEmbedUrl = tile.embedURL ?? "";
    const cacheKey = getReportCacheKey(tile);
    const cachedConfig = readCachedReport(cacheKey);

    if (!isOnline) {
      if (cachedConfig?.embedUrl) {
        setReportConfig(cachedConfig);
        setReportError("Offline mode is active, so the last cached report is shown.");
      } else if (fallbackEmbedUrl) {
        const fallbackConfig = {
          title: tile.reportTitle ?? tile.label,
          embedUrl: fallbackEmbedUrl,
          isSecure: false,
        };
        setReportConfig(fallbackConfig);
        setReportError("Offline mode is active, so the mapped report URL is shown.");
      } else {
        setReportError(`Offline mode is active and ${tile.label} has no cached report yet.`);
      }
      setReportLoading(false);
      return;
    }

    try {
      const metadataAbort = new AbortController();
      const metadataTimeout = window.setTimeout(() => metadataAbort.abort(), 6000);
      const currentItem = {
        id: tile.reportDataId ?? tile.id,
        title: tile.reportTitle ?? tile.label,
        embedURL: fallbackEmbedUrl,
      };
      const reportDataResponse = await fetch(
        `${REPORTS_API_BASE_URL}/user/get_reports_data/?id=${encodeURIComponent(
          currentItem.id,
        )}`,
        {
          credentials: "include",
          headers: authHeader(),
          signal: metadataAbort.signal,
        },
      );
      window.clearTimeout(metadataTimeout);

      if (!reportDataResponse.ok) {
        throw new Error(`Report metadata request failed (${reportDataResponse.status})`);
      }

      const reportData = (await reportDataResponse.json()) as {
        reportId?: string;
        datasetId?: string;
        rlsRole?: string;
        isSecure?: boolean;
        title?: string;
        embedUrl?: string;
        embedURL?: string;
        reportData?: string;
      };
      const allocatedTitle = reportData.title ?? currentItem.title;
      const allocatedEmbedUrl =
        firstValidPowerBiUrl([
          reportData.embedUrl,
          reportData.embedURL,
          reportData.reportData,
          currentItem.embedURL,
        ]) ?? "";

      if (reportData.isSecure) {
        const resolvedOrgId = tile.orgId ?? getOrgId();
        const tokenAbort = new AbortController();
        const tokenTimeout = window.setTimeout(() => tokenAbort.abort(), 8000);
        const tokenResponse = await fetch(
          `${REPORTS_API_BASE_URL}/user/get-powerbi-embed-token`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              ...authHeader(),
              "Content-Type": "application/json",
              "X-CSRFToken": getCsrfToken(),
            },
            body: JSON.stringify({
              reportId: reportData.reportId,
              datasetId: reportData.datasetId,
              orgId: resolvedOrgId,
              org_id: resolvedOrgId,
              rlsRole: reportData.rlsRole,
              rls_role: reportData.rlsRole,
              roleName: reportData.rlsRole,
              role_name: reportData.rlsRole,
            }),
            signal: tokenAbort.signal,
          },
        );
        window.clearTimeout(tokenTimeout);

        if (!tokenResponse.ok) {
          throw new Error(`Embed token request failed (${tokenResponse.status})`);
        }

        const tokenData = (await tokenResponse.json()) as {
          accessToken?: string;
          embedToken?: string;
          embedUrl: string;
          reportId?: string;
          groupId?: string;
          datasetId?: string;
        };

        const secureEmbedUrl = firstValidPowerBiUrl([tokenData.embedUrl]);
        if (!secureEmbedUrl) {
          throw new Error("Embed token response did not include a valid Power BI URL");
        }

        const secureAccessToken = tokenData.embedToken ?? tokenData.accessToken;
        if (!secureAccessToken) {
          throw new Error("Embed token response did not include accessToken or embedToken");
        }

        const nextConfig = {
          title: allocatedTitle,
          embedUrl: secureEmbedUrl,
          isSecure: true,
          reportId: tokenData.reportId ?? reportData.reportId,
          accessToken: secureAccessToken,
          groupId: tokenData.groupId,
          datasetId: tokenData.datasetId,
        };

        persistReportSelection(allocatedTitle, secureEmbedUrl);
        writeCachedReport(cacheKey, nextConfig);
        setReportConfig(nextConfig);
      } else if (allocatedTitle && allocatedEmbedUrl) {
        const nextConfig = {
          title: allocatedTitle,
          embedUrl: allocatedEmbedUrl,
          isSecure: false,
        };
        persistReportSelection(allocatedTitle, allocatedEmbedUrl);
        writeCachedReport(cacheKey, nextConfig);
        setReportConfig(nextConfig);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      if (cachedConfig?.embedUrl) {
        setReportConfig(cachedConfig);
        setReportError("Live allocation API was unavailable, so the last cached report is shown.");
      } else if (fallbackEmbedUrl) {
        const fallbackConfig = {
          title: tile.reportTitle ?? tile.label,
          embedUrl: fallbackEmbedUrl,
          isSecure: false,
        };
        persistReportSelection(tile.reportTitle ?? tile.label, fallbackEmbedUrl);
        writeCachedReport(cacheKey, fallbackConfig);
        setReportConfig(fallbackConfig);
        setReportError("Live allocation API was unavailable, so the mapped public report is shown.");
      } else {
        setReportError(`Unable to load the ${tile.label} report allocation.`);
      }
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (!isOnline || !openTile) return;
    void loadAllocatedReport(openTile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  return (
    <>
      <div className="px-6 lg:px-10 -mt-2 flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Key metrics · {visible.length} of up to {maxVisible}
        </p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Settings2 className="h-3.5 w-3.5" />
              Customize
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-2">
            <p className="px-2 pt-1 pb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Pick up to {maxVisible}
            </p>
            <div className="max-h-72 overflow-y-auto space-y-0.5">
              {hydratedCatalog.map((c) => {
                const active = selected.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggle(c.id)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted/60 transition-colors",
                      active && "bg-muted/60",
                    )}
                  >
                    <span className="min-w-0 truncate">
                      <span className="font-medium">{c.label}</span>
                      <span className="text-muted-foreground ml-1.5">
                        {c.value}
                      </span>
                    </span>
                    {active && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="px-6 lg:px-10 mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {visible.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => void openReportTile(t)}
            className="surface-card hover-lift p-4 text-left"
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {t.label}
            </p>
            <p className="font-display text-2xl font-semibold mt-2">{t.value}</p>
            <p
              className={cn(
                "text-[11px] mt-1",
                isPositive(t.delta) ? "text-success" : "text-destructive",
              )}
            >
              {t.delta}
            </p>
          </button>
        ))}
      </div>

      <Sheet open={!!openTile} onOpenChange={(o) => !o && setOpenTile(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {openTile && (
            <>
              <SheetHeader>
                <SheetTitle>{openTile.reportTitle ?? openTile.label}</SheetTitle>
                <SheetDescription>
                  {openTile.reportSubtitle ??
                    `Detailed view for ${openTile.label}`}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="surface-card p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Current
                  </p>
                  <p className="font-display text-xl font-semibold mt-1">
                    {openTile.value}
                  </p>
                </div>
                <div className="surface-card p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Delta
                  </p>
                  <p
                    className={cn(
                      "font-display text-xl font-semibold mt-1",
                      isPositive(openTile.delta)
                        ? "text-success"
                        : "text-destructive",
                    )}
                  >
                    {openTile.delta}
                  </p>
                </div>
                <div className="surface-card p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Source
                  </p>
                  <p className="font-display text-sm font-semibold mt-2">
                    Power BI
                  </p>
                </div>
              </div>
              <div className="mt-4">
                {reportLoading ? (
                  <div className="relative rounded-md border border-border/70 bg-muted/20 grid h-[360px] place-items-center overflow-hidden">
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-60"
                      style={{ backgroundImage: "var(--gradient-aurora)" }}
                    />
                    <div className="relative text-center">
                      <RefreshCw className="mx-auto h-5 w-5 animate-spin text-primary" />
                      <p className="mt-2 text-xs text-muted-foreground">Loading report allocation...</p>
                    </div>
                  </div>
                ) : reportConfig?.isSecure ? (
                  <SecurePowerBiEmbed config={reportConfig} />
                ) : (
                  <ReportEmbed
                    title={reportConfig?.title ?? openTile.reportTitle ?? openTile.label}
                    subtitle={openTile.reportSubtitle ?? "Detailed report"}
                    height={360}
                    embedUrl={reportConfig?.embedUrl}
                    cacheKey={getReportCacheKey(openTile)}
                  />
                )}
                {reportError && (
                  <p className="mt-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
                    {reportError}
                  </p>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function getReportCacheKey(tile: KpiTile) {
  return tile.reportDataId ?? tile.id;
}

async function fetchKpiData(department: string, signal: AbortSignal) {
  let lastError: unknown;

  for (const url of KPI_DATA_URLS(department)) {
    try {
      const response = await fetch(url, {
        credentials: "include",
        headers: authHeader(),
        signal,
      });

      if (!response.ok) {
        lastError = new Error(`KPI data request failed (${response.status})`);
        continue;
      }

      return (await response.json()) as KpiDataPayload;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("KPI data request failed");
}

function mergeKpiData(catalog: KpiTile[], payload: KpiDataPayload) {
  const directTiles = normalizeDirectKpiTiles(payload);
  if (directTiles.length) {
    return mergeTiles(catalog, directTiles);
  }

  const snapshotTiles = deriveFinanceKpisFromSnapshot(catalog, payload);
  if (snapshotTiles.length) {
    return mergeTiles(catalog, snapshotTiles);
  }

  return catalog;
}

function normalizeDirectKpiTiles(payload: KpiDataPayload) {
  if (!Array.isArray(payload.kpis)) return [];

  return payload.kpis
    .map((item) => {
      const id = item.id;
      const label = item.label ?? item.title;
      const value = item.value ?? item.metric ?? item.current;
      const delta = item.delta ?? item.change;

      if (!id || !label || !value) return null;

      return {
        ...item,
        id,
        label,
        value,
        delta: delta ?? "synced",
      } satisfies KpiTile;
    })
    .filter(Boolean) as KpiTile[];
}

function deriveFinanceKpisFromSnapshot(catalog: KpiTile[], payload: KpiDataPayload) {
  const rows = Object.values(payload.cards ?? {}).flatMap((card) => card.data ?? []);
  if (!rows.length) return [];

  const totals = rows.reduce<{ sales: number; costOfSales: number; grossProfit: number; netProfit: number; target: number }>(
    (sum, row) => ({
      sales: sum.sales + toNumber(row.sales),
      costOfSales: sum.costOfSales + toNumber(row.cost_of_sales),
      grossProfit: sum.grossProfit + toNumber(row.gross_profit),
      netProfit: sum.netProfit + toNumber(row.net_profit),
      target: sum.target + toNumber(row.target),
    }),
    { sales: 0, costOfSales: 0, grossProfit: 0, netProfit: 0, target: 0 },
  );

  const grossMargin = totals.sales ? (totals.grossProfit / totals.sales) * 100 : 0;
  const forecastVariance = totals.target ? ((totals.sales - totals.target) / totals.target) * 100 : null;

  return catalog
    .map((tile) => {
      if (tile.id === "rev_ytd") {
        return { ...tile, value: formatCurrencyMetric(totals.sales), delta: syncDelta(payload) };
      }
      if (tile.id === "gm") {
        return { ...tile, value: formatPercentMetric(grossMargin), delta: syncDelta(payload) };
      }
      if (tile.id === "op_cash") {
        return { ...tile, value: formatCurrencyMetric(totals.netProfit), delta: syncDelta(payload) };
      }
      if (tile.id === "fcst_var") {
        return {
          ...tile,
          value: forecastVariance === null ? tile.value : formatPercentMetric(forecastVariance),
          delta: forecastVariance === null ? syncDelta(payload) : forecastVariance >= 0 ? "above target" : "below target",
        };
      }
      return null;
    })
    .filter(Boolean) as KpiTile[];
}

function mergeTiles(catalog: KpiTile[], updates: KpiTile[]) {
  const byId = new Map(updates.map((tile) => [tile.id, tile]));
  return catalog.map((tile) => ({ ...tile, ...byId.get(tile.id) }));
}

function readCachedKpiCatalog(key: string) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as KpiTile[]) : null;
  } catch {
    return null;
  }
}

function writeCachedKpiCatalog(key: string, catalog: KpiTile[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(catalog));
  } catch {
    /* ignore */
  }
}

function syncDelta(payload: KpiDataPayload) {
  return payload.last_synced ? "synced" : "live";
}

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0) || 0;
}

function formatCurrencyMetric(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function formatPercentMetric(value: number) {
  return `${value.toFixed(1)}%`;
}

function SecurePowerBiEmbed({ config }: { config: ReportConfig }) {
  const [status, setStatus] = useState("Preparing secure Power BI embed...");
  const containerId = `powerbi-${config.reportId ?? "secure-report"}`;

  useEffect(() => {
    let cancelled = false;

    const embed = async () => {
      const container = document.getElementById(containerId);
      if (!container || !config.embedUrl || !config.accessToken) return;

      try {
        const { models, powerbi } = await loadPowerBiClient();
        if (cancelled) return;

        powerbi.reset(container);
        const embeddedReport = powerbi.embed(container, {
          type: "report",
          id: config.reportId,
          embedUrl: config.embedUrl,
          tokenType: models.TokenType.Embed,
          accessToken: config.accessToken,
          settings: {
            panes: {
              filters: { visible: false },
              pageNavigation: { visible: false },
            },
            navContentPaneEnabled: false,
          },
        });

        embeddedReport.on?.("loaded", () => setStatus(""));
        embeddedReport.on?.("rendered", () => setStatus(""));
        embeddedReport.on?.("error", (event) => {
          console.error("Power BI secure embed event failed:", event?.detail);
          setStatus(getPowerBiErrorMessage(event?.detail));
        });
        setStatus("");
      } catch (error) {
        console.error("Power BI secure embed failed:", error);
        setStatus(getPowerBiErrorMessage(error));
      }
    };

    void embed();

    return () => {
      cancelled = true;
      const container = document.getElementById(containerId);
      const powerbi = getWindowPowerBi();
      if (container && powerbi) powerbi.reset(container);
    };
  }, [config, containerId]);

  return (
    <div className="relative h-[520px] overflow-hidden rounded-md border border-border/70 bg-background">
      {status && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-background/85 px-6 text-center">
          <p className="text-xs text-muted-foreground">{status}</p>
        </div>
      )}
      <div id={containerId} className="h-full w-full" />
    </div>
  );
}

function persistReportSelection(title: string, url: string) {
  try {
    localStorage.setItem("title", title);
    localStorage.setItem("URL", url);
  } catch {
    /* ignore */
  }
}

// authHeader() and getCsrfToken() are imported from @/lib/api-client

// getCookie() replaced by getCsrfToken() from @/lib/api-client

function getOrgId() {
  try {
    return (
      localStorage.getItem("org_id") ??
      JSON.parse(localStorage.getItem("org") ?? "{}")?.id ??
      JSON.parse(localStorage.getItem("org_data") ?? "{}")?.data?.id ??
      undefined
    );
  } catch {
    return undefined;
  }
}

function firstValidPowerBiUrl(urls: Array<string | undefined>) {
  return urls.find((url) => isValidPowerBiUrl(url));
}

function isValidPowerBiUrl(url?: string) {
  return typeof url === "string" && /^https:\/\/app\.powerbi\.com\/(view|reportEmbed)\?/i.test(url.trim());
}

async function loadPowerBiClient() {
  const existing = getWindowPowerBi();
  const imported = await import("powerbi-client");

  const powerbi = existing ?? getWindowPowerBi();
  if (!powerbi) throw new Error("Power BI SDK did not initialize");
  return { models: imported.models as PowerBiModels, powerbi };
}

function getWindowPowerBi() {
  return (window as Window & { powerbi?: PowerBiService }).powerbi;
}

function getPowerBiErrorMessage(detail: unknown) {
  if (detail instanceof Error) return detail.message;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object") {
    const value = detail as {
      message?: string;
      detailedMessage?: string;
      errorCode?: string;
    };
    return (
      value.message ??
      value.detailedMessage ??
      value.errorCode ??
      "Power BI rejected the secure embed configuration."
    );
  }

  return "Secure embed could not be initialized. Check the embed token endpoint and browser console.";
}
