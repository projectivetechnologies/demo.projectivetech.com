import { ReactNode, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/ChartCard";
import {
  OfflineReportSnapshot,
  readCachedReport,
  useOnlineStatus,
  writeCachedReport,
} from "@/lib/offline-reports";

const POWER_BI_FOOTER_CROP_PX = 44;
const REVENUE_MIS_CATEGORIES = [
  "Deselect all",
  "Body Belt & Braces",
  "Body Belt & Braces-OEM",
  "Cervical Aids",
  "Cervical Aids-OEM",
  "Economy Range",
  "Fingers, Wrist & Arm Supports",
  "Fingers, Wrist & Arm Supports-OEM",
  "Foot Care-OEM",
  "Fracture Aids",
  "Knee & Ankle Support",
  "Knee & Ankle Support-OEM",
  "Other Products",
  "Other Products-OEM",
];

interface ReportEmbedProps {
  title: string;
  subtitle?: string;
  height?: number;
  aspectRatio?: string;
  embedUrl?: string;
  cacheKey?: string;
  onOfflineOpen?: () => void;
  loading?: boolean;
  offlineSnapshot?: OfflineReportSnapshot | null;
  children?: ReactNode;
}

export function ReportEmbed({
  title,
  subtitle,
  height = 360,
  aspectRatio,
  embedUrl,
  cacheKey,
  onOfflineOpen,
  offlineSnapshot,
  children,
}: ReportEmbedProps) {
  const isOnline = useOnlineStatus();
  const cached = readCachedReport(cacheKey);
  const effectiveEmbedUrl = embedUrl ?? cached?.embedUrl;
  const [frameLoading, setFrameLoading] = useState(Boolean(effectiveEmbedUrl && isOnline));

  useEffect(() => {
    setFrameLoading(Boolean(effectiveEmbedUrl && isOnline));
  }, [effectiveEmbedUrl, isOnline]);

  useEffect(() => {
    if (isOnline && embedUrl) {
      writeCachedReport(cacheKey, {
        title,
        embedUrl,
      });
    }
  }, [cacheKey, embedUrl, isOnline, title]);

  return (
    <ChartCard
      title={title}
      subtitle={subtitle ?? "Embedded Power BI report"}
      actions={
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground border border-border/60 rounded-full px-2 py-0.5">
          PBI Embed
        </span>
      }
    >
      <div
        className="relative rounded-md border border-border/70 bg-muted/20 overflow-hidden"
        style={aspectRatio ? { aspectRatio } : { height }}
      >
        {!isOnline && offlineSnapshot ? (
          <OfflineSnapshotReport title={title} snapshot={offlineSnapshot} />
        ) : effectiveEmbedUrl ? (
          <>
            {frameLoading && (
              <div className="absolute inset-0 z-10 grid place-items-center bg-background/80">
                <div className="text-center">
                  <div className="mx-auto h-10 w-10 rounded-lg bg-[image:var(--gradient-primary)] grid place-items-center surface-glow mb-3">
                    <span className="font-display text-sm font-bold text-primary-foreground">P</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Loading report...</p>
                  {!isOnline && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Offline mode uses the last cached report URL.
                    </p>
                  )}
                </div>
              </div>
            )}
            <iframe
              title={title}
              src={effectiveEmbedUrl}
              onLoad={() => setFrameLoading(false)}
              allowFullScreen
              className="h-full w-full border-0 bg-background"
              style={{
                height: `calc(100% + ${POWER_BI_FOOTER_CROP_PX}px)`,
              }}
            />
            {!isOnline && onOfflineOpen && (
              <button
                type="button"
                onClick={onOfflineOpen}
                className="absolute inset-0 z-20 grid place-items-center bg-background/70 text-sm font-medium text-foreground transition-colors hover:bg-background/80"
              >
                Open cached report
              </button>
            )}
          </>
        ) : (
          <div className="relative grid h-full place-items-center">
            <div
              aria-hidden
              className="absolute inset-0 opacity-60"
              style={{ backgroundImage: "var(--gradient-aurora)" }}
            />
            <div className="relative text-center px-6">
              <div className="mx-auto h-10 w-10 rounded-lg bg-[image:var(--gradient-primary)] grid place-items-center surface-glow mb-3">
                <span className="font-display text-sm font-bold text-primary-foreground">P</span>
              </div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isOnline
                  ? "Power BI report renders here once embed details are available."
                  : "Offline mode is active. This report will appear after it has been loaded once online."}
              </p>
              {children && <div className="mt-3">{children}</div>}
            </div>
          </div>
        )}
      </div>
    </ChartCard>
  );
}

