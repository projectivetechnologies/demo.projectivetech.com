import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { KpiTrust } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface Props {
  trust: KpiTrust;
  className?: string;
}

export function TrustBadge({ trust, className }: Props) {
  const cfg =
    trust.status === "verified"
      ? {
          Icon: ShieldCheck,
          label: "Reconciled",
          cls: "border-success/30 bg-success/10 text-success",
        }
      : trust.status === "partial"
        ? {
            Icon: ShieldAlert,
            label: "Partial",
            cls: "border-warning/40 bg-warning/10 text-warning",
          }
        : {
            Icon: ShieldQuestion,
            label: "Stale",
            cls: "border-destructive/30 bg-destructive/10 text-destructive",
          };

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
              cfg.cls,
              className,
            )}
          >
            <cfg.Icon className="h-3 w-3" />
            {cfg.label} · {trust.matchRate.toFixed(1)}%
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px] text-xs">
          <p className="font-medium">{cfg.label} ({trust.matchRate.toFixed(1)}% match)</p>
          <p className="text-muted-foreground mt-0.5">{trust.note}</p>
          <p className="text-muted-foreground mt-1">
            {trust.sources} source{trust.sources === 1 ? "" : "s"} · last reconciled {trust.lastReconciled}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
