import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { getGratitudeHistory } from '../../../services/progressService';
import { LEVELS } from './PathScreen';
import { useLevelProgress } from '../../../hooks/useLevelProgress';
import { isGuestMode, getGuestCheckins } from '../../../services/guestService';

interface GratitudeEntry {
    dia: string;
    gratitud: string;
    hora: string;
}

export default function ProgressScreen({ navigation }: any) {
    const [latestGratitude, setLatestGratitude] = useState<GratitudeEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const { progress, loading: progressLoading } = useLevelProgress();

    const currentLevel = LEVELS.find(l => l.id === progress.nivel) || LEVELS[0];

    const isReady = !loading && !progressLoading;

    useEffect(() => {
        fetchLatestGratitude();
    }, []);

    const fetchLatestGratitude = async () => {
        try {
            setLoading(true);

            const guest = await isGuestMode();

            if (guest) {
                // ✅ Guest — leer de AsyncStorage
                const checkins = await getGuestCheckins();
                const withGratitude = checkins.filter(
                    (c: any) => c.gratitud && c.gratitud.trim() !== ''
                );

                if (withGratitude.length > 0) {
                    const sorted = withGratitude.sort((a: any, b: any) => {
                        const dateTimeA = `${a.dia}T${a.hora}`;
                        const dateTimeB = `${b.dia}T${b.hora}`;
                        return new Date(dateTimeB).getTime() - new Date(dateTimeA).getTime();
                    });

                    const latest = sorted[0];
                    const date = new Date(latest.dia + 'T00:00:00');
                    setLatestGratitude({
                        dia: date.toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        }),
                        gratitud: latest.gratitud,
                        hora: latest.hora || '00:00',
                    });
                }
            } else {
                // ✅ Usuario normal — llamada al backend
                const response = await getGratitudeHistory();
                const records = response?.data || [];

                if (records.length > 0) {
                    const sorted = records.sort((a: GratitudeEntry, b: GratitudeEntry) => {
                        const dateTimeA = `${a.dia}T${a.hora}`;
                        const dateTimeB = `${b.dia}T${b.hora}`;
                        return new Date(dateTimeB).getTime() - new Date(dateTimeA).getTime();
                    });

                    const latest = sorted[0];
                    const date = new Date(latest.dia);
                    setLatestGratitude({
                        dia: date.toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        }),
                        gratitud: latest.gratitud,
                        hora: latest.hora,
                    });
                }
            }
        } catch (err) {
            console.log('Error obteniendo última gratitud:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Mi progreso</Text>
                <Text style={styles.subtitle}>Avanza y descubre cómo has progresado.</Text>

                <TouchableOpacity style={styles.sectionHeader} onPress={() => navigation.navigate('Path')}>
                    <Text style={styles.sectionTitle}>Tu camino</Text>
                    <Feather name="chevron-right" size={18} color={colors.text} />
                </TouchableOpacity>

                {isReady ? (
                    <TouchableOpacity style={styles.caminoWrapper} onPress={() => navigation.navigate('Path')}>
                        <View style={styles.caminoLeft}>
                            <Image
                                source={require('../../../assets/images/character_progreso.png')}
                                style={styles.characterImage}
                                resizeMode="contain"
                            />
                            <Text style={styles.moduleLabel}>Módulo {progress.subnivel}</Text>
                        </View>

                        <View style={styles.caminoCard}>
                            <View style={styles.nivelBadgeWrapper}>
                                <View style={styles.nivelBadge}>
                                    <Text style={styles.nivelBadgeText}>Nivel {progress.nivel}</Text>
                                </View>
                            </View>
                            <Text style={styles.caminoTitle}>{currentLevel.title}</Text>
                            <Text style={styles.caminoDescription}>
                                {currentLevel.shortDescription}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.caminoWrapper}>
                        <View style={styles.caminoLeft}>
                            <View style={[styles.characterImage, styles.skeletonPlaceholder]} />
                        </View>
                        <View style={styles.caminoCard}>
                            <View style={[styles.skeletonLine, { width: '40%', height: 20, marginBottom: 12 }]} />
                            <View style={[styles.skeletonLine, { width: '60%', height: 24, marginBottom: 8 }]} />
                            <View style={[styles.skeletonLine, { width: '100%', height: 16 }]} />
                        </View>
                    </View>
                )}

                <TouchableOpacity style={styles.sectionHeader} onPress={() => navigation.navigate('GratitudeHistory')}>
                    <Text style={styles.sectionTitle}>Historial de gratitud</Text>
                    <Feather name="chevron-right" size={18} color={colors.text} />
                </TouchableOpacity>

                {!loading && (
                    <TouchableOpacity
                        style={styles.gratitudeCard}
                        onPress={() => navigation.navigate('GratitudeHistory')}
                    >
                        {latestGratitude ? (
                            <>
                                <Text style={styles.gratitudeDate}>
                                    {latestGratitude.dia}
                                </Text>
                                <Text style={styles.gratitudeText}>
                                    {latestGratitude.gratitud}
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.gratitudeDate}>
                                    Aún no hay registros 🌱
                                </Text>
                                <Text style={styles.gratitudeText}>
                                    Empieza tu registro de gratitud haciendo un registro diario.
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.sectionHeader} onPress={() => navigation.navigate('Analysis')}>
                    <Text style={styles.sectionTitle}>Mi análisis</Text>
                    <Feather name="chevron-right" size={18} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.analysisCard} onPress={() => navigation.navigate('Analysis')}>
                    <Text style={styles.analysisText}>
                        💪 Tu ánimo ha mejorado un 25% esta semana.
                    </Text>
                </TouchableOpacity>

                <View style={styles.bottomPadding} />
            </ScrollView>

            <TouchableOpacity style={styles.dailyButton} onPress={() => navigation.navigate('DailyCheckIn')}>
                <Text style={styles.dailyButtonText}>Hacer registro diario</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: {
        paddingHorizontal: spacing.xl,
        paddingTop: 60,
        paddingBottom: 100,
    },
    title: {
        fontSize: fontSizes.xxl,
        fontWeight: '800',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSizes.sm,
        color: colors.textMuted,
        marginBottom: spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.md,
        marginTop: spacing.sm,
    },
    sectionTitle: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
    },
    caminoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    caminoLeft: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    characterImage: {
        width: 100,
        height: 100,
    },
    moduleLabel: {
        fontSize: fontSizes.xs,
        color: colors.textMuted,
        fontWeight: '500',
    },
    caminoCard: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        paddingTop: spacing.xl,
        marginTop: spacing.lg,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    nivelBadge: {
        backgroundColor: colors.accent,
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs,
    },
    nivelBadgeText: {
        fontSize: fontSizes.md,
        color: colors.white,
        fontWeight: '700',
    },
    nivelBadgeWrapper: {
        position: 'absolute',
        top: -18,
        alignSelf: 'center',
    },
    caminoTitle: {
        fontSize: fontSizes.xl,
        fontWeight: '800',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    caminoDescription: {
        fontSize: fontSizes.sm,
        color: colors.textMuted,
        lineHeight: 20,
        textAlign: 'center',
    },
    gratitudeCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    gratitudeDate: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    gratitudeText: {
        fontSize: fontSizes.sm,
        color: colors.textMuted,
        lineHeight: 20,
    },
    analysisCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    analysisText: {
        fontSize: fontSizes.sm,
        color: colors.text,
        textAlign: 'center',
        lineHeight: 22,
    },
    bottomPadding: {
        height: spacing.xl,
    },
    dailyButton: {
        position: 'absolute',
        bottom: 50,
        left: spacing.xl,
        right: spacing.xl,
        backgroundColor: colors.accent,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.md,
        alignItems: 'center',
        elevation: 4,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    dailyButtonText: {
        color: colors.white,
        fontSize: fontSizes.lg,
        fontWeight: '700',
    },
    skeletonPlaceholder: {
        backgroundColor: '#E0E0E0',
        borderRadius: borderRadius.md,
    },
    skeletonLine: {
        backgroundColor: '#E0E0E0',
        borderRadius: borderRadius.md,
    },
});