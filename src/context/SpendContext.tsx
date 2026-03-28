import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Transaction, Suggestion, AuditSettings, MonthlySpend, CategorySpend } from "@/lib/types";
import { generateSeedTransactions, generateMonthlySpend, generateCategorySpend } from "@/lib/seed-data";
import { runAudit, generateSuggestions, DEFAULT_SETTINGS } from "@/lib/audit-engine";

interface SpendContextType {
  transactions: Transaction[];
  suggestions: Suggestion[];
  monthlySpend: MonthlySpend[];
  categorySpend: CategorySpend[];
  settings: AuditSettings;
  isLoaded: boolean;
  loadSeedData: () => void;
  updateSettings: (s: AuditSettings) => void;
  clearData: () => void;
}

const SpendContext = createContext<SpendContextType | null>(null);

export const useSpend = () => {
  const ctx = useContext(SpendContext);
  if (!ctx) throw new Error("useSpend must be used within SpendProvider");
  return ctx;
};

export const SpendProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [monthlySpend, setMonthlySpend] = useState<MonthlySpend[]>([]);
  const [categorySpend, setCategorySpend] = useState<CategorySpend[]>([]);
  const [settings, setSettings] = useState<AuditSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadSeedData = useCallback(() => {
    const raw = generateSeedTransactions();
    const audited = runAudit(raw, settings);
    setTransactions(audited);
    setSuggestions(generateSuggestions(audited));
    setMonthlySpend(generateMonthlySpend());
    setCategorySpend(generateCategorySpend());
    setIsLoaded(true);
  }, [settings]);

  const updateSettings = useCallback((s: AuditSettings) => {
    setSettings(s);
    if (transactions.length > 0) {
      const reaudited = runAudit(generateSeedTransactions(), s);
      setTransactions(reaudited);
      setSuggestions(generateSuggestions(reaudited));
    }
  }, [transactions.length]);

  const clearData = useCallback(() => {
    setTransactions([]);
    setSuggestions([]);
    setMonthlySpend([]);
    setCategorySpend([]);
    setIsLoaded(false);
  }, []);

  return (
    <SpendContext.Provider value={{ transactions, suggestions, monthlySpend, categorySpend, settings, isLoaded, loadSeedData, updateSettings, clearData }}>
      {children}
    </SpendContext.Provider>
  );
};
