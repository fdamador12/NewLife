import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';

export { default as MascotBubble } from './components/MascotBubble';
export { default as ReflectivePhrase } from './components/ReflectivePhrase';
export { default as MultipleChoice } from './components/MultipleChoice';
export { default as OpenQuestion } from './components/OpenQuestion';
export { default as CompleteSentence } from './components/CompleteSentence';

type Props = {
    moduleNumber: number;
    currentStep: number;
    totalSteps: number;
    children: React.ReactNode;
    onBack: () => void;
    onContinue: () => void;
    continueLabel?: string;
    mascot: any;
    showIntro?: boolean;
    introTitle?: string;
    introDescription?: string;
    disabled?: boolean;
    advancing?: boolean;
};

export default function SubLevelScreen({
    currentStep,
    totalSteps,
    children,
    onBack,
    onContinue,
    continueLabel = 'Continuar',
    mascot,
    showIntro,
    introTitle,
    introDescription,
    moduleNumber,
    disabled = false,
    advancing = false,
}: Props) {
    const progress = currentStep / totalSteps;

    const renderButton = () => {
        if (disabled || advancing) {
            return (
                <View style={[styles.mainButton, styles.mainButtonDisabled]}>
                    <Text style={styles.mainButtonText}>
                        {advancing ? 'Guardando...' : continueLabel}
                    </Text>
                </View>
            );
        }
        return (
            <TouchableOpacity style={styles.mainButton} onPress={onContinue}>
                <Text style={styles.mainButtonText}>{continueLabel}</Text>
            </TouchableOpacity>
        );
    };

    if (showIntro) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack}>
                        <Feather name="chevron-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.progressBarWrapper}>
                        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                    </View>
                </View>

                <View style={styles.introContent}>
                    <View style={styles.moduleBadge}>
                        <Text style={styles.moduleBadgeText}>Módulo {moduleNumber}</Text>
                    </View>
                    <Text style={styles.introTitle}>{introTitle}</Text>
                    <Text style={styles.introDescription}>{introDescription}</Text>
                </View>

                <Image source={mascot} style={styles.mascotIntro} resizeMode="contain" />

                <TouchableOpacity style={styles.mainButton} onPress={onContinue}>
                    <Text style={styles.mainButtonText}>{continueLabel}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Feather name="chevron-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.progressBarWrapper}>
                    <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {children}
                <View style={{ height: 100 }} />
            </ScrollView>

            {renderButton()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingTop: 60,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.lg,
    },
    progressBarWrapper: {
        flex: 1,
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.accent,
        borderRadius: 3,
    },
    introContent: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
        alignItems: 'center',
    },
    introTitle: {
        fontSize: fontSizes.xxl,
        fontWeight: '800',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    introDescription: {
        fontSize: fontSizes.md,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 24,
    },
    mascotIntro: {
        width: 250,
        height: 250,
        position: 'absolute',
        bottom: 150,
        alignSelf: 'center',
    },
    scroll: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
    },
    mainButton: {
        position: 'absolute',
        bottom: 32,
        left: spacing.xl,
        right: spacing.xl,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.md,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    mainButtonDisabled: {
        opacity: 0.4,
    },
    mainButtonText: {
        color: colors.white,
        fontSize: fontSizes.lg,
        fontWeight: '700',
    },
    moduleBadge: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.lg,
    },
    moduleBadgeText: {
        fontSize: fontSizes.sm,
        color: colors.text,
        fontWeight: '600',
    },
});