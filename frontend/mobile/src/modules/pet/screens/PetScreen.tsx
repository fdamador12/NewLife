import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing } from '../../../constants/theme';
import { usePet } from '../hooks/usePet';
import PetAvatar from '../components/PetAvatar';
import XpBar from '../components/XpBar';
import { getPetMessage, PET_BACKGROUNDS, PET_NAMES } from '../utils/petHelpers';

const { width, height } = Dimensions.get('window');

export default function PetScreen({ navigation }: any) {
  const { pet, loading } = usePet();

  if (loading) return null;

  const message = getPetMessage(pet.level);
  const bg = PET_BACKGROUNDS[pet.level] ?? PET_BACKGROUNDS[1];

  return (
    <View style={styles.container}>
      {/* Fondo decorativo */}
      <View style={[styles.background, { backgroundColor: bg.primary }]}>
        <View style={[styles.bgCircle1, { backgroundColor: bg.secondary }]} />
        <View style={[styles.bgCircle2, { backgroundColor: bg.accent }]} />
        <View style={[styles.bgCircle3, { backgroundColor: bg.secondary }]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Nv {pet.level}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('PetInfo')}
          >
            <Feather name="help-circle" size={24} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('PetCollection')}
          >
            <Feather name="book-open" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mascota */}
      <View style={styles.petSection}>
        <PetAvatar form={pet.selected_form} size={220} />
      </View>

      {/* Mensaje */}
      <View style={styles.messageSection}>
        <View style={styles.messageBubble}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      </View>

      {/* Info inferior */}
      <View style={styles.bottomCard}>
        <Text style={styles.petName}>{PET_NAMES[pet.selected_form]}</Text>
        <XpBar xp={pet.xp} level={pet.level} />
        <Text style={styles.xpTotal}>{pet.xp} XP totales</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.65,
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -80,
    right: -60,
    opacity: 0.5,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 40,
    left: -50,
    opacity: 0.4,
  },
  bgCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    top: 100,
    left: 40,
    opacity: 0.3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  levelText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.white,
  },
  petSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -spacing.xl,
  },
  messageSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  messageBubble: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    padding: spacing.md,
  },
  messageText: {
    fontSize: fontSizes.md,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  bottomCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: 48,
  },
  petName: {
    fontSize: fontSizes.xl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  xpTotal: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'right',
  },
});