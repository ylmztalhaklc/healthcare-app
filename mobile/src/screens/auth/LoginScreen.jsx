import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { login } = useAuth();

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
      const msg = err.response?.data?.detail || 'Giriş başarısız. Bilgilerinizi kontrol edin.';
      Alert.alert('Hata', msg);
    } finally {
      setLoading(false);
    }
  }

  const s = StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    scroll: {
      flexGrow: 1,
    },

    hero: {
      height: 220,
      backgroundColor: colors.background,
      position: 'relative',
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.surface2,
    },
    logo: {
      width: 60,
      height: 60,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      zIndex: 10,
    },
    logoIcon: {
      fontSize: 26,
      fontWeight: '800',
      color: '#fff',
    },
    logoText: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    logoSub: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    heroContent: {
      alignItems: 'center',
      zIndex: 10,
    },

    themeToggleBtn: {
      position: 'absolute',
      top: 12,
      right: 20,
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    themeEmoji: {
      fontSize: 18,
    },

    formContainer: {
      padding: 24,
      paddingBottom: 40,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    titleHighlight: {
      color: colors.primary,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 20,
    },

    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    input: {
      height: 44,
      backgroundColor: colors.surface2,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 14,
      fontSize: 13,
      color: colors.textPrimary,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface2,
    },
    passwordInput: {
      flex: 1,
      height: 44,
      paddingHorizontal: 14,
      fontSize: 13,
      color: colors.textPrimary,
    },
    passwordToggle: {
      paddingRight: 12,
    },

    btnPrimary: {
      height: 48,
      backgroundColor: colors.primary,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    btnText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0.3,
    },

    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginVertical: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '500',
    },

    registerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 16,
    },
    registerText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    registerLink: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '600',
      marginLeft: 4,
    },
  });

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          {/* Hero Section */}
          <View style={s.hero}>
            <TouchableOpacity style={s.themeToggleBtn} onPress={toggleTheme}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={isDark ? '#FBBF24' : '#60A5FA'} />
            </TouchableOpacity>
            <View style={s.heroContent}>
              <View style={s.logo}>
                <Text style={s.logoIcon}>+</Text>
              </View>
              <Text style={s.logoText}>HealthCare RN</Text>
              <Text style={s.logoSub}>Hasta Bakım Yönetim Sistemi</Text>
            </View>
          </View>

          {/* Form Section */}
          <View style={s.formContainer}>
            <Text style={s.title}>
              Tekrar <Text style={s.titleHighlight}>Hoş Geldin</Text>
            </Text>
            <Text style={s.subtitle}>Hesabına giriş yap.</Text>

            {/* Email Input */}
            <View style={s.inputGroup}>
              <Text style={s.label}>E-POSTA</Text>
              <TextInput
                style={s.input}
                placeholder="ornek@email.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={s.inputGroup}>
              <Text style={s.label}>SIFRE</Text>
              <View style={s.passwordContainer}>
                <TextInput
                  style={s.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={s.passwordToggle} onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[s.btnPrimary, loading && { opacity: 0.7 }]}
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

            {/* Divider */}
            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>veya</Text>
              <View style={s.dividerLine} />
            </View>

            {/* Register Link */}
            <View style={s.registerRow}>
              <Text style={s.registerText}>Hesabınız yok mu?</Text>
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