// src/lib/api/fetcher.ts

type ApiResponse<T> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function apiRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(
      json.success === false ? json.error : "Request failed",
    );
  }

  return json.data as T;
}

export const api = {
  get<T>(url: string) {
    return apiRequest<T>(url);
  },

  patch<T>(url: string, body: unknown) {
    return apiRequest<T>(url, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  post<T>(url: string, body: unknown) {
    return apiRequest<T>(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  delete<T = void>(url: string) {
    return apiRequest<T>(url, {
      method: "DELETE",
    });
  },
};