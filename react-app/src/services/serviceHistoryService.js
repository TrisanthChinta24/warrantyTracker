import { apiRequest } from "./apiClient";

export const getAllServiceHistory = (token) => apiRequest("/api/service-history", { token });

export const createServiceHistory = (payload, token) => {
  const formData = new FormData();
  formData.append("warrantyId", payload.warrantyId);
  formData.append("serviceDate", payload.serviceDate);
  formData.append("description", payload.description);
  if (payload.cost) formData.append("cost", payload.cost);
  payload.documents.forEach((file) => formData.append("documents", file));
  return apiRequest("/api/service-history", { method: "POST", token, body: formData });
};

export const deleteServiceHistory = (id, token) =>
  apiRequest(`/api/service-history/${id}`, { method: "DELETE", token });
