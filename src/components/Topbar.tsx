import { Bell, Search, LogOut, User as UserIcon, AlertTriangle, Sparkles, MessageSquare } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { notifications, type Notification } from "@/lib/mock-data";
import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";

const categoryConfig = {
  variance: {
    Icon: AlertTriangle,
    label: "Reconciliation",
    cls: "text-warning",
    bg: "bg-warning/10 border-warning/30",
    route: "/reconciliation",
  },
  agent: {
    Icon: Sparkles,
    label: "AI Agent",
    cls: "text-primary",
    bg: "bg-primary/10 border-primary/30",
    route: "/agents",
  },
  planner: {
    Icon: MessageSquare,
    label: "Business Planner",
    cls: "text-success",
    bg: "bg-success/10 border-success/30",
    route: "/profile",
  },
} as const;

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate({ to: "/agents", search: { q: query.trim() } as never });
  };

  const grouped: Record<Notification["category"], Notification[]> = {
    variance: notifications.filter((n) => n.category === "variance"),
    agent: notifications.filter((n) => n.category === "agent"),
    planner: notifications.filter((n) => n.category === "planner"),
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="hidden md:flex items-center gap-2 ml-2">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">IMAGE-I</span>
        <span className="text-xs text-muted-foreground/40">/</span>
        <span className="text-xs text-foreground/80">Management Reporting</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything — e.g. why did margin drop last month?"
            className="h-9 w-[22rem] pl-9 bg-muted/40 border-border/60 placeholder:text-muted-foreground/60"
          />
        </form>
        <ThemeToggle />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground grid place-items-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            <div className="px-4 py-3 border-b border-border/60">
              <p className="text-sm font-semibold">Notifications</p>
              <p className="text-[11px] text-muted-foreground">
                {unreadCount} unread · {notifications.length} total
              </p>
            </div>
            <div className="max-h-[420px] overflow-auto scrollbar-thin">
              {(Object.keys(grouped) as Notification["category"][]).map((cat) => {
                const items = grouped[cat];
                if (!items.length) return null;
                const cfg = categoryConfig[cat];
                return (
                  <div key={cat} className="py-2">
                    <div className="px-4 pb-1.5 flex items-center gap-1.5">
                      <cfg.Icon className={cn("h-3 w-3", cfg.cls)} />
                      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {cfg.label}
                      </span>
                    </div>
                    {items.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => navigate({ to: cfg.route })}
                        className={cn(
                          "w-full text-left px-4 py-2.5 flex gap-3 items-start hover:bg-muted/40 transition-colors",
                          n.unread && "bg-muted/20"
                        )}
                      >
                        <span
                          className={cn(
                            "h-2 w-2 mt-1.5 shrink-0 rounded-full",
                            n.unread ? "bg-primary" : "bg-transparent"
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{n.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border/60 p-2">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Mark all as read
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-9 w-9 rounded-full bg-[image:var(--gradient-primary)] grid place-items-center text-xs font-semibold text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring">
              {user?.initials ?? "?"}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
                <Badge variant="outline" className="mt-1.5 w-fit capitalize text-[10px]">
                  {user?.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
              <UserIcon className="h-4 w-4 mr-2" /> My profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
              <UserIcon className="h-4 w-4 mr-2" /> Workspace settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
