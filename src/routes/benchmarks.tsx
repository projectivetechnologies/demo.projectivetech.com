import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/PageHeader";
import { ChartCard } from "@/components/ChartCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { peerBenchmarks, industryNews } from "@/lib/mock-data";

export const Route = createFileRoute("/benchmarks")({
  head: () => ({
    meta: [
      { title: "Benchmarks & News · IMAGE-I" },
      {
        name: "description",
        content:
          "Peer benchmarking against listed competitors with curated industry news and sentiment.",
      },
      { property: "og:title", content: "Benchmarks & News · IMAGE-I" },
      {
        property: "og:description",
        content:
          "Compare margins, energy intensity and growth versus peers, alongside curated industry news.",
      },
    ],
  }),
  component: BenchmarksPage,
});

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

function BenchmarksPage() {
  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Market Intelligence"
        title="Peer Benchmarks & Industry News"
        description="Listed peer comparison and curated news with sentiment & impact tagging."
      />

      <section className="px-6 lg:px-10 mt-6">
        <Tabs defaultValue="benchmarks">
          <TabsList>
            <TabsTrigger value="benchmarks">Peer Benchmarks</TabsTrigger>
            <TabsTrigger value="news">Industry News</TabsTrigger>
          </TabsList>

          <TabsContent value="benchmarks" className="mt-4 space-y-4">
            <ChartCard
              title="Peer Margin vs Energy Intensity"
              subtitle="Bubble proxy via gross margin & kWh / MT"
              className="h-[320px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peerBenchmarks} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} angle={-12} textAnchor="end" height={50} interval={0} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="grossMargin" name="Gross Margin %" radius={[6, 6, 0, 0]}>
                    {peerBenchmarks.map((p, i) => (
                      <Cell
                        key={i}
                        fill={
                          p.id === "self"
                            ? "var(--color-primary)"
                            : p.rating === "leader"
                              ? "var(--color-success)"
                              : p.rating === "laggard"
                                ? "var(--color-destructive)"
                                : "var(--color-chart-2)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="surface-card overflow-hidden">
              <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-border/60 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <div className="col-span-3">Company</div>
                <div className="col-span-2 text-right">Revenue (TTM)</div>
                <div className="col-span-1 text-right">YoY</div>
                <div className="col-span-2 text-right">Gross Margin</div>
                <div className="col-span-1 text-right">EBITDA</div>
                <div className="col-span-1 text-right">kWh/MT</div>
                <div className="col-span-1 text-right">RM Idx</div>
                <div className="col-span-1 text-right">Rating</div>
              </div>
              <div className="divide-y divide-border/60">
                {peerBenchmarks.map((p) => {
                  const isSelf = p.id === "self";
                  return (
                    <div
                      key={p.id}
                      className={`grid grid-cols-12 gap-3 px-5 py-3 items-center text-sm transition-colors ${
                        isSelf ? "bg-primary/5" : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="col-span-3">
                        <p className={`font-medium ${isSelf ? "text-primary" : ""}`}>{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.ticker} · {p.segment}</p>
                      </div>
                      <div className="col-span-2 text-right font-mono text-xs">{fmt(p.revenue)}</div>
                      <div className={`col-span-1 text-right font-mono text-xs ${p.growthYoY >= 0 ? "text-success" : "text-destructive"}`}>
                        {p.growthYoY >= 0 ? "+" : ""}{p.growthYoY.toFixed(1)}%
                      </div>
                      <div className="col-span-2 text-right font-mono text-xs">{p.grossMargin.toFixed(1)}%</div>
                      <div className="col-span-1 text-right font-mono text-xs">{p.ebitdaMargin.toFixed(1)}%</div>
                      <div className="col-span-1 text-right font-mono text-xs">{p.energyIntensity}</div>
                      <div className="col-span-1 text-right font-mono text-xs">{p.rmCostIndex}</div>
                      <div className="col-span-1 flex justify-end">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                            p.rating === "leader"
                              ? "border-success/30 bg-success/10 text-success"
                              : p.rating === "laggard"
                                ? "border-destructive/30 bg-destructive/10 text-destructive"
                                : "border-border bg-muted text-muted-foreground"
                          }`}
                        >
                          {p.rating}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="news" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {industryNews.map((n) => {
                const sentClass =
                  n.sentiment === "positive"
                    ? "border-success/30 bg-success/10 text-success"
                    : n.sentiment === "negative"
                      ? "border-destructive/30 bg-destructive/10 text-destructive"
                      : "border-border bg-muted text-muted-foreground";
                const impactClass =
                  n.impact === "high"
                    ? "text-destructive"
                    : n.impact === "medium"
                      ? "text-warning"
                      : "text-muted-foreground";
                return (
                  <a
                    key={n.id}
                    href={n.url}
                    className="surface-card p-5 hover:border-primary/40 transition-colors block"
                  >
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      <span>{n.source}</span>
                      <span>·</span>
                      <span>{n.publishedAt}</span>
                      <span className="ml-auto inline-flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${sentClass}`}>
                          {n.sentiment}
                        </span>
                        <span className={`text-[10px] font-semibold ${impactClass}`}>
                          {n.impact.toUpperCase()} IMPACT
                        </span>
                      </span>
                    </div>
                    <h4 className="mt-2 text-sm font-semibold leading-snug">{n.headline}</h4>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{n.summary}</p>
                    <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {n.category}
                    </p>
                  </a>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
