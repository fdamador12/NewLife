import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ImageBackground,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing } from '../../../constants/theme';
import { usePet } from '../hooks/usePet';
import XpBar from '../components/XpBar';
import { PET_BACKGROUND_IMAGES, PET_NAMES } from '../utils/petHelpers';
import { analytics, EVENT_TYPES } from '../../../services/analytics';
import { useBottomInset } from '../../../hooks/useBottomInset';

export default function PetScreen({ navigation }: any) {
  const { pet, message, loading } = usePet();
  const bottomInset = useBottomInset(40);

  // 📊 Analytics: trackear visita a la pantalla de mascota.
  // Incluimos el nivel actual como propiedad para análisis (¿los usuarios
  // de nivel alto la visitan más que los de nivel bajo?).
  // Solo trackeamos cuando pet ya está cargada (no en loading inicial).
  useEffect(() => {
    if (!loading && pet) {
      analytics.track(EVENT_TYPES.PET_VIEWED, {
        pet_level: pet.level,
        pet_form: pet.selected_form,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) return null;

  const backgroundImage = PET_BACKGROUND_IMAGES[pet.selected_form];

  // Usar colores claros para seed y sprout (fondos oscuros)
  const useLightColors = pet.selected_form === 'seed' || pet.selected_form === 'sprout';
  const textColor = useLightColors ? '#FFFFFF' : '#333';
  const xpBarColor = useLightColors ? '#FFFFFF' : '#333';

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.topSection}>

        <View style={styles.leftButtons}>
          <TouchableOpacity
            style={styles.sideBtn}
            onPress={() => navigation.navigate('PetInfo')}
          >
            <Feather name="help-circle" size={24} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sideBtn}
            onPress={() => navigation.navigate('PetCollection')}
          >
            <Feather name="book-open" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.centerTop}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Nv {pet.level}</Text>
          </View>

          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        </View>

      </View>

      <View style={[styles.bottomSection, { bottom: bottomInset }]}>
        <Text style={[styles.petName, { color: textColor }]}>{PET_NAMES[pet.selected_form]}</Text>
        <View style={styles.xpContainer}>
          <XpBar
            xp={pet.xp}
            level={pet.level}
            labelColor={xpBarColor}
            xpColor={xpBarColor}
          />
          <Text style={[styles.xpTotal, { color: textColor }]}> Total: {pet.xp} XP</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Feather name="chevron-left" size={28} color="#333" />
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  leftButtons: {
    gap: spacing.sm,
    marginTop: 100,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: spacing.md,
  },
  sideBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  centerTop: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.md,
    marginTop: 60,
  },
  levelBadge: {
    borderWidth: 2,
    borderColor: '#404040',
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  levelText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#333',
  },
  messageBubble: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 16,
    padding: spacing.md,
    maxWidth: '60%',
  },
  messageText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  bottomSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  petName: {
    fontSize: fontSizes.xxl,
    fontWeight: '800',
    textAlign: 'left',
  },
  xpContainer: {
    gap: spacing.xs,
  },
  xpTotal: {
    fontSize: fontSizes.md,
    textAlign: 'right',
    fontWeight: '700',
  },
});