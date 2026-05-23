# IMAGE-I v2 — Implementation Plan

This is a large spec touching ~15 files. I'll group it into phases so you can review progress and re-prioritise. All work is frontend/mock (no backend) unless you say otherwise — consistent with the current mock-auth approach.

## Design principles to enforce everywhere
- "We're holding your hand": persistent Business Planner card in sidebar, reconciliation pop-up on login, AI commentary strips on every dashboard.
- "Nectar of all your data": reconciliation trust badges (green/amber/red) on every KPI, "verified" microcopy, source counts.

---

## Phase 1 — Navigation, sidebar, topbar, login (foundational)

1. **Sidebar restructure** (`AppSidebar.tsx`)
   - Regroup into INSIGHTS / INTELLIGENCE / AUTOMATION / WORKSPACE / ADMINISTRATION.
   - Persistent Business Planner card pinned at bottom (photo, name, next review date, click → opens drawer).
2. **Topbar** (`Topbar.tsx`)
   - Notification bell with 3 categories (variances, agent anomalies, planner messages) — mock dropdown.
   - Natural-language search → routes to `/agents?q=…`.
3. **Login page** (`routes/login.tsx`)
   - New tagline + subhead.
   - Replace 3 stats with: Manhours saved / AI agents running / Data sources reconciled.
4. **Reconciliation login pop-up**
   - New `ReconciliationAlertDialog` shown on first dashboard load post-login (sessionStorage flag), top 5 variance rows + CTA to `/reconciliation`.

## Phase 2 — Overview & function dashboards

5. **Overview** (`routes/index.tsx`)
   - Add reconciliation trust badge to each of 6 KPI cards.
   - KPI click → opens right-side drawer with `ReportEmbed` (don't navigate away).
   - New **Value Delivered** panel: Manhours saved YTD, Cost saved YTD, Business Planner card.
6. **Function dashboards** (finance, sales, operations, hr, supply, customer)
   - Add AI Commentary strip at top of each (mock LLM sentence per function).
   - KPI cards → drawer with embedded PBI report; trust badge + delta vs prior + delta vs target.
   - Shared `KpiDrawer` component to avoid duplication.

## Phase 3 — Reconciliation redesign

7. **`routes/reconciliation.tsx`** — Tabs:
   - **Tab 1 Accuracy**: existing table + Match Rate chart + Variance by Category + AI Insights cards. Add "Run reconciliation" button + per-row "Assign" action (mock dialog).
   - **Tab 2 Period Comparison**: two period selectors (granularity + period), "Run" → waterfall/bridge chart (recharts) of P&L lines, detail table with abs/% variance, LLM narrative block below.

## Phase 4 — Historical & Benchmarks

8. **`routes/historical.tsx`**
   - Add Monthly/Quarterly/Annual granularity selector — re-render charts.
   - New **Financial Ratios** section (12 ratios cards with sparkline + benchmark + trend indicator + tooltip).
9. **`routes/benchmarks.tsx`**
   - Add "What this means for us" column to peer table with mock LLM line per row.

## Phase 5 — AI Agents redesign

10. **`routes/agents.tsx`** — Replace single chat with **Agent Hub**:
    - Top **Savings Summary** banner (large manhours + cost YTD).
    - Grid of agent cards (9 agents listed in spec): name, description, status, activity stats, savings figure.
    - Click conversational agent → chat workspace; click operational agent (Document/Tax/Shipping/Compliance) → mock upload+results UI.

## Phase 6 — Reports & Onboarding

11. **`routes/reports.tsx`** — Library with 6 collapsible sections (Finance/Sales/Ops/HC/Supply/Customer), each report has thumbnail + status + trust badge + updated timestamp. Search bar + "Scheduled reports" tab.
12. **`routes/onboarding.tsx`** — Prepend Step 0: Value Stream Workshop scheduling card.

---

## Technical notes
- All charts use existing recharts setup; waterfall built from `BarChart` with custom positive/negative bars.
- New mock data added to `src/lib/mock-data.ts` (planner, agents, ratios, reconciliation summary, savings).
- New shared components: `BusinessPlannerCard`, `TrustBadge`, `KpiDrawer`, `AICommentaryStrip`, `ReconciliationLoginDialog`, `AgentCard`, `ValueDeliveredPanel`.
- Pure UI/mock — no Supabase/backend changes.

## Suggested order of approval
Phases 1 → 2 are highest leverage (touched on every page). I'll deliver Phase 1 first, then proceed through 2–6 sequentially in subsequent turns unless you tell me to bundle them.

Approve to start with **Phase 1**, or tell me to do the whole thing in one go / re-order phases.