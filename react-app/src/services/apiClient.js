const API_BASE_URL = "http://localhost:8080";

export async function apiRequest(path, { method = "GET", token, body, headers } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    const error = new Error("Session expired");
    error.status = 401;
    throw error;
  }

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Keep generic message.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export { API_BASE_URL };
