import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { tasksAPI, usersAPI, notificationsAPI } from '../../services/api';

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function RelativeStatsScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { colors, isDark, toggleTheme } = useTheme();
  const [caregivers, setCaregivers] = useState([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingCaregivers, setLoadingCaregivers] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cgSearch, setCgSearch] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { fetchCaregivers(); }, []);
  useEffect(() => { if (selectedCaregiver) fetchStats(selectedCaregiver.id); }, [selectedCaregiver]);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationsAPI.getAll(user?.id);
        const arr = Array.isArray(res.data) ? res.data : [];
        setUnreadCount(arr.filter(n => !n.is_read).length);
      } catch {}
    };
    fetchUnread();
    const t = setInterval(fetchUnread, 30000);
    return () => clearInterval(t);
  }, []);

  const fetchCaregivers = async () => {
    try {
      const res = await usersAPI.getByRole('hasta_bakici');
      const list = Array.isArray(res.data) ? res.data : [];
      setCaregivers(list);
      // No auto-selection: user must choose
    } catch {} finally { setLoadingCaregivers(false); }
  };

  const fetchStats = async (cgId) => {
    setLoadingStats(true);
    setStats(null);
    try {
      const res = await tasksAPI.getCaregiverStats(cgId);
      setStats(res.data);
    } catch {} finally { setLoadingStats(false); }
  };

  const getUserInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(x => x[0]).join('').substring(0, 2).toUpperCase();
  };

  const statTiles = stats ? [
    { iconName: 'checkmark-circle', label: 'Tamamlanan', value: stats.completed_tasks, color: colors.success },
    { iconName: 'bar-chart', label: 'Tamamlanma', value: stats.completion_rate + '%', color: colors.primary },
    { iconName: 'star', label: 'Ortalama Puan', value: stats.avg_rating ? stats.avg_rating.toFixed(1) : '---', color: '#FFB347' },
    { iconName: 'calendar', label: 'Bugünkü Görev', value: stats.tasks_today, color: colors.textPrimary },
  ] : [];

  const filteredCaregivers = caregivers.filter(c =>
    c.full_name.toLowerCase().includes(cgSearch.toLowerCase())
  );

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[s.greeting, { color: colors.textSecondary }]}>Bakıcı İstatistikleri</Text>
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

      {loadingCaregivers ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* Caregiver Selector */}
          <View style={[s.selectorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Ionicons name="medkit-outline" size={16} color={colors.textPrimary} />
              <Text style={[s.selectorTitle, { color: colors.textPrimary }]}>Bakıcı Seç</Text>
            </View>
            {selectedCaregiver ? (
              <View>
                <TouchableOpacity
                  style={[s.caregiverRow, { backgroundColor: colors.primarySoft, borderColor: colors.primary, borderWidth: 1.5, borderRadius: 12, marginBottom: 6 }]}
                  onPress={() => { setSelectedCaregiver(null); setCgSearch(''); setStats(null); }}
                  activeOpacity={0.85}
                >
                  <View style={[s.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={s.avatarTxt}>{getUserInitials(selectedCaregiver.full_name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cgName, { color: colors.primary }]}>{selectedCaregiver.full_name}</Text>
                    <Text style={[s.cgRole, { color: colors.textSecondary }]}>Hasta Bakıcı</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={{ alignSelf: 'center', marginTop: 6, paddingVertical: 6, paddingHorizontal: 18, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface2 }} onPress={() => { setSelectedCaregiver(null); setCgSearch(''); setStats(null); }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>Değiştir</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TextInput
                  style={[s.searchInput, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="Bakıcı ara..."
                  placeholderTextColor={colors.textMuted}
                  value={cgSearch}
                  onChangeText={setCgSearch}
                />
                {cgSearch.length === 0 && (
                  <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                    <Text style={[s.noResult, { color: colors.textMuted }]}>Aramak için bakıcı adı yazın</Text>
                  </View>
                )}
                {cgSearch.length > 0 && filteredCaregivers.length === 0 && (
                  <Text style={[s.noResult, { color: colors.textMuted }]}>Bakıcı bulunamadı</Text>
                )}
                {cgSearch.length > 0 && filteredCaregivers.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[s.caregiverRow, { backgroundColor: colors.surface2, borderColor: colors.border }]}
                    onPress={() => { setSelectedCaregiver(c); setCgSearch(''); }}
                  >
                    <View style={[s.avatar, { backgroundColor: colors.primary }]}>
                      <Text style={s.avatarTxt}>{getUserInitials(c.full_name)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.cgName, { color: colors.textPrimary }]}>{c.full_name}</Text>
                      <Text style={[s.cgRole, { color: colors.textSecondary }]}>Hasta Bakıcı</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>

          {/* Stats Area */}
          {selectedCaregiver && (
            <View style={[s.statsHeader, { borderColor: colors.border }]}>
              <Text style={[s.statsHeaderTxt, { color: colors.primary }]}>
                {selectedCaregiver.full_name} — İstatistikler
              </Text>
            </View>
          )}

          {loadingStats ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
          ) : selectedCaregiver && stats && (
            <>
              {/* Stat Tiles */}
              <View style={s.statsGrid}>
                {statTiles.map((tile, i) => {
                  const glowColor = tile.color + (isDark ? '18' : '2E');
                  return (
                  <View key={i} style={[s.statTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View pointerEvents="none" style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: 50, backgroundColor: glowColor }} />
                    <Ionicons name={tile.iconName} size={24} color={tile.color} style={{ marginBottom: 8 }} />
                    <Text style={[s.tileNum, { color: tile.color }]}>{tile.value}</Text>
                    <Text style={[s.tileLbl, { color: colors.textSecondary }]}>{tile.label}</Text>
                  </View>
                  );
                })}
              </View>

              {/* Bar Chart */}
              <View style={[s.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                  <Ionicons name="trending-up" size={16} color={colors.primary} />
                  <Text style={[s.cardSectionTitle, { color: colors.textPrimary }]}>Haftalık Performans</Text>
                </View>
                {(() => {
                  const wData = stats.weekly_data || DAYS.map(() => ({ rate: 0 }));
                  const maxR = Math.max(...wData.map(x => x.rate), 1);
                  const todayDow = (new Date().getDay() + 6) % 7;
                  return (
                    <View style={s.barChart}>
                      {wData.map((d, i) => {
                        const barH = Math.max(4, Math.round((d.rate / maxR) * 78));
                        const isToday = i === todayDow;
                        return (
                          <View key={i} style={s.barCol}>
                            <View style={[s.barFill, {
                              height: barH,
                              backgroundColor: isToday ? colors.primary : (d.rate > 0 ? colors.primarySoft : colors.surface2),
                              borderTopLeftRadius: 4,
                              borderTopRightRadius: 4,
                            }]} />
                            <Text style={[s.barDay, { color: isToday ? colors.primary : colors.textSecondary, fontWeight: isToday ? '700' : '500' }]}>{DAYS[i]}</Text>
                          </View>
                        );
                      })}
                    </View>
                  );
                })()}
              </View>

              {/* Summary */}
              <View style={[s.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                  <Ionicons name="clipboard-outline" size={16} color={colors.primary} />
                  <Text style={[s.cardSectionTitle, { color: colors.textPrimary }]}>Performans Özeti</Text>
                </View>
                {[
                  { label: 'Toplam Atanan Görev', value: stats.total_assigned, color: colors.textPrimary },
                  { label: 'Tamamlanan Görev', value: stats.completed_tasks, color: colors.success },
                  { label: 'Tamamlanma Oranı', value: stats.completion_rate + '%', color: colors.primary },
                  { label: 'Ortalama Puan', value: stats.avg_rating ? stats.avg_rating.toFixed(1) + ' / 5.0' : 'Henüz yok', color: '#FFB347' },
                  { label: 'Bugünkü Görev', value: stats.tasks_today, color: colors.textPrimary },
                ].map((row, i) => (
                  <View key={i} style={[s.summaryRow, { borderBottomColor: colors.border }]}>
                    <Text style={[s.summaryLabel, { color: colors.textSecondary }]}>{row.label}</Text>
                    <Text style={[s.summaryValue, { color: row.color }]}>{row.value}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {!loadingStats && !stats && selectedCaregiver && (
            <View style={[s.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={40} color={colors.textMuted} style={{ marginBottom: 8 }} />
              <Text style={[s.emptyTxt, { color: colors.textSecondary }]}>Henüz istatistik yok</Text>
            </View>
          )}

          {!selectedCaregiver && !loadingCaregivers && (
            <View style={[s.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="finger-print" size={40} color={colors.textMuted} style={{ marginBottom: 12 }} />
              <Text style={[s.emptyTxt, { color: colors.textSecondary }]}>Bir bakıcı seçin</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 4 }}>İstatistiklerini görmek istediğiniz bakıcıya dokunun</Text>
            </View>
          )}
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
  selectorCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  selectorTitle: { fontSize: 14, fontWeight: '700' },
  searchInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, marginBottom: 10 },
  noResult: { fontSize: 12, textAlign: 'center', paddingVertical: 8 },
  caregiverRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 12, padding: 10, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },
  cgName: { fontSize: 13, fontWeight: '700' },
  cgRole: { fontSize: 11, marginTop: 2 },
  statsHeader: { borderLeftWidth: 3, paddingLeft: 10, marginBottom: 16 },
  statsHeaderTxt: { fontSize: 13, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statTile: { flexBasis: '47%', flexGrow: 1, borderRadius: 14, borderWidth: 1, padding: 16, alignItems: 'flex-start', overflow: 'hidden' },
  tileIcon: { fontSize: 24, marginBottom: 8 },
  tileNum: { fontSize: 26, fontWeight: '800', lineHeight: 30 },
  tileLbl: { fontSize: 10, fontWeight: '600', marginTop: 4 },
  chartCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16 },
  chartTitle: { fontSize: 13, fontWeight: '700' },
  cardSectionTitle: { fontSize: 13, fontWeight: '700' },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 92 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barFill: { width: '100%' },
  barDay: { fontSize: 9, fontWeight: '500' },
  badge: { position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3 },
  badgeTxt: { fontSize: 9, fontWeight: '800', color: '#fff' },
  summaryCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  summaryTitle: { fontSize: 13, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 0.5 },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '700' },
  emptyBox: { borderRadius: 14, borderWidth: 1, padding: 32, alignItems: 'center', marginTop: 16 },
  emptyTxt: { fontSize: 14, fontWeight: '500' },
});