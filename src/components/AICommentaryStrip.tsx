import { Sparkles, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface Props {
  text: string;
  agentLabel?: string;
}

export function AICommentaryStrip({ text, agentLabel = "AI Commentary" }: Props) {
  return (
    <div className="px-6 lg:px-10 -mt-2">
      <div className="surface-card relative overflow-hidden p-4 flex items-start gap-3">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ backgroundImage: "var(--gradient-aurora)" }}
        />
        <div className="relative h-8 w-8 shrink-0 rounded-lg bg-[image:var(--gradient-primary)] grid place-items-center surface-glow">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="relative flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {agentLabel}
          </p>
          <p className="mt-1 text-sm leading-relaxed">{text}</p>
        </div>
        <Link
          to="/agents"
          className="relative shrink-0 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors self-center"
        >
          Ask follow-up <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
