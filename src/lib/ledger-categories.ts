import { LedgerCategory, VendorRule } from "./types";

const generateId = () => Math.random().toString(36).substring(2, 9);

export const MASTER_CATEGORIES: LedgerCategory[] = [
  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS LEDGER
  // ═══════════════════════════════════════════════════════════════════
  {
    id: generateId(), name: "Revenue", ledgerType: "Business",
    subCategories: [
      { id: generateId(), name: "Product / Service Sales", descriptionOrExamples: "Sales of finished goods, services rendered" },
      { id: generateId(), name: "Consulting & Project Fees", descriptionOrExamples: "Client project fees, advisory retainers" },
      { id: generateId(), name: "Recurring Subscriptions (incoming)", descriptionOrExamples: "Monthly/annual subscription revenue from customers" },
      { id: generateId(), name: "Refunds & Reversals", descriptionOrExamples: "Customer refunds, chargebacks, credit notes issued" },
    ]
  },
  {
    id: generateId(), name: "Cost of Goods Sold (COGS)", ledgerType: "Business",
    subCategories: [
      { id: generateId(), name: "Raw Materials & Inventory", descriptionOrExamples: "Confectionery, jewelry parts, raw stock purchases" },
      { id: generateId(), name: "Manufacturing & Assembly", descriptionOrExamples: "Assembly labor, production costs" },
      { id: generateId(), name: "Packaging & Fulfillment", descriptionOrExamples: "Gift boxes, ribbons, bubble wrap, custom inserts" },
      { id: generateId(), name: "Supplier Payments", descriptionOrExamples: "Direct payments to goods suppliers and vendors" },
    ]
  },
  {
    id: generateId(), name: "Operating Expenses", ledgerType: "Business",
    subCategories: [
      { id: generateId(), name: "SaaS & Software Subscriptions", descriptionOrExamples: "Slack, Notion, Figma, Zoom, Adobe, Canva" },
      { id: generateId(), name: "Cloud Infrastructure", descriptionOrExamples: "AWS, GCP, Azure, Vercel, DigitalOcean" },
      { id: generateId(), name: "Marketing & Advertising", descriptionOrExamples: "Meta Ads, Google Ads, Influencer, PR, Brand kits" },
      { id: generateId(), name: "Office & Admin", descriptionOrExamples: "Stationery, printing, supplies, desk equipment" },
      { id: generateId(), name: "Rent & Facilities", descriptionOrExamples: "Office rent, coworking, maintenance, AMC" },
      { id: generateId(), name: "Utilities", descriptionOrExamples: "Electricity, internet, mobile plans, water" },
      { id: generateId(), name: "Logistics & Courier", descriptionOrExamples: "Shipping, delivery, last-mile, Delhivery, BlueDart" },
      { id: generateId(), name: "Travel & Accommodation", descriptionOrExamples: "Flights, hotels, cab reimbursements, IndiGo, Uber" },
      { id: generateId(), name: "Meals & Entertainment", descriptionOrExamples: "Team lunches, client dinners, offsites" },
      { id: generateId(), name: "Recruitment & HR", descriptionOrExamples: "Job postings, background checks, onboarding costs" },
      { id: generateId(), name: "Legal & Compliance", descriptionOrExamples: "Lawyer fees, filings, annual audits, trademark" },
      { id: generateId(), name: "Insurance", descriptionOrExamples: "Office, equipment, liability, health (group)" },
    ]
  },
  {
    id: generateId(), name: "Payroll & Contractor Payments", ledgerType: "Business",
    subCategories: [
      { id: generateId(), name: "Full-Time Employee Salaries", descriptionOrExamples: "Monthly payroll, PF, ESI contributions" },
      { id: generateId(), name: "Contractor & Freelancer Payments", descriptionOrExamples: "Freelance designers, devs, consultants" },
      { id: generateId(), name: "Bonuses & Incentives", descriptionOrExamples: "Performance bonuses, festival bonuses, ESOPs" },
      { id: generateId(), name: "Reimbursements", descriptionOrExamples: "Employee expense claims, travel reimbursements" },
    ]
  },
  {
    id: generateId(), name: "Taxes & Regulatory", ledgerType: "Business",
    subCategories: [
      { id: generateId(), name: "GST / TDS Payments", descriptionOrExamples: "GSTR filings, TDS deductions remitted to govt" },
      { id: generateId(), name: "Advance Tax", descriptionOrExamples: "Quarterly advance tax installments" },
      { id: generateId(), name: "Professional Tax", descriptionOrExamples: "State-level professional tax deductions" },
      { id: generateId(), name: "ROC / MCA Filings", descriptionOrExamples: "Annual return filings, compliance fees" },
    ]
  },
  {
    id: generateId(), name: "Bank & Financial Charges", ledgerType: "Business",
    subCategories: [
      { id: generateId(), name: "Transaction Fees", descriptionOrExamples: "Razorpay, Stripe, PayPal, UPI gateway fees" },
      { id: generateId(), name: "Bank Maintenance Charges", descriptionOrExamples: "Account maintenance, minimum balance charges" },
      { id: generateId(), name: "Wire Transfer Fees", descriptionOrExamples: "NEFT/RTGS/SWIFT charges" },
      { id: generateId(), name: "Loan EMIs", descriptionOrExamples: "Business loan, equipment loan EMI payments" },
      { id: generateId(), name: "Interest Payments", descriptionOrExamples: "Interest on loans, overdraft, credit lines" },
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  // BALANCE SHEET
  // ═══════════════════════════════════════════════════════════════════
  {
    id: generateId(), name: "Assets", ledgerType: "Balance Sheet",
    subCategories: [
      { id: generateId(), name: "Liquid Cash", descriptionOrExamples: "Current account, savings, fixed deposits" },
      { id: generateId(), name: "Accounts Receivable", descriptionOrExamples: "Unpaid client invoices, outstanding payments" },
      { id: generateId(), name: "Inventory Asset", descriptionOrExamples: "Unsold goods, raw materials in stock" },
      { id: generateId(), name: "Fixed Assets", descriptionOrExamples: "Laptops, servers, office equipment, furniture" },
      { id: generateId(), name: "Depreciation", descriptionOrExamples: "Annual value loss on fixed assets" },
      { id: generateId(), name: "Security Deposits", descriptionOrExamples: "Office rent deposit, vendor advances" },
    ]
  },
  {
    id: generateId(), name: "Liabilities", ledgerType: "Balance Sheet",
    subCategories: [
      { id: generateId(), name: "Accounts Payable", descriptionOrExamples: "Unpaid vendor invoices, outstanding bills" },
      { id: generateId(), name: "Short-Term Debt", descriptionOrExamples: "Credit card balances, overdraft" },
      { id: generateId(), name: "Long-Term Debt", descriptionOrExamples: "Business loans, equipment financing" },
      { id: generateId(), name: "GST Payable", descriptionOrExamples: "GST collected but not yet remitted" },
      { id: generateId(), name: "TDS Payable", descriptionOrExamples: "TDS deducted but not yet deposited" },
    ]
  },
  {
    id: generateId(), name: "Equity", ledgerType: "Balance Sheet",
    subCategories: [
      { id: generateId(), name: "Founder's Capital", descriptionOrExamples: "Money invested to start/run the company" },
      { id: generateId(), name: "Retained Earnings", descriptionOrExamples: "Profits kept in the business for growth" },
      { id: generateId(), name: "Drawings", descriptionOrExamples: "Money taken out by founders for personal use" },
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  // ANOMALY / REVIEW
  // ═══════════════════════════════════════════════════════════════════
  {
    id: generateId(), name: "Flagged Transactions", ledgerType: "Anomaly",
    subCategories: [
      { id: generateId(), name: "Uncategorized", descriptionOrExamples: "Holding pen for unmatched transactions" },
      { id: generateId(), name: "Duplicate Suspected", descriptionOrExamples: "Same vendor, same amount, close dates" },
      { id: generateId(), name: "Unusual Amount", descriptionOrExamples: "3x above average for this vendor/category" },
      { id: generateId(), name: "Missing Invoice", descriptionOrExamples: "Payment made, no invoice on record" },
      { id: generateId(), name: "Unknown Vendor", descriptionOrExamples: "Payee not in approved vendor list" },
      { id: generateId(), name: "Foreign Transaction", descriptionOrExamples: "International wire, currency conversion" },
    ]
  },
];

const STORAGE_KEY_LEDGER = "spendguard_ledger_categories";
const STORAGE_KEY_RULES = "spendguard_vendor_rules";

export function loadLedgerCategories(): LedgerCategory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LEDGER);
    if (stored) return JSON.parse(stored);
  } catch {
    // Fallback appropriately if JSON parse fails
  }
  return MASTER_CATEGORIES;
}

export function saveLedgerCategories(categories: LedgerCategory[]) {
  localStorage.setItem(STORAGE_KEY_LEDGER, JSON.stringify(categories));
}

export function loadVendorRules(): VendorRule[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_RULES);
    if (stored) return JSON.parse(stored);
  } catch {
    // Fallback appropriately if JSON parse fails
  }
  return [];
}

export function saveVendorRules(rules: VendorRule[]) {
  localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules));
}
