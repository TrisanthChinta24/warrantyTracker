// === assets/js/utils.js (ES Module Utility Module) ===

export function confirmDialog(message) {
  console.log(`[ACTION REQUIRED: ${message}] - Placeholder for custom modal UI.`);
  return true; 
}

export function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        console.error("Toast container not found. Message:", message);
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    // Using exported function here
    toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
    
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

export function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&#039;');
}

export async function loadComponent(url, elementId) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const html = await response.text();
            document.getElementById(elementId).innerHTML = html;
            
            if (window.lucide) lucide.createIcons();
            if (elementId === 'header') {
              updateAuthInHeader(); // Call another exported function
            }
        } else {
            console.error(`Failed to load component ${url}: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error loading component ${url}:`, error);
    }
}

export function initThemeToggle() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    if (window.lucide) window.lucide.createIcons();
  });
}

export function initMenuToggle() {
  const menuBtn = document.getElementById("menuToggle");
  const sidebar = document.getElementById("appSidebar");
  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("hidden");
    });
  }
}

export function updateAuthInHeader() {
  const section = document.getElementById("authSection");
  if (!section) return;

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    section.innerHTML = `<button id="logoutBtn" class="btn-secondary">Logout</button>`;
    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      showToast("Logged out successfully!"); 
      window.location.href = "login.html";
    });
  } else {
    section.innerHTML = `<a href="login.html" class="btn-primary">Login</a>`;
  }
}

export function initializeUtils() {
    const theme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", theme);
}
