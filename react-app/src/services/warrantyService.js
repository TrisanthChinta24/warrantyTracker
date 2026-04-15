import { apiRequest } from "./apiClient";

export const getWarranties = (token) => apiRequest("/api/warranties", { token });
export const getWarrantyById = (id, token) => apiRequest(`/api/warranties/${id}`, { token });
export const deleteWarrantyById = (id, token) =>
  apiRequest(`/api/warranties/${id}`, { method: "DELETE", token });

export const createWarranty = (formData, token) =>
  apiRequest("/api/warranties", { method: "POST", token, body: formData });
export const updateWarranty = (id, formData, token) =>
  apiRequest(`/api/warranties/${id}`, { method: "PUT", token, body: formData });

export const runOcr = (file, token) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest("/api/ocr", { method: "POST", token, body: formData });
};

export const renameAttachment = (warrantyId, index, newName, token) =>
  apiRequest(`/api/warranties/${warrantyId}/attachment/name`, {
    method: "PUT",
    token,
    body: { index, newName },
  });

export const deleteAttachment = (warrantyId, index, diskPath, token) =>
  apiRequest(`/api/warranties/${warrantyId}/attachment`, {
    method: "DELETE",
    token,
    body: { index, diskPath },
  });
