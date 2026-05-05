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
  XP_THRESHOLDS,
} from '../../utils/petHelpers';
import { PetForm } from '../../types/pet.types';

export default function PetCollectionScreen({ navigation }: any) {
  const { pet, selectForm } = usePet();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi colección</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          {pet.unlocked_forms.length} de {XP_THRESHOLDS.length} desbloqueadas
        </Text>

        <View style={styles.grid}>
          {XP_THRESHOLDS.map((threshold) => {
            const isUnlocked = pet.unlocked_forms.includes(threshold.form);
            const isSelected = pet.selected_form === threshold.form;
            const xpFalta = threshold.xp - pet.xp;

            return (
              <TouchableOpacity
                key={threshold.form}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                  !isUnlocked && styles.cardLocked,
                ]}
                onPress={() => isUnlocked && selectForm(threshold.form as PetForm)}
                activeOpacity={isUnlocked ? 0.8 : 1}
              >
                {/* Imagen con overlay si está bloqueada */}
                <View style={styles.imageWrapper}>
                  <Image
                    source={PET_IMAGES[threshold.form]}
                    style={styles.image}
                    resizeMode="contain"
                  />
                  {!isUnlocked && (
                    <View style={styles.lockedOverlay} />
                  )}
                </View>

                {/* Nombre */}
                <Text style={[styles.name, !isUnlocked && styles.nameLocked]}>
                  {isUnlocked ? threshold.label : '???'}
                </Text>

                {/* Descripción corta si está desbloqueada */}
                {isUnlocked && (
                  <Text style={styles.tagline} numberOfLines={2}>
                    {PET_DESCRIPTIONS[threshold.form].tagline}
                  </Text>
                )}

                {/* XP requerido si está bloqueada */}
                {!isUnlocked && (
                  <View style={styles.xpBadge}>
                    <Feather name="lock" size={10} color={colors.textMuted} />
                    <Text style={styles.xpText}>
                      {xpFalta > 0 ? `Faltan ${xpFalta} XP` : `${threshold.xp} XP`}
                    </Text>
                  </View>
                )}

                {/* Badge seleccionada */}
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Feather name="check" size={12} color={colors.white} />
                  </View>
                )}

                {/* Badge equipada */}
                {isSelected && (
                  <View style={styles.equippedBanner}>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    textAlign: 'center',
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
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.accent,
  },
  cardLocked: {
    backgroundColor: '#F5F5F5',
    elevation: 0,
    shadowOpacity: 0,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
  },
  image: {
    width: 80,
    height: 80,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 8,
  },
  name: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  nameLocked: {
    color: colors.textMuted,
  },
  tagline: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  xpText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equippedBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.accent,
    paddingVertical: 3,
    alignItems: 'center',
  },
  equippedText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '700',
  },
});