import { StatsCards } from "@/components/StatsCards";
import { SpendChart } from "@/components/SpendChart";
import { ActionCenter } from "@/components/ActionCenter";
import { useSpend } from "@/context/SpendContext";
import { Database, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmptyState = () => {
  const { loadSeedData } = useSpend();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-slide-in">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center glow-primary">
        <Shield className="h-8 w-8 text-primary" />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">SpendGuard AI</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          Autonomous expense auditor. Load sample data to see anomaly detection, duplicate flagging, and cost-cutting recommendations in action.
        </p>
      </div>
      <Button onClick={loadSeedData} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
        <Database className="h-4 w-4" />
        Load Seed Data
      </Button>
    </div>
  );
};

const Dashboard = () => {
  const { isLoaded } = useSpend();

  if (!isLoaded) return <EmptyState />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">Spending audit summary</p>
      </div>
      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <SpendChart />
        </div>
        <div className="lg:col-span-2">
          <ActionCenter />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
