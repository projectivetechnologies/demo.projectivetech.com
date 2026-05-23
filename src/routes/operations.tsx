import { createFileRoute } from "@tanstack/react-router";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { AICommentaryStrip } from "@/components/AICommentaryStrip";
import { aiCommentary } from "@/lib/mock-data";
import { DepartmentKpiTiles } from "@/components/DepartmentKpiTiles";
import { departmentKpiCatalogs } from "@/lib/mock-data";
import { ChartCard } from "@/components/ChartCard";
import { ReportEmbed } from "@/components/ReportEmbed";
import { operationalMetrics } from "@/lib/mock-data";

export const Route = createFileRoute("/operations")({
  head: () => ({
    meta: [
      { title: "Operations · IMAGE-I" },
      { name: "description", content: "Service uptime, incidents and SLA reporting." },
      { property: "og:title", content: "Operations · IMAGE-I" },
      { property: "og:description", content: "Service uptime, incidents and SLA reporting." },
    ],
  }),
  component: OperationsPage,
});

function OperationsPage() {
  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Operations Dashboard"
        title="Reliability & Throughput"
        description="Real-time operational health surfaced from monitoring APIs and ITSM."
      />
      <AICommentaryStrip text={aiCommentary.operations} />
      <DepartmentKpiTiles department="operations" catalog={departmentKpiCatalogs.operations} />

      <div className="px-6 lg:px-10 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Uptime — last 6 weeks" subtitle="% availability" className="lg:col-span-2 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={operationalMetrics} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[99.8, 100]} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="uptime" stroke="oklch(0.74 0.18 155)" strokeWidth={2.5} dot={{ fill: "oklch(0.74 0.18 155)", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ReportEmbed title="Incident Heatmap" subtitle="By service & severity" />
      </div>

      <div className="px-6 lg:px-10 mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportEmbed title="SLA Breach Drilldown" />
        <ReportEmbed title="Capacity Utilization" />
      </div>
    </div>
  );
}
