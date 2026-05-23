import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, actions, children, className }: ChartCardProps) {
  return (
    <div className={cn("surface-card p-5 flex flex-col", className)}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
