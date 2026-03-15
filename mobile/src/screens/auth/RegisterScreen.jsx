import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { typography, spacing, radius } from '../../theme';
import { ROLES } from '../../constants/config';

export default function RegisterScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { register } = useAuth();
  const s = makeStyles(colors);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES.RELATIVE);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Hata', 'Tüm alanları doldurunuz.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }
    setLoading(true);
    try {
      await register(fullName.trim(), email.trim(), password, role);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Kayıt başarısız.';
      Alert.alert('Hata', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backText}>← Geri</Text>
          </TouchableOpacity>

          <View style={s.card}>
            <Text style={s.cardTitle}>Kayıt Ol</Text>
            <Text style={s.cardSubtitle}>Yeni hesap oluşturun</Text>

            {/* Full Name */}
            <View style={s.inputGroup}>
              <Text style={s.label}>Ad Soyad</Text>
              <TextInput
                style={s.input}
                placeholder="Adınız Soyadınız"
                placeholderTextColor={colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Email */}
            <View style={s.inputGroup}>
              <Text style={s.label}>E-posta</Text>
              <TextInput
                style={s.input}
                placeholder="ornek@email.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={s.inputGroup}>
              <Text style={s.label}>Şifre</Text>
              <TextInput
                style={s.input}
                placeholder="Min 6 karakter"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Role Selector */}
            <View style={s.inputGroup}>
              <Text style={s.label}>Rol</Text>
              <View style={s.roleRow}>
                <TouchableOpacity
                  style={[s.roleBtn, role === ROLES.RELATIVE && s.roleActive]}
                  onPress={() => setRole(ROLES.RELATIVE)}
                >
                  <Text style={[s.roleBtnText, role === ROLES.RELATIVE && s.roleActiveText]}>
                    Hasta Yakını
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.roleBtn, role === ROLES.CAREGIVER && s.roleActive]}
                  onPress={() => setRole(ROLES.CAREGIVER)}
                >
                  <Text style={[s.roleBtnText, role === ROLES.CAREGIVER && s.roleActiveText]}>
                    Hasta Bakıcısı
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[s.btn, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnText}>Kayıt Ol</Text>
              )}
            </TouchableOpacity>

            <View style={s.loginRow}>
              <Text style={s.loginText}>Hesabınız var mı? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={s.loginLink}>Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl },
    backBtn: { marginBottom: spacing.lg },
    backText: { color: colors.primary, ...typography.bodyLG },

    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.xxl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: { ...typography.headingLG, color: colors.textPrimary, marginBottom: 4 },
    cardSubtitle: { ...typography.bodyMD, color: colors.textSecondary, marginBottom: spacing.xl },

    inputGroup: { marginBottom: spacing.lg },
    label: { ...typography.labelMD, color: colors.textSecondary, marginBottom: spacing.xs },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      color: colors.textPrimary,
      ...typography.bodyLG,
    },

    roleRow: { flexDirection: 'row', gap: spacing.sm },
    roleBtn: {
      flex: 1,
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      alignItems: 'center',
      backgroundColor: colors.card,
    },
    roleActive: { borderColor: colors.primary, backgroundColor: colors.primary + '20' },
    roleBtnText: { ...typography.labelMD, color: colors.textSecondary },
    roleActiveText: { color: colors.primary, fontWeight: '600' },

    btn: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    btnText: { color: '#fff', ...typography.labelLG },

    loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
    loginText: { ...typography.bodyMD, color: colors.textSecondary },
    loginLink: { ...typography.labelLG, color: colors.primary },
  });
}
