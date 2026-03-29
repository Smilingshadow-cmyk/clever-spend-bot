import { useSpend } from "@/context/SpendContext";

const TOP_VENDORS = [
  { vendor: "AWS", category: "Cloud Infrastructure", amount: 44350 },
  { vendor: "Airtel", category: "Utilities / Telecom", amount: 18200 },
  { vendor: "Google Workspace", category: "SaaS / Productivity", amount: 15600 },
  { vendor: "Slack", category: "SaaS / Communication", amount: 9400 },
  { vendor: "IndiGo", category: "Travel / Flights", amount: 7800 },
  { vendor: "Prestige Properties", category: "Rent / Office Space", amount: 90000 },
];

export function TopVendors() {
  const { currency } = useSpend();
  const maxAmount = Math.max(...TOP_VENDORS.map((v) => v.amount));

  return (
    <div className="glass-card rounded-lg p-5 animate-slide-in">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Top vendors by spend</h3>
      <div className="space-y-3">
        {TOP_VENDORS.sort((a, b) => b.amount - a.amount).map((v, i) => (
          <div key={v.vendor} className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground/60 w-5 text-right shrink-0">
              {i + 1}.
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium truncate">{v.vendor}</span>
                <span className="text-sm font-mono font-semibold text-primary shrink-0">
                  {currency}{v.amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/60 transition-all duration-700"
                    style={{ width: `${(v.amount / maxAmount) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground/60 shrink-0 w-[120px] truncate text-right">
                  {v.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
