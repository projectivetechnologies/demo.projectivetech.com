import { Outlet, createRootRoute, HeadContent, Scripts, Link, useRouterState, Navigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Topbar } from "@/components/Topbar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { PreferencesProvider } from "@/lib/preferences";
import { registerOfflineCacheWorker } from "@/lib/offline-reports";
import { ReconciliationLoginDialog } from "@/components/ReconciliationLoginDialog";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The dashboard you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Back to overview
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "IMAGE-I — Management Reporting Suite" },
      {
        name: "description",
        content:
          "IMAGE-I unifies API-sourced data, Power BI reports, and AI agents into one premium management reporting workspace.",
      },
      { property: "og:title", content: "IMAGE-I — Management Reporting Suite" },
      {
        property: "og:description",
        content: "Snapshot KPIs, drill-down dashboards, and AI agents in one place.",
      },
      { name: "twitter:title", content: "IMAGE-I — Management Reporting Suite" },
      { name: "description", content: "Insight Hub is a management reporting tool that visualizes data and offers AI-driven insights." },
      { property: "og:description", content: "Insight Hub is a management reporting tool that visualizes data and offers AI-driven insights." },
      { name: "twitter:description", content: "Insight Hub is a management reporting tool that visualizes data and offers AI-driven insights." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/81781dfb-c0b8-421d-b57d-326380485324/id-preview-8bdd6f76--ff7aa3fb-e8db-4be4-9da7-28919012ee27.lovable.app-1777442051532.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/81781dfb-c0b8-421d-b57d-326380485324/id-preview-8bdd6f76--ff7aa3fb-e8db-4be4-9da7-28919012ee27.lovable.app-1777442051532.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    registerOfflineCacheWorker();
  }, []);

  return (
    <AuthProvider>
      <PreferencesProvider>
        <AuthedShell />
        <Toaster richColors position="top-right" />
      </PreferencesProvider>
    </AuthProvider>
  );
}

function AuthedShell() {
  const { user, isLoading } = useAuth();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const isLoginRoute = path === "/login";

  if (isLoginRoute) return <Outlet />;
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-lg bg-[image:var(--gradient-primary)] surface-glow grid place-items-center">
          <span className="font-display text-sm font-bold text-primary-foreground">i.</span>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
      <ReconciliationLoginDialog />
    </SidebarProvider>
  );
}
