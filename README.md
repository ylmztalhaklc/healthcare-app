# HealthCare App — Hasta Bakım Yönetim Sistemi

React Native (Expo) ile geliştirilmiş mobil sağlık yönetim uygulaması. FastAPI tabanlı bir REST backend ile çalışır.


Haftalık güncelleme videolarının bulunduğu drive linki: https://drive.google.com/drive/folders/1BK14QEyJioN4YmG0g28vr3ZP2dDAWeVA?usp=sharing

---

## Proje Hakkında

Hasta yakınları ile hasta bakıcıları arasındaki günlük bakım görevlerini düzenlemek, takip etmek ve raporlamak için geliştirilmiştir. İki kullanıcı rolü desteklenmektedir:

- **Hasta Yakını:** Görev oluşturma ve atama, bakıcı seçimi, mesajlaşma, istatistik ve haftalık rapor takibi
- **Hasta Bakıcısı:** Atanan görevleri görüntüleme ve yönetme, sorun bildirme, mesajlaşma, istatistikler

---

## Teknoloji Yığını

| Katman      | Teknoloji                                      |
|-------------|------------------------------------------------|
| Mobile      | React Native 0.84.1 + Expo SDK 55              |
| Navigasyon  | React Navigation 7 (Stack + Bottom Tabs)       |
| State       | React Context API (Auth, Theme)                |
| HTTP        | Axios                                          |
| Backend     | FastAPI 0.115.6 + Python 3.12                  |
| Veritabani  | SQLite (gelistirme ortami)                     |
| ORM         | SQLAlchemy 2.0                                 |
| Auth        | JWT (python-jose + passlib/bcrypt)             |
| Node        | >= 22.11.0                                     |

---

## Proje Yapısı

```
healthcare-app/
├── start.bat                         # Backend + Expo emulator tek tıkla başlatır (Windows)
├── backend/                          # FastAPI REST API
│   ├── main.py                       # Uygulama girişi: CORS, StaticFiles, startup migrations
│   ├── database.py                   # SQLAlchemy ORM modelleri (User, Task, Message, vb.)
│   ├── schemas.py                    # Pydantic istek/yanıt şemaları (CaregiverStats, RelativeStats vb.)
│   ├── requirements.txt              # Python bağımlılıkları
│   ├── healthcare.db                 # SQLite veritabanı (git'e eklenmez)
│   ├── uploads/                      # Yüklenen görev ve mesaj fotoğrafları
│   └── routers/
│       ├── auth.py                   # Kayıt, giriş, JWT token üretimi
│       ├── tasks.py                  # Görev CRUD, durum güncelleme, fotoğraf yükleme,
│       │                             #   istatistik endpointleri (caregiver + relative)
│       ├── users.py                  # Kullanıcı listeleme, role göre filtreleme
│       ├── notifications.py          # Bildirim listeleme, okundu işaretleme
│       └── messages.py               # Mesaj gönderme/düzenleme/silme, okunmamış sayaç,
│                                     #   fotoğraf eki yükleme
└── mobile/                           # React Native (Expo) mobil uygulama
    ├── App.js                        # Kök bileşen: Provider'ları sarar
    ├── app.json                      # Expo konfigürasyonu (uygulama adı, ikon vb.)
    ├── package.json
    └── src/
        ├── constants/
        │   └── config.js             # API_BASE_URL, ROLES, TASK_STATUS sabitleri,
        │                             #   Türkçe gün/ay isimleri
        ├── context/
        │   ├── AuthContext.jsx       # Kullanıcı oturumu (JWT + AsyncStorage), login/logout
        │   └── ThemeContext.jsx      # Koyu/açık tema geçişi, aktif renk paletini sağlar
        ├── hooks/
        │   └── useUnreadCount.js     # Her ekranda okunmamış bildirim sayısını 30s'de bir çeker
        ├── utils/
        │   └── helpers.js            # getUserInitials, getTimeStr, getShortTimeStr yardımcı fonk.
        ├── navigation/
        │   ├── RootNavigator.jsx     # Auth durumuna göre AuthStack/AppTabs arasında yönlendirir
        │   ├── AuthStack.jsx         # Giriş ve kayıt ekranları stack'i
        │   └── AppTabs.jsx           # Role göre alt tab navigasyonu (hasta yakını / bakıcı)
        ├── screens/
        │   ├── auth/
        │   │   ├── LoginScreen.jsx   # Giriş ekranı (rol seçimi, e-posta, şifre)
        │   │   └── RegisterScreen.jsx# Kayıt ekranı (ad, rol, e-posta, şifre)
        │   ├── relative/             # Hasta Yakını ekranları
        │   │   ├── RelativeTasksScreen.jsx
        │   │   │                     # Haftalık takvim (◁▷ navigasyon), görev listesi,
        │   │   │                     #   görev oluşturma/düzenleme/silme modal'ları,
        │   │   │                     #   görev detay (fotoğraf, sorun, yıldız değerlendirme)
        │   │   ├── RelativeStatsScreen.jsx
        │   │   │                     # Tamamlanma oranı tile'ları, 4-haftalık sorun trendi,
        │   │   │                     #   ciddi sorun uyarısı, tüm bakıcıların performans listesi
        │   │   ├── RelativeMessagesScreen.jsx  # (Tab üzerinden MessagesScreen'e yönlendirir)
        │   │   └── RelativeNotificationsScreen.jsx
        │   ├── caregiver/            # Hasta Bakıcısı ekranları
        │   │   ├── CaregiverTasksScreen.jsx
        │   │   │                     # Haftalık takvim (◁▷ navigasyon), günlük görev listesi,
        │   │   │                     #   ilerleme banner'ı, durum güncelleme, fotoğraf yükleme,
        │   │   │                     #   sorun bildirimi modal'ı (hafif/orta/ciddi)
        │   │   ├── CaregiverStatsScreen.jsx
        │   │   │                     # Haftalık performans bar grafiği, tamamlanma/sorun tile'ları,
        │   │   │                     #   performans özet tablosu
        │   │   ├── CaregiverMessagesScreen.jsx
        │   │   └── CaregiverNotificationsScreen.jsx
        │   └── common/
        │       ├── ChatScreen.jsx    # 1'e-1 sohbet: mesaj gönderme, fotoğraf eki,
        │       │                     #   mesaj düzenleme (alt banner UX), silme, 5s polling
        │       ├── MessagesScreen.jsx# Konuşma listesi, arama, okunmamış rozet
        │       └── NotificationsScreen.jsx
        │                             # Bildirim listesi, okundu işaretleme,
        │                             #   ciddi sorun bildirimleri için kırmızı banner
        ├── services/
        │   └── api.js                # Axios instance (JWT interceptor, 401 auto-logout),
        │                             #   authAPI, tasksAPI, usersAPI, messagesAPI, notificationsAPI
        ├── components/
        │   └── common/
        │       ├── BreathingOrb.jsx  # Animasyonlu nefes alan arka plan orb bileşeni,
        │       │                     #   PlusWatermark ve EkgWatermark filigran bileşenleri
        │       ├── TabBarIcon.jsx    # Alt navigasyon sekme ikonları
        │       └── PlaceholderScreen.jsx
        └── theme/
            ├── colors.js             # Koyu/açık tema renk paletleri, health semantik token'ları
            │                         #   (heartRate, oxygen vb.), gradients export'u
            ├── index.js              # Tüm tema token'larını export eder; teal glow shadow sistemi
            └── typography.js         # Font boyutu ve ağırlık sabitleri
```

