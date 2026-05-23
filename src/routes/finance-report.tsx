import { createFileRoute, Link } from "@tanstack/react-router";

import { AllocatedReportEmbed } from "@/components/AllocatedReportEmbed";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { databaseEmbeddedReports } from "@/lib/mock-data";

type FinanceReportSearch = {
  reportId?: string;
};

export const Route = createFileRoute("/finance-report")({
  validateSearch: (search: Record<string, unknown>): FinanceReportSearch => ({
    reportId: typeof search.reportId === "string" ? search.reportId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Finance Report - IMAGE-I" },
      { name: "description", content: "Full-page embedded finance report viewer." },
    ],
  }),
  component: FinanceReportPage,
});

function FinanceReportPage() {
  const search = Route.useSearch();
  const report =
    databaseEmbeddedReports.find((item) => item.id === search.reportId) ??
    databaseEmbeddedReports[0];

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Finance Report"
        title={report.title}
        description="Full-page embedded Power BI report from your database."
        actions={
          <Button variant="outline" asChild>
            <Link to="/finance">Back to Finance</Link>
          </Button>
        }
      />

      <section className="px-6 lg:px-10 py-6">
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
      </section>
    </div>
  );
}
