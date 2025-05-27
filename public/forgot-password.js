document.getElementById('forgotForm').onsubmit = async function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();

  try {
    const res = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    const msg = document.getElementById('resetMsg');
    msg.textContent = data.message;
    msg.className = 'form-message ' + (data.success ? 'success' : 'error');
  } catch (err) {
    console.error(err);
  }
};
