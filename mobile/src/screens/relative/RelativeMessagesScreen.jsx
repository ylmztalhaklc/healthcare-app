import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { messagesAPI, usersAPI } from '../../services/api';

export default function RelativeMessagesScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { colors, isDark, toggleTheme } = useTheme();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [startLoading, setStartLoading] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    intervalRef.current = setInterval(fetchConversations, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await messagesAPI.getUserConversations(user?.id);
      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch {} finally { setLoading(false); }
  };

  const openNewMessage = async () => {
    setShowNewMsg(true);
    try {
      const res = await usersAPI.getAll();
      setUsers((res.data || []).filter(u => u.id !== user?.id));
    } catch {}
  };

  const startChat = () => {
    if (!selectedUser) return;
    setStartLoading(true);
    setTimeout(() => {
      setStartLoading(false);
      setShowNewMsg(false);
      setSelectedUser(null);
      navigation.navigate('ChatScreen', { contactId: selectedUser.id, contactName: selectedUser.full_name });
    }, 300);
  };

  const getUserInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(x => x[0]).join('').substring(0, 2).toUpperCase();
  };

  const getTimeStr = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const filtered = conversations.filter(c => (c.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
      <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[s.greeting, { color: colors.textSecondary }]}>Mesajlar</Text>
          <Text style={[s.headerName, { color: colors.textPrimary }]}>{user?.full_name || 'Misafir'}</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]} onPress={toggleTheme}>
            <Text style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]} onPress={() => navigation.navigate('Notifications')}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]} onPress={() => setShowUserMenu(true)}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>{getUserInitials(user?.full_name)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal transparent animationType="fade" visible={showUserMenu} onRequestClose={() => setShowUserMenu(false)}>
        <TouchableOpacity style={s.menuOverlay} onPress={() => setShowUserMenu(false)} activeOpacity={1}>
          <View style={[s.userMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity style={s.menuItem} onPress={() => { setShowUserMenu(false); logout(); }}>
              <Text style={{ fontSize: 13, color: colors.error }}>Çıkış Yap</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={[s.searchWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TextInput
          style={[s.searchInput, { backgroundColor: colors.surface2, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Ara..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={s.empty}>
          <Text style={[s.emptyText, { color: colors.textSecondary }]}>Henuz mesaj yok</Text>
          <Text style={[s.emptyHint, { color: colors.textSecondary }]}>Bakiciniziyla konusmaya baslayin</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => String(item.id || i)}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.convRow, { borderBottomColor: colors.border }]}
              onPress={() => navigation.navigate('ChatScreen', { contactId: item.id || item.user_id, contactName: item.name || item.full_name })}
            >
              <View style={[s.avatar, { backgroundColor: colors.primarySoft }]}>
                <Text style={[s.avatarText, { color: colors.primary }]}>{getUserInitials(item.name || item.full_name)}</Text>
              </View>
              <View style={s.convInfo}>
                <View style={s.convTop}>
                  <Text style={[s.convName, { color: colors.textPrimary }]}>{item.name || item.full_name}</Text>
                  <Text style={[s.convTime, { color: colors.textSecondary }]}>{getTimeStr(item.last_message_time)}</Text>
                </View>
                <Text style={[s.convLast, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.last_message || 'Konusma baslat'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={[s.fab, { backgroundColor: colors.primary }]} onPress={openNewMessage}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showNewMsg} transparent animationType="slide" onRequestClose={() => setShowNewMsg(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[s.handle, { backgroundColor: colors.border }]} />
            <Text style={[s.modalTitle, { color: colors.textPrimary }]}>Yeni Mesaj</Text>
            <TextInput
              style={[s.searchInput, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="🔍  Kullanıcı ara..."
              placeholderTextColor={colors.textSecondary}
              value={userSearch}
              onChangeText={setUserSearch}
              autoFocus
            />
            {userSearch.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>Aramak istediginiz kisiyi yazin</Text>
              </View>
            )}
            <ScrollView style={{ maxHeight: 280 }}>
              {userSearch.length > 0 && users.filter(u => u.full_name.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                <TouchableOpacity
                  key={u.id}
                  style={[s.userRow, { borderColor: selectedUser?.id === u.id ? colors.primary : colors.border, backgroundColor: selectedUser?.id === u.id ? colors.primarySoft : colors.surface2 }]}
                  onPress={() => setSelectedUser(u)}
                >
                  <View style={[s.avatar, { backgroundColor: colors.primarySoft }]}>
                    <Text style={[s.avatarText, { color: colors.primary }]}>{getUserInitials(u.full_name)}</Text>
                  </View>
                  <View>
                    <Text style={[s.convName, { color: colors.textPrimary }]}>{u.full_name}</Text>
                    <Text style={[s.convLast, { color: colors.textSecondary }]}>{u.role}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={s.modalFooter}>
              <TouchableOpacity style={[s.cancelBtn, { borderColor: colors.border }]} onPress={() => { setShowNewMsg(false); setSelectedUser(null); setUserSearch(''); }}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.startBtn, { backgroundColor: selectedUser ? colors.primary : colors.border }]}
                onPress={startChat}
                disabled={!selectedUser || startLoading}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>{startLoading ? '...' : 'Konusmaya Basla'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  greeting: { fontSize: 12, fontWeight: '500', marginBottom: 2 },
  headerName: { fontSize: 16, fontWeight: '700' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  menuOverlay: { flex: 1 },
  userMenu: { position: 'absolute', top: 56, right: 16, borderRadius: 12, borderWidth: 1, minWidth: 140, overflow: 'hidden' },
  menuItem: { paddingVertical: 12, paddingHorizontal: 14 },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1 },
  searchInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, marginBottom: 10 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 40 },
  emptyText: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  emptyHint: { fontSize: 12 },
  convRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700' },
  convInfo: { flex: 1 },
  convTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  convName: { fontSize: 14, fontWeight: '600' },
  convTime: { fontSize: 11 },
  convLast: { fontSize: 12 },
  fab: { position: 'absolute', bottom: 80, right: 20, width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderBottomWidth: 0, padding: 16, paddingBottom: 32 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 8 },
  modalFooter: { flexDirection: 'row', gap: 10, marginTop: 12 },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  startBtn: { flex: 2, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
});
