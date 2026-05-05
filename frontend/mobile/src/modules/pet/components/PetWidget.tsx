import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { usePet } from '../hooks/usePet';
import XpBar from './XpBar';
import { PET_IMAGES } from '../utils/petHelpers';

type Props = {
  onPress?: () => void;
};

export default function PetWidget({ onPress }: Props) {
  const { pet, message, loading } = usePet();

  if (loading) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.topRow}>
        <View style={styles.bubbleSection}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{message}</Text>
            <View style={styles.bubbleTail} />
          </View>
        </View>
        <Image
          source={PET_IMAGES[pet.selected_form]}
          style={styles.petImage}
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