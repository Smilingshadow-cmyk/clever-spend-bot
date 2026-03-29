import { Transaction, LedgerCategory, VendorRule, ReviewStatus, AuditSettings } from "./types";
import { DEFAULT_SETTINGS } from "./audit-engine";
import { classifyWithGemini } from "./llm-classifier";

/**
 * Determine the review status based on the confidence score and anomaly flag.
 */
function determineReviewStatus(
  confidenceScore: number,
  anomalyFlag: boolean,
  threshold: number
): ReviewStatus {
  if (anomalyFlag) return "needs_review";
  return confidenceScore >= threshold ? "auto_approved" : "needs_review";
}

/**
 * Auto-classify an array of transactions.
 * First applies deterministic vendor rules.
 * Then calls Gemini LLM for the remainder (if API key provided).
 */
export async function autoClassifyTransactions(
  transactions: Transaction[],
  ledgerCategories: LedgerCategory[],
  vendorRules: VendorRule[],
  settings?: AuditSettings
): Promise<{ classified: Transaction[]; stats: { ruleMatches: number; llmMatches: number; unmatched: number; triaged: number } }> {
  const threshold = settings?.triageThreshold ?? DEFAULT_SETTINGS.triageThreshold;
  const geminiKey = settings?.geminiApiKey ?? "";

  let ruleMatches = 0;
  let llmMatches = 0;
  let unmatched = 0;
  let triaged = 0;

  const toLLM: Transaction[] = [];
  const processedTxns = new Map<string, Transaction>();

  // PHASE 1: Fast-Path Deterministic Vendor Rules
  transactions.forEach(txn => {
    // Skip already-classified transactions that have been manually approved
    if (txn.subCategoryId && txn.reviewStatus === "manually_approved") {
      processedTxns.set(txn.id, txn);
      return;
    }

    const isAnomaly = txn.status === "duplicate" || txn.status === "high-variance" || txn.status === "unused-saas";
    let internalMatchSource: "vendor-rule" | "none" = "none";
    let internalConfidence = 0.15;
    let internalSubCategoryId = txn.subCategoryId || null;
    let internalAiNotes = "No vendor rule match. Waiting for LLM...";

    const vendorLower = txn.vendor.toLowerCase();

    // Vendor Rules Check
    for (const rule of vendorRules) {
      if (rule.matchType === "EXACT" && vendorLower === rule.matchString.toLowerCase()) {
        internalSubCategoryId = rule.targetSubCategoryId;
        internalConfidence = 0.98;
        internalMatchSource = "vendor-rule";
        internalAiNotes = `Explicit user vendor rule applied (exact).`;
        break;
      }
      if (rule.matchType === "CONTAINS" && vendorLower.includes(rule.matchString.toLowerCase())) {
        internalSubCategoryId = rule.targetSubCategoryId;
        internalConfidence = 0.95;
        internalMatchSource = "vendor-rule";
        internalAiNotes = `Explicit user vendor rule applied (contains).`;
        break;
      }
    }

    if (internalMatchSource === "vendor-rule") {
      ruleMatches++;
      const reviewStatus = determineReviewStatus(internalConfidence, isAnomaly, threshold);
      if (reviewStatus === "needs_review") triaged++;
      
      processedTxns.set(txn.id, {
        ...txn,
        subCategoryId: internalSubCategoryId ?? txn.subCategoryId,
        isVendorMapped: true,
        confidenceScore: internalConfidence,
        anomalyFlag: isAnomaly,
        reviewStatus,
        aiNotes: isAnomaly ? `${internalAiNotes} ⚠ Audit flag: ${txn.status}.` : internalAiNotes
      });
    } else {
      toLLM.push(txn);
    }
  });

  // PHASE 2: LLM Intelligence classification
  if (toLLM.length > 0) {
    if (geminiKey) {
      console.log(`Sending ${toLLM.length} transactions to Gemini LLM...`);
      try {
        // We might want to chunk in real app, but for demo up to 50 is fine in one prompt
        const llmResults = await classifyWithGemini(toLLM, ledgerCategories, geminiKey);
        
        // Map results back
        const resultDict = new Map(llmResults.map(r => [r.transactionId, r]));

        toLLM.forEach(txn => {
          const llmData = resultDict.get(txn.id);
          const isAuditAnomaly = txn.status === "duplicate" || txn.status === "high-variance" || txn.status === "unused-saas";
          
          if (llmData) {
            llmMatches++;
            const finalAnomaly = llmData.anomalyFlag || isAuditAnomaly;
            const reviewStatus = determineReviewStatus(llmData.confidenceScore, finalAnomaly, threshold);
            if (reviewStatus === "needs_review") triaged++;

            let finalAiNotes = llmData.reasoning;
            if (isAuditAnomaly) {
              finalAiNotes += ` ⚠ Audit Engine flagged: ${txn.statusNote || txn.status}.`;
            }

            processedTxns.set(txn.id, {
              ...txn,
              subCategoryId: llmData.subCategoryId && llmData.subCategoryId !== "null" ? llmData.subCategoryId : txn.subCategoryId,
              isVendorMapped: false,
              confidenceScore: llmData.confidenceScore,
              anomalyFlag: finalAnomaly,
              reviewStatus,
              aiNotes: finalAiNotes
            });
          } else {
            // LLM failed to map this specific one for some reason
            unmatched++;
            processedTxns.set(txn.id, {
              ...txn,
              confidenceScore: 0.15,
              reviewStatus: "needs_review",
              anomalyFlag: isAuditAnomaly,
              aiNotes: "LLM Classification missed this item."
            });
            triaged++;
          }
        });

      } catch (err) {
        console.error("LLM Classification failed, falling back", err);
        toLLM.forEach(txn => {
          unmatched++;
          const isAuditAnomaly = txn.status === "duplicate" || txn.status === "high-variance";
          processedTxns.set(txn.id, {
            ...txn,
            confidenceScore: 0.20,
            reviewStatus: "needs_review",
            anomalyFlag: isAuditAnomaly,
            aiNotes: "Gemini AI failed to process this item. Please review."
          });
          triaged++;
        });
      }
    } else {
      // Fallback if no API key
      console.log(`No Gemini key, routing ${toLLM.length} txns to triage.`);
      toLLM.forEach(txn => {
        unmatched++;
        const isAuditAnomaly = txn.status === "duplicate" || txn.status === "high-variance";
        processedTxns.set(txn.id, {
          ...txn,
          confidenceScore: 0.10,
          reviewStatus: "needs_review",
          anomalyFlag: isAuditAnomaly,
          aiNotes: "No AI key provided. Require manual review."
        });
        triaged++;
      });
    }
  }

  // Preserve original ordering
  const classified = transactions.map(t => processedTxns.get(t.id) as Transaction);
  return { classified, stats: { ruleMatches, llmMatches, unmatched, triaged } };
}

/**
 * Deduplicate transactions by ID. Keeps the first occurrence.
 */
export function deduplicateTransactions(transactions: Transaction[]): { unique: Transaction[]; duplicateCount: number } {
  const seen = new Map<string, Transaction>();
  let duplicateCount = 0;

  for (const txn of transactions) {
    if (seen.has(txn.id)) {
      duplicateCount++;
    } else {
      seen.set(txn.id, txn);
    }
  }

  return { unique: Array.from(seen.values()), duplicateCount };
}
