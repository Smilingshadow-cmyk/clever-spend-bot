import { useState } from "react";
import { Sparkles, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Category, getCategoryById, saveOverrides } from "@/utils/categories";
import { Transaction } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface Props {
  transactions: Transaction[];
  categories: Category[];
  categorization: Record<string, { categoryId: string; confidence: "high" | "low" }>;
  overrides: Record<string, string>;
  onAcceptAll: () => void;
  onOverride: (txnId: string, categoryId: string) => void;
  onDismiss: () => void;
}

export function CategoryReviewBanner({ transactions, categories, categorization, overrides, onAcceptAll, onOverride, onDismiss }: Props) {
  const [showModal, setShowModal] = useState(false);

  const uncategorizedCount = Object.values(categorization).filter(c => c.categoryId === "other" || c.confidence === "low").length;
  const totalCount = Object.keys(categorization).length;
  const needsReview = uncategorizedCount > 0 || (uncategorizedCount / totalCount) > 0.3;

  if (!needsReview) return null;

  const reviewItems = transactions.filter(t => {
    const cat = categorization[t.id];
    return cat && (cat.categoryId === "other" || cat.confidence === "low");
  });

  const handleAcceptAll = () => {
    onAcceptAll();
    toast({ title: "Categories saved!", description: "Your spending insights are now more accurate." });
  };

  return (
    <>
      <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-slide-in">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Sparkles className="h-4 w-4 text-warning shrink-0" />
          <p className="text-sm">
            <span className="font-medium">AI has categorized your transactions</span>
            <span className="text-muted-foreground"> — {uncategorizedCount} need review for better accuracy</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" onClick={() => setShowModal(true)} className="text-xs gap-1">
            Review Categories
          </Button>
          <Button size="sm" variant="outline" onClick={handleAcceptAll} className="text-xs">
            Accept All
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onDismiss}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review AI Categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {reviewItems.map(t => {
              const cat = categorization[t.id];
              const override = overrides[t.id];
              const currentCatId = override || cat?.categoryId || "other";
              const currentCat = getCategoryById(currentCatId, categories);

              return (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.vendor}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground font-mono">₹{t.amount.toLocaleString()}</span>
                      <Badge variant="outline" className={`text-[10px] ${cat?.confidence === "high" ? "border-success/30 text-success" : "border-warning/30 text-warning"}`}>
                        {cat?.confidence === "high" ? "High confidence" : "Needs review"}
                      </Badge>
                    </div>
                  </div>
                  <Select value={currentCatId} onValueChange={(val) => onOverride(t.id, val)}>
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue>
                        <span className="flex items-center gap-1.5">
                          <span>{currentCat.icon}</span>
                          <span>{currentCat.label}</span>
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id} className="text-xs">
                          <span className="flex items-center gap-1.5">
                            <span>{c.icon}</span>
                            <span>{c.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => { handleAcceptAll(); setShowModal(false); }} className="gap-1.5 text-xs">
              <Check className="h-3.5 w-3.5" />
              Confirm All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
