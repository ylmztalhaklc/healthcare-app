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

export default function LoginScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { login } = useAuth();
  const s = makeStyles(colors);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Hata', 'E-posta ve şifre giriniz.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Giriş başarısız.';
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
          {/* Logo / Brand */}
          <View style={s.logoArea}>
            <View style={s.logoCircle}>
              <Text style={s.logoIcon}>+</Text>
            </View>
            <Text style={s.appName}>HealthCare</Text>
            <Text style={s.appTagline}>Hasta Bakım Yönetim Sistemi</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Giriş Yap</Text>
            <Text style={s.cardSubtitle}>Hesabınıza giriş yapın</Text>

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
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={s.inputGroup}>
              <Text style={s.label}>Şifre</Text>
              <View style={s.passwordRow}>
                <TextInput
                  style={[s.input, { flex: 1, marginTop: 0 }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(v => !v)}
                  style={s.eyeBtn}
                >
                  <Text style={{ color: colors.textSecondary, fontSize: 18 }}>
                    {showPassword ? '🙈' : '👁'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[s.btn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnText}>Giriş Yap</Text>
              )}
            </TouchableOpacity>

            {/* Register link */}
            <View style={s.registerRow}>
              <Text style={s.registerText}>Hesabınız yok mu? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={s.registerLink}>Kayıt Ol</Text>
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

    // Logo
    logoArea: { alignItems: 'center', marginBottom: 32 },
    logoCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    logoIcon: { color: '#fff', fontSize: 36, fontWeight: '700' },
    appName: { ...typography.headingXL, color: colors.textPrimary },
    appTagline: { ...typography.bodyMD, color: colors.textSecondary, marginTop: 4 },

    // Card
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.xxl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: { ...typography.headingLG, color: colors.textPrimary, marginBottom: 4 },
    cardSubtitle: { ...typography.bodyMD, color: colors.textSecondary, marginBottom: spacing.xl },

    // Input
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
    passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    eyeBtn: { padding: spacing.sm },

    // Button
    btn: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    btnText: { color: '#fff', ...typography.labelLG },

    // Register
    registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
    registerText: { ...typography.bodyMD, color: colors.textSecondary },
    registerLink: { ...typography.labelLG, color: colors.primary },
  });
}
