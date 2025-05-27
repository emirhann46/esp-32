# E-posta Konfigürasyonu

Bu uygulamada şifre sıfırlama özelliği için e-posta gönderimi yapılmaktadır. E-posta servisini kullanabilmek için aşağıdaki adımları takip edin.

## Gmail Konfigürasyonu (Önerilen)

1. `.env` dosyasını düzenleyin ve şu satırları güncelleyin:

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

2. Gmail için App Password (Uygulama Şifresi) oluşturun:
   - Gmail hesabınızın güvenlik ayarlarına gidin
   - 2-Factor Authentication'ı etkinleştirin
   - "App passwords" bölümünden yeni bir uygulama şifresi oluşturun
   - Bu şifreyi `EMAIL_PASS` olarak kullanın (normal Gmail şifrenizi değil)

## Outlook/Hotmail Konfigürasyonu

```env
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_password
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

## Test Etme

1. Sunucuyu başlatın: `node server.js`
2. Console loglarını kontrol edin:
   - "E-posta konfigürasyonu" mesajını göreceksiniz
   - "E-posta sunucusu bağlantısı başarılı" mesajı gelirse konfigürasyon doğru
3. Şifre sıfırlama özelliğini test edin

## Hata Giderme

### "E-posta konfigürasyonu eksik" hatası:
- `.env` dosyasının proje ana dizininde olduğundan emin olun
- `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_HOST` değerlerinin doldurulduğunu kontrol edin

### "E-posta sunucusuna bağlanılamıyor" hatası:
- Gmail için uygulama şifresi kullandığınızdan emin olun
- 2-Factor Authentication'ın etkin olduğunu kontrol edin
- Host ve port bilgilerinin doğru olduğunu kontrol edin

### "Authentication failed" hatası:
- Gmail için: Uygulama şifresini yeniden oluşturun
- Outlook için: Hesap güvenlik ayarlarını kontrol edin

## Güvenlik Notları

- Asla gerçek şifrelerinizi `.env` dosyasında saklamayın
- Gmail için mutlaka app password kullanın
- `.env` dosyasını git repository'sine eklemeyin (.gitignore'a ekleyin)
