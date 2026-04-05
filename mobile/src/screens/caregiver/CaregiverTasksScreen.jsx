import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tasksAPI } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const DAYS_TR = ['Paz', 'Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt'];

export default function CaregiverTasksScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { colors, isDark, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
    setWeekDates(dates);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await tasksAPI.getCaregiverTasks(user?.id, dateStr);
      setTasks(res.data);
    } catch {
      Alert.alert('Hata', 'Gorevler yuklenirken hata olustu.');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus({ task_id: taskId, user_id: user?.id, status: newStatus });
      fetchTasks();
    } catch {
      Alert.alert('Hata', 'Gorev durumu guncellenemedi.');
    }
  };

  const isDateSelected = (date) => date.toDateString() === selectedDate.toDateString();

  const completedCount = tasks.filter(t => t.status === 'tamamlandi').length;
  const percentage = tasks.length > 0 ? Math.round(completedCount / tasks.length * 100) : 0;

  const getUserInitials = () => {
    const name = user?.full_name || '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'HB';
  };

  const renderTask = ({ item }) => {
    const barColor = item.status === 'tamamlandi' ? colors.success
      : item.status === 'sorun_var' ? colors.error
      : item.status === 'devam_ediyor' ? colors.primary
      : colors.warning;
    const chipBg = item.status === 'tamamlandi' ? 'rgba(86,207,178,0.15)'
      : item.status === 'sorun_var' ? 'rgba(255,107,107,0.15)'
      : item.status === 'devam_ediyor' ? 'rgba(78,205,196,0.15)'
      : 'rgba(255,179,71,0.15)';
    const statusLabel = item.status === 'tamamlandi' ? 'Tamamlandı'
      : item.status === 'sorun_var' ? 'Sorun Var'
      : item.status === 'devam_ediyor' ? 'Devam Ediyor'
      : 'Bekliyor';
    const timeStr = item.scheduled_for
      ? new Date(item.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
    return (
      <View style={[s.taskCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[s.taskBar, { backgroundColor: barColor }]} />
        <View style={s.taskContent}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={[s.taskTitle, { color: colors.textPrimary, flex: 1, marginRight: 8 }]}>{item.title}</Text>
            <View style={[s.chip, { backgroundColor: chipBg }]}>
              <Text style={[s.chipText, { color: barColor }]}>{statusLabel}</Text>
            </View>
          </View>
          {item.description ? <Text style={[s.taskDesc, { color: colors.textSecondary }]}>{item.description}</Text> : null}
          {timeStr ? <Text style={[s.taskMeta, { color: colors.textSecondary }]}>{timeStr}</Text> : null}
          {item.status !== 'tamamlandi' && (
            <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
              {item.status === 'bekliyor' && (
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: colors.primarySoft, borderColor: 'rgba(78,205,196,0.3)', flex: 1 }]}
                  onPress={() => updateTaskStatus(item.id, 'devam_ediyor')}
                >
                  <Text style={[s.actionBtnText, { color: colors.primary }]}>Baslat</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: 'rgba(255,107,107,0.12)', borderColor: 'rgba(255,107,107,0.3)', flex: 1 }]}
                onPress={() => updateTaskStatus(item.id, 'sorun_var')}
              >
                <Text style={[s.actionBtnText, { color: colors.error }]}>Sorun Bildir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: 'rgba(86,207,178,0.12)', borderColor: 'rgba(86,207,178,0.3)', flex: 1 }]}
                onPress={() => updateTaskStatus(item.id, 'tamamlandi')}
              >
                <Text style={[s.actionBtnText, { color: colors.success }]}>Tamamla</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[s.greeting, { color: colors.textSecondary }]}>Merhaba,</Text>
          <Text style={[s.headerName, { color: colors.textPrimary }]}>{user?.full_name || 'Hekim'}</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]} onPress={toggleTheme}>
            <Text style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]} onPress={() => navigation.navigate('Notifications')}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]} onPress={() => setShowUserMenu(true)}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>{getUserInitials()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User Menu */}
      <Modal transparent animationType="fade" visible={showUserMenu} onRequestClose={() => setShowUserMenu(false)}>
        <TouchableOpacity style={s.menuOverlay} onPress={() => setShowUserMenu(false)} activeOpacity={1}>
          <View style={[s.userMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity style={s.menuItem} onPress={() => { setShowUserMenu(false); logout(); }}>
              <Text style={{ fontSize: 13, color: colors.error }}>Çıkış Yap</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Calendar */}
      <View style={[s.calendarWrap, { backgroundColor: colors.background }]}>
        <Text style={[s.calMonth, { color: colors.textPrimary }]}>
          {selectedDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
        </Text>
        <View style={s.weekRow}>
          {weekDates.map((date, idx) => {
            const isSel = isDateSelected(date);
            return (
              <TouchableOpacity
                key={idx}
                style={[s.dayCell, isSel
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[s.dayName, { color: isSel ? '#fff' : colors.textSecondary }]}>
                  {DAYS_TR[date.getDay()].substring(0, 2)}
                </Text>
                <Text style={[s.dayNum, { color: isSel ? '#fff' : colors.textPrimary }]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Progress Banner */}
      {tasks.length > 0 && !loading && (
        <View style={[s.progBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={s.progTop}>
            <View>
              <Text style={[s.progLabel, { color: colors.textSecondary }]}>Tamamlanan Görevler</Text>
              <Text style={[s.progValue, { color: colors.primary }]}>
                {completedCount}
                <Text style={[s.progTotal, { color: colors.textSecondary }]}>/{tasks.length}</Text>
              </Text>
            </View>
            <Text style={[s.progPctText, { color: colors.textSecondary }]}>{percentage}%</Text>
          </View>
          <View style={[s.progBarBg, { backgroundColor: colors.surface2 }]}>
            <View style={[s.progBarFill, { backgroundColor: colors.primary, width: percentage + '%' }]} />
          </View>
        </View>
      )}

      {/* Task List */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={item => item.id.toString()}
          renderItem={renderTask}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>📋</Text>
              <Text style={[s.emptyText, { color: colors.textSecondary }]}>Bu tarihte görev bulunmuyor.</Text>
            </View>
          }
        />
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
  calendarWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  calMonth: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  weekRow: { flexDirection: 'row', gap: 4 },
  dayCell: { flex: 1, height: 62, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 3 },
  dayName: { fontSize: 9, fontWeight: '600' },
  dayNum: { fontSize: 15, fontWeight: '700' },
  progBanner: { marginHorizontal: 20, marginBottom: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  progTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  progLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  progValue: { fontSize: 22, fontWeight: '800' },
  progTotal: { fontSize: 14, fontWeight: '500' },
  progPctText: { fontSize: 13, fontWeight: '700' },
  progBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progBarFill: { height: '100%', borderRadius: 3 },
  taskCard: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  taskBar: { width: 3 },
  taskContent: { flex: 1, padding: 14, paddingLeft: 12 },
  taskTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  taskDesc: { fontSize: 12, color: '#8B949E', marginBottom: 4 },
  taskMeta: { fontSize: 11 },
  chip: { borderRadius: 50, paddingVertical: 3, paddingHorizontal: 8 },
  chipText: { fontSize: 10, fontWeight: '600' },
  actionBtn: { height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  actionBtnText: { fontSize: 11, fontWeight: '600' },
  emptyWrap: { paddingTop: 60, alignItems: 'center' },
  emptyText: { fontSize: 14 },
});
