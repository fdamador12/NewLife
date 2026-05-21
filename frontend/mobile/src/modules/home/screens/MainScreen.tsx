import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import BottomTabNavigator from '../../../navigation/BottomTabNavigator';
import HomeScreen from './HomeScreen';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import ProgressScreen from '../../progress/screens/ProgressScreen';
import MotivationScreen from '../../motivation/screens/MotivationScreen';
import CareScreen from '../../care/screens/CareScreen';
import SocialScreen from '../../social/screens/SocialScreen';
import { analytics, EVENT_TYPES } from '../../../services/analytics';
import { isGuestMode } from '../../../services/guestService';

function LockedForGuestScreen({ navigation, moduleName }: { navigation: any; moduleName: string }) {
  return (
    <View style={lockedStyles.container}>
      <Image
        source={require('../../../assets/images/character5.png')}
        style={lockedStyles.image}
        resizeMode="contain"
      />
      <Text style={lockedStyles.title}>Módulo bloqueado</Text>
      <Text style={lockedStyles.description}>
        El módulo de {moduleName} está disponible solo para usuarios registrados.
        Crea una cuenta para guardar tu progreso y desbloquear todas las funciones.
      </Text>
      <TouchableOpacity
        style={lockedStyles.button}
        onPress={() => navigation.navigate('Register')}
        activeOpacity={0.85}
      >
        <Text style={lockedStyles.buttonText}>Crear cuenta</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
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