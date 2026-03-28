import { useSpend } from "@/context/SpendContext";
import { ArrowRight, Zap } from "lucide-react";

const priorityStyle = {
  high: "border-l-destructive",
  medium: "border-l-warning",
  low: "border-l-info",
};

export const ActionCenter = () => {
  const { suggestions } = useSpend();

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-3 animate-slide-in">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium text-muted-foreground">Cost Optimization Suggestions</h3>
      </div>
      {suggestions.map((s) => (
        <div
          key={s.id}
          className={`glass-card rounded-lg p-4 border-l-2 ${priorityStyle[s.priority]}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium">{s.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold font-mono text-primary">
                ${`₹${s.savingsAmount.toLocaleString()}`}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase">{s.priority} priority</p>
            </div>
          </div>
        </div>
      ))}
      <div className="glass-card rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Potential Savings</span>
          <span className="text-lg font-bold font-mono text-primary">
            ₹{suggestions.reduce((s, sg) => s + sg.savingsAmount, 0).toLocaleString()}/yr
          </span>
        </div>
      </div>
    </div>
  );
};
