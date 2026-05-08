import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { useMotivation } from '../hooks/useMotivation';

export default function MedalsScreen({ navigation }: any) {
  const { misMedallas, loading, fetchMisMedallas } = useMotivation();

  useEffect(() => {
    fetchMisMedallas();
  }, [fetchMisMedallas]);

  const handleShare = async (titulo: string) => {
    await Share.share({
      message: `¡He logrado la medalla "${titulo}" en NewLife! 🏅`,
    });
  };

  const handleShareAll = async () => {
    const count = misMedallas?.length || 0;
    await Share.share({
      message: `¡He ganado ${count} medalla${count > 1 ? 's' : ''} en NewLife! 🏅`,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Tus medallas</Text>
          <Text style={styles.headerSubtitle}>
            {misMedallas && misMedallas.length > 0
              ? `${misMedallas.length} logro${misMedallas.length > 1 ? 's' : ''}`
              : 'Aún no tienes medallas'}
          </Text>
        </View>
        {misMedallas && misMedallas.length > 0 && (
          <TouchableOpacity style={styles.shareButton} onPress={handleShareAll}>
            <Feather name="share" size={18} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : misMedallas && misMedallas.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {misMedallas.map((medal) => (
            <View key={medal.user_reto_id} style={styles.medalCard}>
              <Text style={styles.medalEmoji}>🏅</Text>
              <Text style={styles.medalTitle}>{medal.titulo}</Text>
              {/* ✅ Manejo de fecha_completado null */}
              <Text style={styles.medalDate}>
                {medal.fecha_completado
                  ? new Date(medal.fecha_completado).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Fecha no disponible'}
              </Text>
              <View
                style={[
                  styles.difficultyBadge,
                  {
                    backgroundColor:
                      medal.dificultad === 'SUAVE'
                        ? '#4CAF50'
                        : medal.dificultad === 'MODERADA'
                          ? '#FFC107'
                          : '#FF6B6B',
                  },
                ]}
              >
                <Text style={styles.difficultyText}>{medal.dificultad}</Text>
              </View>
              <TouchableOpacity
                style={styles.shareButtonMedal}
                onPress={() => handleShare(medal.titulo)}
              >
                <Feather name="share-2" size={16} color={colors.white} />
                <Text style={styles.shareText}>Compartir</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={{ height: spacing.xl }} />
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={styles.emptyText}>Aún no tienes medallas</Text>
          <Text style={styles.emptySubtext}>
            Completa retos para desbloquear tus primeras medallas
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Challenges')}
          >
            <Text style={styles.ctaButtonText}>Ver retos</Text>
          </TouchableOpacity>
        </View>
      )}
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
    gap: spacing.md,
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  medalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  medalEmoji: {
    fontSize: 56,
  },
  medalTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  medalDate: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  difficultyText: {
    fontSize: fontSizes.xs,
    color: colors.white,
    fontWeight: '600',
  },
  shareButtonMedal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  shareText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  emptySubtext: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    marginTop: spacing.lg,
  },
  ctaButtonText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
});