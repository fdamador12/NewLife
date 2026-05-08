import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../../../constants/theme';

type Props = {
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
};

export default function OpenQuestion({ placeholder, value, onChange }: Props) {
    return (
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={colors.border}
            value={value}
            onChangeText={onChange}
            multiline
            textAlignVertical="top"
        />
    );
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: fontSizes.md,
        color: colors.text,
        height: 120,
        borderWidth: 1,
        borderColor: colors.border,
        marginVertical: spacing.sm,
        textAlignVertical: 'top',
    },
});