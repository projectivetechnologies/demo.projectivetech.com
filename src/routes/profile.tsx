import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/lib/auth-context";
import { ACCENTS, PALETTES, usePreferences, type AccentKey, type Density, type PaletteKey } from "@/lib/preferences";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile · IMAGE-I" },
      { name: "description", content: "Manage your profile and personalize the workspace appearance." },
    ],
  }),
  component: ProfilePage,
});

const EMOJIS = ["👤", "🛡️", "📊", "🚀", "💼", "🎯", "⚡", "🌟", "🧠", "🪄", "🦊", "🐼"];

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { prefs, setPrefs, reset } = usePreferences();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    title: user?.title ?? "",
    department: user?.department ?? "",
    phone: user?.phone ?? "",
    location: user?.location ?? "",
    bio: user?.bio ?? "",
    avatarEmoji: user?.avatarEmoji ?? "👤",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name,
      title: user.title ?? "",
      department: user.department ?? "",
      phone: user.phone ?? "",
      location: user.location ?? "",
      bio: user.bio ?? "",
      avatarEmoji: user.avatarEmoji ?? "👤",
    });
  }, [user?.id]);

  if (!user) return null;

  const onSave = () => {
    updateProfile(form);
    toast.success("Profile updated");
  };

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Account"
        title="Profile & Personalization"
        description="Update your details and tailor the look and feel of your workspace."
        actions={
          <Button variant="outline" size="sm" onClick={() => { reset(); toast.message("Appearance reset to defaults"); }}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset appearance
          </Button>
        }
      />

      <div className="px-6 lg:px-10 grid lg:grid-cols-3 gap-6 mt-6">
        {/* Identity card */}
        <Card className="lg:col-span-1">
          <CardHeader className="items-center text-center pb-2">
            <div className="h-24 w-24 rounded-2xl bg-[image:var(--gradient-primary)] grid place-items-center text-4xl shadow-lg">
              <span>{form.avatarEmoji}</span>
            </div>
            <CardTitle className="mt-3">{form.name || "Unnamed user"}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <Badge variant="outline" className="mt-2 capitalize">{user.role}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Avatar</Label>
              <div className="mt-2 grid grid-cols-6 gap-2">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, avatarEmoji: e }))}
                    className={cn(
                      "h-9 w-9 rounded-lg border text-lg grid place-items-center hover:bg-muted transition",
                      form.avatarEmoji === e ? "border-primary ring-2 ring-primary/30" : "border-border/60",
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <Separator />
            <dl className="text-xs space-y-2">
              <div className="flex justify-between"><dt className="text-muted-foreground">Title</dt><dd>{form.title || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Department</dt><dd>{form.department || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Location</dt><dd>{form.location || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd>{form.phone || "—"}</dd></div>
            </dl>
          </CardContent>
        </Card>

        {/* Details form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>How you appear across IMAGE-I dashboards and reports.</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="department">Department</Label>
              <Input id="department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button onClick={onSave}><Check className="h-4 w-4 mr-1.5" /> Save changes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance customization */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Graphics & appearance
            </CardTitle>
            <CardDescription>Personalize accent color, chart palette, density and motion.</CardDescription>
          </CardHeader>
          <CardContent className="grid lg:grid-cols-2 gap-8">
            {/* Accent */}
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Accent color</Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(Object.keys(ACCENTS) as AccentKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setPrefs({ accent: k })}
                    className={cn(
                      "group rounded-lg border p-2 flex flex-col items-center gap-1.5 hover:bg-muted transition",
                      prefs.accent === k ? "border-primary ring-2 ring-primary/30" : "border-border/60",
                    )}
                  >
                    <span className="h-6 w-6 rounded-full" style={{ background: ACCENTS[k].swatch }} />
                    <span className="text-[10px] text-muted-foreground">{ACCENTS[k].label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Palette */}
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Chart palette</Label>
              <div className="space-y-2">
                {(Object.keys(PALETTES) as PaletteKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setPrefs({ palette: k })}
                    className={cn(
                      "w-full rounded-lg border p-2.5 flex items-center gap-3 hover:bg-muted transition",
                      prefs.palette === k ? "border-primary ring-2 ring-primary/30" : "border-border/60",
                    )}
                  >
                    <div className="flex -space-x-1">
                      {PALETTES[k].colors.map((c, i) => (
                        <span key={i} className="h-5 w-5 rounded-full border border-background" style={{ background: c }} />
                      ))}
                    </div>
                    <span className="text-sm">{PALETTES[k].label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Density */}
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Density</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["comfortable", "compact"] as Density[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setPrefs({ density: d })}
                    className={cn(
                      "rounded-lg border p-3 text-left hover:bg-muted transition capitalize",
                      prefs.density === d ? "border-primary ring-2 ring-primary/30" : "border-border/60",
                    )}
                  >
                    <div className="text-sm font-medium">{d}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {d === "comfortable" ? "Roomy spacing" : "Tighter rows for power use"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Radius + Animations */}
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Corner radius</Label>
                  <span className="text-xs font-mono">{(prefs.radius / 100).toFixed(2)}rem</span>
                </div>
                <Slider
                  value={[prefs.radius]}
                  min={0}
                  max={150}
                  step={5}
                  onValueChange={(v) => setPrefs({ radius: v[0] })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div>
                  <div className="text-sm font-medium">Animations</div>
                  <div className="text-[11px] text-muted-foreground">Hover, transitions and chart motion</div>
                </div>
                <Switch checked={prefs.animations} onCheckedChange={(v) => setPrefs({ animations: v })} />
              </div>

              {/* Live preview */}
              <div className="rounded-xl border border-border/60 p-4 bg-muted/20">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">Live preview</div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Button size="sm">Primary</Button>
                  <Button size="sm" variant="secondary">Secondary</Button>
                  <Button size="sm" variant="outline">Outline</Button>
                  <Badge>Badge</Badge>
                </div>
                <div className="mt-3 flex items-end gap-1.5 h-16">
                  {PALETTES[prefs.palette].colors.map((c, i) => (
                    <div key={i} className="flex-1 rounded-t-md" style={{ background: c, height: `${30 + i * 12}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
