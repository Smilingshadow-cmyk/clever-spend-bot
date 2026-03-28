export interface Category {
  id: string;
  label: string;
  color: string;
  icon: string;
  keywords: string[];
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "food", label: "Food & Dining", color: "#f97316", icon: "🍽️", keywords: ["swiggy", "zomato", "sip n bite", "dockyard", "thick letto", "restaurant", "cafe", "food"] },
  { id: "transport", label: "Transport", color: "#3b82f6", icon: "🚗", keywords: ["uber", "ola", "rapido", "metro", "bus", "fuel", "petrol"] },
  { id: "shopping", label: "Shopping", color: "#8b5cf6", icon: "🛍️", keywords: ["amazon", "flipkart", "myntra", "micro solutions", "surya computer"] },
  { id: "family", label: "Family", color: "#ec4899", icon: "❤️", keywords: ["mummy", "mom", "dad", "papa", "home"] },
  { id: "education", label: "Education", color: "#10b981", icon: "📚", keywords: ["cgc", "chandigarh educatio", "college", "university", "fees", "tuition"] },
  { id: "recharge", label: "Recharge & Bills", color: "#f59e0b", icon: "📱", keywords: ["mobile recharge", "airtel", "jio", "electricity", "water bill", "bescom"] },
  { id: "transfer", label: "Transfers", color: "#6b7280", icon: "💸", keywords: ["received from", "paid to", "transfer", "upi"] },
  { id: "entertainment", label: "Entertainment", color: "#ef4444", icon: "🎬", keywords: ["netflix", "spotify", "hotstar", "prime video", "youtube"] },
  { id: "delivery", label: "Delivery", color: "#ef4444", icon: "📦", keywords: ["delhivery", "bluedart", "dtdc", "delivery"] },
  { id: "insurance", label: "Insurance", color: "#14b8a6", icon: "🛡️", keywords: ["insurance", "lic", "premium"] },
  { id: "investment", label: "Investment", color: "#22c55e", icon: "📈", keywords: ["mutual fund", "sip", "investment", "stock"] },
  { id: "grocery", label: "Grocery", color: "#84cc16", icon: "🛒", keywords: ["dmart", "bigbasket", "grocery", "supermarket"] },
  { id: "other", label: "Other", color: "#94a3b8", icon: "📌", keywords: [] },
];

const STORAGE_KEY_CATEGORIES = "spendguard_categories";
const STORAGE_KEY_OVERRIDES = "spendguard_category_overrides";

export function loadCategories(): Category[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories: Category[]) {
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
}

export function loadOverrides(): Record<string, string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_OVERRIDES);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

export function saveOverrides(overrides: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(overrides));
}

export function categorizeTransaction(description: string, categories: Category[]): { categoryId: string; confidence: "high" | "low" } {
  const lower = description.toLowerCase();
  for (const cat of categories) {
    if (cat.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      return { categoryId: cat.id, confidence: "high" };
    }
  }
  return { categoryId: "other", confidence: "low" };
}

export function getCategoryById(id: string, categories: Category[]): Category {
  return categories.find(c => c.id === id) || categories[categories.length - 1];
}
