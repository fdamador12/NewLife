import React, { useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import BottomTabNavigator from '../../../navigation/BottomTabNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isGuestMode, markGuestTourCompleted } from '../../../services/guestService';
import { useBottomInset } from '../../../hooks/useBottomInset';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    intro: true,
    description: 'Te voy a dar un **mini tour** para que no te **pierdas** por aquí.',
    image: require('../../../assets/images/tour_intro.png'),
    button: 'Continuar',
    tab: null,
  },
  {
    id: '2',
    intro: false,
    tab: 'Home',
    title: 'Inicio',
    description: 'Aquí ves **todo lo básico:** información sobre tu mascota, tu contador de sobriedad, dinero ahorrado, y el botón SOS si necesitas ayuda urgente.',
    image: require('../../../assets/images/tour_home.png'),
    button: 'Continuar',
  },
  {
    id: '3',
    intro: false,
    tab: 'Progress',
    title: 'Progreso',
    description: 'Gráficas, tu progreso en los 12 pasos de NA, registro diario... y todo lo que muestra lo lejos que has llegado. **Es como tu mapa de evolución.**',
    image: require('../../../assets/images/tour_progress.png'),
    button: 'Continuar',
  },
  {
    id: '4',
    intro: false,
    tab: 'Motivation',
    title: 'Motivación',
    description: 'Tu frase del día, tus reflexiones y los retos que te mantienen firme. **Aquí vienes cuando necesitas un empujoncito.**',
    image: require('../../../assets/images/tour_motivation.png'),
    button: 'Continuar',
  },
  {
    id: '5',
    intro: false,
    tab: 'Care',
    title: 'Cuidado',
    description: 'Aquí tienes tus **herramientas para cuidarte:** contenido útil, contactos, una agenda, lugares seguros y apoyo profesional.',
    image: require('../../../assets/images/tour_care.png'),
    button: 'Continuar',
  },
  {
    id: '6',
    intro: false,
    tab: 'Social',
    title: 'Social',
    description: 'Aquí te puedes **conectar con otros como tú:** foros, publicaciones, comentarios y chats. Somos una comunidad, no un camino solitario.',
    image: require('../../../assets/images/tour_social.png'),
    button: '¡Empecemos!',
  },
];

const renderDescription = (text: string) => {
  const parts = text.split('**');
  return (
    <Text style={styles.description}>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <Text key={i} style={styles.descriptionBold}>{part}</Text>
          : <Text key={i}>{part}</Text>
      )}
    </Text>
  );
};

export default function AppTourScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = slides[currentIndex];
  const bottomInset = useBottomInset(48);

  const handleContinue = async () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const guest = await isGuestMode();
      if (guest) {
        await markGuestTourCompleted();
      } else {
        const email = await AsyncStorage.getItem('userEmail');
        await AsyncStorage.setItem(`tourCompleted_${email}`, 'true');
      }
      navigation.replace('Home');
    }
  };

  if (current.intro) {
    return (
      <View style={styles.container}>
        <Image
          source={current.image}
          style={styles.fullBackground}
          resizeMode="cover"
        />
        <View style={styles.introBubble}>
          {renderDescription(current.description)}
        </View>
        <TouchableOpacity
          style={[styles.introButton, { bottom: bottomInset }]}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>{current.button}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.grayBackground} />

      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          <Text style={styles.title}>{current.title}</Text>
          {renderDescription(current.description)}
          <Image
            source={current.image}
            style={styles.character}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>{current.button}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tail} />
      </View>

      <View style={styles.tabBarWrapper}>
        <BottomTabNavigator
          activeTab={current.tab as string}
          onTabPress={() => {}}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0E0E0',
  },
  fullBackground: {
    position: 'absolute',
    width,
    height,
  },
  introBubble: {
    position: 'absolute',
    top: 100,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  introButton: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  grayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E0E0E0',
  },
  cardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 20,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.white,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSizes.md,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  descriptionBold: {
    fontWeight: '700',
    color: colors.text,
  },
  character: {
    width: 120,
    height: 120,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});