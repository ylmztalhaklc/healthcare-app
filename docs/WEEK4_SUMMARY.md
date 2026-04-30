# Hafta 4 Geliştirme Özeti

Bu belgede, 4. hafta kapsamında bakıcı (caregiver) tarafındaki görev yönetimi ekranı, görev durum güncelleme akışı ve sorun bildirimi sisteminin geliştirilmesi anlatılmaktadır.

---

## 1. CaregiverTasksScreen — Bakıcı Görev Ekranı

### 1.1 Haftalık Takvim ve Gün Seçimi

Bakıcı, ekran açıldığında içinde bulunduğu haftanın takvimini görür. Her gün bir hücre olarak listelenir; tıklanan güne ait görevler altta listelenir.

- `weekDates` state'i `useEffect` ile hesaplanır: haftanın Pazar'dan başladığı 7 günlük `Date` dizisi oluşturulur.
- Seçili gün `isDateSelected()` fonksiyonu ile karşılaştırılarak vurgulanır; teal arka plan + beyaz metin ile seçili gün belirtilir.
- Gün değişiminde `useEffect([selectedDate])` tetiklenerek `fetchTasks()` çağrılır ve API'den o güne ait görevler çekilir.

### 1.2 Hafta Navigasyon Okları (◁ / ▷)

Takvimin sol ve sağ köşelerine ok butonları eklenerek kullanıcının önceki ya da sonraki haftaya geçmesi sağlandı.

- `weekOffset` state'i (başlangıç 0) artırılıp azaltılarak aktif hafta kaydırılır.
- `useEffect([weekOffset])` hafta değişiminde `weekDates` dizisini yeniden hesaplar; `selectedDate` aynı haftanın aynı gün indexine taşınır, böylece seçili gün bağlamı kaybolmaz.
- Takvim başlığında `MONTHS_TR[selectedDate.getMonth()] + yıl` bilgisi gösterilir.

```js
// weekOffset değişiminde haftayı yeniden hesapla
useEffect(() => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + weekOffset * 7);
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  setWeekDates(dates);
  setSelectedDate(prev => dates[prev.getDay()]);
}, [weekOffset]);
```

### 1.3 Görev Kartları ve Durum Gösterimi

Her görev kartında şunlar bulunur:

- Görev başlığı ve açıklaması
- Saat bilgisi (`scheduled_for` alanından)
- Durum chip'i: `bekliyor`, `devam_ediyor`, `tamamlandi`, `sorun_var` — her biri farklı renk
- Sorun bildirimi varsa ek bir uyarı satırı (ciddi sorunlar kırmızı vurguyla)

### 1.4 Günlük İlerleme Banner'ı

Görev listesinin üstünde, o güne ait tamamlanma yüzdesini gösteren bir banner eklendi:

- `completedCount / tasks.length * 100` hesabıyla yüzde değeri bulunur.
- Renk dolgulu ince bir progress bar ile sayısal değer yan yana gösterilir.
- Görev yoksa banner gizlenir.

---

## 2. Görev Durum Güncelleme Akışı

### 2.1 Durum Geçiş Butonları

Bakıcı, görev kartındaki butonlara basarak durumu ilerletir:

| Mevcut Durum | Eylem Butonu | Yeni Durum |
|-------------|-------------|-----------|
| bekliyor | "Başla" | devam_ediyor |
| devam_ediyor | "Tamamla" | tamamlandi |
| herhangi biri | "Sorun Bildir" | sorun_var |

`PATCH /tasks/status` endpoint'ine `{ task_id, user_id, status }` gönderilir. Yanıt alındıktan sonra `fetchTasks()` çağrılarak liste güncellenir.

### 2.2 Sorun Bildirimi Modal'ı

"Sorun Bildir" butonuna basıldığında bir modal açılır:

- `problemMessage`: Sorunun metin açıklaması (zorunlu)
- `problemSeverity`: Üç seçenekli chip — **Hafif**, **Orta**, **Ciddi**
- Ciddi seçildiğinde chip kırmızı vurgu alır.
- Form gönderildiğinde `PATCH /tasks/status` çağrısına `problem_message` ve `problem_severity` alanları eklenerek gönderilir.
- Ciddi bildirimde backend otomatik olarak hasta yakınına bildirim oluşturur.

```js
await tasksAPI.updateStatus({
  task_id: item.id,
  user_id: user?.id,
  status: TASK_STATUS.PROBLEM,
  problem_message: problemText,
  problem_severity: problemSeverity,
});
```

---

## 3. Fotoğraf ile Görev Belgeleme

"Devam Ediyor" durumundaki görev kartında **"Fotoğraf Ekle & Bitir"** butonu gösterilir.

- `expo-image-picker` ile galeri veya kamera seçimi sunulur.
- Seçilen fotoğraf `POST /tasks/{task_id}/photo` endpoint'ine `multipart/form-data` olarak yüklenir.
- Yükleme başarılıysa görev otomatik olarak `tamamlandi` durumuna geçirilir.
- Backend, `uploads/` klasörüne kaydettiği dosyanın yolunu döner; bu yol `completion_photo_url` alanına yazılır.
- Hasta yakını, kendi görev detay modal'ında bu fotoğrafı görebilir.

---

## Değişiklik Özeti

| Dosya | Yapılan Değişiklik |
|-------|--------------------|
| `CaregiverTasksScreen.jsx` | Haftalık takvim, ◁▷ navigasyon, progress banner, durum butonları |
| `CaregiverTasksScreen.jsx` | Sorun bildirimi modal'ı (hafif/orta/ciddi), fotoğraf yükleme akışı |
| `backend/routers/tasks.py` | `POST /{task_id}/photo` endpoint'i, `UPLOAD_DIR` yapılandırması |
| `backend/main.py` | `StaticFiles` mount, `/uploads` dizini |
| `mobile/src/services/api.js` | `uploadTaskPhoto` multipart yöntemi eklendi |
