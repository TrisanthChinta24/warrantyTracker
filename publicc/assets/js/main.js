
import { API_BASE_URL, CONFIG_VALUE } from './config.js';

import { 
    showToast, 
    escapeHtml, 
    loadComponent,        
    initializeUtils,
    initThemeToggle, 
    initMenuToggle
} from './utils.js';

const productGrid = document.getElementById('productGrid');

const RADIUS = 25; 
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;


async function loadHeaderFooter() {
    await loadComponent('partials/header.html', 'header'); 
    await loadComponent('partials/footer.html', 'footer');
}


async function loadSidebar() {
    await loadComponent('partials/sidebar.html', 'appSidebar');
}

document.addEventListener('DOMContentLoaded', async () => {
    initializeUtils();
    await loadHeaderFooter();
    await loadSidebar();
    initThemeToggle(); 
    initMenuToggle();

    if (window.lucide) lucide.createIcons();

    document.getElementById('searchBox').addEventListener('input', loadDashboard);
    document.getElementById('filterSelect').addEventListener('change', loadDashboard);
    document.body.addEventListener('click', (event) => {
        const btn = event.target.closest('#addProductBtn');
        
        if (btn) {
            event.preventDefault(); 
            console.log("Floating add button clicked! Redirecting...");
            window.location.href = 'add-warranty.html';
        }
    });

    await loadDashboard();
});


function calculateWarrantyProgress(purchaseDateStr, expiryDateStr) {
    const purchaseDate = new Date(purchaseDateStr).getTime();
    const expiryDate = new Date(expiryDateStr).getTime();
    const now = new Date().getTime();

    const totalDuration = expiryDate - purchaseDate;
    const elapsedDuration = now - purchaseDate;

    if (totalDuration <= 0) {
        return 100;
    }
    
    if (now >= expiryDate) {
        return 100;
    }

    const percentage = (elapsedDuration / totalDuration) * 100;
    return Math.min(100, Math.max(0, percentage));
}

function getProgressColor(remainingDays) {
    if (remainingDays <= 0) return 'var(--color-expired)';
    if (remainingDays <= 30) return 'var(--color-warning)';
    return 'var(--color-primary)';
}

let allWarranties = [];

async function fetchWarranties() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/warranties`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        if (response.status === 401) return handleAuthError();
        if (!response.ok) throw new Error(`Failed to fetch warranties: ${response.statusText}`);

        allWarranties = await response.json();
        return allWarranties;

    } catch (error) {
        console.error('Error fetching warranties:', error);
        showToast('An error occurred while loading your warranties.', 'error');
        productGrid.innerHTML = '<p class="empty-state-message" style="grid-column: 1/-1;">Failed to load data. Please try again.</p>';
        return [];
    }
}

async function loadDashboard() {
    if (allWarranties.length === 0) {
        await fetchWarranties();
    }
    
    const search = document.getElementById('searchBox').value.toLowerCase();
    const filter = document.getElementById('filterSelect').value;

    const filteredWarranties = allWarranties.filter(w => {
        const nameMatch = w.productName?.toLowerCase().includes(search) || w.brand?.toLowerCase().includes(search);
        if (!nameMatch) return false;

        const expiryDate = new Date(w.expiryDate).getTime();
        const now = new Date().getTime();
        const remainingDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        
        const isExpired = remainingDays <= 0;
        const isExpiringSoon = remainingDays > 0 && remainingDays <= 30;
        const isActive = remainingDays > 30;

        switch (filter) {
            case 'expiring':
                return isExpiringSoon;
            case 'expired':
                return isExpired;
            case 'active':
            default: 
                return true;
        }
    });
    
    filteredWarranties.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    renderWarranties(filteredWarranties);
}


function renderWarranties(warranties) {
    productGrid.innerHTML = '';

    if (warranties.length === 0) {
        productGrid.innerHTML = `
          <div class="empty-state-card">
            <i data-lucide="package-open" class="empty-state-icon"></i>
            <p class="empty-state-message">No warranties match your current filter or search criteria.</p>
            <a href="add-warranty.html" class="btn-primary" style="margin-top: 1rem;">Add a New Warranty</a>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    warranties.forEach(w => {
        const percentage = calculateWarrantyProgress(w.purchaseDate, w.expiryDate);
        const expiryDate = new Date(w.expiryDate).getTime();
        const now = new Date().getTime();
        const remainingDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        const color = getProgressColor(remainingDays);

        
        const progressOffset = CIRCUMFERENCE * (1 - percentage / 100); 
        

        const card = document.createElement('a');
        card.href = `product-details.html?id=${w._id}`;
        card.className = 'product-card';
        
        card.innerHTML = `
            <div class="progress-ring">
                <svg width="70" height="70">
                    
                    <circle class="progress-ring__background" cx="35" cy="35" r="${RADIUS}"></circle>
                    
                    <circle class="progress-ring__progress"
                        cx="35" cy="35" r="${RADIUS}"
                        stroke="${color}" 
                        stroke-dasharray="${CIRCUMFERENCE}"
                        stroke-dashoffset="${progressOffset}"></circle>
                    
                    <text x="35" y="38" text-anchor="middle" dominant-baseline="middle" class="progress-ring__text">
                        ${Math.round(percentage)}% 
                    </text>
                </svg>
            </div>

            <div class="product-info">
                <div class="product-name">${escapeHtml(w.productName || 'Unnamed Product')}</div>
                <div class="product-dates">
                    Vendor: ${escapeHtml(w.vendor || 'Unknown')}<br>
                    Expires on: <strong>${new Date(w.expiryDate).toLocaleDateString()}</strong><br>
                    Remaining: 
                    <span style="color:${color}; font-weight:600;">
                        ${remainingDays <= 0 ? "Expired" : remainingDays + " days"}
                    </span>
                </div>
            </div>
        `;
        
        productGrid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
}

function handleAuthError() {
    showToast('Session expired. Please log in again.', 'error');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTimeout(() => window.location.href = 'login.html', 500);
}