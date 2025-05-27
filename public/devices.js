fetch('/api/devices')
  .then(response => response.json())
  .then(devices => {
    const list = document.getElementById('device-list');
    devices.forEach(device => {
      const item = document.createElement('div');
      item.className = 'device-item';

      item.innerHTML = `
        <strong>${device.id}</strong>
        <button class="toggle-details" onclick="location.href='device.html?id=${device.id}'">Detaya Git</button>
      `;

      list.appendChild(item);
    });
  })
  .catch(err => console.error('Cihazlar yüklenemedi:', err));