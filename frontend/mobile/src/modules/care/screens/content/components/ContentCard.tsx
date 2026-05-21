import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Share,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.55;

interface ContentCardProps {
  id: string;
  title: string;
  type: 'article' | 'video';
  duration: string;
  image: string;
  liked: boolean;
  onPress: () => void;
  onToggleLike: (id: string) => void;
  wide?: boolean;
}

const DEFAULT_IMAGE = require('../../../../../assets/images/contenido1.png');

export default function ContentCard({
  id,
  title,
  type,
  duration,
  image,
  liked,
  onPress,
  onToggleLike,
  wide = false,
}: ContentCardProps) {
  const [imageError, setImageError] = useState(false);

  // Determinar si usar URL o imagen por defecto
  const hasValidUrl = image && image.trim() && image !== 'default';
  const imageSource = imageError || !hasValidUrl ? DEFAULT_IMAGE : { uri: image };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mira este contenido: ${title}`,
      });
    } catch (error) {
      console.error('Error compartiendo:', error);
    }
  };

  const handleLike = () => {
    onToggleLike(id);
  };

  const handleImageError = () => {
    console.warn(`⚠️ Error cargando imagen para: ${title}`);
    setImageError(true);
  };

  return (
    <TouchableOpacity
      style={[styles.card, wide && styles.cardWide]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Imagen con fallback */}
      <Image
        source={imageSource}
        style={styles.cardImage}
        resizeMode="cover"
        onError={handleImageError}
      />

      {/* Play button para videos */}
      {type === 'video' && (
        <View style={styles.playButton}>
          <Feather name="play" size={14} color={colors.white} />
        </View>
      )}

      {/* Overlay con información */}
      <View style={styles.cardOverlay}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.cardMeta}>
          {type === 'article' ? 'Artículo' : 'Video'} — {duration}
        </Text>

        {/* Acciones */}
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={handleShare}>
            <Feather name="share" size={16} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLike}>
            <Feather
              name="heart"
              size={16}
              color={liked ? '#FF6B6B' : colors.white}
              fill={liked ? '#FF6B6B' : 'none'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardWide: {
    width: width - spacing.xl * 2,
  },
  cardImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E0E0E0', // Color de fondo mientras carga
  },
  playButton: {
    position: 'absolute',
    bottom: spacing.lg + 40,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardOverlay: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    gap: 4,
  },
  cardTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 18,
    minHeight: 36,     // 👈 fuerza espacio de 2 líneas
  },
  cardMeta: {
    fontSize: fontSizes.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: 4,
  },
});