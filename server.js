const express = require('express');
const mqtt = require('mqtt');
const socketIo = require('socket.io');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const SensorData = require('./models/SensorData');
const DeviceTitle = require('./models/deviceTitle');

const app = express();
app.use(bodyParser.json());

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/mqtt_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB bağlantısı başarılı!");
}).catch((err) => {
  console.error("MongoDB bağlantı hatası:", err);
});

// Admin hesabı kontrolü
User.findOne({ username: "admin" }).then(admin => {
  if (!admin) {
    User.create({ username: "admin", password: "1234", role: "admin" });
  }
});

const mqttBroker = process.env.MQTT_BROKER || 'mqtt://192.168.1.26';
const mqttClient = mqtt.connect(mqttBroker);

const leds = {
  led12: { pin: 12, name: "Kırmızı LED", state: "OFF", lastUpdate: null },
  led27: { pin: 27, name: "Mavi LED", state: "OFF", lastUpdate: null }
};

const devices = {
  esp32_led_01: {
    id: "esp32_led_01",
    ip: "192.168.1.30",
    signal: -60,
    topic: "esp32/led/12/status",
    lastUpdate: null
  },
  esp32_led_02: {
    id: "esp32_led_02",
    ip: "192.168.1.31",
    signal: -67,
    topic: "esp32/led/27/status",
    lastUpdate: null
  }
};

// Statik dosyalar
app.use(express.static(path.join(__dirname, 'public')));

// API: Cihaz başlığı getir
app.get('/api/device-title/:device', async (req, res) => {
  try {
    const device = req.params.device;
    const found = await DeviceTitle.findOne({ device });
    res.json({ title: found ? found.title : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Cihaz başlığı güncelle
app.put('/api/device-title/:device', async (req, res) => {
  try {
    const device = req.params.device;
    const { title } = req.body;
    const updated = await DeviceTitle.findOneAndUpdate(
      { device },
      { title },
      { upsert: true, new: true }
    );
    res.json({ success: true, title: updated.title });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sunucuyu başlat
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server http://localhost:${port} adresinde çalışıyor`);
});

const io = socketIo(server);

// MQTT bağlantısı ve mesajlar
mqttClient.on('connect', () => {
  console.log('MQTT broker bağlantısı başarılı');
  mqttClient.subscribe('esp32/led/12/status');
  mqttClient.subscribe('esp32/led/27/status');
});

mqttClient.on('message', (topic, message) => {
  const now = new Date();
  const msg = message.toString();

  if (topic === 'esp32/led/12/status') {
    leds.led12.state = msg;
    leds.led12.lastUpdate = now;
    devices.esp32_led_01.lastUpdate = now;
  } else if (topic === 'esp32/led/27/status') {
    leds.led27.state = msg;
    leds.led27.lastUpdate = now;
    devices.esp32_led_02.lastUpdate = now;
  }

  io.emit('led-status', leds);
});

// LED durumlarını al
app.get('/api/leds', (req, res) => {
  res.json(leds);
});

// Tüm kullanıcıları al
app.get('/api/all-users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Tüm cihazları al
app.get('/api/devices', (req, res) => {
  res.json(Object.values(devices));
});

// Tek cihazı al
app.get('/api/device/:id', (req, res) => {
  const device = devices[req.params.id];
  if (device) {
    res.json(device);
  } else {
    res.status(404).json({ message: 'Cihaz bulunamadı' });
  }
});

// Giriş işlemi
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    res.json({ success: true, user });
  } else {
    res.json({ success: false, message: "Kullanıcı bulunamadı" });
  }
});

// Kayıt işlemi
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Tüm alanlar zorunludur.' });
  }

  if (username === "admin") {
    return res.status(403).json({ success: false, message: "Admin hesabı bu şekilde oluşturulamaz!" });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Bu kullanıcı adı zaten var" });
    }

    const newUser = new User({ username, email, password, role: "user" });
    await newUser.save();

    res.status(201).json({ success: true, message: "Kayıt başarılı, giriş sayfasına yönlendiriliyorsunuz." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Sunucu hatası." });
  }
});

// Sensör verisi kaydet
app.post('/api/sensor', async (req, res) => {
  const { device, sicaklik, basinc, ruzgar } = req.body;
  try {
    const data = new SensorData({ device, sicaklik, basinc, ruzgar });
    await data.save();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Son sensör verisini al
app.get('/api/sensor/:device', async (req, res) => {
  const { device } = req.params;
  try {
    const data = await SensorData.findOne({ device }).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Şifre sıfırlama bağlantısı gönderme
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  // E-posta konfigürasyonu kontrolü
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_HOST) {
    console.error('E-posta konfigürasyonu eksik! .env dosyasını kontrol edin.');
    return res.json({
      success: false,
      message: "E-posta servisi şu anda kullanılamıyor. Lütfen yönetici ile iletişime geçin."
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ success: false, message: "Bu e-posta ile kayıtlı kullanıcı bulunamadı." });
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.resetToken = token;
  user.tokenExpiration = Date.now() + 3600000; // 1 saat geçerli
  await user.save();

  const resetLink = `http://localhost:3000/reset-password.html?token=${token}`;

  // E-posta transporter konfigürasyonu
  const transporterConfig = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // Geliştirme ortamı için
    }
  };

  console.log('E-posta konfigürasyonu:', {
    host: transporterConfig.host,
    port: transporterConfig.port,
    user: transporterConfig.auth.user ? 'Ayarlandı' : 'Eksik',
    pass: transporterConfig.auth.pass ? 'Ayarlandı' : 'Eksik'
  });

  const transporter = nodemailer.createTransport(transporterConfig);

  // Bağlantı testi
  try {
    await transporter.verify();
    console.log('E-posta sunucusu bağlantısı başarılı');
  } catch (verifyError) {
    console.error('E-posta sunucusu bağlantı hatası:', verifyError.message);
    return res.json({
      success: false,
      message: "E-posta sunucusuna bağlanılamıyor. Konfigürasyonu kontrol edin."
    });
  }

  const mailOptions = {
    from: `"Şifre Sıfırlama" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Şifre Sıfırlama Linki',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Şifre Sıfırlama</h2>
        <p>Merhaba,</p>
        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
        <p><a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Şifremi Sıfırla</a></p>
        <p>Bu bağlantı 1 saat süreyle geçerlidir.</p>
        <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('E-posta başarıyla gönderildi:', info.messageId);
    res.json({ success: true, message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." });
  } catch (err) {
    console.error('E-posta gönderme hatası:', err);
    res.json({
      success: false,
      message: `E-posta gönderilemedi: ${err.message}`
    });
  }
});

// Şifre sıfırlama işlemi
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  const user = await User.findOne({
    resetToken: token,
    tokenExpiration: { $gt: Date.now() }
  });

  if (!user) {
    return res.json({ success: false, message: "Geçersiz veya süresi dolmuş bağlantı." });
  }

  user.password = newPassword;
  user.resetToken = undefined;
  user.tokenExpiration = undefined;
  await user.save();

  res.json({ success: true, message: "Şifreniz başarıyla güncellendi." });
});
