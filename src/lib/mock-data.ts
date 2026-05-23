// Mock data for IMAGE-I management reporting

export const kpiCards = [
  {
    id: "finance",
    title: "Finance",
    metric: "$12.84M",
    delta: "+8.4%",
    trend: "up" as const,
    description: "Revenue YTD",
    accent: "from-[oklch(0.78_0.18_195)] to-[oklch(0.7_0.21_305)]",
    icon: "DollarSign",
    href: "/finance",
  },
  {
    id: "sales",
    title: "Sales",
    metric: "4,219",
    delta: "+12.1%",
    trend: "up" as const,
    description: "Closed deals (Q)",
    accent: "from-[oklch(0.7_0.21_305)] to-[oklch(0.78_0.18_195)]",
    icon: "TrendingUp",
    href: "/sales",
  },
  {
    id: "operations",
    title: "Operations",
    metric: "98.6%",
    delta: "+0.7%",
    trend: "up" as const,
    description: "Service SLA",
    accent: "from-[oklch(0.74_0.18_155)] to-[oklch(0.78_0.18_195)]",
    icon: "Activity",
    href: "/operations",
  },
  {
    id: "hr",
    title: "Human Capital",
    metric: "2,184",
    delta: "-1.2%",
    trend: "down" as const,
    description: "Headcount",
    accent: "from-[oklch(0.82_0.16_75)] to-[oklch(0.7_0.21_305)]",
    icon: "Users",
    href: "/hr",
  },
  {
    id: "supply",
    title: "Supply Chain",
    metric: "3.4 days",
    delta: "-0.6d",
    trend: "up" as const,
    description: "Avg. lead time",
    accent: "from-[oklch(0.72_0.16_240)] to-[oklch(0.74_0.18_155)]",
    icon: "Truck",
    href: "/supply",
  },
  {
    id: "customer",
    title: "Customer",
    metric: "72 NPS",
    delta: "+4 pts",
    trend: "up" as const,
    description: "Net Promoter Score",
    accent: "from-[oklch(0.78_0.18_195)] to-[oklch(0.74_0.18_155)]",
    icon: "Heart",
    href: "/customer",
  },
];

export const revenueTrend = [
  { month: "Jan", revenue: 820, forecast: 800 },
  { month: "Feb", revenue: 932, forecast: 900 },
  { month: "Mar", revenue: 901, forecast: 950 },
  { month: "Apr", revenue: 1034, forecast: 1000 },
  { month: "May", revenue: 1190, forecast: 1080 },
  { month: "Jun", revenue: 1230, forecast: 1150 },
  { month: "Jul", revenue: 1310, forecast: 1220 },
  { month: "Aug", revenue: 1402, forecast: 1300 },
  { month: "Sep", revenue: 1380, forecast: 1380 },
  { month: "Oct", revenue: 1520, forecast: 1450 },
  { month: "Nov", revenue: 1610, forecast: 1530 },
  { month: "Dec", revenue: 1748, forecast: 1620 },
];

export const segmentMix = [
  { name: "Enterprise", value: 48 },
  { name: "Mid-Market", value: 27 },
  { name: "SMB", value: 16 },
  { name: "Public Sector", value: 9 },
];

export const regionPerformance = [
  { region: "AMER", target: 100, actual: 112 },
  { region: "EMEA", target: 100, actual: 96 },
  { region: "APAC", target: 100, actual: 124 },
  { region: "LATAM", target: 100, actual: 88 },
];

export const operationalMetrics = [
  { week: "W1", uptime: 99.92, incidents: 3 },
  { week: "W2", uptime: 99.88, incidents: 5 },
  { week: "W3", uptime: 99.96, incidents: 2 },
  { week: "W4", uptime: 99.91, incidents: 4 },
  { week: "W5", uptime: 99.98, incidents: 1 },
  { week: "W6", uptime: 99.94, incidents: 3 },
];

export const headcountByDept = [
  { dept: "Engineering", count: 612 },
  { dept: "Sales", count: 418 },
  { dept: "Operations", count: 380 },
  { dept: "Customer Success", count: 274 },
  { dept: "Finance", count: 142 },
  { dept: "Marketing", count: 178 },
  { dept: "G&A", count: 180 },
];

export const recentReports = [
  { id: "r1", title: "Q4 Revenue Bridge", owner: "Finance", updated: "2h ago", status: "Live" },
  { id: "r2", title: "Pipeline Velocity by Segment", owner: "Sales Ops", updated: "5h ago", status: "Live" },
  { id: "r3", title: "Workforce Attrition Heatmap", owner: "People Analytics", updated: "1d ago", status: "Draft" },
  { id: "r4", title: "Service Desk SLA Breach Analysis", owner: "Operations", updated: "1d ago", status: "Live" },
  { id: "r5", title: "Supply Chain Risk Index", owner: "Procurement", updated: "2d ago", status: "Live" },
];

export const aiSkills = [
  { id: "general", label: "General Insights", description: "Cross-functional summaries & recommendations" },
  { id: "finance", label: "Finance Analyst", description: "Revenue, margin and variance commentary" },
  { id: "sales", label: "Sales Coach", description: "Pipeline health, win/loss patterns" },
  { id: "ops", label: "Ops Engineer", description: "SLAs, incidents, throughput diagnostics" },
  { id: "people", label: "People Analyst", description: "Headcount, attrition, engagement" },
  { id: "document", label: "Document Agent", description: "Extract, classify and summarize documents" },
  { id: "compliance", label: "Compliance Agent", description: "Policy, regulatory and audit checks" },
  { id: "tax", label: "Tax Agent", description: "Tax computation, filings and exposure" },
  { id: "shipping", label: "Shipping Agent", description: "Logistics, freight and delivery tracking" },
];

// ============= Reconciliation engine =============

export type ReconStatus = "matched" | "variance" | "missing";

