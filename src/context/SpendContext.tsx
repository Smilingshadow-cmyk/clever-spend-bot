import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from "react";
import { Transaction, Suggestion, AuditSettings, MonthlySpend, CategorySpend, LedgerCategory, VendorRule, ReviewStatus } from "@/lib/types";
import { generateSeedTransactions, generateMonthlySpend, generateCategorySpend } from "@/lib/seed-data";
import { runAudit, generateSuggestions, DEFAULT_SETTINGS } from "@/lib/audit-engine";
import { loadLedgerCategories, saveLedgerCategories, loadVendorRules, saveVendorRules } from "@/lib/ledger-categories";
import { autoClassifyTransactions, deduplicateTransactions } from "@/lib/auto-classifier";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/hooks/use-toast";

interface SpendContextType {
  transactions: Transaction[];
  suggestions: Suggestion[];
  monthlySpend: MonthlySpend[];
  categorySpend: CategorySpend[];
  settings: AuditSettings;
  isLoaded: boolean;
  ledgerCategories: LedgerCategory[];
  vendorRules: VendorRule[];
  currency: string;
  loadSeedData: () => void;
  updateSettings: (s: AuditSettings) => void;
  clearData: () => void;
  importTransactions: (txns: Transaction[]) => void;
  setLedgerCategories: (cats: LedgerCategory[]) => void;
  setVendorRules: (rules: VendorRule[]) => void;
  applyRulesToTransactions: () => void;
  updateTransactions: (txns: Transaction[]) => void;
  setCurrency: (currency: string) => void;
  // ── Triage helpers ──
  triageQueue: Transaction[];
  approvedTransactions: Transaction[];
  setTransactionReviewStatus: (txnId: string, status: ReviewStatus, newSubCategoryId?: string) => void;
  bulkApproveAll: () => void;
  confirmAnomaly: (txnId: string) => void;
  addVendorRuleFromTriage: (vendor: string, subCategoryId: string) => void;
}

const SpendContext = createContext<SpendContextType | null>(null);

export const useSpend = () => {
  const ctx = useContext(SpendContext);
  if (!ctx) throw new Error("useSpend must be used within SpendProvider");
  return ctx;
};

// ── Cloud sync helpers ──────────────────────────────────────────────
async function loadSettingsFromCloud(): Promise<{
  ledger_categories: LedgerCategory[] | null;
  vendor_rules: VendorRule[] | null;
  currency: string | null;
} | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("user_settings")
      .select("ledger_categories, vendor_rules, currency")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) { console.warn("Cloud load error:", error.message); return null; }
    return data;
  } catch { return null; }
}

