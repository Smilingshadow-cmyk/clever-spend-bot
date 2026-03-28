import { AuditTable } from "@/components/AuditTable";
import { useSpend } from "@/context/SpendContext";

const Auditor = () => {
  const { isLoaded } = useSpend();

  if (!isLoaded) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-muted-foreground">Load seed data from the sidebar to begin auditing.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Auditor</h1>
        <p className="text-sm text-muted-foreground">Review flagged transactions</p>
      </div>
      <AuditTable />
    </div>
  );
};

export default Auditor;