export const reconciliationSummary = {
  lastRun: "Today · 06:42",
  period: "Nov 2026",
  totalRecords: 18420,
  matched: 17684,
  variances: 612,
  missing: 124,
  matchRate: 96.0,
  netVariance: -284350,
  absVariance: 1248930,
};

export const reconciliationTrend = [
  { month: "Jun", matchRate: 92.1, variance: 412 },
  { month: "Jul", matchRate: 93.4, variance: 388 },
  { month: "Aug", matchRate: 94.2, variance: 360 },
  { month: "Sep", matchRate: 94.8, variance: 342 },
  { month: "Oct", matchRate: 95.6, variance: 298 },
  { month: "Nov", matchRate: 96.0, variance: 284 },
];

export const reconciliationAccounts = [
  { account: "1010 · Cash – Operating", books: 4820300, report: 4820300, variance: 0, status: "matched" as ReconStatus },
  { account: "1200 · Accounts Receivable", books: 2184500, report: 2168720, variance: -15780, status: "variance" as ReconStatus },
  { account: "1400 · Inventory", books: 3640000, report: 3712400, variance: 72400, status: "variance" as ReconStatus },
  { account: "2010 · Accounts Payable", books: 1820400, report: 1820400, variance: 0, status: "matched" as ReconStatus },
  { account: "2200 · Accrued Expenses", books: 542100, report: 530250, variance: -11850, status: "variance" as ReconStatus },
  { account: "4000 · Revenue", books: 12840000, report: 12716200, variance: -123800, status: "variance" as ReconStatus },
  { account: "5000 · COGS", books: 6120000, report: 6120000, variance: 0, status: "matched" as ReconStatus },
  { account: "6100 · Marketing Spend", books: 482000, report: 0, variance: -482000, status: "missing" as ReconStatus },
];

export const varianceByCategory = [
  { category: "Revenue", planned: 13000000, actual: 12716200, variance: -283800, drivers: "Enterprise renewal slip, FX headwind" },
  { category: "COGS", planned: 6000000, actual: 6120000, variance: -120000, drivers: "Logistics surcharge, supplier price hike" },
  { category: "OPEX", planned: 3200000, actual: 3084000, variance: 116000, drivers: "Hiring delay, deferred travel" },
  { category: "CAPEX", planned: 850000, actual: 612000, variance: 238000, drivers: "Project rollover into Q1" },
  { category: "Working Capital", planned: 1800000, actual: 2104000, variance: -304000, drivers: "AR aging > 60 days" },
];

// ============= Standard Costing — Variance Decomposition =============
// Bridge from Planned Margin → Actual Margin using standard costing principles.
// Sign convention: positive = favorable (F), negative = unfavorable (U).

export type VarianceNature = "favorable" | "unfavorable";
export type VarianceKind = "price" | "volume" | "mix" | "rate" | "usage" | "spend";

export const standardCostingSummary = {
  plannedMargin: 4_800_000,
  actualMargin: 4_412_000,
  totalVariance: -388_000, // unfavorable
  currency: "USD",
  uom: "MT (metric tons)",
  period: "Nov 2026",
};

// Waterfall bridge: Plan → drivers → Actual
export const marginBridge = [
  { label: "Planned Margin", value: 4_800_000, type: "anchor" as const },
  { label: "Selling Price", value: +320_000, type: "delta" as const },     // price up
  { label: "Sales Volume", value: -150_000, type: "delta" as const },      // volume down
  { label: "Sales Mix", value: -60_000, type: "delta" as const },
  { label: "Input Material Cost", value: -240_000, type: "delta" as const }, // RM rate up
  { label: "Material Usage", value: -45_000, type: "delta" as const },
  { label: "Power & Fuel Rate", value: -118_000, type: "delta" as const },
  { label: "Power & Fuel Consumption", value: -72_000, type: "delta" as const },
  { label: "Other Variable Cost", value: -38_000, type: "delta" as const },
  { label: "Fixed Cost", value: +15_000, type: "delta" as const },
  { label: "Actual Margin", value: 4_412_000, type: "anchor" as const },
];

