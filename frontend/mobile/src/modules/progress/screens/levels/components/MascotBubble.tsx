import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../../../constants/theme';

const CHARACTERS = [
    require('../../../../../assets/images/character1.png'),
    require('../../../../../assets/images/character2.png'),
    require('../../../../../assets/images/character3.png'),
    require('../../../../../assets/images/character4.png'),
    require('../../../../../assets/images/character5.png'),
    require('../../../../../assets/images/character6.png'),
    require('../../../../../assets/images/character7.png'),
    require('../../../../../assets/images/character8.png'),
    require('../../../../../assets/images/character9.png'),
    require('../../../../../assets/images/character10.png'),
    require('../../../../../assets/images/character11.png'),
];

function getRandomCharacter() {
    return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
}

export default function MascotBubble({ text }: { text: string }) {
    const character = useMemo(() => getRandomCharacter(), []);

    return (
        <View style={styles.row}>
            <Image source={character} style={styles.mascot} resizeMode="contain" />
            <View style={styles.bubbleWrapper}>
                <View style={styles.bubble}>
                    <Text style={styles.text}>{text}</Text>
                </View>
                <View style={styles.tail} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    mascot: {
        width: 110,
        height: 110,
    },
    bubbleWrapper: {
        flex: 1,
    },
    bubble: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        borderBottomLeftRadius: 4,
        padding: spacing.md,
    },
    tail: {
        width: 0,
        height: 0,
        borderTopWidth: 10,
        borderRightWidth: 10,
        borderTopColor: colors.primary,
        borderRightColor: 'transparent',
        marginTop: -1,
    },
    text: {
        color: colors.white,
        fontSize: fontSizes.md,
        lineHeight: 20,
        fontWeight: '500',
    },
});