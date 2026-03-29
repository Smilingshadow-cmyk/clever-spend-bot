import { IndianRupee, AlertTriangle, TrendingDown, CreditCard } from "lucide-react";
import { useSpend } from "@/context/SpendContext";

const StatCard = ({ title, value, subtitle, subLabel, icon: Icon, accent }: {
  title: string;
  value: string;
  subtitle: string;
  subLabel?: string;
  icon: React.ElementType;
  accent: string;
}) => (
  <div className="glass-card rounded-lg p-4 md:p-5 animate-slide-in min-w-0">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs md:text-sm font-medium text-muted-foreground truncate mr-2">{title}</span>
      <div className={`p-1.5 md:p-2 rounded-md shrink-0 ${accent}`}>
        <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
      </div>
    </div>
    <p className="text-xl md:text-2xl font-semibold tracking-tight font-mono truncate">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    {subLabel && <p className="text-[10px] text-muted-foreground/50 mt-0.5">{subLabel}</p>}
  </div>
);

export const StatsCards = () => {
  const { transactions, suggestions, currency } = useSpend();

  const totalSpend = transactions.reduce((s, t) => s + t.amount, 0);
  const flagged = transactions.filter((t) => t.riskLevel !== "low").length;
  const potentialSavings = suggestions.reduce((s, sg) => s + sg.savingsAmount, 0);
  const activeSubs = [...new Set(transactions.filter((t) => t.category === "Subscription").map((t) => t.vendor))].length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Spend"
        value={`${currency}${totalSpend.toLocaleString()}`}
        subtitle="This period"
        subLabel="CSV + Bank Sync"
        icon={IndianRupee}
        accent="bg-primary/10 text-primary"
      />
      <StatCard
        title="Flagged Items"
        value={String(flagged)}
        subtitle="Require review"
        icon={AlertTriangle}
        accent="bg-warning/10 text-warning"
      />
      <StatCard
        title="Potential Savings"
        value={`${currency}${potentialSavings.toLocaleString()}`}
        subtitle="Annual estimate"
        icon={TrendingDown}
        accent="bg-success/10 text-success"
      />
      <StatCard
        title="Active Subscriptions"
        value={String(activeSubs)}
        subtitle="SaaS tools"
        icon={CreditCard}
        accent="bg-info/10 text-info"
      />
    </div>
  );
};