// Detailed standard-costing variance lines with business explanations
export const standardCostVariances: Array<{
  id: string;
  driver: string;
  kind: VarianceKind;
  formula: string;
  standard: number;       // standard rate / planned $
  actual: number;         // actual rate / actual $
  qty: number;            // volume reference (units / MT / MWh)
  variance: number;       // $ impact (sign: + favorable, - unfavorable)
  nature: VarianceNature;
  explanation: string;
}> = [
  {
    id: "spv",
    driver: "Selling Price Variance",
    kind: "price",
    formula: "(Actual Price − Standard Price) × Actual Qty",
    standard: 1_250,           // $/MT planned
    actual: 1_290,             // $/MT realized
    qty: 8_000,                // MT sold
    variance: +320_000,
    nature: "favorable",
    explanation:
      "Realised selling price increased by $40/MT vs standard, driven by an October list-price revision and stronger Enterprise mix in AMER. Net pricing power held despite EMEA discounting pressure.",
  },
  {
    id: "svv",
    driver: "Sales Volume Variance",
    kind: "volume",
    formula: "(Actual Qty − Budget Qty) × Standard Margin",
    standard: 8_500,           // budgeted MT
    actual: 8_000,             // actual MT
    qty: -500,
    variance: -150_000,
    nature: "unfavorable",
    explanation:
      "Volume fell 500 MT short of plan due to two enterprise renewals slipping from Nov to Dec and a softer APAC spot market.",
  },
  {
    id: "smv",
    driver: "Sales Mix Variance",
    kind: "mix",
    formula: "Σ (Actual Mix% − Std Mix%) × Std Margin × Total Qty",
    standard: 0,
    actual: 0,
    qty: 8_000,
    variance: -60_000,
    nature: "unfavorable",
    explanation:
      "Higher share of lower-margin SMB volume (+4pp) offset by reduced Enterprise share (−3pp). Mix shift drags blended margin by ~0.7pp.",
  },
  {
    id: "mpv",
    driver: "Input / Raw Material Cost",
    kind: "price",
    formula: "(Actual Rate − Std Rate) × Actual Qty Consumed",
    standard: 540,             // $/MT std raw input
    actual: 580,               // $/MT actual
    qty: 6_000,                // MT consumed
    variance: -240_000,
    nature: "unfavorable",
    explanation:
      "Key raw material price rose 7.4% over standard following supplier surcharge and freight pass-through. Hedging covered only 35% of exposure for the period.",
  },
  {
    id: "muv",
    driver: "Material Usage / Yield",
    kind: "usage",
    formula: "(Actual Qty − Std Qty for Output) × Std Rate",
    standard: 0.72,            // MT input per MT output (std)
    actual: 0.74,              // actual
    qty: 8_000,                // MT output
    variance: -45_000,
    nature: "unfavorable",
    explanation:
      "Yield loss of 2pp at Plant B linked to a calibration drift on Line 3 — flagged for maintenance window in week 49.",
  },
  {
    id: "pfr",
    driver: "Power & Fuel — Rate Variance",
    kind: "rate",
    formula: "(Actual Tariff − Std Tariff) × Actual Units Consumed",
    standard: 0.092,           // $/kWh std
    actual: 0.108,             // $/kWh actual
    qty: 7_375_000,            // kWh consumed
    variance: -118_000,
    nature: "unfavorable",
    explanation:
      "Grid tariff rose 17.4% vs standard following coal index escalation and a peak-hour demand surcharge in two regions.",
  },
  {
    id: "pfc",
    driver: "Power & Fuel — Consumption Variance",
    kind: "usage",
    formula: "(Actual Units − Std Units for Output) × Std Tariff",
    standard: 875,             // kWh per MT output (std)
    actual: 922,               // actual kWh per MT
    qty: 8_000,                // MT output
    variance: -72_000,
    nature: "unfavorable",
    explanation:
      "Specific energy consumption rose 5.4% above standard. Root cause: increased reheat cycles on Furnace 2 and ambient-temperature inefficiencies in cooling tower.",
  },
  {
    id: "ovc",
    driver: "Other Variable Cost",
    kind: "spend",
    formula: "Actual Variable Spend − (Std Rate × Actual Output)",
    standard: 95_000,
    actual: 133_000,
    qty: 8_000,
    variance: -38_000,
    nature: "unfavorable",
    explanation:
      "Consumables, packaging and outbound logistics ran above standard due to expedited shipments and one-off resin price spike.",
  },
  {
    id: "fxv",
    driver: "Fixed Cost (Spending)",
    kind: "spend",
    formula: "Actual Fixed Cost − Budgeted Fixed Cost",
    standard: 1_400_000,
    actual: 1_385_000,
    qty: 1,
    variance: +15_000,
    nature: "favorable",
    explanation:
      "Marginal favourable spend on plant overheads from deferred maintenance and lower insurance premium renewal. Headcount additions remain on plan.",
  },
];

export const aiInsights = [
  {
    id: "i1",
    severity: "high" as const,
    title: "Revenue under plan by 2.2%",
    body: "Two enterprise renewals ($180K combined) slipped from Nov to Dec. Forecast cone suggests 78% likelihood of recovery in Q1. Recommend escalating CSM contact this week.",
  },
  {
    id: "i2",
    severity: "medium" as const,
    title: "Inventory variance flagged at SKU level",
    body: "Warehouse 3 reports +$72K vs books — likely cycle-count timing. Trigger reconciliation against last GR/IR posting.",
  },
  {
    id: "i3",
    severity: "high" as const,
    title: "Marketing spend missing from report feed",
    body: "$482K of GL postings have no matching report record. Source pipeline 'mkt-spend-api' last succeeded 36h ago. Re-run extraction.",
  },
  {
    id: "i4",
    severity: "low" as const,
    title: "OPEX favorable variance",
    body: "Hiring lag created $116K favorable variance — sustainable through Q1 if backfill plan is delayed by 30 days.",
  },
];

// ============= Historical performance (8-quarter trailing) =============

export const historicalPerformance = [
  { period: "Q1 2025", revenue: 11_240_000, margin: 3_980_000, marginPct: 35.4, matchRate: 92.1, netVariance: -512_000 },
  { period: "Q2 2025", revenue: 11_580_000, margin: 4_120_000, marginPct: 35.6, matchRate: 93.0, netVariance: -468_000 },
  { period: "Q3 2025", revenue: 11_910_000, margin: 4_210_000, marginPct: 35.4, matchRate: 93.8, netVariance: -402_000 },
  { period: "Q4 2025", revenue: 12_360_000, margin: 4_360_000, marginPct: 35.3, matchRate: 94.5, netVariance: -358_000 },
  { period: "Q1 2026", revenue: 12_120_000, margin: 4_240_000, marginPct: 35.0, matchRate: 95.0, netVariance: -332_000 },
  { period: "Q2 2026", revenue: 12_480_000, margin: 4_380_000, marginPct: 35.1, matchRate: 95.4, netVariance: -310_000 },
  { period: "Q3 2026", revenue: 12_640_000, margin: 4_420_000, marginPct: 35.0, matchRate: 95.8, netVariance: -298_000 },
  { period: "Q4 2026", revenue: 12_840_000, margin: 4_412_000, marginPct: 34.4, matchRate: 96.0, netVariance: -284_350 },
];

// ============= Peer / benchmark companies =============

export type Peer = {
  id: string;
  name: string;
  ticker: string;
  segment: string;
  revenue: number;       // $ trailing 12m
  growthYoY: number;     // %
  grossMargin: number;   // %
  ebitdaMargin: number;  // %
  energyIntensity: number; // kWh / MT
  rmCostIndex: number;   // index, 100 = our standard
  rating: "leader" | "peer" | "laggard";
};

