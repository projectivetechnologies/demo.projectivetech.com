import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, FileText, Search, SlidersHorizontal } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { powerBiReports } from "@/lib/powerbi-reports";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports - IMAGE-I" },
      { name: "description", content: "Library of embedded Power BI reports." },
      { property: "og:title", content: "Reports - IMAGE-I" },
      { property: "og:description", content: "Library of embedded Power BI reports." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(powerBiReports.map((report) => report.category)))],
    []
  );

  const filteredReports = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return powerBiReports.filter((report) => {
      const matchesQuery =
        !normalized ||
        report.title.toLowerCase().includes(normalized) ||
        report.owner.toLowerCase().includes(normalized) ||
        report.description.toLowerCase().includes(normalized);
      const matchesCategory = category === "all" || report.category === category;

      return matchesQuery && matchesCategory;
    });
  }, [category, query]);

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Library"
        title="All Reports"
        description="Legacy IMAGE-I Power BI reports, redesigned for the Insight Hub workspace."
        actions={
          <Button asChild className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90">
            <Link to="/power-bi">
              Open Power BI <ArrowUpRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        }
      />

      <section className="px-6 lg:px-10 py-6">
        <Card className="surface-card p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search reports..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item === "all" ? "All categories" : item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </section>

      <section className="px-6 lg:px-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredReports.map((report) => (
          <Link
            key={report.id}
            to="/power-bi-report-page"
            search={{ reportId: report.id }}
            className="surface-card hover-lift group overflow-hidden"
            onClick={() => {
              window.localStorage.setItem("insightHub.reportId", report.id);
              window.localStorage.setItem("URL", report.embedUrl);
              window.localStorage.setItem("title", report.title);
            }}
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-md bg-primary/15 text-primary grid place-items-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {report.category}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold leading-snug group-hover:text-primary">
                      {report.title}
                    </h3>
                  </div>
                </div>
                <StatusBadge status={report.status} />
              </div>

              <p className="mt-4 min-h-10 text-xs leading-5 text-muted-foreground">
                {report.description}
              </p>
            </div>
            <div className="h-32 border-t border-border/60 bg-muted/30 relative overflow-hidden">
              <div
                aria-hidden
                className="absolute inset-0 opacity-70"
                style={{ backgroundImage: "var(--gradient-aurora)" }}
              />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{report.owner}</span>
                <span>{report.updated}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: "Live" | "Draft" | "Secure" }) {
  if (status === "Live") {
    return <Badge className="border-0 bg-success/15 text-success hover:bg-success/15">Live</Badge>;
  }

  if (status === "Secure") {
    return <Badge className="border-0 bg-primary/15 text-primary hover:bg-primary/15">Secure</Badge>;
  }

  return <Badge variant="outline">Draft</Badge>;
}
