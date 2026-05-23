import { useEffect, useState } from "react";
import { apiFetch, authHeader, getCsrfToken, getJwtUserId, API_BASE as REPORTS_API_BASE_URL_FROM_CLIENT } from "@/lib/api-client";
import { RefreshCw } from "lucide-react";
import { ChartCard } from "@/components/ChartCard";
import { ReportEmbed } from "@/components/ReportEmbed";
import {
  OfflineReportSnapshot,
  isSnapshotFresh,
  readCachedReport,
  readCachedReportSnapshot,
  useOnlineStatus,
  writeCachedReport,
  writeCachedReportSnapshot,
} from "@/lib/offline-reports";

const REPORTS_API_BASE_URL = REPORTS_API_BASE_URL_FROM_CLIENT;
const OFFLINE_REPORT_SNAPSHOT_URLS = (id: string) => [
  `${REPORTS_API_BASE_URL}/user/offline_report_data/?id=${encodeURIComponent(id)}`,
];
const OFFLINE_REPORT_SNAPSHOT_TIMEOUT_MS = 30_000;
import imageILogo from "@/assets/image-i-logo.png";

type AllocatedReport = {
  title: string;
  embedUrl: string;
  isSecure?: boolean;
  reportId?: string;
  accessToken?: string;
  groupId?: string;
  datasetId?: string;
};

type PowerBiService = {
  embed: (container: HTMLElement, config: Record<string, unknown>) => EmbeddedPowerBiReport;
  reset: (container: HTMLElement) => void;
};

type PowerBiModels = {
  TokenType: { Embed: number };
  ExportDataType?: { Summarized: number };
};

type EmbeddedPowerBiReport = {
  on?: (eventName: string, handler: (event?: { detail?: unknown }) => void) => void;
  getPages?: () => Promise<Array<EmbeddedPowerBiPage>>;
};

type EmbeddedPowerBiPage = {
  isActive?: boolean;
  getVisuals?: () => Promise<Array<EmbeddedPowerBiVisual>>;
};

type EmbeddedPowerBiVisual = {
  title?: string;
  type?: string;
  exportData?: (exportType?: number, rows?: number) => Promise<{ data?: string }>;
};

interface AllocatedReportEmbedProps {
  id: string;
  title: string;
  embedUrl?: string;
  reportId?: string;
  datasetId?: string;
  groupId?: string;
  orgId?: string;
  forceSecure?: boolean;
  aspectRatio?: string;
}

