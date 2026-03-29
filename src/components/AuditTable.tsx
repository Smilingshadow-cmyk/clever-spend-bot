import { useMemo, useState } from "react";
import { useSpend } from "@/context/SpendContext";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, X } from "lucide-react";
import { TransactionStatus, RiskLevel } from "@/lib/types";

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

// ── Inline popover for status notes (replaces clipping tooltip) ─────
function StatusNotePopover({ note }: { note: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-0.5 rounded hover:bg-muted transition-colors focus:outline-none focus:ring-1 focus:ring-primary/50"
        title="View details"
      >
        <AlertCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
      </button>
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Popover */}
          <div className="absolute bottom-full right-0 mb-2 z-50 w-[280px] glass-card rounded-lg border border-border shadow-xl p-3 animate-in zoom-in-95 duration-100">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">AI Note</span>
              <button onClick={() => setOpen(false)} className="p-0.5 rounded hover:bg-muted transition-colors">
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">{note}</p>
          </div>
        </>
      )}
    </div>
  );
}

export const AuditTable = () => {
  const { transactions, currency, ledgerCategories } = useSpend();

  // Build a lookup map: subCategoryId -> { categoryName, subCategoryName }
  const subCatLookup = useMemo(() => {
    const map: Record<string, { categoryName: string; subCategoryName: string }> = {};
    for (const cat of ledgerCategories) {
      for (const sub of cat.subCategories) {
        map[sub.id] = { categoryName: cat.name, subCategoryName: sub.name };
      }
    }
    return map;
  }, [ledgerCategories]);

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-lg animate-slide-in overflow-visible">
        <div className="p-5 border-b border-border/50">
          <h3 className="text-sm font-medium text-muted-foreground">Audit Feed</h3>
          <p className="text-xs text-muted-foreground/70 mt-1">{transactions.length} transactions • {transactions.filter(t => t.riskLevel !== "low").length} flagged</p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground whitespace-nowrap">Date</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Vendor</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground hidden lg:table-cell whitespace-nowrap">Txn ID</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground hidden sm:table-cell">Category</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground hidden md:table-cell">Sub-Category</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground hidden md:table-cell">Type</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground text-right whitespace-nowrap">Amount</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground hidden md:table-cell">Risk</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => {
                const sc = statusConfig[t.status];
                const resolved = t.subCategoryId ? subCatLookup[t.subCategoryId] : null;
                return (
                  <TableRow key={t.id} className="border-border/30 hover:bg-accent/30">
                    <TableCell className="font-mono text-xs whitespace-nowrap">{t.date}</TableCell>
                    <TableCell className="text-sm font-medium max-w-[120px] md:max-w-none truncate">{t.vendor}</TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground hidden lg:table-cell max-w-[140px] truncate">
                      {t.transactionId || "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {resolved ? (
                        <Badge variant="outline" className="text-[11px] font-normal">
                          {resolved.categoryName}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground border-dashed">
                          {t.category || "Uncategorized"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {resolved ? (
                        <span className="text-xs text-foreground">{resolved.subCategoryName}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {t.txnType && (
                        <Badge variant="outline" className={`text-[10px] ${t.txnType === "CREDIT" ? "text-green-500 border-green-500/30" : "text-red-400 border-red-400/30"}`}>
                          {t.txnType}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-right whitespace-nowrap">{currency}{t.amount.toLocaleString()}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className={`text-xs font-medium uppercase ${riskColors[t.riskLevel]}`}>
                        {t.riskLevel}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className={`text-[10px] ${sc.className}`}>
                          {sc.label}
                        </Badge>
                        {t.statusNote && <StatusNotePopover note={t.statusNote} />}
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
