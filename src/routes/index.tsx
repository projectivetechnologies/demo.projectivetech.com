import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Activity,
  Users,
  Truck,
  Heart,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

import { KpiCard } from "@/components/KpiCard";
import { PageHeader } from "@/components/PageHeader";
import { ChartCard } from "@/components/ChartCard";
import { ValueDeliveredPanel } from "@/components/ValueDeliveredPanel";
import { Button } from "@/components/ui/button";
import {
  kpiCards,
  revenueTrend,
  segmentMix,
  recentReports,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview · IMAGE-I" },
      {
        name: "description",
        content:
          "Snapshot of revenue, sales, operations and people KPIs across the organization.",
      },
      { property: "og:title", content: "Overview · IMAGE-I" },
      {
        property: "og:description",
        content: "Executive snapshot dashboard for management reporting.",
      },
    ],
  }),
  component: Overview,
});

const iconMap = { DollarSign, TrendingUp, Activity, Users, Truck, Heart };
const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

function Overview() {
  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Executive Overview"
        title="Welcome back, Admin Kapoor"
        description="Cross-functional snapshot — click any card to preview the report, or use the link to open the full dashboard."
        actions={
          <Button asChild className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90">
            <Link to="/agents">
              <Sparkles className="h-4 w-4 mr-2" />
              Ask AI Agent
            </Link>
          </Button>
        }
      />

      <section className="px-6 lg:px-10 -mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {kpiCards.map((c) => (
            <KpiCard
              key={c.id}
              id={c.id}
              title={c.title}
              metric={c.metric}
              delta={c.delta}
              trend={c.trend}
              description={c.description}
              icon={iconMap[c.icon as keyof typeof iconMap]}
              href={c.href}
            />
          ))}
        </div>
      </section>

      <ValueDeliveredPanel />

      <section className="px-6 lg:px-10 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard
          title="Revenue vs Forecast"
          subtitle="Trailing 12 months · USD millions"
          className="lg:col-span-2 h-[340px]"
          actions={
            <span className="text-[11px] text-success bg-success/10 border border-success/30 rounded-full px-2 py-0.5">
              +14.6% YoY
            </span>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="forecast" stroke="var(--color-chart-2)" strokeWidth={2} strokeDasharray="4 4" fill="url(#fc)" />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-chart-1)" strokeWidth={2.5} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Segment Mix" subtitle="Revenue contribution" className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={segmentMix}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={3}
                stroke="var(--color-card)"
                strokeWidth={2}
              >
                {segmentMix.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <ul className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
            {segmentMix.map((s, i) => (
              <li key={s.name} className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                {s.name} <span className="text-foreground/80 ml-auto">{s.value}%</span>
              </li>
            ))}
          </ul>
        </ChartCard>
      </section>

      <section className="px-6 lg:px-10 mt-8">
        <div className="surface-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border/60">
            <div>
              <h3 className="text-sm font-semibold">Recent Reports</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Embedded Power BI artifacts most viewed this week
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground" asChild>
              <Link to="/reports">
                View all <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-border/60">
            {recentReports.map((r) => (
              <div key={r.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                <div className="col-span-6 md:col-span-5">
                  <p className="text-sm font-medium">{r.title}</p>
                </div>
                <div className="col-span-3 text-xs text-muted-foreground">{r.owner}</div>
                <div className="hidden md:block md:col-span-2 text-xs text-muted-foreground">{r.updated}</div>
                <div className="col-span-3 md:col-span-2 text-right">
                  <span
                    className={
                      r.status === "Live"
                        ? "text-[11px] rounded-full px-2 py-0.5 border border-success/30 bg-success/10 text-success"
                        : "text-[11px] rounded-full px-2 py-0.5 border border-warning/30 bg-warning/10 text-warning"
                    }
                  >
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
