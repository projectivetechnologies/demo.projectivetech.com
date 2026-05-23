import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { Navigate } from "@tanstack/react-router";
import { Search, UserPlus, ShieldCheck, ShieldOff } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: UserAllocationPage,
});

type Role = "admin" | "manager" | "analyst" | "viewer";
type Status = "active" | "invited" | "suspended";

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  status: Status;
  modules: string[];
  lastActive: string;
}

const DEPARTMENTS = ["Finance", "Sales", "Operations", "HR", "Supply Chain", "Customer"];
const MODULES = ["Finance", "Sales", "Operations", "HR", "Supply Chain", "Customer", "Reconciliation", "AI Agents"];

const SEED: ManagedUser[] = [
  { id: "u1", name: "Admin Kapoor", email: "admin@image-i.com", role: "admin", department: "Finance", status: "active", modules: MODULES, lastActive: "2 min ago" },
  { id: "u2", name: "Riya Sharma", email: "riya@image-i.com", role: "manager", department: "Sales", status: "active", modules: ["Sales", "Customer", "AI Agents"], lastActive: "1 hr ago" },
  { id: "u3", name: "Mohan Iyer", email: "mohan@image-i.com", role: "analyst", department: "Finance", status: "active", modules: ["Finance", "Reconciliation"], lastActive: "Today" },
  { id: "u4", name: "Sara Pinto", email: "sara@image-i.com", role: "viewer", department: "Operations", status: "invited", modules: ["Operations"], lastActive: "—" },
  { id: "u5", name: "Vikram Rao", email: "vikram@image-i.com", role: "manager", department: "Supply Chain", status: "active", modules: ["Supply Chain", "Operations"], lastActive: "Yesterday" },
  { id: "u6", name: "Neha Gupta", email: "neha@image-i.com", role: "analyst", department: "HR", status: "suspended", modules: ["HR"], lastActive: "12 days ago" },
];

function UserAllocationPage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== "admin") return <ForbiddenView />;

  const [users, setUsers] = useState<ManagedUser[]>(SEED);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", role: "viewer" as Role, department: "Finance" });

  const filtered = useMemo(() => users.filter((u) => {
    const q = query.toLowerCase();
    const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchR = roleFilter === "all" || u.role === roleFilter;
    return matchQ && matchR;
  }), [users, query, roleFilter]);

  const toggleModule = (id: string, mod: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? {
      ...u,
      modules: u.modules.includes(mod) ? u.modules.filter((m) => m !== mod) : [...u.modules, mod],
    } : u));
  };

  const setRole = (id: string, role: Role) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? {
      ...u, status: u.status === "active" ? "suspended" : "active",
    } : u));
  };

  const addUser = () => {
    if (!draft.name || !draft.email) return;
    const id = `u${Date.now()}`;
    setUsers((prev) => [
      { id, name: draft.name, email: draft.email, role: draft.role, department: draft.department, status: "invited", modules: [], lastActive: "—" },
      ...prev,
    ]);
    setDraft({ name: "", email: "", role: "viewer", department: "Finance" });
    setOpen(false);
  };

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    active: users.filter((u) => u.status === "active").length,
    suspended: users.filter((u) => u.status === "suspended").length,
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="User Allocation"
        description="Manage workspace members, roles, and module-level access."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><UserPlus className="h-4 w-4 mr-2" />Invite user</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Invite a new user</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Full name</Label>
                  <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Work email</Label>
                  <Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <Select value={draft.role} onValueChange={(v) => setDraft({ ...draft, role: v as Role })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="analyst">Analyst</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Department</Label>
                    <Select value={draft.department} onValueChange={(v) => setDraft({ ...draft, department: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={addUser}>Send invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="px-6 lg:px-10 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total users" value={stats.total} />
          <StatCard label="Admins" value={stats.admins} />
          <StatCard label="Active" value={stats.active} accent="success" />
          <StatCard label="Suspended" value={stats.suspended} accent="destructive" />
        </div>

        <Card className="surface-card p-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search users…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Module access</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[image:var(--gradient-primary)] grid place-items-center text-[11px] font-semibold text-primary-foreground">
                          {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select value={u.role} onValueChange={(v) => setRole(u.id, v as Role)}>
                        <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="analyst">Analyst</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm">{u.department}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[260px]">
                        {MODULES.map((m) => {
                          const on = u.modules.includes(m);
                          return (
                            <button
                              key={m}
                              onClick={() => toggleModule(u.id, m)}
                              className={`text-[10px] px-2 py-0.5 rounded-full border transition ${
                                on
                                  ? "bg-primary/15 text-primary border-primary/30"
                                  : "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted"
                              }`}
                            >
                              {m}
                            </button>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={u.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{u.lastActive}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(u.id)}
                        className="text-xs"
                      >
                        {u.status === "active" ? (
                          <><ShieldOff className="h-3.5 w-3.5 mr-1" />Suspend</>
                        ) : (
                          <><ShieldCheck className="h-3.5 w-3.5 mr-1" />Activate</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: "success" | "destructive" }) {
  const color = accent === "success" ? "text-success" : accent === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <Card className="surface-card p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-3xl font-semibold ${color}`}>{value}</p>
    </Card>
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "active") return <Badge className="bg-success/15 text-success hover:bg-success/15 border-0">Active</Badge>;
  if (status === "invited") return <Badge variant="outline">Invited</Badge>;
  return <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/15 border-0">Suspended</Badge>;
}

function ForbiddenView() {
  return (
    <div className="p-10">
      <Card className="surface-card p-10 text-center">
        <h2 className="font-display text-2xl font-semibold">Admin access required</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sign in with an admin account to manage users.</p>
      </Card>
    </div>
  );
}
