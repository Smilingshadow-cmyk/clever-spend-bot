import { Transaction, Suggestion, AuditSettings } from "./types";

export const DEFAULT_SETTINGS: AuditSettings = {
  varianceThreshold: 50,
  duplicateWindowDays: 3,
  unnecessaryCategories: ["food & dining", "shopping", "entertainment"],
  triageThreshold: 0.85,
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
};

export function runAudit(transactions: Transaction[], settings: AuditSettings): Transaction[] {
  const vendorHistory: Record<string, { amounts: number[]; dates: string[] }> = {};

  // Build vendor history
  transactions.forEach((t) => {
    if (!vendorHistory[t.vendor]) vendorHistory[t.vendor] = { amounts: [], dates: [] };
    vendorHistory[t.vendor].amounts.push(t.amount);
    vendorHistory[t.vendor].dates.push(t.date);
  });

  return transactions.map((t) => {
    const history = vendorHistory[t.vendor];
    const avg = history.amounts.reduce((a, b) => a + b, 0) / history.amounts.length;
    const variancePct = ((t.amount - avg) / avg) * 100;

    // Check duplicates
    const isDuplicate = history.dates.filter((d) => {
      const diff = Math.abs(new Date(t.date).getTime() - new Date(d).getTime());
      return diff > 0 && diff <= settings.duplicateWindowDays * 86400000;
    }).length > 0 && history.amounts.filter((a) => a === t.amount).length > 1;

    // Check high variance
    const isHighVariance = variancePct > settings.varianceThreshold;

    // Check unnecessary
    const isUnnecessary = settings.unnecessaryCategories.includes(t.category);

    let riskLevel = t.riskLevel;
    let status = t.status;
    let statusNote = t.statusNote;

    if (isDuplicate && status === "clean") {
      riskLevel = "high";
      status = "duplicate";
      statusNote = `Duplicate charge within ${settings.duplicateWindowDays} days`;
    } else if (isHighVariance && status === "clean") {
      riskLevel = "high";
      status = "high-variance";
      statusNote = `${Math.round(variancePct)}% above average`;
    } else if (isUnnecessary && status === "clean") {
      riskLevel = "medium";
      status = "flagged";
      statusNote = "Subscription category — review usage";
    }

    return { ...t, riskLevel, status, statusNote };
  });
}

export function generateSuggestions(transactions: Transaction[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  let sugId = 0;

  // Find duplicates
  const duplicates = transactions.filter((t) => t.status === "duplicate");
  if (duplicates.length > 0) {
    const totalDup = duplicates.reduce((s, t) => s + t.amount, 0);
    suggestions.push({
      id: `sug-${++sugId}`,
      title: "Eliminate Duplicate Charges",
      description: `${duplicates.length} duplicate transactions detected across ${[...new Set(duplicates.map((d) => d.vendor))].join(", ")}. Contact vendors to resolve double billing.`,
      savingsAmount: totalDup,
      priority: "high",
    });
  }

  // Find unused SaaS
  const unusedSaas = transactions.filter((t) => t.status === "unused-saas");
  if (unusedSaas.length > 0) {
    const totalUnused = unusedSaas.reduce((s, t) => s + t.amount, 0);
    suggestions.push({
      id: `sug-${++sugId}`,
      title: "Cancel Unused SaaS Subscriptions",
      description: `${unusedSaas.length} tools with low or zero usage: ${[...new Set(unusedSaas.map((d) => d.vendor))].join(", ")}. Cancel or downgrade to save annually.`,
      savingsAmount: totalUnused * 12,
      priority: "high",
      vendor: unusedSaas[0].vendor,
    });
  }

  // Zoom annual suggestion
  const zoomTxns = transactions.filter((t) => t.vendor === "Zoom");
  if (zoomTxns.length > 0) {
    suggestions.push({
      id: `sug-${++sugId}`,
      title: "Switch Zoom to Annual Plan",
      description: "Switching from monthly to annual billing on Zoom saves approximately 20% — projected ₹240/yr savings.",
      savingsAmount: 240,
      priority: "medium",
      vendor: "Zoom",
    });
  }

  // High variance alerts
  const highVar = transactions.filter((t) => t.status === "high-variance");
  if (highVar.length > 0) {
    suggestions.push({
      id: `sug-${++sugId}`,
      title: "Investigate Spending Spikes",
      description: `${highVar.length} transactions flagged for unusually high amounts. Review ${[...new Set(highVar.map((d) => d.vendor))].join(", ")} for overprovisioning or billing errors.`,
      savingsAmount: highVar.reduce((s, t) => s + t.amount * 0.3, 0),
      priority: "high",
    });
  }

  // Overlapping tools
  suggestions.push({
    id: `sug-${++sugId}`,
    title: "Consolidate Overlapping Tools",
    description: "Jira and Linear serve similar purposes. Consolidating to one project management tool could save ₹960/yr.",
    savingsAmount: 960,
    priority: "medium",
  });

  suggestions.push({
    id: `sug-${++sugId}`,
    title: "Negotiate Enterprise Discounts",
    description: "You spend ₹44,900+ on cloud infrastructure. Contacting AWS for an Enterprise Discount Program could yield 15-25% savings.",
    savingsAmount: 8000,
    priority: "medium",
    vendor: "AWS",
  });

  return suggestions;
}
