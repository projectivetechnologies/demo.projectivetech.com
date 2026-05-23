import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import logo from "@/assets/image-i-logo.png";

const VARIANCE_LOGIN_TRIGGER_KEY = "image-i:show-login-variance";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Login failed");
      return;
    }
    try {
      window.sessionStorage.setItem(VARIANCE_LOGIN_TRIGGER_KEY, "1");
    } catch {}
    navigate({ to: "/" });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_55%),radial-gradient(circle_at_80%_80%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_60%)]" />
      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* Brand panel */}
        <div className="hidden lg:flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <img src={logo} alt="IMAGE-I" className="h-14 w-auto" />
          </div>
          <div className="space-y-4 max-w-md">
            <h2 className="font-display text-4xl font-semibold leading-tight">
              Every number, <span className="text-gradient">verified</span>. Every workflow, on its way to being automated.
            </h2>
            <p className="text-muted-foreground">
              Real-time management intelligence — built for businesses that want to grow without growing their overheads.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} IMAGE-I Reporting Suite</p>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <Card className="w-full max-w-md surface-card p-8">
            <div className="flex justify-center lg:hidden mb-6">
              <img src={logo} alt="IMAGE-I" className="h-12 w-auto" />
            </div>
            <h1 className="font-display text-2xl font-semibold">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to continue to your reporting workspace.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>

          </Card>
        </div>
      </div>
    </div>
  );
}

