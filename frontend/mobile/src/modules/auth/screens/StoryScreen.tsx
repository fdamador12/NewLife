import React, { useState, useRef } from 'react';
import {
    View, Text, Image, StyleSheet, TouchableWithoutFeedback,
    TouchableOpacity, Dimensions, FlatList, Animated,
} from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { useBottomInset } from '../../../hooks/useBottomInset';

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        text: ' Soy una semilla...\nY no sé cómo terminé en tus manos (Literalmente).',
        boldPart: '¡Plop!',
        boldFirst: true,
        image: require('../../../assets/images/story1.jpg'),
        button: 'jajaja ok (?',
    },
    {
        id: '2',
        text: 'Este mundo es muy peligroso para mi. ',
        boldPart: '¡Necesito una maceta ya!',
        boldFirst: false,
        image: require('../../../assets/images/story2.jpg'),
        button: 'Sembrar',
    },
    {
        id: '3',
        boldPart: '¡AYYYY, CUIDADOOO!',
        boldFirst: true,
        large: true,
        image: require('../../../assets/images/story3.jpg'),
        button: 'Continuar',
    },
    {
        id: '4',
        text: '¿Pero ahora quién cuidará de mí? No tengo padres... ',
        boldPart: '¡Ya sé! Desde ahora seré tu mascota.',
        boldFirst: false,
        image: require('../../../assets/images/story4.jpg'),
        button: 'Continuar',
    },
    {
        id: '5',
        text: '\nPero primero necesito conocerte un poco.',
        boldPart: 'Si tú creces, yo también.',
        boldFirst: true,
        image: require('../../../assets/images/story5.jpg'),
        button: '¡Vamos!',
    },
];

const renderText = (slide: any) => {
    const { text, boldPart, boldFirst, large } = slide;
    const boldStyle = [styles.bubbleTextBold, large && styles.bubbleTextLarge];

    if (!boldPart) return <Text style={styles.bubbleText}>{text}</Text>;

    if (boldFirst) {
        return (
            <Text style={styles.bubbleText}>
                <Text style={boldStyle}>{boldPart}</Text>
                {text}
            </Text>
        );
    }

    return (
        <Text style={styles.bubbleText}>
            {text}
            <Text style={boldStyle}>{boldPart}</Text>
        </Text>
    );
};

export default function StoryScreen({ navigation }: any) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayIndex, setDisplayIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const currentSlide = slides[displayIndex];
    const bottomInset = useBottomInset(40);

    const animateTransition = (nextIndex: number) => {
        Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setDisplayIndex(nextIndex);
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: false });

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });
    };

    const goNext = () => {
        const nextIndex = currentIndex + 1;
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(nextIndex);
            animateTransition(nextIndex);
        } else {
            navigation.navigate('Step1');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={goNext}>
            <View style={styles.container}>

                <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
                    <FlatList
                        ref={flatListRef}
                        data={slides}
                        horizontal
                        pagingEnabled
                        scrollEnabled={false}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        style={styles.flatList}
                        renderItem={({ item }) => (
                            <Image source={item.image} style={styles.image} resizeMode="contain" />
                        )}
                    />
                </Animated.View>

                <View style={styles.dotsContainer}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[styles.dot, displayIndex === index && styles.dotActive]}
                        />
                    ))}
                </View>

                <View style={styles.bubbleContainer}>
                    <View style={styles.bubble}>
                        {renderText(currentSlide)}
                    </View>
                </View>

                {/* ✅ Siempre hay botón en todos los slides */}
                <TouchableOpacity
                    style={[styles.button, { bottom: bottomInset }]}
                    onPress={goNext}
                >
                    <Text style={styles.buttonText}>{currentSlide.button}</Text>
                </TouchableOpacity>

            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    flatList: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height,
    },
    image: {
        width,
        height: height,
    },
    dotsContainer: {
        position: 'absolute',
        top: 60,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.xs,
        zIndex: 10,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: colors.border,
    },
    dotActive: {
        backgroundColor: colors.text,
    },
    bubbleContainer: {
        position: 'absolute',
        top: 130,
        width: '100%',
        paddingHorizontal: spacing.xl,
        zIndex: 10,
    },
    bubble: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    bubbleText: {
        fontSize: fontSizes.md,
        color: colors.text,
        lineHeight: 24,
        textAlign: 'center',
    },
    bubbleTextBold: {
        fontWeight: '700',
        fontSize: fontSizes.lg,
    },
    bubbleTextLarge: {
        fontSize: fontSizes.xxl,
    },
    button: {
        position: 'absolute',
        left: spacing.xl,
        right: spacing.xl,
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        zIndex: 10,
    },
    buttonText: {
        color: colors.white,
        fontSize: fontSizes.lg,
        fontWeight: '600',
    },
});