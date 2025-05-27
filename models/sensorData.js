const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  device: { type: String, required: true }, // Hangi cihazdan geldiği (ör: esp32_1)
  sicaklik: Number,
  basinc: Number,
  ruzgar: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SensorData', sensorDataSchema);