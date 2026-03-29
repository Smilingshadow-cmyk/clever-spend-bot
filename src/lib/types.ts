export type RiskLevel = "low" | "medium" | "high";
export type TransactionStatus = "clean" | "duplicate" | "high-variance" | "unused-saas" | "flagged";
export type ReviewStatus = "auto_approved" | "needs_review" | "manually_approved";

export type LedgerType = "Business" | "Balance Sheet" | "Anomaly";

export interface SubCategory {
  id: string;
  name: string;
  descriptionOrExamples: string;
}

export interface LedgerCategory {
  id: string;
  name: string;
  ledgerType: LedgerType;
  subCategories: SubCategory[];
}

export interface VendorRule {
  id: string;
  matchString: string;
  matchType: "EXACT" | "CONTAINS";
  targetSubCategoryId: string;
}

export type TxnType = "CREDIT" | "DEBIT" | "";

export interface Transaction {
  id: string;
  date: string;
  time?: string;
  vendor: string;
  category: string;
  amount: number;
  txnType: TxnType;
  transactionId?: string;   // Bank-issued e.g. T26032812113152796316
  utrNumber?: string;       // UTR No. from bank
  accountNumber?: string;   // Masked account e.g. XXXXXXXXXX6861
  riskLevel: RiskLevel;
  status: TransactionStatus;
  statusNote?: string;
  subCategoryId?: string | null;
  isVendorMapped?: boolean;

  // ── Triage / AI Pipeline Fields ────────────────────────────────
  /** 0.0–1.0 score expressing how certain the AI is about this categorization */
  confidenceScore?: number;
  /** True when the AI detects something anomalous (unusual amount, unknown vendor, etc.) */
  anomalyFlag?: boolean;
  /** Workflow state for the triage queue */
  reviewStatus?: ReviewStatus;
  /** Free-text explanation from the AI about why it flagged or categorized this item */
  aiNotes?: string;
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
  /** Confidence threshold (0–1). Transactions below this go to the triage queue. Default 0.85 */
  triageThreshold: number;
  geminiApiKey?: string; // Opt-in API key for LLM Intelligence
}

export interface MonthlySpend {
  month: string;
  amount: number;
}

export interface CategorySpend {
  category: string;
  amount: number;
}
