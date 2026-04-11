import React, { useState, useContext, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationsAPI } from '../../services/api';

export default function RelativeNotificationsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.getAll(user?.id);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch {} finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead(user?.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const getTimeStr = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleDateString('tr-TR') + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
      <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="notifications-outline" size={18} color={colors.textPrimary} />
          <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
            Bildirimler{unreadCount > 0 ? (' (' + unreadCount + ')') : ''}
          </Text>
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>Tümü Oku</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : notifications.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} style={{ marginBottom: 12 }} />
          <Text style={[s.emptyText, { color: colors.textSecondary }]}>Bildirim bulunmuyor</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, i) => String(item.id || i)}
          contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.notifCard,
                { backgroundColor: item.is_read ? colors.surface : colors.surface2 },
                { borderLeftColor: item.is_read ? colors.border : colors.primary }
              ]}
              onPress={() => !item.is_read && markRead(item.id)}
            >
              <View style={s.notifContent}>
                <View style={s.notifTop}>
                  <Text style={[s.notifTitle, { color: colors.textPrimary }]}>
                    {item.title || 'Bildirim'}
                  </Text>
                  {!item.is_read && <View style={[s.unreadDot, { backgroundColor: colors.primary }]} />}
                </View>
                <Text style={[s.notifMsg, { color: colors.textSecondary }]}>{item.message}</Text>
                {item.related_user_name ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="person-outline" size={11} color={colors.primary} />
                    <Text style={[s.notifFrom, { color: colors.primary }]}>{item.related_user_name}</Text>
                  </View>
                ) : null}
                <Text style={[s.notifTime, { color: colors.textMuted }]}>{getTimeStr(item.created_at)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { minWidth: 60 },
  headerTitle: { fontSize: 15, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15, fontWeight: '600' },
  notifCard: { borderLeftWidth: 3, borderRadius: 12, padding: 14, marginBottom: 8, gap: 4 },
  notifContent: { gap: 4 },
  notifTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notifMsg: { fontSize: 13, lineHeight: 18 },
  notifFrom: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  notifTime: { fontSize: 10, marginTop: 4 },
});