import { Animated } from 'react-native';
import { getTotalHeightUpTo, levelHeights } from './levelHeights';

export const performAnimatedScroll = (
    flatListRef: any,
    scrollAnimRef: any,
    hasScrolledRef: any,
    userLevel: number,
) => {
    hasScrolledRef.current = false;

    if (userLevel <= 1) return;
    
    const allHeightsMeasured = Object.keys(levelHeights).length === 12;
    
    if (!allHeightsMeasured) {
        console.log('⏳ Esperando a que todas las cards se carguen...');
        return;
    }

    console.log(`🎬 Animando a Nivel ${userLevel}`);

    // ✅ DELAY MÍNIMO: Solo 100ms en lugar de 700ms
    setTimeout(() => {
        const targetOffset = getTotalHeightUpTo(userLevel);

        console.log(`📍 Offset objetivo: ${targetOffset}px`);

        setTimeout(() => {
            hasScrolledRef.current = true;

            scrollAnimRef.setValue(0);

            // Mismo spring de antes (velocidad original)
            Animated.spring(scrollAnimRef, {
                toValue: targetOffset,
                damping: 12,
                stiffness: 25,
                mass: 1.5,
                velocity: 0,
                restDisplacementThreshold: 0.5,
                restSpeedThreshold: 0.5,
                useNativeDriver: false,
            }).start(() => {
                console.log('✅ Scroll completado');
            });

            const listenerId = scrollAnimRef.addListener((event: { value: number }) => {
                flatListRef.current?.scrollToOffset({ offset: event.value, animated: false });
            });
        }, 50);  // ⬇️ Reducido
    }, 100);   // ⬇️ Era 700ms, ahora 100ms - empieza casi al instante
};