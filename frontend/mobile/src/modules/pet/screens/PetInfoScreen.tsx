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
      <View style={[styles.heroCard, { backgroundColor: '#5B8D47' }]}>
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

      {/* Árbol de evoluciones mejorado */}
      <View style={styles.evolutionCard}>
        <View style={styles.sectionHeader}>
          <Feather name="git-branch" size={20} color="#5B8D47" />
          <Text style={styles.sectionTitle}>Camino de evolución</Text>
        </View>
        
        <View style={styles.evolutionTimeline}>
          {XP_THRESHOLDS.map((threshold, index) => {
            const isUnlocked = pet.unlocked_forms.includes(threshold.form);
            const isCurrent = pet.selected_form === threshold.form;
            const isLast = index === XP_THRESHOLDS.length - 1;

            return (
              <View key={threshold.form} style={styles.evolutionRow}>
                {/* Línea conectora vertical */}
                {!isLast && (
                  <View style={styles.connectorContainer}>
                    <View
                      style={[
                        styles.connectorLine,
                        isUnlocked ? { backgroundColor: '#5B8D47' } : styles.connectorLocked,
                      ]}
                    />
                    {isUnlocked && (
                      <View style={[styles.connectorDot, { backgroundColor: '#5B8D47' }]} />
                    )}
                  </View>
                )}

                {/* Contenido del item */}
                <View style={styles.evolutionItemRow}>
                  {/* Círculo con imagen */}
                  <View
                    style={[
                      styles.evolutionCircle,
                      isCurrent && [styles.evolutionCircleCurrent, { borderColor: '#5B8D47', shadowColor: '#5B8D47' }],
                      !isUnlocked && styles.evolutionCircleLocked,
                    ]}
                  >
                    {isUnlocked ? (
                      <Image
                        source={PET_IMAGES[threshold.form]}
                        style={styles.evolutionImg}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.lockedContent}>
                        <Feather name="lock" size={20} color="#9CA3AF" />
                      </View>
                    )}
                    {isCurrent && (
                      <View style={[styles.currentIndicator, { backgroundColor: '#5B8D47' }]}>
                        <Feather name="check" size={10} color={colors.white} />
                      </View>
                    )}
                  </View>

                  {/* Info del nivel */}
                  <View style={styles.evolutionInfo}>
                    <View style={styles.evolutionHeader}>
                      <Text
                        style={[
                          styles.evolutionName,
                          !isUnlocked && styles.evolutionNameLocked,
                        ]}
                      >
                        {isUnlocked ? threshold.label : '???'}
                      </Text>
                      {isCurrent && (
                        <View style={[styles.currentBadge, { backgroundColor: '#5B8D47' + '20' }]}>
                          <Text style={[styles.currentBadgeText, { color: '#5B8D47' }]}>Actual</Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={styles.evolutionLevel}>Nivel {index + 1}</Text>
                    
                    {!isUnlocked && (
                      <View style={styles.xpRequirement}>
                        <Feather name="star" size={12} color="#C37A49" />
                        <Text style={styles.xpText}>{threshold.xp} XP requeridos</Text>
                      </View>
                    )}
                    
                    {isUnlocked && !isCurrent && (
                      <View style={styles.unlockedBadge}>
                        <Feather name="unlock" size={12} color="#5B8D47" />
                        <Text style={styles.unlockedText}>Desbloqueado</Text>
                      </View>
                    )}
                  </View>
                </View>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  evolutionTimeline: {
    paddingLeft: spacing.xs,
  },
  evolutionRow: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  connectorContainer: {
    position: 'absolute',
    left: 30,
    top: 64,
    bottom: -spacing.lg,
    width: 2,
    alignItems: 'center',
  },
  connectorLine: {
    flex: 1,
    width: 2,
    borderRadius: 1,
  },
  connectorLocked: {
    backgroundColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  connectorDot: {
    position: 'absolute',
    bottom: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  evolutionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  evolutionCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  evolutionCircleCurrent: {
    borderWidth: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    backgroundColor: colors.white,
  },
  evolutionCircleLocked: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  evolutionImg: {
    width: 48,
    height: 48,
  },
  lockedContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  evolutionInfo: {
    flex: 1,
    gap: 4,
  },
  evolutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  evolutionName: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  evolutionNameLocked: {
    color: '#9CA3AF',
  },
  currentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  evolutionLevel: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  xpRequirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  xpText: {
    fontSize: fontSizes.sm,
    color: '#C37A49',
    fontWeight: '600',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  unlockedText: {
    fontSize: fontSizes.sm,
    color: '#5B8D47',
    fontWeight: '600',
  },
});