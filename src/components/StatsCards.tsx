import { DollarSign, AlertTriangle, TrendingDown, CreditCard } from "lucide-react";
import { useSpend } from "@/context/SpendContext";

const StatCard = ({ title, value, subtitle, icon: Icon, accent }: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  accent: string;
}) => (
  <div className="glass-card rounded-lg p-5 animate-slide-in">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-muted-foreground">{title}</span>
      <div className={`p-2 rounded-md ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <p className="text-2xl font-semibold tracking-tight font-mono">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
  </div>
);

export const StatsCards = () => {
  const { transactions, suggestions } = useSpend();

  const totalSpend = transactions.reduce((s, t) => s + t.amount, 0);
  const flagged = transactions.filter((t) => t.riskLevel !== "low").length;
  const potentialSavings = suggestions.reduce((s, sg) => s + sg.savingsAmount, 0);
  const activeSubs = [...new Set(transactions.filter((t) => t.category === "Subscription").map((t) => t.vendor))].length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Spend"
        value={`$${totalSpend.toLocaleString()}`}
        subtitle="This period"
        icon={DollarSign}
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
        value={`$${potentialSavings.toLocaleString()}`}
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
