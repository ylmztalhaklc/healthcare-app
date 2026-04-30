import React, { useState, useContext, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationsAPI } from '../../services/api';
import { getTimeStr } from '../../utils/helpers';
import BreathingOrb from '../../components/common/BreathingOrb';

export default function NotificationsScreen({ navigation }) {
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
      <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, overflow: 'hidden' }]}>
        <BreathingOrb color={colors.primary} size={160} duration={4600} opacity={0.10} style={{ top: -60, right: -40 }} />
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="notifications-outline" size={18} color={colors.textPrimary} />
          <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
            Bildirimler{unreadCount > 0 ? ` (${unreadCount})` : ''}
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
          renderItem={({ item }) => {
            const isCiddi = item.title && (item.title.includes('CİDDİ') || item.title.includes('CIDDI'));
            return (
              <TouchableOpacity
                style={[
                  s.notifCard,
                  { backgroundColor: isCiddi
                      ? (item.is_read ? 'rgba(248,113,113,0.08)' : 'rgba(248,113,113,0.18)')
                      : (item.is_read ? colors.surface : colors.surface2) },
                  { borderLeftColor: isCiddi ? colors.error : (item.is_read ? colors.border : colors.primary) },
                  isCiddi && { borderLeftWidth: 4 },
                ]}
                onPress={() => !item.is_read && markRead(item.id)}
              >
                {isCiddi && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6,
                    backgroundColor: 'rgba(248,113,113,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Ionicons name="warning" size={14} color={colors.error} />
                    <Text style={{ fontSize: 11, fontWeight: '800', color: colors.error, letterSpacing: 0.5 }}>CİDDİ SORUN BİLDİRİMİ</Text>
                  </View>
                )}
                <View style={s.notifContent}>
                  <View style={s.notifTop}>
                    <Text style={[s.notifTitle, { color: isCiddi ? colors.error : colors.textPrimary }]}>
                      {item.title || 'Bildirim'}
                    </Text>
                    {!item.is_read && <View style={[s.unreadDot, { backgroundColor: isCiddi ? colors.error : colors.primary }]} />}
                  </View>
                  <Text style={[s.notifMsg, { color: colors.textSecondary }]}>{item.message}</Text>
                  {item.related_user_name ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="person-outline" size={11} color={isCiddi ? colors.error : colors.primary} />
                      <Text style={[s.notifFrom, { color: isCiddi ? colors.error : colors.primary }]}>{item.related_user_name}</Text>
                    </View>
                  ) : null}
                  <Text style={[s.notifTime, { color: colors.textMuted }]}>{getTimeStr(item.created_at)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { minWidth: 60 },
  headerTitle: { fontSize: 15, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15, fontWeight: '600' },
  notifCard: { borderLeftWidth: 3, borderRadius: 12, padding: 14, marginBottom: 8 },
  notifContent: { gap: 4 },
  notifTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notifMsg: { fontSize: 13, lineHeight: 18 },
  notifFrom: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  notifTime: { fontSize: 10, marginTop: 4 },
});
