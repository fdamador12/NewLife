import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../../../constants/theme';

const MEDITATION_IMAGES = [
  require('../../../../../assets/images/meditation1.jpg'),
  require('../../../../../assets/images/meditation2.jpg'),
  require('../../../../../assets/images/meditation3.jpg'),
];

interface Meditation {
  audio_id: string;
  nombre: string;
  duracion: number;
  url: string;
  categoria: string;
}

interface MeditationListProps {
  meditations: Meditation[];
  loading: boolean;
  error: string | null;
  onSelectMeditation: (meditation: Meditation) => void;
}

export default function MeditationList({
  meditations,
  loading,
  error,
  onSelectMeditation,
}: MeditationListProps) {
  const getImageForMeditation = (index: number) => {
    return MEDITATION_IMAGES[index % MEDITATION_IMAGES.length];
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
      </View>
    );
  }

  if (meditations.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="inbox" size={48} color={colors.textMuted} />
        <Text style={styles.emptyText}>No hay audios disponibles</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={meditations}
      keyExtractor={(item) => item.audio_id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => onSelectMeditation(item)}
          activeOpacity={0.8}
        >
          <Image
            source={getImageForMeditation(index)}
            style={styles.image}
          />
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {item.nombre}
            </Text>
            <Text style={styles.duration}> {item.duracion} min</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    fontSize: fontSizes.md,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  duration: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
});