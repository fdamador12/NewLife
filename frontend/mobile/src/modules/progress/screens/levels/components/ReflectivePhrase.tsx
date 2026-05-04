import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const QuoteIcon = () => (
    <View style={styles.quoteCircle}>
        <Svg width={18} height={18} viewBox="0 0 24 24">
            <Path d="M11 7C11 9.5 10 10.5 7.5 10.5C5 10.5 4 11.5 4 14V16.5H7.5C10 16.5 11 15.5 11 13V7Z" fill="#FFF" />
            <Path d="M20 7C20 9.5 19 10.5 16.5 10.5C14 10.5 13 11.5 13 14V16.5H16.5C19 16.5 20 15.5 20 13V7Z" fill="#FFF" />
        </Svg>
    </View>
);

const Sparkle = ({ style }: { style?: any }) => (
    <View style={style}>
        <Svg width={14} height={14} viewBox="0 0 24 24">
            <Path
                d="M12 2L13.5 9L20 12L13.5 15L12 22L10.5 15L4 12L10.5 9L12 2Z"
                fill="#D38A58"
                opacity={0.4}
            />
        </Svg>
    </View>
);

const FloatingDot = ({ delay, style }: { delay: number; style?: any }) => {
    const scale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(scale, { toValue: 1.1, duration: 1200, useNativeDriver: true }),
                Animated.timing(scale, { toValue: 0.8, duration: 1200, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return <Animated.View style={[styles.floatingDot, style, { transform: [{ scale }] }]} />;
};

export default function ReflectivePhrase({ text, author }: { text: string; author?: string }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <Sparkle style={styles.sparkle1} />
                <Sparkle style={styles.sparkle2} />
                <FloatingDot delay={0} style={styles.dot1} />
                <FloatingDot delay={400} style={styles.dot2} />
                <FloatingDot delay={800} style={styles.dot3} />
                <View style={styles.bgCircle} />

                <View style={styles.header}>
                    <QuoteIcon />
                    <Text style={styles.headerText}>Reflexiona</Text>
                </View>

                <View style={styles.quoteBox}>
                    <Text style={styles.quoteText}>{text}</Text>
                </View>

                {author && (
                    <View style={styles.authorContainer}>
                        <View style={styles.authorDot} />
                        <Text style={styles.authorText}>{author}</Text>
                    </View>
                )}

                <View style={styles.indicators}>
                    <View style={[styles.indicator, styles.indicatorActive]} />
                    <View style={[styles.indicator, styles.indicatorActive]} />
                    <View style={[styles.indicator, styles.indicatorActive]} />
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 180,
    },
    card: {
        width: width - 80,
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#D38A58',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 6,
    },
    bgCircle: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(211, 138, 88, 0.08)',
    },
    sparkle1: { position: 'absolute', top: 20, right: 70 },
    sparkle2: { position: 'absolute', bottom: 60, left: 20 },
    floatingDot: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(211, 138, 88, 0.25)',
    },
    dot1: { top: 50, left: 30 },
    dot2: { top: 80, right: 40 },
    dot3: { bottom: 90, right: 60 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    quoteCircle: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#D38A58',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 13,
        color: '#D38A58',
        fontWeight: '600',
        marginLeft: 12,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    quoteBox: { padding: 22 },
    quoteText: {
        fontSize: 17,
        color: '#3D3D3D',
        lineHeight: 28,
        fontWeight: '500',
        textAlign: 'center',
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    authorDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#D38A58',
        marginRight: 10,
    },
    authorText: {
        fontSize: 14,
        color: '#8B7355',
        fontWeight: '600',
    },
    indicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        gap: 8,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(211, 138, 88, 0.2)',
    },
    indicatorActive: {
        backgroundColor: '#D38A58',
    },
});