### Katman Özeti

| Katman | Klasör / Dosya | Görev |
|--------|---------------|-------|
| API İstemcisi | `services/api.js` | Tüm HTTP çağrıları tek yerden yönetilir |
| Global State | `context/` | Oturum ve tema; her bileşenden `useAuth()` / `useTheme()` ile erişilir |
| Navigasyon | `navigation/` | Auth durumuna + role göre hangi tab/stack gösterileceğini belirler |
| Ekranlar | `screens/` | Her ekran kendi state'ini ve API çağrısını taşır |
| Tema | `theme/` | Renk, tipografi ve gölge token'ları merkezi olarak tutulur |
| Backend | `backend/routers/` | Her router bir domain'e karşılık gelir (auth, tasks, messages, notifications, users) |

---

## Kurulum

### Gereksinimler

- Python 3.12
- Node.js >= 22.11.0
- Android Studio + Android emulator (AVD)
- Expo CLI (`npm install -g expo-cli`)

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Swagger dokumantasyonu: http://localhost:8000/docs

### 2. Mobile (Android Emulator)

```bash
cd mobile
npm install
npx expo start --android --clear
```

> Android emulator başlatılmış olmalıdır.
> Emulator, host makinenin `localhost:8000` adresine `10.0.2.2:8000` üzerinden erişir.
> `src/constants/config.js` içindeki `API_BASE_URL` değerini gerekmesi halinde degiştirin.

### 3. Tek Adımda Başlatma (Windows)

Proje kök dizinindeki `start.bat` dosyasını çift tiklayarak çalıştırın. Backend ve Expo her biri ayrı bir pencerede başlar.

---

## API Özeti

| Method | Endpoint                                  | Aciklama                              |
|--------|-------------------------------------------|---------------------------------------|
| POST   | /auth/register                            | Kullanıcı Kaydı                       |
| POST   | /auth/login                               | Giriş, JWT döndürür                   |
| GET    | /tasks/                                   | Görev listesi                         |
| POST   | /tasks/                                   | Yeni görev oluştur                    |
| PATCH  | /tasks/{id}                               | Görev güncelle / durum degiştir       |
| DELETE | /tasks/{id}                               | Görev sil                             |
| GET    | /tasks/stats/caregiver/{user_id}          | Bakıcı istatistikleri + haftalık veri |
| GET    | /messages/user/{user_id}/conversations    | Konuşmalar + okunmamış mesaj sayısı   |
| GET    | /messages/{user_id}/{contact_id}          | Mesaj gecçişi                         |
| POST   | /messages/                                | Mesaj gönder                          |
| GET    | /notifications/{user_id}                  | Bildirimler                           |
| GET    | /users/caregivers                         | Bakıcı listesi                        |

---

## Ortam Degişkenleri

`backend/.env` dosyası aşağıdaki değişkeni içermelidir:

```
SECRET_KEY=gizli-bir-değer
```

JWT imzalama için kullanılır. Üretim ortamında güçlü ve rastgele bir değer kullanın.

---

## Haftalik Ilerleme

[docs/WEEKLY_PROGRESS.md](docs/WEEKLY_PROGRESS.md) dosyasına bakınız.


