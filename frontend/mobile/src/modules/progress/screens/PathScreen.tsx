import React, { useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, ActivityIndicator, Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { useLevelProgress } from '../../../hooks/useLevelProgress';
import { performAnimatedScroll } from '../utils/pathScreenAnimation';
import { setLevelHeight } from '../utils/levelHeights';
import { useToast } from '../../../feedback/ToastContext';
import { analytics, EVENT_TYPES } from '../../../services/analytics';

const { width } = Dimensions.get('window');

export const LEVELS = [
    { id: 1, title: 'Reconocer', shortDescription: 'Reconocí que mi consumo me superó y afectó mi vida.', description: 'Admití que perdí el control sobre mi consumo y que mi vida se volvió difícil de manejar.' },
    { id: 2, title: 'Confiar', shortDescription: 'Creo que un poder mayor puede ayudarme a recuperarme.', description: 'Empecé a creer que un poder más grande que yo puede ayudarme a recuperar la claridad.' },
    { id: 3, title: 'Entregar', shortDescription: 'Confío mi voluntad a un poder superior.', description: 'Decidí confiar mi voluntad y mi vida a ese poder superior, tal como yo lo entiendo.' },
    { id: 4, title: 'Explorar', shortDescription: 'Hice una revisión sincera de mí mismo.', description: 'Hice una revisión sincera y profunda de mí mismo: mis actos, errores y emociones.' },
    { id: 5, title: 'Compartir', shortDescription: 'Confesé la verdad sobre mis fallas.', description: 'Confesé ante mí, ante otro ser humano y ante mi poder superior la verdad sobre mis fallas.' },
    { id: 6, title: 'Prepararme', shortDescription: 'Estoy dispuesto a dejar atrás mis defectos.', description: 'Estuve dispuesto a dejar atrás mis defectos y viejas actitudes que me hacían daño.' },
    { id: 7, title: 'Pedir cambio', shortDescription: 'Pido humildemente ayuda para superar mis debilidades.', description: 'Le pedí humildemente a mi poder superior que me ayudara a superar esas debilidades.' },
    { id: 8, title: 'Reparar', shortDescription: 'Hice una lista de quienes herí.', description: 'Hice una revisión sincera y profunda de mí mismo: mis actos, errores y emociones.' },
    { id: 9, title: 'Actuar', shortDescription: 'Busqué reparar el daño sin causar más dolor.', description: 'Busqué reparar el daño directamente con quienes pude, sin causarles más dolor.' },
    { id: 10, title: 'Reflexionar', shortDescription: 'Reviso mi conducta y reconozco mis errores.', description: 'Sigo revisando mi conducta y reconozco mis errores en el momento que los cometo.' },
    { id: 11, title: 'Conectar', shortDescription: 'Me conecto con mi poder superior mediante la meditación.', description: 'Busco a mi poder superior con oración o meditación para mantener claridad y dirección.' },
    { id: 12, title: 'Compartir', shortDescription: 'Ayudo a otros a vivir estos principios.', description: 'Después de vivir estos pasos, trato de ayudar a otros y aplicar estos principios en mi vida.' },
];

const SUBLEVEL_ORDER = ['libro', 'estrella', 'corazon'];

type SubnodeProps = {
    type: 'libro' | 'estrella' | 'corazon';
    state: 'completed' | 'current' | 'pending' | 'locked';
};

function SubNode({ type, state, isCurrent }: SubnodeProps & { isCurrent?: boolean }) {
    const getImage = () => {
        if (state === 'locked') return require('../../../assets/images/bloqueado.png');
        if (state === 'current') return require('../../../assets/images/actual.png');
        if (state === 'completed') {
            if (type === 'libro') return require('../../../assets/images/libro.png');
            if (type === 'estrella') return require('../../../assets/images/estrella.png');
            return require('../../../assets/images/corazon.png');
        }
        if (type === 'libro') return require('../../../assets/images/librogris.png');
        if (type === 'estrella') return require('../../../assets/images/estrellagris.png');
        return require('../../../assets/images/corazongris.png');
    };

    return (
        <Image
            source={getImage()}
            style={[styles.subNodeImage, isCurrent && styles.subNodeImageCurrent]}
            resizeMode="contain"
        />
    );
}

const MODULE_ROUTES: Record<number, Record<number, string>> = {
    1: { 1: 'Nivel1Modulo1', 2: 'Nivel1Modulo2', 3: 'Nivel1Modulo3' },
    2: { 1: 'Nivel2Modulo1', 2: 'Nivel2Modulo2', 3: 'Nivel2Modulo3' },
    3: { 1: 'Nivel3Modulo1', 2: 'Nivel3Modulo2', 3: 'Nivel3Modulo3' },
    4: { 1: 'Nivel4Modulo1', 2: 'Nivel4Modulo2', 3: 'Nivel4Modulo3' },
    5: { 1: 'Nivel5Modulo1', 2: 'Nivel5Modulo2', 3: 'Nivel5Modulo3' },
    6: { 1: 'Nivel6Modulo1', 2: 'Nivel6Modulo2', 3: 'Nivel6Modulo3' },
    7: { 1: 'Nivel7Modulo1', 2: 'Nivel7Modulo2', 3: 'Nivel7Modulo3' },
    8: { 1: 'Nivel8Modulo1', 2: 'Nivel8Modulo2', 3: 'Nivel8Modulo3' },
    9: { 1: 'Nivel9Modulo1', 2: 'Nivel9Modulo2', 3: 'Nivel9Modulo3' },
    10: { 1: 'Nivel10Modulo1', 2: 'Nivel10Modulo2', 3: 'Nivel10Modulo3' },
    11: { 1: 'Nivel11Modulo1', 2: 'Nivel11Modulo2', 3: 'Nivel11Modulo3' },
    12: { 1: 'Nivel12Modulo1', 2: 'Nivel12Modulo2', 3: 'Nivel12Modulo3' },
};

function LevelCard({
    level,
    userProgress,
    navigation,
    isLocked,
    showToast,
}: {
    level: typeof LEVELS[0];
    userProgress: { level: number; sublevel: number };
    navigation: any;
    isLocked: (nivel: number, subnivel: number) => boolean;
    showToast: (message: string, type?: 'error' | 'success' | 'info') => void;
}) {
    const isCurrentLevel = userProgress.level === level.id;
    const isCompletedLevel = userProgress.level > level.id;
    const isLockedLevel = userProgress.level < level.id;
    const isDisabled = isLockedLevel;

    const getSubnodeState = (sublevelIndex: number): SubnodeProps['state'] => {
        if (isLockedLevel) return 'locked';
        if (isCompletedLevel) return 'completed';
        const completedSublevel = userProgress.sublevel - 1;
        if (sublevelIndex < completedSublevel) return 'completed';
        if (sublevelIndex === completedSublevel) return 'current';
        return 'pending';
    };

    const handleSubnodePress = (subnivel: number) => {
        console.log(`📌 Click en Nivel ${level.id} Módulo ${subnivel}`);

        if (isLocked(level.id, subnivel)) {
            console.log('❌ Módulo bloqueado');
            showToast(`Completa el Nivel ${userProgress.level}, Módulo ${userProgress.sublevel} primero`, 'info');
            return;
        }

        const route = MODULE_ROUTES[level.id]?.[subnivel];
        if (route) {
            console.log(`✅ Navegando a ${route}`);
            navigation.navigate(route);
        }
    };

    return (
        <View
            style={styles.levelWrapper}
            onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setLevelHeight(level.id, height);
                console.log(`📏 Nivel ${level.id} altura: ${height}px`);
            }}
        >
            <View style={[styles.levelCard, isDisabled && styles.levelCardDisabled]}>
                <View style={[styles.nivelBadge, isDisabled && styles.nivelBadgeDisabled]}>
                    <Text style={styles.nivelBadgeText}>Nivel {level.id}</Text>
                </View>
                <Text style={[styles.levelTitle, isDisabled && styles.levelTitleDisabled]}>
                    {level.title}
                </Text>
                <Text style={[styles.levelDescription, isDisabled && styles.levelDescriptionDisabled]}>
                    {level.description}
                </Text>
            </View>

            <View style={styles.subnodesWrapper}>
                <View style={styles.subnodesTopRow}>
                    {SUBLEVEL_ORDER.slice(0, 2).map((type, i) => {
                        const subnivel = i + 1;
                        const state = getSubnodeState(i);
                        return (
                            <TouchableOpacity
                                key={i}
                                onPress={() => handleSubnodePress(subnivel)}
                                activeOpacity={0.8}
                            >
                                <SubNode
                                    type={type as SubnodeProps['type']}
                                    state={state}
                                    isCurrent={state === 'current'}
                                />
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <View style={styles.subnodesBottomRow}>
                    {(() => {
                        const subnivel = 3;
                        const state = getSubnodeState(2);
                        return (
                            <TouchableOpacity
                                onPress={() => handleSubnodePress(subnivel)}
                                activeOpacity={0.8}
                            >
                                <SubNode
                                    type={SUBLEVEL_ORDER[2] as SubnodeProps['type']}
                                    state={state}
                                    isCurrent={state === 'current'}
                                />
                            </TouchableOpacity>
                        );
                    })()}
                </View>
            </View>

            {level.id < 12 && (
                <View style={styles.connector} />
            )}
        </View>
    );
}

export default function PathScreen({ navigation }: any) {
    const { progress, loading, isLocked } = useLevelProgress();
    const { showToast } = useToast();
    const flatListRef = useRef<FlatList>(null);
    const scrollAnimRef = useRef(new Animated.Value(0)).current;
    const hasScrolledRef = useRef(false);

    // FIX bug analytics: trackear LEVEL_PATH_VIEWED solo la PRIMERA vez que
    // el usuario entra al camino en la sesion actual. Si entra a un nivel,
    // lo completa y vuelve, NO se debe trackear de nuevo.
    // Este ref persiste mientras el componente esta montado.
    const hasTrackedRef = useRef(false);

    const userProgress = {
        level: progress.nivel,
        sublevel: progress.subnivel,
    };

    console.log('📊 PathScreen - Progress:', userProgress);

    // FIX: usar useFocusEffect con ref para evitar tracks duplicados.
    // useFocusEffect se dispara cada vez que la pantalla recibe foco
    // (al entrar, al volver desde otra pantalla). El ref garantiza que
    // solo trackeamos la primera vez.
    useFocusEffect(
        React.useCallback(() => {
            if (!hasTrackedRef.current && !loading) {
                hasTrackedRef.current = true;
                analytics.track(EVENT_TYPES.LEVEL_PATH_VIEWED, {
                    current_level: progress.nivel,
                    current_sublevel: progress.subnivel,
                });
            }
            // No cleanup necesario — el ref se mantiene mientras este montado
        }, [progress.nivel, progress.subnivel, loading])
    );

    const handleGoBack = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home', params: { initialTab: 'Progress' } }],
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack}>
                    <Feather name="chevron-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Tu camino</Text>
                    <Text style={styles.headerSubtitle}>
                        Nivel {userProgress.level}, Módulo {userProgress.sublevel}
                    </Text>
                </View>
            </View>

            {!loading ? (
                <FlatList
                    ref={flatListRef}
                    data={LEVELS}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.flatListContent}
                    renderItem={({ item: level }) => (
                        <LevelCard
                            level={level}
                            userProgress={userProgress}
                            navigation={navigation}
                            isLocked={isLocked}
                            showToast={showToast}
                        />
                    )}
                    scrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => {
                        performAnimatedScroll(
                            flatListRef,
                            scrollAnimRef,
                            hasScrolledRef,
                            userProgress.level,
                        );
                    }}
                />
            ) : (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={styles.loadingText}>Cargando tu progreso...</Text>
                </View>
            )}
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
    headerTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
    },
    headerSubtitle: {
        fontSize: fontSizes.sm,
        color: colors.textMuted,
    },
    flatListContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl,
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    levelWrapper: {
        alignItems: 'center',
        width: '100%',
        marginBottom: spacing.xl,
    },
    levelCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        paddingTop: spacing.xl,
        width: '70%',
        alignItems: 'center',
        gap: spacing.xs,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        position: 'relative',
    },
    levelCardDisabled: {
        backgroundColor: '#F0F0F0',
        elevation: 0,
        shadowOpacity: 0,
    },
    nivelBadge: {
        position: 'absolute',
        top: -16,
        backgroundColor: colors.accent,
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.lg,
        paddingVertical: 4,
    },
    nivelBadgeDisabled: {
        backgroundColor: '#AAAAAA',
    },
    nivelBadgeText: {
        fontSize: fontSizes.lg,
        color: colors.white,
        fontWeight: '700',
    },
    levelTitle: {
        fontSize: fontSizes.xl,
        fontWeight: '800',
        color: colors.text,
        textAlign: 'center',
    },
    levelTitleDisabled: {
        color: '#AAAAAA',
    },
    levelDescription: {
        fontSize: fontSizes.sm,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
    levelDescriptionDisabled: {
        color: '#BBBBBB',
    },
    subNodeImage: {
        width: 70,
        height: 70,
    },
    connector: {
        width: 2,
        height: 24,
        marginBottom: spacing.xs,
    },
    subnodesWrapper: {
        alignItems: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    subnodesTopRow: {
        flexDirection: 'row',
        gap: spacing.xl,
        marginBottom: spacing.sm,
        alignItems: 'flex-end',
    },
    subnodesBottomRow: {
        alignItems: 'center',
    },
    subNodeImageCurrent: {
        width: 105,
        height: 105,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: fontSizes.md,
        color: colors.textMuted,
        fontWeight: '600',
    },
});