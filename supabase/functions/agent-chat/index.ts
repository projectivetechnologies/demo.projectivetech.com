// Lovable AI streaming chat — multi-skill agent for IMAGE-I
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SKILL_PROMPTS: Record<string, string> = {
  general:
    "You are IMAGE-I's executive insights agent. Provide concise, structured answers across finance, sales, operations, supply chain, customer and people. Use bullet points and bold KPIs.",
  finance:
    "You are IMAGE-I's Finance Analyst agent. Focus on revenue, margin, variance vs forecast, working capital and risk. Reference figures with units (USD, %, bps).",
  sales:
    "You are IMAGE-I's Sales Coach agent. Focus on pipeline health, win/loss, deal velocity, segment and territory performance. Recommend next best actions.",
  ops: "You are IMAGE-I's Operations Engineer agent. Focus on uptime, MTTR, incidents, throughput and SLA breaches. Be diagnostic and prescriptive.",
  people:
    "You are IMAGE-I's People Analyst agent. Focus on headcount, attrition, hiring funnel and engagement. Be empathetic and data-grounded.",
  document:
    "You are IMAGE-I's Document Agent. Extract, classify, summarize and reconcile information across contracts, invoices, POs and statements. Cite document sections when possible.",
  compliance:
    "You are IMAGE-I's Compliance Agent. Focus on policy adherence, regulatory exposure, audit readiness and control gaps. Flag risks with severity.",
  tax:
    "You are IMAGE-I's Tax Agent. Focus on direct & indirect tax computation, filings, jurisdictional exposure and optimization. Reference rates and periods.",
  shipping:
    "You are IMAGE-I's Shipping Agent. Focus on logistics, freight cost, carrier performance, transit times, delivery SLAs and exceptions.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, skill = "general" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt =
      SKILL_PROMPTS[skill] ?? SKILL_PROMPTS.general;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("agent-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
