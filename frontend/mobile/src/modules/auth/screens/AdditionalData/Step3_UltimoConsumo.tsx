import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet
} from 'react-native';
import StepLayout from '../../components/StepLayout';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';
import Icon from 'react-native-vector-icons/Feather';

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function Step3_UltimoConsumo({ navigation }: any) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const hasDate = selectedDate !== null;

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;
        return { firstDay: adjustedFirst, daysInMonth };
    };

    const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const formatDate = (date: Date) => {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    };

    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        return (
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentMonth.getMonth() &&
            selectedDate.getFullYear() === currentMonth.getFullYear()
        );
    };

    const renderCalendarDays = () => {
        const cells = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const selected = isSelected(day);
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isFuture = date > today;

            cells.push(
                <TouchableOpacity
                    key={day}
                    style={[
                        styles.dayCell,
                        selected && styles.dayCellSelected,
                        isFuture && styles.dayCellDisabled,
                    ]}
                    onPress={() => {
                        if (!isFuture) {
                            setSelectedDate(date);
                        }
                    }}
                    disabled={isFuture}
                >
                    <Text style={[
                        styles.dayText,
                        selected && styles.dayTextSelected,
                        isFuture && styles.dayTextDisabled,
                    ]}>
                        {day}
                    </Text>
                </TouchableOpacity>
            );
        }

        return cells;
    };

    return (
        <StepLayout
            currentStep={3}
            question={hasDate ? 'Listo, desde ahí empiezo a crecer' : '¿Cuándo fue tu último consumo de alcohol?'}
            characterImage={
                hasDate
                    ? require('../../../../assets/images/character4.png')
                    : require('../../../../assets/images/character3.png')
            }
            onBack={() => navigation.goBack()}
            onContinue={() => navigation.navigate('Step4')}
            showButton={hasDate}
        >
            <View style={styles.container}>

                {/* Input fecha seleccionada */}
                <View style={styles.dateInput}>
                    <Icon name="calendar" size={16} color={colors.textMuted} />
                    <Text style={[styles.dateText, !hasDate && styles.datePlaceholder]}>
                        {hasDate ? formatDate(selectedDate!) : 'Selecciona una fecha'}
                    </Text>
                    {hasDate && (
                        <TouchableOpacity onPress={() => setSelectedDate(null)}>
                            <Text style={styles.clearIcon}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Calendario */}
                <View style={styles.calendar}>
                    {/* Header mes */}
                    <View style={styles.calendarHeader}>
                        <TouchableOpacity onPress={prevMonth}>
                            <Text style={styles.navArrow}>«</Text>
                        </TouchableOpacity>
                        <Text style={styles.monthTitle}>
                            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear().toString().slice(-2)}
                        </Text>
                        <TouchableOpacity onPress={nextMonth}>
                            <Text style={styles.navArrow}>»</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Días de la semana */}
                    <View style={styles.weekDays}>
                        {DAYS.map((d, i) => (
                            <Text key={i} style={styles.weekDay}>{d}</Text>
                        ))}
                    </View>

                    {/* Días del mes */}
                    <View style={styles.daysGrid}>
                        {renderCalendarDays()}
                    </View>
                </View>

            </View>
        </StepLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.md,
    },
    dateInput: {
        height: 52,
        backgroundColor: colors.inputBackground,
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    calendarIcon: {
        fontSize: 16,
    },
    dateText: {
        flex: 1,
        fontSize: fontSizes.md,
        color: colors.text,
    },
    datePlaceholder: {
        color: colors.border,
    },
    clearIcon: {
        fontSize: 14,
        color: colors.textMuted,
    },
    calendar: {
        backgroundColor: colors.inputBackground,
        borderRadius: borderRadius.md,
        padding: spacing.md,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    navArrow: {
        fontSize: fontSizes.lg,
        color: colors.text,
        paddingHorizontal: spacing.sm,
    },
    monthTitle: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
    },
    weekDays: {
        flexDirection: 'row',
        marginBottom: spacing.xs,
    },
    weekDay: {
        flex: 1,
        textAlign: 'center',
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.textMuted,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.sm,
    },
    dayCellSelected: {
        backgroundColor: '#4A90D9',
    },
    dayText: {
        fontSize: fontSizes.sm,
        color: colors.text,
    },
    dayTextSelected: {
        color: colors.white,
        fontWeight: '700',
    },
    dayCellDisabled: {
        opacity: 0.3,
    },
    dayTextDisabled: {
        color: colors.textMuted,
    },
});