import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import StepLayout from '../../components/StepLayout';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';
import { useOnboarding } from '../../../../context/OnboardingContext';
import { completeProfile, createContact } from '../../../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isGuestMode, saveGuestProfile, saveGuestSobrietyStart, createGuestContact, markGuestProfileCompleted } from '../../../../services/guestService';
import { markOnboardingProfileCompleted } from '../../../../services/onboarding-storage';
import { useToast } from '../../../../feedback/ToastContext';
import { useNotificationSettings } from '../../../../hooks/useNotificationSettings';
import { useLocalNotifications } from '../../../../hooks/useLocalNotifications';

const { width } = Dimensions.get('window');
const CLOCK_SIZE = width * 0.7;
const CENTER = CLOCK_SIZE / 2;
const RADIUS = CENTER - 20;

export default function Step10_Horario({ navigation, route }: any) {
    const [hour, setHour] = useState(9);
    const [minute, setMinute] = useState(0);
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
    const [mode, setMode] = useState<'hour' | 'minute'>('hour');
    const [loading, setLoading] = useState(false);
    const { data } = useOnboarding();
    const { showToast } = useToast();
    const { updateSettings } = useNotificationSettings();
    const { scheduleDailyReminder } = useLocalNotifications();

    // Si el usuario dijo "NO" en Step9b, saltamos el reloj
    const skipClock = route?.params?.skipClock === true;
    const wantsNotifications = data?.wants_notifications === true;

    const hourNumbers = Array.from({ length: 12 }, (_, i) => i + 1);
    const minuteNumbers = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

    const getPosition = (value: number, total: number) => {
        const angle = ((value / total) * 360 - 90) * (Math.PI / 180);
        return {
            x: CENTER + RADIUS * Math.cos(angle) - 14,
            y: CENTER + RADIUS * Math.sin(angle) - 14,
        };
    };

    const getHandAngle = () => {
        if (mode === 'hour') return (hour / 12) * 360 - 90;
        return (minute / 60) * 360 - 90;
    };

    const handleHourSelect = (h: number) => {
        setHour(h);
        setTimeout(() => setMode('minute'), 300);
    };

    const handleMinuteSelect = (m: number) => {
        setMinute(m);
    };

    const handleFinish = async () => {
        try {
            setLoading(true);

            // Si saltamos el reloj, hora por defecto (no se usará)
            const hourIn24 = skipClock
                ? 9
                : (period === 'PM' && hour !== 12
                    ? hour + 12
                    : period === 'AM' && hour === 12
                        ? 0
                        : hour);
            const minuteFinal = skipClock ? 0 : minute;
            const moment_motiv = `${hourIn24.toString().padStart(2, '0')}:${minuteFinal.toString().padStart(2, '0')}:00`;

            const guest = await isGuestMode();

            // IMPORTANTE: extraer nombre_contacto Y wants_notifications del data.
            // wants_notifications es solo para uso interno del frontend (decide si agendar
            // notificacion local), NO va al backend de completeProfile que valida estrictamente
            // los campos permitidos.
            const { nombre_contacto, wants_notifications, ...profileData } = data;

            if (guest) {
                await saveGuestProfile({ ...profileData, moment_motiv });
                await saveGuestSobrietyStart(data.ult_fecha_consumo);

                if (nombre_contacto && profileData.telefono) {
                    await createGuestContact(nombre_contacto, profileData.telefono.toString());
                }

                await markGuestProfileCompleted();

                // Solo agendar local (guest no usa backend)
                if (wantsNotifications) {
                    await scheduleDailyReminder(hourIn24, minuteFinal).catch((err) => {
                        console.log('⚠️ No se pudo agendar notificacion local:', err);
                    });
                }

                navigation.navigate('Congratulations');
            } else {
                await completeProfile({ ...profileData, moment_motiv });

                if (nombre_contacto && profileData.telefono) {
                    await createContact(nombre_contacto, profileData.telefono.toString());
                }

                // 🔔 Guardar preferencias en ROBLE
                try {
                    await updateSettings({
                        push_notifications_enabled: wantsNotifications,
                        preferred_reminder_hour: wantsNotifications ? hourIn24 : null,
                        preferred_reminder_minute: wantsNotifications ? minuteFinal : null,
                    });
                    console.log('✅ Preferencias guardadas en ROBLE');
                } catch (notifErr) {
                    console.log('⚠️ No se pudo guardar preferencias en ROBLE:', notifErr);
                }

                // 🔔 Agendar notificacion local si aplica
                if (wantsNotifications) {
                    await scheduleDailyReminder(hourIn24, minuteFinal).catch((err) => {
                        console.log('⚠️ No se pudo agendar notificacion local:', err);
                    });
                }

                navigation.navigate('Congratulations');
            }
        } catch (err: any) {
            console.log('Error completando perfil:', err.response?.data);
            showToast('No se pudo guardar tu perfil. Intenta de nuevo.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Si saltamos el reloj, mostrar layout simplificado
    if (skipClock) {
        return (
            <StepLayout
                currentStep={7}
                question="¡Listo! Finalicemos tu perfil"
                characterImage={require('../../../../assets/images/character11.png')}
                onBack={() => navigation.goBack()}
                onContinue={handleFinish}
                showButton={true}
            >
                <View style={styles.container}>
                    <Text style={styles.skipText}>
                        Has elegido no recibir recordatorios. Podrás activarlos cuando
                        quieras desde Configuración.
                    </Text>
                </View>
            </StepLayout>
        );
    }

    return (
        <StepLayout
            currentStep={7}
            question="¿En qué momento prefieres que te motivemos?"
            characterImage={require('../../../../assets/images/character11.png')}
            onBack={() => navigation.goBack()}
            onContinue={handleFinish}
            showButton={true}
        >
            <View style={styles.container}>

                <View style={styles.timeDisplay}>
                    <TouchableOpacity
                        style={[styles.timeBox, mode === 'hour' && styles.timeBoxActive]}
                        onPress={() => setMode('hour')}
                    >
                        <Text style={[styles.timeText, mode === 'hour' && styles.timeTextActive]}>
                            {hour.toString().padStart(2, '0')}
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.timeSeparator}>:</Text>
                    <TouchableOpacity
                        style={[styles.timeBox, mode === 'minute' && styles.timeBoxActive]}
                        onPress={() => setMode('minute')}
                    >
                        <Text style={[styles.timeText, mode === 'minute' && styles.timeTextActive]}>
                            {minute.toString().padStart(2, '0')}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.periodContainer}>
                        <TouchableOpacity
                            style={[styles.periodButton, period === 'AM' && styles.periodButtonSelected]}
                            onPress={() => setPeriod('AM')}
                        >
                            <Text style={[styles.periodText, period === 'AM' && styles.periodTextSelected]}>AM</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.periodButton, period === 'PM' && styles.periodButtonSelected]}
                            onPress={() => setPeriod('PM')}
                        >
                            <Text style={[styles.periodText, period === 'PM' && styles.periodTextSelected]}>PM</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.modeLabel}>
                    {mode === 'hour' ? 'Selecciona la hora' : 'Selecciona los minutos'}
                </Text>

                <View style={styles.clockContainer}>
                    <View style={styles.clock}>

                        <View style={[
                            styles.hand,
                            {
                                transform: [{ rotate: `${getHandAngle()}deg` }],
                                width: RADIUS - 10,
                                left: CENTER,
                                top: CENTER - 2,
                            }
                        ]} />

                        <View style={styles.centerDot} />

                        {mode === 'hour' && hourNumbers.map((h) => {
                            const pos = getPosition(h, 12);
                            return (
                                <TouchableOpacity
                                    key={h}
                                    style={[
                                        styles.hourButton,
                                        { left: pos.x, top: pos.y },
                                        hour === h && styles.hourButtonSelected,
                                    ]}
                                    onPress={() => handleHourSelect(h)}
                                >
                                    <Text style={[styles.hourText, hour === h && styles.hourTextSelected]}>
                                        {h}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}

                        {mode === 'minute' && minuteNumbers.map((m) => {
                            const pos = getPosition(m, 60);
                            return (
                                <TouchableOpacity
                                    key={m}
                                    style={[
                                        styles.hourButton,
                                        { left: pos.x, top: pos.y },
                                        minute === m && styles.hourButtonSelected,
                                    ]}
                                    onPress={() => handleMinuteSelect(m)}
                                >
                                    <Text style={[styles.hourText, minute === m && styles.hourTextSelected]}>
                                        {m.toString().padStart(2, '0')}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}

                    </View>
                </View>

            </View>
        </StepLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: spacing.md,
    },
    skipText: {
        fontSize: fontSizes.md,
        color: colors.text,
        textAlign: 'center',
        paddingHorizontal: spacing.lg,
        lineHeight: 24,
    },
    timeDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    timeBox: {
        backgroundColor: colors.inputBackground,
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        minWidth: 60,
        alignItems: 'center',
    },
    timeBoxActive: {
        backgroundColor: colors.primary,
    },
    timeText: {
        fontSize: fontSizes.xxl,
        fontWeight: '600',
        color: colors.text,
    },
    timeSeparator: {
        fontSize: fontSizes.xxl,
        fontWeight: '600',
        color: colors.text,
    },
    periodContainer: {
        gap: 4,
        marginLeft: spacing.xs,
    },
    periodButton: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.inputBackground,
    },
    periodButtonSelected: {
        backgroundColor: colors.primary,
    },
    periodText: {
        fontSize: fontSizes.sm,
        color: colors.textMuted,
        fontWeight: '600',
    },
    periodTextSelected: {
        color: colors.white,
    },
    modeLabel: {
        fontSize: fontSizes.sm,
        color: colors.textMuted,
    },
    clockContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    clock: {
        width: CLOCK_SIZE,
        height: CLOCK_SIZE,
        borderRadius: CLOCK_SIZE / 2,
        backgroundColor: colors.inputBackground,
        position: 'relative',
    },
    hand: {
        position: 'absolute',
        height: 3,
        backgroundColor: colors.primary,
        borderRadius: 2,
        transformOrigin: 'left center',
    },
    centerDot: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
        left: CENTER - 6,
        top: CENTER - 6,
        zIndex: 10,
    },
    hourButton: {
        position: 'absolute',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hourButtonSelected: {
        backgroundColor: colors.primary,
    },
    hourText: {
        fontSize: fontSizes.sm,
        color: colors.text,
    },
    hourTextSelected: {
        color: colors.white,
        fontWeight: '700',
    },
    timeTextActive: {
        color: colors.white,
    },
});