export const peerBenchmarks: Peer[] = [
  {
    id: "self",
    name: "Our Company",
    ticker: "—",
    segment: "Industrial Materials",
    revenue: 12_840_000,
    growthYoY: 8.4,
    grossMargin: 34.4,
    ebitdaMargin: 18.2,
    energyIntensity: 922,
    rmCostIndex: 107,
    rating: "peer",
  },
  {
    id: "peer-a",
    name: "Northwind Materials",
    ticker: "NWM",
    segment: "Industrial Materials",
    revenue: 18_420_000,
    growthYoY: 11.2,
    grossMargin: 37.8,
    ebitdaMargin: 21.4,
    energyIntensity: 868,
    rmCostIndex: 102,
    rating: "leader",
  },
  {
    id: "peer-b",
    name: "Helix Industrial",
    ticker: "HLXI",
    segment: "Industrial Materials",
    revenue: 14_120_000,
    growthYoY: 6.1,
    grossMargin: 33.9,
    ebitdaMargin: 17.6,
    energyIntensity: 940,
    rmCostIndex: 110,
    rating: "peer",
  },
  {
    id: "peer-c",
    name: "Cobalt Process Co.",
    ticker: "CBLT",
    segment: "Specialty Chemicals",
    revenue: 9_780_000,
    growthYoY: 3.4,
    grossMargin: 31.2,
    ebitdaMargin: 14.1,
    energyIntensity: 988,
    rmCostIndex: 113,
    rating: "laggard",
  },
  {
    id: "peer-d",
    name: "Atlas Forge",
    ticker: "ATLF",
    segment: "Industrial Materials",
    revenue: 22_510_000,
    growthYoY: 9.6,
    grossMargin: 38.4,
    ebitdaMargin: 22.9,
    energyIntensity: 845,
    rmCostIndex: 99,
    rating: "leader",
  },
];

// ============= Industry / market news =============

export type NewsItem = {
  id: string;
  source: string;
  publishedAt: string;       // ISO date or "2h ago" style
  headline: string;
  summary: string;
  category: "macro" | "peer" | "commodity" | "regulation" | "company";
  sentiment: "positive" | "neutral" | "negative";
  impact: "high" | "medium" | "low";
  url: string;
};

export const industryNews: NewsItem[] = [
  {
    id: "n1",
    source: "Reuters",
    publishedAt: "2h ago",
    headline: "Coal index spikes 6% on tightening winter supply",
    summary:
      "Spot coal prices rose to a 9-month high, reinforcing the unfavourable Power & Fuel rate variance and pressuring Q1 cost guidance for energy-intensive producers.",
    category: "commodity",
    sentiment: "negative",
    impact: "high",
    url: "#",
  },
  {
    id: "n2",
    source: "Bloomberg",
    publishedAt: "5h ago",
    headline: "Northwind Materials beats Q4 estimates, raises FY guide",
    summary:
      "Peer NWM posted 37.8% gross margin (+220 bps YoY), citing energy efficiency program and 60% raw-material hedge coverage. Implies ~340 bps gross-margin gap vs us.",
    category: "peer",
    sentiment: "positive",
    impact: "high",
    url: "#",
  },
  {
    id: "n3",
    source: "FT",
    publishedAt: "1d ago",
    headline: "EU CBAM phase-in to add ~1.4% landed cost on imported feedstock",
    summary:
      "Carbon Border Adjustment Mechanism enters expanded phase Jan 2027. Procurement should re-tender EMEA suppliers and quantify impact on Input Material Cost variance.",
    category: "regulation",
    sentiment: "negative",
    impact: "medium",
    url: "#",
  },
  {
    id: "n4",
    source: "Wall Street Journal",
    publishedAt: "1d ago",
    headline: "Atlas Forge announces $180M efficiency capex over 24 months",
    summary:
      "ATLF targets 8% reduction in energy intensity by 2028 — would extend its leadership on kWh/MT and widen the unit-cost gap unless we accelerate Furnace 2 retrofit.",
    category: "peer",
    sentiment: "negative",
    impact: "medium",
    url: "#",
  },
  {
    id: "n5",
    source: "S&P Global",
    publishedAt: "2d ago",
    headline: "Industrial Materials sector PMI rebounds to 52.4",
    summary:
      "Demand signals firm after two soft quarters. Supports a recovery scenario for the Sales Volume variance and APAC spot weakness flagged this period.",
    category: "macro",
    sentiment: "positive",
    impact: "medium",
    url: "#",
  },
  {
    id: "n6",
    source: "Internal · Investor Relations",
    publishedAt: "3d ago",
    headline: "Q4 earnings call scheduled — variance commentary required",
    summary:
      "Investor day prep: align variance bridge narrative (Selling Price F, Input Cost U, Power & Fuel U) with peer commentary and management actions.",
    category: "company",
    sentiment: "neutral",
    impact: "low",
    url: "#",
  },
];


// ============= Phase 1 — Business Planner, Notifications, Savings =============

export const businessPlanner = {
  name: "Priya Raman",
  title: "Business Planner",
  initials: "PR",
  email: "priya.raman@image-i.com",
  nextReview: "Dec 03, 2026",
  lastBoardPack: "Nov 15, 2026",
  phone: "+91 98xxx 12345",
  bio: "Your dedicated planner — leads monthly review, board pack and automation roadmap.",
};

export const valueDelivered = {
  manhoursSavedYTD: 4_820,
  manhoursSavedYoY: 38,           // % vs last year
  costSavedYTD: 6_240_000,        // INR
  subscriptionCost: 1_800_000,    // INR
  agentsRunning: 9,
  dataSourcesReconciled: 14,
};

