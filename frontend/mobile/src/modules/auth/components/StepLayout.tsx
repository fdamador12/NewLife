import React from 'react';
import {
    View, Text, Image, StyleSheet, TouchableOpacity,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 10;

type Props = {
    currentStep: number;
    question: string;
    onBack: () => void;
    children: React.ReactNode;
    onContinue?: () => void;
    continueLabel?: string;
    showButton?: boolean;
    characterImage: any;
};

export default function StepLayout({
    currentStep,
    question,
    onBack,
    children,
    onContinue,
    continueLabel = 'Continuar',
    showButton = true,
    characterImage,
}: Props) {
    const progress = (currentStep / TOTAL_STEPS) * 100;

    return (
        <View style={styles.container}>

            {/* Header con back y progress bar */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Icon name="chevron-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
            </View>

            {/* Personaje + burbuja */}
            <View style={styles.characterRow}>
                <Image
                    source={characterImage}
                    style={styles.character}
                    resizeMode="contain"
                />
                <View style={styles.bubble}>
                    <Text style={styles.bubbleText}>{question}</Text>
                </View>
            </View>

            {/* Contenido del paso */}
            <View style={styles.content}>
                {children}
            </View>

            {/* Botón continuar */}
            {showButton && (
                <TouchableOpacity style={styles.button} onPress={onContinue}>
                    <Text style={styles.buttonText}>{continueLabel}</Text>
                </TouchableOpacity>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.xl,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    backButton: {
        padding: 4,
    },
    progressTrack: {
        flex: 1,
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    progressFill: {
        height: 8,
        backgroundColor: colors.accent,
        borderRadius: borderRadius.full,
    },
    characterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    character: {
        width: 80,
        height: 80,
    },
    bubble: {
        flex: 1,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
    },
    bubbleText: {
        color: colors.white,
        fontSize: fontSizes.md,
        fontWeight: '600',
        lineHeight: 22,
    },
    content: {
        flex: 1,
    },
    button: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.full,
        alignItems: 'center',
    },
    buttonText: {
        color: colors.text,
        fontSize: fontSizes.lg,
        fontWeight: '600',
    },
});