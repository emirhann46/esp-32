// public/script.js

const socket = io();
const lastUpdateElement = document.getElementById('last-update');
const mqttStatusElement = document.getElementById('mqtt-status');

function updateLEDStatus(leds) {
  Object.entries(leds).forEach(([ledId, ledData]) => {
    const ledCard = document.querySelector(`.led-card[data-led="${ledId}"]`);
    if (!ledCard) return;

    ledCard.classList.remove('led-on', 'led-off', 'led-unknown');
    ledCard.classList.add(`led-${ledData.state.toLowerCase()}`);

    ledCard.querySelector('.led-state').textContent =
      ledData.state === 'ON' ? 'AÇIK' :
      ledData.state === 'OFF' ? 'KAPALI' : 'BİLİNMİYOR';

    const updateTime = ledData.lastUpdate ?
      new Date(ledData.lastUpdate).toLocaleTimeString() : '-';
    ledCard.querySelector('.last-update').textContent = updateTime;
  });

  if (lastUpdateElement)
    lastUpdateElement.textContent = new Date().toLocaleTimeString();
}

socket.on('connect', () => {
  mqttStatusElement.textContent = 'Bağlı';
  mqttStatusElement.style.color = 'green';

  fetch('/api/leds')
    .then(res => res.json())
    .then(updateLEDStatus);
});

socket.on('disconnect', () => {
  mqttStatusElement.textContent = 'Bağlantı kesildi';
  mqttStatusElement.style.color = 'red';
});

socket.on('led-status', (leds) => {
  updateLEDStatus(leds);
});
