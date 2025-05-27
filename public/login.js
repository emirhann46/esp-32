document.getElementById('loginForm').onsubmit = async function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    console.log("Login response:", data); // Hata ayıklama için

    const msg = document.getElementById('loginMsg');
    msg.textContent = data.success ? "Giriş başarılı, yönlendiriliyorsunuz..." : (data.message || "Giriş başarısız!");
    msg.className = 'form-message ' + (data.success ? 'success' : 'error');
    msg.style.display = 'block';

    if (data.success && data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setTimeout(() => window.location.href = 'index.html', 1200); // 3 saniye beklet
    }
  } catch (err) {
    console.error("Login error:", err);
    const msg = document.getElementById('loginMsg');
    msg.textContent = "Sunucuya bağlanılamadı!";
    msg.className = 'form-message error';
    msg.style.display = 'block';
  }
};