function OfflineSnapshotReport({
  title,
  snapshot,
}: {
  title: string;
  snapshot: OfflineReportSnapshot;
}) {
  const rows = snapshot.rows ?? [];
  const columns = snapshot.columns?.length ? snapshot.columns : inferColumns(rows);
  const reportName = `${snapshot.title ?? title}`.toLowerCase();
  const isRevenueReport = reportName.includes("revenue");
  const isBalanceSheet = reportName.includes("balance");
  const isInternalPl = reportName.includes("p&l") || reportName.includes("p &l") || reportName.includes("p & l");

  return (
    <div className="flex h-full min-h-0 flex-col bg-white p-4">
      {snapshot.imageDataUrl ? (
        <img
          src={snapshot.imageDataUrl}
          alt={`${title} offline report`}
          className="min-h-0 flex-1 object-contain"
        />
      ) : rows.length && isRevenueReport ? (
        <RevenueOfflineReport rows={rows} columns={columns} />
      ) : rows.length && isBalanceSheet ? (
        <BalanceSheetOfflineReport rows={rows} columns={columns} />
      ) : rows.length && isInternalPl ? (
        <InternalPlOfflineReport rows={rows} columns={columns} />
      ) : rows.length ? (
        <PowerBiMatrixReport rows={rows} columns={columns} />
      ) : (
        <div className="min-h-0 flex-1" />
      )}
    </div>
  );
}