async function saveSettingsToCloud(settings: {
  ledger_categories?: LedgerCategory[];
  vendor_rules?: VendorRule[];
  currency?: string;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("user_settings").upsert({
      user_id: user.id,
      ...settings,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (error) console.warn("Cloud save error:", error.message);
  } catch { /* offline fallback */ }
}

// ── Provider ────────────────────────────────────────────────────────
export const SpendProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [monthlySpend, setMonthlySpend] = useState<MonthlySpend[]>([]);
  const [categorySpend, setCategorySpend] = useState<CategorySpend[]>([]);
  const [settings, setSettings] = useState<AuditSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  const [ledgerCategories, setLedgerCategoriesState] = useState<LedgerCategory[]>([]);
  const [vendorRules, setVendorRulesState] = useState<VendorRule[]>([]);
  const [currency, setCurrencyState] = useState<string>("₹");
  const cloudLoaded = useRef(false);

  // ── Derived triage state ──
  const triageQueue = transactions.filter(t => t.reviewStatus === "needs_review");
  const approvedTransactions = transactions.filter(
    t => t.reviewStatus === "auto_approved" || t.reviewStatus === "manually_approved"
  );

  // Load from localStorage first, then try cloud
  useEffect(() => {
    const localCats = loadLedgerCategories();
    const localRules = loadVendorRules();
    const localCurrency = localStorage.getItem("spendguard_currency");

    setLedgerCategoriesState(localCats);
    setVendorRulesState(localRules);
    if (localCurrency) setCurrencyState(localCurrency);

    // Attempt cloud sync (overrides local if available)
    loadSettingsFromCloud().then((cloud) => {
      if (!cloud) return;
      cloudLoaded.current = true;

      if (cloud.ledger_categories && cloud.ledger_categories.length > 0) {
        setLedgerCategoriesState(cloud.ledger_categories);
        saveLedgerCategories(cloud.ledger_categories);
      }
      if (cloud.vendor_rules && cloud.vendor_rules.length > 0) {
        setVendorRulesState(cloud.vendor_rules);
        saveVendorRules(cloud.vendor_rules);
      }
      if (cloud.currency) {
        setCurrencyState(cloud.currency);
        localStorage.setItem("spendguard_currency", cloud.currency);
      }
    });
  }, []);

  const setCurrency = useCallback((curr: string) => {
    setCurrencyState(curr);
    localStorage.setItem("spendguard_currency", curr);
    saveSettingsToCloud({ currency: curr });
  }, []);

  const setLedgerCategories = useCallback((cats: LedgerCategory[]) => {
    setLedgerCategoriesState(cats);
    saveLedgerCategories(cats);
    saveSettingsToCloud({ ledger_categories: cats });
  }, []);

  const setVendorRules = useCallback((rules: VendorRule[]) => {
    setVendorRulesState(rules);
    saveVendorRules(rules);
    saveSettingsToCloud({ vendor_rules: rules });
  }, []);

  const applyRulesToTransactions = useCallback(() => {
    setTransactions(prev => {
      let updated = false;
      const next = prev.map(txn => {
        if (txn.subCategoryId) return txn;
        
        let targetSubId: string | null = null;
        for (const rule of vendorRules) {
          if (rule.matchType === 'EXACT' && txn.vendor.toLowerCase() === rule.matchString.toLowerCase()) {
            targetSubId = rule.targetSubCategoryId;
            break;
          }
          if (rule.matchType === 'CONTAINS' && txn.vendor.toLowerCase().includes(rule.matchString.toLowerCase())) {
            targetSubId = rule.targetSubCategoryId;
            break;
          }
        }

        if (targetSubId) {
          updated = true;
          return { ...txn, subCategoryId: targetSubId, isVendorMapped: true };
        }
        return txn;
      });
      return updated ? next : prev;
    });
  }, [vendorRules]);

  const updateTransactions = useCallback((txns: Transaction[]) => {
    setTransactions(txns);
  }, []);

  // ── Triage helpers ──
  const setTransactionReviewStatus = useCallback((txnId: string, status: ReviewStatus, newSubCategoryId?: string) => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === txnId
          ? {
              ...t,
              reviewStatus: status,
              ...(newSubCategoryId !== undefined ? { subCategoryId: newSubCategoryId } : {}),
            }
          : t
      )
    );
  }, []);

  const bulkApproveAll = useCallback(() => {
    setTransactions(prev =>
      prev.map(t =>
        t.reviewStatus === "needs_review"
          ? { ...t, reviewStatus: "manually_approved" as const }
          : t
      )
    );
    toast({ title: "All approved", description: "Every transaction in the triage queue has been approved." });
  }, []);

  const confirmAnomaly = useCallback((txnId: string) => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === txnId
          ? { ...t, reviewStatus: "manually_approved" as const, anomalyFlag: true, statusNote: "Confirmed anomaly by reviewer" }
          : t
      )
    );
    toast({ title: "Anomaly confirmed", description: "Transaction flagged as a verified anomaly." });
  }, []);

  const addVendorRuleFromTriage = useCallback((vendor: string, subCategoryId: string) => {
    const existing = vendorRules.find(r => r.matchString.toLowerCase() === vendor.toLowerCase());
    if (!existing) {
      const newRule: VendorRule = {
        id: Math.random().toString(36).substring(2, 9),
        matchString: vendor,
        matchType: "CONTAINS",
        targetSubCategoryId: subCategoryId,
      };
      const updated = [...vendorRules, newRule];
      setVendorRules(updated);
    }
  }, [vendorRules, setVendorRules]);

  const loadSeedData = useCallback(() => {
    const raw = generateSeedTransactions();
    const audited = runAudit(raw, settings);
    setTransactions(audited);
    setSuggestions(generateSuggestions(audited));
    setMonthlySpend(generateMonthlySpend());
    setCategorySpend(generateCategorySpend());
    setIsLoaded(true);
  }, [settings]);

  const updateSettings = useCallback(async (s: AuditSettings) => {
    setSettings(s);
    if (transactions.length > 0) {
      // Re-run the local engine pass to update variance/duplicate flags. 
      // We don't re-run LLM automatically here to avoid excessive API costs.
      const reaudited = runAudit(transactions, s);
      setTransactions(reaudited);
      setSuggestions(generateSuggestions(reaudited));
    }
  }, [transactions]);

  const clearData = useCallback(() => {
    setTransactions([]);
    setSuggestions([]);
    setMonthlySpend([]);
    setCategorySpend([]);
    setIsLoaded(false);
  }, []);

  const importTransactions = useCallback(async (txns: Transaction[]) => {
    const { unique, duplicateCount } = deduplicateTransactions(txns);
    if (duplicateCount > 0) {
      toast({ title: "Duplicates removed", description: `${duplicateCount} duplicate transaction(s) were skipped.` });
    }

    toast({ title: "AI Analysis Started", description: `Sending ${unique.length} transactions to Gemini...` });

    const audited = runAudit(unique, settings);
    const cats = loadLedgerCategories();
    const rules = loadVendorRules();
    const { classified, stats } = await autoClassifyTransactions(audited, cats, rules, settings);

    if (stats.ruleMatches + stats.llmMatches > 0) {
      toast({
        title: "Smart Classification Complete",
        description: `Auto-classified: ${stats.ruleMatches} by rules, ${stats.llmMatches} by AI. ${stats.triaged} sent to triage queue.`,
      });
    }

    setTransactions(classified);
    setSuggestions(generateSuggestions(classified));

    const monthMap: Record<string, number> = {};
    const catMap: Record<string, number> = {};
    classified.forEach((t) => {
      const month = new Date(t.date).toLocaleString("default", { month: "short" });
      monthMap[month] = (monthMap[month] || 0) + t.amount;
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    setMonthlySpend(Object.entries(monthMap).map(([month, amount]) => ({ month, amount })));
    setCategorySpend(Object.entries(catMap).map(([category, amount]) => ({ category, amount })));
    setIsLoaded(true);
  }, [settings]);

  return (
    <SpendContext.Provider value={{
      transactions, suggestions, monthlySpend, categorySpend, settings, isLoaded,
      ledgerCategories, vendorRules, currency,
      loadSeedData, updateSettings, clearData, importTransactions,
      setLedgerCategories, setVendorRules, applyRulesToTransactions, updateTransactions,
      setCurrency,
      triageQueue, approvedTransactions, setTransactionReviewStatus, bulkApproveAll,
      confirmAnomaly, addVendorRuleFromTriage,
    }}>
      {children}
    </SpendContext.Provider>
  );
};
