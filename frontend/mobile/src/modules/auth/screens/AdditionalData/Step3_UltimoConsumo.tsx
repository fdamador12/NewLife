import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Modal, FlatList,
} from 'react-native';
import StepLayout from '../../components/StepLayout';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';
import Icon from 'react-native-vector-icons/Feather';
import { useOnboarding } from '../../../../context/OnboardingContext';

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const YEARS = Array.from(
    { length: new Date().getFullYear() - 1950 + 1 },
    (_, i) => new Date().getFullYear() - i
);

export default function Step3_UltimoConsumo({ navigation }: any) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showYearPicker, setShowYearPicker] = useState(false);
    const { setField } = useOnboarding();

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

    const handleSelectYear = (year: number) => {
        setCurrentMonth(new Date(year, currentMonth.getMonth()));
        setShowYearPicker(false);
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
            question={hasDate ? 'Listo, desde ahí empiezo a crecer' : '¿Cuándo fue tu último consumo?'}
            characterImage={
                hasDate
                    ? require('../../../../assets/images/character4.png')
                    : require('../../../../assets/images/character3.png')
            }
            onBack={() => navigation.goBack()}
            onContinue={() => {
                if (selectedDate) {
                    setField('ult_fecha_consumo', selectedDate.toISOString());
                }
                navigation.navigate('Step4');
            }}
            showButton={true}
            disabled={!hasDate}
        >
            <View style={styles.container}>

                {/* ✅ Tocar el campo abre el selector de año */}
                <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowYearPicker(true)}
                    activeOpacity={0.7}
                >
                    <Icon name="calendar" size={16} color={colors.textMuted} />
                    <Text style={[styles.dateText, !hasDate && styles.datePlaceholder]}>
                        {hasDate ? formatDate(selectedDate!) : 'Selecciona una fecha'}
                    </Text>
                    {hasDate && (
                        <TouchableOpacity onPress={() => setSelectedDate(null)}>
                            <Text style={styles.clearIcon}>✕</Text>
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>

                <View style={styles.calendar}>
                    <View style={styles.calendarHeader}>
                        <TouchableOpacity onPress={prevMonth}>
                            <Text style={styles.navArrow}>«</Text>
                        </TouchableOpacity>

                        {/* ✅ Tocar el mes/año también abre selector de año */}
                        <TouchableOpacity
                            onPress={() => setShowYearPicker(true)}
                            style={styles.monthYearButton}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.monthTitle}>
                                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </Text>
                            <Icon name="chevron-down" size={14} color={colors.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={nextMonth}>
                            <Text style={styles.navArrow}>»</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekDays}>
                        {DAYS.map((d, i) => (
                            <Text key={i} style={styles.weekDay}>{d}</Text>
                        ))}
                    </View>

                    <View style={styles.daysGrid}>
                        {renderCalendarDays()}
                    </View>
                </View>

            </View>

            {/* ✅ Modal selector de año */}
            <Modal
                visible={showYearPicker}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setShowYearPicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowYearPicker(false)}
                >
                    <View style={styles.yearPickerCard}>
                        <Text style={styles.yearPickerTitle}>Selecciona el año</Text>
                        <FlatList
                            data={YEARS}
                            keyExtractor={(item) => item.toString()}
                            showsVerticalScrollIndicator={false}
                            style={styles.yearList}
                            getItemLayout={(_, index) => ({
                                length: 48,
                                offset: 48 * index,
                                index,
                            })}
                            initialScrollIndex={YEARS.indexOf(currentMonth.getFullYear())}
                            renderItem={({ item }) => {
                                const isCurrentYear = item === currentMonth.getFullYear();
                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.yearItem,
                                            isCurrentYear && styles.yearItemSelected,
                                        ]}
                                        onPress={() => handleSelectYear(item)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[
                                            styles.yearText,
                                            isCurrentYear && styles.yearTextSelected,
                                        ]}>
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

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
    monthYearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    yearPickerCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        width: '70%',
        maxHeight: 320,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    yearPickerTitle: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    yearList: {
        maxHeight: 240,
    },
    yearItem: {
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.sm,
    },
    yearItemSelected: {
        backgroundColor: '#4A90D9',
    },
    yearText: {
        fontSize: fontSizes.md,
        color: colors.text,
        fontWeight: '500',
    },
    yearTextSelected: {
        color: colors.white,
        fontWeight: '700',
    },
});