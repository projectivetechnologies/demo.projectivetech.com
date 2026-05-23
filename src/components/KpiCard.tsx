import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { TrustBadge } from "@/components/TrustBadge";
import { cn } from "@/lib/utils";
import { kpiTrust } from "@/lib/mock-data";

interface KpiCardProps {
  id?: string;
  title: string;
  metric: string;
  delta: string;
  trend: "up" | "down";
  description: string;
  icon: LucideIcon;
  href: string;
  accent?: string;
}

export function KpiCard({
  id,
  title,
  metric,
  delta,
  trend,
  description,
  icon: Icon,
  href,
}: KpiCardProps) {
  const positive = trend === "up";
  const trust = id ? kpiTrust[id] : undefined;

  return (
    <Link
      to={href}
      className="group surface-card hover-lift relative overflow-hidden p-5 block text-left w-full"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundImage: "var(--gradient-glow)" }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {title}
            </p>
            {trust && <TrustBadge trust={trust} />}
          </div>
          <p className="mt-3 font-display text-3xl font-semibold tracking-tight">
            {metric}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="h-10 w-10 shrink-0 grid place-items-center rounded-lg bg-muted/60 border border-border/60 text-primary group-hover:bg-[image:var(--gradient-primary)] group-hover:text-primary-foreground transition-colors">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
            positive
              ? "border-success/30 bg-success/10 text-success"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          )}
        >
          {positive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {delta}
        </span>
        <span className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
          Open dashboard -&gt;
        </span>
      </div>
    </Link>
  );
}
