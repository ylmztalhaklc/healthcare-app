# Hafta 3 Geliştirme Özeti

Bu belgede, 3. hafta kapsamında hasta yakını (relative) kullanıcılarına yönelik Görevler ve İstatistik ekranlarında yapılan geliştirmeler özetlenmektedir.

---

## 1. Görevler Ekranı — Tam CRUD ve Saat Seçici

### 1.1 Görev Oluşturma Modalı

Hasta yakını, "+" butonu aracılığıyla yeni bir görev oluşturabilir hale getirildi. Bu modal içinde:

- **Başlık ve Açıklama** alanları zorunlu / opsiyonel olarak ayarlandı.
- **Bakıcı Seçimi Zorunlu Kılındı:** Bakıcı seçilmeden görev eklenemez; eksik alanda kullanıcıya uyarı gösterilir.
- **Saat Seçici (Clock Picker):** Hızlı saat butonları ve serbest metin girişi yerine tamamen özel bir analog saat yüzü bileşenine geçildi.
  - İlk adımda saat seçilir (dış halka 1–12, iç halka 0 ve 13–23).
  - Saat seçildikten sonra otomatik dakika adımına geçilir (0, 5, 10, ..., 55 şeklinde daire üzerinde).
  - Dakika adımında ayrıca 0–59 arası herhangi bir değeri elle yazmak için küçük bir metin kutusu sunulur.
  - Geçmişteki saat/dakika kombinasyonları soluk gösterilir ve tıklanamaz hale getirilir.
- **UTC Kayma Sorunu Çözüldü:** `toISOString()` kullanımı yerine yerel saat bilgisi `YYYY-MM-DDTHH:MM:00` formatında string olarak backend'e gönderilir; böylece UTC+3 farkından kaynaklanan 3 saatlik kayma giderildi.

### 1.2 Görev Düzenleme

Kart üzerindeki "Düzenle" butonuna basıldığı zaman mevcut başlık ve açıklama alanlarının dolu olarak getirilmesi sağlandı. Önceki versiyonda bu alanlar boş geliyordu ve kayıt sırasında açıklama üzerine yazılıyordu. Düzeltme ile birlikte kullanıcı yalnızca değiştirmek istediği kısmı günceller.

Düzenlemeler `task_templates` tablosuna yazılacak şekilde güncellendi:
- Backend'e `PATCH /tasks/template/{template_id}` endpoint'i eklendi.
- Bu endpoint hem `task_templates` satırını hem de bağlı tüm `task_instances` satırlarını günceller.

### 1.3 Görev Silme

Silme işlemi de `task_templates` tablosu üzerinden yapılacak şekilde güncellendi:
- Backend'e `DELETE /tasks/template/{template_id}` endpoint'i eklendi.
- Silme işlemi önce bağlı `task_instances` kayıtlarını kaldırır, ardından `task_templates` satırını siler; böylece veritabanı bütünlüğü korunur.

### 1.4 Hata Yakalama İyileştirmesi

Güncelleme ve silme işlemlerindeki `catch` blokları düzenlendi; hata mesajları artık backend'den gelen `detail` alanını ya da JavaScript hata metnini gösteriyor; hata kodu da geliştirici konsoluna yazılıyor.

---

## 2. İstatistik Ekranı

Hasta yakını, `RelativeStatsScreen` üzerinden sistemdeki bakıcılardan birini seçerek o bakıcıya ait görev istatistiklerini görebilmektedir.

### 2.1 Bakıcı Seçim Akışı

- Ekran açıldığında `usersAPI.getByRole('hasta_bakici')` çağrısı yapılır ve sistemdeki tüm bakıcılar listelenir.
- Kullanıcı listeden bir bakıcı seçtiğinde o bakıcının istatistikleri otomatik olarak yüklenir (`selectedCaregiver` değişimi `useEffect` ile izlenir).
- Bakıcı arama kutusu ile uzun listelerde filtreleme yapılabilmektedir.

### 2.2 Gösterilen İstatistikler

Seçilen bakıcıya ait `tasksAPI.getCaregiverStats(bakiciId)` endpoint'i çağrılarak dönen verilerle şu kartcıklar gösterilir:

| Kart | Açıklama |
|------|----------|
| Tamamlanan | O bakıcıya atanmış ve tamamlandı durumundaki görev sayısı |
| Tamamlanma Oranı | Tamamlanan / Toplam * 100 değeri |
| Ortalama Puan | Hasta yakını tarafından verilen yıldız puanlarının ortalaması |
| Bugünkü Görev | Bugüne zamanlanmış görev sayısı |

### 2.3 Kod Açıklamaları

- `useEffect(() => { if (selectedCaregiver) fetchStats(selectedCaregiver.id); }, [selectedCaregiver]);`
  Bakıcı seçimi değiştiğinde istatistikler otomatik yenilenir; gereksiz çağrının önüne geçmek için `selectedCaregiver` koşuluyla guard edilmiştir.

- `tasksAPI.getCaregiverStats(cgId)` → `GET /tasks/stats/caregiver/{user_id}`
  Backend bu endpoint üzerinden toplam, tamamlanan, tamamlanma oranı, ortalama puan ve bugünün görevlerini hesaplayıp döner.

- `const statTiles = stats ? [...] : [];`
  İstatistik verisi henüz yüklenmemişse boş dizi döndürülerek ekranda boş kart render edilmesinin önüne geçilir.

---

## Değişiklik Özeti

| Dosya | Yapılan Değişiklik |
|-------|--------------------|
| `RelativeTasksScreen.jsx` | Analog clock picker, UTC düzeltmesi, edit/delete template API, bakıcı zorunluluğu |
| `RelativeStatsScreen.jsx` | Bakıcı seçimi, getCaregiverStats entegrasyonu, istatistik kartları |
| `backend/routers/tasks.py` | `PATCH /tasks/template/{id}` ve `DELETE /tasks/template/{id}` eklendi |
| `backend/schemas.py` | `TaskInstanceOut`'a `template_id` alanı eklendi |
| `mobile/src/services/api.js` | `updateTemplate`, `deleteTemplate` metodları eklendi |
| `backend/main.py` | CORS `allow_origins` listesi web portları için düzeltildi |

