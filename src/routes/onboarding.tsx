import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Building2,
  Database,
  Gauge,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding · IMAGE-I" },
      { name: "description", content: "Set up your organization, connect data sources, and pick KPIs." },
      { property: "og:title", content: "Onboarding · IMAGE-I" },
      { property: "og:description", content: "Three-step guided setup for IMAGE-I reporting." },
    ],
  }),
  component: OnboardingPage,
});

const STEPS = [
  { id: 1, title: "Organization", icon: Building2, desc: "Tell us about your company" },
  { id: 2, title: "Data Sources", icon: Database, desc: "Connect ERP, CRM, HRIS, ITSM" },
  { id: 3, title: "KPI Selection", icon: Gauge, desc: "Pick the metrics that matter" },
];

const SOURCES = [
  { id: "sap", name: "SAP S/4HANA", category: "ERP" },
  { id: "oracle", name: "Oracle Fusion", category: "ERP" },
  { id: "salesforce", name: "Salesforce", category: "CRM" },
  { id: "hubspot", name: "HubSpot", category: "CRM" },
  { id: "workday", name: "Workday", category: "HRIS" },
  { id: "bamboo", name: "BambooHR", category: "HRIS" },
  { id: "servicenow", name: "ServiceNow", category: "ITSM" },
  { id: "jira", name: "Jira Service Mgmt", category: "ITSM" },
];

const KPI_OPTIONS = [
  { id: "finance", label: "Finance · Revenue, margin, AR/AP" },
  { id: "sales", label: "Sales · Pipeline, win-rate, ACV" },
  { id: "operations", label: "Operations · SLA, uptime, incidents" },
  { id: "hr", label: "Human Capital · Headcount, attrition" },
  { id: "supply", label: "Supply Chain · Lead time, inventory" },
  { id: "customer", label: "Customer · NPS, churn, CSAT" },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [org, setOrg] = useState({ name: "", industry: "", size: "", region: "" });
  const [sources, setSources] = useState<string[]>([]);
  const [kpis, setKpis] = useState<string[]>(["finance", "sales", "operations"]);

  const progress = (step / STEPS.length) * 100;

  const toggle = (id: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const finish = () => {
    toast.success("Workspace ready", {
      description: `${kpis.length} KPI groups configured · ${sources.length} sources connected`,
    });
    navigate({ to: "/" });
  };

  const canAdvance =
    (step === 1 && org.name && org.industry && org.size) ||
    (step === 2 && sources.length > 0) ||
    (step === 3 && kpis.length > 0);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="relative overflow-hidden border-b border-border/60">
        <div aria-hidden className="absolute inset-0 -z-10 opacity-80" style={{ backgroundImage: "var(--gradient-aurora)" }} />
        <div className="px-6 lg:px-10 py-8 max-w-4xl mx-auto w-full">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary">Welcome to IMAGE-I</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mt-2">
            Let's set up your reporting workspace
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Three quick steps and you're ready to monitor your business in real time.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Progress value={progress} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground tabular-nums">
              Step {step} of {STEPS.length}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {STEPS.map((s) => {
              const active = s.id === step;
              const done = s.id < step;
              return (
                <div
                  key={s.id}
                  className={`surface-card p-4 transition-all ${
                    active ? "border-primary/50 ring-2 ring-primary/15" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-8 w-8 rounded-lg grid place-items-center ${
                        done
                          ? "bg-success/15 text-success"
                          : active
                            ? "bg-[image:var(--gradient-primary)] text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{s.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{s.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 lg:px-10 py-8">
        <div className="max-w-4xl mx-auto w-full">
          <div className="surface-card p-6 md:p-8">
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Organization profile</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Helps us tailor benchmarks and dashboards to your industry.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company name</Label>
                    <Input
                      id="name"
                      placeholder="Acme Corporation"
                      value={org.name}
                      onChange={(e) => setOrg({ ...org, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select value={org.industry} onValueChange={(v) => setOrg({ ...org, industry: v })}>
                      <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="finserv">Financial Services</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="retail">Retail & Consumer</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Company size</Label>
                    <Select value={org.size} onValueChange={(v) => setOrg({ ...org, size: v })}>
                      <SelectTrigger><SelectValue placeholder="Headcount" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sm">1 – 250</SelectItem>
                        <SelectItem value="mm">251 – 1,000</SelectItem>
                        <SelectItem value="ent">1,001 – 10,000</SelectItem>
                        <SelectItem value="lge">10,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Primary region</Label>
                    <Select value={org.region} onValueChange={(v) => setOrg({ ...org, region: v })}>
                      <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amer">Americas</SelectItem>
                        <SelectItem value="emea">EMEA</SelectItem>
                        <SelectItem value="apac">APAC</SelectItem>
                        <SelectItem value="global">Global</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Connect your data sources</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select systems IMAGE-I should ingest via API. You can add more later.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SOURCES.map((src) => {
                    const checked = sources.includes(src.id);
                    return (
                      <button
                        key={src.id}
                        type="button"
                        onClick={() => toggle(src.id, sources, setSources)}
                        className={`text-left surface-card p-4 hover-lift ${
                          checked ? "border-primary/50 ring-2 ring-primary/15" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold">{src.name}</p>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mt-1">
                              {src.category}
                            </p>
                          </div>
                          <Checkbox checked={checked} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Pick the KPIs to surface</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    These will appear as cards on your overview dashboard.
                  </p>
                </div>
                <div className="space-y-2">
                  {KPI_OPTIONS.map((k) => {
                    const checked = kpis.includes(k.id);
                    return (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => toggle(k.id, kpis, setKpis)}
                        className={`w-full text-left flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                          checked
                            ? "border-primary/50 bg-primary/5"
                            : "border-border hover:bg-muted/40"
                        }`}
                      >
                        <Checkbox checked={checked} />
                        <span className="text-sm">{k.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Your AI Agent will be tuned automatically based on the KPI groups you select.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              {step < STEPS.length ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canAdvance}
                  className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90"
                >
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={finish}
                  disabled={!canAdvance}
                  className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90"
                >
                  Launch workspace <CheckCircle2 className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
