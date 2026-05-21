import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Share,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.6;

export interface MotivationalCardProps {
  id: string;
  text: string;
  image: any;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onShare?: (text: string) => void;
}

export default function MotivationalCard({
  id,
  text,
  image,
  isFavorite,
  onToggleFavorite,
}: MotivationalCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateLike = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleToggleFavorite = () => {
    animateLike();
    onToggleFavorite(id);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `"${text}" - NewLife 🌱`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.card}>
      {/* Imagen SIN overlay */}
      <Image source={image} style={styles.cardImage} resizeMode="cover" />

      {/* Footer gris (clave del diseño) */}
      <View style={styles.footer}>
        <Text style={styles.cardText}>{text}</Text>

        <View style={styles.cardActions}>
          <TouchableOpacity onPress={handleShare}>
            <Feather name="share-2" size={18} color={colors.white} />
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity onPress={handleToggleFavorite}>
              <Feather
                name="heart"
                size={18}
                color={isFavorite ? '#FF6B6B' : colors.white}
                fill={isFavorite ? '#FF6B6B' : 'none'}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0', // crema/gris base
  },

  cardImage: {
    width: '100%',
    height: '70%', // 🔥 clave: la imagen NO ocupa todo
  },

  footer: {
    height: '30%', // 🔥 bloque inferior
    backgroundColor: '#404040', // gris visible (ajusta si quieres más claro)
    padding: spacing.md,
    justifyContent: 'space-between',
  },

  cardText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    fontWeight: '600',
    lineHeight: 20,
  },

  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});