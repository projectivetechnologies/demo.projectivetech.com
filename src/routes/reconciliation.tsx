import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Tag,
  Package,
  Zap,
  Gauge,
  Layers,
  Building2,
  ArrowRight,
} from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { ChartCard } from "@/components/ChartCard";
import { PlanActualWaterfall } from "@/components/PlanActualWaterfall";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  reconciliationSummary,
  reconciliationTrend,
  reconciliationAccounts,
  varianceByCategory,
  aiInsights,
  standardCostingSummary,
  marginBridge,
  standardCostVariances,
  planVarianceSummary,
} from "@/lib/mock-data";

export const Route = createFileRoute("/reconciliation")({
  head: () => ({
    meta: [
      { title: "Reconciliation & Variance · IMAGE-I" },
      {
        name: "description",
        content:
          "Books vs reports reconciliation with variance analysis and AI-driven management insights.",
      },
      { property: "og:title", content: "Reconciliation & Variance · IMAGE-I" },
      {
        property: "og:description",
        content:
          "Reconcile ledger to source reports, surface variances, and act on AI-generated commentary.",
      },
    ],
  }),
  component: ReconciliationPage,
});

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

// Period catalogue for reconciliation comparisons (past completed periods only)
type PeriodKey =
  | "Q1-2026"
  | "Q4-2025"
  | "Q3-2025"
  | "Q2-2025"
  | "Q1-2025"
  | "FY-2025";

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "Q1-2026", label: "Q1 2026" },
  { key: "Q4-2025", label: "Q4 2025" },
  { key: "Q3-2025", label: "Q3 2025" },
  { key: "Q2-2025", label: "Q2 2025" },
  { key: "Q1-2025", label: "Q1 2025" },
  { key: "FY-2025", label: "FY 2025" },
];

// Deterministic scaling factor per period for mock comparison
const PERIOD_FACTOR: Record<PeriodKey, number> = {
  "Q1-2026": 0.92,
  "Q4-2025": 0.95,
  "Q3-2025": 0.93,
  "Q2-2025": 0.88,
  "Q1-2025": 0.84,
  "FY-2025": 0.9,
};

// Plan EBITDA anchor per period (mock)
const PERIOD_PLAN_EBITDA: Record<PeriodKey, number> = {
  "Q1-2026": 1_580_000,
  "Q4-2025": 1_640_000,
  "Q3-2025": 1_510_000,
  "Q2-2025": 1_420_000,
  "Q1-2025": 1_360_000,
  "FY-2025": 5_930_000,
};

// Deterministic driver set per (base → compare) pair. Driver values represent
// how the base period moved vs the compare period's plan baseline.
function buildDrivers(base: PeriodKey, compare: PeriodKey) {
  const bf = PERIOD_FACTOR[base];
  const cf = PERIOD_FACTOR[compare];
  const swing = (bf - cf) * 1_000_000; // scales with the gap between periods
  const sign = swing >= 0 ? 1 : -1;
  const mag = Math.max(80_000, Math.abs(swing));
  return [
    { name: "Revenue mix", delta: Math.round(sign * mag * 0.42) },
    { name: "Price realisation", delta: Math.round(sign * mag * 0.28) },
    { name: "Marketing spend", delta: Math.round(-sign * mag * 0.24) },
    { name: "Logistics savings", delta: Math.round(sign * mag * 0.14) },
    { name: "People cost", delta: Math.round(sign * mag * 0.08) },
    { name: "FX impact", delta: Math.round(-sign * mag * 0.06) },
  ];
}

const labelFor = (k: PeriodKey) => PERIODS.find((p) => p.key === k)!.label;

