const BASE_URL = "http://localhost:3000";

export class ApiError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function api<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    let code: string | undefined;
    let message = `Request failed: ${response.statusText}`;

    if (text) {
      try {
        const errorBody = JSON.parse(text);
        code = errorBody.code;
        message = errorBody.message || message;
      } catch {
        // Response wasn't JSON, use default message
      }
    }

    throw new ApiError(message, response.status, code);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
}
