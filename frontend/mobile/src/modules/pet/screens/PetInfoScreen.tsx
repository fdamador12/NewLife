import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { usePet } from '../hooks/usePet';
import {
  PET_NAMES, PET_DESCRIPTIONS, PET_IMAGES,
  XP_THRESHOLDS, PET_BACKGROUNDS,
} from '../utils/petHelpers';

export default function PetInfoScreen({ navigation }: any) {
  const { pet } = usePet();
  const bg = PET_BACKGROUNDS[pet.level] ?? PET_BACKGROUNDS[1];
  const desc = PET_DESCRIPTIONS[pet.selected_form];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Card principal con fondo de color */}
      <View style={[styles.heroCard, { backgroundColor: bg.primary }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.heroContent}>
          <Image
            source={PET_IMAGES[pet.selected_form]}
            style={styles.heroImage}
            resizeMode="contain"
          />
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{PET_NAMES[pet.selected_form]}</Text>
            <Text style={styles.heroTagline}>{desc.tagline}</Text>
            <View style={styles.evolutionBadge}>
              <Text style={styles.evolutionText}>Evolución: {pet.level}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Descripción */}
      <View style={styles.descCard}>
        <Text style={styles.descText}>{desc.description}</Text>
      </View>

      {/* Árbol de evoluciones */}
      <View style={styles.evolutionCard}>
        <Text style={styles.sectionTitle}>Camino de evolución</Text>
        <View style={styles.evolutionTree}>
          {XP_THRESHOLDS.map((threshold, index) => {
            const isUnlocked = pet.unlocked_forms.includes(threshold.form);
            const isCurrent = pet.selected_form === threshold.form;

            return (
              <View key={threshold.form} style={styles.evolutionItem}>
                <View style={[
                  styles.evolutionImageWrapper,
                  isCurrent && styles.evolutionImageCurrent,
                  !isUnlocked && styles.evolutionImageLocked,
                ]}>
                  <Image
                    source={PET_IMAGES[threshold.form]}
                    style={styles.evolutionImage}
                    resizeMode="contain"
                  />
                  {!isUnlocked && (
                    <View style={styles.lockedOverlay} />
                  )}
                </View>
                <Text style={[
                  styles.evolutionLabel,
                  !isUnlocked && styles.evolutionLabelLocked,
                ]}>
                  {isUnlocked ? threshold.label : '???'}
                </Text>
                {!isUnlocked && (
                  <Text style={styles.evolutionXp}>{threshold.xp} XP</Text>
                )}
                {index < XP_THRESHOLDS.length - 1 && (
                  <View style={[
                    styles.evolutionConnector,
                    !isUnlocked && styles.evolutionConnectorLocked,
                  ]} />
                )}
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroCard: {
    padding: spacing.xl,
    paddingTop: 60,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  heroImage: {
    width: 100,
    height: 100,
  },
  heroInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  heroName: {
    fontSize: fontSizes.xxl,
    fontWeight: '800',
    color: colors.white,
  },
  heroTagline: {
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  evolutionBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  evolutionText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    fontWeight: '600',
  },
  descCard: {
    backgroundColor: colors.white,
    margin: spacing.xl,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  descText: {
    fontSize: fontSizes.md,
    color: colors.text,
    lineHeight: 24,
  },
  evolutionCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  evolutionTree: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  evolutionItem: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 70,
  },
  evolutionImageWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  evolutionImageCurrent: {
    borderColor: colors.accent,
  },
  evolutionImageLocked: {
    backgroundColor: '#E0E0E0',
  },
  evolutionImage: {
    width: 44,
    height: 44,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  evolutionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  evolutionLabelLocked: {
    color: colors.textMuted,
  },
  evolutionXp: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
  },
  evolutionConnector: {
    position: 'absolute',
    right: -spacing.md,
    top: 28,
    width: spacing.md,
    height: 2,
    backgroundColor: colors.accent,
  },
  evolutionConnectorLocked: {
    backgroundColor: '#E0E0E0',
  },
});