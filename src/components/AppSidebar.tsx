import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Activity,
  Users,
  Truck,
  Heart,
  Sparkles,
  FileText,
  Settings,
  Scale,
  Rocket,
  History,
  BarChart3,
  GraduationCap,
  ShieldCheck,
  UserCog,
  FolderLock,
  UserCircle,
  MonitorUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { BusinessPlannerCard } from "@/components/BusinessPlannerCard";

const insightsItems = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Finance", url: "/finance", icon: DollarSign },
  { title: "Sales", url: "/sales", icon: TrendingUp },
  { title: "Operations", url: "/operations", icon: Activity },
  { title: "Human Capital", url: "/hr", icon: Users },
  { title: "Supply Chain", url: "/supply", icon: Truck },
  { title: "Customer", url: "/customer", icon: Heart },
];

const intelligenceItems = [
  { title: "Reconciliation", url: "/reconciliation", icon: Scale },
  { title: "Historical & Trends", url: "/historical", icon: History },
  { title: "Benchmarks & News", url: "/benchmarks", icon: BarChart3 },
];

const automationItems = [
  { title: "AI Agents", url: "/agents", icon: Sparkles },
];

const workspaceItems = [
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Power BI", url: "/power-bi", icon: MonitorUp },
  { title: "Onboarding", url: "/onboarding", icon: Rocket },
  { title: "Training", url: "/training", icon: GraduationCap },
  { title: "My Profile", url: "/profile", icon: UserCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

const adminItems = [
  { title: "User Allocation", url: "/admin/users", icon: UserCog },
  { title: "Report Allocation", url: "/admin/reports", icon: FolderLock },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath === path || currentPath.startsWith(path + "/");

  const renderGroup = (
    label: string,
    items: { title: string; url: string; icon: typeof LayoutDashboard }[],
    extra?: React.ReactNode
  ) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.18em] flex items-center gap-1.5">
        {extra}
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                <Link to={item.url} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 shrink-0 rounded-lg bg-[image:var(--gradient-primary)] grid place-items-center surface-glow">
            <span className="font-display text-sm font-bold text-primary-foreground">i.</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm font-semibold tracking-tight">IMAGE-I</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Reporting Suite
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        {renderGroup("Insights", insightsItems)}
        {renderGroup("Intelligence", intelligenceItems)}
        {renderGroup(
          "Automation",
          automationItems,
          <Sparkles className="h-3 w-3 text-primary" />
        )}
        {renderGroup("Workspace", workspaceItems)}
        {isAdmin &&
          renderGroup(
            "Administration",
            adminItems,
            <ShieldCheck className="h-3 w-3" />
          )}
      </SidebarContent>

      <SidebarFooter className="px-3 py-3">
        {!collapsed && <BusinessPlannerCard />}
      </SidebarFooter>
    </Sidebar>
  );
}
