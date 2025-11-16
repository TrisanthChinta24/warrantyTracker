import { API_BASE_URL} from './config.js';
import { 
    showToast, 
    escapeHtml, 
    loadComponent,        
    initializeUtils,
    initThemeToggle, 
    initMenuToggle
} from './utils.js';

const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('editId');
const detailId = urlParams.get('id');

async function loadHeaderFooter() {
    await loadComponent('partials/header.html', 'header'); 
    await loadComponent('partials/footer.html', 'footer');
}
async function loadSidebar() {
    await loadComponent('partials/sidebar.html', 'appSidebar');
}

document.addEventListener("DOMContentLoaded", async () => {
  initializeUtils();
  await loadHeaderFooter();
  await loadSidebar();
  initThemeToggle(); 
  initMenuToggle();

  if (window.lucide) lucide.createIcons();

  // Logic for Add/Edit Page
  if (document.getElementById("warrantyForm")) {
    setupOCRUpload();
    setupFormSubmit();
    setupFilePreviews(); 
    if (editId) loadWarrantyForEdit(editId);
  }

  // Logic for Details Page
  if (detailId) {
    await fetchWarrantyDetails(detailId);
    setupDetailActions(detailId);
  }
});


// --- Form Submission (Add/Edit) ---

async function loadWarrantyForEdit(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/warranties/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    
    if (res.status === 401) return handleAuthError();
    if (!res.ok) throw new Error("Failed to load warranty data");
    
    const w = await res.json();
    
    document.querySelector('.page-title').innerHTML = `<i data-lucide="edit-3"></i> Edit Warranty: ${escapeHtml(w.productName)}`;
    document.getElementById("productName").value = w.productName || '';
    document.getElementById("vendor").value = w.brand || w.vendor || ''; // FIX: Aligned with 'vendor' field
    document.getElementById("purchaseDate").value = w.purchaseDate ? w.purchaseDate.split('T')[0] : '';
    document.getElementById("expiryDate").value = w.expiryDate ? w.expiryDate.split('T')[0] : '';
    document.getElementById("notes").value = w.notes || '';
    
    document.querySelector('button[type="submit"]').innerHTML = '<i data-lucide="save"></i> Update Warranty';
    if (window.lucide) lucide.createIcons();

  } catch (err) {
    console.error(err);
    showToast("Error loading warranty for editing.", "error");
  }
}


function setupFormSubmit() {
  const form = document.getElementById("warrantyForm");
  const extraFilesInput = document.getElementById("extraFiles");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // CRITICAL: Initialize customTitles array here
    const customTitles = []; 
    
    // CRITICAL: Use FormData for file submission
    const formData = new FormData();
    
    // Append all text fields
    formData.append("productName", form.productName.value);
    formData.append("vendor", form.vendor.value);
    formData.append("purchaseDate", form.purchaseDate.value);
    formData.append("expiryDate", form.expiryDate.value);
    formData.append("notes", form.notes.value);
    
    // Append multiple image files and collect custom titles    
    if (extraFilesInput && extraFilesInput.files.length > 0) {
        const files = Array.from(extraFilesInput.files);

        files.forEach((file, index) => {
            formData.append('images', file); 
            
            // Get the custom title from the dynamically created input
            const titleInput = document.getElementById(`custom-name-${index}`);
            const title = titleInput ? titleInput.value.trim() : '';
            
            // Store the title (or use the original filename if empty)
            customTitles.push(title || file.name); 
        });
        
    }
    
   formData.append('customTitles', JSON.stringify(customTitles)); 

    
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${API_BASE_URL}/api/warranties/${editId}` : `${API_BASE_URL}/api/warranties`;

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // DO NOT set Content-Type: browser handles multipart/form-data
        },
        body: formData, // Send FormData object
      });

      if (res.status === 401) return handleAuthError();
      if (!res.ok) throw new Error(`Failed to ${editId ? 'update' : 'save'} warranty`);
      
      showToast(`Warranty ${editId ? 'updated' : 'added'} successfully!`, "success");
      
      if (!editId) {
        form.reset();
        setTimeout(() => window.location.href = "view-warranty.html", 800);
      } else {
        setTimeout(() => window.location.href = `product-details.html?id=${editId}`, 800);
      }
      
    } catch (err) {
      console.error(err);
      showToast(`Error ${editId ? 'updating' : 'saving'} warranty.`, "error");
    }
  });
}

// === assets/js/warranty.js: setupFilePreviews (MODIFIED) ===

function setupFilePreviews() {
    const input = document.getElementById("extraFiles");
    const container = document.getElementById("filePreviewContainer");
    
    if (!input || !container) return;

    input.addEventListener("change", () => {
        container.innerHTML = ''; // Clear previous previews
        const files = input.files;
        console.log(`[File Upload Debug] Total files selected: ${files.length}`);
      
        if (files.length === 0) return;

        Array.from(files).forEach((file, index) => { // Use index here
            const fileItem = document.createElement('div');
            fileItem.className = 'file-preview-item'; 

            // Unique ID for the title input
            const inputId = `custom-name-${index}`; 

            let previewHtml = '';

            if (file.type.startsWith('image/')) {
                const imageUrl = URL.createObjectURL(file);
                previewHtml = `<img src="${imageUrl}" alt="${escapeHtml(file.name)}" class="file-preview-thumbnail" />`;
            } else {
                previewHtml = `<span class="file-preview-icon"><i data-lucide="file"></i></span>`;
            }

            fileItem.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    ${previewHtml}
                    <span class="file-preview-size">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div class="file-title-input-group">
                    <input type="text" id="${inputId}" class="custom-title-input" 
                           placeholder="e.g., Payment Receipt" 
                           data-file-index="${index}">
                </div>
            `;

            container.appendChild(fileItem);
        });
        if (window.lucide) lucide.createIcons();
    });
}

