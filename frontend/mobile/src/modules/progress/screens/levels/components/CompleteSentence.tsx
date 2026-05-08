import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../../../constants/theme';

type Props = {
    prefix: string;
    value: string;
    onChange: (v: string) => void;
};

export default function CompleteSentence({ prefix, value, onChange }: Props) {
    return (
        <View style={styles.wrapper}>
            <Text style={styles.prefix}>{prefix}</Text>
            <TextInput
                style={styles.input}
                placeholder="Escribe aquí..."
                placeholderTextColor={colors.border}
                value={value}
                onChangeText={onChange}
                multiline
                textAlignVertical="top"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginVertical: spacing.sm,
    },
    prefix: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: fontSizes.md,
        color: colors.text,
        height: 100,
        borderWidth: 1,
        borderColor: colors.border,
        textAlignVertical: 'top',
    },
});