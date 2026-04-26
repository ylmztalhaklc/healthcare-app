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

## Klasor Yapisi

```
healthcare-app/
├── start.bat                # Backend + emulator tek tıklama başlangıcı (Windows)
├── backend/
│   ├── main.py              # FastAPI uygulama girisi, CORS, startup migrations
│   ├── database.py          # SQLAlchemy modelleri ve engine
│   ├── schemas.py           # Pydantic istek/yanıt şemaları
│   ├── requirements.txt
│   └── routers/
│       ├── auth.py          # Kayiı, giriş, JWT
│       ├── tasks.py         # Görev CRUD, istatistik, haftalik veri
│       ├── users.py         # Kullanıcı listeleme
│       ├── notifications.py # Bildirimler
│       └── messages.py      # Mesajlaşma, okunmamış mesaj sayısı
└── mobile/
    ├── App.js
    ├── app.json
    └── src/
        ├── constants/
        │   └── config.js    # API_BASE_URL ve uygulama sabitleri
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ThemeContext.jsx
        ├── navigation/
        │   ├── RootNavigator.jsx
        │   ├── AuthStack.jsx
        │   └── AppTabs.jsx
        ├── screens/
        │   ├── auth/        # LoginScreen, RegisterScreen
        │   ├── relative/    # Home, Tasks, Messages, Notifications, Stats
        │   ├── caregiver/   # Home, Tasks, Messages, Notifications, Stats
        │   └── common/      # ChatScreen
        ├── services/
        │   └── api.js       # Axios instance ve endpoint çağrıları
        ├── theme/           # colors.js, typography.js
        └── components/
            └── common/      # TabBarIcon, PlaceholderScreen
```

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


