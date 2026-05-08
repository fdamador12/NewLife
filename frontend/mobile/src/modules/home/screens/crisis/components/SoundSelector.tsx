import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fontSizes, spacing, borderRadius } from '../../../../../constants/theme';
import { BreathingSound } from '../hooks/useBreathingSounds';

interface SoundSelectorProps {
  sounds: BreathingSound[];
  selectedSoundId: string;
  onSelectSound: (soundId: string) => void;
  loading?: boolean;
}

const SOUND_ICONS: Record<string, string> = {
  Lluvia: 'cloud-rain',
  Olas: 'wind',
  Viento: 'cloud',
  Fuego: 'zap',
  Pajaros: 'feather',
};

export const SoundSelector: React.FC<SoundSelectorProps> = ({
  sounds,
  selectedSoundId,
  onSelectSound,
  loading = false,
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.soundsList}
      style={styles.soundsScroll}
    >
      {sounds.map((sound) => {
        const isSelected = selectedSoundId === sound._id;
        const icon = SOUND_ICONS[sound.nombre] || 'music';

        return (
          <TouchableOpacity
            key={sound._id}
            style={[styles.soundChip, isSelected && styles.soundChipSelected]}
            onPress={() => onSelectSound(sound._id)}
            activeOpacity={0.7}
          >
            <Icon
              name={icon}
              size={14}
              color={isSelected ? colors.white : colors.text}
            />
            <Text
              style={[
                styles.soundChipText,
                isSelected && styles.soundChipTextSelected,
              ]}
            >
              {sound.nombre}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  soundsScroll: {
    width: '100%',
    marginBottom: spacing.sm,
    flexGrow: 0,
  },
  soundsList: {
    gap: spacing.sm,
    paddingHorizontal: 2,
  },
  soundChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    height: 32,
  },
  soundChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  soundChipText: {
    fontSize: fontSizes.xs,
    color: colors.text,
    fontWeight: '500',
  },
  soundChipTextSelected: {
    color: colors.white,
  },
  loadingContainer: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
});