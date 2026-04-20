const isLoginPage = window.location.pathname === "/";
const isRegisterPage = window.location.pathname === "/register";

if (localStorage.getItem("token") && (isLoginPage || isRegisterPage)) {
  window.location.href = "/dashboard";
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove("hidden");
}

function hideMsg(id) {
  document.getElementById(id)?.classList.add("hidden");
}

// LOGIN
const loginBtn = document.getElementById("login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    hideMsg("error-msg");
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) return showError("error-msg", "All fields are required");

    try {
      loginBtn.textContent = "Signing in...";
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/dashboard";
    } catch (err) {
      showError("error-msg", err.message);
      loginBtn.textContent = "Sign In";
    }
  });
}

// REGISTER
const registerBtn = document.getElementById("register-btn");
if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    hideMsg("error-msg");
    hideMsg("success-msg");
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !email || !password)
      return showError("error-msg", "All fields are required");

    try {
      registerBtn.textContent = "Creating...";
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password })
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/dashboard";
    } catch (err) {
      showError("error-msg", err.message);
      registerBtn.textContent = "Create Account";
    }
  });
}