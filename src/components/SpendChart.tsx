import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useSpend } from "@/context/SpendContext";

export const SpendChart = () => {
  const { monthlySpend } = useSpend();

  return (
    <div className="glass-card rounded-lg p-5 animate-slide-in">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Monthly Spend Trend</h3>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlySpend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(157, 72%, 40%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(157, 72%, 40%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 18%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 55%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 55%)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 25%, 11%)",
                border: "1px solid hsl(222, 20%, 18%)",
                borderRadius: "8px",
                fontSize: 13,
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Spend"]}
            />
            <Area type="monotone" dataKey="amount" stroke="hsl(157, 72%, 40%)" strokeWidth={2} fill="url(#spendGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
