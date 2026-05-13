import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <View style={[s.chartIconWrap, { backgroundColor: colors.errorSoft }]}>
                    <Ionicons name="trending-up" size={14} color={colors.error} />
                  </View>
                  <Text style={[s.cardSectionTitle, { color: colors.textPrimary }]}>Sorun Trendi (Son 4 Hafta)</Text>
                </View>
                {(() => {
                  const trend = myStats.problem_trend;
                  const maxC = Math.max(...trend.map(x => x.count), 1);
                  const BAR_MAX_H = 60;
                  return (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {trend.map((w, i) => {
                        const hasCount = w.count > 0;
                        const barH = hasCount ? Math.max(10, Math.round((w.count / maxC) * BAR_MAX_H)) : 0;
                        return (
                          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                            {/* Count label — sabit yükseklik, 0 ise şeffaf */}
                            <Text style={{ fontSize: 13, fontWeight: '900', height: 20, lineHeight: 20,
                              color: hasCount ? colors.error : 'transparent' }}>
                              {w.count}
                            </Text>
                            {/* Bar area — sabit yükseklik, barlar aşağıdan büyür */}
                            <View style={{ height: BAR_MAX_H, justifyContent: 'flex-end', width: '100%', alignItems: 'center' }}>
                              {hasCount ? (
                                <View style={{ width: '65%', height: barH, borderRadius: 7, overflow: 'hidden',
                                  backgroundColor: colors.error }}>
                                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0,
                                    height: Math.max(4, barH * 0.30),
                                    backgroundColor: 'rgba(255,255,255,0.22)',
                                    borderTopLeftRadius: 7, borderTopRightRadius: 7 }} />
                                </View>
                              ) : (
                                <View style={{ width: '65%', height: 8, borderRadius: 4,
                                  backgroundColor: colors.surface3, opacity: 0.5 }} />
                              )}
                            </View>
                            {/* H etiketi — sabit alt */}
                            <Text style={{ fontSize: 10, marginTop: 5, fontWeight: hasCount ? '700' : '400',
                              color: hasCount ? colors.error : colors.border }}>
                              {`H${i + 1}`}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  );
                })()}
                {myStats.ciddi_problems > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14,
                    backgroundColor: colors.errorSoft, borderRadius: 10, padding: 10 }}>
                    <Ionicons name="warning" size={14} color={colors.error} />
                    <Text style={{ fontSize: 12, color: colors.error, fontWeight: '700' }}>
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
            {/* Bakıcı arama çubuğu */}
            <View style={[s.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={16} color={colors.textMuted} />
              <TextInput
                style={[s.searchInput, { color: colors.textPrimary }]}
                placeholder="Bakıcı adına göre ara…"
                placeholderTextColor={colors.textMuted}
                value={cgSearch}
                onChangeText={setCgSearch}
                returnKeyType="search"
              />
              {cgSearch.length > 0 && (
                <TouchableOpacity onPress={() => { setCgSearch(''); setSelectedCaregiver(null); }}>
                  <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Liste: sadece arama yapıldığında göster */}
            {cgSearch.trim().length === 0 ? (
              <View style={[s.searchPromptBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="person-search-outline" size={32} color={colors.textMuted} style={{ marginBottom: 8 }} />
                <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center' }}>Yukarıdan bakıcı adı yazarak arama yapın</Text>
              </View>
            ) : filteredCaregivers.length === 0 ? (
              <View style={[s.searchPromptBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="search-outline" size={32} color={colors.textMuted} style={{ marginBottom: 8 }} />
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>Sonuç bulunamadı</Text>
              </View>
            ) : (
            <View style={[s.cgListCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {filteredCaregivers.map((c, i) => {
                const cs = caregiverStats[c.id];
                const isSelected = selectedCaregiver?.id === c.id;
                const rate = cs?.completion_rate ?? 0;
                return (
                  <View key={c.id}>
                  <TouchableOpacity
                    style={[s.cgRow,
                      i < filteredCaregivers.length - 1 && !isSelected && { borderBottomWidth: 0.5, borderBottomColor: colors.border },
                      isSelected && { backgroundColor: colors.primarySoft }]}
                    onPress={() => setSelectedCaregiver(isSelected ? null : c)}
                    activeOpacity={0.7}
                  >
                    <View style={[s.avatar, { backgroundColor: isSelected ? colors.primary : colors.primarySoft }]}>
                      <Text style={[s.avatarTxt, { color: isSelected ? '#fff' : colors.primary }]}>{getUserInitials(c.full_name)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.cgName, { color: isSelected ? colors.primary : colors.textPrimary }]}>{c.full_name}</Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>Hasta Bakıcı</Text>
                    </View>
                    {cs ? (
                      <View style={{ alignItems: 'flex-end', gap: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                          <Ionicons name="star" size={12} color={colors.warning} />
                          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.warning }}>
                            {cs.avg_rating ? cs.avg_rating.toFixed(1) : '—'}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 10, color: colors.textMuted }}>{cs.completed_tasks}/{cs.total_assigned} görev</Text>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: rate >= 70 ? colors.success : colors.warning }}>{rate}%</Text>
                      </View>
                    ) : (
                      <ActivityIndicator size="small" color={colors.primary} />
                    )}
                    <Ionicons name={isSelected ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textMuted} style={{ marginLeft: 8 }} />
                  </TouchableOpacity>

                  {/* Inline detay – bakıcı satırının hemen altında */}
                  {isSelected && (
                    <View style={[s.inlineDetail, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                      {loadingStats ? (
                        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
                      ) : selectedStats ? (
                        <>
                          {/* Haftalık performans mini chart */}
                          {selectedStats.weekly_data && (
                            <View style={{ marginBottom: 14, paddingBottom: 14, borderBottomWidth: 0.5, borderBottomColor: colors.border }}>
                              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 8 }}>Haftalık Performans</Text>
                              <View style={{ flexDirection: 'row', gap: 4 }}>
                                {(selectedStats.weekly_data).map((d, i) => {
                                  const maxR = Math.max(...selectedStats.weekly_data.map(x => x.rate), 1);
                                  const barH = Math.max(4, Math.round((d.rate / maxR) * 44));
                                  const isToday = i === (new Date().getDay() + 6) % 7;
                                  const active = d.rate > 0;
                                  return (
                                    <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                                      <View style={{ height: 44, justifyContent: 'flex-end', width: '100%', alignItems: 'center' }}>
                                        <View style={{ width: '72%', height: barH, borderRadius: 4,
                                          backgroundColor: isToday ? colors.primary : (active ? colors.primarySoft : colors.surface3),
                                          overflow: 'hidden' }}>
                                          {isToday && <View style={{ position: 'absolute', top: 0, left: 0, right: 0,
                                            height: '35%', backgroundColor: 'rgba(255,255,255,0.25)',
                                            borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />}
                                        </View>
                                      </View>
                                      <Text style={{ fontSize: 8, color: isToday ? colors.primary : colors.textMuted,
                                        marginTop: 3, fontWeight: isToday ? '800' : '400' }}>{DAYS[i]}</Text>
                                    </View>
                                  );
                                })}
                              </View>
                            </View>
                          )}
                          {/* Özet satırları */}
                          {[
                            { label: 'Toplam Atanan Görev', value: selectedStats.total_assigned, color: colors.textPrimary },
                            { label: 'Tamamlanan', value: selectedStats.completed_tasks, color: colors.success },
                            { label: 'Tamamlanma Oranı', value: selectedStats.completion_rate + '%', color: colors.primary },
                            { label: 'Ortalama Puan', value: selectedStats.avg_rating ? selectedStats.avg_rating.toFixed(1) + ' / 5.0' : 'Henüz yok', color: colors.warning },
                            { label: 'Bildirilen Sorun', value: selectedStats.problems_reported ?? 0, color: colors.error },
                            { label: 'Bugünkü Görev', value: selectedStats.tasks_today, color: colors.textPrimary },
                          ].map((row, ri) => (
                            <View key={ri} style={[s.inlineRow, { borderBottomColor: colors.border }]}>
                              <Text style={{ fontSize: 12, color: colors.textSecondary }}>{row.label}</Text>
                              <Text style={{ fontSize: 13, fontWeight: '800', color: row.color }}>{row.value}</Text>
                            </View>
                          ))}
                          {/* Performans bar */}
                          <View style={{ marginTop: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                              <Text style={{ fontSize: 11, color: colors.textMuted }}>Tamamlanma oranı</Text>
                              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>{selectedStats.completion_rate}%</Text>
                            </View>
                            <View style={{ height: 6, backgroundColor: colors.surface3, borderRadius: 3, overflow: 'hidden' }}>
                              <View style={{ height: 6, width: `${Math.min(selectedStats.completion_rate, 100)}%`, backgroundColor: selectedStats.completion_rate >= 70 ? colors.success : colors.warning, borderRadius: 3 }} />
                            </View>
                          </View>
                        </>
                      ) : null}
                    </View>
                  )}
                  </View>
                );
              })}
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
  // Search
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 0 },
  searchPromptBox: { borderRadius: 14, borderWidth: 1, padding: 28, alignItems: 'center', marginBottom: 16 },
  // Inline detail
  inlineDetail: { borderTopWidth: 0.5, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 0.5 },
  inlineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 0.5 },
  // Chart
  chartIconWrap: { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  trendBar: { width: '72%', borderTopLeftRadius: 5, borderTopRightRadius: 5 },
});
