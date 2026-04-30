import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { tasksAPI, usersAPI } from '../../services/api';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import { getUserInitials } from '../../utils/helpers';
import BreathingOrb from '../../components/common/BreathingOrb';

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function RelativeStatsScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { colors, isDark, toggleTheme } = useTheme();

  // Kendi istatistikleri
  const [myStats, setMyStats] = useState(null);
  const [loadingMy, setLoadingMy] = useState(true);

  // Bakıcı seçimi + detay
  const [caregivers, setCaregivers] = useState([]);
  const [caregiverStats, setCaregiverStats] = useState({}); // { [cgId]: stats }
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [loadingCaregivers, setLoadingCaregivers] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cgSearch, setCgSearch] = useState('');
  const { unreadCount } = useUnreadCount(user?.id);

  useEffect(() => {
    fetchMyStats();
    fetchCaregivers();
  }, []);

  useEffect(() => {
    if (selectedCaregiver && !caregiverStats[selectedCaregiver.id]) {
      fetchCgStats(selectedCaregiver.id);
    }
  }, [selectedCaregiver]);

  const fetchMyStats = async () => {
    try {
      const res = await tasksAPI.getRelativeStats(user?.id);
      setMyStats(res.data);
    } catch {} finally { setLoadingMy(false); }
  };

  const fetchCaregivers = async () => {
    try {
      const res = await usersAPI.getByRole('hasta_bakici');
      const list = Array.isArray(res.data) ? res.data : [];
      setCaregivers(list);
      // Tüm bakıcıların özet istatistiklerini çek (bakıcı listesi için)
      const statsMap = {};
      await Promise.all(list.map(async (c) => {
        try {
          const r = await tasksAPI.getCaregiverStats(c.id);
          statsMap[c.id] = r.data;
        } catch {}
      }));
      setCaregiverStats(statsMap);
    } catch {} finally { setLoadingCaregivers(false); }
  };

  const fetchCgStats = async (cgId) => {
    setLoadingStats(true);
    try {
      const res = await tasksAPI.getCaregiverStats(cgId);
      setCaregiverStats(prev => ({ ...prev, [cgId]: res.data }));
    } catch {} finally { setLoadingStats(false); }
  };

  const filteredCaregivers = caregivers.filter(c =>
    c.full_name.toLowerCase().includes((cgSearch || '').toLowerCase())
  );

  const selectedStats = selectedCaregiver ? caregiverStats[selectedCaregiver.id] : null;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
      <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, overflow: 'hidden' }]}>
        <BreathingOrb color={colors.primary} size={200} duration={5000} opacity={0.11} style={{ top: -80, right: -60 }} />
        <View>
          <Text style={[s.greeting, { color: colors.textSecondary }]}>İstatistikler</Text>
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

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── BÖLÜM 1: KENDİ İSTATİSTİKLERİM ── */}
        <View style={[s.sectionHeader, { borderColor: colors.border }]}>
          <Ionicons name="person-circle-outline" size={16} color={colors.primary} />
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Genel Bakım Özeti</Text>
        </View>

        {loadingMy ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />
        ) : myStats ? (
          <>
            {/* Özet Tile'lar */}
            <View style={s.statsGrid}>
              {[
                { icon: 'checkmark-circle', label: 'Tamamlanan', value: myStats.completed_tasks, color: colors.success },
                { icon: 'bar-chart', label: 'Tamamlanma', value: myStats.completion_rate + '%', color: colors.primary },
                { icon: 'warning', label: 'Bildirilen Sorun', value: myStats.problems_reported, color: colors.error },
                { icon: 'shield-checkmark', label: 'Çözülen Sorun', value: myStats.problems_resolved, color: colors.success },
              ].map((t, i) => (
                <View key={i} style={[s.statTile, { backgroundColor: colors.surface, borderColor: t.color + '44' }]}>
                  <Ionicons name={t.icon} size={22} color={t.color} style={{ marginBottom: 6 }} />
                  <Text style={[s.tileNum, { color: t.color }]}>{t.value}</Text>
                  <Text style={[s.tileLbl, { color: colors.textSecondary }]}>{t.label}</Text>
                </View>
              ))}
            </View>

            {/* Sorun Trendi (son 4 hafta) */}
            {myStats.problem_trend && (
              <View style={[s.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                  <Ionicons name="trending-up" size={15} color={colors.error} />
                  <Text style={[s.cardSectionTitle, { color: colors.textPrimary }]}>Sorun Trendi (Son 4 Hafta)</Text>
                </View>
                {(() => {
                  const maxC = Math.max(...myStats.problem_trend.map(x => x.count), 1);
                  return (
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: 72 }}>
                      {myStats.problem_trend.map((w, i) => {
                        const barH = Math.max(4, Math.round((w.count / maxC) * 60));
                        return (
                          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: w.count > 0 ? colors.error : colors.textMuted }}>{w.count}</Text>
                            <View style={{ width: '100%', height: barH, backgroundColor: w.count > 0 ? colors.error + '88' : colors.surface2, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
                            <Text style={{ fontSize: 9, color: colors.textMuted }}>{`H${i + 1}`}</Text>
                          </View>
                        );
                      })}
                    </View>
                  );
                })()}
                {myStats.ciddi_problems > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
                    backgroundColor: 'rgba(248,113,113,0.1)', borderRadius: 8, padding: 8 }}>
                    <Ionicons name="warning" size={14} color={colors.error} />
                    <Text style={{ fontSize: 12, color: colors.error, fontWeight: '600' }}>
                      {myStats.ciddi_problems} ciddi sorun bildirildi
                    </Text>
                  </View>
                )}
              </View>
            )}
          </>
        ) : null}

        {/* ── BÖLÜM 2: BAKICI PERFORMANSI ── */}
        <View style={[s.sectionHeader, { borderColor: colors.border, marginTop: 8 }]}>
          <Ionicons name="people-outline" size={16} color={colors.primary} />
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Bakıcı Performansı</Text>
        </View>

        {loadingCaregivers ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />
        ) : caregivers.length === 0 ? (
          <View style={[s.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="person-outline" size={36} color={colors.textMuted} style={{ marginBottom: 8 }} />
            <Text style={[s.emptyTxt, { color: colors.textSecondary }]}>Kayıtlı bakıcı yok</Text>
          </View>
        ) : (
          <>
            {/* Tüm bakıcılar özet listesi */}
            <View style={[s.cgListCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {caregivers.map((c, i) => {
                const cs = caregiverStats[c.id];
                const isSelected = selectedCaregiver?.id === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[s.cgRow, i < caregivers.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border },
                      isSelected && { backgroundColor: colors.primarySoft }]}
                    onPress={() => setSelectedCaregiver(isSelected ? null : c)}
                    activeOpacity={0.7}
                  >
                    <View style={[s.avatar, { backgroundColor: isSelected ? colors.primary : colors.surface2 }]}>
                      <Text style={[s.avatarTxt, { color: isSelected ? '#fff' : colors.textPrimary }]}>{getUserInitials(c.full_name)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.cgName, { color: isSelected ? colors.primary : colors.textPrimary }]}>{c.full_name}</Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted }}>Hasta Bakıcı</Text>
                    </View>
                    {cs ? (
                      <View style={{ alignItems: 'flex-end', gap: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                          <Ionicons name="star" size={12} color="#FFB347" />
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFB347' }}>
                            {cs.avg_rating ? cs.avg_rating.toFixed(1) : '—'}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 10, color: colors.textMuted }}>{cs.completed_tasks}/{cs.total_assigned} görev</Text>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: colors.primary }}>{cs.completion_rate}%</Text>
                      </View>
                    ) : (
                      <ActivityIndicator size="small" color={colors.primary} />
                    )}
                    <Ionicons name={isSelected ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textMuted} style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Seçili bakıcı detay */}
            {selectedCaregiver && (
              <View style={{ marginTop: 12 }}>
                <View style={[s.statsHeader, { borderColor: colors.primary }]}>
                  <Text style={[s.statsHeaderTxt, { color: colors.primary }]}>{selectedCaregiver.full_name} — Detay</Text>
                </View>

                {loadingStats ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />
                ) : selectedStats ? (
                  <>
                    {/* Haftalık bar chart */}
                    <View style={[s.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                        <Ionicons name="trending-up" size={15} color={colors.primary} />
                        <Text style={[s.cardSectionTitle, { color: colors.textPrimary }]}>Haftalık Performans</Text>
                      </View>
                      {(() => {
                        const wData = selectedStats.weekly_data || DAYS.map(() => ({ rate: 0 }));
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
                                    borderTopLeftRadius: 4, borderTopRightRadius: 4,
                                  }]} />
                                  <Text style={[s.barDay, { color: isToday ? colors.primary : colors.textSecondary, fontWeight: isToday ? '700' : '500' }]}>{DAYS[i]}</Text>
                                </View>
                              );
                            })}
                          </View>
                        );
                      })()}
                    </View>

                    {/* Özet tablo */}
                    <View style={[s.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      {[
                        { label: 'Toplam Atanan Görev', value: selectedStats.total_assigned, color: colors.textPrimary },
                        { label: 'Tamamlanan Görev', value: selectedStats.completed_tasks, color: colors.success },
                        { label: 'Tamamlanma Oranı', value: selectedStats.completion_rate + '%', color: colors.primary },
                        { label: 'Ortalama Puan', value: selectedStats.avg_rating ? selectedStats.avg_rating.toFixed(1) + ' / 5.0' : 'Henüz yok', color: '#FFB347' },
                        { label: 'Bildirilen Sorun', value: selectedStats.problems_reported ?? 0, color: colors.error },
                        { label: 'Bugünkü Görev', value: selectedStats.tasks_today, color: colors.textPrimary },
                      ].map((row, i) => (
                        <View key={i} style={[s.summaryRow, { borderBottomColor: colors.border }]}>
                          <Text style={[s.summaryLabel, { color: colors.textSecondary }]}>{row.label}</Text>
                          <Text style={[s.summaryValue, { color: row.color }]}>{row.value}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <View style={[s.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[s.emptyTxt, { color: colors.textSecondary }]}>Henüz istatistik yok</Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
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
  badge: { position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3 },
  badgeTxt: { fontSize: 9, fontWeight: '800', color: '#fff' },
  menuOverlay: { flex: 1 },
  userMenu: { position: 'absolute', top: 56, right: 16, borderRadius: 12, borderWidth: 1, minWidth: 140, overflow: 'hidden' },
  menuItem: { paddingVertical: 12, paddingHorizontal: 14 },
  content: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, borderLeftWidth: 3, paddingLeft: 10, marginBottom: 14, borderColor: 'transparent' },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statTile: { flexBasis: '47%', flexGrow: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'flex-start' },
  tileNum: { fontSize: 24, fontWeight: '800', lineHeight: 28 },
  tileLbl: { fontSize: 10, fontWeight: '600', marginTop: 4 },
  chartCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardSectionTitle: { fontSize: 13, fontWeight: '700' },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 92 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barFill: { width: '100%' },
  barDay: { fontSize: 9, fontWeight: '500' },
  cgListCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 4 },
  cgRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  avatar: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: 12, fontWeight: '800' },
  cgName: { fontSize: 13, fontWeight: '700' },
  statsHeader: { borderLeftWidth: 3, paddingLeft: 10, marginBottom: 12 },
  statsHeaderTxt: { fontSize: 13, fontWeight: '700' },
  summaryCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 0.5 },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '700' },
  emptyBox: { borderRadius: 14, borderWidth: 1, padding: 28, alignItems: 'center', marginTop: 8 },
  emptyTxt: { fontSize: 14, fontWeight: '500' },
});
