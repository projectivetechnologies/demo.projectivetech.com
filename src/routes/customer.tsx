import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { AICommentaryStrip } from "@/components/AICommentaryStrip";
import { aiCommentary } from "@/lib/mock-data";
import { DepartmentKpiTiles } from "@/components/DepartmentKpiTiles";
import { departmentKpiCatalogs } from "@/lib/mock-data";
import { ReportEmbed } from "@/components/ReportEmbed";

export const Route = createFileRoute("/customer")({
  head: () => ({
    meta: [
      { title: "Customer · IMAGE-I" },
      { name: "description", content: "Customer satisfaction, NPS and retention insights." },
      { property: "og:title", content: "Customer · IMAGE-I" },
      { property: "og:description", content: "Customer satisfaction, NPS and retention insights." },
    ],
  }),
  component: CustomerPage,
});

function CustomerPage() {
  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Customer"
        title="Customer Experience"
        description="Voice-of-customer signals blended with retention and expansion KPIs."
      />
      <AICommentaryStrip text={aiCommentary.customer} />
      <DepartmentKpiTiles department="customer" catalog={departmentKpiCatalogs.customer} />

      <div className="px-6 lg:px-10 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportEmbed title="NPS Driver Tree" />
        <ReportEmbed title="Cohort Retention" />
      </div>
    </div>
  );
}
