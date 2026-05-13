// src/screens/auth/VerifyEmailScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { useToast } from '../../../feedback/ToastContext';
import { verifyEmail, loginUser } from '../../../services/authService';

const CODE_LENGTH = 6;

export default function VerifyEmailScreen({ route, navigation }: any) {
  const { email, password } = route.params as { email: string; password: string };

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const { showToast } = useToast();

  const fullCode = code.join('');

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (fullCode.length < CODE_LENGTH) {
      showToast('Ingresa el código de 6 dígitos', 'error');
      return;
    }

    try {
      setLoading(true);

      // 1. Verificar email
      await verifyEmail(email, fullCode);

      // 2. Login automático con las credenciales que ya tenemos
      await loginUser(email, password);

      // 3. Continuar el flujo normal como antes
      navigation.replace('Story');

    } catch (err: any) {
      const msg = (err.response?.data?.message || '').toLowerCase();
      if (msg.includes('inválido') || msg.includes('invalid') || msg.includes('expirado')) {
        showToast('Código inválido o expirado', 'error');
      } else if (msg.includes('verificado') || msg.includes('already')) {
        // Si ya estaba verificado, igual hacemos login
        try {
          await loginUser(email, password);
          navigation.replace('Story');
        } catch {
          showToast('Error al iniciar sesión. Entra manualmente.', 'error');
          navigation.replace('Login');
        }
      } else {
        showToast('No se pudo verificar. Intenta de nuevo.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.replace('Register')}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Verifica tu{'\n'}correo</Text>
        <Text style={styles.subtitle}>
          Te enviamos un código a{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              style={[styles.codeInput, digit ? styles.codeInputFilled : null]}
              value={digit}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.buttonPrimary, (loading || fullCode.length < CODE_LENGTH) && { opacity: 0.6 }]}
          onPress={handleVerify}
          disabled={loading || fullCode.length < CODE_LENGTH}
        >
          {loading
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.buttonPrimaryText}>Verificar</Text>
          }
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>¿No llegó el correo? </Text>
          <TouchableOpacity onPress={() => showToast('Revisa tu carpeta de spam', 'info')}>
            <Text style={styles.resendLink}>Reenviar</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: 60, paddingBottom: spacing.xxl, flexGrow: 1 },
  backButton: { marginBottom: spacing.xl },
  title: { fontSize: fontSizes.xxl, fontWeight: '700', color: colors.text, lineHeight: 38, marginBottom: spacing.sm },
  subtitle: { fontSize: fontSizes.md, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.xxl },
  email: { color: colors.text, fontWeight: '600' },
  codeContainer: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', marginBottom: spacing.xl },
  codeInput: {
    width: 48, height: 56, borderRadius: borderRadius.md,
    backgroundColor: colors.inputBackground ?? '#ede8e3',
    textAlign: 'center', fontSize: fontSizes.xl, fontWeight: '700',
    color: colors.text, borderWidth: 2, borderColor: 'transparent',
  },
  codeInputFilled: { borderColor: colors.primary },
  buttonPrimary: {
    backgroundColor: colors.primary, paddingVertical: spacing.md,
    borderRadius: borderRadius.full, alignItems: 'center', marginBottom: spacing.lg,
  },
  buttonPrimaryText: { color: colors.white, fontSize: fontSizes.lg, fontWeight: '600' },
  resendContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingTop: spacing.xl },
  resendText: { color: colors.textMuted, fontSize: fontSizes.sm },
  resendLink: { color: colors.accent, fontSize: fontSizes.sm, fontWeight: '600' },
});