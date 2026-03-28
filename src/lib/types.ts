export type RiskLevel = "low" | "medium" | "high";
export type TransactionStatus = "clean" | "duplicate" | "high-variance" | "unused-saas" | "flagged";

export interface Transaction {
  id: string;
  date: string;
  vendor: string;
  category: string;
  department: string;
  amount: number;
  riskLevel: RiskLevel;
  status: TransactionStatus;
  statusNote?: string;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  savingsAmount: number;
  priority: "low" | "medium" | "high";
  vendor?: string;
}

export interface AuditSettings {
  varianceThreshold: number; // percentage
  duplicateWindowDays: number;
  unnecessaryCategories: string[];
}

export interface MonthlySpend {
  month: string;
  amount: number;
}

export interface CategorySpend {
  category: string;
  amount: number;
  department: string;
}
