import { createFileRoute } from "@tanstack/react-router";
import {
  Bot,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Package,
  Puzzle,
  RefreshCw,
  Send,
  Table2,
  Upload,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, type AuthUser } from "@/lib/auth-context";
import { apiDownload, apiPost, apiPostForm, getJwtUserId } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "AI Agents - IMAGE-I" },
      {
        name: "description",
        content: "Working IMAGE-I assistants for business, document, shipping and compliance workflows.",
      },
    ],
  }),
  component: AgentsPage,
});

type AgentId = "business" | "document" | "shipping" | "compliance" | "financial";
type ChatMessage = { role: "user" | "assistant"; content: string; loading?: boolean };
type UploadedFile = File | null;

const DEFAULT_DOC_AGENT_FILE_ID = "Analysiscanvas_21.xlsx";
const DEFAULT_DOC_AGENT_EXCEL_URL =
  "https://projectivetech-my.sharepoint.com/:x:/p/resource1/EeWDOHDMb6pHkw4eoYB7W_UBmKtrIfiIBVFLFRrP_f128A?e=ccgKwP";

function pageFromMarker(marker?: string | null) {
  if (!marker) return undefined;
  const match = marker.match(/---\s*Page\s*(\d+)\s*---/i);
  return match ? Number(match[1]) : undefined;
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

const assistantCards: Array<{
  id: AgentId;
  title: string;
  description: string;
  Icon: typeof Bot;
  iconClass: string;
}> = [
  {
    id: "business",
    title: "Business Consultant",
    description: "Ask anything about your business",
    Icon: Bot,
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    id: "document",
    title: "Document Agent",
    description: "Analyse and extract from documents",
    Icon: FileText,
    iconClass: "bg-violet-50 text-violet-600",
  },
  {
    id: "financial",
    title: "Financial Analyst",
    description: "Analyse spreadsheet and database data",
    Icon: FileSpreadsheet,
    iconClass: "bg-emerald-50 text-emerald-700",
  },
  {
    id: "shipping",
    title: "Shipping Document Agent",
    description: "Process shipping documents",
    Icon: Package,
    iconClass: "bg-cyan-50 text-cyan-700",
  },
  {
    id: "compliance",
    title: "Compliance Agent",
    description: "Regulatory compliance checks",
    Icon: Puzzle,
    iconClass: "bg-pink-50 text-emerald-600",
  },
];

function getBackendOrgId(user?: AuthUser | null) {
  const demoUserOrgId = user?.id === "u1" || user?.id === "u2" ? "45" : undefined;
  const candidates = [
    localStorage.getItem("org_id"),
    safeJsonParse(localStorage.getItem("org"))?.id,
    safeJsonParse(localStorage.getItem("org_data"))?.data?.id,
    user?.orgId,
    user?.id,
    demoUserOrgId,
  ];

  const value = candidates.find((candidate) => candidate !== undefined && candidate !== null && /^\d+$/.test(String(candidate)));
  return value ? String(value) : undefined;
}

function getBackendUserId(user?: AuthUser | null) {
  // The JWT payload contains _id = str(user.id) — most reliable source after real login
  const jwtUserId = getJwtUserId();
  const demoUserId = user?.id === "u1" ? "1" : user?.id === "u2" ? "2" : undefined;
  const candidates = [
    localStorage.getItem("user_id"),
    jwtUserId,
    safeJsonParse(localStorage.getItem("user"))?.id,
    safeJsonParse(localStorage.getItem("user_data"))?.data?.id,
    user?.id,
    demoUserId,
  ];

  const value = candidates.find(
    (candidate) => candidate !== undefined && candidate !== null && /^\d+$/.test(String(candidate))
  );
  return value ? String(value) : undefined;
}



function getDocAgentFileId(user?: AuthUser | null) {
  const storedUser = safeJsonParse(localStorage.getItem("user"));
  const storedUserData = safeJsonParse(localStorage.getItem("user_data"));
  const candidates = [
    localStorage.getItem("doc_agent_excel_name"),
    localStorage.getItem("docAgentExcelFileId"),
    storedUser?.doc_agent_excel_name,
    storedUserData?.data?.doc_agent_excel_name,
    (user as any)?.doc_agent_excel_name,
    DEFAULT_DOC_AGENT_FILE_ID,
  ];

  const value = candidates.find((candidate) => candidate && !["none", "null", "undefined"].includes(String(candidate).toLowerCase()));
  return value ? String(value) : undefined;
}

function getDocAgentExcelUrl(user?: AuthUser | null) {
  const storedUser = safeJsonParse(localStorage.getItem("user"));
  const storedUserData = safeJsonParse(localStorage.getItem("user_data"));
  const candidates = [
    localStorage.getItem("doc_agent_excel_url"),
    localStorage.getItem("docAgentExcelUrl"),
    storedUser?.doc_agent_excel_url,
    storedUserData?.data?.doc_agent_excel_url,
    (user as any)?.doc_agent_excel_url,
    DEFAULT_DOC_AGENT_EXCEL_URL,
  ];

  const value = candidates.find((candidate) => candidate && !["none", "null", "undefined"].includes(String(candidate).toLowerCase()));
  return value ? String(value) : undefined;
}

function buildExcelEmbedUrl(url?: string, key?: number) {
  if (!url) return undefined;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}action=embedview&AllowTyping=True&wdDownloadButton=True&wdInConfigurator=True&wdHideHeaders=True&t=${key ?? Date.now()}`;
}

function safeJsonParse(value: string | null) {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

const postJson = (path: string, body: Record<string, unknown>) =>
  apiPost(path, body) as Promise<Record<string, unknown>>;

const postForm = (path: string, formData: FormData) =>
  apiPostForm(path, formData) as Promise<Record<string, unknown>>;

function downloadReport(filename: string, localPath = "/user/download_analysis_pdf") {
  if (!filename) { toast.error("Report is not available yet."); return; }
  apiDownload(`${localPath}?filename=${encodeURIComponent(filename)}`, filename)
    .catch(() => toast.error("Download failed. Please try again."));
}

function AgentsPage() {
  const [activeId, setActiveId] = useState<AgentId | null>(null);
  const active = activeId ? assistantCards.find((agent) => agent.id === activeId) ?? assistantCards[0] : null;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <PageHeader
        eyebrow="AI Workspace"
        title="IMAGE-I Agent"
        description="One agent, multiple skills - switch context to get specialized analysis."
      />

      {!active ? (
        <div className="border-b border-border/60 bg-background/80 px-4 py-6 lg:px-8">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">Skills</p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {assistantCards.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => setActiveId(agent.id)}
                className={cn(
                  "agent-skill-card flex w-full items-start gap-3 rounded-xl border border-border/70 bg-card p-4 text-left transition-all hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                <span className={cn("mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg", agent.iconClass)}>
                  <agent.Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-foreground">{agent.title}</span>
                  <span className="mt-1 block text-sm leading-snug text-muted-foreground">{agent.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <section className="min-w-0 border-b border-border/60 bg-background">
          <div className="border-b border-border/60 px-4 py-5 lg:px-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary">Active Skill</p>
                <h2 className="mt-1 text-2xl font-semibold">{active.title}</h2>
                <p className="text-sm text-muted-foreground">{active.description}</p>
              </div>
              <Button variant="outline" onClick={() => setActiveId(null)}>
                Back to skills
              </Button>
            </div>
          </div>

          <div className="p-4 lg:p-8">
            {activeId === "business" && <BusinessConsultant />}
            {activeId === "document" && <DocumentAgent />}
            {activeId === "shipping" && <ShippingAgent />}
            {activeId === "compliance" && <ComplianceAgent />}
            {activeId === "financial" && <FinancialAnalystAgent />}
          </div>
        </section>
      )}
    </div>
  );
}

function BusinessConsultant() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Start your conversation with the Business Consultant." },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = prompt.trim();
    if (!text || loading) return;
    const orgId = getBackendOrgId(user);

    if (!orgId) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Organization ID is missing. Please login again or set org_id in local storage." },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "Retrieving data from database...\nAnalyzing with financial model...", loading: true },
    ]);
    setPrompt("");
    setLoading(true);

    try {
      const data = await postJson("/user/get_chat/", {
        prompt: text,
        orgId,
        userId: getBackendUserId(user),
      });
      setMessages((prev) => [
        ...prev.filter((message) => !message.loading),
        { role: "assistant", content: String(data?.response || "No response received.") },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev.filter((message) => !message.loading),
        { role: "assistant", content: error instanceof Error ? error.message : "Could not connect to server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[620px] flex-col rounded-xl border border-border/60 bg-background">
      <div ref={scrollRef} className="flex-1 overflow-auto p-4 scrollbar-thin">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={cn("flex", message.role === "user" && "justify-end")}>
              <div
                className={cn(
                  "max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border/70 bg-card"
                )}
              >
                {message.loading && <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />}
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          send();
        }}
        className="border-t border-border/60 p-3"
      >
        <div className="flex items-end gap-2 rounded-lg border border-border/60 bg-card p-2">
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="min-h-10 max-h-36 resize-none border-0 bg-transparent focus-visible:ring-0"
          />
          <Button type="submit" disabled={loading || !prompt.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}

function FinancialAnalystAgent() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Ask a spreadsheet question or query the database. Use Spreadsheet for workbook analysis and Database for live data.",
    },
  ]);
  const [loadingMode, setLoadingMode] = useState<"spreadsheet" | "database" | null>(null);
  const [iframeKey, setIframeKey] = useState(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);

  const fileId = "Analysiscanvas_21.xlsx";
  const spreadsheetUrl =
    "https://projectivetech-my.sharepoint.com/:x:/p/resource1/EeWDOHDMb6pHkw4eoYB7W_UBmKtrIfiIBVFLFRrP_f128A?e=ccgKwP&action=embedview&AllowTyping=True&wdDownloadButton=True&wdInConfigurator=True";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (mode: "spreadsheet" | "database") => {
    const text = prompt.trim();
    if (!text || loadingMode) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      {
        role: "assistant",
        content: mode === "spreadsheet" ? "Reading workbook and preparing analysis..." : "Querying database and preparing analysis...",
        loading: true,
      },
    ]);
    setPrompt("");
    setLoadingMode(mode);

    try {
      const data = await postJson("/user/get_chat_xlsx/", {
        prompt: text,
        orgId: getBackendOrgId(user) || "",
        fileId,
        mode,
      });

      setMessages((prev) => [
        ...prev.filter((message) => !message.loading),
        { role: "assistant", content: String(data?.response ?? data?.message ?? "No response received.") },
      ]);

      window.setTimeout(() => setIframeKey(Date.now()), 8000);
    } catch (error) {
      setMessages((prev) => [
        ...prev.filter((message) => !message.loading),
        { role: "assistant", content: error instanceof Error ? error.message : "Financial analyst request failed." },
      ]);
    } finally {
      setLoadingMode(null);
    }
  };

  const clearExcel = async () => {
    try {
      await postJson("/user/clear_excel_data/", { file_id: fileId });
      setIframeKey(Date.now());
      toast.success("Spreadsheet data cleared.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not clear spreadsheet.");
    }
  };

  const suggestions = [
    { label: "Monthwise revenue", mode: "database" as const },
    { label: "Top 5 products by sales", mode: "database" as const },
    { label: "Activity code for Body Belt", mode: "spreadsheet" as const },
    { label: "Top 10 by quantity from salesreports1", mode: "spreadsheet" as const },
  ];

  return (
    <div className="grid min-h-[610px] grid-cols-1 gap-4 xl:grid-cols-[1fr_420px]">
      <div className="flex min-w-0 flex-col rounded-xl border border-border/60 bg-background shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Spreadsheet Workspace</p>
            <p className="text-xs text-muted-foreground">Editable Excel canvas used by the Financial Analyst.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIframeKey(Date.now())}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={clearExcel}>
              <X className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>

        <div className="min-h-[520px] flex-1 p-3">
          <iframe
            key={iframeKey}
            title="Financial Analyst Spreadsheet"
            src={`${spreadsheetUrl}&t=${iframeKey}`}
            className="h-full min-h-[520px] w-full rounded-lg border border-border/70 bg-white"
            allowFullScreen
          />
        </div>
      </div>

      <div className="flex min-h-[610px] flex-col rounded-xl border border-border/60 bg-background shadow-sm">
        <div className="border-b border-border/60 px-4 py-3">
          <p className="text-sm font-semibold">Financial Analyst Chat</p>
          <p className="text-xs text-muted-foreground">Send questions to SpreadsheetAI or database mode.</p>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-auto p-4 scrollbar-thin">
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div key={index} className={cn("flex", message.role === "user" && "justify-end")}>
                <div
                  className={cn(
                    "max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border/70 bg-card"
                  )}
                >
                  {message.loading && <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />}
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border/60 p-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.label}
                type="button"
                onClick={() => setPrompt(suggestion.label)}
                className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
              >
                {suggestion.label}
              </button>
            ))}
          </div>

          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && event.ctrlKey) {
                event.preventDefault();
                send("spreadsheet");
              } else if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send("database");
              }
            }}
            placeholder="Ask about your spreadsheet or database..."
            rows={3}
            className="mb-3 resize-none"
          />

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => send("spreadsheet")} disabled={!prompt.trim() || !!loadingMode}>
              {loadingMode === "spreadsheet" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Table2 className="h-4 w-4" />}
              Spreadsheet
            </Button>
            <Button onClick={() => send("database")} disabled={!prompt.trim() || !!loadingMode}>
              {loadingMode === "database" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              Database
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentAgent() {
  const { user } = useAuth();

  // ── Excel embed ──────────────────────────────────────────────────────────
  const [iframeKey, setIframeKey] = useState(Date.now());
  const docFileId = getDocAgentFileId(user);
  const spreadsheetUrl = buildExcelEmbedUrl(getDocAgentExcelUrl(user), iframeKey);

  // ── Upload / analysis state ──────────────────────────────────────────────
  const [file, setFile] = useState<UploadedFile>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiResponse, setAiResponse] = useState<unknown>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadFilename, setDownloadFilename] = useState("AI_Analysis_Report.pdf");
  const inputRef = useRef<HTMLInputElement>(null);

  // When a file is selected, clear the Excel sheet so it's ready for fresh output
  const handleFileChange = async (nextFile: UploadedFile) => {
    setFile(nextFile);
    setAiResponse(null);
    setErrorMsg("");
    setUploadProgress(0);
    setDownloadFilename("AI_Analysis_Report.pdf");

    if (!docFileId) return;
    try {
      await postJson("/user/clear_excel_data/", { file_id: docFileId });
      setIframeKey(Date.now());
    } catch (err) {
      console.error("Failed to clear Excel on file select:", err);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setErrorMsg("Please select a PDF or image file to review.");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    setAiResponse(null);
    setUploadProgress(10);

    try {
      const resolvedUserId = getBackendUserId(user);
      const resolvedOrgId = getBackendOrgId(user);

      if (!resolvedUserId) {
        setErrorMsg("User session expired or user ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      const form = new FormData();
      form.append("file", file);
      // Send both camelCase and snake_case so either Django view convention works
      form.append("user_id", resolvedUserId);
      form.append("userId", resolvedUserId);
      if (resolvedOrgId) {
        form.append("org_id", resolvedOrgId);
        form.append("orgId", resolvedOrgId);
      }

      // Simulate progress ticks while awaiting the server
      const ticker = window.setInterval(
        () => setUploadProgress((p) => (p < 85 ? p + 8 : p)),
        900
      );

      const data = await postForm("/user/validate_document_agent", form);
      window.clearInterval(ticker);
      setUploadProgress(100);

      setDownloadFilename(String(data?.download_filename || "AI_Analysis_Report.pdf"));
      setAiResponse(data?.aiAnswer ?? null);

      if (String((data?.SpreadsheetData as Record<string, unknown>)?.updated_excel ?? "").startsWith("✅")) {
        window.setTimeout(() => setIframeKey(Date.now()), 700);
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong while reviewing the document."
      );
    } finally {
      setLoading(false);
      window.setTimeout(() => setUploadProgress(0), 800);
    }
  };

  const handleDownload = () => {
    downloadReport(downloadFilename);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="grid h-[78vh] min-h-[600px] grid-cols-1 gap-4 lg:grid-cols-2">

      {/* ── LEFT: Excel embed (full height) ── */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm">
        {spreadsheetUrl ? (
          <iframe
            key={iframeKey}
            title="Document Agent Excel Sheet"
            src={`${spreadsheetUrl}&timestamp=${iframeKey}`}
            className="h-full w-full"
            frameBorder="0"
            scrolling="no"
            allowFullScreen
          />
        ) : (
          <div className="grid h-full place-items-center p-6 text-center text-sm text-muted-foreground">
            Document Agent Excel URL is not configured for this user.
          </div>
        )}
      </div>

      {/* ── RIGHT: Upload card + Analysis panel ── */}
      <div className="flex flex-col gap-3 overflow-hidden">

        {/* Upload card */}
        <div className="shrink-0 rounded-xl border border-border/60 bg-background p-4 shadow-sm">
          <p className="text-sm font-semibold">📄 Document Agent</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Upload a PDF or image and the AI will extract text &amp; provide insights.{" "}
            <span className="font-medium text-foreground">
              Your document is not stored in any database.
            </span>
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => inputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              {file ? "Change File" : "Select PDF / Image"}
            </Button>
            <input
              ref={inputRef}
              hidden
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
            {file && (
              <span className="text-xs text-muted-foreground">
                {file.name} &nbsp;({Math.round(file.size / 1024)} KB)
              </span>
            )}
          </div>

          {uploadProgress > 0 && (
            <Progress value={uploadProgress} className="mt-3" />
          )}

          <Button
            className="mt-3 w-full"
            onClick={handleSubmit}
            disabled={loading || !file}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Review Document
          </Button>

          {errorMsg && (
            <p className="mt-2 text-xs text-destructive">{errorMsg}</p>
          )}
        </div>

        {/* AI Analysis panel — fills remaining height, scrollable */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-blue-50/30 shadow-sm dark:bg-blue-950/10">
          <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-3">
            <p className="text-sm font-semibold">🤖 AI Document Analysis</p>
            <Button
              variant="outline"
              size="sm"
              disabled={!aiResponse}
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4 text-sm">
            {loading ? (
              <div className="grid h-full place-items-center text-center text-muted-foreground">
                <div>
                  <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-primary" />
                  Processing document...
                </div>
              </div>
            ) : aiResponse &&
              typeof aiResponse === "object" &&
              ("Analysis" in (aiResponse as object) || "Red Flags" in (aiResponse as object)) ? (
              <DocumentAnalysisResult value={aiResponse} />
            ) : aiResponse ? (
              <p className="whitespace-pre-wrap leading-relaxed">
                {String(aiResponse)}
              </p>
            ) : (
              <p className="text-muted-foreground">
                Upload a document and click "Review Document" to see AI insights here.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function DocumentAnalysisResult({ value }: { value: unknown }) {
  if (typeof value === "object" && value !== null && ("Analysis" in value || "Red Flags" in value)) {
    const result = value as Record<string, unknown>;
    return (
      <div className="space-y-4">
        {/* Important Notes — fixed OCR accuracy disclaimer */}
        <div className="rounded-lg border border-border/60 bg-primary/5 p-4">
          <p className="text-sm font-semibold">🔎 Important Notes</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We have verified the values of each parameter across the submitted documents, referring to
            mandatory and recommended requirements under standard export documentation practices. This
            analysis is subject to the accuracy of OCR. While a high-quality OCR engine is used,
            results may vary depending on scan clarity and layout. Please manually review any Mandatory
            requirements and Recommendations to ensure complete compliance with banking and customs
            requirements. Verbatim mismatches are flagged in the Excel file — download the sheet for
            detailed examination.
          </p>
        </div>

        {/* Neutral Comments = Analysis field */}
        {result.Analysis != null && (
          <div>
            <p className="mb-1 text-sm font-semibold">📋 Neutral Comments</p>
            {Array.isArray(result.Analysis)
              ? renderListBlock("", result.Analysis)
              : <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{String(result.Analysis)}</p>}
          </div>
        )}

        {/* Observations = Red Flags field */}
        {result["Red Flags"] != null && (
          <div>
            <p className="mb-1 text-sm font-semibold">🛑 Observations</p>
            {Array.isArray(result["Red Flags"])
              ? renderListBlock("", result["Red Flags"])
              : <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{String(result["Red Flags"])}</p>}
          </div>
        )}
      </div>
    );
  }

  return renderValue(value);
}

function ShippingAgent() {
  const { user } = useAuth();
  const [billFile, setBillFile] = useState<UploadedFile>(null);
  const [salesFile, setSalesFile] = useState<UploadedFile>(null);
  const [instructionFile, setInstructionFile] = useState<UploadedFile>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<unknown>("");
  const [downloadFilename, setDownloadFilename] = useState("");
  const billRef = useRef<HTMLInputElement>(null);
  const salesRef = useRef<HTMLInputElement>(null);
  const instructionRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (!billFile && !salesFile && !instructionFile) {
      toast.error("Upload at least one shipping document.");
      return;
    }

    setLoading(true);
    setProgress(25);
    try {
      const form = new FormData();
      if (billFile) form.append("bill_files", billFile);
      if (salesFile) form.append("sales_files", salesFile);
      if (instructionFile) form.append("shpins_files", instructionFile);
      form.append("userId", getBackendUserId(user) || "");
      form.append("orgId", getBackendOrgId(user) || "");

      const data = await postForm("/user/validate_shipping_documents/", form);
      setProgress(100);
      setAnalysis(String(data?.aiAnswer || "Shipping summary generated."));
      setDownloadFilename(String(data?.download_filename || "AI_Analysis_Report.pdf"));
      toast.success("Shipping documents processed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Shipping upload failed.");
    } finally {
      setLoading(false);
      window.setTimeout(() => setProgress(0), 800);
    }
  };

  return (
    <AgentWorkspace
      left={
        <ResultPanel
          title="Shipping Summary"
          empty="Upload shipping documents to generate the shipping summary."
          loading={loading}
          value={analysis}
          footer={
            <Button variant="outline" disabled={!downloadFilename} onClick={() => downloadReport(downloadFilename)}>
              <Download className="h-4 w-4" />
              Download Shipment Document Report
            </Button>
          }
        />
      }
      right={
        <div className="space-y-4">
          <FilePicker label="Upload Bill of Lading" file={billFile} inputRef={billRef} onFile={setBillFile} />
          <FilePicker label="Upload Sales Order" file={salesFile} inputRef={salesRef} onFile={setSalesFile} />
          <FilePicker
            label="Upload Shipping Instruction"
            file={instructionFile}
            inputRef={instructionRef}
            onFile={setInstructionFile}
          />
          <Button className="w-full" onClick={submit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
            Submit & Validate
          </Button>
          {progress > 0 && <Progress value={progress} />}
        </div>
      }
    />
  );
}

function ComplianceAgent() {
  const [documentFile, setDocumentFile] = useState<UploadedFile>(null);
  const [instructionFile, setInstructionFile] = useState<UploadedFile>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<unknown>("");
  const [downloadFilename, setDownloadFilename] = useState("");
  const docRef = useRef<HTMLInputElement>(null);
  const instructionRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (!documentFile || !instructionFile) {
      toast.error("Please upload both files before submitting.");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("document", documentFile);
      form.append("compliance_excel", instructionFile);
      form.append("complianceFileId", "ComplianceAgent_21.xlsx");
      const data = await postForm("/document_agent/validate_compliance_agent", form);
      setAnalysis(data?.results || []);
      setDownloadFilename(String(data?.pdf_filename || "compliance_report.pdf"));
      toast.success("Compliance analysis ready.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Compliance analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const updateExcel = async () => {
    if (!instructionFile || !analysis) {
      toast.error("Run analysis first before updating Excel.");
      return;
    }

    try {
      const form = new FormData();
      form.append("compliance_excel", instructionFile);
      form.append("compliance_file_id", "ComplianceAgent_21.xlsx");
      form.append("ai_results", JSON.stringify(analysis));
      await postForm("/document_agent/upload_ai_results_to_excel", form);
      toast.success("Excel updated and uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Excel update failed.");
    }
  };

  return (
    <AgentWorkspace
      left={<ResultPanel title="AI Compliance Review" empty="Upload your compliance document and instruction sheet." loading={loading} value={analysis} />}
      right={
        <div className="space-y-4">
          <FilePicker
            label="Upload Document"
            file={documentFile}
            inputRef={docRef}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
            onFile={setDocumentFile}
          />
          <FilePicker
            label="Upload Compliance Instruction (Excel)"
            file={instructionFile}
            inputRef={instructionRef}
            accept=".xls,.xlsx"
            onFile={setInstructionFile}
          />
          <Button className="w-full" onClick={submit} disabled={loading || !documentFile || !instructionFile}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Puzzle className="h-4 w-4" />}
            Submit & Analyze
          </Button>
          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" disabled={!downloadFilename} onClick={() => downloadReport(downloadFilename)}>
              <Download className="h-4 w-4" />
              PDF Download
            </Button>
            <Button variant="outline" disabled={!analysis} onClick={updateExcel}>
              <FileSpreadsheet className="h-4 w-4" />
              Update in Excel
            </Button>
          </div>
        </div>
      }
    />
  );
}

function AgentWorkspace({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="grid min-h-[610px] grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0">{left}</div>
      <div className="rounded-xl border border-border/60 bg-background p-4 shadow-sm">{right}</div>
    </div>
  );
}

function FilePicker({
  label,
  file,
  inputRef,
  accept = ".pdf,.xls,.xlsx,.csv",
  onFile,
}: {
  label: string;
  file: UploadedFile;
  inputRef: React.RefObject<HTMLInputElement | null>;
  accept?: string;
  onFile: (file: UploadedFile) => void;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-card p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{file ? file.name : label}</p>
        {file && (
          <button type="button" onClick={() => onFile(null)} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button variant="outline" className="w-full" onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" />
        {label}
      </Button>
      <input
        ref={inputRef}
        hidden
        type="file"
        accept={accept}
        onChange={(event) => {
          onFile(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />
    </div>
  );
}

function ResultPanel({
  title,
  empty,
  loading,
  value,
  footer,
}: {
  title: string;
  empty: string;
  loading: boolean;
  value: unknown;
  footer?: React.ReactNode;
}) {
  const rendered = useMemo(() => renderValue(value), [value]);

  return (
    <div className="flex h-full min-h-[610px] flex-col rounded-xl border border-border/60 bg-background shadow-sm">
      <div className="border-b border-border/60 px-4 py-3">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">Results from your local backend workflow.</p>
      </div>
      <div className="flex-1 overflow-auto p-4 scrollbar-thin">
        {loading ? (
          <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
            <div>
              <Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-primary" />
              Processing with agent...
            </div>
          </div>
        ) : rendered ? (
          rendered
        ) : (
          <div className="grid h-full place-items-center rounded-lg border border-dashed border-border/70 bg-card/40 p-6 text-center text-sm text-muted-foreground">
            {empty}
          </div>
        )}
      </div>
      {footer && (
        <div className="shrink-0 border-t border-border/60 p-3">{footer}</div>
      )}
    </div>
  );
}

// ── Shared rendering helpers ──────────────────────────────────────────────────

function renderListBlock(label: string, items: unknown[]): React.ReactElement {
  return (
    <div>
      {label && <p className="mb-1 text-sm font-semibold">{label}</p>}
      <ul className="space-y-1 text-sm text-muted-foreground">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-2">
            <span className="mt-0.5 shrink-0 text-primary">•</span>
            <span className="whitespace-pre-wrap leading-relaxed">{String(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderValue(value: unknown): React.ReactElement | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "string") {
    return (
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
        {value}
      </p>
    );
  }

  if (Array.isArray(value)) {
    if (!value.length) return null;
    return renderListBlock("", value);
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, v]) => v !== null && v !== undefined && v !== ""
    );
    if (!entries.length) return null;
    return (
      <div className="space-y-4">
        {entries.map(([key, val]) => (
          <div key={key}>
            <p className="mb-1 text-sm font-semibold capitalize">
              {key.replace(/_/g, " ")}
            </p>
            {Array.isArray(val) ? (
              renderListBlock("", val)
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {String(val)}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
      {String(value)}
    </p>
  );
}
