import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useSpend } from "@/context/SpendContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const SpendChart = () => {
  const { monthlySpend, transactions } = useSpend();
  const [daily, setDaily] = useState(false);

  const dailySpend = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((t) => {
      const d = t.date;
      map[d] = (map[d] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([date, amount]) => ({ month: date, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  const data = daily ? dailySpend : monthlySpend;

  return (
    <div className="glass-card rounded-lg p-5 animate-slide-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          {daily ? "Daily" : "Monthly"} Spend Trend
        </h3>
        <div className="flex items-center gap-2">
          <Label htmlFor="trend-toggle" className="text-xs text-muted-foreground cursor-pointer">
            Daily
          </Label>
          <Switch
            id="trend-toggle"
            checked={daily}
            onCheckedChange={setDaily}
            className="h-4 w-8 [&>span]:h-3 [&>span]:w-3"
          />
        </div>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(157, 72%, 40%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(157, 72%, 40%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 18%)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(215, 15%, 55%)" angle={daily ? -45 : 0} textAnchor={daily ? "end" : "middle"} height={daily ? 60 : 30} />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 55%)" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 25%, 11%)",
                border: "1px solid hsl(222, 20%, 18%)",
                borderRadius: "8px",
                fontSize: 13,
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, "Spend"]}
            />
            <Area type="monotone" dataKey="amount" stroke="hsl(157, 72%, 40%)" strokeWidth={2} fill="url(#spendGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
