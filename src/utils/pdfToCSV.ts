export async function pdfToCSV(file: File): Promise<string> {
  const base64 = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res((r.result as string).split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Anthropic API key not configured. Set VITE_ANTHROPIC_API_KEY in your environment.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64 },
          },
          {
            type: "text",
            text: `Extract ALL transactions from this bank/payment statement PDF.
Return ONLY a CSV with these exact columns: Date, Transaction Details, Type, Amount.
Rules:
- First row = headers exactly as above
- No markdown, no code blocks, no explanation
- Amounts as plain numbers without currency symbols
- Type column values must be either CREDIT or DEBIT
- One transaction per row`,
          },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI PDF conversion failed: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.content[0].text.replace(/```[a-z]*\n?/gi, "").trim();
}
