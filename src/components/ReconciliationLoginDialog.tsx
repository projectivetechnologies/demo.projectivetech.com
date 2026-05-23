import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Target, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { planVarianceSummary, planTopVariances } from "@/lib/mock-data";

const VARIANCE_LOGIN_TRIGGER_KEY = "image-i:show-login-variance";

const fmtCompact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

const fmtValue = (n: number, row: { isPercent?: boolean; isCount?: boolean }) => {
  if (row.isPercent) return `${n.toFixed(1)}%`;
  if (row.isCount) return n.toLocaleString();
  return `$${fmtCompact(n)}`;
};

const fmtDelta = (n: number, row: { isPercent?: boolean; isCount?: boolean }) => {
  const sign = n >= 0 ? "+" : "−";
  const abs = Math.abs(n);
  if (row.isPercent) return `${sign}${abs.toFixed(1)}pp`;
  if (row.isCount) return `${sign}${abs.toLocaleString()}`;
  return `${sign}$${fmtCompact(abs)}`;
};

export function ReconciliationLoginDialog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(VARIANCE_LOGIN_TRIGGER_KEY) !== "1") return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.removeItem(VARIANCE_LOGIN_TRIGGER_KEY);
    }, 600);
    return () => clearTimeout(t);
  }, [user]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-[image:var(--gradient-primary)] grid place-items-center surface-glow">
              <Target className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle>
                Variance vs Plan · {planVarianceSummary.period}
              </DialogTitle>
              <DialogDescription>
                Top movers between actual performance and plan — what to look at first.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2 grid grid-cols-3 gap-3">
          <Stat label="Favorable" value={planVarianceSummary.favorable.toString()} tone="ok" />
          <Stat label="Unfavorable" value={planVarianceSummary.unfavorable.toString()} tone="bad" />
          <Stat label="On track" value={planVarianceSummary.onTrack.toString()} tone="neutral" />
        </div>

        <div className="mt-4 surface-card overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-border/60 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <div className="col-span-4">Line</div>
            <div className="col-span-2 text-right">Actual</div>
            <div className="col-span-2 text-right">Plan</div>
            <div className="col-span-2 text-right">Variance</div>
            <div className="col-span-2 text-right">Status</div>
          </div>
          <div className="divide-y divide-border/60">
            {planTopVariances.map((row) => {
              const fav = row.status === "favorable";
              const Icon = fav ? TrendingUp : TrendingDown;
              return (
                <div
                  key={row.id}
                  className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center text-sm"
                >
                  <div className="col-span-4 font-medium">{row.line}</div>
                  <div className="col-span-2 text-right font-mono text-xs">
                    {fmtValue(row.actual, row)}
                  </div>
                  <div className="col-span-2 text-right font-mono text-xs text-muted-foreground">
                    {fmtValue(row.plan, row)}
                  </div>
                  <div
                    className={`col-span-2 text-right font-mono text-xs ${
                      fav ? "text-success" : "text-destructive"
                    }`}
                  >
                    {fmtDelta(row.delta, row)}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        fav
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-destructive/30 bg-destructive/10 text-destructive"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {row.pct >= 0 ? "+" : ""}
                      {row.pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Dismiss
          </Button>
          <Button
            className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90"
            onClick={() => {
              setOpen(false);
              navigate({ to: "/reconciliation" });
            }}
          >
            Open variance analysis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "neutral" | "bad";
}) {
  const cfg = {
    ok: { Icon: TrendingUp, cls: "text-success", border: "border-success/30 bg-success/5" },
    neutral: { Icon: Minus, cls: "text-muted-foreground", border: "border-border bg-muted/20" },
    bad: { Icon: TrendingDown, cls: "text-destructive", border: "border-destructive/30 bg-destructive/5" },
  }[tone];
  return (
    <div className={`rounded-lg border p-3 ${cfg.border}`}>
      <div className="flex items-center gap-1.5">
        <cfg.Icon className={`h-3.5 w-3.5 ${cfg.cls}`} />
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      </div>
      <p className="mt-1.5 font-display text-xl font-semibold">{value}</p>
    </div>
  );
}
