export interface User {
  id: number;
  email: string;
  password: string;
  role: string;
  created_at: Date;
}

export interface Feedback {
  id: number;
  raw_text: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  key_items: string[];
  requires_action: boolean;
  created_at: Date;
}

export interface LLMResponse {
  sentiment: "Positive" | "Neutral" | "Negative";
  key_items: string[];
  requires_action: boolean;
}

export interface AuthPayload {
  userId: number;
  email: string;
  role: string;
}
