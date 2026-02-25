import React, { useState } from 'react';
import {
    View, Text, Image, StyleSheet, TouchableWithoutFeedback,
    TouchableOpacity, Dimensions, FlatList,
} from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';

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
        button: null,
    },
    {
        id: '4',
        text: '¿Pero ahora quién cuidará de mí? No tengo padres... ',
        boldPart: '¡Ya sé! Desde ahora seré tu mascota.',
        boldFirst: false,
        image: require('../../../assets/images/story4.jpg'),
        button: null,
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
    const flatListRef = React.useRef<FlatList>(null);
    const currentSlide = slides[currentIndex];

    const goNext = () => {
        if (currentIndex < slides.length - 1) {
            const nextIndex = currentIndex + 1;
            flatListRef.current?.scrollToIndex({ index: nextIndex });
            setCurrentIndex(nextIndex);
        } else {
            navigation.navigate('AdditionalData');
        }
    };

    const handleScreenPress = () => {
        if (!currentSlide.button) goNext();
    };

    return (
        <TouchableWithoutFeedback onPress={handleScreenPress}>
            <View style={styles.container}>

                {/* Imagen de fondo completa abajo */}
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

                {/* Dots */}
                <View style={styles.dotsContainer}>
                    {slides.map((_, index) => (
                        <View key={index} style={[styles.dot, currentIndex === index && styles.dotActive]} />
                    ))}
                </View>

                {/* Burbuja de texto */}
                <View style={styles.bubbleContainer}>
                    <View style={styles.bubble}>
                        {renderText(currentSlide)}
                    </View>
                </View>

                {/* Botón si aplica */}
                {currentSlide.button && (
                    <TouchableOpacity style={styles.button} onPress={goNext}>
                        <Text style={styles.buttonText}>{currentSlide.button}</Text>
                    </TouchableOpacity>
                )}

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
        top: 130,        // un poco más abajo
        width: '100%',
        paddingHorizontal: spacing.xl,
        zIndex: 10,
    },
    bubble: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        borderWidth: 1.5,          // borde más grueso
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
        bottom: 40,
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