import { useState } from "react";
import { CalendarClock, Mail, Phone, MessageSquare, X } from "lucide-react";
import { businessPlanner } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface BusinessPlannerCardProps {
  variant?: "sidebar" | "panel";
  className?: string;
}

export function BusinessPlannerCard({
  variant = "sidebar",
  className,
}: BusinessPlannerCardProps) {
  const [open, setOpen] = useState(false);
  const p = businessPlanner;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "w-full text-left surface-card hover-lift p-3 transition-all",
          variant === "panel" && "p-4",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 rounded-full bg-[image:var(--gradient-primary)] grid place-items-center text-xs font-semibold text-primary-foreground">
            {p.initials}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-background" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Your Business Planner
            </p>
            <p className="text-sm font-semibold truncate">{p.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              Next review · {p.nextReview}
            </p>
          </div>
        </div>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[image:var(--gradient-primary)] grid place-items-center text-sm font-semibold text-primary-foreground">
                  {p.initials}
                </div>
                <div>
                  <SheetTitle>{p.name}</SheetTitle>
                  <SheetDescription>{p.title}</SheetDescription>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{p.bio}</p>

            <div className="surface-card p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CalendarClock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Next review
                  </p>
                  <p className="font-medium">{p.nextReview}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Last board pack
                  </p>
                  <p className="font-medium">{p.lastBoardPack}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{p.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{p.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90">
                <MessageSquare className="h-4 w-4 mr-2" /> Message
              </Button>
              <Button variant="outline">
                <CalendarClock className="h-4 w-4 mr-2" /> Schedule
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