function InternalPlOfflineReport({
  rows,
  columns,
}: {
  rows: Array<Record<string, unknown>>;
  columns: string[];
}) {
  const accountColumn = findColumn(columns, ["account_name", "Account Name", "Name"]) ?? columns[0];
  const monthColumn = findColumn(columns, ["month", "Date", "Month"]) ?? columns[1];
  const valueColumn =
    findColumn(columns, ["Amount", "Sum Of Final Value", "Final Value", "Value"]) ??
    columns.find((column) => rows.some((row) => toNumber(row[column]) !== null));
  const matrix = buildMonthMatrix(rows, accountColumn, monthColumn, valueColumn);

  if (!matrix.months.length || !matrix.rows.length) {
    return <PowerBiMatrixReport rows={rows} columns={columns} />;
  }

  return (
    <div className="flex h-full min-h-0 bg-white">
      <div className="min-h-0 flex-1 overflow-auto border border-[#9c9c9c] bg-white">
        <table className="w-full min-w-[760px] table-fixed text-left text-[8px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#1f1f1f] text-white">
              <th className="w-[170px] px-2 py-1.5 font-bold">FY</th>
              {matrix.months.map((month) => (
                <th key={month} className="px-1 py-1.5 text-center font-bold">
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.rows.slice(0, 44).map((row, rowIndex) => (
              <tr key={row.name} className={rowIndex % 2 === 0 ? "bg-[#8fc9f5]" : "bg-[#39a2ef]"}>
                <td className="truncate border-r border-white/50 px-2 py-1.5 font-semibold text-[#061726]" title={row.name}>
                  {row.name}
                </td>
                {matrix.months.map((month) => (
                  <td key={month} className="border-r border-white/40 px-1 py-1.5 text-right text-[#061726]">
                    {formatCompactCell(row.values[month])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ml-2 w-16 shrink-0 text-[10px]">
        <p className="mb-1 text-[#333]">FY</p>
        <label className="flex items-center gap-1">
          <span className="h-3 w-3 border border-[#777]" /> 24-25
        </label>
      </div>
    </div>
  );
}

function BalanceSheetOfflineReport({
  rows,
  columns,
}: {
  rows: Array<Record<string, unknown>>;
  columns: string[];
}) {
  const accountColumn = findColumn(columns, ["account_name", "Account Name", "Name"]) ?? columns[0];
  const typeColumn = findColumn(columns, ["account_type1", "Account Type", "Type"]);
  const valueColumn =
    findColumn(columns, ["Sum Of Final Value", "Final Value", "Amount", "Value"]) ??
    columns.find((column) => rows.some((row) => toNumber(row[column]) !== null));
  const monthColumn = findColumn(columns, ["month", "Date", "Month"]);
  const monthLabel = getMonthLabel(rows[0]?.[monthColumn ?? ""]) ?? "Dec";
  const matrixRows = buildBalanceRows(rows, accountColumn, typeColumn, valueColumn);
  const totalInventory = sumByMatcher(rows, accountColumn, valueColumn, /inventory/i);
  const totalAssets = sumByMatcher(rows, typeColumn ?? accountColumn, valueColumn, /asset|cash|bank|stock/i);
  const total = rows.reduce((sum, row) => sum + (toNumber(row[valueColumn ?? ""]) ?? 0), 0);

  if (!matrixRows.length) {
    return <PowerBiMatrixReport rows={rows} columns={columns} />;
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_120px] gap-5 bg-white px-8 py-0">
      <div className="min-h-0 overflow-auto border border-[#8d8d8d] bg-white">
        <table className="w-full table-fixed text-left text-[9px]">
          <colgroup>
            <col style={{ width: "72%" }} />
            <col style={{ width: "28%" }} />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-[#1f1f1f] text-white">
            <tr>
              <th className="px-2 py-1.5 font-bold">▲</th>
              <th className="px-2 py-1.5 text-center font-bold">{monthLabel}</th>
            </tr>
          </thead>
          <tbody>
            {matrixRows.slice(0, 42).map((row, rowIndex) => (
              <tr key={`${row.name}-${rowIndex}`} className={rowIndex % 2 === 0 ? "bg-[#8fc9f5]" : "bg-[#39a2ef]"}>
                <td className="truncate border-r border-white/50 px-2 py-1.5 font-semibold text-[#061726]" title={row.name}>
                  {row.name}
                </td>
                <td className="px-2 py-1.5 text-center font-bold text-[#061726]">
                  {formatCompactCell(row.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex min-h-0 flex-col items-center gap-3 pt-4">
        <div className="w-16 border border-[#9c9c9c] px-2 py-3 text-center text-[9px]">
          <p className="text-[#333]">FY</p>
          <p className="mt-2">24-25</p>
        </div>
        <BalanceKpi value={totalInventory || 100_000} label="Total Inventory" />
        <BalanceKpi value={totalAssets || 2_000_000} label="Total Assets" />
        <BalanceKpi value={total || 5_000_000} label="Total" />
      </div>
    </div>
  );
}

function BalanceKpi({ value, label }: { value: number; label: string }) {
  return (
    <div className="grid h-20 w-24 place-items-center border border-[#9c9c9c] bg-white text-center">
      <div>
        <p className="text-2xl font-medium text-[#333]">{formatBigKpi(value)}</p>
        <p className="mt-1 text-[9px] text-[#777]">{label}</p>
      </div>
    </div>
  );
}

function RevenueOfflineReport({
  rows,
  columns,
}: {
  rows: Array<Record<string, unknown>>;
  columns: string[];
}) {
  const dateColumn = findColumn(columns, ["Transaction Date", "Date", "activity date"]);
  const categoryColumn = findColumn(columns, ["MIS Category", "Category"]) ?? columns[0];
  const valueColumn =
    findColumn(columns, ["Sales Amount", "Revenue", "Gross Amount", "Sum Of Final Value", "Value"]) ??
    columns.find((column) => rows.some((row) => toNumber(row[column]) !== null));
  const waterfallRows = buildWaterfallRows(rows, columns, dateColumn, valueColumn);
  const maxValue = Math.max(...waterfallRows.map((row) => row.end), 0);
  const cachedCategories = rows
    .map((row) => String(row[categoryColumn] ?? "").trim())
    .filter(Boolean);
  const categories = Array.from(
    new Set([...REVENUE_MIS_CATEGORIES, ...cachedCategories]),
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 px-2 pb-1 pt-1">
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={waterfallRows} margin={{ top: 18, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#dedede" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={formatAxisMillions}
              tickLine={false}
              axisLine={false}
              domain={[0, Math.ceil(maxValue * 1.08)]}
              width={42}
            />
            <Bar dataKey="start" stackId="waterfall" fill="transparent" isAnimationActive={false} />
            <Bar dataKey="barValue" stackId="waterfall" radius={[0, 0, 0, 0]} isAnimationActive={false}>
              {waterfallRows.map((row) => (
                <Cell key={row.name} fill={row.fill} />
              ))}
              <LabelList dataKey="value" position="top" formatter={formatCompactNumber} fontSize={8} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="shrink-0">
        <p className="mb-1 text-[10px] font-medium text-[#333]">MIS Category</p>
        <div className="grid grid-cols-4 overflow-hidden border border-[#d9d9d9] text-[8px] font-semibold">
          {categories.slice(0, 16).map((category, index) => (
            <div
              key={`${category}-${index}`}
              className={`truncate border-b border-r border-[#d9d9d9] px-2 py-1.5 ${
                category ? "bg-[#24211f] text-white" : "bg-white text-white"
              }`}
              title={category}
            >
              {category}
            </div>
          ))}
          {Array.from({ length: Math.max(0, 16 - categories.slice(0, 16).length) }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="border-b border-r border-[#d9d9d9] bg-white px-2 py-1.5 text-white"
            >
              &nbsp;
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildWaterfallRows(
  rows: Array<Record<string, unknown>>,
  columns: string[],
  dateKey?: string,
  valueKey?: string,
) {
  const visualRows = readVisualWaterfallRows(rows, columns);
  const sourceRows = visualRows.length ? visualRows : aggregateRowsByYear(rows, dateKey, valueKey);
  let runningTotal = 0;

  return sourceRows.flatMap((row, index) => {
    const isTotal = row.name.toLowerCase() === "total";
    if (isTotal) {
      return [
        {
          name: row.name,
          start: 0,
          value: row.value,
          barValue: row.value,
          end: row.value,
          fill: "#1d8ff2",
        },
      ];
    }

    const start = runningTotal;
    const end = runningTotal + row.value;
    runningTotal = end;

    const isLastDelta = index === sourceRows.length - 1 && !sourceRows.some((item) => item.name.toLowerCase() === "total");
    return [
      {
        name: row.name,
        start,
        value: row.value,
        barValue: row.value,
        end,
        fill: isLastDelta ? "#20aa46" : "#20aa46",
      },
    ];
  }).concat(
    sourceRows.some((row) => row.name.toLowerCase() === "total") || !sourceRows.length
      ? []
      : [
          {
            name: "Total",
            start: 0,
            value: runningTotal,
            barValue: runningTotal,
            end: runningTotal,
            fill: "#1d8ff2",
          },
        ],
  );
}

function readVisualWaterfallRows(rows: Array<Record<string, unknown>>, columns: string[]) {
  const labelColumn = findColumn(columns, ["Year", "FY", "Fiscal Year", "Category", "Axis", "Name"]);
  const valueColumn =
    findColumn(columns, ["Value", "Sales Amount", "Revenue", "Y", "Amount"]) ??
    columns.find((column) => rows.some((row) => toNumber(row[column]) !== null));

  if (!labelColumn || !valueColumn) return [];

  const visualRows = rows
    .map((row) => ({
      name: String(row[labelColumn] ?? "").trim(),
      value: toNumber(row[valueColumn]) ?? 0,
    }))
    .filter((row) => row.name && row.value !== 0);

  const looksLikeVisual =
    visualRows.some((row) => row.name.toLowerCase() === "total") ||
    visualRows.every((row) => /^(19|20)\d{2}$/.test(row.name));

  if (!looksLikeVisual) return [];

  const groupedRows = new Map<string, number>();
  visualRows.forEach((row) => {
    const key = /^(19|20)\d{2}$/.test(row.name) ? row.name : row.name;
    groupedRows.set(key, (groupedRows.get(key) ?? 0) + row.value);
  });

  return Array.from(groupedRows.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      if (a.name.toLowerCase() === "total") return 1;
      if (b.name.toLowerCase() === "total") return -1;
      return a.name.localeCompare(b.name);
    });
}

function aggregateRowsByYear(
  rows: Array<Record<string, unknown>>,
  dateKey?: string,
  valueKey?: string,
) {
  if (!dateKey || !valueKey) return [];

  const values = new Map<string, number>();
  rows.forEach((row) => {
    const year = getYear(row[dateKey]);
    const value = toNumber(row[valueKey]) ?? 0;
    if (!year) return;
    values.set(year, (values.get(year) ?? 0) + value);
  });

  return Array.from(values.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function getYear(value: unknown) {
  if (value instanceof Date) return String(value.getFullYear());
  if (typeof value === "number") return String(new Date(value).getFullYear());
  if (typeof value !== "string") return null;
  const yearMatch = value.match(/\b(20\d{2}|19\d{2})\b/);
  if (yearMatch) return yearMatch[1];
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : String(parsed.getFullYear());
}

function formatAxisMillions(value: unknown) {
  const numeric = toNumber(value) ?? 0;
  if (Math.abs(numeric) >= 1_000_000) return `${(numeric / 1_000_000).toFixed(1)}M`;
  if (Math.abs(numeric) >= 1_000) return `${Math.round(numeric / 1_000)}K`;
  return `${Math.round(numeric)}`;
}

function findColumn(columns: string[], names: string[]) {
  const normalizedColumns = columns.map((column) => ({
    original: column,
    normalized: normalizeColumnName(column),
  }));

  for (const name of names) {
    const normalizedName = normalizeColumnName(name);
    const exact = normalizedColumns.find((column) => column.normalized === normalizedName);
    if (exact) return exact.original;

    const suffix = normalizedColumns.find((column) => column.normalized.endsWith(normalizedName));
    if (suffix) return suffix.original;

    const includes = normalizedColumns.find((column) => column.normalized.includes(normalizedName));
    if (includes) return includes.original;
  }

  return undefined;
}

function normalizeColumnName(value: string) {
  return value
    .replace(/[\[\]._-]+/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function buildMonthMatrix(
  rows: Array<Record<string, unknown>>,
  accountKey?: string,
  monthKey?: string,
  valueKey?: string,
) {
  if (accountKey === undefined || monthKey === undefined || valueKey === undefined) {
    return { months: [], rows: [] };
  }

  const monthKeys = Array.from(
    new Set(rows.map((row) => getMonthKey(row[monthKey])).filter(Boolean) as string[]),
  ).sort();
  const values = new Map<string, Record<string, number>>();

  rows.forEach((row) => {
    const account = String(row[accountKey] ?? "Other").trim();
    const month = getMonthKey(row[monthKey]);
    const value = toNumber(row[valueKey]) ?? 0;
    if (!account || !month) return;
    const item = values.get(account) ?? {};
    item[month] = (item[month] ?? 0) + value;
    values.set(account, item);
  });

  return {
    months: monthKeys.map(formatMonthShort),
    rows: Array.from(values.entries()).map(([name, monthlyValues]) => ({
      name,
      values: Object.fromEntries(
        Object.entries(monthlyValues).map(([month, value]) => [formatMonthShort(month), value]),
      ),
    })),
  };
}

function buildBalanceRows(
  rows: Array<Record<string, unknown>>,
  accountKey?: string,
  typeKey?: string,
  valueKey?: string,
) {
  if (accountKey === undefined || valueKey === undefined) return [];

  const values = new Map<string, number>();
  rows.forEach((row) => {
    const account = String(row[accountKey] ?? "Other").trim();
    const value = toNumber(row[valueKey]) ?? 0;
    if (!account) return;
    values.set(account, (values.get(account) ?? 0) + value);
  });

  const accountRows = Array.from(values.entries()).map(([name, value]) => ({ name, value }));
  const assetTotal = sumByMatcher(rows, typeKey ?? accountKey, valueKey, /asset|cash|bank|stock/i);
  const liabilityTotal = sumByMatcher(rows, typeKey ?? accountKey, valueKey, /liability|payable/i);
  const equityTotal = sumByMatcher(rows, typeKey ?? accountKey, valueKey, /equity/i);

  return [
    { name: "EQUITY AND LIABILITIES", value: equityTotal + liabilityTotal },
    { name: "TOTAL", value: equityTotal + liabilityTotal },
    { name: "ASSETS", value: assetTotal },
    ...accountRows,
    { name: "Shareholder's Funds", value: equityTotal },
  ];
}

function getMonthKey(value: unknown) {
  if (value instanceof Date) return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthShort(value: string) {
  if (!/^\d{4}-\d{2}$/.test(value)) return value;
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("en-US", { month: "short" });
}

function getMonthLabel(value: unknown) {
  const key = getMonthKey(value);
  return key ? formatMonthShort(key) : null;
}

function sumByMatcher(
  rows: Array<Record<string, unknown>>,
  labelKey: string | undefined,
  valueKey: string | undefined,
  matcher: RegExp,
) {
  if (labelKey === undefined || valueKey === undefined) return 0;
  return rows.reduce((sum, row) => {
    const label = String(row[labelKey] ?? "");
    if (!matcher.test(label)) return sum;
    return sum + (toNumber(row[valueKey]) ?? 0);
  }, 0);
}

function PowerBiMatrixReport({
  rows,
  columns,
}: {
  rows: Array<Record<string, unknown>>;
  columns: string[];
}) {
  const visibleColumns = columns.slice(0, 5);

  return (
    <div className="h-full min-h-0 flex-1 overflow-auto border border-[#8d8d8d] bg-white">
      <table className="w-full table-fixed text-left text-[10px]">
        <colgroup>
          {visibleColumns.map((column, index) => (
            <col
              key={column}
              style={{
                width: index === 0 ? "44%" : `${56 / Math.max(visibleColumns.length - 1, 1)}%`,
              }}
            />
          ))}
        </colgroup>
        <thead className="sticky top-0 z-10 bg-[#1f1f1f] text-white">
          <tr>
            {visibleColumns.map((column, index) => (
              <th
                key={column}
                className={`px-2 py-1.5 font-semibold leading-tight ${index > 0 ? "text-center" : ""}`}
              >
                {index === 0 ? "" : humanizeColumn(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 80).map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? "bg-[#8fc9f5]" : "bg-[#39a2ef]"}
            >
              {visibleColumns.map((column, columnIndex) => (
                <td
                  key={column}
                  className={`truncate border-r border-white/50 px-2 py-1.5 leading-tight text-[#061726] ${
                    columnIndex > 0 ? "text-center font-semibold" : "font-semibold"
                  }`}
                >
                  {formatCell(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function inferColumns(rows: Array<Record<string, unknown>>) {
  return Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).slice(0, 8);
}

function humanizeColumn(column: string) {
  return column.replace(/[_-]+/g, " ").replace(/\b\w/g, (value) => value.toUpperCase());
}

function formatCell(value: unknown) {
  if (typeof value === "number") return value.toLocaleString();
  if (value === null || value === undefined) return "-";
  return String(value);
}

function formatCompactCell(value: unknown) {
  const numeric = toNumber(value);
  if (numeric === null) return "-";
  return Math.round(numeric).toLocaleString();
}

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return null;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCompactNumber(value: unknown) {
  const numeric = toNumber(value) ?? 0;
  if (Math.abs(numeric) >= 1_000_000) return `${Math.round(numeric / 1_000_000)}M`;
  if (Math.abs(numeric) >= 1_000) return `${Math.round(numeric / 1_000)}K`;
  return `${Math.round(numeric)}`;
}

function formatBigKpi(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${Math.round(value / 1_000_000)}M`;
  if (abs >= 1_000) return `${Math.round(value / 1_000)}K`;
  return `${Math.round(value)}`;
}
