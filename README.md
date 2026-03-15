# HealthCare App — Hasta Bakım Yönetim Sistemi

React Native ile geliştirilmiş mobil sağlık yönetim uygulaması.

---

## Proje Hakkında

Bu uygulama, hasta yakınları ile hasta bakıcıları arasındaki günlük bakım görevlerini düzenlemek, takip etmek ve raporlamak için geliştirilmiştir. İki kullanıcı rolü desteklenmektedir:

- **Hasta Yakını:** Görev ataması, değerlendirme, mesajlaşma, istatistik takibi
- **Hasta Bakıcısı:** Atanan görevleri yönetme, sorun bildirme, mesajlaşma

---

## Teknoloji Yığını

| Katman       | Teknoloji                        |
|--------------|----------------------------------|
| Mobile       | React Native 0.84.1 (Bare CLI)  |
| Navigasyon   | React Navigation 7               |
| State        | React Context API               |
| HTTP         | Axios                            |
| Backend      | FastAPI 0.115.6 + Python 3.12   |
| Veritabanı   | SQLite (geliştirme)              |
| ORM          | SQLAlchemy 2.0                   |
| Auth         | JWT (python-jose + passlib)      |

---

## Klasör Yapısı

```
healthcare-app/
├── backend/
│   ├── main.py              # FastAPI uygulama girişi
│   ├── database.py          # SQLAlchemy modelleri
│   ├── schemas.py           # Pydantic şemaları
│   ├── requirements.txt
│   ├── .env
│   └── routers/
│       ├── auth.py
│       ├── tasks.py
│       ├── users.py
│       ├── notifications.py
│       └── messages.py
├── mobile/
│   ├── App.tsx
│   ├── src/
│   │   ├── context/         # ThemeContext, AuthContext
│   │   ├── navigation/      # RootNavigator, AuthStack, AppTabs
│   │   ├── screens/
│   │   │   ├── auth/        # LoginScreen, RegisterScreen
│   │   │   ├── relative/    # Hasta Yakını ekranları
│   │   │   └── caregiver/   # Hasta Bakıcı ekranları
│   │   ├── theme/           # colors.js, typography.js
│   │   ├── services/        # api.js (Axios)
│   │   ├── constants/       # config.js
│   │   └── components/
└── docs/
    └── WEEKLY_PROGRESS.md
```

---

## Kurulum

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API Docs: http://localhost:8000/docs

### Mobile (Android)

```bash
cd mobile
npm install
npx react-native run-android
```

> Android emülatörü veya bağlı cihaz gereklidir.
> `src/constants/config.js` içindeki `API_BASE_URL` değerini cihazınıza göre güncelleyin.

---

## Haftalık İlerleme

[docs/WEEKLY_PROGRESS.md](docs/WEEKLY_PROGRESS.md) dosyasına bakınız.


