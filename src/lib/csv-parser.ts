import { Transaction } from "./types";

let idCounter = 1000;
const id = () => `txn-import-${++idCounter}`;

/**
 * Parse CSV text into Transaction objects.
 * Expected columns: date, vendor, category, department, amount
 * Flexible: tries to match common header names.
 */
export function parseCSV(text: string): Transaction[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));

  const colMap = {
    date: headers.findIndex((h) => ["date", "transaction_date", "trans_date", "txn_date"].includes(h)),
    vendor: headers.findIndex((h) => ["vendor", "merchant", "payee", "name", "description"].includes(h)),
    category: headers.findIndex((h) => ["category", "type", "expense_type", "expense_category"].includes(h)),
    department: headers.findIndex((h) => ["department", "dept", "team", "cost_center"].includes(h)),
    amount: headers.findIndex((h) => ["amount", "total", "cost", "value", "price"].includes(h)),
  };

  const transactions: Transaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);

    const date = colMap.date >= 0 ? cols[colMap.date]?.trim() : "";
    const vendor = colMap.vendor >= 0 ? cols[colMap.vendor]?.trim() : "Unknown";
    const category = colMap.category >= 0 ? cols[colMap.category]?.trim() : "General";
    const department = colMap.department >= 0 ? cols[colMap.department]?.trim() : "General";
    const amountStr = colMap.amount >= 0 ? cols[colMap.amount]?.trim() : "0";

    const amount = Math.abs(parseFloat(amountStr.replace(/[$,]/g, "")) || 0);

    if (!date || amount === 0) continue;

    transactions.push({
      id: id(),
      date,
      vendor,
      category,
      department,
      amount,
      riskLevel: "low",
      status: "clean",
    });
  }

  return transactions;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Extract text from a PDF using browser-based approach.
 * Falls back to basic text extraction from raw content.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const text = await file.text();
  // Try to extract readable lines from PDF text content
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/[^\x20-\x7E]/g, " ").trim())
    .filter((l) => l.length > 5);
  return lines.join("\n");
}

/**
 * Export transactions to CSV string
 */
export function exportToCSV(transactions: Transaction[]): string {
  const headers = ["Date", "Vendor", "Category", "Department", "Amount", "Risk Level", "Status", "Notes"];
  const rows = transactions.map((t) => [
    t.date,
    `"${t.vendor}"`,
    `"${t.category}"`,
    `"${t.department}"`,
    t.amount.toFixed(2),
    t.riskLevel,
    t.status,
    `"${t.statusNote || ""}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/**
 * Trigger a file download in the browser
 */
export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
