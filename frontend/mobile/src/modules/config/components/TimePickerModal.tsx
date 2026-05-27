import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';

const { width } = Dimensions.get('window');
const CLOCK_SIZE = Math.min(width * 0.65, 280);
const CENTER = CLOCK_SIZE / 2;
const RADIUS = CENTER - 20;

interface Props {
    visible: boolean;
    initialHour: number;
    initialMinute: number;
    onCancel: () => void;
    onConfirm: (hour: number, minute: number) => void;
}

/**
 * Modal con el mismo reloj visual de Step10_Horario para cambiar la hora
 * preferida desde Settings. Reutiliza el patron visual del onboarding.
 */
export default function TimePickerModal({
    visible,
    initialHour,
    initialMinute,
    onCancel,
    onConfirm,
}: Props) {
    const init12h = initialHour === 0 ? 12 : initialHour > 12 ? initialHour - 12 : initialHour;
    const initPeriod = initialHour >= 12 ? 'PM' : 'AM';

    const [hour, setHour] = useState(init12h);
    const [minute, setMinute] = useState(initialMinute);
    const [period, setPeriod] = useState<'AM' | 'PM'>(initPeriod);
    const [mode, setMode] = useState<'hour' | 'minute'>('hour');

    useEffect(() => {
        if (visible) {
            const h12 = initialHour === 0 ? 12 : initialHour > 12 ? initialHour - 12 : initialHour;
            setHour(h12);
            setMinute(initialMinute);
            setPeriod(initialHour >= 12 ? 'PM' : 'AM');
            setMode('hour');
        }
    }, [visible, initialHour, initialMinute]);

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

    const handleConfirm = () => {
        const hourIn24 = period === 'PM' && hour !== 12
            ? hour + 12
            : period === 'AM' && hour === 12
                ? 0
                : hour;
        onConfirm(hourIn24, minute);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Hora del recordatorio</Text>

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

                    <View style={styles.clockContainer}>
                        <View style={styles.clock}>
                            <View style={[
                                styles.hand,
                                {
                                    transform: [{ rotate: `${getHandAngle()}deg` }],
                                    width: RADIUS - 10,
                                    left: CENTER,
                                    top: CENTER - 2,
                                },
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
                                        onPress={() => {
                                            setHour(h);
                                            setTimeout(() => setMode('minute'), 300);
                                        }}
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
                                        onPress={() => setMinute(m)}
                                    >
                                        <Text style={[styles.hourText, minute === m && styles.hourTextSelected]}>
                                            {m.toString().padStart(2, '0')}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={onCancel}
                        >
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.confirmButton]}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.confirmText}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContent: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        alignItems: 'center',
        gap: spacing.md,
        width: '100%',
        maxWidth: 380,
    },
    title: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
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
    timeTextActive: {
        color: colors.white,
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
    actions: {
        flexDirection: 'row',
        gap: spacing.sm,
        width: '100%',
        marginTop: spacing.sm,
    },
    actionButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.sm,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: colors.inputBackground,
    },
    cancelText: {
        color: colors.text,
        fontSize: fontSizes.md,
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: colors.primary,
    },
    confirmText: {
        color: colors.white,
        fontSize: fontSizes.md,
        fontWeight: '700',
    },
});