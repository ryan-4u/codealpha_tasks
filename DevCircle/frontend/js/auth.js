redirectIfAuth();

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');

// Toggle between login and register
showRegister?.addEventListener('click', (e) => {
  e.preventDefault();
  loginSection.style.display = 'none';
  registerSection.style.display = 'block';
});

showLogin?.addEventListener('click', (e) => {
  e.preventDefault();
  registerSection.style.display = 'none';
  loginSection.style.display = 'block';
});

// Login
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');

  errorEl.style.display = 'none';

  const res = await login({ email, password });

  if (res.token) {
    saveAuth(res.token, res.user);
    window.location.href = '/feed.html';
  } else {
    errorEl.textContent = res.message || 'Login failed';
    errorEl.style.display = 'block';
  }
});

// Register
registerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('regName').value;
  const username = document.getElementById('regUsername').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const errorEl = document.getElementById('registerError');

  errorEl.style.display = 'none';

  const res = await register({ name, username, email, password });

  if (res.token) {
    saveAuth(res.token, res.user);
    window.location.href = '/feed.html';
  } else {
    errorEl.textContent = res.message || 'Registration failed';
    errorEl.style.display = 'block';
  }
});