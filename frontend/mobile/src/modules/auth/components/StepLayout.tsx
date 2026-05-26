import React, { useState } from 'react';
import {
    View, Text, Image, StyleSheet, TouchableOpacity,
    Dimensions, TouchableWithoutFeedback, Keyboard, Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { useBottomInset } from '../../../hooks/useBottomInset';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 7;

type Props = {
    currentStep: number;
    question: string;
    onBack: () => void;
    children: React.ReactNode;
    onContinue?: () => void;
    continueLabel?: string;
    showButton?: boolean;
    characterImage: any;
    disabled?: boolean;
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
    disabled = false,
}: Props) {
    const progress = (currentStep / TOTAL_STEPS) * 100;
    const bottomInset = useBottomInset(40);
    const [showInfo, setShowInfo] = useState(false);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={[styles.container, { paddingBottom: bottomInset }]}>

                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Icon name="chevron-left" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>

                    {/* ✅ Botón de info llamativo */}
                    <TouchableOpacity
                        onPress={() => setShowInfo(true)}
                        style={styles.infoButton}
                        activeOpacity={0.7}
                    >
                        <Icon name="info" size={13} color={colors.white} />
                        <Text style={styles.infoButtonText}>¿Dudas?</Text>
                    </TouchableOpacity>
                </View>

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

                <View style={styles.content}>
                    {children}
                </View>

                {showButton && (
                    disabled ? (
                        <View style={[styles.button, styles.buttonDisabled]}>
                            <Text style={[styles.buttonText, styles.buttonTextDisabled]}>
                                {continueLabel}
                            </Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                                Keyboard.dismiss();
                                onContinue?.();
                            }}
                        >
                            <Text style={styles.buttonText}>{continueLabel}</Text>
                        </TouchableOpacity>
                    )
                )}

                {/* ✅ Modal de info */}
                <Modal
                    visible={showInfo}
                    transparent
                    animationType="fade"
                    statusBarTranslucent
                    onRequestClose={() => setShowInfo(false)}
                >
                    <TouchableOpacity
                        style={styles.infoOverlay}
                        activeOpacity={1}
                        onPress={() => setShowInfo(false)}
                    >
                        <View style={styles.infoCard}>
                            <View style={styles.infoIconWrapper}>
                                <Icon name="info" size={24} color={colors.accent} />
                            </View>

                            <Text style={styles.infoTitle}>¿Sabías que...?</Text>

                            <Text style={styles.infoText}>
                                Tranquil@, puedes cambiar toda esta información después en el apartado de{' '}
                                <Text style={styles.infoTextBold}>Configuración</Text>.
                            </Text>

                            <TouchableOpacity
                                style={styles.infoClose}
                                onPress={() => setShowInfo(false)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.infoCloseText}>Entendido</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.xl,
        paddingTop: 60,
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

    // ✅ Pill llamativo con fondo accent
    infoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.sm,
        paddingVertical: 5,
        borderRadius: borderRadius.full,
    },

    infoButtonText: {
        fontSize: fontSizes.xs,
        color: colors.white,
        fontWeight: '700',
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

    buttonDisabled: {
        opacity: 0.35,
    },

    buttonText: {
        color: colors.text,
        fontSize: fontSizes.lg,
        fontWeight: '600',
    },

    buttonTextDisabled: {
        color: colors.textMuted,
    },

    infoOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },

    infoCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.xl,
        width: '100%',
        alignItems: 'center',
        gap: spacing.md,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },

    infoIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: `${colors.accent}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },

    infoTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
    },

    infoText: {
        fontSize: fontSizes.md,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 22,
    },

    infoTextBold: {
        fontWeight: '700',
        color: colors.text,
    },

    infoClose: {
        backgroundColor: colors.accent,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xxl,
        marginTop: spacing.xs,
    },

    infoCloseText: {
        color: colors.white,
        fontSize: fontSizes.md,
        fontWeight: '700',
    },
});