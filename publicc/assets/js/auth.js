import { API_BASE_URL } from './config.js';
import { showToast } from './utils.js';

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // If already logged in, redirect away from auth pages
  if (localStorage.getItem("token")) {
    window.location.href = "index.html";
    return;
  }

  if (loginForm) setupLogin(loginForm);
  if (registerForm) setupRegister(registerForm);
});

function setupLogin(form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    try {
      // API Call for Login
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Invalid credentials" }));
        throw new Error(errorData.message || "Login failed");
      }
      
      const data = await res.json();

      // Store token and user data in local storage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      showToast("Login successful!", "success");
      setTimeout(() => (window.location.href = "index.html"), 800);
    } catch (err) {
      console.error(err);
      showToast(err.message || "An unknown error occurred during login.", "error");
    }
  });
}

function setupRegister(form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    try {
      // API Call for Registration
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Registration failed" }));
        throw new Error(errorData.message || "Registration failed");
      }
      
      showToast("Account created! please login.", "success");
      setTimeout(() => (window.location.href = "login.html"), 800);
    } catch (err) {
      console.error(err);
      showToast(err.message || "An unknown error occurred during registration.", "error");
    }
  });
}