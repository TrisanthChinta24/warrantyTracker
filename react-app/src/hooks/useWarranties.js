import { useMemo } from "react";

export function useWarranties(warranties, searchTerm, filterMode, sortMode = "soonest") {
  return useMemo(() => {
    const now = Date.now();
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = warranties.filter((warranty) => {
      const nameMatch =
        warranty.productName?.toLowerCase().includes(normalizedSearch) ||
        warranty.vendor?.toLowerCase().includes(normalizedSearch) ||
        warranty.brand?.toLowerCase().includes(normalizedSearch);

      if (!nameMatch) return false;

      const remainingDays = Math.ceil(
        (new Date(warranty.expiryDate).getTime() - now) / (1000 * 60 * 60 * 24)
      );
      const isExpired = remainingDays <= 0;
      const isExpiringSoon = remainingDays > 0 && remainingDays <= 30;
      const isActive = remainingDays > 30;

      if (filterMode === "expired") return isExpired;
      if (filterMode === "expiring") return isExpiringSoon;
      if (filterMode === "active") return isActive;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortMode === "latest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    });
  }, [filterMode, searchTerm, sortMode, warranties]);
}
