import { Transaction, LedgerCategory } from "./types";

interface LLMClassificationResult {
  transactionId: string;
  subCategoryId: string | null;
  confidenceScore: number;
  anomalyFlag: boolean;
  reasoning: string;
}

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Builds the prompt sending the transaction batch and the available categories.
 */
function buildPrompt(transactions: Transaction[], categories: LedgerCategory[]): string {
  const categoryContext = categories.map(cat => {
    return `Category: ${cat.name}\nSubcategories:\n` + cat.subCategories.map(sub => 
      `- ID: "${sub.id}" | Name: "${sub.name}" | Keywords/Desc: "${sub.descriptionOrExamples || ''}"`
    ).join('\n');
  }).join('\n\n');

  const transactionData = transactions.map(t => ({
    id: t.id,
    vendor: t.vendor,
    amount: t.amount,
    date: t.date,
    originalCategory: t.category
  }));

  return `
You are an expert financial auditor named SpendGuard AI.
I am providing you with a list of available subcategories and a list of transactions.
Your task is to classify EACH transaction into the MOST APPROPRIate subcategory ID, evaluate anomaly risk, and provide reasoning.

AVAILABLE CATEGORIES:
${categoryContext}

TRANSACTIONS TO CLASSIFY:
${JSON.stringify(transactionData, null, 2)}

INSTRUCTIONS:
1. "subCategoryId": Must be the EXACT ID string of the best subcategory from the list above. If nothing fits at all, use null.
2. "confidenceScore": A float between 0.0 and 1.0 representing how confident you are in this classification.
3. "anomalyFlag": true or false. Set to true if the transaction seems suspicious, unusually large, or like a duplicate (if you can infer context, though you only see one batch).
4. "reasoning": A short 1-sentence explanation of why you chose the category or flagged it.

OUTPUT FORMAT:
You MUST respond with ONLY a valid JSON array of objects, with NO markdown formatting, NO backticks like \`\`\`json, and NO extra text.
Example format:
[
  {
    "transactionId": "txn_123",
    "subCategoryId": "sub_456",
    "confidenceScore": 0.95,
    "anomalyFlag": false,
    "reasoning": "Vendor perfectly matches SaaS subscription pattern."
  }
]
`;
}

/**
 * Calls the Gemini API via fetch.
 */
export async function classifyWithGemini(
  transactions: Transaction[],
  categories: LedgerCategory[],
  apiKey: string
): Promise<LLMClassificationResult[]> {
  if (!transactions.length) return [];
  if (!apiKey) throw new Error("Missing Gemini API Key");

  const prompt = buildPrompt(transactions, categories);

  const requestBody = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.1, // Keep it deterministic
    }
  };

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", response.status, errorText);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error("Invalid response structure from Gemini");
    }

    // Clean up potential markdown formatting if the model disobeys instructions
    text = text.trim();
    if (text.startsWith("```json")) text = text.replace(/^```json/, "");
    if (text.startsWith("```")) text = text.replace(/^```/, "");
    if (text.endsWith("```")) text = text.replace(/```$/, "");

    const parsed: LLMClassificationResult[] = JSON.parse(text);
    return parsed;
  } catch (err) {
    console.error("Failed to parse or fetch Gemini classification:", err);
    throw err;
  }
}
