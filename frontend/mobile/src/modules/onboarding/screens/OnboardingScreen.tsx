import React, { useRef, useState } from 'react';
import {
  View, Text, Image, StyleSheet, Dimensions,
  TouchableWithoutFeedback, FlatList, Animated,
} from 'react-native';
import { useSharedValue, withRepeat, withTiming, Easing, useAnimatedStyle } from 'react-native-reanimated';
import Reanimated from 'react-native-reanimated';
import { colors, fontSizes, spacing } from '../../../constants/theme';
import { markOnboardingSlidesCompleted } from '../../../services/onboarding-storage';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Apoyo',
    description: 'Tu espacio seguro para acompañarte en tu camino hacia la sobriedad.',
    image: require('../../../assets/images/onboarding1.png'),
  },
  {
    id: '2',
    title: 'Avanza',
    description: 'Haz crecer tu semilla, recibe motivación e inspiración, usa el SOS y evita riesgos, y organiza tus rutinas.',
    image: require('../../../assets/images/onboarding2.png'),
  },
  {
    id: '3',
    title: 'Recuerda',
    description: 'Cada día cuenta y tu esfuerzo importa...',
    image: require('../../../assets/images/onboarding3.png'),
  },
];

const FloatingLeaf = ({ style, size = 20, source }: { style: any, size?: number, source: any }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-20, { duration: 2000 + Math.random() * 1000, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );
    translateX.value = withRepeat(
      withTiming(10, { duration: 1500 + Math.random() * 1000, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
  }));

  return (
    <Reanimated.View style={[style, animatedStyle]}>
      <Image source={source} style={{ width: size, height: size }} resizeMode="contain" />
    </Reanimated.View>
  );
};

export default function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;


  const animateTransition = (nextIndex: number) => {
    Animated.timing(fadeAnim, {
      toValue: 0.3,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: false });
      slideAnim.setValue(16);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 10,
      }).start();
    });
  };


    const handlePress = async () => {
    if (currentIndex < slides.length - 1) {
      // Avanzar al siguiente slide
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: false });
      animateTransition(nextIndex);
    } else {
      // ✅ ÚLTIMO SLIDE: guardar y navegar
      await markOnboardingSlidesCompleted();
      navigation.replace('Welcome');
    }
  };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== currentIndex) {
        animateTransition(newIndex);
        flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
      }
    }
  }).current;

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>

        {/* Imagen de fondo */}
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          keyExtractor={(item) => item.id}
          style={StyleSheet.absoluteFill}
          renderItem={({ item }) => (
            <Image source={item.image} style={styles.backgroundImage} resizeMode="cover" />
          )}
        />

        {/* Hojas flotantes */}
        <FloatingLeaf style={styles.leaf1} size={40} source={require('../../../assets/images/leaf1.png')} />
        <FloatingLeaf style={styles.leaf2} size={60} source={require('../../../assets/images/leaf4.png')} />
        <FloatingLeaf style={styles.leaf3} size={50} source={require('../../../assets/images/leaf3.png')} />
        <FloatingLeaf style={styles.leaf4} size={70} source={require('../../../assets/images/leaf2.png')} />

        {/* Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View key={index} style={[styles.dot, currentIndex === index && styles.dotActive]} />
          ))}
        </View>

        {/* Texto animado */}
        <Animated.View style={[
          styles.textContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
          <Text style={styles.title}>{slides[currentIndex].title}</Text>
          <Text style={styles.description}>{slides[currentIndex].description}</Text>
        </Animated.View>

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(64,64,64,0.3)',
  },
  dotActive: {
    backgroundColor: '#404040',
    width: 20,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    color: '#404040',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSizes.md,
    color: '#404040',
    textAlign: 'center',
    lineHeight: 24,
  },
  textContainer: {
    position: 'absolute',
    top: 100,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 10,
  },
  backgroundImage: {
    width,
    height,
  },
  leaf1: { position: 'absolute', top: 80, left: 16, zIndex: 5 },
  leaf2: { position: 'absolute', top: 140, right: 24, zIndex: 5 },
  leaf3: { position: 'absolute', top: 300, left: 8, zIndex: 5 },
  leaf4: { position: 'absolute', top: 260, right: 16, zIndex: 5 },
});