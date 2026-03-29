import { Transaction, MonthlySpend, CategorySpend } from "./types";

let idCounter = 0;
const id = () => `txn-${++idCounter}`;

export const generateSeedTransactions = (): Transaction[] => {
  idCounter = 0;
  return [
    { id: id(), date: "2024-01-03", vendor: "AWS", category: "Cloud Infrastructure", amount: 12450, txnType: "DEBIT", riskLevel: "low", status: "clean",
      confidenceScore: 0.97, anomalyFlag: false, reviewStatus: "auto_approved", aiNotes: "Recurring AWS charge matches historical pattern." },
    { id: id(), date: "2024-01-05", vendor: "Slack", category: "Subscription", amount: 1200, txnType: "DEBIT", riskLevel: "low", status: "clean",
      confidenceScore: 0.95, anomalyFlag: false, reviewStatus: "auto_approved", aiNotes: "Standard Slack billing cycle." },
    { id: id(), date: "2024-01-05", vendor: "Slack", category: "Subscription", amount: 1200, txnType: "DEBIT", riskLevel: "high", status: "duplicate", statusNote: "Duplicate charge within 3 days",
      confidenceScore: 0.42, anomalyFlag: true, reviewStatus: "needs_review", aiNotes: "Duplicate charge detected — same vendor + amount within 3 days. Likely a billing error." },
    { id: id(), date: "2024-01-08", vendor: "Zoom", category: "Subscription", amount: 540, txnType: "DEBIT", riskLevel: "medium", status: "unused-saas", statusNote: "Low usage detected — 2 meetings/month",
      confidenceScore: 0.68, anomalyFlag: true, reviewStatus: "needs_review", aiNotes: "Usage data shows only 2 meetings/month. Cost appears disproportionate to usage." },
    { id: id(), date: "2024-01-10", vendor: "Google Workspace", category: "Subscription", amount: 2880, txnType: "DEBIT", riskLevel: "low", status: "clean",
      confidenceScore: 0.93, anomalyFlag: false, reviewStatus: "auto_approved", aiNotes: "Google Workspace annual billing — consistent with last year." },
    { id: id(), date: "2024-01-12", vendor: "Figma", category: "Design Tools", amount: 720, txnType: "DEBIT", riskLevel: "low", status: "clean",
      confidenceScore: 0.91, anomalyFlag: false, reviewStatus: "auto_approved", aiNotes: "Standard Figma team license." },
    { id: id(), date: "2024-01-14", vendor: "HubSpot", category: "CRM", amount: 4800, txnType: "DEBIT", riskLevel: "low", status: "clean",
      confidenceScore: 0.88, anomalyFlag: false, reviewStatus: "auto_approved", aiNotes: "HubSpot CRM subscription — matched by vendor rule." },
    { id: id(), date: "2024-01-15", vendor: "AWS", category: "Cloud Infrastructure", amount: 18900, txnType: "DEBIT", riskLevel: "high", status: "high-variance", statusNote: "52% above 3-month average",
      confidenceScore: 0.55, anomalyFlag: true, reviewStatus: "needs_review", aiNotes: "AWS charge is 52% above the 3-month average. Possible over-provisioning or unexpected scale-up." },
    { id: id(), date: "2024-01-18", vendor: "Notion", category: "Subscription", amount: 480, txnType: "DEBIT", riskLevel: "low", status: "clean",
      confidenceScore: 0.94, anomalyFlag: false, reviewStatus: "auto_approved", aiNotes: "Notion team plan — matches known vendor." },
    { id: id(), date: "2024-01-20", vendor: "Datadog", category: "Monitoring", amount: 3200, txnType: "DEBIT", riskLevel: "low", status: "clean",
      confidenceScore: 0.90, anomalyFlag: false, reviewStatus: "auto_approved", aiNotes: "Datadog monitoring subscription within expected range." },
    { id: id(), date: "2024-01-22", vendor: "Adobe Creative Cloud", category: "Design Tools", amount: 1680, txnType: "DEBIT", riskLevel: "medium", status: "unused-saas", statusNote: "Only 1 active user of 5 licenses",
      confidenceScore: 0.62, anomalyFlag: true, reviewStatus: "needs_review", aiNotes: "5 seats purchased but only 1 active user. Recommend downsizing to save ~₹1,344/yr." },
    { id: id(), date: "2024-01-25", vendor: "Salesforce", category: "CRM", amount: 7200, txnType: "DEBIT", riskLevel: "low", status: "clean",
      confidenceScore: 0.92, anomalyFlag: false, reviewStatus: "auto_approved", aiNotes: "Salesforce enterprise license — within budget." },
    { id: id(), date: "2024-01-26", vendor: "Salesforce", category: "CRM", amount: 7200, txnType: "DEBIT", riskLevel: "high", status: "duplicate", statusNote: "Duplicate charge within 3 days",
      confidenceScore: 0.38, anomalyFlag: true, reviewStatus: "needs_review", aiNotes: "Duplicate Salesforce charge detected. Same amount billed 1 day apart — contact vendor." },
    { id: id(), date: "2024-01-28", vendor: "WeWork", category: "Office Space", amount: 15000, txnType: "DEBIT", riskLevel: "low", status: "clean",
      confidenceScore: 0.96, anomalyFlag: false, reviewStatus: "auto_approved", aiNotes: "Monthly WeWork office lease payment — consistent." },
    { id: id(), date: "2024-02-01", vendor: "AWS", category: "Cloud Infrastructure", amount: 13100, txnType: "DEBIT", riskLevel: "low", status: "clean",
      confidenceScore: 0.89, anomalyFlag: false, reviewStatus: "auto_approved", aiNotes: "February AWS bill within expected range." },
    { id: id(), date: "2024-02-03", vendor: "GitHub", category: "Dev Tools", amount: 840, txnType: "DEBIT", riskLevel: "low", status: "clean",
      confidenceScore: 0.94, anomalyFlag: false, reviewStatus: "auto_approved", aiNotes: "GitHub Enterprise subscription — standard." },
    { id: id(), date: "2024-02-05", vendor: "Jira", category: "Subscription", amount: 960, txnType: "DEBIT", riskLevel: "medium", status: "unused-saas", statusNote: "Team migrated to Linear",
      confidenceScore: 0.71, anomalyFlag: true, reviewStatus: "needs_review", aiNotes: "Jira is still being billed but team migrated to Linear. Cancel to save ₹960/mo." },
    { id: id(), date: "2024-02-08", vendor: "Linear", category: "Subscription", amount: 480, txnType: "DEBIT", riskLevel: "low", status: "clean",
      confidenceScore: 0.88, anomalyFlag: false, reviewStatus: "auto_approved", aiNotes: "Linear team plan — actively used." },
    { id: id(), date: "2024-02-10", vendor: "Intercom", category: "Customer Support", amount: 3600, txnType: "DEBIT", riskLevel: "low", status: "clean",
      confidenceScore: 0.90, anomalyFlag: false, reviewStatus: "auto_approved", aiNotes: "Intercom customer support platform — standard billing." },
    { id: id(), date: "2024-02-12", vendor: "Twilio", category: "Communications", amount: 890, txnType: "DEBIT", riskLevel: "low", status: "clean",
      confidenceScore: 0.87, anomalyFlag: false, reviewStatus: "auto_approved", aiNotes: "Twilio usage-based billing — within historical norm." },
    { id: id(), date: "2024-02-15", vendor: "Stripe", category: "Payment Processing", amount: 2340, txnType: "DEBIT", riskLevel: "low", status: "clean",
      confidenceScore: 0.93, anomalyFlag: false, reviewStatus: "auto_approved", aiNotes: "Stripe processing fees — proportional to transaction volume." },
    { id: id(), date: "2024-02-18", vendor: "Grammarly", category: "Subscription", amount: 360, txnType: "DEBIT", riskLevel: "medium", status: "flagged", statusNote: "Free tier available",
      confidenceScore: 0.78, anomalyFlag: false, reviewStatus: "needs_review", aiNotes: "Grammarly paid plan in use, but free tier may cover team needs. Review usage." },
    { id: id(), date: "2024-02-20", vendor: "Zapier", category: "Automation", amount: 1200, txnType: "DEBIT", riskLevel: "low", status: "clean",
      confidenceScore: 0.86, anomalyFlag: false, reviewStatus: "auto_approved", aiNotes: "Zapier automation service — within budget." },
    { id: id(), date: "2024-02-22", vendor: "Cloudflare", category: "Cloud Infrastructure", amount: 450, txnType: "DEBIT", riskLevel: "low", status: "clean",
      confidenceScore: 0.95, anomalyFlag: false, reviewStatus: "auto_approved", aiNotes: "Cloudflare CDN service — minimal and expected." },
    { id: id(), date: "2024-02-25", vendor: "Monday.com", category: "Subscription", amount: 720, txnType: "DEBIT", riskLevel: "medium", status: "unused-saas", statusNote: "Overlaps with Notion functionality",
      confidenceScore: 0.59, anomalyFlag: true, reviewStatus: "needs_review", aiNotes: "Monday.com overlaps with Notion functionality. Consolidating could save ₹720/mo." },
  ];
};

export const generateMonthlySpend = (): MonthlySpend[] => [
  { month: "Aug", amount: 68200 },
  { month: "Sep", amount: 72100 },
  { month: "Oct", amount: 69800 },
  { month: "Nov", amount: 74500 },
  { month: "Dec", amount: 78900 },
  { month: "Jan", amount: 95100 },
  { month: "Feb", amount: 88400 },
];

export const generateCategorySpend = (): CategorySpend[] => [
  { category: "Cloud Infrastructure", amount: 44900 },
  { category: "Subscription", amount: 12600 },
  { category: "CRM", amount: 19200 },
  { category: "Design Tools", amount: 2400 },
  { category: "Office Space", amount: 15000 },
  { category: "Monitoring", amount: 3200 },
  { category: "Customer Support", amount: 3600 },
  { category: "Dev Tools", amount: 2280 },
  { category: "Payment Processing", amount: 2340 },
  { category: "Marketing Tools", amount: 2760 },
];