export const planVarianceSummary = {
  period: "Nov 2026",
  basis: "Actual vs Plan",
  linesOnPlan: 86,
  favorable: 41,
  unfavorable: 38,
  onTrack: 7,
  netVariance: -312_400,
  absVariance: 1_864_500,
};

export const planTopVariances = [
  {
    id: "pv1",
    line: "Revenue",
    actual: 12_716_200,
    plan: 13_200_000,
    delta: -483_800,
    pct: -3.7,
    status: "unfavorable" as const,
  },
  {
    id: "pv2",
    line: "Gross Margin %",
    actual: 41.2,
    plan: 44.0,
    delta: -2.8,
    pct: -6.4,
    status: "unfavorable" as const,
    isPercent: true,
  },
  {
    id: "pv3",
    line: "Marketing Spend",
    actual: 482_000,
    plan: 380_000,
    delta: 102_000,
    pct: 26.8,
    status: "unfavorable" as const,
  },
  {
    id: "pv4",
    line: "Logistics Cost",
    actual: 312_400,
    plan: 360_000,
    delta: -47_600,
    pct: -13.2,
    status: "favorable" as const,
  },
  {
    id: "pv5",
    line: "New Customers",
    actual: 1_284,
    plan: 1_150,
    delta: 134,
    pct: 11.7,
    status: "favorable" as const,
    isCount: true,
  },
];

export const reconciliationTopVariances = [
  {
    id: "rv1",
    account: "4000 · Revenue",
    books: 12_840_000,
    report: 12_716_200,
    delta: -123_800,
    status: "variance" as const,
  },
  {
    id: "rv2",
    account: "6100 · Marketing Spend",
    books: 482_000,
    report: 0,
    delta: -482_000,
    status: "missing" as const,
  },
  {
    id: "rv3",
    account: "1400 · Inventory",
    books: 3_640_000,
    report: 3_712_400,
    delta: 72_400,
    status: "variance" as const,
  },
  {
    id: "rv4",
    account: "1200 · Accounts Receivable",
    books: 2_184_500,
    report: 2_168_720,
    delta: -15_780,
    status: "variance" as const,
  },
  {
    id: "rv5",
    account: "2200 · Accrued Expenses",
    books: 542_100,
    report: 530_250,
    delta: -11_850,
    status: "variance" as const,
  },
];

