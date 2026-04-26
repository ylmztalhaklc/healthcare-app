import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { messagesAPI } from '../../services/api';

export default function ChatScreen({ route, navigation }) {
    const { contactId, contactName } = route.params;
    const { user } = useContext(AuthContext);
    const { colors } = useTheme();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef();

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        messagesAPI.markAllReadFrom(user.id, contactId).catch(() => {});
        return () => clearInterval(interval);
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await messagesAPI.getConversation(user.id, contactId);
            setMessages(res.data);
        } catch (error) {
            console.warn("Mesajlar yüklenemedi", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!text.trim()) return;
        try {
            const res = await messagesAPI.send({
                sender_id: user.id,
                receiver_id: contactId,
                content: text.trim()
            });
            setMessages([...messages, res.data]);
            setText('');
        } catch (error) {
            console.warn("Mesaj gönderilemedi", error);
        }
    };

    const renderItem = ({ item }) => {
        const isMe = item.sender_id === user.id;
        return (
            <View style={[styles.msgContainer, isMe ? styles.myMsg : styles.theirMsg, { backgroundColor: isMe ? colors.primary : colors.surface2 }]}>
                <Text style={{ color: isMe ? '#fff' : colors.textPrimary }}>{item.content}</Text>
                <Text style={[styles.msgTime, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
                    {new Date(item.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
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
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface2, color: colors.textPrimary, borderColor: colors.border }]}
                        value={text}
                        onChangeText={setText}
                        placeholder="Mesajınızı yazın..."
                        placeholderTextColor={colors.textSecondary}
                    />
                    <TouchableOpacity onPress={handleSend} style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
                        <Ionicons name="send" size={18} color="#fff" />
                    </TouchableOpacity>
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
    msgTime: { fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },
    inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, alignItems: 'center' },
    input: { flex: 1, borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, marginRight: 12, maxHeight: 100 },
    sendBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 24 }
});