// --- OCR Logic ---

function setupOCRUpload() {
  const uploadBox = document.getElementById("uploadBox");
  const fileInput = document.getElementById("fileInput");
  const status = document.getElementById("ocrStatus");

  if (!uploadBox || !fileInput || !status) return;

  uploadBox.addEventListener("click", () => {
    fileInput.click() // FIX: Enabled file browsing click
  });

  ['dragover', 'dragenter'].forEach(eventName => {
    uploadBox.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadBox.classList.add("hover");
    });
  });

  ['dragleave', 'dragend', 'drop'].forEach(eventName => {
    uploadBox.addEventListener(eventName, () => uploadBox.classList.remove("hover"));
  });

  uploadBox.addEventListener("drop", (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleOCRFile(file);
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) handleOCRFile(file);
  });

  async function handleOCRFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Only image files (PNG, JPG) are supported for OCR.", "warning");
      fileInput.value = ''; // Clear file input
      return;
    }
    status.classList.remove("hidden");
    showToast("Extracting warranty details...", "info");

    const formData = new FormData();
    // The key here is 'file', which matches the OCR router's diskUpload.single("file")
    formData.append("file", file); 

    try {
      const res = await fetch(`${API_BASE_URL}/api/ocr`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });

      if (res.status === 401) return handleAuthError();
      if (!res.ok) throw new Error("OCR failed");
      
      const data = await res.json();
      autofillFields(data.extracted); // Use data.extracted if your backend returns structured data inside 'extracted'
      showToast("Details extracted successfully!", "success");
      
    } catch (err) {
      console.error(err);
      showToast("Failed to extract details. You can fill manually.", "error");
    } finally {
      status.classList.add("hidden");
      fileInput.value = ''; // Clear file input
    }
  }
}

function autofillFields(data) {
  if (!data) return;
  if (data.productName) document.getElementById("productName").value = data.productName;
  if (data.brand) document.getElementById("vendor").value = data.brand; // FIX: Targets 'vendor'
  if (data.purchaseDate) document.getElementById("purchaseDate").value = data.purchaseDate.split('T')[0];
  if (data.expiryDate) document.getElementById("expiryDate").value = data.expiryDate.split('T')[0];
}


// --- Detail View Logic ---

