import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import { useSharedValue, withRepeat, withTiming, Easing, useAnimatedStyle } from 'react-native-reanimated';
import Reanimated from 'react-native-reanimated';

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

const FloatingLeaf = ({ style }: { style: any }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-20, { duration: 2000 + Math.random() * 1000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    translateX.value = withRepeat(
      withTiming(10, { duration: 1500 + Math.random() * 1000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
  }));

  return (
    <Reanimated.View style={[style, animatedStyle]}>
      <Text style={{ fontSize: 20 }}>🍃</Text>
    </Reanimated.View>
  );
};

export default function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handlePress = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    } else {
      navigation.replace('Login');
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>

        {/* Hojas flotantes */}
        <FloatingLeaf style={styles.leaf1} />
        <FloatingLeaf style={styles.leaf2} />
        <FloatingLeaf style={styles.leaf3} />
        <FloatingLeaf style={styles.leaf4} />

        {/* Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.dotActive]}
            />
          ))}
        </View>

        {/* Texto */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{slides[currentIndex].title}</Text>
          <Text style={styles.description}>{slides[currentIndex].description}</Text>
        </View>

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
          style={styles.flatList}
          renderItem={({ item }) => (
            <Image
              source={item.image}
              style={styles.backgroundImage}
              resizeMode="contain"
            />
          )}
        />

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  dotsContainer: {
    position: 'absolute',
    top: 60,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  dotActive: {
    backgroundColor: '#555',
  },
  textContainer: {
    position: 'absolute',
    top: 100,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
  flatList: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height,
  },
  backgroundImage: {
    width,
    height: height,
  },
  leaf1: { position: 'absolute', top: 80, left: 16, zIndex: 5 },
  leaf2: { position: 'absolute', top: 140, right: 24, zIndex: 5 },
  leaf3: { position: 'absolute', top: 300, left: 8, zIndex: 5 },
  leaf4: { position: 'absolute', top: 260, right: 16, zIndex: 5 },
});