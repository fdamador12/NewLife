import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import StepLayout from '../../components/StepLayout';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';

const { width } = Dimensions.get('window');
const CLOCK_SIZE = width * 0.7;
const CENTER = CLOCK_SIZE / 2;
const RADIUS = CENTER - 20;

export default function Step10_Horario({ navigation }: any) {
    const [hour, setHour] = useState(9);
    const [minute, setMinute] = useState(0);
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
    const [mode, setMode] = useState<'hour' | 'minute'>('hour');

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

    return (
        <StepLayout
            currentStep={10}
            question="¿En qué momento prefieres que te motivemos?"
            characterImage={require('../../../../assets/images/character11.png')}
            onBack={() => navigation.goBack()}
            onContinue={() => navigation.navigate('Congratulations')}
            showButton={true}
        >
            <View style={styles.container}>

                {/* Display de hora */}
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

                {/* Label modo */}
                <Text style={styles.modeLabel}>
                    {mode === 'hour' ? 'Selecciona la hora' : 'Selecciona los minutos'}
                </Text>

                {/* Reloj */}
                <View style={styles.clockContainer}>
                    <View style={styles.clock}>

                        {/* Manecilla */}
                        <View style={[
                            styles.hand,
                            {
                                transform: [{ rotate: `${getHandAngle()}deg` }],
                                width: RADIUS - 10,
                                left: CENTER,
                                top: CENTER - 2,
                            }
                        ]} />

                        {/* Centro */}
                        <View style={styles.centerDot} />

                        {/* Números horas */}
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

                        {/* Números minutos */}
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