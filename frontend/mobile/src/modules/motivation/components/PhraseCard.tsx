import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Share, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import {
  guardarFrase,
  desguardarFrase,
} from '../../../services/motivationService';

const PHRASE_IMAGE = require('../../../assets/images/phrase1.png');

type PhraseCardProps = {
  fraseId: string;
  texto: string;
  isFavorite: boolean;
  // FIX bug #4: el callback ahora recibe (fraseId, isFavoriteNow) para que la
  // pantalla padre pueda trackear DAILY_PHRASE_FAVORITED solo cuando se AGREGA.
  // Mantenemos compatibilidad: si no se pasan argumentos, sigue funcionando.
  onFavoriteChange?: (fraseId?: string, isFavoriteNow?: boolean) => void;
};

export function PhraseCard({
  fraseId,
  texto,
  isFavorite,
  onFavoriteChange,
}: PhraseCardProps) {
  const [isLiked, setIsLiked] = useState(isFavorite);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLiked(isFavorite);
  }, [isFavorite]);

  const handleShare = async () => {
    await Share.share({ message: texto });
  };

  const handleToggleLike = async () => {
    // Cambio inmediato en la UI
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setIsLoading(true);

    try {
      if (wasLiked) {
        // Eliminar de favoritas - DELETE /motivation/frases-guardadas/:fraseId
        console.log(`❌ Eliminando frase ${fraseId} de favoritas`);
        await desguardarFrase(fraseId);
        console.log(`✅ Frase ${fraseId} eliminada de favoritas`);
      } else {
        // Agregar a favoritas - POST /motivation/frases-guardadas
        console.log(`❤️ Guardando frase ${fraseId} como favorita`);
        await guardarFrase(fraseId);
        console.log(`✅ Frase ${fraseId} guardada como favorita`);
      }

      // Notificar al padre para refetch + tracking.
      // Pasamos fraseId y el estado nuevo (!wasLiked) para que la pantalla
      // pueda decidir si trackear el evento de favorito.
      if (onFavoriteChange) {
        onFavoriteChange(fraseId, !wasLiked);
      }
    } catch (error: any) {
      // Si falla, revertir el cambio
      console.error('❌ Error toggling favorite:', error.message);
      setIsLiked(wasLiked);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Image source={PHRASE_IMAGE} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardText}>{texto}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={handleShare} disabled={isLoading}>
            <Feather name="share" size={20} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleToggleLike}
            disabled={isLoading}
            style={styles.heartButton}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Feather
                name="heart"
                size={20}
                color={isLiked ? '#FF6B6B' : colors.white}
                fill={isLiked ? '#FF6B6B' : 'none'}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardOverlay: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardText: {
    fontSize: fontSizes.md,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heartButton: {
    padding: spacing.sm,
  },
});