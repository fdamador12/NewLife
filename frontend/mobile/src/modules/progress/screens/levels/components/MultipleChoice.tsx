import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../../../constants/theme';

type Props = {
    question?: string;
    options: string[];
    selected: string | string[] | null;
    onSelect: (val: string) => void;
    multiple?: boolean;
};

export default function MultipleChoice({ question, options, selected, onSelect, multiple = false }: Props) {
    const isSelected = (opt: string) =>
        multiple
            ? Array.isArray(selected) && selected.includes(opt)
            : selected === opt;

    return (
        <View style={styles.wrapper}>
            {question && <Text style={styles.question}>{question}</Text>}
            {options.map((opt) => (
                <TouchableOpacity
                    key={opt}
                    style={[styles.option, isSelected(opt) && styles.optionSelected]}
                    onPress={() => onSelect(opt)}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.optionText, isSelected(opt) && styles.optionTextSelected]}>
                        {opt}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginVertical: spacing.sm,
    },
    question: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    option: {
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        backgroundColor: colors.white,
        marginBottom: spacing.xs,
    },
    optionSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    optionText: {
        fontSize: fontSizes.md,
        color: colors.text,
        fontWeight: '500',
    },
    optionTextSelected: {
        color: colors.white,
        fontWeight: '700',
    },
});