export function AllocatedReportEmbed({
  id,
  title,
  embedUrl,
  reportId,
  datasetId,
  groupId,
  orgId,
  forceSecure,
  aspectRatio = "16 / 9",
}: AllocatedReportEmbedProps) {
  const isOnline = useOnlineStatus();
  const cacheKey = id;
  const cachedReport = readCachedReport(cacheKey);
  const cachedSnapshot = readCachedReportSnapshot(cacheKey);
  const [report, setReport] = useState<AllocatedReport | null>(null);
  const [offlineSnapshot, setOfflineSnapshot] = useState<OfflineReportSnapshot | null>(cachedSnapshot);
  const [status, setStatus] = useState<string | null>("Loading report allocation...");

  useEffect(() => {
    let cancelled = false;

    const loadReport = async () => {
      if (!isOnline) {
        if (cachedReport?.embedUrl && (!forceSecure || cachedReport.isSecure)) {
          setReport(cachedReport);
          setStatus("Offline mode is active, so the last cached report is shown.");
        } else if (embedUrl && !forceSecure) {
          setReport({ title, embedUrl });
          setStatus("Offline mode is active, so the mapped report URL is shown.");
        } else {
          setStatus("Offline mode is active and this report has no cached allocation yet.");
        }
        return;
      }

      setStatus("Loading report allocation...");

      try {
        if (shouldRefreshOfflineSnapshot(cachedSnapshot, id)) {
          void syncOfflineSnapshot(id, cacheKey).then((snapshot) => {
            if (!cancelled && snapshot) setOfflineSnapshot(snapshot);
          });
        }

        const metadataAbort = new AbortController();
        const metadataTimeout = window.setTimeout(() => metadataAbort.abort(), 6000);
        const metadataResponse = await fetch(
          `${REPORTS_API_BASE_URL}/user/get_reports_data/?id=${encodeURIComponent(id)}`,
          {
            credentials: "include",
            headers: authHeader(),
            signal: metadataAbort.signal,
          },
        );
        window.clearTimeout(metadataTimeout);

        if (!metadataResponse.ok) {
          throw new Error(`Report metadata request failed (${metadataResponse.status})`);
        }

        const metadata = (await metadataResponse.json()) as {
          title?: string;
          // camelCase variants
          embedUrl?: string;
          embedURL?: string;
          reportData?: string;
          isSecure?: boolean;
          reportId?: string;
          datasetId?: string;
          groupId?: string;
          rlsRole?: string;
          // snake_case variants (Django/Python backends)
          embed_url?: string;
          report_data?: string;
          is_secure?: boolean;
          report_id?: string;
          dataset_id?: string;
          group_id?: string;
          rls_role?: string;
        };

        const allocatedTitle = metadata.title ?? title;
        const allocatedReportId = metadata.reportId ?? metadata.report_id ?? reportId;
        const allocatedDatasetId = metadata.datasetId ?? metadata.dataset_id ?? datasetId;
        const allocatedGroupId = metadata.groupId ?? metadata.group_id ?? groupId;
        const allocatedRlsRole = metadata.rlsRole ?? metadata.rls_role;
        const allocatedEmbedUrl =
          firstValidPowerBiUrl([
            metadata.embedUrl, metadata.embed_url, metadata.embedURL,
            metadata.reportData, metadata.report_data,
            embedUrl,
          ]) ?? "";
        const shouldUseSecureEmbed = Boolean(
          forceSecure || metadata.isSecure || metadata.is_secure || (allocatedReportId && allocatedDatasetId)
        );

        if (shouldUseSecureEmbed && allocatedReportId && allocatedDatasetId) {
          const resolvedOrgId = orgId ?? getOrgId();
          const tokenAbort = new AbortController();
          const tokenTimeout = window.setTimeout(() => tokenAbort.abort(), 8000);
          const tokenResponse = await fetch(
            `${REPORTS_API_BASE_URL}/user/get-powerbi-embed-token`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCsrfToken(),
                ...authHeader(),
              },
              body: JSON.stringify({
                reportId: allocatedReportId,
                datasetId: allocatedDatasetId,
                groupId: allocatedGroupId,
                orgId: resolvedOrgId || 45,
                org_id: resolvedOrgId,
                rlsRole: metadata.rlsRole,
                rls_role: metadata.rlsRole,
                roleName: metadata.rlsRole,
                role_name: metadata.rlsRole,
              }),
              signal: tokenAbort.signal,
            },
          );
          window.clearTimeout(tokenTimeout);

          if (!tokenResponse.ok) {
            throw new Error(`Embed token request failed (${tokenResponse.status})`);
          }

          const tokenData = (await tokenResponse.json()) as {
            // camelCase variants
            accessToken?: string;
            embedToken?: string;
            embedUrl?: string;
            reportId?: string;
            groupId?: string;
            datasetId?: string;
            // snake_case variants (Django/Python backends)
            access_token?: string;
            embed_token?: string;
            embed_url?: string;
            report_id?: string;
            group_id?: string;
            dataset_id?: string;
          };

          // Only a reportEmbed URL is valid for SDK secure embedding.
          // A public "view?r=..." share URL must never be used here — the SDK
          // would silently render the public report instead of the authenticated one.
          const resolvedReportId =
            tokenData.reportId ?? tokenData.report_id ?? allocatedReportId;
          const resolvedGroupId =
            tokenData.groupId ?? tokenData.group_id ?? allocatedGroupId;

          // Precedence for embed URL:
          // 1. URL returned by token endpoint (most authoritative, only if it is a reportEmbed URL)
          // 2. Cluster-aware URL constructed from the embed token metadata
          //    (Power BI embed tokens contain clusterUrl in their second dot-separated segment —
          //     critical for non-default-region workspaces like India Central; using a plain
          //     ?reportId= URL without ?config= routes to the wrong cluster → 401 Unauthorized)
          // NOTE: allocatedEmbedUrl from get_reports_data is intentionally NOT used here because
          //    it may be a public "view?r=..." share link or a legacy ?reportId= URL without the
          //    cluster config param, both of which cause the SDK to either render the wrong report
          //    or return 401 for non-default-region workspaces.
          const resolvedEmbedToken =
            tokenData.embedToken ?? tokenData.embed_token ??
            tokenData.accessToken ?? tokenData.access_token;

          const secureEmbedUrl =
            firstSecureEmbedUrl([tokenData.embedUrl, tokenData.embed_url]) ??
            buildClusterAwareEmbedUrl(resolvedEmbedToken ?? "", resolvedReportId, resolvedGroupId);

          if (!secureEmbedUrl) {
            throw new Error(
              "Cannot determine a reportEmbed URL. " +
              "Backend must return embedUrl, embed_url, or both reportId and groupId."
            );
          }

          // resolvedEmbedToken computed above — prefer embedToken (H4sI) over raw AAD JWT
          const secureAccessToken = resolvedEmbedToken;
          if (!secureAccessToken) {
            throw new Error("Embed token response did not include accessToken / embedToken");
          }

          const nextReport = {
            title: allocatedTitle,
            embedUrl: secureEmbedUrl,
            isSecure: true,
            reportId: resolvedReportId,
            accessToken: secureAccessToken,
            groupId: resolvedGroupId,
            datasetId: tokenData.datasetId ?? tokenData.dataset_id ?? allocatedDatasetId,
          };

          if (cancelled) return;
          writeCachedReport(cacheKey, nextReport);
          setReport(nextReport);
          setStatus(null);
          return;
        }

        if (shouldUseSecureEmbed) {
          throw new Error("Secure report metadata is missing reportId or datasetId");
        }

        if (allocatedEmbedUrl) {
          const nextReport = { title: allocatedTitle, embedUrl: allocatedEmbedUrl, isSecure: false };

          if (cancelled) return;
          writeCachedReport(cacheKey, nextReport);
          setReport(nextReport);
          setStatus(null);
          return;
        }

        throw new Error("Report metadata did not include embed details");
      } catch (error) {
        console.error("Error loading allocated report:", error);

        if (cancelled) return;
        if (cachedReport?.embedUrl && (!forceSecure || cachedReport.isSecure)) {
          setReport(cachedReport);
          setStatus("Live allocation API was unavailable, so the last cached report is shown.");
        } else if (embedUrl && !forceSecure) {
          const fallbackReport = { title, embedUrl, isSecure: false };
          writeCachedReport(cacheKey, fallbackReport);
          setReport(fallbackReport);
          setStatus("Live allocation API was unavailable, so the mapped report URL is shown.");
        } else {
          setStatus("This report is marked secure, but the backend did not return a usable embed token allocation.");
        }
      }
    };

    void loadReport();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, datasetId, embedUrl, forceSecure, groupId, id, isOnline, orgId, reportId, title]);

  if (!isOnline) {
    return (
      <ReportEmbed
        title={report?.title ?? cachedReport?.title ?? title}
        subtitle={id}
        embedUrl={report?.embedUrl ?? cachedReport?.embedUrl}
        cacheKey={cacheKey}
        aspectRatio={aspectRatio}
        offlineSnapshot={offlineSnapshot}
      >
        {status && <p className="text-xs text-muted-foreground">{status}</p>}
      </ReportEmbed>
    );
  }

  if (report?.isSecure) {
    return (
      <SecurePowerBiCard
        report={report}
        id={id}
        status={status}
        aspectRatio={aspectRatio}
      />
    );
  }

  return (
    <ReportEmbed
      title={report?.title ?? title}
      subtitle={id}
      embedUrl={report?.embedUrl}
      cacheKey={cacheKey}
      aspectRatio={aspectRatio}
      offlineSnapshot={offlineSnapshot}
    >
      {status && <p className="text-xs text-muted-foreground">{status}</p>}
    </ReportEmbed>
  );
}

