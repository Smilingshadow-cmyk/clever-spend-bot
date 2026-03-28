export interface BankTransaction {
  date: string;
  details: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
}

export type BankId = "hdfc" | "sbi" | "icici";

export const BANKS: { id: BankId; name: string; color: string }[] = [
  { id: "hdfc", name: "HDFC Bank", color: "#004B87" },
  { id: "sbi", name: "SBI", color: "#1A5276" },
  { id: "icici", name: "ICICI Bank", color: "#F58220" },
];

const MOCK_STATEMENTS: Record<BankId, BankTransaction[]> = {
  hdfc: [
    { date: "Mar 28 2026", details: "Amazon India", type: "DEBIT", amount: 1299 },
    { date: "Mar 27 2026", details: "Salary Credit HDFC", type: "CREDIT", amount: 45000 },
    { date: "Mar 26 2026", details: "Swiggy Order", type: "DEBIT", amount: 340 },
    { date: "Mar 25 2026", details: "Mobile Recharge Airtel", type: "DEBIT", amount: 353 },
    { date: "Mar 24 2026", details: "Uber Ride", type: "DEBIT", amount: 180 },
    { date: "Mar 22 2026", details: "Flipkart Purchase", type: "DEBIT", amount: 2199 },
    { date: "Mar 20 2026", details: "ATM Withdrawal", type: "DEBIT", amount: 5000 },
    { date: "Mar 18 2026", details: "Netflix Subscription", type: "DEBIT", amount: 649 },
    { date: "Mar 15 2026", details: "Zomato Order", type: "DEBIT", amount: 450 },
    { date: "Mar 10 2026", details: "Electricity Bill BESCOM", type: "DEBIT", amount: 1240 },
  ],
  sbi: [
    { date: "Mar 28 2026", details: "UPI Transfer Received", type: "CREDIT", amount: 2000 },
    { date: "Mar 27 2026", details: "Grocery DMart", type: "DEBIT", amount: 1870 },
    { date: "Mar 25 2026", details: "College Fees Payment", type: "DEBIT", amount: 12000 },
    { date: "Mar 20 2026", details: "Salary Credit SBI", type: "CREDIT", amount: 38000 },
    { date: "Mar 15 2026", details: "Insurance Premium LIC", type: "DEBIT", amount: 3500 },
  ],
  icici: [
    { date: "Mar 28 2026", details: "BigBasket Order", type: "DEBIT", amount: 2340 },
    { date: "Mar 25 2026", details: "Credit Card Payment", type: "DEBIT", amount: 8000 },
    { date: "Mar 20 2026", details: "Salary ICICI", type: "CREDIT", amount: 52000 },
    { date: "Mar 10 2026", details: "Mutual Fund SIP", type: "DEBIT", amount: 5000 },
  ],
};

export async function fetchBankStatements(bankId: BankId): Promise<BankTransaction[]> {
  await new Promise(r => setTimeout(r, 1500));
  return MOCK_STATEMENTS[bankId] || [];
}

export function bankTransactionsToCSV(transactions: BankTransaction[]): string {
  const header = "Date,Transaction Details,Type,Amount";
  const rows = transactions.map(t => `${t.date},"${t.details}",${t.type},${t.amount}`);
  return [header, ...rows].join("\n");
}