function StatusPill({ status }: { status: "matched" | "variance" | "missing" }) {
  const cfg = {
    matched: { cls: "border-success/30 bg-success/10 text-success", label: "Matched" },
    variance: { cls: "border-warning/40 bg-warning/15 text-warning", label: "Variance" },
    missing: { cls: "border-destructive/30 bg-destructive/10 text-destructive", label: "Missing" },
  }[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function iconForDriver(driver: string) {
  if (driver.startsWith("Selling Price")) return Tag;
  if (driver.startsWith("Sales Volume")) return TrendingUp;
  if (driver.startsWith("Sales Mix")) return Layers;
  if (driver.startsWith("Input")) return Package;
  if (driver.startsWith("Material Usage")) return Gauge;
  if (driver.startsWith("Power & Fuel — Rate")) return Zap;
  if (driver.startsWith("Power & Fuel — Consumption")) return Gauge;
  if (driver.startsWith("Other Variable")) return Layers;
  if (driver.startsWith("Fixed")) return Building2;
  return Sparkles;
}

function formatMetric(n: number, kind: "price" | "volume" | "mix" | "rate" | "usage" | "spend") {
  if (kind === "price") return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (kind === "rate") return `$${n.toFixed(3)}`;
  if (kind === "spend") return fmt(n);
  if (kind === "usage") return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return n.toLocaleString();
}

function ReconciliationPage() {
  const s = reconciliationSummary;
  const [basePeriod, setBasePeriod] = useState<PeriodKey>("Q1-2026");
  const [comparePeriod, setComparePeriod] = useState<PeriodKey>("Q4-2025");
  const [activeTab, setActiveTab] = useState<"accuracy" | "period">("accuracy");

  const comparison = useMemo(() => {
    const bf = PERIOD_FACTOR[basePeriod];
    const cf = PERIOD_FACTOR[comparePeriod];
    const baseNet = s.netVariance * bf;
    const compareNet = s.netVariance * cf;
    const baseMatch = Math.min(99.9, s.matchRate * (0.9 + bf * 0.1));
    const compareMatch = Math.min(99.9, s.matchRate * (0.9 + cf * 0.1));
    const baseAbs = s.absVariance * bf;
    const compareAbs = s.absVariance * cf;
    return {
      baseNet,
      compareNet,
      deltaNet: baseNet - compareNet,
      baseMatch,
      compareMatch,
      deltaMatch: baseMatch - compareMatch,
      baseAbs,
      compareAbs,
      deltaAbs: baseAbs - compareAbs,
    };
  }, [basePeriod, comparePeriod, s]);

  const sevColor = (sev: "high" | "medium" | "low") =>
    sev === "high"
      ? "border-destructive/30 bg-destructive/5 text-destructive"
      : sev === "medium"
        ? "border-warning/40 bg-warning/5 text-warning"
        : "border-success/30 bg-success/5 text-success";

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Reconciliation Engine"
        title="Books vs Reports — Variance Intelligence"
        description={`Comparing ${labelFor(basePeriod)} vs ${labelFor(comparePeriod)} · Last run ${s.lastRun}`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Base</span>
              <Select value={basePeriod} onValueChange={(v) => setBasePeriod(v as PeriodKey)}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p) => (
                    <SelectItem key={p.key} value={p.key} className="text-xs">
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Vs</span>
              <Select value={comparePeriod} onValueChange={(v) => setComparePeriod(v as PeriodKey)}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p) => (
                    <SelectItem key={p.key} value={p.key} className="text-xs">
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" type="button" onClick={() => setActiveTab("period")}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run
            </Button>
            <Button
              size="sm"
              className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI commentary
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "accuracy" | "period")} className="px-6 lg:px-10 mt-2">
        <TabsList>
          <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
          <TabsTrigger value="period">Period Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="accuracy" className="mt-4 space-y-0">

      {/* Period comparison strip */}
      <section className="px-6 lg:px-10 -mt-2 mb-4">
        <div className="surface-card p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "Match Rate",
              base: `${comparison.baseMatch.toFixed(1)}%`,
              compare: `${comparison.compareMatch.toFixed(1)}%`,
              delta: comparison.deltaMatch,
              suffix: "pp",
              positiveGood: true,
            },
            {
              label: "Net Variance",
              base: fmt(comparison.baseNet),
              compare: fmt(comparison.compareNet),
              delta: comparison.deltaNet,
              suffix: "",
              positiveGood: true,
              isCurrency: true,
            },
            {
              label: "Abs Variance",
              base: fmt(comparison.baseAbs),
              compare: fmt(comparison.compareAbs),
              delta: comparison.deltaAbs,
              suffix: "",
              positiveGood: false,
              isCurrency: true,
            },
          ].map((row) => {
            const good = row.positiveGood ? row.delta >= 0 : row.delta <= 0;
            const deltaText = row.isCurrency
              ? fmt(row.delta)
              : `${row.delta >= 0 ? "+" : ""}${row.delta.toFixed(1)}${row.suffix}`;
            return (
              <div key={row.label} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {row.label}
                  </p>
                  <p className="font-display text-lg font-semibold mt-1">{row.base}</p>
                  <p className="text-[11px] text-muted-foreground">
                    vs {row.compare} ({labelFor(comparePeriod)})
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${
                    good
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                  }`}
                >
                  {good ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {deltaText}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Summary KPIs */}
      <section className="px-6 lg:px-10 -mt-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Match Rate</p>
            <Scale className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 font-display text-3xl font-semibold">{s.matchRate.toFixed(1)}%</p>
          <Progress value={s.matchRate} className="mt-3 h-1.5" />
          <p className="mt-2 text-xs text-muted-foreground">
            {s.matched.toLocaleString()} of {s.totalRecords.toLocaleString()} records
          </p>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Variances</p>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </div>
          <p className="mt-3 font-display text-3xl font-semibold">{s.variances}</p>
          <p className="mt-2 text-xs text-muted-foreground">Records outside tolerance</p>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Missing</p>
            <XCircle className="h-4 w-4 text-destructive" />
          </div>
          <p className="mt-3 font-display text-3xl font-semibold">{s.missing}</p>
          <p className="mt-2 text-xs text-muted-foreground">Unmatched on either side</p>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Net Variance</p>
            {s.netVariance < 0 ? (
              <TrendingDown className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingUp className="h-4 w-4 text-success" />
            )}
          </div>
          <p className="mt-3 font-display text-3xl font-semibold">{fmt(s.netVariance)}</p>
          <p className="mt-2 text-xs text-muted-foreground">Abs: {fmt(s.absVariance)}</p>
        </div>
      </section>

      {/* Charts */}
      <section className="px-6 lg:px-10 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Match Rate Trend" subtitle="6-month reconciliation health" className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reconciliationTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis domain={[90, 100]} stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="matchRate" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Variance by Category" subtitle="Plan vs actual · USD" className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={varianceByCategory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="category" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(v: number) => fmt(v)}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="variance" radius={[6, 6, 0, 0]}>
                {varianceByCategory.map((d, i) => (
                  <Cell key={i} fill={d.variance >= 0 ? "var(--color-success)" : "var(--color-destructive)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Tabs */}
      <section className="px-6 lg:px-10 mt-6">
        <Tabs defaultValue="accounts">
          <TabsList>
            <TabsTrigger value="accounts">Account Reconciliation</TabsTrigger>
            <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="mt-4">
            <div className="surface-card overflow-hidden">
              <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-border/60 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <div className="col-span-5">Account</div>
                <div className="col-span-2 text-right">Books</div>
                <div className="col-span-2 text-right">Reports</div>
                <div className="col-span-2 text-right">Variance</div>
                <div className="col-span-1 text-right">Status</div>
              </div>
              <div className="divide-y divide-border/60">
                {reconciliationAccounts.map((row) => (
                  <div key={row.account} className="grid grid-cols-12 gap-3 px-5 py-3 items-center text-sm hover:bg-muted/40 transition-colors">
                    <div className="col-span-5 flex items-center gap-2">
                      {row.status === "matched" ? (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      ) : row.status === "variance" ? (
                        <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive shrink-0" />
                      )}
                      <span className="font-medium">{row.account}</span>
                    </div>
                    <div className="col-span-2 text-right font-mono text-xs">{fmt(row.books)}</div>
                    <div className="col-span-2 text-right font-mono text-xs">{fmt(row.report)}</div>
                    <div
                      className={`col-span-2 text-right font-mono text-xs ${
                        row.variance === 0
                          ? "text-muted-foreground"
                          : row.variance > 0
                            ? "text-success"
                            : "text-destructive"
                      }`}
                    >
                      {row.variance === 0 ? "—" : fmt(row.variance)}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <StatusPill status={row.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="variance" className="mt-4 space-y-6">
            {/* Standard costing summary strip */}
            <div className="surface-card p-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Standard Costing · Margin Bridge
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold">
                    Planned → Actual Margin Walk · {standardCostingSummary.period}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Quantities in {standardCostingSummary.uom} · {standardCostingSummary.currency}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Planned</p>
                    <p className="font-mono text-sm">{fmt(standardCostingSummary.plannedMargin)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Actual</p>
                    <p className="font-mono text-sm">{fmt(standardCostingSummary.actualMargin)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Net</p>
                    <p
                      className={`font-mono text-sm ${
                        standardCostingSummary.totalVariance >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {fmt(standardCostingSummary.totalVariance)}{" "}
                      <span className="text-[10px] uppercase">
                        {standardCostingSummary.totalVariance >= 0 ? "F" : "U"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Bridge bars */}
              <div className="mt-6 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marginBridge} margin={{ top: 10, right: 10, left: -10, bottom: 30 }}>
                    <CartesianGrid stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="var(--color-muted-foreground)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      angle={-18}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis
                      stroke="var(--color-muted-foreground)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(v: number) => fmt(v)}
                      contentStyle={{
                        background: "var(--color-popover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {marginBridge.map((d, i) => (
                        <Cell
                          key={i}
                          fill={
                            d.type === "anchor"
                              ? "var(--color-primary)"
                              : d.value >= 0
                                ? "var(--color-success)"
                                : "var(--color-destructive)"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Standard costing variance cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {standardCostVariances.map((v) => {
                const Icon = iconForDriver(v.driver);
                const fav = v.nature === "favorable";
                return (
                  <div key={v.id} className="surface-card p-5">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg grid place-items-center shrink-0 ${
                          fav ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-semibold">{v.driver}</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                              {v.formula}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p
                              className={`font-mono text-sm font-semibold ${
                                fav ? "text-success" : "text-destructive"
                              }`}
                            >
                              {fmt(v.variance)}
                            </p>
                            <span
                              className={`inline-block text-[10px] uppercase tracking-[0.16em] px-1.5 py-0.5 rounded mt-1 ${
                                fav
                                  ? "bg-success/10 text-success"
                                  : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              {fav ? "Favourable" : "Unfavourable"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                          <div className="rounded-md bg-muted/50 px-2 py-1.5">
                            <p className="text-muted-foreground uppercase tracking-wider text-[9px]">
                              Standard
                            </p>
                            <p className="font-mono mt-0.5">{formatMetric(v.standard, v.kind)}</p>
                          </div>
                          <div className="rounded-md bg-muted/50 px-2 py-1.5">
                            <p className="text-muted-foreground uppercase tracking-wider text-[9px]">
                              Actual
                            </p>
                            <p className="font-mono mt-0.5">{formatMetric(v.actual, v.kind)}</p>
                          </div>
                          <div className="rounded-md bg-muted/50 px-2 py-1.5">
                            <p className="text-muted-foreground uppercase tracking-wider text-[9px]">
                              Qty / Base
                            </p>
                            <p className="font-mono mt-0.5">{v.qty.toLocaleString()}</p>
                          </div>
                        </div>

                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                          {v.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legacy P&L category roll-up retained for context */}
            <div className="surface-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border/60">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  P&L Category Roll-up
                </p>
              </div>
              <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-border/60 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <div className="col-span-3">Category</div>
                <div className="col-span-2 text-right">Planned</div>
                <div className="col-span-2 text-right">Actual</div>
                <div className="col-span-2 text-right">Variance</div>
                <div className="col-span-3">Drivers</div>
              </div>
              <div className="divide-y divide-border/60">
                {varianceByCategory.map((row) => {
                  const pct = (row.variance / row.planned) * 100;
                  const favorable = row.variance >= 0;
                  return (
                    <div
                      key={row.category}
                      className="grid grid-cols-12 gap-3 px-5 py-3 items-center text-sm hover:bg-muted/40 transition-colors"
                    >
                      <div className="col-span-3 font-medium">{row.category}</div>
                      <div className="col-span-2 text-right font-mono text-xs">{fmt(row.planned)}</div>
                      <div className="col-span-2 text-right font-mono text-xs">{fmt(row.actual)}</div>
                      <div className="col-span-2 text-right">
                        <div
                          className={`font-mono text-xs ${
                            favorable ? "text-success" : "text-destructive"
                          }`}
                        >
                          {fmt(row.variance)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{pct.toFixed(1)}%</div>
                      </div>
                      <div className="col-span-3 text-xs text-muted-foreground">{row.drivers}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiInsights.map((i) => (
                <div key={i.id} className={`surface-card p-5 border-l-4 ${sevColor(i.severity)}`}>
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted/60 grid place-items-center shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold">{i.title}</h4>
                        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                          {i.severity}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{i.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

        </TabsContent>

        <TabsContent value="period" className="mt-4 space-y-4">
          {(() => {
            const drivers = buildDrivers(basePeriod, comparePeriod);
            const planValue = PERIOD_PLAN_EBITDA[basePeriod];
            const fav = drivers.filter((d) => d.delta > 0).reduce((s, d) => s + d.delta, 0);
            const unfav = drivers.filter((d) => d.delta < 0).reduce((s, d) => s + d.delta, 0);
            const net = fav + unfav;
            const pct = (net / planValue) * 100;
            const fmtK = (n: number) => `${n >= 0 ? "+" : "−"}$${Math.abs(Math.round(n / 1000)).toLocaleString()}k`;
            return (
              <>
                <div className="surface-card p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Plan → Actual EBITDA Bridge
                      </p>
                      <h3 className="mt-1 font-display text-lg font-semibold">
                        {labelFor(basePeriod)} actuals vs {labelFor(comparePeriod)} plan
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Each bar shows a driver moving the bottom line away from plan. Green = favorable, red = unfavorable.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        Basis
                      </span>
                      <Select defaultValue="ebitda">
                        <SelectTrigger className="h-8 w-[150px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ebitda" className="text-xs">EBITDA</SelectItem>
                          <SelectItem value="revenue" className="text-xs">Revenue</SelectItem>
                          <SelectItem value="margin" className="text-xs">Gross Margin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-5">
                    <PlanActualWaterfall
                      key={`${basePeriod}-${comparePeriod}`}
                      planValue={planValue}
                      drivers={drivers}
                      height={340}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="rounded-lg border border-success/30 bg-success/5 p-3">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Favorable drivers</p>
                      <p className="font-display text-lg font-semibold text-success mt-1">{fmtK(fav)}</p>
                      <p className="text-muted-foreground mt-1">
                        {drivers.filter((d) => d.delta > 0).map((d) => d.name).join(" + ") || "—"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Unfavorable drivers</p>
                      <p className="font-display text-lg font-semibold text-destructive mt-1">{fmtK(unfav)}</p>
                      <p className="text-muted-foreground mt-1">
                        {drivers.filter((d) => d.delta < 0).map((d) => d.name).join(" + ") || "—"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-3">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Net gap to plan</p>
                      <p className={`font-display text-lg font-semibold mt-1 ${net >= 0 ? "text-success" : "text-destructive"}`}>
                        {fmtK(net)}
                      </p>
                      <p className="text-muted-foreground mt-1">
                        {Math.abs(pct).toFixed(1)}% {net >= 0 ? "above" : "below"} plan EBITDA
                      </p>
                    </div>
                  </div>
                </div>

                <div className="surface-card p-5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    AI commentary
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">
                    Comparing <strong>{labelFor(basePeriod)}</strong> actuals against{" "}
                    <strong>{labelFor(comparePeriod)}</strong> plan, the largest swing is{" "}
                    <strong>{[...drivers].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0].name.toLowerCase()}</strong>.
                    Favorable drivers contributed {fmtK(fav)} while unfavorable drivers cost{" "}
                    {fmtK(unfav)}, leaving a net{" "}
                    {net >= 0 ? "beat" : "miss"} of {fmtK(net)} ({Math.abs(pct).toFixed(1)}% of plan).
                  </p>
                </div>
              </>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>

  );
}
