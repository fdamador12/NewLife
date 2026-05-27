import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { registerUser } from '../../../services/authService';
import { isGuestMode, clearGuestData, hasGuestCompletedProfile } from '../../../services/guestService';
import { migrateGuestToUser } from '../../../services/authService';
import { hasCompletedOnboardingProfile } from '../../../services/onboarding-storage';
import FieldError from '../../../feedback/FieldError';
import { useToast } from '../../../feedback/ToastContext';

const INPUT_HEIGHT = 52;

const validarPassword = (pwd: string): string => {
  if (!pwd) return 'La contraseña es obligatoria';
  if (pwd.length < 8) return 'Debe tener al menos 8 caracteres';
  if (!/[A-Z]/.test(pwd)) return 'Debe incluir al menos una letra mayúscula';
  if (!/[a-z]/.test(pwd)) return 'Debe incluir al menos una letra minúscula';
  if (!/[0-9]/.test(pwd)) return 'Debe incluir al menos un número';
  if (!/[!@#$_\-.]/.test(pwd)) return 'Debe incluir un símbolo: ! @ # $ _ - .';
  return '';
};

const validarEmail = (mail: string): string => {
  if (!mail.trim()) return 'El correo es obligatorio';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.trim())) return 'Ingresa un correo válido, ej: nombre@correo.com';
  return '';
};

const parsearErrorServidor = (msg: string, status?: number): string => {
  const m = (msg || '').toLowerCase();
  if (status === 409 || m.includes('exist') || m.includes('registrado') || m.includes('uso')) {
    return 'Ya existe una cuenta con ese correo.';
  }
  if (status === 500) return 'Error del servidor. Intenta más tarde.';
  return 'Algo salió mal. Intenta de nuevo.';
};

export default function RegisterScreen({ navigation }: any) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nombreError, setNombreError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const { showToast } = useToast();

  const handleRegister = async () => {
    Keyboard.dismiss();
    setNombreError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');

    let valid = true;

    if (!nombre.trim()) {
      setNombreError('El nombre es obligatorio');
      valid = false;
    }

    const emailErr = validarEmail(email);
    if (emailErr) { setEmailError(emailErr); valid = false; }

    const pwdErr = validarPassword(password);
    if (pwdErr) { setPasswordError(pwdErr); valid = false; }

    if (!confirmPassword) {
      setConfirmError('Confirma tu contraseña');
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Las contraseñas no coinciden');
      valid = false;
    }

    if (!valid) return;

    try {
      setLoading(true);

      const wasGuest = await isGuestMode();
      const guestCompletedProfile = wasGuest ? await hasGuestCompletedProfile() : false;

      await registerUser(nombre, email, password);

      navigation.navigate('VerifyEmail', {
        email,
        password,
        fromGuest: wasGuest && guestCompletedProfile,
      });

    } catch (err: any) {
      if (!err.response) {
        showToast('Sin conexión o servidor no disponible', 'error');
        return;
      }
      const status = err.response.status;
      const msg = typeof err.response.data?.message === 'string'
        ? err.response.data.message : '';
      showToast(parsearErrorServidor(msg, status), 'error');
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

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>¡Hola! Regístrate{'\n'}para empezar</Text>

        <View style={styles.inputsContainer}>

          <View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor={colors.border}
                autoCapitalize="words"
                value={nombre}
                onChangeText={(t) => { setNombre(t); if (nombreError) setNombreError(''); }}
              />
            </View>
            <FieldError message={nombreError} />
          </View>

          <View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Correo"
                placeholderTextColor={colors.border}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => { setEmail(t); if (emailError) setEmailError(''); }}
              />
            </View>
            <FieldError message={emailError} />
          </View>

          <View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor={colors.border}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(t) => { setPassword(t); if (passwordError) setPasswordError(''); }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <FieldError message={passwordError} />
          </View>

          <View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor={colors.border}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); if (confirmError) setConfirmError(''); }}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
                <Icon name={showConfirm ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <FieldError message={confirmError} />
          </View>

        </View>

        <TouchableOpacity
          style={[styles.buttonPrimary, loading && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.buttonPrimaryText}>Registrarse</Text>
          }
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Entra aquí</Text>
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
  title: { fontSize: fontSizes.xxl, fontWeight: '700', color: colors.text, lineHeight: 38, marginBottom: spacing.xxl },
  inputsContainer: { gap: spacing.sm, marginBottom: spacing.xl },
  inputWrapper: { height: INPUT_HEIGHT, backgroundColor: colors.inputBackground, borderRadius: borderRadius.full, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, height: INPUT_HEIGHT, fontSize: fontSizes.md, color: colors.text },
  eyeButton: { padding: 4 },
  buttonPrimary: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.full, alignItems: 'center', marginBottom: spacing.lg },
  buttonPrimaryText: { color: colors.white, fontSize: fontSizes.lg, fontWeight: '600' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingTop: spacing.xl },
  loginText: { color: colors.textMuted, fontSize: fontSizes.sm },
  loginLink: { color: colors.accent, fontSize: fontSizes.sm, fontWeight: '600' },
});