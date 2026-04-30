# Hafta 5 Geliştirme Özeti

Bu belgede, 5. hafta kapsamında mesajlaşma sisteminin geliştirilmesi; ChatScreen UX iyileştirmeleri ve mesaj eki (fotoğraf) desteğinin eklenmesi anlatılmaktadır.

---

## 1. Mesajlaşma Sistemi — Altyapı ve Liste Ekranı

### 1.1 MessagesScreen — Konuşmalar Listesi

`MessagesScreen`, her iki rol için de ortak olarak kullanılır. Kullanıcının mesajlaştığı kişileri liste halinde gösterir.

- `messagesAPI.getUserConversations(userId)` çağrısıyla konuşma listesi çekilir.
- Her konuşma satırında şunlar bulunur: karşı tarafın baş harfleri (avatar), adı, son mesaj önizlemesi, zaman bilgisi ve okunmamış mesaj sayısı rozeti.
- `useFocusEffect` ile ekrana her odaklanıldığında liste yenilenir; okunmamış rozetler güncel kalır.
- Bir konuşmaya tıklanınca `ChatScreen`'e `contactId` ve `contactName` parametreleriyle geçilir.

### 1.2 Okunmamış Mesaj Sayacı

Tab bar'da ve header'da okunmamış mesaj sayısı göstergesi eklendi:

- `useUnreadCount(userId)` hook'u oluşturuldu. `useFocusEffect` + 30 saniyelik `setInterval` ile polling yapar.
- Her ekranın header'ındaki bildirim butonunda okunmamış bildirim rozeti gösterilir.
- `messagesAPI.markAllReadFrom(receiverId, senderId)` ile bir sohbet açıldığında mesajlar okundu olarak işaretlenir.

```js
// useUnreadCount.js — 30s polling
useFocusEffect(useCallback(() => {
  fetchCount();
  const t = setInterval(fetchCount, 30000);
  return () => clearInterval(t);
}, [userId]));
```

---

## 2. ChatScreen — Bire-Bir Mesajlaşma

### 2.1 Mesaj Listesi ve Gönderme

- `messagesAPI.getConversation(userA, userB)` ile mesajlar çekilir.
- `FlatList` ile mesajlar gösterilir; `onContentSizeChange` olayında otomatik en alta kaydırılır.
- 5 saniyelik `setInterval` ile mesajlar arka planda yenilenerek gerçek zamanlıya yakın deneyim sağlanır.
- Gönderme: `messagesAPI.send({ sender_id, receiver_id, content })` → başarı sonrası `fetchMessages()` çağrılır.
- Gönderilen mesajlar sağda teal arka planla, alınan mesajlar solda yüzey rengiyle gösterilir.

### 2.2 Mesaj Düzenleme — Bottom Bar UX

Bir mesaja uzun basıldığında açılan menüden "Düzenle" seçildiğinde:

- Mesaj baloncuğu orjinal metni soluk ve italik gösterir; altında "✏️ Aşağıdan düzenleyebilirsiniz" ipucu çıkar.
- Alttaki input bar'ın üstünde bir `editBanner` belirir: "Mesaj düzenleniyor" yazısı ve ✕ ile iptal butonu.
- TextInput düzenleme moduna girer; border rengi `colors.primary` olur.
- Gönder butonu yeşil renge döner ve gönder ikonunun yerini tik (✓) alır.
- Kaydet'e basılınca `messagesAPI.editMessage({ message_id, new_content })` çağrılır; liste local olarak güncellenir, API çağrısı beklenilmez.

### 2.3 Mesaj Silme

- Uzun bas menüsündeki "Sil" seçeneğiyle `messagesAPI.deleteMessage(id)` çağrılır.
- Silinen mesaj "Bu mesaj silindi." metniyle gri italik olarak gösterilmaya devam eder; `is_deleted: true` flag'i kontrol edilir.

### 2.4 Fotoğraf Eki Gönderme

"Kamera" butonu ile kullanıcı galeriden veya kameradan fotoğraf seçebilir:

- `expo-image-picker` ile izin alınır, fotoğraf seçilir.
- Önce `messagesAPI.send({ content: '📷 Fotoğraf' })` ile mesaj oluşturulur.
- Dönen `message_id` ile `messagesAPI.uploadAttachment(messageId, uri)` çağrılır; fotoğraf `multipart/form-data` ile sunucuya yüklenir.
- Ek fotoğraf içeren mesajlarda metin yerine 200×200 boyutlu `Image` bileşeni gösterilir.

---

## 3. Backend — Mesaj Eki Desteği

### 3.1 MessageAttachment Modeli

`database.py`'a `MessageAttachment` tablosu eklendi:

```python
class MessageAttachment(Base):
    __tablename__ = "message_attachments"
    id         = Column(Integer, primary_key=True)
    message_id = Column(Integer, ForeignKey("messages.id"))
    file_type  = Column(String)   # image | file
    file_path  = Column(String)
    file_name  = Column(String, nullable=True)
```

### 3.2 Yeni Endpoint'ler

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/messages/{message_id}/attachment` | Mesaja fotoğraf eki yükle |
| PATCH | `/messages/edit` | Mesaj içeriğini güncelle |
| DELETE | `/messages/{id}` | Mesajı sil (soft delete) |
| PATCH | `/messages/read-all/{receiver}/{sender}` | Tüm mesajları okundu işaretle |

### 3.3 _build_msg_out Yardımcı Fonksiyonu

Tüm mesaj yanıtlarında ek (attachment) bilgisinin tutarlı biçimde dönmesi için `_build_msg_out(msg, attachments)` fonksiyonu yazıldı. Her mesaj listesi endpoint'i bu fonksiyonu kullanır.

---

## Değişiklik Özeti

| Dosya | Yapılan Değişiklik |
|-------|--------------------|
| `ChatScreen.jsx` | Edit bottom-bar UX, mesaj silme, fotoğraf eki gönderme, 5s polling |
| `MessagesScreen.jsx` | Konuşma listesi, okunmamış rozet, useFocusEffect yenileme |
| `hooks/useUnreadCount.js` | 30s polling hook oluşturuldu |
| `backend/routers/messages.py` | Attachment endpoint, edit, delete, read-all, _build_msg_out |
| `backend/database.py` | MessageAttachment modeli eklendi |
| `backend/schemas.py` | MessageAttachmentOut, MessageOut.attachments alanı |
| `mobile/src/services/api.js` | uploadAttachment, editMessage, deleteMessage, markAllReadFrom |
