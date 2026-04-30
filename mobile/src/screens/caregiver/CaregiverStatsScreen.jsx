import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { tasksAPI } from '../../services/api';
import { DAYS_MON_FIRST } from '../../constants/config';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import { getUserInitials } from '../../utils/helpers';
import BreathingOrb from '../../components/common/BreathingOrb';

const DAYS = DAYS_MON_FIRST;

export default function CaregiverStatsScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { colors, isDark, toggleTheme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { unreadCount } = useUnreadCount(user?.id);
  // todayIndex: Mon=0 … Sun=6
  const todayIndex = (new Date().getDay() + 6) % 7;

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await tasksAPI.getCaregiverStats(user?.id);
      setStats(res.data);
    } catch {} finally { setLoading(false); }
  };

  const getUserInitialsLocal = () => getUserInitials(user?.full_name, 'HB');

  const statTiles = stats ? [
    { iconName: 'checkmark-circle', label: 'Tamamlanan', value: stats.completed_tasks, color: colors.success },
    { iconName: 'bar-chart', label: 'Tamamlanma', value: (stats.completion_rate ?? 0) + '%', color: colors.primary },
    { iconName: 'warning', label: 'Aktif Sorun', value: stats.problems_reported ?? 0, color: colors.error },
    { iconName: 'star', label: 'Ort. Puan', value: stats.avg_rating ? stats.avg_rating.toFixed(1) : '---', color: '#FFB347' },
  ] : [];

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
      <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, overflow: 'hidden' }]}>
        <BreathingOrb color={colors.primary} size={200} duration={4800} opacity={0.12} style={{ top: -80, right: -60 }} />
        <View>
          <Text style={[s.greeting, { color: colors.textSecondary }]}>İstatistiklerim</Text>
          <Text style={[s.headerName, { color: colors.textPrimary }]}>{user?.full_name || 'Misafir'}</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={isDark ? '#FBBF24' : '#60A5FA'} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
            {unreadCount > 0 && (
              <View style={s.badge}><Text style={s.badgeTxt}>{unreadCount > 99 ? '99+' : unreadCount}</Text></View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]} onPress={() => setShowUserMenu(true)}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>{getUserInitialsLocal()}</Text>
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

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.statsGrid}>
            {statTiles.map((tile, i) => (
              <View key={i} style={[s.statTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name={tile.iconName} size={24} color={tile.color} style={{ marginBottom: 8 }} />
                    <Text style={[s.tileNum, { color: tile.color }]}>{tile.value}</Text>
                    <Text style={[s.tileLbl, { color: colors.textSecondary }]}>{tile.label}</Text>
                  </View>
            ))}
          </View>

          <View style={[s.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Ionicons name="trending-up" size={16} color={colors.textPrimary} />
              <Text style={[s.chartTitle, { color: colors.textPrimary }]}>Haftalık Performans</Text>
            </View>
            <View style={s.barChart}>
              {DAYS.map((dayLabel, i) => {
                const rate = stats?.weekly_data?.[i]?.rate ?? 0;
                const barH = Math.max(4, rate * 0.88);
                const isToday = i === todayIndex;
                return (
                  <View key={i} style={s.barCol}>
                    <View style={[s.barFill, {
                      height: barH,
                      backgroundColor: isToday ? colors.primary : colors.primarySoft,
                      borderTopWidth: 2, borderTopColor: colors.primary,
                      borderTopLeftRadius: 4, borderTopRightRadius: 4,
                    }]} />
                    <Text style={[s.barDay, { color: isToday ? colors.primary : colors.textSecondary, fontWeight: isToday ? '700' : '500' }]}>{dayLabel}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={[s.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Ionicons name="clipboard-outline" size={16} color={colors.textPrimary} />
              <Text style={[s.summaryTitle, { color: colors.textPrimary }]}>Performans Özeti</Text>
            </View>
            {[
              { label: 'Toplam Atanan Görev', value: stats?.total_assigned ?? 0, color: colors.textPrimary },
              { label: 'Tamamlanan Görev', value: stats?.completed_tasks ?? 0, color: colors.success },
              { label: 'Tamamlanma Oranı', value: (stats?.completion_rate ?? 0) + '%', color: colors.primary },
              { label: 'Bugünkü Görev', value: stats?.tasks_today ?? 0, color: colors.textPrimary },
              { label: 'Bildirilen Sorun', value: stats?.problems_reported ?? 0, color: colors.error },
              { label: 'Ciddi Sorun', value: stats?.ciddi_problems ?? 0, color: (stats?.ciddi_problems > 0 ? colors.error : colors.textSecondary) },
              { label: 'Ortalama Puan', value: stats?.avg_rating ? stats.avg_rating.toFixed(1) + ' / 5.0' : 'Henüz yok', color: '#FFB347' },
            ].map((row, i) => (
              <View key={i} style={[s.summaryRow, { borderBottomColor: colors.border }]}>
                <Text style={[s.summaryLabel, { color: colors.textSecondary }]}>{row.label}</Text>
                <Text style={[s.summaryValue, { color: row.color }]}>{row.value}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
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
  content: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statTile: { width: '47%', borderRadius: 14, borderWidth: 1, padding: 16, alignItems: 'center' },
  tileIcon: { fontSize: 24, marginBottom: 8 },
  tileNum: { fontSize: 26, fontWeight: '800', lineHeight: 30 },
  tileLbl: { fontSize: 10, fontWeight: '600', marginTop: 4 },
  chartCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16 },
  chartTitle: { fontSize: 13, fontWeight: '700', marginBottom: 12 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 92 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barFill: { width: '100%' },
  barDay: { fontSize: 9, fontWeight: '500' },
  badge: { position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3 },
  badgeTxt: { fontSize: 9, fontWeight: '800', color: '#fff' },
  summaryCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  summaryTitle: { fontSize: 13, fontWeight: '700', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 0.5 },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '700' },
});