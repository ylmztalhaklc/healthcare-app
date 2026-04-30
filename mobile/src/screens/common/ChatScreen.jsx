import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { messagesAPI } from '../../services/api';
import { API_BASE_URL } from '../../constants/config';

export default function ChatScreen({ route, navigation }) {
    const { contactId, contactName } = route.params;
    const { user } = useContext(AuthContext);
    const { colors } = useTheme();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sendingPhoto, setSendingPhoto] = useState(false);
    const flatListRef = useRef();

    // Edit/delete state
    const [menuMsg, setMenuMsg] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    const fetchMessages = useCallback(async () => {
        try {
            const res = await messagesAPI.getConversation(user.id, contactId);
            setMessages(res.data);
        } catch (error) {
            console.warn('Mesajlar yüklenemedi', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id, contactId]);

    useFocusEffect(
        useCallback(() => {
            messagesAPI.markAllReadFrom(user.id, contactId).catch(() => {});
            fetchMessages();
        }, [user?.id, contactId, fetchMessages])
    );

    useEffect(() => {
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    const handleSend = async () => {
        if (!text.trim()) return;
        const content = text.trim();
        setText('');
        try {
            await messagesAPI.send({ sender_id: user.id, receiver_id: contactId, content });
            fetchMessages();
        } catch (error) {
            console.warn('Mesaj gönderilemedi', error);
        }
    };

    const handleSendPhoto = async () => {
        Alert.alert('Fotoğraf Gönder', 'Kaynak seçin', [
            {
                text: 'Galeri', onPress: async () => {
                    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (status !== 'granted') { Alert.alert('İzin Gerekli', 'Galeri erişimi gerekiyor.'); return; }
                    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.7 });
                    if (!r.canceled) _uploadPhoto(r.assets[0].uri);
                },
            },
            {
                text: 'Kamera', onPress: async () => {
                    const { status } = await ImagePicker.requestCameraPermissionsAsync();
                    if (status !== 'granted') { Alert.alert('İzin Gerekli', 'Kamera erişimi gerekiyor.'); return; }
                    const r = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.7 });
                    if (!r.canceled) _uploadPhoto(r.assets[0].uri);
                },
            },
            { text: 'İptal', style: 'cancel' },
        ]);
    };

    const _uploadPhoto = async (uri) => {
        setSendingPhoto(true);
        try {
            const msgRes = await messagesAPI.send({ sender_id: user.id, receiver_id: contactId, content: '📷 Fotoğraf' });
            const messageId = msgRes.data.id;
            await messagesAPI.uploadAttachment(messageId, uri);
            fetchMessages();
        } catch (e) {
            console.warn('Fotoğraf gönderilemedi', e);
            Alert.alert('Hata', 'Fotoğraf gönderilemedi.');
        } finally {
            setSendingPhoto(false);
        }
    };

    const handleEditSave = async () => {
        if (!editText.trim() || !editingId) return;
        try {
            await messagesAPI.editMessage({ message_id: editingId, new_content: editText.trim() });
            setMessages(prev => prev.map(m => m.id === editingId ? { ...m, content: editText.trim(), is_edited: true } : m));
        } catch { console.warn('Mesaj düzenlenemedi'); }
        finally { setEditingId(null); setEditText(''); }
    };

    const handleDelete = async (msgId) => {
        try {
            await messagesAPI.deleteMessage(msgId);
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: 'Bu mesaj silindi.', is_deleted: true } : m));
        } catch { console.warn('Mesaj silinemedi'); }
        setMenuMsg(null);
    };

    const renderItem = ({ item }) => {
        const isMe = item.sender_id === user.id;
        const isDeleted = item.is_deleted;
        const isEditing = editingId === item.id;
        const attachment = item.attachments && item.attachments.length > 0 ? item.attachments[0] : null;
        const isPhotoMsg = attachment && attachment.file_type === 'image';

        return (
            <TouchableOpacity
                onLongPress={() => { if (isMe && !isDeleted) setMenuMsg(item); }}
                activeOpacity={0.85}
            >
                <View style={[
                    styles.msgContainer,
                    isMe ? styles.myMsg : styles.theirMsg,
                    isPhotoMsg ? { padding: 4, backgroundColor: 'transparent' } :
                        { backgroundColor: isMe ? colors.primary : colors.surface2, opacity: isDeleted ? 0.55 : 1 }
                ]}>
                    {isPhotoMsg ? (
                        <View>
                            <Image
                                source={{ uri: `${API_BASE_URL}${attachment.file_path}` }}
                                style={{ width: 200, height: 200, borderRadius: 12 }}
                                resizeMode="cover"
                            />
                            <Text style={{ fontSize: 9, color: colors.textMuted, marginTop: 2, textAlign: isMe ? 'right' : 'left' }}>
                                {new Date(item.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    ) : isEditing ? (
                        <View>
                            <Text style={{
                                color: isMe ? colors.textInverse : colors.textPrimary,
                                fontSize: 14,
                                opacity: 0.6,
                                fontStyle: 'italic',
                            }}>
                                {item.content}
                            </Text>
                            <Text style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.6)' : colors.primary, marginTop: 4, fontWeight: '600' }}>
                                ✏️ Aşağıdan düzenleyebilirsiniz
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Text style={{
                                color: isMe ? colors.textInverse : (isDeleted ? colors.textMuted : colors.textPrimary),
                                fontStyle: isDeleted ? 'italic' : 'normal',
                                fontSize: 14,
                            }}>
                                {item.content}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end', marginTop: 4 }}>
                                {item.is_edited && !isDeleted && (
                                    <Text style={{ fontSize: 9, color: isMe ? 'rgba(0,0,0,0.4)' : colors.textMuted }}>düzenlendi</Text>
                                )}
                                <Text style={[styles.msgTime, { color: isMe ? 'rgba(0,0,0,0.45)' : colors.textSecondary }]}>
                                    {new Date(item.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        </>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{contactName}</Text>
            </View>

            {/* Message action menu */}
            <Modal transparent animationType="fade" visible={!!menuMsg} onRequestClose={() => setMenuMsg(null)}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => setMenuMsg(null)} activeOpacity={1}>
                    <View style={{ backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden', minWidth: 180, borderWidth: 1, borderColor: colors.border }}>
                        {menuMsg && !menuMsg.is_deleted && (
                            <TouchableOpacity style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}
                                onPress={() => { setEditingId(menuMsg.id); setEditText(menuMsg.content); setMenuMsg(null); }}>
                                <Ionicons name="create-outline" size={18} color={colors.primary} />
                                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>Düzenle</Text>
                            </TouchableOpacity>
                        )}
                        <View style={{ height: 1, backgroundColor: colors.border }} />
                        <TouchableOpacity style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}
                            onPress={() => handleDelete(menuMsg?.id)}>
                            <Ionicons name="trash-outline" size={18} color={colors.error} />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.error }}>Sil</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
                {loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} /> :
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={i => i.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={{ padding: 16 }}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />
                }

                <View style={[styles.inputRow, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    {/* Edit mode banner */}
                    {editingId && (
                        <View style={[styles.editBanner, { backgroundColor: colors.primarySoft, borderTopColor: colors.primary }]}>
                            <Ionicons name="create-outline" size={14} color={colors.primary} />
                            <Text style={{ flex: 1, fontSize: 12, color: colors.primary, fontWeight: '600' }}>Mesaj düzenleniyor</Text>
                            <TouchableOpacity onPress={() => { setEditingId(null); setEditText(''); setText(''); }}>
                                <Ionicons name="close" size={18} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                        {!editingId && (
                            <TouchableOpacity
                                onPress={handleSendPhoto}
                                style={[styles.iconBtn, { borderColor: colors.border }]}
                                disabled={sendingPhoto}
                            >
                                {sendingPhoto
                                    ? <ActivityIndicator size="small" color={colors.primary} />
                                    : <Ionicons name="camera-outline" size={22} color={colors.primary} />
                                }
                            </TouchableOpacity>
                        )}
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface2, color: colors.textPrimary, borderColor: editingId ? colors.primary : colors.border }]}
                            value={editingId ? editText : text}
                            onChangeText={editingId ? setEditText : setText}
                            placeholder={editingId ? 'Mesajı düzenleyin...' : 'Mesajınızı yazın...'}
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            autoFocus={!!editingId}
                        />
                        <TouchableOpacity
                            onPress={editingId ? handleEditSave : handleSend}
                            style={[styles.sendBtn, { backgroundColor: editingId ? colors.success : colors.primary }]}
                        >
                            <Ionicons name={editingId ? 'checkmark' : 'send'} size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    backBtn: { paddingRight: 16 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    msgContainer: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
    myMsg: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    theirMsg: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
    msgTime: { fontSize: 10, alignSelf: 'flex-end' },
    inputRow: { flexDirection: 'column', padding: 10, borderTopWidth: 1, gap: 6 },
    editBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 4, borderTopWidth: 2, borderRadius: 8, marginBottom: 2 },
    iconBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    input: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, maxHeight: 100, fontSize: 14 },
    sendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});
