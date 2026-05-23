import { Clock, Wallet, Bot, Database, ArrowUpRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { businessPlanner, valueDelivered } from "@/lib/mock-data";

const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export function ValueDeliveredPanel({ onMessagePlanner }: { onMessagePlanner?: () => void }) {
  const roi = (valueDelivered.costSavedYTD / valueDelivered.subscriptionCost).toFixed(1);

  return (
    <section className="px-6 lg:px-10 mt-8">
      <div className="surface-card relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ backgroundImage: "var(--gradient-aurora)" }}
        />
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* LHS: value metrics */}
          <div className="lg:col-span-2 p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Value Delivered · YTD
            </p>
            <h3 className="mt-1 font-display text-xl font-semibold">
              IMAGE-I has saved your team {valueDelivered.manhoursSavedYTD.toLocaleString()} hours
              this year.
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {roi}× return on subscription · {valueDelivered.agentsRunning} agents running across {valueDelivered.dataSourcesReconciled} data sources.
            </p>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Tile
                Icon={Clock}
                label="Manhours saved"
                value={valueDelivered.manhoursSavedYTD.toLocaleString()}
                sub={`+${valueDelivered.manhoursSavedYoY}% YoY`}
                tone="ok"
              />
              <Tile
                Icon={Wallet}
                label="Cost saved"
                value={fmtINR(valueDelivered.costSavedYTD)}
                sub={`${roi}× of fee`}
                tone="ok"
              />
              <Tile
                Icon={Bot}
                label="Agents running"
                value={valueDelivered.agentsRunning.toString()}
                sub="24/7 monitoring"
              />
              <Tile
                Icon={Database}
                label="Sources reconciled"
                value={valueDelivered.dataSourcesReconciled.toString()}
                sub="Daily"
              />
            </div>
          </div>

          {/* RHS: planner card */}
          <div className="border-t lg:border-t-0 lg:border-l border-border/60 p-5 flex flex-col">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Your Business Planner
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-[image:var(--gradient-primary)] grid place-items-center text-primary-foreground font-display font-semibold surface-glow">
                {businessPlanner.initials}
              </div>
              <div>
                <p className="text-sm font-semibold">{businessPlanner.name}</p>
                <p className="text-[11px] text-muted-foreground">{businessPlanner.title}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {businessPlanner.bio}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-md border border-border/60 bg-muted/30 p-2">
                <p className="text-muted-foreground">Next review</p>
                <p className="mt-0.5 font-medium">{businessPlanner.nextReview}</p>
              </div>
              <div className="rounded-md border border-border/60 bg-muted/30 p-2">
                <p className="text-muted-foreground">Last board pack</p>
                <p className="mt-0.5 font-medium">{businessPlanner.lastBoardPack}</p>
              </div>
            </div>
            <div className="mt-auto pt-4 flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90"
                onClick={onMessagePlanner}
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                Message
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={onMessagePlanner}>
                Book review <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Tile({
  Icon,
  label,
  value,
  sub,
  tone,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  tone?: "ok";
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/60 p-3">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      </div>
      <p className="mt-1.5 font-display text-lg font-semibold leading-none">{value}</p>
      <p className={`mt-1 text-[11px] ${tone === "ok" ? "text-success" : "text-muted-foreground"}`}>
        {sub}
      </p>
    </div>
  );
}
