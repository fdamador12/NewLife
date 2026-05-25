import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import StepLayout from '../../components/StepLayout';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';
import { useOnboarding } from '../../../../context/OnboardingContext';

/**
 * Pantalla previa al Step10 (reloj de hora).
 * Pregunta al usuario si quiere recibir recordatorios diarios.
 * Usa un Switch (mas intuitivo para ON/OFF) que el usuario activa/desactiva
 * y luego presiona Continuar.
 *
 * Cumple con el principio de consentimiento informado (Ley 1581).
 */
export default function Step9b_NotificacionesConsentimiento({ navigation }: any) {
    const [enabled, setEnabled] = useState<boolean>(false);
    const [touched, setTouched] = useState<boolean>(false);
    const { setField } = useOnboarding();

    const handleToggle = (value: boolean) => {
        setEnabled(value);
        setTouched(true);
    };

    const handleContinue = () => {
        if (enabled) {
            setField('wants_notifications', true);
            navigation.navigate('Step10');
        } else {
            setField('wants_notifications', false);
            setField('moment_motiv', '09:00:00');
            navigation.navigate('Step10', { skipClock: true });
        }
    };

    return (
        <StepLayout
            currentStep={7}
            question="¿Te motivamos con un recordatorio cada día?"
            characterImage={require('../../../../assets/images/character11.png')}
            onBack={() => navigation.goBack()}
            onContinue={handleContinue}
            showButton={touched}
            continueLabel="Continuar"
        >
            <View style={styles.container}>
                <View style={[styles.card, enabled && styles.cardActive]}>
                    <View style={styles.cardLeft}>
                        <View style={[styles.iconCircle, enabled && styles.iconCircleActive]}>
                            <Feather
                                name="bell"
                                size={18}
                                color={enabled ? colors.white : colors.primary}
                            />
                        </View>
                        <View style={styles.textBlock}>
                            <Text style={styles.cardTitle}>Recordatorios diarios</Text>
                            <Text style={styles.cardSubtitle}>
                                {enabled ? 'Activados' : 'Desactivados'}
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={enabled}
                        onValueChange={handleToggle}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.white}
                    />
                </View>

                <Text style={styles.helperText}>
                    Puedes cambiar esta preferencia cuando quieras desde la
                    pantalla de Configuración.
                </Text>
            </View>
        </StepLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.lg,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.inputBackground,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    cardActive: {
        borderColor: colors.primary,
        backgroundColor: colors.white,
    },
    cardLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircleActive: {
        backgroundColor: colors.primary,
    },
    textBlock: {
        flex: 1,
        gap: 2,
    },
    cardTitle: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
    },
    cardSubtitle: {
        fontSize: fontSizes.sm,
        color: colors.textMuted,
    },
    helperText: {
        fontSize: fontSizes.xs,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 18,
    },
});