# Hafta 2 Gelistirme Ozeti

Bu belgede, 2. hafta kapsaminda hasta yakini (relative) kullanicilarin gorevlerini gorebilecegi ana ekran uzerinde yapilan guncellemeler ve saglanan entegrasyonlar ozetlenmektedir.

## Yapilan Guncellemeler

### Gorevler Ekraninin Olusturulmasi
Hasta yakinlari icin daha once sadece yer tutucu (placeholder) olarak birakilan "Gorevler" ekrani, gercek verilerle calisacak sekilde yeniden tasarlandi. Bu ekranda kullanicilarin kendi secili tarihe ait gorevlerini listeleyebilecekleri bir yapi kuruldu.

- **Kullanici Dogrulamasi Entegrasyonu (AuthContext):** Ekrana giren kullanicinin kimlik bilgilerini (ozellikle id degerini) almak icin mevcut AuthContext kullanildi. Boylece veri cekilirken dogrudan o anki oturumdaki kullanicinin verileri listelenmis oluyor.
- **State ve Yaşam Dongusu Yonetimi (useState, useEffect):** Sayfa ilk acildiginda uygulamanin backend tarafindan verileri getirmesi icin "useEffect" kancasi eklendi. Listelenecek gorevler, guncel tarih bilgisi ve verilerin yuklenme durumunu takip etmek icin uc ayri durum (state) tanimlandi.
- **Backend API Baglantisi:** Daha once yazilmis olan "tasksAPI.getRelativeTasks" fonksiyonu calistirilarak backend sistemine baglanti saglandi. Boylece sistem, gecerli kullanici ve belirlenen tarihteki kayitlari JSON olarak donduruyor.
- **Kullanici Arayuzu (UI) ve Stil Guncellemeleri:** Veriler flat list (liste) bileseni ile ekrana yansitildi. Eger kullanicinin o gune ait bir gorevi yoksa onu bilgilendiren bos bir yazi cikarildi. Ayrica veri cekilirken yuklenme indikatoru (donen cark) eklendi. Renkli kart tasarima (baslik, aciklama, durum) gecildi ve sade stiller ile duzenlendi.

## Incelenen Kodlara Ait Aciklamalar

- `import { tasksAPI } from '../../services/api';`
  Backend uzerindeki /tasks endpoint'lerine istek atmak icin tanimli islevleri iceri aldik.
  
- `const { user } = useContext(AuthContext);`
  Sisteme giris yapmis olan kullanicinin bilgilerini globale yazdigimiz context uzerinden mudehale etmeden sayfa icine cektik.
  
- `const fetchTasks = async () => {...}`
  Veritabanina istek atan asenkron fonksiyonumuz. Kullanicinin id degerini ve sistemin tarihini alip tasksAPI icerisine gondererek o gune ozgu gorev listesini "tasks" isimli state icerisine aktariyor.
  
- `<FlatList ... />`
  Dizi halindeki gorev kartlarini cok daha performansli bir sekilde ekranda alt alta basmamizi saglayan React Native bileseni. Kendi icinde her satirda "renderTask" islemini donerek tasarladigimiz veri kartini gorsellestiriyor.

Bu adimlardan sonra, uygulamanin hasta yakini sekmesindeki gorevler kismi basariyla backend sisteminden veri okuyabilir ve bunlari listeler duruma gelmistir.
