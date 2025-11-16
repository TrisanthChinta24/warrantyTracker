// === service-history.js ===

import { API_BASE_URL, CONFIG_VALUE } from './config.js';

import { 
    showToast, 
    escapeHtml, 
    loadComponent,        
    initializeUtils,
    initThemeToggle, 
    initMenuToggle,
    confirmDialog
} from './utils.js';

document.addEventListener("DOMContentLoaded", async () => {

  initializeUtils();
  await loadHeaderFooter();
  await loadSidebar();
  initThemeToggle(); 
  initMenuToggle();

  if (window.lucide) lucide.createIcons();

  setupModal();
  await loadWarranties();
  await fetchServiceHistory();
});

async function loadHeaderFooter() {
    await loadComponent('partials/header.html', 'header'); 
    await loadComponent('partials/footer.html', 'footer');
}

/**
 * Local helper function to load the sidebar using the generic utility.
 */
async function loadSidebar() {
    await loadComponent('partials/sidebar.html', 'appSidebar');
}

let allWarranties = [];
let allServices = [];

async function loadWarranties() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/warranties`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    
    if (res.status === 401) return handleAuthError();
    if (!res.ok) throw new Error("Failed to fetch warranties");
    
    allWarranties = await res.json();

    const filterSelect = document.getElementById("filterWarranty");
    const modalSelect = document.getElementById("warrantySelect");
    
    // Clear existing options except "All"
    filterSelect.innerHTML = '<option value="all">All Warranties</option>';
    modalSelect.innerHTML = '<option value="" disabled selected>Select a product</option>';

    allWarranties.forEach((w) => {
      // Use _id from the mock API response
      const id = w._id; 
      const opt1 = new Option(w.productName, id);
      const opt2 = new Option(w.productName, id);
      filterSelect.appendChild(opt1);
      modalSelect.appendChild(opt2);
    });

    filterSelect.addEventListener("change", filterAndRender);
  } catch (err) {
    console.error(err);
    showToast("Failed to load warranties for service tracking", "error");
  }
}

async function fetchServiceHistory() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/service-history`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    
    if (res.status === 401) return handleAuthError();
    if (!res.ok) throw new Error("Failed to fetch service history");
    
    allServices = await res.json();
    // Sort by date descending (most recent first)
    allServices.sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
    filterAndRender(); // Render the fetched data
  } catch (err) {
    console.error(err);
    showToast("Failed to load service history", "error");
  }
}

function renderServices(services) {
  const container = document.getElementById("serviceList");
  container.innerHTML = "";

  if (services.length === 0) {
    container.innerHTML = `
      <div class="empty-state-card">
        <i data-lucide="wrench" class="empty-state-icon"></i>
        <p class="empty-state-message">No service records found.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }
  
  services.forEach((s) => {
    const warranty = allWarranties.find(w => w._id === s.warranty); 
    const productName = warranty ? warranty.productName : 'Unknown Product';
    const serviceId = s._id; // Use _id from the mock API response

    const card = document.createElement("div");
    card.className = "service-card";
    
    card.innerHTML = `
      <div class="service-card-info">
        <h4>${escapeHtml(productName)}</h4>
        <p>${escapeHtml(s.description)}</p>
        <p class="service-cost"><strong>Cost:</strong> ₹${s.cost !== undefined ? s.cost.toLocaleString() : 0}</p>
        <span class="date"><i data-lucide="calendar-check" style="width:16px;height:16px;margin-right:4px;"></i> ${new Date(s.serviceDate).toLocaleDateString()}</span>
        ${
          s.documents && s.documents.length
            ? `
              <div class="service-documents">
                ${s.documents
                  .map(
                    (doc) => `
                      <a href="${API_BASE_URL}/${doc}" target="_blank" class="service-doc">
                        <img src="${API_BASE_URL}/${doc}" alt="Service Doc" onerror="this.src='assets/img/file-icon.png'" />
                      </a>
                    `
                  )
                  .join("")}
              </div>
            `
            : ""
        }
      </div>
      <div class="service-card-actions">
        <button class="btn-icon btn-danger" 
            onclick="if(confirm('Are you sure you want to delete this warranty?')) deleteService('${serviceId}')">
          <i data-lucide='trash-2'></i> Delete
        </button>
      </div>
    `;

    container.appendChild(card);
  });
  
  if (window.lucide) lucide.createIcons();
}

function filterAndRender() {
  const filter = document.getElementById("filterWarranty").value;
  let filtered = allServices;
  if (filter !== "all" && filter !== "") {
    filtered = allServices.filter((s) => s.warranty === filter);
  }
  renderServices(filtered);
}


function setupModal() {
  const modal = document.getElementById("serviceModal");
  const openBtn = document.getElementById("addServiceBtn");
  const closeBtn = document.getElementById("closeModal");
  const form = document.getElementById("serviceForm");

  openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.warrantySelect.value) {
        showToast("Please select a warranty item.", "warning");
        return;
    }
    
    // FIX 1: Use FormData to handle file and form inputs
    const formData = new FormData();
    formData.append('warrantyId', form.warrantySelect.value); // Backend expects warrantyId -> warranty
    formData.append('serviceDate', form.serviceDate.value);
    formData.append('description', form.description.value);
    // Add new fields
    if (form.cost.value) formData.append('cost', form.cost.value);
    
    // Append files (if any are selected)
    const files = form.documents.files;
    for (let i = 0; i < files.length; i++) {
        formData.append('documents', files[i]);
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/service-history`, {
        method: "POST",
        // FIX 2: REMOVE "Content-Type" header. The browser sets the correct boundary for FormData.
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData, // FIX 3: Send the FormData object
      });

      if (res.status === 401) return handleAuthError();
      if (!res.ok) throw new Error("Failed to save service record");

      showToast("Service record added!", "success"); // Removed "Please refresh..." since we re-fetch below
      modal.classList.add("hidden");
      form.reset();
      await fetchServiceHistory();
    } catch (err) {
      console.error(err);
      showToast("Error saving record.", "error");
    }
  });
}

// Global function exposed for onclick in dynamically created HTML
window.deleteService = async (id) => {
    // Use the safe utility function
    if (!confirmDialog("Are you sure you want to delete this service record?")) return; 
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/service-history/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        
        if (res.status === 401) return handleAuthError();
        if (!res.ok) throw new Error("Failed to delete service record");
        
        showToast("Service record deleted!", "success");
        // Re-fetch service history to update the list
        await fetchServiceHistory(); 
    } catch (err) {
        console.error("Deletion failed:", err);
        showToast("Error deleting service record.", "error");
    }
};

function handleAuthError() {
    showToast('Session expired. Please log in again.', 'error');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTimeout(() => window.location.href = 'login.html', 500);
}