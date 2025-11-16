import { API_BASE_URL, CONFIG_VALUE } from './config.js';
import { 
    showToast, 
    escapeHtml, 
    loadComponent,        
    initializeUtils,
    initThemeToggle, 
    initMenuToggle,
    confirmDialog // <-- FIX: confirmDialog is now imported
} from './utils.js';

document.addEventListener("DOMContentLoaded", async () => {

  initializeUtils();
  await loadHeaderFooter();
  await loadSidebar();
  initThemeToggle(); 
  initMenuToggle();
  fetchWarranties();
  
  if (window.lucide) lucide.createIcons();

  document.getElementById("searchInput").addEventListener("input", filterAndRender);
  document.getElementById("sortSelect").addEventListener("change", filterAndRender);
});

let allWarranties = [];

// Assuming a simple way to load Header and Footer from utils.js
async function loadHeaderFooter() {
    await loadComponent('partials/header.html', 'header'); 
    await loadComponent('partials/footer.html', 'footer');
}

async function loadSidebar() {
    await loadComponent('partials/sidebar.html', 'appSidebar');
}

async function fetchWarranties() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/warranties`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    // Check for session expiration based on the response status
    if (res.status === 401) {
        showToast('Session expired. Please log in again.', 'error');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return window.location.href = 'login.html';
    }

    if (!res.ok) throw new Error("Failed to fetch warranties");
    allWarranties = await res.json();
    renderWarranties(allWarranties);
  } catch (err) {
    console.error(err);
    showToast("Failed to load warranties", "error");
  }
}

function filterAndRender() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const sort = document.getElementById("sortSelect").value;

  let filtered = allWarranties.filter(
    (w) =>
      w.productName?.toLowerCase().includes(search) ||
      w.vendor?.toLowerCase().includes(search)
  );

  filtered = filtered.sort((a, b) => {
    if (sort === "soonest") return new Date(a.expiryDate) - new Date(b.expiryDate);
    // Default to 'latest' (b - a) if sort is anything else
    else return new Date(b.createdAt) - new Date(a.createdAt); 
  });

  renderWarranties(filtered);
}

function getStatusBadge(expiryDateStr) {
    const expiry = new Date(expiryDateStr).getTime();
    const today = new Date().getTime();
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        return '<span class="badge badge-danger">Expired</span>';
    } else if (diffDays <= 30) {
        return `<span class="badge badge-warning">Expiring in ${diffDays} days</span>`;
    } else {
        return '<span class="badge badge-success">Active</span>';
    }
}

function renderWarranties(warranties) {
  const container = document.getElementById("warrantyList");
  container.innerHTML = "";

  if (warranties.length === 0) {
    container.innerHTML = `
      <div class="empty-state-card">
        <i data-lucide="folder-open" class="empty-state-icon"></i>
        <p class="empty-state-message">No warranties found matching your criteria.</p>
        <a href="add-warranty.html" class="btn-primary" style="margin-top: 1rem;">Add a New Warranty</a>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  warranties.forEach((w) => {
    const card = document.createElement("div");
    card.className = "warranty-card";
    
    // Fallback ID for compatibility, though API should provide it
    const warrantyId = w._id || w.id; 

    card.innerHTML = `
      <div class="card-header">
        <h3 class="card-title">${escapeHtml(w.productName || "Unnamed Product")}</h3>
        ${getStatusBadge(w.expiryDate)}
      </div>
      <div class="card-body">
        <p><strong>Vendor:</strong> ${escapeHtml(w.vendor || "Unknown")}</p>
        <p><strong>Purchase:</strong> ${new Date(w.purchaseDate).toLocaleDateString()}</p>
        <p><strong>Expiry:</strong> ${new Date(w.expiryDate).toLocaleDateString()}</p>
        ${
          w.notes
            ? `<p><strong>Notes:</strong> ${escapeHtml(w.notes)}</p>`
            : ""
        }
      </div>
      <div class="card-footer">
        <button class="btn-icon" onclick="editWarranty('${warrantyId}')">
          <i data-lucide='edit-3'></i> Edit
        </button>
        <button class="btn-icon btn-danger" 
            onclick="if(confirm('Are you sure you want to delete this warranty?')) deleteWarranty('${warrantyId}')">
          <i data-lucide='trash-2'></i> Delete
        </button>
        <button class = "btn-icon btn-secondary" onclick = "viewDetails('${warrantyId}')">
          <i data-lucide='eye'></i> Details
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  lucide.createIcons();
}

// Global functions exposed for onclick in dynamically created HTML
window.editWarranty = (id) => {
  window.location.href = `add-warranty.html?editId=${id}`;
};

window.viewDetails = (id) => {
  window.location.href = `product-details.html?id=${id}`;
}

window.deleteWarranty = async (id) => {
  // Using the new utility function instead of browser confirm()
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/warranties/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    
    if (res.status === 401) {
        showToast('Session expired. Please log in again.', 'error');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return window.location.href = 'login.html';
    }

    if (!res.ok) throw new Error("Failed to delete warranty");
    
    showToast("Warranty deleted!", "success");
    // Re-fetch and re-render the list
    await fetchWarranties(); 
  } catch (err) {
    console.error("Deletion failed:", err);
    showToast("Error deleting warranty.", "error");
  }
};