function getStatusBadgeDetails(expiryDateStr) {
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

async function fetchWarrantyDetails(id) {
    const contentDiv = document.getElementById('detailContent');
    const titleH1 = document.getElementById('detailTitle');
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/warranties/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (res.status === 401) return handleAuthError();
        if (!res.ok) throw new Error("Failed to fetch warranty details");
        
        const w = await res.json();
        
        titleH1.innerHTML = `<i data-lucide="eye"></i> Details: ${escapeHtml(w.productName || 'N/A')}`;
        

        let attachmentsHtml = '';
        if (w.images && w.images.length > 0) {
            
            const listItems = w.images.map((image, index) => {
                
                const filePath = image.path;
                const isValidFile = !!filePath; // Check if path is a non-empty string

                let fallbackName = 'File N/A';
                if (filePath) {
                    fallbackName = filePath.split('/').pop();
                }

                // FIX: Define displayName here so it's accessible everywhere
                const displayName = image.customName || image.originalName || fallbackName;
                const imageUrl = filePath ? `${API_BASE_URL}/${filePath.replace(/\\/g, '/')}` : ''; 
                
                // Determine if it's an image file to show a thumbnail
                const isImage = image.originalName && 
                                (image.originalName.toLowerCase().endsWith('.jpg') || 
                                 image.originalName.toLowerCase().endsWith('.jpeg') || 
                                 image.originalName.toLowerCase().endsWith('.png'));
                
                // Set the thumbnail source: use the image URL if valid, otherwise use a placeholder
                const thumbnailSrc = isImage ? imageUrl : 'assets/icons/file-icon.svg'; 

                // --- Case 1: File Path is Missing (Dead Entry) ---
                if (!isValidFile) {
                     return `
                        <div class="attachment-row dead-link-row">
                            <span class="attachment-name" style="color:var(--color-danger);">
                                ⚠️ Invalid Attachment: ${escapeHtml(displayName)} (Index ${index})
                            </span>
                            <span class="attachment-actions">
                                <button class="btn-icon delete-btn" 
                                        data-index="${index}" 
                                        data-path="" 
                                        title="Delete invalid entry">
                                    <i data-lucide="trash"></i>
                                </button>
                            </span>
                        </div>`;
                }
                
                // --- Case 2: Valid File Entry ---
                return `
                    <div class="attachment-row">
                        <a href="${imageUrl}" target="_blank" class="attachment-info-link" title="View Document">
                            <img src="${thumbnailSrc}" class="attachment-thumbnail" alt="${escapeHtml(displayName)} Preview" />
                            <span class="attachment-name" id="name-${index}">${escapeHtml(displayName)}</span>
                        </a>
                        
                        <span class="attachment-actions">
                            <a href="${imageUrl}" target="_blank" class="btn-icon view-btn" title="View/Download">
                                <i data-lucide="download"></i>
                            </a>
                            
                            <button class="btn-icon rename-btn" data-index="${index}">
                                <i data-lucide="tag"></i>
                            </button>
                            <button class="btn-icon delete-btn" data-index="${index}" data-path="${image.path}">
                                <i data-lucide="trash"></i>
                            </button>
                        </span>
                    </div>
                `;
            }).join('');
            attachmentsHtml = `
                <p style="margin-top:1rem;"><strong>Attached Documents:</strong></p>
                <div id="attachmentsList" class="attachments-list">
                    ${listItems}
                </div>
            `;
            
        } else {
            attachmentsHtml = `<p style="margin-top:1rem; color:var(--color-text-muted);">No documents attached.</p>`;
        }
        
        // --- FINAL CONTENT ASSEMBLY ---
        contentDiv.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--color-card-border); padding-bottom:1rem;">
                <h2 style="font-size:1.5rem; color:var(--color-primary);">${escapeHtml(w.productName || 'N/A')}</h2>
                ${getStatusBadgeDetails(w.expiryDate)}
            </div>
            
            <p><strong>Vendor:</strong> ${escapeHtml(w.vendor || w.brand || 'N/A')}</p>
            <p><strong>Purchase Date:</strong> ${new Date(w.purchaseDate).toLocaleDateString()}</p>
            <p><strong>Expiry Date:</strong> ${new Date(w.expiryDate).toLocaleDateString()}</p>
            <p style="margin-top:1rem;"><strong>Notes:</strong></p>
            <div style="background-color:var(--color-background-soft); padding:1rem; border-radius:8px; border:1px solid var(--color-card-border); white-space:pre-wrap;">
                ${escapeHtml(w.notes || 'No additional notes.')}
            </div>
            ${attachmentsHtml}
        `;
        
        if (window.lucide) lucide.createIcons();
        
        // CRITICAL: Setup event listeners for the new buttons after content is rendered
        if (w.images && w.images.length > 0) {
            setupAttachmentActions(id); 
        } 
      }
      catch (err) {
      console.error("Detail fetch error:", err);
      titleH1.textContent = "Error Loading Details";
      contentDiv.innerHTML = `<p class="empty-state-message">Could not load warranty details. ${err.message}</p>`;
      showToast("Error loading details.", "error");
      }
}

function setupAttachmentActions(warrantyId) {
    // 1. Rename Handler (PUT /:id/attachment/name)
    document.querySelectorAll('.rename-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.currentTarget.getAttribute('data-index');
            const currentName = document.getElementById(`name-${index}`).textContent;
            
            const newName = prompt(`Enter new title for this attachment:`, currentName);
            if (newName && newName.trim() !== currentName) {
                updateAttachmentName(warrantyId, index, newName.trim());
            }
        });
    });

    // 2. Delete Handler (DELETE /:id/attachment)
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            if (confirm("Are you sure you want to permanently delete this attachment?")) {
                const index = e.currentTarget.getAttribute('data-index');
                const diskPath = e.currentTarget.getAttribute('data-path'); // The 'uploads/filename.jpg' path
                deleteAttachment(warrantyId, index, diskPath);
            }
        });
    });
}

function setupDetailActions(id) {
    document.getElementById('editBtn').addEventListener('click', () => {
        window.location.href = `add-warranty.html?editId=${id}`;
    });
    
    document.getElementById('deleteBtn').addEventListener('click', () => {
        // Assuming confirmDialog is loaded from utils.js
        if (typeof confirmDialog === 'function') {
            if (!confirmDialog("Are you sure you want to delete this warranty? This cannot be undone.")) return; 
            deleteWarranty(id);
        } else {
            if (confirm("Are you sure you want to delete this warranty? This cannot be undone.")) {
                deleteWarranty(id);
            }
        }
    });
}

async function deleteWarranty(id) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/warranties/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        
        if (res.status === 401) return handleAuthError();
        if (!res.ok) throw new Error("Failed to delete warranty");
        
        showToast("Warranty deleted!", "success");
        setTimeout(() => window.location.href = "view-warranty.html", 800);
    } catch (err) {
        console.error("Deletion failed:", err);
        showToast("Error deleting warranty.", "error");
    }
}

// === assets/js/warranty.js (NEW API FUNCTIONS) ===

async function updateAttachmentName(warrantyId, index, newName) {
    showToast("Renaming attachment...", "info");
    try {
        const res = await fetch(`${API_BASE_URL}/api/warranties/${warrantyId}/attachment/name`, {
            method: 'PUT',
            headers: { 
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ index, newName })
        });
        
        if (res.status === 401) return handleAuthError();
        if (!res.ok) throw new Error("Rename failed");

        showToast("Attachment title updated!", "success");
        fetchWarrantyDetails(warrantyId); // Reload to show new name
        
    } catch (err) {
        console.error("Rename error:", err);
        showToast("Error renaming attachment.", "error");
    }
}

async function deleteAttachment(warrantyId, index, diskPath) {
    showToast("Deleting attachment...", "info");
    try {
        const res = await fetch(`${API_BASE_URL}/api/warranties/${warrantyId}/attachment`, {
            method: 'DELETE',
            headers: { 
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ index, diskPath }) // Send index and the disk path
        });
        
        if (res.status === 401) return handleAuthError();
        if (!res.ok) throw new Error("Deletion failed");

        showToast("Attachment deleted successfully!", "success");
        fetchWarrantyDetails(warrantyId); // Reload the details page
        
    } catch (err) {
        console.error("Deletion error:", err);
        showToast("Error deleting attachment.", "error");
    }
}

function handleAuthError() {
    showToast('Session expired. Please log in again.', 'error');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTimeout(() => window.location.href = 'login.html', 500);
}