// === product.js ===

document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter();
  loadSidebar();
  lucide.createIcons();

  document.getElementById("searchBox").addEventListener("input", filterAndRender);
  document.getElementById("filterSelect").addEventListener("change", filterAndRender);

  await fetchProducts();
});

let allProducts = [];

async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/warranties`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Failed to fetch warranties");
    allProducts = await res.json();
    allProducts.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    renderProducts(allProducts);
  } catch (err) {
    console.error(err);
    showToast("Failed to load warranties", "error");
  }
}

function filterAndRender() {
  const search = document.getElementById("searchBox").value.toLowerCase();
  const filter = document.getElementById("filterSelect").value;

  const filtered = allProducts.filter((p) => {
    const end = new Date(p.expiryDate);
    const today = new Date();
    const remaining = (end - today) / (1000 * 60 * 60 * 24);
    const expired = remaining <= 0;
    const soon = remaining <= 30 && remaining > 0;
    const active = remaining > 30;

    let match = true;
    if (filter === "expired") match = expired;
    else if (filter === "expiring") match = soon;
    else if (filter === "active") match = active;

    return (
      match &&
      (p.productName?.toLowerCase().includes(search) ||
        p.brand?.toLowerCase().includes(search))
    );
  });

  renderProducts(filtered);
}

function renderProducts(products) {
  const container = document.getElementById("productList");
  container.innerHTML = "";

  if (!products.length) {
    container.innerHTML = `<p style="text-align:center;color:var(--muted);">No warranties found.</p>`;
    return;
  }

  products.forEach((p) => {
    const start = new Date(p.purchaseDate);
    const end = new Date(p.expiryDate);
    const today = new Date();

    const totalDays = (end - start) / (1000 * 60 * 60 * 24);
    const usedDays = (today - start) / (1000 * 60 * 60 * 24);
    const percentage = Math.min(100, Math.max(0, (usedDays / totalDays) * 100));
    const remainingDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

    const color = getProgressColor(remainingDays);

    const card = document.createElement("div");
    card.className = "product-card";

    const circumference = 2 * Math.PI * 30;
    const offset = circumference * (1 - percentage / 100);

    card.innerHTML = `
      <div class="progress-ring">
        <svg width="70" height="70">
          <circle class="progress-ring__background" cx="35" cy="35" r="30"></circle>
          <circle class="progress-ring__progress"
            cx="35" cy="35" r="30"
            stroke="${color}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"></circle>
        </svg>
      </div>

      <div class="product-info">
        <div class="product-name">${escapeHtml(p.productName || "Unnamed Product")}</div>
        <div class="product-dates">
          Brand: ${escapeHtml(p.brand || "Unknown")}<br>
          Expires: <strong>${new Date(p.expiryDate).toLocaleDateString()}</strong><br>
          Remaining: ${remainingDays <= 0 ? "Expired" : remainingDays + " days"}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function getProgressColor(remainingDays) {
  if (remainingDays <= 0) return "#ef4444"; // red
  if (remainingDays <= 15) return "#f97316"; // orange
  if (remainingDays <= 45) return "#facc15"; // yellow
  return "#22c55e"; // green
}
