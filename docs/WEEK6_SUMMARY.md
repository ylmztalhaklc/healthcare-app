# Hafta 6 Geliştirme Özeti

Bu belgede, 6. hafta kapsamında bildirimler ekranının geliştirilmesi, istatistik ekranlarının tamamlanması, şema düzeltmeleri ve kapsamlı UI/UX iyileştirmeleri anlatılmaktadır.

---

## 1. Bildirimler Ekranı

### 1.1 Bildirim Listesi

`NotificationsScreen` artık tam fonksiyoneldir:

- `notificationsAPI.getAll(userId)` ile kullanıcının tüm bildirimleri çekilir.
- Okunmamış bildirimler yüzey rengiyle, okunmuşlar soluk arka planla ayrıştırılır.
- Her bildirim kartında başlık, mesaj, ilgili kullanıcı adı ve zaman bilgisi gösterilir.
- Tek bildirime tıklamak `notificationsAPI.markRead(id)` çağırır ve lokal state güncellenir.
- "Tümü Oku" butonu `notificationsAPI.markAllRead(userId)` çağırarak tüm listeyi okundu yapar.

### 1.2 Ciddi Sorun Bildirimleri — Kırmızı Banner

Başlığında `CİDDİ` veya `CIDDI` geçen bildirimler özel uyarı görünümüyle öne çıkar:

- Kart sol kenarında kalın kırmızı kenarlık (`borderLeftWidth: 4`, `colors.error`)
- Kartın üstünde kırmızı arka planlı `⚠ CİDDİ SORUN BİLDİRİMİ` rozeti
- Başlık metni ve okunmamış nokta da kırmızı renk alır
- Okunmamış ciddi bildirimler `rgba(248,113,113,0.18)` hafif kırmızı arka planla vurgulanır

```jsx
const isCiddi = item.title?.includes('CİDDİ') || item.title?.includes('CIDDI');
```

---

## 2. İstatistik Ekranları

### 2.1 CaregiverStatsScreen — Bakıcı İstatistikleri

`GET /tasks/stats/caregiver/{user_id}` endpoint'i genişletilerek daha fazla veri dönmeye başladı:

- `problems_reported`: Toplam sorun bildirimi sayısı
- `ciddi_problems`: Ciddi seviyesindeki sorun sayısı
- `weekly_data`: Pazartesi–Pazar arası günlük `{ total, completed, rate }` dizisi

Ekranda bu verilerle şunlar gösterilir:

| Bölüm | İçerik |
|-------|--------|
| 4 Stat Tile | Tamamlanan, Tamamlanma %, Aktif Sorun, Ortalama Puan |
| Haftalık Bar Grafiği | 7 günlük tamamlanma oranı bar grafiği; bugünün sütunu teal vurguyla |
| Performans Özet Tablosu | Toplam, Tamamlanan, Oran, Bugünkü Görev, Bildirilen Sorun, Ciddi Sorun, Ort. Puan |

Bugünün bar sütunu `(new Date().getDay() + 6) % 7` indeksiyle bulunur ve `colors.primary` renk alır; diğer günler `colors.primarySoft` ile gösterilir.

### 2.2 RelativeStatsScreen — Hasta Yakını İstatistikleri

`GET /tasks/stats/relative/{user_id}` endpoint'i de yeni alanlarla genişletildi:

- `ciddi_problems`: Ciddi seviyeli sorun sayısı
- `problem_trend`: Son 4 haftanın haftalık sorun sayısı dizisi `[{ week, count }]`

Ekranda iki ana bölüm bulunur:

**Bölüm 1 — Genel Bakım Özeti:**
- 4 tile: Tamamlanan, Tamamlanma %, Bildirilen Sorun, Çözülen Sorun
- Sorun Trendi bar grafiği: 4 haftalık sorun yoğunluğu; bar yükseklikleri normalize edilir, sıfır olan haftalar gri
- Ciddi sorun varsa grafik altında `⚠ X ciddi sorun bildirildi` uyarısı çıkar

**Bölüm 2 — Bakıcı Performansı:**
- Sistemdeki tüm bakıcılar liste halinde gösterilir; her satırda ⭐ ortalama puan, görev sayısı ve tamamlanma yüzdesi
- Bir satıra tıklanınca satır genişler: haftalık bar grafiği + özet tablo
- Tüm bakıcıların istatistikleri sayfa açılışında `Promise.all` ile paralel çekilir

### 2.3 Backend İstatistik Endpoint'leri

**`GET /tasks/stats/relative/{user_id}` dönüş alanları:**

```python
return {
    "total_tasks": total,
    "completed_tasks": completed,
    "active_tasks": active,
    "completion_rate": ...,
    "problems_reported": problems,
    "ciddi_problems": ciddi,
    "problems_resolved": resolved,
    "problem_trend": [{"week": 0..3, "count": n}, ...],  # son 4 hafta
}
```

