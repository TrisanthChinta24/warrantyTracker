import { apiRequest } from "./apiClient";

export function login(payload) {
  return apiRequest("/api/auth/login", { method: "POST", body: payload });
}

export function register(payload) {
  return apiRequest("/api/auth/register", { method: "POST", body: payload });
}
