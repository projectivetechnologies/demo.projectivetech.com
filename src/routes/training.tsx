import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Activity,
  Users,
  Truck,
  Heart,
  Scale,
  History,
  BarChart3,
  Sparkles,
  FileText,
  Rocket,
  Settings,
  PlayCircle,
  BookOpen,
  Lightbulb,
  HelpCircle,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/training")({
  head: () => ({
    meta: [
      { title: "Training · IMAGE-I" },
      { name: "description", content: "Learn how to use the IMAGE-I management reporting suite — dashboards, reconciliation, AI agents and more." },
      { property: "og:title", content: "Training · IMAGE-I" },
      { property: "og:description", content: "Step-by-step guide to navigating, analyzing and acting on insights inside IMAGE-I." },
    ],
  }),
  component: TrainingPage,
});

const modules = [
  {
    icon: BookOpen,
    title: "1. Getting Started",
    duration: "5 min",
    summary: "Orient yourself with the workspace, sidebar and global topbar.",
    points: [
      "Use the left sidebar to switch between Dashboards, Intelligence and Workspace areas.",
      "The topbar shows the active workspace, search and theme toggle.",
      "Click the IMAGE-I logo any time to return to the Overview homepage.",
    ],
  },
  {
    icon: LayoutDashboard,
    title: "2. Dashboards Overview",
    duration: "8 min",
    summary: "Read KPI cards, charts and embedded Power BI reports across functions.",
    points: [
      "Overview: company-wide KPIs and pipeline health at a glance.",
      "Finance, Sales, Operations, HR, Supply Chain, Customer: function-specific deep dives.",
      "Hover any KPI card to see trend deltas and click charts for drill-down.",
    ],
  },
  {
    icon: Scale,
    title: "3. Reconciliation & Variance",
    duration: "10 min",
    summary: "Run period comparisons and interpret variance using standard costing.",
    points: [
      "Choose period pairs (Q1 vs Q1, Q1 vs Q2, etc.) and click Run Reconciliation.",
      "Review variances framed as Selling Price, Input Cost, Power & Fuel, Other Variable, Fixed Cost.",
      "Use AI Insights tab for plain-English explanations of the largest swings.",
    ],
  },
  {
    icon: History,
    title: "4. Historical & Trends",
    duration: "6 min",
    summary: "Spot multi-quarter patterns in revenue, margin and reconciliation match rates.",
    points: [
      "8-quarter trailing charts highlight directional momentum.",
      "Dual-axis chart overlays match rate against revenue and margin.",
      "Use the trend cards to brief leadership on inflection points.",
    ],
  },
  {
    icon: BarChart3,
    title: "5. Benchmarks & News",
    duration: "7 min",
    summary: "Compare against peers and stay on top of market-moving news.",
    points: [
      "Peer table colors cells by rating versus self.",
      "News feed is sentiment- and impact-tagged for quick triage.",
      "Pair benchmarks with reconciliation to explain margin gaps.",
    ],
  },
  {
    icon: Sparkles,
    title: "6. AI Agents",
    duration: "8 min",
    summary: "Ask agents to summarize, explain and recommend actions.",
    points: [
      "Pick the agent tuned to your domain (Finance, Operations, etc.).",
      "Ask follow-up questions — context carries within a session.",
      "Export the answer to a report when you find a useful narrative.",
    ],
  },
  {
    icon: FileText,
    title: "7. Reports",
    duration: "5 min",
    summary: "Generate, schedule and share board-ready reports.",
    points: [
      "Build report packs from any dashboard view.",
      "Schedule recurring delivery to stakeholders.",
      "Snapshot URLs preserve the exact filter state.",
    ],
  },
  {
    icon: Settings,
    title: "8. Settings & Onboarding",
    duration: "4 min",
    summary: "Connect data sources, configure access and bring teammates in.",
    points: [
      "Connect ERP, CRM, HRIS and ITSM via REST connectors.",
      "Manage Power BI workspace credentials and refresh schedule.",
      "Use Onboarding to invite teammates and assign roles.",
    ],
  },
];

