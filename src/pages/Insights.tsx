import { CategoryChart } from "@/components/CategoryChart";
import { TopVendors } from "@/components/TopVendors";
import { BudgetVsActual } from "@/components/BudgetVsActual";
import { AnomalyFeed } from "@/components/AnomalyFeed";
import { useSpend } from "@/context/SpendContext";

const Insights = () => {
  const { isLoaded } = useSpend();

  if (!isLoaded) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-muted-foreground">Load seed data from the sidebar to view insights.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Insights</h1>
        <p className="text-sm text-muted-foreground">Categorized spending, budgets, and AI-detected anomalies</p>
      </div>

      {/* Row 1: Category chart + Top vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart />
        <TopVendors />
      </div>

      {/* Row 2: Budget vs actual */}
      <BudgetVsActual />

      {/* Row 3: AI anomaly feed with full resolution panel */}
      <AnomalyFeed />
    </div>
  );
};

export default Insights;
