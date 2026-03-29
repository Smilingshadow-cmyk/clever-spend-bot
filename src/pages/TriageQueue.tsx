import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useSpend } from "@/context/SpendContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  XCircle,
  Edit3,
  AlertTriangle,
  Brain,
  Inbox,
  ChevronDown,
  ChevronUp,
  Zap,
  Briefcase,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Tag,
} from "lucide-react";
import { Transaction, ReviewStatus, LedgerCategory } from "@/lib/types";

// ── Confidence bar ──────────────────────────────────────────────────
function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 85 ? "bg-emerald-500" :
      pct >= 60 ? "bg-amber-400" :
        "bg-rose-500";
  const textColor =
    pct >= 85 ? "text-emerald-400" :
      pct >= 60 ? "text-amber-400" :
        "text-rose-400";

  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-mono font-semibold ${textColor}`}>{pct}%</span>
    </div>
  );
}

// ── Category Edit Panel (two-step: Category → Subcategory) ──────────
function CategoryEditPanel({
  ledgerCategories,
  onSelect,
  onCancel,
  vendor,
}: {
  ledgerCategories: LedgerCategory[];
  onSelect: (categoryName: string, subCategoryId: string, subCategoryName: string) => void;
  onCancel: () => void;
  vendor: string;
}) {
  const [selectedCatId, setSelectedCatId] = useState<string>("");

  const selectedCat = useMemo(
    () => ledgerCategories.find(c => c.id === selectedCatId),
    [ledgerCategories, selectedCatId]
  );

  // Group categories by ledger type
  const grouped = useMemo(() => {
    const groups: Record<string, LedgerCategory[]> = {};
    for (const cat of ledgerCategories) {
      if (!groups[cat.ledgerType]) groups[cat.ledgerType] = [];
      groups[cat.ledgerType].push(cat);
    }
    return groups;
  }, [ledgerCategories]);

  return (
    <div className="flex items-center gap-2 flex-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
      {/* Step 1: Category */}
      <Select value={selectedCatId} onValueChange={setSelectedCatId}>
        <SelectTrigger className="h-7 text-xs w-[180px]">
          <SelectValue placeholder="Select category…" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(grouped).map(([ledgerType, cats]) => (
            <div key={ledgerType}>
              <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 sticky top-0">
                {ledgerType}
              </div>
              {cats.map(cat => (
                <SelectItem key={cat.id} value={cat.id} className="text-xs">
                  {cat.name}
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>

      {/* Step 2: Subcategory (only shown after category selected) */}
      {selectedCat && (
        <>
          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
          <Select
            onValueChange={(subId) => {
              const sub = selectedCat.subCategories.find(s => s.id === subId);
              if (sub) {
                onSelect(selectedCat.name, sub.id, sub.name);
              }
            }}
          >
            <SelectTrigger className="h-7 text-xs w-[200px]">
              <SelectValue placeholder="Select sub-category…" />
            </SelectTrigger>
            <SelectContent>
              {selectedCat.subCategories.map(sub => (
                <SelectItem key={sub.id} value={sub.id} className="text-xs">
                  <div>
                    <div>{sub.name}</div>
                    {sub.descriptionOrExamples && (
                      <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                        {sub.descriptionOrExamples}
                      </div>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}

      {/* Show vendor rule hint */}
      {selectedCat && (
        <span className="text-[10px] text-muted-foreground/60 hidden md:inline">
          <Tag className="h-3 w-3 inline mr-0.5" />
          Rule for "{vendor}" will be saved
        </span>
      )}

      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

// ── Single triage card ──────────────────────────────────────────────
function TriageCard({
  txn,
  isActive,
  onApprove,
  onConfirmAnomaly,
  onClick,
  currency,
  ledgerCategories,
  onEditCategory,
}: {
  txn: Transaction;
  isActive: boolean;
  onApprove: () => void;
  onConfirmAnomaly: () => void;
  onClick: () => void;
  currency: string;
  ledgerCategories: LedgerCategory[];
  onEditCategory: (categoryName: string, subCategoryId: string, subCategoryName: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);

  return (
    <div
      className={`group relative rounded-lg transition-all duration-200 cursor-pointer
        ${isActive
          ? "glass-card border-primary/60 shadow-lg shadow-primary/5 ring-1 ring-primary/20"
          : "glass-card hover:border-border hover:bg-accent/30"
        }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); }
      }}
    >
      {/* Top row */}
      <div className="flex items-center gap-3 p-4">
        {/* Anomaly indicator */}
        <div className="shrink-0">
          {txn.anomalyFlag ? (
            <div className="h-9 w-9 rounded-full bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            </div>
          ) : (
            <div className="h-9 w-9 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Brain className="h-4 w-4 text-amber-400" />
            </div>
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">{txn.vendor}</span>
            {txn.anomalyFlag && (
              <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/20 shrink-0">
                Anomaly
              </Badge>
            )}
            {txn.status !== "clean" && (
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20 shrink-0">
                {txn.status}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground font-mono">{txn.date}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground border-dashed">
              {txn.category || "Uncategorized"}
            </Badge>
          </div>
        </div>

        {/* Amount & Confidence */}
        <div className="text-right shrink-0 space-y-1">
          <p className="text-sm font-mono font-semibold">
            {txn.txnType === "CREDIT" ? "+" : "-"}{currency}{txn.amount.toLocaleString()}
          </p>
          <ConfidenceBar score={txn.confidenceScore ?? 0} />
        </div>
      </div>

      {/* AI Notes row */}
      <div className="px-4 pb-2">
        <button
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        >
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="font-medium">AI Reasoning</span>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        {expanded && (
          <div className="mt-2 p-3 rounded-md bg-muted/50 border border-border/50 text-xs text-muted-foreground leading-relaxed animate-slide-in">
            {txn.aiNotes || "No AI notes available."}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 px-4 pb-3 pt-1 flex-wrap">
        {!editMode ? (
          <>
            {/* Approve AI's classification */}
            <Button
              size="sm"
              className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={(e) => { e.stopPropagation(); onApprove(); }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve
            </Button>

            {/* Edit Category (opens two-step Category → Subcategory) */}
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1.5"
              onClick={(e) => { e.stopPropagation(); setEditMode(true); }}
            >
              <Edit3 className="h-3.5 w-3.5" />
              Recategorize
            </Button>

            {/* Confirm as anomaly */}
            {txn.anomalyFlag && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5 text-rose-400 border-rose-400/30 hover:bg-rose-500/10"
                onClick={(e) => { e.stopPropagation(); onConfirmAnomaly(); }}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Confirm Anomaly
              </Button>
            )}
          </>
        ) : (
          <CategoryEditPanel
            ledgerCategories={ledgerCategories}
            vendor={txn.vendor}
            onCancel={() => setEditMode(false)}
            onSelect={(catName, subId, subName) => {
              onEditCategory(catName, subId, subName);
              setEditMode(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────
const TriageQueue = () => {
  const {
    isLoaded,
    triageQueue,
    approvedTransactions,
    setTransactionReviewStatus,
    bulkApproveAll,
    confirmAnomaly,
    addVendorRuleFromTriage,
    currency,
    ledgerCategories,
  } = useSpend();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (triageQueue.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
        case "j":
          e.preventDefault();
          setActiveIndex(i => Math.min(i + 1, triageQueue.length - 1));
          break;
        case "ArrowUp":
        case "k":
          e.preventDefault();
          setActiveIndex(i => Math.max(i - 1, 0));
          break;
        case "a":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            const txn = triageQueue[activeIndex];
            if (txn) {
              setTransactionReviewStatus(txn.id, "manually_approved");
              setActiveIndex(i => Math.min(i, triageQueue.length - 2));
            }
          }
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triageQueue, activeIndex, setTransactionReviewStatus]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">
          Load seed data or import a CSV from the sidebar to begin triaging.
        </p>
      </div>
    );
  }

  const totalTriageAmount = triageQueue.reduce((sum, t) => sum + t.amount, 0);
  const anomalyCount = triageQueue.filter(t => t.anomalyFlag).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Inbox className="h-5 w-5 text-primary" />
            Triage Queue
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review AI-flagged transactions. Use{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-border/60">↑</kbd>{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-border/60">↓</kbd>{" "}
            to navigate,{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-border/60">A</kbd>{" "}
            to approve.
          </p>
        </div>
        {triageQueue.length > 0 && (
          <Button
            onClick={bulkApproveAll}
            size="sm"
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
          >
            <Zap className="h-3.5 w-3.5" />
            Approve All ({triageQueue.length})
          </Button>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{triageQueue.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Needs Review</p>
        </div>
        <div className="glass-card rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-rose-400">{anomalyCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Anomalies</p>
        </div>
        <div className="glass-card rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{approvedTransactions.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Auto-Approved</p>
        </div>
        <div className="glass-card rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{currency}{totalTriageAmount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Flagged Amount</p>
        </div>
      </div>

      {/* Queue */}
      {triageQueue.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold">All Clear</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Every transaction has been reviewed and approved. Nice work! 🎉
          </p>
        </div>
      ) : (
        <div ref={listRef} className="space-y-3">
          {triageQueue.map((txn, idx) => (
            <TriageCard
              key={txn.id}
              txn={txn}
              isActive={idx === activeIndex}
              currency={currency}
              ledgerCategories={ledgerCategories}
              onClick={() => setActiveIndex(idx)}
              onApprove={() => {
                setTransactionReviewStatus(txn.id, "manually_approved");
                setActiveIndex(i => Math.min(i, triageQueue.length - 2));
                toast({ title: "Approved", description: `"${txn.vendor}" approved and moved to audit log.` });
              }}
              onConfirmAnomaly={() => {
                confirmAnomaly(txn.id);
                setActiveIndex(i => Math.min(i, triageQueue.length - 2));
              }}
              onEditCategory={(catName, subCatId, subCatName) => {
                setTransactionReviewStatus(txn.id, "manually_approved", subCatId);
                addVendorRuleFromTriage(txn.vendor, subCatId);
                setActiveIndex(i => Math.min(i, triageQueue.length - 2));
                toast({
                  title: "Categorized & rule saved",
                  description: `"${txn.vendor}" → ${catName} / ${subCatName}. Future transactions from this vendor will auto-categorize.`,
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TriageQueue;
