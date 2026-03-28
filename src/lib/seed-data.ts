import { Transaction, MonthlySpend, CategorySpend } from "./types";

let idCounter = 0;
const id = () => `txn-${++idCounter}`;

export const generateSeedTransactions = (): Transaction[] => {
  idCounter = 0;
  return [
    { id: id(), date: "2024-01-03", vendor: "AWS", category: "Cloud Infrastructure", department: "Engineering", amount: 12450, riskLevel: "low", status: "clean" },
    { id: id(), date: "2024-01-05", vendor: "Slack", category: "Subscription", department: "Operations", amount: 1200, riskLevel: "low", status: "clean" },
    { id: id(), date: "2024-01-05", vendor: "Slack", category: "Subscription", department: "Operations", amount: 1200, riskLevel: "high", status: "duplicate", statusNote: "Duplicate charge within 3 days" },
    { id: id(), date: "2024-01-08", vendor: "Zoom", category: "Subscription", department: "Sales", amount: 540, riskLevel: "medium", status: "unused-saas", statusNote: "Low usage detected — 2 meetings/month" },
    { id: id(), date: "2024-01-10", vendor: "Google Workspace", category: "Subscription", department: "Operations", amount: 2880, riskLevel: "low", status: "clean" },
    { id: id(), date: "2024-01-12", vendor: "Figma", category: "Design Tools", department: "Design", amount: 720, riskLevel: "low", status: "clean" },
    { id: id(), date: "2024-01-14", vendor: "HubSpot", category: "CRM", department: "Sales", amount: 4800, riskLevel: "low", status: "clean" },
    { id: id(), date: "2024-01-15", vendor: "AWS", category: "Cloud Infrastructure", department: "Engineering", amount: 18900, riskLevel: "high", status: "high-variance", statusNote: "52% above 3-month average" },
    { id: id(), date: "2024-01-18", vendor: "Notion", category: "Subscription", department: "Operations", amount: 480, riskLevel: "low", status: "clean" },
    { id: id(), date: "2024-01-20", vendor: "Datadog", category: "Monitoring", department: "Engineering", amount: 3200, riskLevel: "low", status: "clean" },
    { id: id(), date: "2024-01-22", vendor: "Adobe Creative Cloud", category: "Design Tools", department: "Marketing", amount: 1680, riskLevel: "medium", status: "unused-saas", statusNote: "Only 1 active user of 5 licenses" },
    { id: id(), date: "2024-01-25", vendor: "Salesforce", category: "CRM", department: "Sales", amount: 7200, riskLevel: "low", status: "clean" },
    { id: id(), date: "2024-01-26", vendor: "Salesforce", category: "CRM", department: "Sales", amount: 7200, riskLevel: "high", status: "duplicate", statusNote: "Duplicate charge within 3 days" },
    { id: id(), date: "2024-01-28", vendor: "WeWork", category: "Office Space", department: "Operations", amount: 15000, riskLevel: "low", status: "clean" },
    { id: id(), date: "2024-02-01", vendor: "AWS", category: "Cloud Infrastructure", department: "Engineering", amount: 13100, riskLevel: "low", status: "clean" },
    { id: id(), date: "2024-02-03", vendor: "GitHub", category: "Dev Tools", department: "Engineering", amount: 840, riskLevel: "low", status: "clean" },
    { id: id(), date: "2024-02-05", vendor: "Jira", category: "Subscription", department: "Engineering", amount: 960, riskLevel: "medium", status: "unused-saas", statusNote: "Team migrated to Linear" },
    { id: id(), date: "2024-02-08", vendor: "Linear", category: "Subscription", department: "Engineering", amount: 480, riskLevel: "low", status: "clean" },
    { id: id(), date: "2024-02-10", vendor: "Intercom", category: "Customer Support", department: "Support", amount: 3600, riskLevel: "low", status: "clean" },
    { id: id(), date: "2024-02-12", vendor: "Twilio", category: "Communications", department: "Engineering", amount: 890, riskLevel: "low", status: "clean" },
    { id: id(), date: "2024-02-15", vendor: "Stripe", category: "Payment Processing", department: "Finance", amount: 2340, riskLevel: "low", status: "clean" },
    { id: id(), date: "2024-02-18", vendor: "Grammarly", category: "Subscription", department: "Marketing", amount: 360, riskLevel: "medium", status: "flagged", statusNote: "Free tier available" },
    { id: id(), date: "2024-02-20", vendor: "Zapier", category: "Automation", department: "Operations", amount: 1200, riskLevel: "low", status: "clean" },
    { id: id(), date: "2024-02-22", vendor: "Cloudflare", category: "Cloud Infrastructure", department: "Engineering", amount: 450, riskLevel: "low", status: "clean" },
    { id: id(), date: "2024-02-25", vendor: "Monday.com", category: "Subscription", department: "Marketing", amount: 720, riskLevel: "medium", status: "unused-saas", statusNote: "Overlaps with Notion functionality" },
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
  { category: "Cloud Infrastructure", amount: 44900, department: "Engineering" },
  { category: "Subscription", amount: 12600, department: "Operations" },
  { category: "CRM", amount: 19200, department: "Sales" },
  { category: "Design Tools", amount: 2400, department: "Design" },
  { category: "Office Space", amount: 15000, department: "Operations" },
  { category: "Monitoring", amount: 3200, department: "Engineering" },
  { category: "Customer Support", amount: 3600, department: "Support" },
  { category: "Dev Tools", amount: 2280, department: "Engineering" },
  { category: "Payment Processing", amount: 2340, department: "Finance" },
  { category: "Marketing Tools", amount: 2760, department: "Marketing" },
];
