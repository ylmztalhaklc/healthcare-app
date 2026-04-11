# Haftalık Geliştirme Günlüğü

---

## HAFTA 1 — Proje Kurulumu ve Altyapı

**Tarih:** 2025-01-17  
**Süre:** ~6 saat  
**Durum:** ✅ Tamamlandı

### Bu Hafta Yapılanlar

**Backend (FastAPI)**
- FastAPI + SQLAlchemy mimarisi kuruldu
- 6 temel model tanımlandı: User, TaskTemplate, TaskInstance, Notification, Message, MessageAttachment
- JWT tabanlı kimlik doğrulama sistemi (kayıt + giriş)
- 5 router oluşturuldu: auth, tasks, users, notifications, messages
- Pydantic v2 schema'ları yazıldı
- SQLite veritabanı entegrasyonu
- Ortam değişkenleri (.env) yapılandırması

**Mobile (React Native 0.84.1)**
- React Native Bare CLI projesi oluşturuldu
- Klasör yapısı (`src/screens`, `src/navigation`, `src/theme`, `src/context`, `src/services`, `src/constants`) kuruldu
- Tema sistemi: `colors.js` (dark + light), `typography.js`, `theme/index.js`
- Context'ler: `ThemeContext`, `AuthContext`
- Navigasyon: `RootNavigator`, `AuthStack`, `AppTabs` (rol bazlı)
- API servisi: Axios instance + tüm endpoint'ler
- Login ekranı — sayfa tasarımı tamamlandı
- Register ekranı — sayfa tasarımı + rol seçimi tamamlandı
- Tüm tab ekranları (8 adet) placeholder olarak oluşturuldu
- Paketler kuruldu: `@react-navigation/*`, `react-native-screens`, `@react-native-async-storage`, `axios`

**Tasarım**
- [design-prototype/index.html](../design-prototype/index.html) — 9 ekranlı interaktif HTML prototipi
- Dark/Light mod desteği
- SVG ikonlar, renk token sistemi

### Sonraki Hafta (Hafta 2)

- Login + Register ekranları backend ile tam entegrasyon
- Hasta Yakını: Görevler ekranı (takvim şeridi, görev listesi)
- Hasta Yakını: Görev detay modal (derecelendirme)
- Figma tasarımları başlanacak (en az 4 ekran)

---

## HAFTA 2 — API Entegrasyonu ve Authentication

**Tarih:** 2025-01-24  
**Süre:** ~7 saat  
**Durum:** ✅ Tamamlandı

### Bu Hafta Yapılanlar

**Backend (FastAPI)**
- Bcrypt dependency sorunu çözüldü (passlib 1.7.4 + bcrypt 3.2.2)
- Authentication sistemi tam olarak test edildi ve çalışır duruma getirildi
- JWT token oluşturma ve doğrulama sistemi aktif
- ✅ **DELETE /tasks/{task_id}** endpoint eklendi

