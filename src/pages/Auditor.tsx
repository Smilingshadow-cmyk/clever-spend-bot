import { useState, useCallback } from "react";
import { AuditTable } from "@/components/AuditTable";
import { CategoryManager } from "@/components/CategoryManager";
import { useSpend } from "@/context/SpendContext";
import { Category, loadCategories, saveOverrides, loadOverrides } from "@/utils/categories";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Auditor = () => {
  const { isLoaded } = useSpend();
  const [categories, setCategories] = useState<Category[]>(loadCategories());
  const [showReview, setShowReview] = useState(true);
  const [recatKey, setRecatKey] = useState(0);

  const handleRecategorize = useCallback(() => {
    // Clear overrides so AI re-categorizes everything
    saveOverrides({});
    setShowReview(true);
    setRecatKey(k => k + 1);
    toast({ title: "Re-categorizing…", description: "All transactions re-processed with current category rules." });
  }, []);

  if (!isLoaded) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-muted-foreground">Load seed data from the sidebar to begin auditing.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Auditor</h1>
          <p className="text-sm text-muted-foreground">Review flagged transactions</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRecategorize} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          Re-categorize with AI
        </Button>
      </div>
      <AuditTable key={recatKey} categories={categories} showReviewBanner={showReview} onRecategorize={handleRecategorize} />
      <CategoryManager categories={categories} onUpdate={setCategories} />
    </div>
  );
};

export default Auditor;
