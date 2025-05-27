console.log("logout.js yüklendi"); // Test için

function logout() {
  console.log("Çıkış fonksiyonu çağrıldı"); // Test için
  localStorage.removeItem("user");
  const msg = document.getElementById('logoutMsg');
  if (msg) {
    msg.textContent = "Başarıyla çıkış yapıldı!";
    msg.className = "form-message success";
    msg.style.display = "block";
    setTimeout(() => window.location.href = "login.html", 2000);
  } else {
    window.location.href = "login.html";
  }
}
