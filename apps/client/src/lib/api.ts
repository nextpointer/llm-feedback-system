const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("auth-storage");
  let parsedToken: string | null = null;

  if (token) {
    try {
      const authState = JSON.parse(token);
      parsedToken = authState?.state?.token || null;
    } catch {
      // ignore
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (parsedToken) {
    headers["Authorization"] = `Bearer ${parsedToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
