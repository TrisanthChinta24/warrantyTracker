// utils/ocrParser.js
function parseOCRData(text) {
  const result = {
    productName: null,
    purchaseDate: null,
    expiryDate: null,
    warrantyMonths: null,
  };

  // Normalize text
  const cleanText = text.replace(/\s+/g, " ").toLowerCase();

  // 1️⃣ Extract Purchase Date (with fallback)
  function extractPurchaseDate(text) {
    const result = {};

    // Primary: look for explicit "purchase date" patterns
    const purchaseRegex =
      /(purchase(?:d)?\s*(?:on|date)?[:\-\s]*)(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i;
    const purchaseMatch = text.match(purchaseRegex);

    if (purchaseMatch) {
      result.purchaseDate = purchaseMatch[2];
    } else {
      // Secondary: fallback → find *any* date in the document
      const genericDateRegex =
        /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/g;
      const allDates = text.match(genericDateRegex);

      if (allDates && allDates.length > 0) {
        // Heuristic: assume the earliest date is the purchase date
        // (works well for invoices and warranty cards)
        const normalized = allDates.map((d) => normalizeDate(d));
        result.purchaseDate = getEarliestDate(normalized);
      } else {
        result.purchaseDate = null;
      }
    }

    return result.purchaseDate;
  }

  // Helper: Normalize date string (e.g., 2024-01-02 → 02/01/2024)
  function normalizeDate(dateStr) {
    // Try to convert to standard JS Date
    const parts = dateStr.split(/[\/\-\.]/).map((p) => parseInt(p));
    if (parts[0] > 31) {
      // format like YYYY-MM-DD
      return `${parts[2] || parts[1] || ""}/${parts[1] || parts[0]}/${parts[0]}`;
    } else {
      // format like DD-MM-YYYY
      return `${parts[0]}/${parts[1]}/${parts[2] || ""}`;
    }
  }

  // Helper: Return the earliest valid date string
  function getEarliestDate(dates) {
    const valid = dates
      .map((d) => new Date(d))
      .filter((d) => d instanceof Date && !isNaN(d));
    if (valid.length === 0) return null;

    const earliest = valid.reduce((a, b) => (a < b ? a : b));
    return earliest.toISOString().split("T")[0]; // "YYYY-MM-DD"
  }


  // 2️⃣ Extract Expiry Date
  const expiryRegex =
    /(expires\s*(?:on|date)?[:\-\s]*|valid\s*until[:\-\s]*)(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i;
  const expiryMatch = text.match(expiryRegex);
  if (expiryMatch) result.expiryDate = expiryMatch[2];

  // 3️⃣ Extract Warranty Period (months or years)
  const durationRegex = /(\d{1,2})\s*(?:month|months|yr|year|years)\s*(?:warranty)?/i;
  const durationMatch = text.match(durationRegex);
  if (durationMatch) {
    const value = parseInt(durationMatch[1]);
    if (text.includes("year")) result.warrantyMonths = value * 12;
    else result.warrantyMonths = value;
  }

  // 4️⃣ Extract Product Name (best effort)
  const productRegex =
    /(product\s*name[:\-\s]*([A-Za-z0-9 \-\_]+))|(model\s*[:\-\s]*([A-Za-z0-9 \-\_]+))/i;
  const productMatch = text.match(productRegex);
  if (productMatch)
    result.productName = (productMatch[2] || productMatch[4] || "").trim();

  // Fallback: try heuristic (common brand names or keywords)
  if (!result.productName) {
    const knownKeywords = ["phone", "laptop", "tv", "refrigerator", "watch", "ac", "camera"];
    const found = knownKeywords.find((k) => cleanText.includes(k));
    if (found) {
      const start = cleanText.indexOf(found) - 20;
      result.productName = cleanText.substring(Math.max(0, start), start + 40).trim();
    }
  }

  return result;
}

module.exports = { parseOCRData };
