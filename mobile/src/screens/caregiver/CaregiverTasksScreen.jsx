import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, Alert,
  TouchableOpacity, Modal, TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { tasksAPI, notificationsAPI } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const DAYS_TR = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

function getStatusColor(status, colors) {
  switch (status) {
    case 'tamamlandi': return colors.success;
    case 'sorun_var': return colors.error;
    case 'devam_ediyor': return '#FB923C';
    default: return '#FBBF24';
  }
}
function getChipBg(status) {
  switch (status) {
    case 'tamamlandi': return 'rgba(52,211,153,0.15)';
    case 'sorun_var': return 'rgba(248,113,113,0.15)';
    case 'devam_ediyor': return 'rgba(251,146,60,0.15)';
    default: return 'rgba(251,191,36,0.15)';
  }
}
function getStatusLabel(status) {
  switch (status) {
    case 'tamamlandi': return 'Tamamlandı';
    case 'sorun_var': return 'Sorun Var';
    case 'devam_ediyor': return 'Devam Ediyor';
    default: return 'Bekliyor';
  }
}

export default function CaregiverTasksScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { colors, isDark, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [showProblemModal, setShowProblemModal] = useState(false);
  const [problemTaskId, setProblemTaskId] = useState(null);
  const [problemText, setProblemText] = useState('');
  const [problemPhoto, setProblemPhoto] = useState(null);
  const [problemLoading, setProblemLoading] = useState(false);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeTaskId, setCompleteTaskId] = useState(null);
  const [completePhoto, setCompletePhoto] = useState(null);
  const [completeLoading, setCompleteLoading] = useState(false);

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

  useEffect(() => { fetchTasks(); }, [selectedDate]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await tasksAPI.getCaregiverTasks(user?.id, dateStr);
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch {
      Alert.alert('Hata', 'Görevler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationsAPI.getAll(user?.id);
      const arr = Array.isArray(res.data) ? res.data : [];
      setUnreadCount(arr.filter(n => !n.is_read).length);
    } catch {}
  };

  useFocusEffect(useCallback(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationsAPI.getAll(user?.id);
        const arr = Array.isArray(res.data) ? res.data : [];
        setUnreadCount(arr.filter(n => !n.is_read).length);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user?.id]));

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus({ task_id: taskId, user_id: user?.id, status: newStatus });
      fetchTasks();
    } catch {
      Alert.alert('Hata', 'Görev durumu güncellenemedi.');
    }
  };

  const openProblemModal = (taskId) => {
    setProblemTaskId(taskId);
    setProblemText('');
    setProblemPhoto(null);
    setShowProblemModal(true);
  };

  const submitProblem = async () => {
    if (!problemText.trim()) {
      Alert.alert('Hata', 'Lütfen sorun açıklaması yazın.');
      return;
    }
    setProblemLoading(true);
    try {
      await tasksAPI.updateStatus({ task_id: problemTaskId, user_id: user?.id, status: 'sorun_var' });
      setShowProblemModal(false);
      fetchTasks();
    } catch {
      Alert.alert('Hata', 'Sorun bildirilemedi.');
    } finally {
      setProblemLoading(false);
    }
  };

  const openCompleteModal = (taskId) => {
    setCompleteTaskId(taskId);
    setCompletePhoto(null);
    setShowCompleteModal(true);
  };

  const submitComplete = async () => {
    setCompleteLoading(true);
    try {
      await tasksAPI.updateStatus({ task_id: completeTaskId, user_id: user?.id, status: 'tamamlandi' });
      setShowCompleteModal(false);
      fetchTasks();
    } catch {
      Alert.alert('Hata', 'Görev tamamlanamadı.');
    } finally {
      setCompleteLoading(false);
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
    const barColor = getStatusColor(item.status, colors);
    const chipBg = getChipBg(item.status);
    const statusLabel = getStatusLabel(item.status);
    const timeStr = item.scheduled_for
      ? new Date(item.scheduled_for).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
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
          {timeStr ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Ionicons name="time-outline" size={12} color={colors.textMuted} />
              <Text style={[s.taskMeta, { color: colors.textSecondary }]}>{timeStr}</Text>
            </View>
          ) : null}
          {item.status !== 'tamamlandi' && (
            <View style={{ flexDirection: 'row', marginTop: 12, gap: 6 }}>
              {item.status === 'bekliyor' && (
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: colors.primarySoft, borderColor: 'rgba(56,189,248,0.3)', flex: 1 }]}
                  onPress={() => updateTaskStatus(item.id, 'devam_ediyor')}
                >
                  <Ionicons name="play-circle-outline" size={13} color={colors.primary} />
                  <Text style={[s.actionBtnText, { color: colors.primary }]}>Başlatıldı</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: 'rgba(248,113,113,0.12)', borderColor: 'rgba(248,113,113,0.3)', flex: 1 }]}
                onPress={() => openProblemModal(item.id)}
              >
                <Ionicons name="warning-outline" size={13} color={colors.error} />
                <Text style={[s.actionBtnText, { color: colors.error }]}>Sorun Bildir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: 'rgba(52,211,153,0.12)', borderColor: 'rgba(52,211,153,0.3)', flex: 1 }]}
                onPress={() => openCompleteModal(item.id)}
              >
                <Ionicons name="checkmark-circle-outline" size={13} color={colors.success} />
                  <Text style={[s.actionBtnText, { color: colors.success }]}>Tamamlandı</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
      <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[s.greeting, { color: colors.textSecondary }]}>Merhaba,</Text>
          <Text style={[s.headerName, { color: colors.textPrimary }]}>{user?.full_name || 'Bakıcı'}</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={isDark ? '#FBBF24' : '#60A5FA'} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]} onPress={() => { fetchUnreadCount(); navigation.navigate('Notifications'); }}>
            <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
            {unreadCount > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeTxt}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]} onPress={() => setShowUserMenu(true)}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>{getUserInitials()}</Text>
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
              <Ionicons name="clipboard-outline" size={48} color={colors.textMuted} style={{ marginBottom: 12 }} />
              <Text style={[s.emptyText, { color: colors.textSecondary }]}>Bu tarihte görev bulunmuyor.</Text>
            </View>
          }
        />
      )}

      <Modal transparent animationType="fade" visible={showProblemModal} onRequestClose={() => setShowProblemModal(false)}>
        <View style={s.centeredOverlay}>
          <View style={[s.centeredModal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Ionicons name="warning" size={20} color={colors.error} />
              <Text style={[s.popupTitle, { color: colors.error }]}>Sorun Bildir</Text>
            </View>
            <Text style={[s.popupLabel, { color: colors.textSecondary }]}>SORUN AÇIKLAMASI *</Text>
            <TextInput
              style={[s.popupInput, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="Sorunu kısaca açıklayın..."
              placeholderTextColor={colors.textMuted}
              value={problemText}
              onChangeText={setProblemText}
              multiline
              numberOfLines={4}
            />
            <Text style={[s.popupLabel, { color: colors.textSecondary, marginTop: 10 }]}>FOTOĞRAF (İSTEĞE BAĞLI)</Text>
            <TouchableOpacity
              style={[s.photoBox, { backgroundColor: colors.surface2, borderColor: problemPhoto ? colors.error : colors.border }]}
              onPress={() => Alert.alert('Bilgi', 'Fotoğraf yükleme yakın zamanda eklenecek.')}
            >
              <Ionicons name="camera-outline" size={28} color={colors.textMuted} />
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 6 }}>Fotoğraf Ekle</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                style={[s.popupBtn, { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border }]}
                onPress={() => setShowProblemModal(false)}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.popupBtn, { backgroundColor: colors.error, opacity: problemLoading ? 0.7 : 1 }]}
                onPress={submitProblem}
                disabled={problemLoading}
              >
                {problemLoading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Gönder</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={showCompleteModal} onRequestClose={() => setShowCompleteModal(false)}>
        <View style={s.centeredOverlay}>
          <View style={[s.centeredModal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[s.popupTitle, { color: colors.success }]}>Görevi Tamamla</Text>
            </View>
            <Text style={[s.popupLabel, { color: colors.textSecondary }]}>FOTOĞRAF (İSTEĞE BAĞLI)</Text>
            <TouchableOpacity
              style={[s.photoBox, { backgroundColor: colors.surface2, borderColor: completePhoto ? colors.success : colors.border }]}
              onPress={() => Alert.alert('Bilgi', 'Fotoğraf yükleme yakın zamanda eklenecek.')}>
              <Ionicons name="camera-outline" size={28} color={colors.textMuted} />
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 6 }}>Kanıt Fotoğrafı Ekle</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                style={[s.popupBtn, { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border }]}
                onPress={() => setShowCompleteModal(false)}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.popupBtn, { backgroundColor: colors.success, opacity: completeLoading ? 0.7 : 1 }]}
                onPress={submitComplete}
                disabled={completeLoading}
              >
                {completeLoading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Tamamlandı</Text>
                }
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
  badge: { position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeTxt: { fontSize: 9, fontWeight: '800', color: '#fff' },
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
  taskDesc: { fontSize: 12, marginBottom: 4 },
  taskMeta: { fontSize: 11 },
  chip: { borderRadius: 50, paddingVertical: 3, paddingHorizontal: 8 },
  chipText: { fontSize: 10, fontWeight: '600' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 34, borderRadius: 8, justifyContent: 'center', borderWidth: 1, paddingHorizontal: 4 },
  actionBtnText: { fontSize: 10, fontWeight: '600' },
  emptyWrap: { paddingTop: 60, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  centeredOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  centeredModal: { width: '100%', borderRadius: 20, borderWidth: 1, padding: 20 },
  popupTitle: { fontSize: 16, fontWeight: '800' },
  popupLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  popupInput: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, height: 100, textAlignVertical: 'top' },
  photoBox: { height: 110, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  popupBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
