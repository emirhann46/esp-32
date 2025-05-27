const mongoose = require('mongoose');

const deviceTitleSchema = new mongoose.Schema({
  device: { type: String, required: true, unique: true },
  title: { type: String, required: true }
});

module.exports = mongoose.model('DeviceTitle', deviceTitleSchema);