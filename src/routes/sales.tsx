import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { AICommentaryStrip } from "@/components/AICommentaryStrip";
import { aiCommentary } from "@/lib/mock-data";
import { DepartmentKpiTiles } from "@/components/DepartmentKpiTiles";
import { departmentKpiCatalogs } from "@/lib/mock-data";
import { ChartCard } from "@/components/ChartCard";
import { ReportEmbed } from "@/components/ReportEmbed";
import { regionPerformance } from "@/lib/mock-data";

export const Route = createFileRoute("/sales")({
  head: () => ({
    meta: [
      { title: "Sales · IMAGE-I" },
      { name: "description", content: "Pipeline velocity, win rate and regional performance." },
      { property: "og:title", content: "Sales · IMAGE-I" },
      { property: "og:description", content: "Pipeline velocity, win rate and regional performance." },
    ],
  }),
  component: SalesPage,
});

function SalesPage() {
  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Sales Dashboard"
        title="Pipeline & Performance"
        description="Live CRM extracts feeding pipeline, conversion and territory analytics."
      />
      <AICommentaryStrip text={aiCommentary.sales} />
      <DepartmentKpiTiles department="sales" catalog={departmentKpiCatalogs.sales} />

      <div className="px-6 lg:px-10 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Region Performance" subtitle="Actual vs Target (index 100)" className="lg:col-span-1 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionPerformance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="region" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "var(--color-border)" }} />
              <Bar dataKey="target" fill="var(--color-border)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="oklch(0.78 0.18 195)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ReportEmbed title="Pipeline Velocity by Stage" subtitle="Conversion & cycle time" />
        <ReportEmbed title="Win/Loss Analysis" subtitle="By segment & competitor" />
      </div>
    </div>
  );
}
