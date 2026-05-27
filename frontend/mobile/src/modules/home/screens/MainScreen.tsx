import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import BottomTabNavigator from '../../../navigation/BottomTabNavigator';
import HomeScreen from './HomeScreen';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import ProgressScreen from '../../progress/screens/ProgressScreen';
import MotivationScreen from '../../motivation/screens/MotivationScreen';
import CareScreen from '../../care/screens/CareScreen';
import SocialScreen from '../../social/screens/SocialScreen';
import { analytics, EVENT_TYPES } from '../../../services/analytics';
import { isGuestMode } from '../../../services/guestService';

const { width } = Dimensions.get('window');

const MODULE_CONFIG: Record<string, { title: string; subtitle: string; description: string }> = {
  Motivación: {
    title: 'Motivación',
    subtitle: 'Frases, retos y medallas',
    description: 'Accede a frases inspiradoras, únete a retos y gana medallas. Crea una cuenta para desbloquear todo tu potencial.',
  },
  Cuidado: {
    title: 'Cuidado',
    subtitle: 'Tu bienestar integral',
    description: 'Explora contenido de bienestar, grupos de apoyo y herramientas para cuidarte. Disponible al crear tu cuenta.',
  },
  Social: {
    title: 'Social',
    subtitle: 'Conecta con otros',
    description: 'Pronto podrás conectar con la comunidad y compartir tu progreso. Crea una cuenta para acceder.',
  },
};

function LockedForGuestScreen({ navigation, moduleName }: { navigation: any; moduleName: string }) {
  const config = MODULE_CONFIG[moduleName] || {
    title: moduleName,
    subtitle: 'Módulo premium',
    description: `El módulo de ${moduleName} está disponible solo para usuarios registrados. Crea una cuenta para desbloquear todas las funciones.`,
  };

  return (
    <View style={lockedStyles.container}>
      <View style={lockedStyles.header}>
        <Text style={lockedStyles.headerTitle}>{config.title}</Text>
        <Text style={lockedStyles.headerSubtitle}>{config.subtitle}</Text>
      </View>

      <View style={lockedStyles.content}>
        <Image
          source={require('../../../assets/images/mascotacorazon.png')}
          style={lockedStyles.image}
          resizeMode="contain"
        />
        <Text style={lockedStyles.mainText}>Contenido exclusivo para miembros</Text>
        <Text style={lockedStyles.subtitleText}>{config.description}</Text>

        <TouchableOpacity
          style={lockedStyles.button}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
        >
          <Text style={lockedStyles.buttonText}>Crear cuenta gratis</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const SCREENS: Record<string, (navigation: any, isGuest: boolean) => React.ReactNode> = {
  Home: (navigation) => <HomeScreen navigation={navigation} />,
  Progress: (navigation) => <ProgressScreen navigation={navigation} />,
  Motivation: (navigation, isGuest) => isGuest
    ? <LockedForGuestScreen navigation={navigation} moduleName="Motivación" />
    : <MotivationScreen navigation={navigation} />,
  Care: (navigation, isGuest) => isGuest
    ? <LockedForGuestScreen navigation={navigation} moduleName="Cuidado" />
    : <CareScreen navigation={navigation} />,
  Social: (navigation, isGuest) => isGuest
    ? <LockedForGuestScreen navigation={navigation} moduleName="Social" />
    : <SocialScreen navigation={navigation} />,
};

export default function MainScreen({ navigation, route }: any) {
  const [activeTab, setActiveTab] = useState(route?.params?.initialTab || 'Home');
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const checkGuest = async () => {
      const guest = await isGuestMode();
      setIsGuest(guest);
    };
    checkGuest();
  }, []);

  const handleTabChange = (newTab: string) => {
    if (newTab !== activeTab) {
      analytics.track(EVENT_TYPES.TAB_SWITCHED, {
        from_tab: activeTab,
        to_tab: newTab,
      });
    }
    setActiveTab(newTab);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {SCREENS[activeTab](navigation, isGuest)}
      </View>
      <BottomTabNavigator activeTab={activeTab} onTabPress={handleTabChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});

const lockedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  image: {
    width: width * 0.5,
    height: width * 0.5,
    opacity: 0.6,
  },
  mainText: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
});