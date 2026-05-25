import React, { useEffect, useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Switch, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { useNotificationSettings } from '../../../hooks/useNotificationSettings';
import { useLocalNotifications } from '../../../hooks/useLocalNotifications';
import { useToast } from '../../../feedback/ToastContext';
import TimePickerModal from './TimePickerModal';

/**
 * Card expandible para gestionar notificaciones desde Settings.
 * Sigue el patron visual exacto de InfoAccordion.tsx.
 *
 * FIX: cuando el usuario activa el toggle por PRIMERA vez sin tener una hora
 * configurada previamente (ej. dijo "no" en el onboarding y ahora cambia de
 * opinion en Settings), se le asigna automaticamente una hora por defecto
 * (9:00 AM) para que la notificacion se pueda agendar.
 */

const DEFAULT_HOUR = 9;
const DEFAULT_MINUTE = 0;

export default function NotificationSettingsCard() {
    const { showToast } = useToast();
    const {
        settings,
        loading,
        getSettings,
        toggleNotifications,
        setPreferredTime,
    } = useNotificationSettings();
    const {
        scheduleDailyReminder,
        cancelDailyReminder,
        sendTestNotification,
    } = useLocalNotifications();

    const [expanded, setExpanded] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        getSettings();
    }, [getSettings]);

    const enabled = settings?.push_notifications_enabled === true;
    const hour = settings?.preferred_reminder_hour ?? DEFAULT_HOUR;
    const minute = settings?.preferred_reminder_minute ?? DEFAULT_MINUTE;

    // True si el usuario NO tiene hora preferida guardada (vino del onboarding con "no")
    const noHasStoredTime =
        settings?.preferred_reminder_hour === null ||
        settings?.preferred_reminder_hour === undefined;

    const formatTime = (h: number, m: number) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
    };

    const handleToggle = async (value: boolean) => {
        if (value) {
            // Activando: si no tiene hora previa, guardamos enabled=true + hora por defecto
            // en una sola llamada para evitar quedar en estado inconsistente (enabled=true sin hora)
            if (noHasStoredTime) {
                const updated = await setPreferredTime(DEFAULT_HOUR, DEFAULT_MINUTE, true);
                if (!updated) {
                    showToast('No se pudo actualizar. Intenta de nuevo.', 'error');
                    return;
                }

                const ok = await scheduleDailyReminder(DEFAULT_HOUR, DEFAULT_MINUTE);
                if (ok) {
                    showToast(
                        `Recordatorio activado a las ${formatTime(DEFAULT_HOUR, DEFAULT_MINUTE)}. Puedes cambiar la hora abajo.`,
                        'success',
                    );
                } else {
                    showToast('Activado, pero faltan permisos del sistema', 'info');
                }
                return;
            }

            // Ya tenia hora previa: solo prender + agendar con la hora guardada
            const updated = await toggleNotifications(true);
            if (!updated) {
                showToast('No se pudo actualizar. Intenta de nuevo.', 'error');
                return;
            }

            const ok = await scheduleDailyReminder(hour, minute);
            if (ok) {
                showToast(`Recordatorio activado a las ${formatTime(hour, minute)}`, 'success');
            } else {
                showToast('Activado, pero faltan permisos del sistema', 'info');
            }
        } else {
            // Desactivando: solo apagar + cancelar
            const updated = await toggleNotifications(false);
            if (!updated) {
                showToast('No se pudo actualizar. Intenta de nuevo.', 'error');
                return;
            }
            await cancelDailyReminder();
            showToast('Recordatorio desactivado', 'success');
        }
    };

    const handleTimeChange = async (newHour: number, newMinute: number) => {
        setShowPicker(false);
        const updated = await setPreferredTime(newHour, newMinute);
        if (!updated) {
            showToast('No se pudo actualizar la hora', 'error');
            return;
        }

        if (enabled) {
            await scheduleDailyReminder(newHour, newMinute);
            showToast(`Recordatorio actualizado a las ${formatTime(newHour, newMinute)}`, 'success');
        }
    };

    const handleTest = async () => {
        const ok = await sendTestNotification();
        if (ok) {
            showToast('Notificación de prueba enviada', 'success');
        } else {
            showToast('No se pudo enviar. Verifica permisos del sistema.', 'error');
        }
    };

    if (loading && !settings) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.header}
                    onPress={() => setExpanded(prev => !prev)}
                    activeOpacity={0.8}
                >
                    <View style={styles.headerLeft}>
                        <Feather name="bell" size={20} color={colors.text} />
                        <Text style={styles.headerLabel}>Notificaciones</Text>
                    </View>
                    <Feather
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={colors.textMuted}
                    />
                </TouchableOpacity>

                {expanded && (
                    <View style={styles.body}>
                        <View style={styles.divider} />

                        <View style={styles.field}>
                            <View style={styles.row}>
                                <View style={styles.rowText}>
                                    <Text style={styles.fieldLabel}>Recordatorio diario</Text>
                                    <Text style={styles.fieldHint}>
                                        Activa para recibir un recordatorio cada día
                                    </Text>
                                </View>
                                <Switch
                                    value={enabled}
                                    onValueChange={handleToggle}
                                    trackColor={{ false: colors.border, true: colors.primary }}
                                    thumbColor={colors.white}
                                />
                            </View>
                        </View>

                        {enabled && (
                            <>
                                <View style={styles.divider} />

                                <TouchableOpacity
                                    style={styles.field}
                                    onPress={() => setShowPicker(true)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.row}>
                                        <View style={styles.rowText}>
                                            <Text style={styles.fieldLabel}>Hora preferida</Text>
                                            <Text style={styles.timeValue}>{formatTime(hour, minute)}</Text>
                                        </View>
                                        <Feather name="chevron-right" size={20} color={colors.textMuted} />
                                    </View>
                                </TouchableOpacity>

                                <View style={styles.divider} />

                                <TouchableOpacity
                                    style={styles.testButton}
                                    onPress={handleTest}
                                    activeOpacity={0.8}
                                >
                                    <Feather name="send" size={16} color={colors.primary} />
                                    <Text style={styles.testButtonText}>Enviar notificación de prueba</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
            </View>

            <TimePickerModal
                visible={showPicker}
                initialHour={hour}
                initialMinute={minute}
                onCancel={() => setShowPicker(false)}
                onConfirm={handleTimeChange}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    headerLabel: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    body: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border || '#F0F0F0',
        marginVertical: spacing.sm,
    },
    field: {
        paddingVertical: spacing.xs,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    rowText: {
        flex: 1,
        gap: 2,
    },
    fieldLabel: {
        fontSize: fontSizes.xs,
        fontWeight: '700',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fieldHint: {
        fontSize: fontSizes.sm,
        color: colors.text,
        paddingVertical: 2,
    },
    timeValue: {
        fontSize: fontSizes.md,
        color: colors.text,
        paddingVertical: 2,
        fontWeight: '600',
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        marginTop: spacing.sm,
    },
    testButtonText: {
        fontSize: fontSizes.sm,
        fontWeight: '700',
        color: colors.primary,
    },
});