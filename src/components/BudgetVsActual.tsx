import { useSpend } from "@/context/SpendContext";

const BUDGETS = [
  { category: "SaaS", budget: 120000 , actual: 98400 },
  { category: "Travel", budget: 60000, actual: 52600 },
  { category: "Rent", budget: 90000, actual: 90000 },
  { category: "Utilities", budget: 25000, actual: 18200 },
  { category: "Marketing", budget: 70000, actual: 64800 },
  { category: "Vendor payments", budget: 30000, actual: 27500 },
];

export function BudgetVsActual() {
  const { currency } = useSpend();

  return (
    <div className="glass-card rounded-lg p-5 animate-slide-in">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Budget vs actual</h3>
      <div className="space-y-4">
        {BUDGETS.map((b) => {
          const pct = Math.round((b.actual / b.budget) * 100);
          const barColor =
            pct >= 100 ? "bg-rose-500" :
            pct >= 80 ? "bg-amber-400" :
            "bg-emerald-500";
          const textColor =
            pct >= 100 ? "text-rose-400" :
            pct >= 80 ? "text-amber-400" :
            "text-emerald-400";

          return (
            <div key={b.category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{b.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    {currency}{b.actual.toLocaleString("en-IN")} / {currency}{b.budget.toLocaleString("en-IN")}
                  </span>
                  <span className={`text-xs font-mono font-semibold ${textColor}`}>{pct}%</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor} transition-all duration-700`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
