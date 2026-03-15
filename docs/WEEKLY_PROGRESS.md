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

## HAFTA 2 — (Gelecek)

_Henüz başlanmadı._

---

## HAFTA 3 — (Gelecek)

_Henüz başlanmadı._

---

## HAFTA 4 (Vize) — (Gelecek)

_Henüz başlanmadı._

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