**Mobile Frontend (React Native + Expo)**
- [RelativeTasksScreen.jsx](../mobile/src/screens/relative/RelativeTasksScreen.jsx) ve [RelativeTasksScreen.jsx (Expo)](../mobile-expo/src/screens/relative/RelativeTasksScreen.jsx) gerçek veri çekecek şekilde güncelendi
  - Backend'den Relative kullanıcı görevlerini çeken API entegrasyonu yapıldı
  - State yönetimi ve useEffect kancaları eklendi
  - Yükleme indikatörü eklendi
  - Görev kartları listeleme UI'ı oluşturuldu
  - ✅ Theme toggle buton eklendi (☀️ / 🌙 emoji'leri ile)
- [AuthContext.jsx](../mobile/src/context/AuthContext.jsx) tam fonksiyonel
  - Login ve Register fonksiyonları çalışıyor
  - AsyncStorage üzerinde token yönetimi yapılıyor
- API config'i web ve emülatör için ayarlandı (localhost:8000)

**Landing Pages (Dashboard/Ana Sayfa Ekranları)**
- ✅ [RelativeHomeScreen.jsx](../mobile-expo/src/screens/relative/RelativeHomeScreen.jsx) oluşturuldu
  - Kullanıcı karşılaması ve rol bilgisi
  - Görev istatistikleri kartları (Toplam, Tamamlanan, Aktif, Tamamlama Oranı)
  - Raporlanan sorunlar bölümü
  - Profili Düzenle ve Çıkış Yap butonları
  - Light/Dark mode toggle buton
- ✅ [CaregiverHomeScreen.jsx](../mobile-expo/src/screens/caregiver/CaregiverHomeScreen.jsx) oluşturuldu  
  - Hasta Bakıcı için görev istatistikleri
  - Atanan görevler, tamamlanan, ortalama rating, bugünün görevleri
  - Tamamlama oranı progress bar'ı
  - Light/Dark mode toggle buton
- ✅ Navigation güncellendi
  - AppTabs.jsx'e Home tab'ı eklendi (ilk sekme)
  - TabBarIcon.jsx'e 🏠 home emoji'si eklendi

**Theme Toggle & UI Geliştirmeleri**
- ✅ [LoginScreen.jsx](../mobile-expo/src/screens/auth/LoginScreen.jsx)'te theme toggle buton eklendi
- ✅ [RegisterScreen.jsx](../mobile-expo/src/screens/auth/RegisterScreen.jsx)'te theme toggle buton eklendi
- Light mode: ☀️ emoji
- Dark mode: 🌙 emoji
- Tüm ekranlar theme context'i kullanarak live renk değişikliği gösteriyor

**API Service Güncellemeleri**
- [mobile-expo/src/services/api.js](../mobile-expo/src/services/api.js) güncellendi
  - ✅ `tasksAPI.deleteTask(taskId)` metodu eklendi
- [mobile/src/services/api.js](../mobile/src/services/api.js) güncellendi  
  - ✅ `tasksAPI.deleteTask(taskId)` metodu eklendi

**Entegrasyon Testleri**
- Web tarayıcısında (Expo) kayıt işlemi test edildi ✅
- Login işlemi başarıyla çalıştırıldı ✅
- Backend API Swagger UI'ında endpoints doğrulandı ✅
- JWT token oluşturma ve doğrulama test edildi ✅

### Sonuç

Hafta 2 sonu itibariyle:
- Backend API ve Authentication sistemi %100 tamamlandı ✅
- Mobile uygulama API ile iletişim kuruyor ✅
- Kullanıcı kaydı ve girişi sorunsuz çalışıyor ✅
- Landing page/Home screen'ler tamamlandı ✅
- Theme toggle (Light/Dark mode) tüm sayfalar için aktif ✅
- Foundation katmanı tamamlandı ✅

### Sonraki Hafta (Hafta 3)

- Görev detay ve değerlendirme modalı (Relative ve Caregiver)
- Takvim pikerı (görev tarihi seçim)
- Mesajlaşma ekranı (UI ve API entegrasyonu)
- Bildirimler ekranı
- Emülatörde tam uygulamayı test etme
- Figma tasarımları başlama (4-6 ekran)

---

## HAFTA 3 — Görev Yönetimi, Saat Seçici ve İstatistik Ekranı

**Tarih:** 2026-04-05  
**Süre:** ~6 saat  
**Durum:** ✅ Tamamlandı

### Bu Hafta Yapılanlar

**Görevler Ekranı — Tam CRUD**
- Görev oluşturma modalı tamamlandı: başlık, açıklama, bakıcı seçimi ve saat girişi
- **Bakıcı seçimi zorunlu** hale getirildi; seçilmeden görev eklenemiyor
- Düzenleme modalı düzeltildi: "Düzenle" açıldığında mevcut başlık ve açıklama dolu geliyor (önceden boş başlıyordu ve kayıtta açıklama siliniyordu)
- Güncelleme ve silme işlemleri `task_instances` yerine `task_templates` tablosuna yönlendirildi
  - `PATCH /tasks/template/{template_id}` — şablonu ve bağlı tüm instance'ları günceller
  - `DELETE /tasks/template/{template_id}` — önce instance'ları, sonra şablonu siler
- Hata yakalama geliştirildi: backend `detail` mesajı ekrana ve konsola yansıtılıyor

**Analog Saat Seçici (Clock Picker)**
- Hızlı buton listesi ve serbest TextInput kaldırıldı
- Tamamen özel analog saat yüzü bileşeni eklendi:
  - **Saat adımı:** Dış halka 1–12, iç halka 0 ve 13–23 (24 saatlik format)
  - **Dakika adımı:** Daire üzerinde 0, 5, 10, ..., 55 seçenekleri + 0–59 arası elle giriş kutusu
  - Akrep animasyonu: seçilen saat/dakikaya göre döner
  - Geçmiş zaman kombinasyonları soluk ve tıklanamaz
- UTC kayma sorunu çözüldü: `toISOString()` yerine `YYYY-MM-DDTHH:MM:00` formatında yerel saat string'i gönderiliyor (UTC+3 farkından kaynaklanan 3 saatlik hata giderildi)

**İstatistik Ekranı**
- `RelativeStatsScreen` bakıcı seçim akışıyla tamamlandı
- Ekran açılışında tüm bakıcılar listelenir; seçim yapılınca istatistikler otomatik yüklenir
- Gösterilen istatistik kartları: Tamamlanan, Tamamlanma Oranı, Ortalama Puan, Bugünkü Görev
- `tasksAPI.getCaregiverStats(id)` → `GET /tasks/stats/caregiver/{user_id}` entegrasyonu

**Backend & API Güncellemeleri**
- `schemas.py`: `TaskInstanceOut`'a `template_id` alanı eklendi
- `api.js`: `updateTemplate` ve `deleteTemplate` metodları eklendi
- `main.py`: CORS `allow_origins` wildcard (`*`) yerine Expo web portları açıkça listelendi (`localhost:8081`, `localhost:8082`, `localhost:19006`)

### Sonraki Hafta (Hafta 4 — Vize)

- İstatistik ekranına grafik/görsel gösterim eklenmesi
- Mesajlaşma ekranının tam test edilmesi
- Bildirimler ekranının gözden geçirilmesi
- Gerçek cihazda uçtan uca test
- Figma tasarımları (4–6 ekran)

---

## HAFTA 4 (Vize) — UI Polisman, Gercek Veri Entegrasyonu ve Tek Tikla Baslatma

**Tarih:** 2026-04-11
**Sure:** ~8 saat
**Durum:** Tamamlandi

### Bu Hafta Yapananlar

**Mesajlasma Ekranlari — Kart Tasarimi ve Okunmamis Gostergesi**

- `RelativeMessagesScreen` ve `CaregiverMessagesScreen` yeniden tasarlandi
- Her konusma bir kart olarak listeleniyor: son mesaj, son mesaj saati ve okunmamis mesaj sayisi gosteriliyor
- Okunmamis mesaj varsa kart kenari canli bir nabiz animasyonu (Animated API ile loop) gosteriyor
- Karta ilk tiklandiktan sonra animasyon duruyor, kart okundu olarak isaretleniyor
- `GET /messages/user/{user_id}/conversations` endpoint'i `unread_count` ve `last_message_time` dondurur hale getirildi

**Gorev Ekrani — Gorev Karti ve Modal Iyilestirmeleri**

- Gorev kartlarina filigran (pozisyonu mutlak, saydam daire) eklendi; renk gorev durumuna gore eslesiyor, temaya gore farkli opakllikta gosteriliyor
- Yildiz degerlendirme simgeleri "Tamamlandi" etiketinin altinda, ortalanmis sekilde hizalandi
- Varsayilan saat alani bos basliyor ("Saat secin..." placeholderli); saat secici acildiginda saatin mevcut tamam saate gore onceden seciyor
- Modal disina tiklandikinda hem gorev ekleme hem de bakici secici panel kapaniyor

**Bakici Secici Panel — Tek Panel Yaklasimi**

- Bakici secici, ayri bir `Modal` olarak calisiyordu; bu yaklasim gorev ekleme modalinin yuksekligini eslestiremiyordu
- Bakici secici tamamen kaldirilip gorev ekleme `modalSheet` View'inin icine `position: absolute, top:0, left:0, right:0, bottom:0` olarak yerlestirildi
- Boylece panel her iki yone de tamamen gorev ekleme panelini kapliyor, bosluk ve yukseklik farki sorunu ortadan kalkti
- `modalSheet`'e `overflow: hidden` eklendi

**Istatistik Ekrani — Gercek Haftalik Veri ve Gorsel Iyilestirmeler**

- `GET /tasks/stats/caregiver/{user_id}` endpointi `weekly_data` dizisi dondurur hale getirildi: her gun icin `{day, total, completed, rate}` yapisi (Pzt=0, Paz=6)
- Haftalık grafik artik backend'den gelen gercek verilerle doluyor
- Secili bakicinin karti yesil arka plan ve onay simgesiyle vurgulanıyor
- "Degistir" butonu hem `selectedCaregiver` hem de `stats` state'ini temizliyor; istatistikler ancak bakici secildikten sonra gosteriliyor
- Istatistik kutucuklarinin genislikleri esitlendi (`flexBasis` / `flexGrow` ile)
- Her kutucugun filigran rengi kendi ikon rengiyle eslestirildi
- Kart baslik satirlarinda ikon hizalama duzeltildi

**Saat Secici — Gecmis Saat Engeli Duzeltmesi**

- Android emulatorunde `new Date()` UTC donebiliyordu (Turkiye UTC+3); bu nedenle saat engeli 3 saat geriden okuyordu
- `Intl.DateTimeFormat` tabanli `getLocalNowHM()` ve `isTodayLocal()` yardimci fonksiyonlari yazildi
- Tum `getHours()`/`getMinutes()` cagrilari bu fonksiyonlarla degistirildi; artik emulator uzerinde de dogru yerel saat okunuyor

**Tek Tikla Baslatma ve Emulator Saat Dilimi Ayari**

- `start.bat` olusturuldu: cift tikla her iki servisi de ayri `cmd` penceresinde baslatir
  - Backend: `python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000`
  - Expo: `npx expo start --android --clear`
- Expo basladiktan 30 saniye sonra `adb` ile emulatorun saat dilimi `Europe/Istanbul` olarak ayarlaniyor
- `README.md` tum degisikliklere gore guncellendi: kurulum adimlari, klasor yapisi, API tablosu ve ortam degiskenleri bolumleri yeniden yazildi

---

## HAFTA 5 — (Gelecek)

_Henüz başlanmadı._

---

## HAFTA 6 — (Gelecek)

_Henüz başlanmadı._

---

## HAFTA 7 — (Gelecek)

_Henüz başlanmadı._

---

## HAFTA 8 — (Gelecek)

_Henüz başlanmadı._

---

## HAFTA 9 — (Gelecek)

_Henüz başlanmadı._

---

## HAFTA 10 (Final) — (Gelecek)

_Henüz başlanmadı._
