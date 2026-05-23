import { useMemo } from "react";
import {
  Bar as RBar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const fmtCompact = (n: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

type Driver = { name: string; delta: number };

type Bar = {
  name: string;
  base: number;
  value: number;
  total: number;
  type: "anchor" | "favorable" | "unfavorable";
  delta?: number;
};

const COLORS = {
  anchor: "#c9c9e8",
  favorable: "#7cc28a",
  unfavorable: "#e26b6b",
};

export function PlanActualWaterfall({
  planValue,
  drivers,
  height = 320,
  unit = "$",
}: {
  planValue: number;
  drivers: Driver[];
  height?: number;
  unit?: string;
}) {
  const data = useMemo(() => {
    const bars: Bar[] = [];
    let running = planValue;
    bars.push({ name: "Plan", base: 0, value: planValue, total: planValue, type: "anchor" });
    for (const d of drivers) {
      const next = running + d.delta;
      bars.push({
        name: d.name,
        base: Math.min(running, next),
        value: Math.abs(d.delta),
        total: next,
        type: d.delta >= 0 ? "favorable" : "unfavorable",
        delta: d.delta,
      });
      running = next;
    }
    bars.push({ name: "Actual", base: 0, value: running, total: running, type: "anchor" });
    return bars;
  }, [planValue, drivers]);

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="var(--color-muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-12}
            dy={8}
            height={56}
          />
          <YAxis
            stroke="var(--color-muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${unit}${fmtCompact(v)}`}
          />
          <Tooltip
            cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
            contentStyle={{
              background: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(_v, _n, item) => {
              const p = item.payload as Bar;
              if (p.type === "anchor") return [`${unit}${fmtCompact(p.value)}`, p.name];
              const sign = (p.delta ?? 0) >= 0 ? "+" : "−";
              return [
                `${sign}${unit}${fmtCompact(Math.abs(p.delta ?? 0))} → ${unit}${fmtCompact(p.total)}`,
                p.name,
              ];
            }}
          />
          <RBar dataKey="base" stackId="w" fill="transparent" />
          <RBar dataKey="value" stackId="w" radius={[2, 2, 0, 0]} stroke="#1f1f1f" strokeWidth={0.5}>
            {data.map((d, i) => (
              <Cell key={i} fill={COLORS[d.type]} />
            ))}
            {/* Delta labels above driver bars */}
            <LabelList
              position="top"
              fontSize={11}
              fontWeight={600}
              fill="var(--color-foreground)"
              content={(props: any) => {
                const { x, y, width, value, index } = props;
                const d = data[index];
                if (d.type === "anchor") return null;
                const v = d.delta ?? 0;
                return (
                  <text
                    x={x + width / 2}
                    y={y - 6}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill="var(--color-foreground)"
                  >
                    {`${v >= 0 ? "+" : "−"}${unit}${fmtCompact(Math.abs(v))}`}
                  </text>
                );
              }}
            />
            {/* Total labels inside anchor bars */}
            <LabelList
              position="insideBottom"
              content={(props: any) => {
                const { x, y, width, height, index } = props;
                const d = data[index];
                if (d.type !== "anchor") return null;
                return (
                  <text
                    x={x + width / 2}
                    y={y + height - 8}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={700}
                    fill="var(--color-foreground)"
                  >
                    {`${unit}${fmtCompact(d.total)}`}
                  </text>
                );
              }}
            />
          </RBar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
