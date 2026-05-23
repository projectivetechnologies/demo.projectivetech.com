import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ReportEmbed } from "@/components/ReportEmbed";
import { TrustBadge } from "@/components/TrustBadge";
import { aiCommentary, kpiDrawerInfo, kpiTrust } from "@/lib/mock-data";

interface Props {
  kpiId: string | null;
  kpiTitle?: string;
  kpiHref?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KpiDrawer({ kpiId, kpiTitle, kpiHref, open, onOpenChange }: Props) {
  if (!kpiId) return null;
  const trust = kpiTrust[kpiId];
  const info = kpiDrawerInfo[kpiId];
  const commentary = aiCommentary[kpiId];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between gap-3">
            <SheetTitle>{kpiTitle ?? info?.reportTitle}</SheetTitle>
            {trust && <TrustBadge trust={trust} />}
          </div>
          <SheetDescription>{info?.reportSubtitle}</SheetDescription>
        </SheetHeader>

        {commentary && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-primary/80">
              AI Commentary
            </p>
            <p className="text-sm mt-1 leading-relaxed">{commentary}</p>
          </div>
        )}

        {info && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {info.bullets.map((b) => (
              <div
                key={b}
                className="flex items-start gap-1.5 rounded-md border border-border/60 bg-muted/30 p-2.5 text-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <ReportEmbed
            title={info?.reportTitle ?? kpiTitle ?? ""}
            subtitle={info?.reportSubtitle}
            height={280}
          />
        </div>

        {kpiHref && (
          <div className="mt-4 flex justify-end">
            <Button
              asChild
              className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90"
            >
              <Link to={kpiHref} onClick={() => onOpenChange(false)}>
                Open full dashboard <ArrowUpRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
