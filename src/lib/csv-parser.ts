import { Transaction, TxnType } from "./types";

let idCounter = 1000;
const id = () => `txn-import-${++idCounter}`;

/**
 * Parse CSV text into Transaction objects.
 * Smart Parser: Scans down to find the header row, skipping bank summary junk at the top.
 */
export function parseCSV(text: string): Transaction[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  let headerRowIdx = -1;
  let colMap = { date: -1, time: -1, vendor: -1, category: -1, type: -1, amount: -1, creditAmt: -1, debitAmt: -1, txnId: -1, utr: -1, account: -1 };

  // Scan up to the first 25 rows to identify the actual table headers
  for (let i = 0; i < Math.min(lines.length, 25); i++) {
    const rawCols = parseCSVLine(lines[i]);
    const headers = rawCols.map(h => h.trim().toLowerCase().replace(/['"]/g, ""));

    const dateIdx = headers.findIndex(h => ["date", "transaction date", "transaction_date", "trans_date", "txn_date", "value date"].includes(h));
    const timeIdx = headers.findIndex(h => ["time", "transaction time", "txn_time"].includes(h));
    const vendorIdx = headers.findIndex(h => ["vendor", "merchant", "payee", "name", "description", "transaction details", "particulars", "narration", "remarks"].includes(h));
    
    const amountIdx = headers.findIndex(h => ["amount", "total", "cost", "value", "price", "transaction amount(inr)"].includes(h));
    const creditIdx = headers.findIndex(h => ["credit", "deposit", "cr", "deposit amt", "cr amount"].includes(h) || h.includes("deposit"));
    const debitIdx = headers.findIndex(h => ["debit", "withdrawal", "dr", "withdrawal amt", "dr amount"].includes(h) || h.includes("withdrawal"));
    const txnIdIdx = headers.findIndex(h => ["transaction id", "transaction_id", "txn_id", "txn id", "ref no", "reference", "ref"].includes(h));
    const utrIdx = headers.findIndex(h => ["utr", "utr no", "utr_no", "utr number"].includes(h));
    const accountIdx = headers.findIndex(h => ["account", "account no", "account_no", "account number", "a/c no"].includes(h));

    // We found the header row if it has Date AND (Vendor OR Amount)
    if (dateIdx >= 0 && (vendorIdx >= 0 || amountIdx >= 0 || creditIdx >= 0 || debitIdx >= 0)) {
      headerRowIdx = i;
      colMap = {
        date: dateIdx,
        time: timeIdx,
        vendor: vendorIdx,
        category: headers.findIndex(h => ["category", "expense_type", "expense_category"].includes(h)),
        type: headers.findIndex(h => ["type", "transaction_type", "cr/dr", "txn type"].includes(h)),
        amount: amountIdx,
        creditAmt: creditIdx,
        debitAmt: debitIdx,
        txnId: txnIdIdx,
        utr: utrIdx,
        account: accountIdx,
      };
      break;
    }
  }

  // If we couldn't confidently find a header, assume it's row 0 (legacy fallback)
  if (headerRowIdx === -1) headerRowIdx = 0;

  const transactions: Transaction[] = [];

  for (let i = headerRowIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);

    const date = colMap.date >= 0 ? cols[colMap.date]?.trim() : "";
    const time = colMap.time >= 0 ? cols[colMap.time]?.trim() : undefined;
    let vendor = colMap.vendor >= 0 ? cols[colMap.vendor]?.trim() : "Unknown";
    vendor = vendor.replace(/^(Paid to |Received from )/i, "");
    
    let txnType: TxnType = colMap.type >= 0 ? (cols[colMap.type]?.trim().toUpperCase() as TxnType) || "" : "";
    const category = colMap.category >= 0 ? cols[colMap.category]?.trim() : (txnType === "CREDIT" ? "Income" : "General");
    const transactionId = colMap.txnId >= 0 ? cols[colMap.txnId]?.trim() : undefined;
    const utrNumber = colMap.utr >= 0 ? cols[colMap.utr]?.trim() : undefined;
    const accountNumber = colMap.account >= 0 ? cols[colMap.account]?.trim() : undefined;

    // Amount extraction logic (handles single amount vs split credit/debit columns)
    let finalAmount = 0;
    
    if (colMap.creditAmt >= 0 && cols[colMap.creditAmt]?.trim()) {
      finalAmount = parseFloat(cols[colMap.creditAmt].replace(/[$,₹]/g, "")) || 0;
      if (finalAmount > 0) txnType = "CREDIT";
    } else if (colMap.debitAmt >= 0 && cols[colMap.debitAmt]?.trim()) {
      finalAmount = parseFloat(cols[colMap.debitAmt].replace(/[$,₹]/g, "")) || 0;
      if (finalAmount > 0) txnType = "DEBIT";
    } else if (colMap.amount >= 0) {
      const parsedAmt = parseFloat(cols[colMap.amount]?.trim().replace(/[$,₹]/g, "")) || 0;
      finalAmount = Math.abs(parsedAmt);
      if (parsedAmt > 0 && !txnType) txnType = "CREDIT";
      if (parsedAmt < 0 && !txnType) txnType = "DEBIT";
    }

    if (!date || finalAmount === 0 || Number.isNaN(finalAmount)) continue;

    finalAmount = Math.abs(finalAmount);

    // Use bank transactionId as the unique ID if available, otherwise generate
    const txnId = transactionId || id();

    transactions.push({
      id: txnId,
      date,
      time,
      vendor: vendor || "Unknown Vendor",
      category,
      amount: finalAmount,
      txnType,
      transactionId,
      utrNumber,
      accountNumber,
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
 * Export transactions to CSV string
 */
export function exportToCSV(transactions: Transaction[]): string {
  const headers = ["Date", "Time", "Vendor", "Category", "Amount", "Type", "Transaction ID", "UTR", "Account", "Risk Level", "Status", "Notes"];
  const rows = transactions.map((t) => [
    t.date,
    t.time || "",
    `"${t.vendor}"`,
    `"${t.category}"`,
    t.amount.toFixed(2),
    t.txnType || "",
    t.transactionId || "",
    t.utrNumber || "",
    t.accountNumber || "",
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
