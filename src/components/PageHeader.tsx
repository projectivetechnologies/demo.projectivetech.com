import { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden border-b border-border/60">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-80"
        style={{ backgroundImage: "var(--gradient-aurora)" }}
      />
      <div className="px-6 lg:px-10 py-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          {eyebrow && (
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