function SecurePowerBiCard({
  report,
  id,
  status,
  aspectRatio,
}: {
  report: AllocatedReport;
  id: string;
  status: string | null;
  aspectRatio: string;
}) {
  const [embedStatus, setEmbedStatus] = useState(status ?? "Preparing secure Power BI embed...");
  const containerId = `powerbi-card-${sanitizeId(id)}`;
  const [reportVisible, setReportVisible] = useState(false);

  useEffect(() => {
    setReportVisible(false);
    setEmbedStatus(status ?? "Preparing secure embed reports...");
  }, [status]);

  useEffect(() => {
    let cancelled = false;

    const embed = async () => {
      const container = document.getElementById(containerId);
      if (!container || !report.embedUrl || !report.accessToken) return;

      try {
        const { models, powerbi } = await loadPowerBiClient();
        if (cancelled) return;

        powerbi.reset(container);
        const embeddedReport = powerbi.embed(container, {
          type: "report",
          id: report.reportId,
          embedUrl: report.embedUrl,
          tokenType: models.TokenType.Embed,
          accessToken: report.accessToken,
          settings: {
            panes: {
              filters: { visible: false },
              pageNavigation: { visible: false },
            },
            navContentPaneEnabled: false,
          },
        });

        embeddedReport.on?.("loaded", () => {
          // Keep IMAGE-I loader visible
          setReportVisible(false);
        });

        embeddedReport.on?.("rendered", () => {
          setTimeout(() => {
            setReportVisible(true);
            setEmbedStatus("");
          }, 1200);

          if (!shouldUseBackendSnapshotOnly(id)) {
            void cacheRenderedPowerBiData(embeddedReport, models, id, report.title);
          }
        });

        embeddedReport.on?.("error", (event) => {
          console.error("Power BI secure card embed event failed:", event?.detail);
          setReportVisible(false);
          setEmbedStatus(getPowerBiErrorMessage(event?.detail));
        });
      } catch (error) {
        console.error("Power BI secure card embed failed:", error);
        setEmbedStatus(getPowerBiErrorMessage(error));
      }
    };

    void embed();
    

    return () => {
      cancelled = true;
      const container = document.getElementById(containerId);
      const powerbi = getWindowPowerBi();
      if (container && powerbi) powerbi.reset(container);
    };
  }, [containerId, report]);

  const handleRefreshDataset = async () => {
    try {
      if (!report.datasetId || !report.groupId) {
        setEmbedStatus("Dataset information missing.");
        return;
      }

      setReportVisible(false);
      setEmbedStatus("Refreshing Power BI dataset...");

      const response = await fetch(
        `${REPORTS_API_BASE_URL}/user/refresh_powerbi_dataset`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(),
            ...authHeader(),
          },
          body: JSON.stringify({
            datasetId: report.datasetId,
            groupId: report.groupId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.details || data?.error || "Dataset refresh failed");
      }

      setEmbedStatus("Dataset refresh started. Reloading report shortly...");

      // Wait for Power BI import refresh
      setTimeout(() => {
        window.location.reload();
      }, 180000);

    } catch (error) {
      console.error("Dataset refresh failed:", error);
      setEmbedStatus(getPowerBiErrorMessage(error));
    }
  };
  return (
    <ChartCard
      title={report.title}
      subtitle={id}
      actions={
        <button
          type="button"
          onClick={handleRefreshDataset}
          className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-primary"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      }
    >
      <div
        className="relative rounded-md border border-border/70 bg-muted/20 overflow-hidden"
        style={{ aspectRatio }}
      >
        {embedStatus && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white px-6 text-center">
            <img
              src={imageILogo}
              alt="IMAGE-I"
              className="mb-3 w-[200px] max-w-[70%]"
            />

            <RefreshCw className="h-6 w-6 animate-spin text-primary" />

            <p className="mt-3 text-xs text-muted-foreground">
              {embedStatus}
            </p>
          </div>
        )}
        <div
          id={containerId}
          className={`h-full w-full transition-opacity duration-500 ${
            reportVisible ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </ChartCard>
  );
}

function shouldRefreshOfflineSnapshot(snapshot: OfflineReportSnapshot | null, reportId: string) {
  if (!snapshot || !isSnapshotFresh(snapshot)) return true;

  const rowCount = snapshot.rows?.length ?? 0;
  const isInternalPl = shouldUseBackendSnapshotOnly(reportId);
  if (isInternalPl && rowCount < 10) return true;

  return false;
}

function shouldUseBackendSnapshotOnly(reportId: string) {
  const normalized = reportId.toLowerCase();
  return normalized.includes("internalp&l") || normalized.includes("internalp%26l");
}

// authHeader() replaced by authHeader() from @/lib/api-client

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

/**
 * For SDK-based secure embedding, ONLY reportEmbed URLs are valid.
 * A public "view?r=..." share link would cause the SDK to silently render
 * the public anonymous report, ignoring the access token entirely.
 */
function isSecureEmbedUrl(url?: string) {
  return typeof url === "string" && /^https:\/\/app\.powerbi\.com\/reportEmbed\?/i.test(url.trim());
}

function firstSecureEmbedUrl(urls: Array<string | undefined>) {
  return urls.find((url) => isSecureEmbedUrl(url));
}

/**
 * Power BI embed tokens carry a cluster URL in their second dot-separated segment.
 * For non-default-region workspaces (e.g. India Central) the SDK must be given a
 * reportEmbed URL that contains the ?config= param with that clusterUrl — otherwise
 * the request routes to the wrong cluster and Power BI returns 401 Unauthorized.
 *
 * Token format:  {gzip_b64}.{b64_json_metadata}
 * Metadata JSON: { clusterUrl, exp, allowAccessOverPublicInternet }
 */
function buildClusterAwareEmbedUrl(
  embedToken: string,
  reportId?: string,
  groupId?: string,
): string | null {
  if (!reportId || !groupId) return null;

  try {
    const parts = embedToken.split(".");
    if (parts.length >= 2) {
      const metaPart = parts[parts.length - 1];
      // Restore base64 padding
      const padded = metaPart + "==".slice((metaPart.length + 2) % 4 || 0);
      const meta = JSON.parse(atob(padded)) as { clusterUrl?: string };
      if (meta.clusterUrl) {
        // Build the same ?config= format Power BI's own UI generates
        const config = btoa(
          JSON.stringify({
            clusterUrl: meta.clusterUrl,
            embedFeatures: { usageMetricsVNext: true },
          }),
        );
        return `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${groupId}&config=${config}`;
      }
    }
  } catch {
    // Metadata parse failed — fall through to basic URL
  }

  // Last resort: legacy format. Works for default-region (US) workspaces only.
  return `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${groupId}`;
}

function sanitizeId(value: string) {
  return value.replace(/[^a-z0-9_-]/gi, "-");
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

async function syncOfflineSnapshot(id: string, cacheKey: string) {
  let lastError: unknown;

  for (const url of OFFLINE_REPORT_SNAPSHOT_URLS(id)) {
    try {
      const abort = new AbortController();
      const timeout = window.setTimeout(() => abort.abort(), OFFLINE_REPORT_SNAPSHOT_TIMEOUT_MS);
      const response = await fetch(url, {
        credentials: "include",
        headers: authHeader(),
        signal: abort.signal,
      });
      window.clearTimeout(timeout);

      if (!response.ok) {
        lastError = new Error(`Offline report snapshot request failed (${response.status})`);
        continue;
      }

      const snapshot = normalizeOfflineSnapshot(await response.json());
      if (!snapshot) {
        lastError = new Error("Offline report snapshot response did not include rows or image data");
        continue;
      }

      writeCachedReportSnapshot(cacheKey, snapshot);
      return readCachedReportSnapshot(cacheKey);
    } catch (error) {
      lastError = error;
    }
  }

  console.warn("Offline report snapshot sync failed:", lastError);
  return null;
}

async function cacheRenderedPowerBiData(
  report: EmbeddedPowerBiReport,
  models: PowerBiModels,
  cacheKey: string,
  title: string,
) {
  try {
    const pages = (await report.getPages?.()) ?? [];
    const page = pages.find((item) => item.isActive) ?? pages[0];
    const visuals = (await page?.getVisuals?.()) ?? [];
    const exportType = models.ExportDataType?.Summarized;

    for (const visual of visuals) {
      if (!visual.exportData || visual.type === "slicer") continue;

      const exported = await visual.exportData(exportType, 200);
      const rows = parsePowerBiCsv(exported.data);
      if (!rows.length) continue;

      writeCachedReportSnapshot(cacheKey, {
        title,
        lastSynced: new Date().toISOString(),
        rows,
      });
      return;
    }
  } catch (error) {
    console.warn("Power BI visual data cache failed:", error);
  }
}

function normalizeOfflineSnapshot(payload: unknown): Omit<OfflineReportSnapshot, "updatedAt"> | null {
  if (!payload || typeof payload !== "object") return null;

  const source = payload as {
    title?: string;
    last_synced?: string;
    lastSynced?: string;
    imageDataUrl?: string;
    image_data_url?: string;
    image?: string;
    metrics?: Array<{ label?: string; title?: string; value?: string | number; delta?: string }>;
    columns?: string[];
    rows?: Array<Record<string, unknown>>;
    data?: Array<Record<string, unknown>>;
    snapshot?: unknown;
    report?: unknown;
    cards?: Record<string, { title?: string; data?: Array<Record<string, unknown>> }>;
  };

  if (source.snapshot) return normalizeOfflineSnapshot(source.snapshot);
  if (source.report) return normalizeOfflineSnapshot(source.report);

  const cardRows = source.cards
    ? Object.values(source.cards).flatMap((card) => card.data ?? [])
    : [];
  const rows = source.rows ?? source.data ?? cardRows;
  const imageDataUrl = source.imageDataUrl ?? source.image_data_url ?? source.image;
  const metrics = source.metrics
    ?.map((metric) => ({
      label: metric.label ?? metric.title ?? "",
      value: metric.value ?? "",
      delta: metric.delta,
    }))
    .filter((metric) => metric.label && metric.value !== "");

  if (!imageDataUrl && !rows?.length && !metrics?.length) return null;

  return {
    title: source.title,
    lastSynced: source.lastSynced ?? source.last_synced,
    metrics,
    columns: source.columns,
    rows,
    imageDataUrl,
  };
}

function parsePowerBiCsv(value?: string) {
  if (!value) return [];

  const lines = value
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
  if (lines.length < 2) return [];

  const columns = parseCsvLine(lines[0]).map((column) => column.trim());
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return columns.reduce<Record<string, unknown>>((row, column, index) => {
      const cell = cells[index] ?? "";
      const numeric = Number(cell.replace(/,/g, ""));
      row[column] = cell && Number.isFinite(numeric) ? numeric : cell;
      return row;
    }, {});
  });
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  cells.push(current);
  return cells;
}
