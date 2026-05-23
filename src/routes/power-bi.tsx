import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BarChart3, FileText } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { ReportEmbed } from "@/components/ReportEmbed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { powerBiReports } from "@/lib/powerbi-reports";

export const Route = createFileRoute("/power-bi")({
  head: () => ({
    meta: [
      { title: "Power BI - IMAGE-I" },
      { name: "description", content: "Power BI workspace and embedded report launcher." },
    ],
  }),
  component: PowerBiWorkspacePage,
});

function PowerBiWorkspacePage() {
  const featured = powerBiReports.find((report) => report.embedUrl) ?? powerBiReports[0];
  const liveReports = powerBiReports.filter((report) => report.status === "Live").length;
  const secureReports = powerBiReports.filter((report) => report.status === "Secure").length;

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Workspace"
        title="Power BI Reports"
        description="Open the migrated report catalog, preview live public reports, and prepare secure embeds from the old project."
        actions={
          <Button asChild className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90">
            <Link to="/reports">
              Browse reports <ArrowUpRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        }
      />

      <section className="px-6 lg:px-10 py-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Reports migrated" value={powerBiReports.length.toString()} />
        <StatCard label="Live public embeds" value={liveReports.toString()} accent="success" />
        <StatCard label="Secure embeds ready" value={secureReports.toString()} accent="primary" />
      </section>

      <section className="px-6 lg:px-10 grid gap-4 xl:grid-cols-[1fr_360px]">
        <ReportEmbed
          title={featured.title}
          subtitle="Featured legacy Power BI report"
          embedUrl={featured.embedUrl}
          height={620}
        />

        <Card className="surface-card p-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h2 className="text-sm font-semibold">Report queue</h2>
              <p className="text-xs text-muted-foreground">Open any report in the full viewer.</p>
            </div>
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 space-y-2">
            {powerBiReports.map((report) => (
              <Link
                key={report.id}
                to="/power-bi-report-page"
                search={{ reportId: report.id }}
                className="flex items-start gap-3 rounded-md border border-transparent p-3 transition hover:border-border/70 hover:bg-muted/30"
                onClick={() => window.localStorage.setItem("insightHub.reportId", report.id)}
              >
                <div className="mt-0.5 h-8 w-8 shrink-0 rounded-md bg-primary/15 text-primary grid place-items-center">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{report.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{report.category}</p>
                </div>
                <Badge variant="outline">{report.status}</Badge>
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "success" | "primary";
}) {
  const color = accent === "success" ? "text-success" : accent === "primary" ? "text-primary" : "text-foreground";

  return (
    <Card className="surface-card p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={`mt-2 font-display text-3xl font-semibold ${color}`}>{value}</p>
    </Card>
  );
}
