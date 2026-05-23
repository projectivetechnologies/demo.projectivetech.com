import { createFileRoute } from "@tanstack/react-router";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/PageHeader";
import { ChartCard } from "@/components/ChartCard";
import { historicalPerformance } from "@/lib/mock-data";

export const Route = createFileRoute("/historical")({
  head: () => ({
    meta: [
      { title: "Historical & Trend Analysis · IMAGE-I" },
      {
        name: "description",
        content:
          "Eight-quarter trailing performance with revenue, margin and reconciliation health trends.",
      },
      { property: "og:title", content: "Historical & Trend Analysis · IMAGE-I" },
      {
        property: "og:description",
        content:
          "Track revenue, margin and reconciliation match-rate trends across the last eight quarters.",
      },
    ],
  }),
  component: HistoricalPage,
});

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

function HistoricalPage() {
  const last = historicalPerformance[historicalPerformance.length - 1];
  const first = historicalPerformance[0];
  const revGrowth = ((last.revenue - first.revenue) / first.revenue) * 100;
  const marginDelta = last.marginPct - first.marginPct;
  const matchDelta = last.matchRate - first.matchRate;

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Historical Intelligence"
        title="Historical & Trend Analysis"
        description="Eight-quarter trailing view of revenue, margin and reconciliation health."
      />

      <section className="px-6 lg:px-10 mt-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="surface-card p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Revenue Δ (8Q)</p>
          <p className={`mt-3 font-display text-3xl font-semibold ${revGrowth >= 0 ? "text-success" : "text-destructive"}`}>
            {revGrowth >= 0 ? "+" : ""}{revGrowth.toFixed(1)}%
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{first.period} → {last.period}</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Margin % Δ</p>
          <p className={`mt-3 font-display text-3xl font-semibold ${marginDelta >= 0 ? "text-success" : "text-destructive"}`}>
            {marginDelta >= 0 ? "+" : ""}{marginDelta.toFixed(1)} pp
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Now {last.marginPct.toFixed(1)}%</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Match Rate Δ</p>
          <p className={`mt-3 font-display text-3xl font-semibold ${matchDelta >= 0 ? "text-success" : "text-destructive"}`}>
            {matchDelta >= 0 ? "+" : ""}{matchDelta.toFixed(1)} pp
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Now {last.matchRate.toFixed(1)}%</p>
        </div>
      </section>

      <section className="px-6 lg:px-10 mt-6">
        <ChartCard
          title="8-Quarter Trailing Performance"
          subtitle="Revenue, margin and reconciliation health"
          className="h-[360px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalPerformance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="period" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}M`} />
              <YAxis yAxisId="right" orientation="right" domain={[88, 100]} stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line yAxisId="left" type="monotone" dataKey="margin" name="Margin" stroke="var(--color-chart-2)" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="matchRate" name="Match %" stroke="var(--color-success)" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="px-6 lg:px-10 mt-6">
        <div className="surface-card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-border/60 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <div className="col-span-2">Period</div>
            <div className="col-span-2 text-right">Revenue</div>
            <div className="col-span-2 text-right">Margin</div>
            <div className="col-span-2 text-right">Margin %</div>
            <div className="col-span-2 text-right">Match Rate</div>
            <div className="col-span-2 text-right">Net Variance</div>
          </div>
          <div className="divide-y divide-border/60">
            {historicalPerformance.map((row) => (
              <div key={row.period} className="grid grid-cols-12 gap-3 px-5 py-3 items-center text-sm hover:bg-muted/40 transition-colors">
                <div className="col-span-2 font-medium">{row.period}</div>
                <div className="col-span-2 text-right font-mono text-xs">{fmt(row.revenue)}</div>
                <div className="col-span-2 text-right font-mono text-xs">{fmt(row.margin)}</div>
                <div className="col-span-2 text-right font-mono text-xs">{row.marginPct.toFixed(1)}%</div>
                <div className="col-span-2 text-right font-mono text-xs">{row.matchRate.toFixed(1)}%</div>
                <div className={`col-span-2 text-right font-mono text-xs ${row.netVariance >= 0 ? "text-success" : "text-destructive"}`}>
                  {fmt(row.netVariance)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
