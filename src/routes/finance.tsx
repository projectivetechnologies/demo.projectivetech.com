import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { AICommentaryStrip } from "@/components/AICommentaryStrip";
import { aiCommentary, databaseEmbeddedReports, departmentKpiCatalogs } from "@/lib/mock-data";
import { DepartmentKpiTiles } from "@/components/DepartmentKpiTiles";
import { AllocatedReportEmbed } from "@/components/AllocatedReportEmbed";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "Finance - IMAGE-I" },
      { name: "description", content: "Revenue, margin and variance reporting." },
      { property: "og:title", content: "Finance - IMAGE-I" },
      { property: "og:description", content: "Revenue, margin and variance reporting." },
    ],
  }),
  component: FinancePage,
});

function FinancePage() {
  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Finance Dashboard"
        title="Financial Performance"
        description="Revenue, margin, cash and variance - sourced from ERP via API and modeled in Power BI."
      />
      <AICommentaryStrip text={aiCommentary.finance} />
      <DepartmentKpiTiles department="finance" catalog={departmentKpiCatalogs.finance} />

      <section className="px-6 lg:px-10 mt-6">
        <div className="mb-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Database Reports</p>
          <h2 className="mt-1 font-display text-2xl font-semibold">Embedded Reports</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Live Power BI embedded reports from your database.
          </p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {databaseEmbeddedReports.map((report) => (
            <div key={report.id} className="relative group cursor-pointer">
              <AllocatedReportEmbed
                id={report.id}
                title={report.title}
                embedUrl={report.embedUrl}
                reportId={"reportId" in report ? report.reportId : undefined}
                datasetId={"datasetId" in report ? (report as { datasetId?: string }).datasetId : undefined}
                groupId={"groupId" in report ? report.groupId : undefined}
                forceSecure={report.isSecure}
                aspectRatio="16 / 9"
              />
              <Link
                to="/finance-report"
                search={{ reportId: report.id }}
                className="absolute inset-0 z-20 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label={`Open ${report.title} full page`}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
