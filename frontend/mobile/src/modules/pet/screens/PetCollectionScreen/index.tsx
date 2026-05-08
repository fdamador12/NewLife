import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';
import { usePet } from '../../hooks/usePet';
import {
  PET_NAMES, PET_IMAGES, PET_DESCRIPTIONS,
  XP_THRESHOLDS, PET_BACKGROUNDS,
} from '../../utils/petHelpers';
import { PetForm } from '../../types/pet.types';

export default function PetCollectionScreen({ navigation }: any) {
  const { pet, selectForm } = usePet();
  const bg = PET_BACKGROUNDS[pet.level] ?? PET_BACKGROUNDS[1];
  const progress = pet.unlocked_forms.length / XP_THRESHOLDS.length;

  return (
    <View style={styles.container}>
      {/* Header con gradiente */}
      <View style={[styles.header, { backgroundColor: '#5B8D47' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
          >
            <Feather name="chevron-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi colección</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress visual */}
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressCount}>
              {pet.unlocked_forms.length}
              <Text style={styles.progressTotal}>/{XP_THRESHOLDS.length}</Text>
            </Text>
            <Text style={styles.progressLabel}>Evoluciones desbloqueadas</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {XP_THRESHOLDS.map((threshold, index) => {
            const isUnlocked = pet.unlocked_forms.includes(threshold.form);
            const isSelected = pet.selected_form === threshold.form;
            const xpFalta = threshold.xp - pet.xp;

            return (
              <TouchableOpacity
                key={threshold.form}
                style={[
                  styles.card,
                  isSelected && [styles.cardSelected, { borderColor: '#5B8D47' }],
                  !isUnlocked && styles.cardLocked,
                ]}
                onPress={() => isUnlocked && selectForm(threshold.form as PetForm)}
                activeOpacity={isUnlocked ? 0.7 : 1}
              >
                {/* Badge de nivel */}
                <View style={[
                  styles.levelBadge,
                  isUnlocked ? { backgroundColor: '#5B8D47' } : styles.levelBadgeLocked
                ]}>
                  <Text style={[
                    styles.levelText,
                    !isUnlocked && styles.levelTextLocked
                  ]}>
                    Nv.{index + 1}
                  </Text>
                </View>

                {/* Imagen container */}
                <View style={[
                  styles.imageContainer,
                  isSelected && { backgroundColor: '#5B8D47' + '15' },
                  !isUnlocked && styles.imageContainerLocked,
                ]}>
                  <Image
                    source={PET_IMAGES[threshold.form]}
                    style={[
                      styles.image,
                      !isUnlocked && styles.imageSilhouette,
                    ]}
                    resizeMode="contain"
                    // Silueta negra para bloqueados
                    {...(!isUnlocked && { tintColor: '#1F2937' })}
                  />
                  
                  {/* Icono de candado para bloqueados */}
                  {!isUnlocked && (
                    <View style={styles.lockIconContainer}>
                      <Feather name="lock" size={16} color="#9CA3AF" />
                    </View>
                  )}
                </View>

                {/* Nombre */}
                <Text style={[
                  styles.name, 
                  !isUnlocked && styles.nameLocked
                ]}>
                  {isUnlocked ? threshold.label : '???'}
                </Text>

                {/* Tagline si esta desbloqueada */}
                {isUnlocked && (
                  <Text style={styles.tagline} numberOfLines={2}>
                    {PET_DESCRIPTIONS[threshold.form].tagline}
                  </Text>
                )}

                {/* XP requerido si esta bloqueada */}
                {!isUnlocked && (
                  <View style={styles.xpBadge}>
                    <Feather name="star" size={10} color="#F59E0B" />
                    <Text style={styles.xpText}>
                      {xpFalta > 0 ? `Necesitas ${xpFalta} XP` : `${threshold.xp} XP`}
                    </Text>
                  </View>
                )}

                {/* Badge de seleccionada */}
                {isSelected && (
                  <View style={[styles.selectedBadge, { backgroundColor: '#5B8D47' }]}>
                    <Feather name="check" size={12} color={colors.white} />
                  </View>
                )}

                {/* Spacer para que el banner no tape el contenido */}
                {isSelected && <View style={styles.equippedSpacer} />}

                {/* Banner equipada */}
                {isSelected && (
                  <View style={[styles.equippedBanner, { backgroundColor: '#5B8D47' }]}>
                    <Feather name="heart" size={10} color={colors.white} />
                    <Text style={styles.equippedText}>Equipada</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
  },
  progressSection: {
    gap: spacing.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  progressCount: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
  },
  progressTotal: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  progressLabel: {
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 3,
  },
  scroll: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  cardSelected: {
    elevation: 6,
    shadowOpacity: 0.15,
  },
  cardLocked: {
    backgroundColor: '#F8FAFC',
    elevation: 1,
    shadowOpacity: 0.04,
  },
  levelBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  levelBadgeLocked: {
    backgroundColor: '#E5E7EB',
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  levelTextLocked: {
    color: '#9CA3AF',
  },
  imageContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  imageContainerLocked: {
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: 72,
    height: 72,
  },
  imageSilhouette: {
    opacity: 0.8,
  },
  lockIconContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  name: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  nameLocked: {
    color: '#9CA3AF',
  },
  tagline: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: spacing.xs,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  xpText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '700',
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  // Spacer que empuja el contenido hacia arriba para que el banner no lo tape
  equippedSpacer: {
    height: 10,
  },
  equippedBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  equippedText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '700',
  },
});