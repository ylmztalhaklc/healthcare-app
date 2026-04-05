import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tasksAPI, usersAPI } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const DAYS_TR = ['Paz', 'Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt'];
const MONTHS_TR = ['Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran', 'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const CLOCK_SIZE = 260;
const CLOCK_CENTER = CLOCK_SIZE / 2;
const OUTER_R = 102;
const INNER_R = 65;
const CELL_SIZE = 36;
function clockPos(index, total, radius) {
  const angle = (2 * Math.PI * index / total) - Math.PI / 2;
  return {
    left: CLOCK_CENTER + radius * Math.cos(angle) - CELL_SIZE / 2,
    top: CLOCK_CENTER + radius * Math.sin(angle) - CELL_SIZE / 2,
  };
}

function getStatusColor(status, colors) {
  switch (status) {
    case 'tamamlandi': return colors.success;
    case 'devam_ediyor': return colors.primary;
    case 'sorun_var': return colors.error;
    default: return colors.warning;
  }
}
function getStatusLabel(status) {
  switch (status) {
    case 'tamamlandi': return 'Tamamlandi';
    case 'devam_ediyor': return 'Devam Ediyor';
    case 'sorun_var': return 'Sorun Var';
    default: return 'Bekliyor';
  }
}
function getChipBg(status) {
  switch (status) {
    case 'tamamlandi': return 'rgba(86,207,178,0.15)';
    case 'devam_ediyor': return 'rgba(78,205,196,0.15)';
    case 'sorun_var': return 'rgba(255,107,107,0.15)';
    default: return 'rgba(255,179,71,0.15)';
  }
}

export default function RelativeTasksScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { colors, isDark, toggleTheme } = useTheme();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDates, setWeekDates] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Detail modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation (inline - no Alert.alert)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTime, setNewTime] = useState('12:00');
  const [caregivers, setCaregivers] = useState([]);
  const [caregiverSearch, setCaregiverSearch] = useState('');
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  // Caregiver picker modal (separate screen)
  const [showCaregiverPicker, setShowCaregiverPicker] = useState(false);

  // Time picker
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerStep, setPickerStep] = useState('hour'); // 'hour' | 'minute'
  const [pickerHour, setPickerHour] = useState(12);
  const [pickerMinute, setPickerMinute] = useState(0);
  const [minuteInputText, setMinuteInputText] = useState('00');

  useEffect(() => {
    const today = new Date();
    const dow = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dow + weekOffset * 7);
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
    setWeekDates(dates);
  }, [weekOffset]);

  useEffect(() => { fetchTasks(); }, [selectedDate]);
  useEffect(() => { if (showAddModal) fetchCaregivers(); }, [showAddModal]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await tasksAPI.getRelativeTasks(user?.id, dateStr);
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch {
      Alert.alert('Hata', 'Görevler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCaregivers = async () => {
    try {
      const res = await usersAPI.getByRole('hasta_bakici');
      setCaregivers(Array.isArray(res.data) ? res.data : []);
    } catch { setCaregivers([]); }
  };

  const handleRate = async () => {
    if (!rating) return Alert.alert('Hata', 'Lutfen bir puan secin.');
    setRatingLoading(true);
    try {
      await tasksAPI.rateTask({ task_id: selectedTask.id, rating, review_note: '' });
      Alert.alert('Basarili', 'Puaniniz kaydedildi.');
      setShowDetailModal(false);
      fetchTasks();
    } catch { Alert.alert('Hata', 'Puan verilemedi.'); }
    finally { setRatingLoading(false); }
  };

  const openTimePicker = () => {
    const timeParts = newTime.split(':');
    const h = parseInt(timeParts[0], 10) || 12;
    const m = parseInt(timeParts[1], 10) || 0;
    setPickerHour(h);
    setPickerMinute(m);
    setMinuteInputText(String(m).padStart(2, '0'));
    setPickerStep('hour');
    setShowTimePicker(true);
  };

  const handleHourSelect = (h) => {
    setPickerHour(h);
    setMinuteInputText(String(pickerMinute).padStart(2, '0'));
    setPickerStep('minute');
  };

  const handleMinuteSelect = (m) => {
    const sched = new Date(selectedDate);
    sched.setHours(pickerHour, m, 0, 0);
    if (sched < new Date()) {
      Alert.alert('Hata', 'Seçilen zaman geçmişte kalamaz. Lütfen ileri bir saat seçin.');
      return;
    }
    setPickerMinute(m);
    setMinuteInputText(String(m).padStart(2, '0'));
    setNewTime(`${String(pickerHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    setShowTimePicker(false);
  };

  const handleCreateTask = async () => {
    if (!newTitle.trim()) return Alert.alert('Hata', 'Başlık boş olamaz.');
    if (!selectedCaregiver) return Alert.alert('Hata', 'Lütfen bir bakıcı seçin.');
    if (!newTime) return Alert.alert('Hata', 'Lütfen bir saat seçin.');
    const timeParts = newTime.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1] || '0', 10);
    // Yerel saat olarak ISO string oluştur (toISOString UTC'ye çevirdiği için kullanmıyoruz)
    const pad = n => String(n).padStart(2, '0');
    const d = new Date(selectedDate);
    const localISO = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(hours)}:${pad(minutes)}:00`;
    setAddLoading(true);
    try {
      await tasksAPI.createTask({
        title: newTitle.trim(),
        description: newDesc.trim() || '',
        assigned_to_id: selectedCaregiver.id,
        created_by_id: user?.id,
        scheduled_for: localISO,
      });
      Alert.alert('Başarılı', 'Görev oluşturuldu.');
      setShowAddModal(false);
      setNewTitle(''); setNewDesc(''); setNewTime('12:00');
      setSelectedCaregiver(null); setCaregiverSearch('');
      fetchTasks();
    } catch (e) {
      Alert.alert('Hata', e.response?.data?.detail || 'Görev oluşturulamadı.');
    } finally { setAddLoading(false); }
  };

  const handleEditSave = async () => {
    if (!editTitle.trim()) return Alert.alert('Hata', 'Başlık boş olamaz.');
    if (!selectedTask?.template_id) return Alert.alert('Hata', 'Bu görevin şablonu bulunamadı.');
    setEditLoading(true);
    try {
      await tasksAPI.updateTemplate(selectedTask.template_id, { title: editTitle.trim(), description: editDesc.trim() });
      Alert.alert('Başarılı', 'Görev güncellendi.');
      setEditMode(false);
      setShowDetailModal(false);
      fetchTasks();
    } catch (e) {
      const msg = e.response?.data?.detail || e.message || 'Görev güncellenemedi.';
      console.error('[updateTemplate]', e.response?.status, msg);
      Alert.alert('Hata', msg);
    } finally { setEditLoading(false); }
  };

  const handleDeleteTask = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      if (selectedTask?.template_id) {
        await tasksAPI.deleteTemplate(selectedTask.template_id);
      } else {
        await tasksAPI.deleteTask(selectedTask.id);
      }
      setShowDeleteConfirm(false);
      setShowDetailModal(false);
      fetchTasks();
    } catch (e) {
      const msg = e.response?.data?.detail || e.message || 'Görev silinemedi.';
      console.error('[deleteTemplate]', e.response?.status, msg);
      setShowDeleteConfirm(false);
      Alert.alert('Hata', msg);
    } finally { setDeleteLoading(false); }
  };

  const openDetail = (item) => {
    setSelectedTask(item);
    setRating(item.rating || 0);
    setEditMode(false);
    setShowDeleteConfirm(false);
    setEditTitle(item.title);
    setEditDesc(item.description || '');
    setShowDetailModal(true);
  };

  const isDateSelected = (date) => date.toDateString() === selectedDate.toDateString();
  const getUserInitials = () => {
    const n = user?.full_name || '';
    return n.split(' ').map(x => x[0]).join('').substring(0, 2).toUpperCase() || 'TY';
  };

  const filteredCaregivers = caregivers.filter(c =>
    c.full_name.toLowerCase().includes(caregiverSearch.toLowerCase())
  );

  const renderTask = ({ item }) => {
    const sc = getStatusColor(item.status, colors);
    const cb = getChipBg(item.status);
    const timeStr = item.scheduled_for
      ? new Date(item.scheduled_for).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      : '';
    return (
      <TouchableOpacity
        style={[s.taskCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => openDetail(item)}
        activeOpacity={0.8}
      >
        <View style={[s.taskBar, { backgroundColor: sc }]} />
        <View style={s.taskInfo}>
          <Text style={[s.taskTitle, { color: colors.textPrimary }]}>{item.title}</Text>
          <View style={s.taskMeta}>
            {timeStr ? <Text style={[s.metaItem, { color: colors.textSecondary }]}>Clock {timeStr}</Text> : null}
            {item.description ? <Text style={[s.metaItem, { color: colors.textSecondary }]} numberOfLines={1}>{item.description}</Text> : null}
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4, paddingRight: 12, paddingVertical: 14 }}>
          <View style={[s.chip, { backgroundColor: cb }]}>
            <Text style={[s.chipText, { color: sc }]}>{getStatusLabel(item.status)}</Text>
          </View>
          {item.rating ? <Text style={{ fontSize: 10, color: '#FFB347' }}>{'Star'.repeat(item.rating)}</Text> : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[s.greeting, { color: colors.textSecondary }]}>Merhaba,</Text>
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

      {/* Calendar Strip */}
      <View style={[s.calWrap, { backgroundColor: colors.background }]}>
        <View style={s.calHeader}>
          <TouchableOpacity onPress={() => setWeekOffset(w => w - 1)} style={[s.calArrow, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            <Text style={{ color: colors.textSecondary, fontWeight: '700', fontSize: 18 }}>‹</Text>
          </TouchableOpacity>
          <Text style={[s.calMonth, { color: colors.textPrimary }]}>
            {MONTHS_TR[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => setWeekOffset(w => w + 1)} style={[s.calArrow, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            <Text style={{ color: colors.textSecondary, fontWeight: '700', fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        </View>
        <View style={s.weekRow}>
          {weekDates.map((date, idx) => {
            const isSel = isDateSelected(date);
            return (
              <TouchableOpacity
                key={idx}
                style={[s.dayCell, isSel
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
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

      {/* Section Header */}
      <View style={s.sectionHeader}>
        <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Görevler ({tasks.length})</Text>
        <Text style={[s.sectionDate, { color: colors.textSecondary }]}>
          {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={item => item.id.toString()}
          renderItem={renderTask}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>📋</Text>
              <Text style={[s.emptyTitle, { color: colors.textPrimary }]}>Görev Yok</Text>
              <Text style={[s.emptyText, { color: colors.textSecondary }]}>Bu tarihte görev bulunmuyor.</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={[s.fab, { backgroundColor: colors.primary }]} onPress={() => setShowAddModal(true)}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>

      {/* ADD TASK MODAL */}
      <Modal animationType="slide" transparent visible={showAddModal} onRequestClose={() => setShowAddModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={s.modalBg}>
            <View style={[s.modalSheet, { backgroundColor: colors.surface }]}>
              <View style={[s.handle, { backgroundColor: colors.border }]} />
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={[s.modalTitle, { color: colors.textPrimary }]}>Yeni Görev Ekle</Text>

                <Text style={[s.fieldLabel, { color: colors.textSecondary }]}>BAŞLIK *</Text>
                <TextInput
                  style={[s.input, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="Görev başlığı..." placeholderTextColor={colors.textMuted}
                  value={newTitle} onChangeText={setNewTitle}
                />

                <Text style={[s.fieldLabel, { color: colors.textSecondary }]}>AÇIKLAMA</Text>
                <TextInput
                  style={[s.input, s.inputMulti, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="Görev açıklaması..." placeholderTextColor={colors.textMuted}
                  value={newDesc} onChangeText={setNewDesc} multiline numberOfLines={3}
                />

                <Text style={[s.fieldLabel, { color: colors.textSecondary }]}>SAAT</Text>
                <TouchableOpacity
                  style={[s.input, { backgroundColor: colors.surface2, borderColor: newTime ? colors.primary : colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                  onPress={openTimePicker}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: newTime ? colors.primary : colors.textMuted }}>
                    {newTime ? `🕐  ${newTime}` : 'Saat seçin...'}
                  </Text>
                  <Text style={{ fontSize: 18, color: colors.textMuted }}>›</Text>
                </TouchableOpacity>

                <Text style={[s.fieldLabel, { color: colors.textSecondary }]}>BAKICI SEÇ</Text>
                <TouchableOpacity
                  style={[s.selectorBtn, { backgroundColor: colors.surface2, borderColor: selectedCaregiver ? colors.primary : colors.border }]}
                  onPress={() => setShowCaregiverPicker(true)}
                >
                  {selectedCaregiver ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={[s.cgAvatar, { backgroundColor: colors.primary }]}>
                        <Text style={s.cgAvatarTxt}>{selectedCaregiver.full_name.split(' ').map(x => x[0]).join('').substring(0,2).toUpperCase()}</Text>
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary, flex: 1 }}>{selectedCaregiver.full_name}</Text>
                      <Text style={{ color: colors.primary, fontWeight: '700' }}>Seçildi</Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 13, color: colors.textMuted }}>Bakıcı seçmek için dokunun...</Text>
                  )}
                </TouchableOpacity>

                <View style={[s.modalFooter, { marginTop: 16 }]}>
                  <TouchableOpacity
                    style={[s.modalBtn, { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border }]}
                    onPress={() => { setShowAddModal(false); setCaregiverSearch(''); setSelectedCaregiver(null); }}
                  >
                    <Text style={[s.modalBtnTxt, { color: colors.textSecondary }]}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.modalBtn, { backgroundColor: colors.primary, opacity: addLoading ? 0.7 : 1 }]}
                    onPress={handleCreateTask} disabled={addLoading}
                  >
                    <Text style={[s.modalBtnTxt, { color: '#fff' }]}>Oluştur</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* TIME PICKER MODAL */}
      <Modal animationType="fade" transparent visible={showTimePicker} onRequestClose={() => setShowTimePicker(false)}>
        <View style={s.modalBg}>
          <View style={[s.modalSheet, { backgroundColor: colors.surface, alignItems: 'center' }]}>
            <View style={[s.handle, { backgroundColor: colors.border }]} />
            {(() => {
              const isOuter = pickerHour >= 1 && pickerHour <= 12;
              const haDeg = pickerStep === 'hour'
                ? (isOuter ? (pickerHour % 12) / 12 * 360 : (pickerHour === 0 ? 0 : (pickerHour - 12) / 12 * 360))
                : pickerMinute * 6;
              const haRad = haDeg * Math.PI / 180;
              const hLen = pickerStep === 'hour' ? (isOuter ? OUTER_R - 18 : INNER_R - 18) : OUTER_R - 18;
              return (
                <>
                  {/* Dijital gösterim */}
                  <View style={{ alignItems: 'center', marginBottom: 14 }}>
                    <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 }}>
                      {pickerStep === 'hour' ? 'SAAT' : 'DAK\u0130KA'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity onPress={() => setPickerStep('hour')}>
                        <Text style={{ fontSize: 48, fontWeight: '800', letterSpacing: 2, color: pickerStep === 'hour' ? colors.primary : colors.textSecondary }}>
                          {String(pickerHour).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                      <Text style={{ fontSize: 48, fontWeight: '800', color: colors.textSecondary, marginHorizontal: 4 }}>:</Text>
                      <TouchableOpacity onPress={() => setPickerStep('minute')}>
                        <Text style={{ fontSize: 48, fontWeight: '800', letterSpacing: 2, color: pickerStep === 'minute' ? colors.primary : colors.textSecondary }}>
                          {String(pickerMinute).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Saat yüzü */}
                  <View style={{ width: CLOCK_SIZE, height: CLOCK_SIZE, borderRadius: CLOCK_SIZE / 2, backgroundColor: colors.surface2, borderWidth: 1.5, borderColor: colors.border, position: 'relative', marginBottom: 14 }}>
                    {/* Merkez nokta */}
                    <View style={{ position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, top: CLOCK_CENTER - 5, left: CLOCK_CENTER - 5, zIndex: 10 }} />
                    {/* Akrep */}
                    <View style={{ position: 'absolute', top: CLOCK_CENTER, left: CLOCK_CENTER, width: 0, height: 0, zIndex: 5, transform: [{ rotate: `${haDeg}deg` }] }}>
                      <View style={{ width: 2, height: hLen, backgroundColor: colors.primary, position: 'absolute', bottom: 0, left: -1, borderRadius: 2, opacity: 0.85 }} />
                    </View>
                    {/* Akrep ucu */}
                    <View style={{ position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, opacity: 0.85, zIndex: 6, top: CLOCK_CENTER - hLen * Math.cos(haRad) - 4, left: CLOCK_CENTER + hLen * Math.sin(haRad) - 4 }} />

                    {pickerStep === 'hour' ? (
                      <>
                        {/* Dış halka: 12, 1, ..., 11 */}
                        {[12,1,2,3,4,5,6,7,8,9,10,11].map((h, i) => {
                          const pos = clockPos(i, 12, OUTER_R);
                          const sel = pickerHour === h;
                          const sched = new Date(selectedDate); sched.setHours(h, 59, 0, 0);
                          const past = sched < new Date();
                          return (
                            <TouchableOpacity key={`o${h}`} disabled={past} onPress={() => handleHourSelect(h)}
                              style={{ position: 'absolute', width: CELL_SIZE, height: CELL_SIZE, borderRadius: CELL_SIZE / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? colors.primary : 'transparent', opacity: past ? 0.3 : 1, left: pos.left, top: pos.top }}>
                              <Text style={{ fontSize: 14, fontWeight: '700', color: sel ? '#fff' : colors.textPrimary }}>{h}</Text>
                            </TouchableOpacity>
                          );
                        })}
                        {/* İç halka: 0, 13, ..., 23 */}
                        {[0,13,14,15,16,17,18,19,20,21,22,23].map((h, i) => {
                          const pos = clockPos(i, 12, INNER_R);
                          const sel = pickerHour === h;
                          const sched = new Date(selectedDate); sched.setHours(h, 59, 0, 0);
                          const past = sched < new Date();
                          return (
                            <TouchableOpacity key={`in${h}`} disabled={past} onPress={() => handleHourSelect(h)}
                              style={{ position: 'absolute', width: CELL_SIZE - 4, height: CELL_SIZE - 4, borderRadius: (CELL_SIZE - 4) / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? colors.primary : 'transparent', opacity: past ? 0.3 : 1, left: pos.left + 2, top: pos.top + 2 }}>
                              <Text style={{ fontSize: 11, fontWeight: '700', color: sel ? '#fff' : colors.textSecondary }}>{String(h).padStart(2,'0')}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </>
                    ) : (
                      [0,5,10,15,20,25,30,35,40,45,50,55].map((m, i) => {
                        const pos = clockPos(i, 12, OUTER_R);
                        const sel = pickerMinute === m;
                        const sched = new Date(selectedDate); sched.setHours(pickerHour, m, 0, 0);
                        const past = sched < new Date();
                        return (
                          <TouchableOpacity key={m} disabled={past} onPress={() => handleMinuteSelect(m)}
                            style={{ position: 'absolute', width: CELL_SIZE, height: CELL_SIZE, borderRadius: CELL_SIZE / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? colors.primary : 'transparent', opacity: past ? 0.3 : 1, left: pos.left, top: pos.top }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: sel ? '#fff' : colors.textPrimary }}>{String(m).padStart(2,'0')}</Text>
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </View>

                  {/* Elle dakika girişi */}
                  {pickerStep === 'minute' && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>Dakika (0-59):</Text>
                      <TextInput
                        style={{ width: 58, height: 36, borderWidth: 1.5, borderColor: colors.border, borderRadius: 8, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.textPrimary, backgroundColor: colors.surface2 }}
                        keyboardType="number-pad" maxLength={2}
                        value={minuteInputText}
                        onChangeText={(v) => {
                          setMinuteInputText(v);
                          const n = parseInt(v, 10);
                          if (!isNaN(n) && n >= 0 && n <= 59) setPickerMinute(n);
                        }}
                      />
                    </View>
                  )}

                  {/* Alt butonlar */}
                  <View style={[s.modalFooter, { marginTop: 4, justifyContent: 'center' }]}>
                    {pickerStep === 'minute' && (
                      <TouchableOpacity style={[s.modalBtn, { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border }]} onPress={() => setPickerStep('hour')}>
                        <Text style={[s.modalBtnTxt, { color: colors.textSecondary }]}>← Geri</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[s.modalBtn, { flex: 0, paddingHorizontal: 20, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border }]} onPress={() => setShowTimePicker(false)}>
                      <Text style={[s.modalBtnTxt, { color: colors.textSecondary }]}>İptal</Text>
                    </TouchableOpacity>
                    {pickerStep === 'minute' && (
                      <TouchableOpacity style={[s.modalBtn, { backgroundColor: colors.primary }]} onPress={() => handleMinuteSelect(pickerMinute)}>
                        <Text style={[s.modalBtnTxt, { color: '#fff' }]}>Tamam ✓</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>

      {/* CAREGIVER PICKER MODAL */}
      <Modal animationType="slide" transparent visible={showCaregiverPicker} onRequestClose={() => { setShowCaregiverPicker(false); setCaregiverSearch(''); }}>
        <View style={s.modalBg}>
          <View style={[s.modalSheet, { backgroundColor: colors.surface, maxHeight: '80%' }]}>
            <View style={[s.handle, { backgroundColor: colors.border }]} />
            <Text style={[s.modalTitle, { color: colors.textPrimary }]}>Bakıcı Seç</Text>
            <TextInput
              style={[s.input, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.textPrimary, marginBottom: 12 }]}
              placeholder="Bakıcı ara..." placeholderTextColor={colors.textMuted}
              value={caregiverSearch} onChangeText={setCaregiverSearch}
              autoFocus
            />
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {filteredCaregivers.length === 0 ? (
                <Text style={[s.noResultTxt, { color: colors.textMuted }]}>
                  {caregiverSearch ? 'Bakıcı bulunamadı' : 'Bakıcılar yükleniyor...'}
                </Text>
              ) : filteredCaregivers.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[s.caregiverRow,
                    selectedCaregiver?.id === c.id ? { backgroundColor: colors.primarySoft } : { backgroundColor: colors.surface2 },
                    { borderRadius: 10, marginBottom: 8 }
                  ]}
                  onPress={() => {
                    setSelectedCaregiver(selectedCaregiver?.id === c.id ? null : c);
                    setShowCaregiverPicker(false);
                    setCaregiverSearch('');
                  }}
                >
                  <View style={[s.cgAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={s.cgAvatarTxt}>{c.full_name.split(' ').map(x => x[0]).join('').substring(0,2).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cgName, { color: selectedCaregiver?.id === c.id ? colors.primary : colors.textPrimary }]}>{c.full_name}</Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>Hasta Bakıcı</Text>
                  </View>
                  {selectedCaregiver?.id === c.id && <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 18 }}>checkmark</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[s.modalBtn, { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, marginTop: 12 }]}
              onPress={() => { setShowCaregiverPicker(false); setCaregiverSearch(''); }}
            >
              <Text style={[s.modalBtnTxt, { color: colors.textSecondary }]}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* TASK DETAIL MODAL */}
      <Modal animationType="slide" transparent visible={showDetailModal} onRequestClose={() => { setShowDetailModal(false); setEditMode(false); setShowDeleteConfirm(false); }}>
        <View style={s.modalBg}>
          <View style={[s.modalSheet, { backgroundColor: colors.surface, maxHeight: '90%' }]}>
            <View style={[s.handle, { backgroundColor: colors.border }]} />
            <ScrollView showsVerticalScrollIndicator={false}>

              <TouchableOpacity style={[s.photoPlaceholder, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                <Text style={{ fontSize: 40 }}>📷</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 6 }}>Fotograf Ekle</Text>
              </TouchableOpacity>

              {/* Inline delete confirmation */}
              {showDeleteConfirm && (
                <View style={[s.deleteConfirmBox, { backgroundColor: 'rgba(255,107,107,0.1)', borderColor: colors.error }]}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.error, marginBottom: 12 }}>
                    Bu gorevi silmek istediginizden emin misiniz?
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      style={[s.modalBtn, { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border }]}
                      onPress={() => setShowDeleteConfirm(false)}
                    >
                      <Text style={[s.modalBtnTxt, { color: colors.textSecondary }]}>Vazgec</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.modalBtn, { backgroundColor: colors.error, opacity: deleteLoading ? 0.7 : 1 }]}
                      onPress={confirmDelete}
                      disabled={deleteLoading}
                    >
                      <Text style={[s.modalBtnTxt, { color: '#fff' }]}>{deleteLoading ? '...' : 'Evet, Sil'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {editMode ? (
                <>
                  <Text style={[s.fieldLabel, { color: colors.textSecondary }]}>BASLIK</Text>
                  <TextInput
                    style={[s.input, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.textPrimary }]}
                    value={editTitle} onChangeText={setEditTitle}
                  />
                  <Text style={[s.fieldLabel, { color: colors.textSecondary }]}>ACIKLAMA</Text>
                  <TextInput
                    style={[s.input, s.inputMulti, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.textPrimary }]}
                    value={editDesc} onChangeText={setEditDesc} multiline
                  />
                  <View style={s.modalFooter}>
                    <TouchableOpacity style={[s.modalBtn, { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border }]} onPress={() => setEditMode(false)}>
                      <Text style={[s.modalBtnTxt, { color: colors.textSecondary }]}>Vazgec</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.modalBtn, { backgroundColor: colors.primary, opacity: editLoading ? 0.7 : 1 }]} onPress={handleEditSave} disabled={editLoading}>
                      <Text style={[s.modalBtnTxt, { color: '#fff' }]}>Kaydet</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <Text style={[s.detailTitle, { color: colors.textPrimary, flex: 1 }]}>{selectedTask?.title}</Text>
                    {!showDeleteConfirm && (
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {selectedTask?.status !== 'tamamlandi' && (
                          <TouchableOpacity style={[s.smallBtn, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]} onPress={() => { setEditTitle(selectedTask?.title || ''); setEditDesc(selectedTask?.description || ''); setEditMode(true); }}>
                            <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '700' }}>Duzenle</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity style={[s.smallBtn, { backgroundColor: 'rgba(255,107,107,0.1)', borderColor: colors.error }]} onPress={handleDeleteTask}>
                          <Text style={{ fontSize: 11, color: colors.error, fontWeight: '700' }}>Sil</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {selectedTask?.description ? (
                    <Text style={[s.detailDesc, { color: colors.textSecondary }]}>{selectedTask.description}</Text>
                  ) : null}

                  {selectedTask?.status && (
                    <View style={[s.chip, { backgroundColor: getChipBg(selectedTask.status), alignSelf: 'flex-start', marginBottom: 12 }]}>
                      <Text style={[s.chipText, { color: getStatusColor(selectedTask.status, colors) }]}>{getStatusLabel(selectedTask.status)}</Text>
                    </View>
                  )}

                  {selectedTask?.problem_message && (
                    <View style={[s.problemBox, { backgroundColor: 'rgba(255,107,107,0.1)', borderColor: colors.error }]}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.error, marginBottom: 4 }}>Sorun Bildirimi</Text>
                      <Text style={{ fontSize: 12, color: colors.error }}>{selectedTask.problem_message}</Text>
                    </View>
                  )}

                  {selectedTask?.status === 'tamamlandi' && (
                    <>
                      <Text style={[s.fieldLabel, { color: colors.textSecondary, marginTop: 8 }]}>BAKICIYA PUAN VER</Text>
                      <View style={s.starRow}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <TouchableOpacity key={star} onPress={() => setRating(star)}>
                            <Text style={[s.star, { color: star <= rating ? '#FFB347' : colors.border }]}>★</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <TouchableOpacity
                        style={[s.rateBtn, { backgroundColor: colors.primary, opacity: ratingLoading ? 0.7 : 1 }]}
                        onPress={handleRate} disabled={ratingLoading}
                      >
                        <Text style={s.rateBtnTxt}>Puani Kaydet</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}

              <TouchableOpacity style={[s.closeBtn, { borderColor: colors.border, marginTop: 12 }]} onPress={() => { setShowDetailModal(false); setEditMode(false); setShowDeleteConfirm(false); }}>
                <Text style={[s.modalBtnTxt, { color: colors.textSecondary }]}>Kapat</Text>
              </TouchableOpacity>
            </ScrollView>
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
  userMenu: { position: 'absolute', top: 56, right: 16, borderRadius: 12, borderWidth: 1, minWidth: 160, overflow: 'hidden' },
  menuItem: { paddingVertical: 12, paddingHorizontal: 14 },
  calWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  calMonth: { fontSize: 13, fontWeight: '700' },
  calArrow: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  weekRow: { flexDirection: 'row', gap: 4 },
  dayCell: { flex: 1, height: 62, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 3 },
  dayName: { fontSize: 9, fontWeight: '600' },
  dayNum: { fontSize: 15, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '700' },
  sectionDate: { fontSize: 11, fontWeight: '500' },
  taskCard: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  taskBar: { width: 3 },
  taskInfo: { flex: 1, padding: 14, paddingLeft: 12 },
  taskTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  taskMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaItem: { fontSize: 10, fontWeight: '500' },
  chip: { borderRadius: 50, paddingVertical: 4, paddingHorizontal: 10 },
  chipText: { fontSize: 10, fontWeight: '600' },
  emptyWrap: { alignItems: 'center', paddingTop: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  emptyText: { fontSize: 13, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 80, right: 20, width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  fabText: { fontSize: 28, fontWeight: '300', color: '#fff' },
  modalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8, marginTop: 4 },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, marginBottom: 4 },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  timeChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5 },
  timePickerCell: { width: 56, height: 48, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  selectorBtn: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 4 },
  caregiverRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, gap: 10 },
  cgAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cgAvatarTxt: { fontSize: 12, fontWeight: '700', color: '#fff' },
  cgName: { fontSize: 13, fontWeight: '600' },
  noResultTxt: { fontSize: 12, textAlign: 'center', marginTop: 24, marginBottom: 8 },
  modalFooter: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  modalBtnTxt: { fontSize: 14, fontWeight: '700' },
  closeBtn: { paddingVertical: 13, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  photoPlaceholder: { height: 110, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  detailTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  detailDesc: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
  starRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  star: { fontSize: 34 },
  rateBtn: { borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginBottom: 10 },
  rateBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  smallBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  problemBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 },
  deleteConfirmBox: { borderWidth: 1.5, borderRadius: 12, padding: 14, marginBottom: 12 },
});