import { useState, useEffect, useCallback, useMemo } from "react";
import { useSpend } from "@/context/SpendContext";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { TransactionStatus, RiskLevel } from "@/lib/types";
import { Category, loadCategories, loadOverrides, saveOverrides, categorizeTransaction, getCategoryById } from "@/utils/categories";
import { CategoryReviewBanner } from "@/components/CategoryReviewBanner";

const statusConfig: Record<TransactionStatus, { label: string; className: string }> = {
  clean: { label: "Clean", className: "bg-success/10 text-success border-success/20" },
  duplicate: { label: "Duplicate", className: "bg-destructive/10 text-destructive border-destructive/20" },
  "high-variance": { label: "High Variance", className: "bg-warning/10 text-warning border-warning/20" },
  "unused-saas": { label: "Unused SaaS", className: "bg-info/10 text-info border-info/20" },
  flagged: { label: "Flagged", className: "bg-warning/10 text-warning border-warning/20" },
};

const riskColors: Record<RiskLevel, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-destructive",
};

interface Props {
  categories: Category[];
  showReviewBanner?: boolean;
  onRecategorize?: () => void;
}

export const AuditTable = ({ categories, showReviewBanner = false, onRecategorize }: Props) => {
  const { transactions } = useSpend();
  const [overrides, setOverrides] = useState<Record<string, string>>(loadOverrides());
  const [dismissed, setDismissed] = useState(false);

  const categorization = useMemo(() => {
    const result: Record<string, { categoryId: string; confidence: "high" | "low" }> = {};
    transactions.forEach(t => {
      if (overrides[t.id]) {
        result[t.id] = { categoryId: overrides[t.id], confidence: "high" };
      } else {
        result[t.id] = categorizeTransaction(t.vendor, categories);
      }
    });
    return result;
  }, [transactions, categories, overrides]);

  const handleOverride = useCallback((txnId: string, categoryId: string) => {
    setOverrides(prev => {
      const next = { ...prev, [txnId]: categoryId };
      saveOverrides(next);
      return next;
    });
  }, []);

  const handleAcceptAll = useCallback(() => {
    const allOverrides = { ...overrides };
    transactions.forEach(t => {
      if (!allOverrides[t.id]) {
        allOverrides[t.id] = categorization[t.id]?.categoryId || "other";
      }
    });
    setOverrides(allOverrides);
    saveOverrides(allOverrides);
    setDismissed(true);
  }, [overrides, transactions, categorization]);

  return (
    <div className="space-y-4">
      {showReviewBanner && !dismissed && (
        <CategoryReviewBanner
          transactions={transactions}
          categories={categories}
          categorization={categorization}
          overrides={overrides}
          onAcceptAll={handleAcceptAll}
          onOverride={handleOverride}
          onDismiss={() => setDismissed(true)}
        />
      )}

      <div className="glass-card rounded-lg animate-slide-in overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <h3 className="text-sm font-medium text-muted-foreground">Audit Feed</h3>
          <p className="text-xs text-muted-foreground/70 mt-1">{transactions.length} transactions • {transactions.filter(t => t.riskLevel !== "low").length} flagged</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground">Date</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Vendor</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Category</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Department</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground text-right">Amount</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Risk</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => {
                const sc = statusConfig[t.status];
                const catInfo = categorization[t.id];
                const cat = getCategoryById(catInfo?.categoryId || "other", categories);
                return (
                  <TableRow key={t.id} className="border-border/30 hover:bg-accent/30">
                    <TableCell className="font-mono text-xs">{t.date}</TableCell>
                    <TableCell className="text-sm font-medium">{t.vendor}</TableCell>
                    <TableCell>
                      <Select value={catInfo?.categoryId || "other"} onValueChange={(val) => handleOverride(t.id, val)}>
                        <SelectTrigger className="h-7 w-auto min-w-[120px] border-none bg-transparent p-0 text-xs gap-1 shadow-none focus:ring-0">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: cat.color + "20", color: cat.color }}>
                            {cat.icon} {cat.label}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(c => (
                            <SelectItem key={c.id} value={c.id} className="text-xs">
                              <span className="flex items-center gap-1.5">
                                <span>{c.icon}</span> {c.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.department}</TableCell>
                    <TableCell className="text-sm font-mono text-right">₹{t.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium uppercase ${riskColors[t.riskLevel]}`}>
                        {t.riskLevel}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className={`text-[10px] ${sc.className}`}>
                          {sc.label}
                        </Badge>
                        {t.statusNote && (
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-popover text-popover-foreground border-border">
                              <p className="text-xs">{t.statusNote}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
