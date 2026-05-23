import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, ExternalLink, RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { ReportEmbed } from "@/components/ReportEmbed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPowerBiReport } from "@/lib/powerbi-reports";

type ReportSearch = {
  reportId?: string;
};

export const Route = createFileRoute("/power-bi-report-page")({
  validateSearch: (search: Record<string, unknown>): ReportSearch => ({
    reportId: typeof search.reportId === "string" ? search.reportId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Power BI Report - IMAGE-I" },
      { name: "description", content: "Embedded Power BI report viewer." },
    ],
  }),
  component: PowerBiReportPage,
});

function PowerBiReportPage() {
  const search = Route.useSearch();
  const fallbackId =
    typeof window !== "undefined" ? window.localStorage.getItem("insightHub.reportId") : undefined;
  const report = getPowerBiReport(search.reportId ?? fallbackId);
  const [frameKey, setFrameKey] = useState(0);
  const [loading, setLoading] = useState(Boolean(report.embedUrl));

  const exportUrl = useMemo(() => {
    if (!report.reportId) return null;
    return `http://ec2-13-233-125-32.ap-south-1.compute.amazonaws.com/user/download-report?report_id=${report.reportId}`;
  }, [report.reportId]);

  const refreshDataset = () => {
    setFrameKey((key) => key + 1);
    setLoading(Boolean(report.embedUrl));
  };

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow={report.category}
        title={report.title}
        description={report.description}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/reports">Back to reports</Link>
            </Button>
            {report.embedUrl && (
              <Button variant="outline" asChild>
                <a href={report.embedUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </a>
              </Button>
            )}
            <Button onClick={refreshDataset} className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {["PDF", "PPTX", "XLSX"].map((format) => (
                  <DropdownMenuItem key={format} asChild disabled={!exportUrl}>
                    <a
                      href={exportUrl ? `${exportUrl}&format=${format}` : "#"}
                      onClick={(event) => {
                        if (!exportUrl) event.preventDefault();
                      }}
                    >
                      Download as {format === "XLSX" ? "Excel" : format}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <section className="px-6 lg:px-10 py-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Owner: {report.owner}</Badge>
          <Badge variant="outline">Status: {report.status}</Badge>
          {report.reportId && <Badge variant="outline">Report ID: {report.reportId}</Badge>}
        </div>

        {report.isSecure && !report.embedUrl ? (
          <SecureEmbedNotice reportId={report.reportId} datasetId={report.datasetId} groupId={report.groupId} />
        ) : (
          <ReportEmbed
            key={`${report.id}-${frameKey}`}
            title={report.title}
            subtitle="Embedded Power BI report"
            embedUrl={report.embedUrl}
            height={720}
            loading={loading}
          />
        )}
      </section>
    </div>
  );
}

function SecureEmbedNotice({
  reportId,
  datasetId,
  groupId,
}: {
  reportId?: string;
  datasetId?: string;
  groupId?: string;
}) {
  return (
    <Card className="surface-card p-8">
      <div className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Secure Power BI Embed</p>
        <h2 className="mt-2 font-display text-2xl font-semibold">Backend token endpoint required</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The old source used a hardcoded bearer token and `window.powerbi` secure embedding. Insight Hub keeps the
          secure report metadata and actions, but the live embed should be connected to a backend endpoint that returns a
          fresh embed token.
        </p>
        <div className="mt-5 grid gap-3 text-xs md:grid-cols-3">
          <Meta label="Report" value={reportId} />
          <Meta label="Dataset" value={datasetId} />
          <Meta label="Group" value={groupId} />
        </div>
      </div>
    </Card>
  );
}

function Meta({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md border border-border/70 bg-muted/30 p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 break-all font-mono text-[11px] text-foreground">{value ?? "Not configured"}</p>
    </div>
  );
}
