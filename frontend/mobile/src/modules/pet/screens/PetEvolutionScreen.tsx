import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { PetForm } from '../types/pet.types';
import { PET_NAMES, PET_IMAGES, PET_DESCRIPTIONS, XP_THRESHOLDS } from '../utils/petHelpers';
import { analytics, EVENT_TYPES } from '../../../services/analytics';

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
  const sparkleOpacity = useRef(new Animated.Value(0)).current;

  // Obtener el nivel de la evolución
  const evolutionLevel = XP_THRESHOLDS.findIndex(t => t.form === newForm) + 1;

  // 📊 Analytics: trackear evolución de mascota.
  // Esta pantalla solo se muestra cuando la mascota efectivamente evolucionó,
  // así que el track es 1:1 con el evento real.
  useEffect(() => {
    analytics.track(EVENT_TYPES.PET_EVOLVED, {
      new_form: newForm,
      xp_total: xp,
    });
  }, [newForm, xp]);

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

    // Animación de sparkles/brillo
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleOpacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleContinue = () => {
    navigation.navigate(destination);
  };

  return (
    <View style={styles.container}>
      {/* Header con gradiente verde consistente */}
      <View style={styles.header}>
        <Animated.View style={{ opacity: sparkleOpacity }}>
          <Feather name="star" size={20} color="rgba(255,255,255,0.6)" />
        </Animated.View>
        <Text style={styles.headerTitle}>¡Nueva Evolución!</Text>
        <Animated.View style={{ opacity: sparkleOpacity }}>
          <Feather name="star" size={20} color="rgba(255,255,255,0.6)" />
        </Animated.View>
      </View>

      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        {/* Card principal de la evolución */}
        <View style={styles.evolutionCard}>
          {/* Badge de nivel */}
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Nv.{evolutionLevel}</Text>
          </View>

          {/* Contenedor de imagen */}
          <View style={styles.imageContainer}>
            <Image
              source={PET_IMAGES[newForm]}
              style={styles.petImage}
              resizeMode="contain"
            />
          </View>

          {/* Nombre con badge */}
          <View style={styles.nameBadge}>
            <Feather name="award" size={16} color={colors.white} />
            <Text style={styles.nameText}>{PET_NAMES[newForm]}</Text>
          </View>

          {/* Descripción/Tagline */}
          <Text style={styles.tagline}>
            {PET_DESCRIPTIONS[newForm]?.tagline || 'Tu dedicación está dando frutos.'}
          </Text>

          {/* XP Badge */}
          <View style={styles.xpBadge}>
            <Feather name="star" size={12} color="#F59E0B" />
            <Text style={styles.xpText}>{xp} XP totales</Text>
          </View>
        </View>

        {/* Mensaje motivacional */}
        <View style={styles.messageContainer}>
          <Feather name="heart" size={16} color="#5B8D47" />
          <Text style={styles.message}>
            Sigue adelante, cada paso cuenta
          </Text>
        </View>
      </Animated.View>

      {/* Botón de continuar */}
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>¡Genial!</Text>
        <Feather name="arrow-right" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: '#5B8D47',
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  evolutionCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: '#5B8D47',
    elevation: 6,
    shadowColor: '#5B8D47',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    position: 'relative',
  },
  levelBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: '#5B8D47',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#5B8D47' + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  petImage: {
    width: 120,
    height: 120,
  },
  nameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#5B8D47',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  nameText: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
  },
  tagline: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  xpText: {
    fontSize: fontSizes.sm,
    color: '#D97706',
    fontWeight: '700',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: '#5B8D47' + '10',
    borderRadius: borderRadius.full,
  },
  message: {
    fontSize: fontSizes.sm,
    color: '#5B8D47',
    fontWeight: '600',
  },
  button: {
    position: 'absolute',
    bottom: 48,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: '#5B8D47',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    elevation: 4,
    shadowColor: '#5B8D47',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
});