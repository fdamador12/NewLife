import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet,
    TouchableOpacity, KeyboardAvoidingView, Platform,
    ScrollView, ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { useToast } from '../../../feedback/ToastContext';
import FieldError from '../../../feedback/FieldError';
import api from '../../../services/api';
import { forgotPassword } from '../../../services/authService';

export default function ForgotPasswordScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const validarEmail = (mail: string) => {
        if (!mail.trim()) return 'El correo es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.trim())) return 'Ingresa un correo válido';
        return '';
    };

    const handleSubmit = async () => {
        const err = validarEmail(email);
        if (err) { setEmailError(err); return; }

        try {
            setLoading(true);
            await forgotPassword(email.trim());
        } catch {
            // No revelar si el correo existe o no
        } finally {
            setLoading(false);
        }

        showToast('Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña', 'success');
        navigation.replace('Login');
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

                <Text style={styles.title}>¿Olvidaste tu{'\n'}contraseña?</Text>
                <Text style={styles.subtitle}>
                    Ingresa tu correo y te enviamos un código para restablecerla.
                </Text>

                <View style={styles.inputsContainer}>
                    <View>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Tu correo"
                                placeholderTextColor={colors.border}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={(t) => { setEmail(t); if (emailError) setEmailError(''); }}
                            />
                        </View>
                        <FieldError message={emailError} />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.buttonPrimary, loading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color={colors.white} />
                        : <Text style={styles.buttonPrimaryText}>Enviar código</Text>
                    }
                </TouchableOpacity>

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
    inputsContainer: { marginBottom: spacing.xl },
    inputWrapper: { height: 52, backgroundColor: colors.inputBackground, borderRadius: borderRadius.full, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center' },
    input: { flex: 1, height: 52, fontSize: fontSizes.md, color: colors.text },
    buttonPrimary: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.full, alignItems: 'center' },
    buttonPrimaryText: { color: colors.white, fontSize: fontSizes.lg, fontWeight: '600' },
});