export async function simpleSummarize(text: string) {
  // Deterministic simple summarizer — for offline dev
  const lines = text.split("\n").slice(0, 5).join(" ");
  return `Auto-summary (stub): ${lines} -- (replace with real LLM / LangChain later)`;
}
