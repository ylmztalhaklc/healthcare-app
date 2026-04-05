import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function RelativeHomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { colors, isDark, toggleTheme } = useTheme();

  const styles = StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerContent: {
      flex: 1,
    },
    greeting: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    userName: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
      marginTop: 2,
    },
    role: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: '600',
      marginTop: 1,
    },
    themeBtn: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    banner: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
    },
    bannerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 8,
    },
    bannerText: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.9)',
      lineHeight: 20,
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 12,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    actionsContainer: {
      marginBottom: 28,
    },
    actionCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 16,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    actionIcon: {
      fontSize: 24,
      width: 36,
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    actionDesc: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
      fontWeight: '500',
    },
    actionArrow: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    accountSection: {
      marginBottom: 32,
    },
    buttonPrimary: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      marginBottom: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonDanger: {
      backgroundColor: colors.error,
      borderRadius: 12,
      paddingVertical: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Merhaba,</Text>
          <Text style={styles.userName}>{user?.full_name || 'Kullanıcı'}</Text>
          <Text style={styles.role}>Hasta Yakını</Text>
        </View>
        <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme}>
          <Text style={{ fontSize: 18, color: colors.primary }}>{isDark ? '◐' : '◑'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Welcome Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Hoşgeldiniz!</Text>
          <Text style={styles.bannerText}>
            Hasta bakım görevlerinizi yönetin, bakıcılar ile iletişim kurun ve ilerlemeyi takip edin.
          </Text>
        </View>

        {/* Quick Actions - Relative Role */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('RelativeTasks')}>
            <Text style={styles.actionIcon}>☐</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Görevlerimi Gör</Text>
              <Text style={styles.actionDesc}>Tüm görevleri listele</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('RelativeMessages')}>
            <Text style={styles.actionIcon}>✉</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Mesajlar</Text>
              <Text style={styles.actionDesc}>Bakıcılar ile iletişim</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('RelativeNotifications')}>
            <Text style={styles.actionIcon}>◐</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Bildirimler</Text>
              <Text style={styles.actionDesc}>Güncel bildirimler</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Hesap</Text>

          <TouchableOpacity style={styles.buttonPrimary} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.buttonText}>Profili Düzenle</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonDanger} onPress={logout}>
            <Text style={styles.buttonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
