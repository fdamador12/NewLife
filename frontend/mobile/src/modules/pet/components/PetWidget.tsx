import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { usePet } from '../hooks/usePet';
import XpBar from './XpBar';
import { PET_IMAGES } from '../utils/petHelpers';

type Props = {
  onPress?: () => void;
  compact?: boolean;
};

export default function PetWidget({ onPress, compact = false }: Props) {
  const { pet, message, loading } = usePet();

  if (loading) return null;

  const petSize = compact ? 70 : 100;

  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.containerCompact]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.topRow}>
        <View style={styles.bubbleSection}>
          <View style={styles.bubble}>
            <Text style={[styles.bubbleText, compact && styles.bubbleTextCompact]}>
              {message}
            </Text>
            <View style={styles.bubbleTail} />
          </View>
        </View>
        <Image
          source={PET_IMAGES[pet.selected_form]}
          style={{ width: petSize, height: petSize }}
          resizeMode="contain"
        />
      </View>
      <XpBar xp={pet.xp} level={pet.level} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  containerCompact: {
    padding: spacing.sm,
    gap: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bubbleSection: {
    flex: 1,
    marginRight: spacing.sm,
  },
  bubble: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignSelf: 'stretch',
    position: 'relative',
  },
  bubbleText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    fontWeight: '600',
    lineHeight: 18,
  },
  bubbleTextCompact: {
    fontSize: fontSizes.xs,
    lineHeight: 16,
  },
  bubbleTail: {
    position: 'absolute',
    right: -10,
    top: '110%',
    marginTop: -10,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: colors.accent,
  },
  petImage: {
    width: 100,
    height: 100,
  },
});