import type { LLMResponse } from "../types/index.js";

export async function analyzeFeedback(
  text: string
): Promise<LLMResponse> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const prompt = `Analyze the following restaurant review and return a JSON object with exactly these fields:
- sentiment: "Positive", "Neutral", or "Negative"
- key_items: an array of strings mentioning food, service, ambience, or other topics
- requires_action: true if the review mentions food poisoning, severe complaints, health issues, or urgent problems; false otherwise

Review: "${text}"

Return ONLY the JSON object, no other text.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a restaurant review analyzer. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content received from Groq API");
  }

  try {
    const parsed = JSON.parse(content) as LLMResponse;

    if (!["Positive", "Neutral", "Negative"].includes(parsed.sentiment)) {
      parsed.sentiment = "Neutral";
    }

    if (!Array.isArray(parsed.key_items)) {
      parsed.key_items = [];
    }

    if (typeof parsed.requires_action !== "boolean") {
      parsed.requires_action = false;
    }

    return parsed;
  } catch {
    console.error("Failed to parse LLM response:", content);
    return {
      sentiment: "Neutral",
      key_items: [],
      requires_action: false,
    };
  }
}
