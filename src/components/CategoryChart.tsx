import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useSpend } from "@/context/SpendContext";

const COLORS = [
  "hsl(157, 72%, 40%)",
  "hsl(210, 100%, 52%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(262, 83%, 58%)",
  "hsl(157, 72%, 55%)",
  "hsl(210, 100%, 65%)",
  "hsl(38, 92%, 65%)",
  "hsl(0, 72%, 65%)",
  "hsl(262, 83%, 70%)",
];

export const CategoryChart = () => {
  const { categorySpend } = useSpend();

  return (
    <div className="glass-card rounded-lg p-5 animate-slide-in">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Spending by Category</h3>
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={categorySpend} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 18%)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(215, 15%, 55%)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} stroke="hsl(215, 15%, 55%)" width={100} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 25%, 11%)",
                border: "1px solid hsl(222, 20%, 18%)",
                borderRadius: "8px",
                fontSize: 13,
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]}
            />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={18}>
              {categorySpend.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