**`GET /tasks/stats/caregiver/{user_id}` dönüş alanları:**

```python
return {
    "total_assigned": total,
    "completed_tasks": completed,
    "completion_rate": ...,
    "avg_rating": ...,
    "tasks_today": tasks_today,
    "problems_reported": problems_reported,
    "ciddi_problems": ciddi_problems,
    "weekly_data": [{"day": 0..6, "total": n, "completed": n, "rate": n}, ...],
}
```

---

## 3. Renk Sistemi ve UI İyileştirmeleri

### 3.1 Sağlık Temalı Renk Paleti

`theme/colors.js` tamamen yeniden yazıldı:

- **Dark tema**: Arka plan `#0D1B2A` (derin okyanus gecesi), primary `#00C9A7` (teal-mint)
- **Light tema**: Arka plan `#EEF9F7` (nefes alan mint-krem), primary `#009E82` (koyu teal)
- Yeni token'lar: `primarySoft`, `primaryGlow`, `primaryGlow2`, `accent`, `accentPurple`, `accentWarm`
- Durum token'ları: `successSoft`, `warningSoft`, `errorSoft`, `infoSoft`
- `health` nesnesi: `heartRate`, `oxygen`, `glucose`, `pressure`, `medication`, `sleep`, `activity`, `temperature`
- `gradients` export'u: LinearGradient için hazır renk çiftleri

`theme/index.js`'deki shadow sistemi teal glow tabanlı güncellendi:
- `shadow.sm/md/lg` → `shadowColor: '#00C9A7'` ile teal glow efekti
- `shadow.error` → kırmızı glow (sorun kartları için)
- `shadow.warning` → amber glow (uyarı kartları için)

### 3.2 BreathingOrb Bileşeni

`components/common/BreathingOrb.jsx` dosyası oluşturuldu:

- **`BreathingOrb`**: `Animated.loop` ile scale (1→1.18) ve opacity nefes animasyonu; `pointerEvents="none"` ile etkileşimi engeller. Props: `color`, `size`, `duration`, `opacity`, `style`
- **`PlusWatermark`**: Artı sembolü filigranı (sağlık teması), opacity 0.055
- **`EkgWatermark`**: EKG çizgisi filigranı (değişken yükseklikte bar'lar), opacity 0.07

Tüm ekran header'larına ve Auth ekranlarının hero bölümlerine entegre edildi:

| Ekran | Entegrasyon |
|-------|-------------|
| LoginScreen | 2× BreathingOrb + PlusWatermark + EkgWatermark |
| RegisterScreen | 2× BreathingOrb + PlusWatermark + EkgWatermark |
| Tüm tab ekranları | Header sağ üstüne 1× BreathingOrb |

### 3.3 Diğer UX İyileştirmeleri

- `LoginScreen` ve `RegisterScreen` hero bölümünde logo kartına teal glow shadow eklendi
- Tüm header `<View>`'larına `overflow: 'hidden'` eklenerek orb taşmasının önüne geçildi
- Tema geçiş butonunda ikon rengi güncellendi (light modda `colors.primary`)

---

## 4. Schemas.py Düzeltmeleri

`backend/schemas.py`'daki şema tanımları router'ın döndürdüğü alanlarla senkronize edildi:

- `WeeklyPoint` ve `DailyPerf` yardımcı şemaları eklendi
- `RelativeStats`: `ciddi_problems`, `problem_trend: List[WeeklyPoint]` alanları eklendi
- `CaregiverStats`: `problems_reported`, `ciddi_problems`, `weekly_data: List[DailyPerf]` alanları eklendi
- `MessageOut.attachments: List[MessageAttachmentOut]` için eksik `List` import'u eklendi (`NameError` düzeltildi)

---

## Değişiklik Özeti

| Dosya | Yapılan Değişiklik |
|-------|--------------------|
| `NotificationsScreen.jsx` | Bildirim listesi, okundu işaretleme, ciddi sorun kırmızı banner |
| `CaregiverStatsScreen.jsx` | 4 tile, 7 günlük bar grafik, özet tablo, problems alanları |
| `RelativeStatsScreen.jsx` | Tam yeniden yazım: genel özet, sorun trendi, bakıcı listesi + detay |
| `backend/routers/tasks.py` | Her iki stats endpoint'ine yeni alanlar eklendi |
| `backend/schemas.py` | CaregiverStats + RelativeStats güncellendi, List import düzeltildi |
| `theme/colors.js` | Kapsamlı sağlık temalı renk sistemi, health + gradients export |
| `theme/index.js` | Teal glow shadow sistemi, health + gradients re-export |
| `components/common/BreathingOrb.jsx` | BreathingOrb, PlusWatermark, EkgWatermark bileşenleri |
| Tüm ekran header'ları | BreathingOrb entegrasyonu, overflow: hidden |
