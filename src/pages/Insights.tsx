import { CategoryChart } from "@/components/CategoryChart";
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
        <p className="text-sm text-muted-foreground">Categorized spending by department</p>
      </div>
      <CategoryChart />
    </div>
  );
};

export default Insights;
