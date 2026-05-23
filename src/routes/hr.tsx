import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { AICommentaryStrip } from "@/components/AICommentaryStrip";
import { aiCommentary } from "@/lib/mock-data";
import { DepartmentKpiTiles } from "@/components/DepartmentKpiTiles";
import { departmentKpiCatalogs } from "@/lib/mock-data";
import { ChartCard } from "@/components/ChartCard";
import { ReportEmbed } from "@/components/ReportEmbed";
import { headcountByDept } from "@/lib/mock-data";

export const Route = createFileRoute("/hr")({
  head: () => ({
    meta: [
      { title: "Human Capital · IMAGE-I" },
      { name: "description", content: "Headcount, attrition and engagement analytics." },
      { property: "og:title", content: "Human Capital · IMAGE-I" },
      { property: "og:description", content: "Headcount, attrition and engagement analytics." },
    ],
  }),
  component: HrPage,
});

function HrPage() {
  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="People Dashboard"
        title="Human Capital"
        description="Workforce composition, attrition and engagement modeled from HRIS data."
      />
      <AICommentaryStrip text={aiCommentary.hr} />
      <DepartmentKpiTiles department="hr" catalog={departmentKpiCatalogs.hr} />

      <div className="px-6 lg:px-10 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Headcount by Department" className="lg:col-span-2 h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={headcountByDept} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="dept" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={120} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "var(--color-border)" }} />
              <Bar dataKey="count" fill="oklch(0.7 0.21 305)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ReportEmbed title="Attrition Heatmap" subtitle="By tenure & function" />
      </div>
    </div>
  );
}
