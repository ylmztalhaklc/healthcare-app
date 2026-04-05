import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { tasksAPI, usersAPI } from '../../services/api';

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

  useEffect(() => { fetchCaregivers(); }, []);
  useEffect(() => { if (selectedCaregiver) fetchStats(selectedCaregiver.id); }, [selectedCaregiver]);

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
    { icon: '✅', label: 'Tamamlanan', value: stats.completed_tasks, color: colors.success },
    { icon: '📊', label: 'Tamamlanma', value: stats.completion_rate + '%', color: colors.primary },
    { icon: '⭐', label: 'Ortalama Puan', value: stats.avg_rating ? stats.avg_rating.toFixed(1) : '---', color: '#FFB347' },
    { icon: '📅', label: 'Bugünkü Görev', value: stats.tasks_today, color: colors.textPrimary },
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

      {loadingCaregivers ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* Caregiver Selector */}
          <View style={[s.selectorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.selectorTitle, { color: colors.textPrimary }]}>👨‍⚕️ Bakıcı Seç</Text>
            <TextInput
              style={[s.searchInput, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="🔍  Bakıcı ara..."
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
                style={[s.caregiverRow,
                  selectedCaregiver?.id === c.id
                    ? { backgroundColor: colors.primarySoft, borderColor: colors.primary }
                    : { backgroundColor: colors.surface2, borderColor: colors.border }
                ]}
                onPress={() => { setSelectedCaregiver(c); setCgSearch(''); }}
              >
                <View style={[s.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={s.avatarTxt}>{getUserInitials(c.full_name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.cgName, { color: selectedCaregiver?.id === c.id ? colors.primary : colors.textPrimary }]}>{c.full_name}</Text>
                  <Text style={[s.cgRole, { color: colors.textSecondary }]}>Hasta Bakıcı</Text>
                </View>
                {selectedCaregiver?.id === c.id && (
                  <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700' }}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
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
          ) : stats && (
            <>
              {/* Stat Tiles */}
              <View style={s.statsGrid}>
                {statTiles.map((tile, i) => (
                  <View key={i} style={[s.statTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={s.tileIcon}>{tile.icon}</Text>
                    <Text style={[s.tileNum, { color: tile.color }]}>{tile.value}</Text>
                    <Text style={[s.tileLbl, { color: colors.textSecondary }]}>{tile.label}</Text>
                  </View>
                ))}
              </View>

              {/* Bar Chart */}
              <View style={[s.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.chartTitle, { color: colors.textPrimary }]}>📈 Haftalık Performans</Text>
                <View style={s.barChart}>
                  {[65, 80, 55, 90, 70, 60, 45].map((h, i) => (
                    <View key={i} style={s.barCol}>
                      <View style={[s.barFill, {
                        height: h,
                        backgroundColor: i === 4 ? colors.primary : colors.primarySoft,
                        borderTopWidth: 2,
                        borderTopColor: colors.primary,
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                      }]} />
                      <Text style={[s.barDay, { color: colors.textSecondary }]}>{DAYS[i]}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Summary */}
              <View style={[s.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.summaryTitle, { color: colors.textPrimary }]}>📋 Performans Özeti</Text>
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
              <Text style={{ fontSize: 32, marginBottom: 8 }}>📭</Text>
              <Text style={[s.emptyTxt, { color: colors.textSecondary }]}>Henüz istatistik yok</Text>
            </View>
          )}

          {!selectedCaregiver && !loadingCaregivers && (
            <View style={[s.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>👆</Text>
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
  selectorTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
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
  statTile: { width: '47%', borderRadius: 14, borderWidth: 1, padding: 16, alignItems: 'flex-start' },
  tileIcon: { fontSize: 24, marginBottom: 8 },
  tileNum: { fontSize: 26, fontWeight: '800', lineHeight: 30 },
  tileLbl: { fontSize: 10, fontWeight: '600', marginTop: 4 },
  chartCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16 },
  chartTitle: { fontSize: 13, fontWeight: '700', marginBottom: 12 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 92 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barFill: { width: '100%' },
  barDay: { fontSize: 9, fontWeight: '500' },
  summaryCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  summaryTitle: { fontSize: 13, fontWeight: '700', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 0.5 },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '700' },
  emptyBox: { borderRadius: 14, borderWidth: 1, padding: 32, alignItems: 'center', marginTop: 16 },
  emptyTxt: { fontSize: 14, fontWeight: '500' },
});