const tips = [
  "Start every Monday on Overview, then drill into the function with the largest weekly delta.",
  "Use Reconciliation before any leadership review — it pre-empts the 'why did margin move?' question.",
  "Compare benchmark gaps against your variance buckets to separate market vs internal causes.",
  "Save useful AI Agent answers directly into a Report so the narrative is preserved.",
];

const faqs = [
  {
    q: "Where does the data come from?",
    a: "REST connectors pull from your ERP, CRM, HRIS and ITSM. Power BI workspaces are embedded for richer visuals. Refresh cadence is set under Settings › Data Sources.",
  },
  {
    q: "Who can see which dashboards?",
    a: "Access is controlled by org-wide RBAC under Settings › Access & Roles. Roles can be scoped to dashboards or report packs.",
  },
  {
    q: "How do AI Agents stay accurate?",
    a: "Agents reason over the same KPI layer that powers the dashboards, so numbers match. System prompts and skills are configurable under Settings › AI Agents.",
  },
  {
    q: "Can I export a view?",
    a: "Yes — every chart card supports PNG/CSV export, and full dashboards can be packaged from the Reports module.",
  },
];

function TrainingPage() {
  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Learn"
        title="IMAGE-I Training"
        description="A guided tour of the management reporting suite — what each module does and how to use it."
        actions={
          <span className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground">
            <PlayCircle className="h-4 w-4 text-primary" />
            ~50 min total
          </span>
        }
      />

      <div className="px-6 lg:px-10 mt-6 grid gap-6">
        {/* Quick start strip */}
        <div className="surface-card p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <Rocket className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold">Quick start in 3 steps</h3>
              <p className="text-xs text-muted-foreground mt-1">
                1) Connect a data source in <Link to="/settings" className="underline">Settings</Link> ·
                2) Open the <Link to="/" className="underline">Overview</Link> dashboard ·
                3) Run a <Link to="/reconciliation" className="underline">Reconciliation</Link> for the latest period.
              </p>
            </div>
          </div>
          <Link
            to="/onboarding"
            className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            Open Onboarding
          </Link>
        </div>

        {/* Modules */}
        <div>
          <h2 className="font-display text-lg font-semibold mb-3">Modules</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {modules.map((m) => (
              <div key={m.title} className="surface-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-primary/10 grid place-items-center">
                      <m.icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold">{m.title}</h3>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{m.duration}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{m.summary}</p>
                <ul className="mt-3 space-y-1.5">
                  {m.points.map((p) => (
                    <li key={p} className="text-xs text-foreground/90 flex gap-2">
                      <span className="text-primary">›</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Pro tips */}
        <div className="surface-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h2 className="font-display text-base font-semibold">Pro tips</h2>
          </div>
          <ul className="grid gap-2 md:grid-cols-2">
            {tips.map((t) => (
              <li key={t} className="text-xs text-muted-foreground flex gap-2">
                <span className="text-primary">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQs */}
        <div className="surface-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="h-4 w-4 text-primary" />
            <h2 className="font-display text-base font-semibold">FAQs</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger className="text-sm">{f.q}</AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Glossary quick links */}
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { icon: DollarSign, label: "Finance", to: "/finance" },
            { icon: TrendingUp, label: "Sales", to: "/sales" },
            { icon: Activity, label: "Operations", to: "/operations" },
            { icon: Users, label: "Human Capital", to: "/hr" },
            { icon: Truck, label: "Supply Chain", to: "/supply" },
            { icon: Heart, label: "Customer", to: "/customer" },
          ].map((l) => (
            <Link key={l.label} to={l.to} className="surface-card p-4 flex items-center gap-3 hover:border-primary/50 transition-colors">
              <l.icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{l.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
