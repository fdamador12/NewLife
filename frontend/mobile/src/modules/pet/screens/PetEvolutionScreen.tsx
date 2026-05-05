import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
} from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import PetAvatar from '../components/PetAvatar';
import { PetForm } from '../types/pet.types';
import { PET_NAMES } from '../utils/petHelpers';

type Props = {
  navigation: any;
  route: any;
};

export default function PetEvolutionScreen({ navigation, route }: Props) {
  const { newForm, xp, destination } = route.params as {
    newForm: PetForm;
    xp: number;
    destination: string;
  };

  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    navigation.navigate(destination);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.title}>¡Evolucionaste!</Text>
        <Text style={styles.subtitle}>Has desbloqueado una nueva forma</Text>

        <View style={styles.petWrapper}>
          <PetAvatar form={newForm} size={200} />
        </View>

        <View style={styles.nameBadge}>
          <Text style={styles.nameText}>{PET_NAMES[newForm]}</Text>
        </View>

        <Text style={styles.message}>
          Tu dedicación está dando frutos. Sigue adelante.
        </Text>

        <Text style={styles.xpText}>{xp} XP totales</Text>
      </Animated.View>

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>¡Genial!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  content: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  petWrapper: {
    marginVertical: spacing.xl,
  },
  nameBadge: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  nameText: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
  },
  message: {
    fontSize: fontSizes.md,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  xpText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  button: {
    position: 'absolute',
    bottom: 48,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
});