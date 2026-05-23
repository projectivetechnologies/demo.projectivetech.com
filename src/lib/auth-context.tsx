import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Dev: localhost:8000  |  Prod: swap this to your EC2 URL before npm run build
//const API_BASE = "http://localhost:8000";
const API_BASE = "http://ec2-13-233-125-32.ap-south-1.compute.amazonaws.com";
const STORAGE_KEY = "image-i.auth.user";

export type UserRole = "admin" | "user";

export interface AuthUser {
  id: string;
  orgId?: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
  title?: string;
  department?: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatarEmoji?: string;
  // Extra fields populated from the real backend user profile
  doc_agent_excel_name?: string;
  doc_agent_excel_url?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  /** Async — calls the real backend, falls back to demo users when unreachable. */
  login: (email: string, password?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (patch: Partial<Omit<AuthUser, "id" | "email" | "role">>) => void;
}

// ---------------------------------------------------------------------------
// Demo / offline fallback users (used when the Django backend is unreachable)
// ---------------------------------------------------------------------------
const MOCK_USERS: Array<AuthUser & { password: string }> = [
  {
    id: "u1", orgId: "45", name: "Admin Kapoor", email: "admin@image-i.com",
    password: "admin123", role: "admin", initials: "AK",
    title: "Chief Data Officer", department: "Executive",
    phone: "+91 98100 12345", location: "Mumbai, IN", avatarEmoji: "🛡️",
    bio: "Owns the management reporting platform across all business units.",
  },
  {
    id: "u2", orgId: "45", name: "Riya Sharma", email: "user@image-i.com",
    password: "user123", role: "user", initials: "RS",
    title: "Finance Analyst", department: "Finance",
    phone: "+91 99820 45678", location: "Bengaluru, IN", avatarEmoji: "📊",
    bio: "Reconciliation and variance analysis for monthly close.",
  },
];

// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persist = (u: AuthUser | null) => {
    try {
      if (u) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  // -------------------------------------------------------------------------
  // login — tries real Django backend first, falls back to demo users
  // -------------------------------------------------------------------------
  const login: AuthContextValue["login"] = async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) return { ok: false, error: "Enter your email to continue" };

    // --- Real backend ---
    try {
      const response = await fetch(`${API_BASE}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      type LoginJson = {
        data?: {
          message?: string;
          token?: string;
          UserDetails?: Record<string, unknown>;
          org_data?: Record<string, unknown> | null;
          org_member?: Record<string, unknown> | null;
        };
        message?: string;
      };

      const json = (await response.json().catch(() => null)) as LoginJson | null;
      const data = json?.data;

      if (response.ok && data?.message === "Successfully logged in" && data.token) {
        const token = data.token;
        const details = (data.UserDetails ?? {}) as Record<string, unknown>;
        const orgData = (data.org_data ?? {}) as Record<string, unknown>;
        const orgMember = data.org_member;

        // ── Persist all keys that agents, embeds and KPI tiles rely on ──
        localStorage.setItem("token", token);
        if (details.id) localStorage.setItem("user_id", String(details.id));
        if (orgData.id) localStorage.setItem("org_id", String(orgData.id));
        localStorage.setItem("user", JSON.stringify(details));
        localStorage.setItem("org", JSON.stringify(orgData));
        localStorage.setItem("org_data", JSON.stringify({ data: orgData }));
        if (orgMember) localStorage.setItem("org_member", JSON.stringify(orgMember));

        // Resolve role — backend sends either "admin"/"user" string or { role: "admin" }
        const rawRole = details.role as { role?: string } | string | undefined;
        const roleStr = typeof rawRole === "object" ? rawRole?.role : rawRole;
        const resolvedRole: UserRole = roleStr === "admin" ? "admin" : "user";

        const displayName =
          ((details.name ?? details.full_name ?? details.username) as string | undefined) ??
          trimmedEmail.split("@")[0];

        const authUser: AuthUser = {
          id: String(details.id ?? `be-${trimmedEmail}`),
          orgId: orgData.id ? String(orgData.id) : undefined,
          name: displayName,
          email: (details.email as string | undefined) ?? trimmedEmail,
          role: resolvedRole,
          initials: buildInitials(displayName),
          title: (details.title ?? details.designation) as string | undefined,
          department: details.department as string | undefined,
          phone: details.phone as string | undefined,
          location: details.location as string | undefined,
          bio: details.bio as string | undefined,
          avatarEmoji: "👤",
          doc_agent_excel_name: details.doc_agent_excel_name as string | undefined,
          doc_agent_excel_url: details.doc_agent_excel_url as string | undefined,
        };

        setUser(authUser);
        persist(authUser);
        return { ok: true };
      }

      // Backend reachable but credentials wrong / account missing
      const msg =
        data?.message ?? json?.message ?? "Invalid email or password";
      return { ok: false, error: msg };

    } catch {
      // Network error / backend not reachable — fall through to demo mode
    }

    // --- Demo / offline fallback ---
    const match = MOCK_USERS.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!match) {
      return {
        ok: false,
        error: "Cannot reach the server. Check your connection or try a demo account.",
      };
    }
    if (password && match.password !== password) {
      return { ok: false, error: "Invalid email or password" };
    }
    const { password: _pw, ...safe } = match;
    setUser(safe);
    persist(safe);
    return { ok: true };
  };

  // -------------------------------------------------------------------------
  const logout = () => {
    setUser(null);
    persist(null);
    // Clear all auth-related localStorage keys
    ["token", "org_id", "user_id", "user", "org", "org_data", "org_member"].forEach((key) => {
      try { localStorage.removeItem(key); } catch {}
    });
  };

  const updateProfile: AuthContextValue["updateProfile"] = (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      if (patch.name) next.initials = buildInitials(patch.name);
      persist(next);
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

function buildInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
