import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · IMAGE-I" },
      { name: "description", content: "Workspace, integration and access settings." },
      { property: "og:title", content: "Settings · IMAGE-I" },
      { property: "og:description", content: "Workspace, integration and access settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="pb-12">
      <PageHeader eyebrow="Workspace" title="Settings" description="Manage data sources, embed credentials and access." />
      <div className="px-6 lg:px-10 grid gap-4">
        {[
          { title: "Data Sources", desc: "REST connectors for ERP, CRM, HRIS and ITSM." },
          { title: "Power BI Workspace", desc: "Embed token, capacity and refresh schedule." },
          { title: "AI Agents", desc: "System prompts and skill configuration." },
          { title: "Access & Roles", desc: "Org-wide RBAC for dashboards and reports." },
        ].map((s) => (
          <div key={s.title} className="surface-card p-5">
            <h3 className="text-sm font-semibold">{s.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
