import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { AICommentaryStrip } from "@/components/AICommentaryStrip";
import { aiCommentary } from "@/lib/mock-data";
import { DepartmentKpiTiles } from "@/components/DepartmentKpiTiles";
import { departmentKpiCatalogs } from "@/lib/mock-data";
import { ReportEmbed } from "@/components/ReportEmbed";

export const Route = createFileRoute("/supply")({
  head: () => ({
    meta: [
      { title: "Supply Chain · IMAGE-I" },
      { name: "description", content: "Supplier risk, lead time and inventory analytics." },
      { property: "og:title", content: "Supply Chain · IMAGE-I" },
      { property: "og:description", content: "Supplier risk, lead time and inventory analytics." },
    ],
  }),
  component: SupplyPage,
});

function SupplyPage() {
  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Supply Chain"
        title="Supplier & Inventory Health"
        description="End-to-end visibility from procurement through fulfillment."
      />
      <AICommentaryStrip text={aiCommentary.supply} />
      <DepartmentKpiTiles department="supply" catalog={departmentKpiCatalogs.supply} />

      <div className="px-6 lg:px-10 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportEmbed title="Supplier Risk Index" />
        <ReportEmbed title="Inventory Turnover" />
      </div>
    </div>
  );
}
