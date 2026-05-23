import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { FileText, Search, Save } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  component: ReportAllocationPage,
});

interface Report {
  id: string;
  name: string;
  category: string;
  owner: string;
  sensitivity: "Public" | "Internal" | "Confidential";
}

interface AssignableUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

const REPORTS: Report[] = [
  { id: "r1", name: "Finance — P&L Summary", category: "Finance", owner: "Mohan Iyer", sensitivity: "Confidential" },
  { id: "r2", name: "Finance — Cash Flow", category: "Finance", owner: "Mohan Iyer", sensitivity: "Confidential" },
  { id: "r3", name: "Sales — Pipeline & Forecast", category: "Sales", owner: "Riya Sharma", sensitivity: "Internal" },
  { id: "r4", name: "Sales — Region Performance", category: "Sales", owner: "Riya Sharma", sensitivity: "Internal" },
  { id: "r5", name: "Operations — Plant Throughput", category: "Operations", owner: "Vikram Rao", sensitivity: "Internal" },
  { id: "r6", name: "HR — Headcount & Attrition", category: "HR", owner: "Neha Gupta", sensitivity: "Confidential" },
  { id: "r7", name: "Supply Chain — OTIF", category: "Supply Chain", owner: "Vikram Rao", sensitivity: "Internal" },
  { id: "r8", name: "Customer — NPS & CSAT", category: "Customer", owner: "Riya Sharma", sensitivity: "Public" },
  { id: "r9", name: "Reconciliation — Variance", category: "Intelligence", owner: "Mohan Iyer", sensitivity: "Confidential" },
  { id: "r10", name: "Benchmarks — Peer Index", category: "Intelligence", owner: "Admin Kapoor", sensitivity: "Internal" },
];

const USERS: AssignableUser[] = [
  { id: "u1", name: "Admin Kapoor", email: "admin@image-i.com", role: "admin" },
  { id: "u2", name: "Riya Sharma", email: "riya@image-i.com", role: "manager" },
  { id: "u3", name: "Mohan Iyer", email: "mohan@image-i.com", role: "analyst" },
  { id: "u4", name: "Sara Pinto", email: "sara@image-i.com", role: "viewer" },
  { id: "u5", name: "Vikram Rao", email: "vikram@image-i.com", role: "manager" },
  { id: "u6", name: "Neha Gupta", email: "neha@image-i.com", role: "analyst" },
];

// initial allocations: report id -> user ids
const INITIAL: Record<string, string[]> = {
  r1: ["u1", "u3"],
  r2: ["u1", "u3"],
  r3: ["u1", "u2"],
  r4: ["u1", "u2", "u4"],
  r5: ["u1", "u5"],
  r6: ["u1", "u6"],
  r7: ["u1", "u5"],
  r8: ["u1", "u2", "u4"],
  r9: ["u1", "u3"],
  r10: ["u1"],
};

function ReportAllocationPage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== "admin") {
    return (
      <div className="p-10">
        <Card className="surface-card p-10 text-center">
          <h2 className="font-display text-2xl font-semibold">Admin access required</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in with an admin account to allocate reports.</p>
        </Card>
      </div>
    );
  }

  const [allocations, setAllocations] = useState<Record<string, string[]>>(INITIAL);
  const [selectedReport, setSelectedReport] = useState<string>(REPORTS[0].id);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [dirty, setDirty] = useState(false);

  const categories = useMemo(() => ["all", ...Array.from(new Set(REPORTS.map((r) => r.category)))], []);

  const filteredReports = useMemo(() => REPORTS.filter((r) => {
    const q = query.toLowerCase();
    const matchQ = !q || r.name.toLowerCase().includes(q);
    const matchC = category === "all" || r.category === category;
    return matchQ && matchC;
  }), [query, category]);

  const current = REPORTS.find((r) => r.id === selectedReport)!;
  const assigned = allocations[selectedReport] ?? [];

  const toggleUser = (uid: string) => {
    setAllocations((prev) => {
      const list = prev[selectedReport] ?? [];
      const next = list.includes(uid) ? list.filter((x) => x !== uid) : [...list, uid];
      return { ...prev, [selectedReport]: next };
    });
    setDirty(true);
  };

  const toggleAll = (checked: boolean) => {
    setAllocations((prev) => ({ ...prev, [selectedReport]: checked ? USERS.map((u) => u.id) : [] }));
    setDirty(true);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Report Allocation"
        description="Control which users can access each report. Assignments take effect immediately upon save."
        actions={
          <Button disabled={!dirty} onClick={() => setDirty(false)}>
            <Save className="h-4 w-4 mr-2" /> {dirty ? "Save changes" : "Saved"}
          </Button>
        }
      />

      <div className="px-6 lg:px-10 py-6 grid lg:grid-cols-[380px_1fr] gap-6">
        {/* Report list */}
        <Card className="surface-card p-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search reports…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c === "all" ? "All categories" : c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 space-y-1 max-h-[60vh] overflow-y-auto pr-1">
            {filteredReports.map((r) => {
              const active = r.id === selectedReport;
              const count = (allocations[r.id] ?? []).length;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedReport(r.id)}
                  className={`w-full text-left rounded-lg p-3 transition border ${
                    active
                      ? "bg-primary/10 border-primary/30"
                      : "bg-muted/20 border-transparent hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-md bg-primary/15 text-primary grid place-items-center shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{r.name}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{r.category}</span>
                        <span>·</span>
                        <span>{count} users</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Allocation panel */}
        <Card className="surface-card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-border/60 pb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{current.category}</p>
              <h2 className="font-display text-2xl font-semibold mt-1">{current.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">Owner · {current.owner}</p>
            </div>
            <div className="flex items-center gap-2">
              <SensitivityBadge level={current.sensitivity} />
              <Badge variant="outline">{assigned.length} assigned</Badge>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Assign users with access to this report</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toggleAll(true)}>Select all</Button>
              <Button variant="outline" size="sm" onClick={() => toggleAll(false)}>Clear</Button>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {USERS.map((u) => {
                  const on = assigned.includes(u.id);
                  return (
                    <TableRow key={u.id} className={on ? "bg-primary/5" : ""}>
                      <TableCell>
                        <Checkbox checked={on} onCheckedChange={() => toggleUser(u.id)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[image:var(--gradient-primary)] grid place-items-center text-[11px] font-semibold text-primary-foreground">
                            {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </div>
                          <div className="text-sm font-medium">{u.name}</div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{u.role}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SensitivityBadge({ level }: { level: Report["sensitivity"] }) {
  const map = {
    Public: "bg-success/15 text-success",
    Internal: "bg-primary/15 text-primary",
    Confidential: "bg-destructive/15 text-destructive",
  } as const;
  return <Badge className={`${map[level]} border-0`}>{level}</Badge>;
}
