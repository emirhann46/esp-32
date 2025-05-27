// public/register.js

document.getElementById('registerForm').onsubmit = async function(e) {
  e.preventDefault();
  
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });

  const data = await response.json();

  const msg = document.getElementById('registerMsg');
  msg.textContent = data.message;
  msg.className = 'form-message ' + (data.success ? 'success' : 'error');
  msg.style.display = 'block';

  if (data.success) {
    setTimeout(() => window.location.href = 'login.html', 1200);
  }
};