export type Notification = {
  id: string;
  category: "variance" | "agent" | "planner";
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export const notifications: Notification[] = [
  {
    id: "n-v1",
    category: "variance",
    title: "Revenue variance detected",
    body: "Account 4000 · Revenue is short by $123,800 vs books.",
    time: "12 min ago",
    unread: true,
  },
  {
    id: "n-v2",
    category: "variance",
    title: "Marketing spend feed missing",
    body: "$482K of GL postings have no matching report record.",
    time: "1h ago",
    unread: true,
  },
  {
    id: "n-a1",
    category: "agent",
    title: "Tax Agent flagged a mismatch",
    body: "GST 2A vs books: 7 invoices unmatched for Nov 2026.",
    time: "3h ago",
    unread: true,
  },
  {
    id: "n-a2",
    category: "agent",
    title: "Document Agent processed 18 invoices",
    body: "All verified · 2 require approval over ₹50,000.",
    time: "Today",
    unread: false,
  },
  {
    id: "n-p1",
    category: "planner",
    title: "Priya scheduled your monthly review",
    body: "Dec 03, 2026 · 11:00 IST. Agenda attached.",
    time: "Yesterday",
    unread: true,
  },
  {
    id: "n-p2",
    category: "planner",
    title: "Board pack draft ready for review",
    body: "Nov board pack is ready — please review by EOD.",
    time: "2d ago",
    unread: false,
  },
];

// ============= Phase 2: KPI trust, AI commentary, drawer reports =============

export type KpiTrust = {
  status: "verified" | "partial" | "stale";
  matchRate: number;
  lastReconciled: string;
  sources: number;
  note: string;
};

export const kpiTrust: Record<string, KpiTrust> = {
  finance: { status: "verified", matchRate: 99.4, lastReconciled: "Today · 06:42", sources: 4, note: "ERP ↔ GL ↔ Bank ↔ Power BI all match." },
  sales:   { status: "verified", matchRate: 98.9, lastReconciled: "Today · 05:10", sources: 3, note: "CRM ↔ Billing ↔ Revenue match within tolerance." },
  operations: { status: "partial", matchRate: 96.2, lastReconciled: "Today · 04:30", sources: 3, note: "1 ticketing source reconciled with minor variance." },
  hr:      { status: "verified", matchRate: 100,  lastReconciled: "Yesterday",     sources: 2, note: "HRIS ↔ Payroll fully matched." },
  supply:  { status: "partial", matchRate: 94.8, lastReconciled: "Today · 03:15", sources: 4, note: "WMS feed delayed by 2 hours — figures may shift." },
  customer:{ status: "verified", matchRate: 99.1, lastReconciled: "Today · 06:00", sources: 2, note: "Survey ↔ CRM aligned." },
};

export const aiCommentary: Record<string, string> = {
  finance:   "Revenue is +8.4% YoY but margin is 2.8 pts below plan — driven by a 27% over-spend in marketing and lower realisation on the enterprise segment.",
  sales:     "Pipeline coverage is healthy at 3.2x quota, but win-rate on deals over $100k dropped to 22% (vs 31% last quarter) — concentrated in the EMEA region.",
  operations:"Service SLA is up 0.7pp to 98.6%, however unplanned downtime in Plant-2 cost 14 hours this month — root cause looks like a single line changeover.",
  hr:        "Headcount is -1.2% but voluntary attrition in Engineering jumped to 9% — concentrated in the 2-4 year tenure band.",
  supply:    "Lead time improved to 3.4 days (-0.6d), but you're carrying 18% more safety stock on Category-A SKUs than the plan assumed.",
  customer:  "NPS is +4 pts to 72, driven by onboarding and support — but detractor count rose 11% in the SMB segment, mostly billing-related.",
};

export const kpiDrawerInfo: Record<string, { reportTitle: string; reportSubtitle: string; bullets: string[] }> = {
  finance:    { reportTitle: "Finance · P&L Snapshot", reportSubtitle: "Revenue, margin & cash · Nov 2026", bullets: ["Revenue $12.84M · +8.4% YoY","Gross margin 62.1% · +1.2 pts","Operating cash $3.41M · +5.6%","Forecast variance -2.1% (improving)"] },
  sales:      { reportTitle: "Sales · Pipeline & Bookings", reportSubtitle: "Quota attainment · Q4 2026", bullets: ["4,219 deals closed · +12.1%","Pipeline coverage 3.2x quota","Avg. deal size $48.2k","Win rate 28%"] },
  operations: { reportTitle: "Operations · Service & Throughput", reportSubtitle: "Plant + service KPIs · Nov 2026", bullets: ["Service SLA 98.6% · +0.7pp","Throughput 142k units/wk","Unplanned downtime 14h (Plant-2)","OEE 84.2%"] },
  hr:         { reportTitle: "Human Capital · Workforce", reportSubtitle: "Headcount, attrition & engagement", bullets: ["Headcount 2,184 · -1.2%","Voluntary attrition 6.4%","Engineering attrition 9%","Engagement index 78"] },
  supply:     { reportTitle: "Supply Chain · Lead time & Inventory", reportSubtitle: "Network performance · Nov 2026", bullets: ["Avg. lead time 3.4d · -0.6d","On-time delivery 96.1%","Inventory days 42 (target 38)","Safety stock +18% on Cat-A SKUs"] },
  customer:   { reportTitle: "Customer · NPS & Retention", reportSubtitle: "Voice of customer · Nov 2026", bullets: ["NPS 72 · +4 pts","Retention 94.8%","CSAT 4.6/5","Detractor count +11% in SMB"] },
};

// ===== Department KPI catalogs (for user pick-and-choose tiles) =====
export const departmentKpiCatalogs: Record<string, Array<{
  id: string; label: string; value: string; delta: string;
  reportTitle?: string; reportSubtitle?: string; reportDataId?: string; embedURL?: string; orgId?: string;
}>> = {
  finance: [
    {
      id: "rev_ytd",
      label: "Revenue YTD",
      value: "$12.84M",
      delta: "+8.4%",
      reportTitle: "Revenue Report Sample",
      reportSubtitle: "Embedded report from database",
      reportDataId: "revenuereportsample_488716",
      embedURL:
        "https://app.powerbi.com/view?r=eyJrIjoiMTAwNjQ0YjQtZjA2Ni00NjBhLWEzN2YtZWU3ZDhmN2IwYjViIiwidCI6ImZlM2U5MWVmLTQzODktNDk4NS1hZTg5LTk0YTY1MjMwNjE3YSJ9",
    },
    {
      id: "gm",
      label: "Gross Margin",
      value: "62.1%",
      delta: "+1.2 pts",
      reportTitle: "Sales Report Embed",
      reportSubtitle: "Embedded report from database",
      reportDataId: "salesreportembed_774234",
      embedURL:
        "https://app.powerbi.com/reportEmbed?config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLUlORElBLUNFTlRSQUwtQS1QUklNQVJZLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0IiwiZW1iZWRGZWF0dXJlcyI6eyJ1c2FnZU1ldHJpY3NWTmV4dCI6dHJ1ZX19",
    },
    {
      id: "op_cash",
      label: "Operating Cash",
      value: "$3.41M",
      delta: "+5.6%",
      reportTitle: "Internal P&L",
      reportSubtitle: "Embedded report from database",
      reportDataId: "internalp&l_859980",
      embedURL:
        "https://app.powerbi.com/reportEmbed?config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLUlORElBLUNFTlRSQUwtQS1QUklNQVJZLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0IiwiZW1iZWRGZWF0dXJlcyI6eyJ1c2FnZU1ldHJpY3NWTmV4dCI6dHJ1ZX19",
    },
    {
      id: "fcst_var",
      label: "Forecast Variance",
      value: "-2.1%",
      delta: "improving",
      reportTitle: "Balance Sheet",
      reportSubtitle: "Embedded report from database",
      reportDataId: "balancesheet_511669",
      embedURL:
        "https://app.powerbi.com/reportEmbed?config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLUlORElBLUNFTlRSQUwtQS1QUklNQVJZLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0IiwiZW1iZWRGZWF0dXJlcyI6eyJ1c2FnZU1ldHJpY3NWTmV4dCI6dHJ1ZX19",
    },
    {
      id: "ebitda",
      label: "EBITDA",
      value: "$2.94M",
      delta: "+11%",
      reportTitle: "Material Margin Analysis",
      reportSubtitle: "Embedded report from database",
      reportDataId: "materialmarginanalysis_737165",
      embedURL:
        "https://app.powerbi.com/view?r=eyJrIjoiY2NhNTI4YmEtMDI0Zi00ZjFlLWI5OTQtZGVmZWIyZWU0MmFiIiwidCI6ImZlM2U5MWVmLTQzODktNDk4NS1hZTg5LTk0YTY1MjMwNjE3YSJ9",
    },
    {
      id: "dso",
      label: "DSO",
      value: "41 days",
      delta: "-3d",
      reportTitle: "Customer wise Revenue Report",
      reportSubtitle: "Embedded report from database",
      reportDataId: "customerwiserevenuereport_140836",
      embedURL:
        "https://app.powerbi.com/view?r=eyJrIjoiNzM4YTM5MjUtNzFlNy00ZGU2LWJhN2EtMDY2ZTk5OTNhY2U1IiwidCI6ImZlM2U5MWVmLTQzODktNDk4NS1hZTg5LTk0YTY1MjMwNjE3YSJ9",
    },
    {
      id: "opex",
      label: "OpEx Ratio",
      value: "28.4%",
      delta: "-0.8 pts",
      reportTitle: "Purchase Report multi dimension",
      reportSubtitle: "Embedded report from database",
      reportDataId: "purchasereportmultidimension_639014",
      embedURL:
        "https://app.powerbi.com/view?r=eyJrIjoiMmMxN2JiZWUtOWY1Yi00Yzc5LWIzYzYtNDkyNWFhOGNmNTgxIiwidCI6ImZlM2U5MWVmLTQzODktNDk4NS1hZTg5LTk0YTY1MjMwNjE3YSJ9",
    },
    {
      id: "capex",
      label: "CapEx YTD",
      value: "$1.62M",
      delta: "+18%",
      reportTitle: "Purchase Report multi dimension",
      reportSubtitle: "Embedded report from database",
      reportDataId: "purchasereportmultidimension_639014",
      embedURL:
        "https://app.powerbi.com/view?r=eyJrIjoiMmMxN2JiZWUtOWY1Yi00Yzc5LWIzYzYtNDkyNWFhOGNmNTgxIiwidCI6ImZlM2U5MWVmLTQzODktNDk4NS1hZTg5LTk0YTY1MjMwNjE3YSJ9",
    },
  ],
  sales: [
    { id: "pipe", label: "Pipeline", value: "$48.2M", delta: "+11%", reportTitle: "Pipeline Coverage by Stage" },
    { id: "win", label: "Win Rate", value: "34.2%", delta: "+2.1 pts", reportTitle: "Win/Loss Analysis" },
    { id: "avg_deal", label: "Avg Deal", value: "$78.4K", delta: "+6%", reportTitle: "Avg Deal Size Trend" },
    { id: "closed", label: "Closed Won", value: "4,219", delta: "+12.1%", reportTitle: "Closed Won by Region" },
    { id: "cac", label: "CAC", value: "$1,840", delta: "-4%", reportTitle: "Customer Acquisition Cost" },
    { id: "velocity", label: "Sales Velocity", value: "$612K/d", delta: "+9%", reportTitle: "Sales Velocity Trend" },
    { id: "quota", label: "Quota Attainment", value: "87%", delta: "+5 pts", reportTitle: "Rep Quota Attainment" },
    { id: "cycle", label: "Cycle Time", value: "34 days", delta: "-3d", reportTitle: "Sales Cycle Analysis" },
  ],
  operations: [
    { id: "sla", label: "Service SLA", value: "98.6%", delta: "+0.7%", reportTitle: "SLA Compliance by Service" },
    { id: "mttr", label: "MTTR", value: "42m", delta: "-8m", reportTitle: "Incident MTTR Trend" },
    { id: "incidents", label: "Incidents (W)", value: "18", delta: "-22%", reportTitle: "Incident Volume" },
    { id: "throughput", label: "Throughput", value: "1.2M / day", delta: "+4%", reportTitle: "Throughput by Line" },
    { id: "oee", label: "OEE", value: "84.2%", delta: "+1.4 pts", reportTitle: "OEE Decomposition" },
    { id: "downtime", label: "Unplanned Downtime", value: "14h", delta: "-3h", reportTitle: "Downtime Root Cause" },
    { id: "yield", label: "First Pass Yield", value: "96.8%", delta: "+0.3 pts", reportTitle: "Quality Yield" },
    { id: "util", label: "Asset Utilization", value: "78%", delta: "+2 pts", reportTitle: "Asset Utilization" },
  ],
  hr: [
    { id: "headcount", label: "Headcount", value: "2,184", delta: "-1.2%", reportTitle: "Headcount by Division" },
    { id: "attrition", label: "Attrition (TTM)", value: "11.4%", delta: "-1.1 pts", reportTitle: "Attrition Trend" },
    { id: "reqs", label: "Open Reqs", value: "146", delta: "+8", reportTitle: "Open Requisitions" },
    { id: "engage", label: "Engagement", value: "8.1 / 10", delta: "+0.3", reportTitle: "Engagement Survey" },
    { id: "tts", label: "Time to Staff", value: "38 days", delta: "-4d", reportTitle: "Time to Staff" },
    { id: "comp_ratio", label: "Comp Ratio", value: "1.02", delta: "+0.01", reportTitle: "Compensation Benchmark" },
    { id: "diversity", label: "Diversity Index", value: "0.71", delta: "+0.04", reportTitle: "Diversity Dashboard" },
    { id: "training", label: "Training Hours", value: "18.4 / FTE", delta: "+2.1", reportTitle: "L&D Completion" },
  ],
  supply: [
    { id: "lead", label: "Avg Lead Time", value: "3.4 days", delta: "-0.6d", reportTitle: "Lead Time by Supplier" },
    { id: "stockout", label: "Stockout Risk", value: "2.1%", delta: "-0.4 pts", reportTitle: "Stockout Heatmap" },
    { id: "otd", label: "On-Time Delivery", value: "96.2%", delta: "+1.1 pts", reportTitle: "OTD by Region" },
    { id: "snps", label: "Supplier NPS", value: "68", delta: "+3", reportTitle: "Supplier Scorecard" },
    { id: "inv_days", label: "Inventory Days", value: "42", delta: "-2d", reportTitle: "Inventory Aging" },
    { id: "fill", label: "Fill Rate", value: "97.4%", delta: "+0.6 pts", reportTitle: "Order Fill Rate" },
    { id: "freight", label: "Freight Cost", value: "$2.84 / unit", delta: "-3%", reportTitle: "Freight Cost Analysis" },
    { id: "risk", label: "Supplier Risk", value: "Low", delta: "stable", reportTitle: "Supplier Risk Index" },
  ],
  customer: [
    { id: "nps", label: "NPS", value: "72", delta: "+4 pts", reportTitle: "NPS Trend & Drivers" },
    { id: "csat", label: "CSAT", value: "94%", delta: "+1.2%", reportTitle: "CSAT by Touchpoint" },
    { id: "nrr", label: "Net Retention", value: "118%", delta: "+3 pts", reportTitle: "Net Revenue Retention" },
    { id: "accounts", label: "Active Accounts", value: "8,420", delta: "+6%", reportTitle: "Active Accounts Cohort" },
    { id: "churn", label: "Churn Rate", value: "4.8%", delta: "-0.6 pts", reportTitle: "Churn Analysis" },
    { id: "ltv", label: "LTV", value: "$14.2K", delta: "+9%", reportTitle: "Customer Lifetime Value" },
    { id: "ces", label: "Effort Score", value: "2.1", delta: "-0.2", reportTitle: "Customer Effort Score" },
    { id: "support", label: "Support Tickets", value: "1,284 / wk", delta: "-8%", reportTitle: "Support Volume" },
  ],
};

export const databaseMiniCards = [
  {
    id: "categorywisesales_997067",
    title: "Category wise Sales",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiNjJlODRjZTktYTIxMS00MmQyLWFiOGMtMjM4MWZjMTc3YjE0IiwidCI6ImZlM2U5MWVmLTQzODktNDk4NS1hZTg5LTk0YTY1MjMwNjE3YSJ9",
  },
  {
    id: "domestic&exportrevenue_892038",
    title: "Domestic & Export Revenue",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiNzZmZmJhN2QtMGZjYy00OTE1LWI4ZGEtYjcxMzlmZWU2Y2Q0IiwidCI6ImZlM2U5MWVmLTQzODktNDk4NS1hZTg5LTk0YTY1MjMwNjE3YSJ9",
  },
  {
    id: "revenue_857997",
    title: "Revenue",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiNGM0ZGFiN2ItMjU3OS00MTBkLTg1NDItNjQxZDkzMDc0ZTNhIiwidCI6ImZlM2U5MWVmLTQzODktNDk4NS1hZTg5LTk0YTY1MjMwNjE3YSJ9",
  },
  {
    id: "miniceodashbaord_384613",
    title: "mini CEO Dashbaord",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiZjU5MzQxOTgtMGFiNS00ZDQyLThiZWUtMDFkMDc3MzM5ZjkzIiwidCI6ImZlM2U5MWVmLTQzODktNDk4NS1hZTg5LTk0YTY1MjMwNjE3YSJ9",
  },
  {
    id: "miniproduction_829579",
    title: "mini production",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiNmE5YjczODgtNWVhZS00ZGEyLWFkOTMtY2ZlZTE4ZWI2M2UyIiwidCI6ImZlM2U5MWVmLTQzODktNDk4NS1hZTg5LTk0YTY1MjMwNjE3YSJ9",
  },
  {
    id: "miniclosingstock_622518",
    title: "mini Closing Stock",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiMTZlMmEyNDAtZDU4Mi00ZWU4LTg2ZDgtNDZmMTBiODQ1Y2Q4IiwidCI6ImZlM2U5MWVmLTQzODktNDk4NS1hZTg5LTk0YTY1MjMwNjE3YSJ9",
  },
  {
    id: "minipurchase_657247",
    title: "mini purchase",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiMGQxYmVkZWYtMDA5MC00MGRiLTg3OTktNzZhMDVjMThlZDhlIiwidCI6ImZlM2U5MWVmLTQzODktNDk4NS1hZTg5LTk0YTY1MjMwNjE3YSJ9",
  },
  {
    id: "miniproductioncostofhighestsellingmodel_842111",
    title: "mini production cost of highest selling model",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiNmI4YmRhMTUtMTQ0My00YTgxLTkwMTctNWVhMTM4MGU0ZGRkIiwidCI6ImZlM2U5MWVmLTQzODktNDk4NS1hZTg5LTk0YTY1MjMwNjE3YSJ9",
  },
  {
    id: "minigrossprofitfortheyear_360425",
    title: "Mini Gross Profit for the Year",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiZWRlNWIxY2QtZDg4My00NGFhLWE0M2EtMmM4YjExMzUyOTQ0IiwidCI6ImZlM2U5MWVmLTQzODktNDk4NS1hZTg5LTk0YTY1MjMwNjE3YSJ9",
  },
];

export const databaseEmbeddedReports = [
  {
    id: "revenuereportsample_488716",
    title: "Revenue Report Sample",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiMTAwNjQ0YjQtZjA2Ni00NjBhLWEzN2YtZWU3ZDhmN2IwYjViIiwidCI6ImZlM2U5MWVmLTQzODktNDk4NS1hZTg5LTk0YTY1MjMwNjE3YSJ9",
    isSecure: true,
  },
  {
    id: "internalp&l_859980",
    title: "Internal P&L",
    embedUrl:
      "https://app.powerbi.com/reportEmbed?config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLUlORElBLUNFTlRSQUwtQS1QUklNQVJZLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0IiwiZW1iZWRGZWF0dXJlcyI6eyJ1c2FnZU1ldHJpY3NWTmV4dCI6dHJ1ZX19",
    reportId: "721630af-9049-4ca2-bf16-150ab33a587a",
    groupId: "ac7ac8de-a2fd-4d9a-ab76-9cfcadace812",
    isSecure: true,
  },
  {
    id: "balancesheet_511669",
    title: "Balance Sheet",
    embedUrl:
      "https://app.powerbi.com/reportEmbed?config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLUlORElBLUNFTlRSQUwtQS1QUklNQVJZLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0IiwiZW1iZWRGZWF0dXJlcyI6eyJ1c2FnZU1ldHJpY3NWTmV4dCI6dHJ1ZX19",
    reportId: "0cdba3bb-1fd2-4956-a2c7-c97fb6ad1bfa",
    groupId: "ac7ac8de-a2fd-4d9a-ab76-9cfcadace812",
    isSecure: true,
  },
];
