import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { getGratitudeHistory } from '../../../services/progressService';
import { analytics, EVENT_TYPES } from '../../../services/analytics';
import { isGuestMode, getGuestCheckins } from '../../../services/guestService';

interface GratitudeEntry {
  dia: string;
  gratitud: string;
  hora: string;
}

export default function GratitudeHistoryScreen({ navigation }: any) {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analytics.track(EVENT_TYPES.GRATITUDE_HISTORY_VIEWED);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      console.log('🔄 Iniciando GratitudeHistoryScreen...');
      const guest = await isGuestMode();
      console.log('👤 isGuest:', guest);
      if (!cancelled) {
        fetchGratitudeHistory(guest);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  const fetchGratitudeHistory = async (guest: boolean) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📥 fetchGratitudeHistory llamado con guest:', guest);
  if (guest) {
    const checkins = await getGuestCheckins();
    const filtered = checkins.filter((c: any) => c.gratitud && c.gratitud.trim() !== '');

    const formatted = filtered
      .map((c: any) => {
        const date = new Date(c.dia + 'T00:00:00');
        return {
          diaRaw: c.dia, // ✅ guardar fecha original para ordenar
          dia: date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          gratitud: c.gratitud,
          hora: c.hora || '00:00',
        };
      })
      .sort((a: any, b: any) => {
        // ✅ ordenar por fecha original + hora
        const dateTimeA = `${a.diaRaw}T${a.hora}`;
        const dateTimeB = `${b.diaRaw}T${b.hora}`;
        return new Date(dateTimeB).getTime() - new Date(dateTimeA).getTime();
      })
      .map(({ diaRaw, ...rest }: any) => rest); // ✅ quitar diaRaw antes de setear

    setEntries(formatted);
  } else {
        console.log('📤 Obteniendo historial de gratitud del backend...');
        const response = await getGratitudeHistory();
        console.log('✅ Respuesta del servidor:', response);

        const records = response?.data || [];
        const sorted = records.sort((a: GratitudeEntry, b: GratitudeEntry) => {
          const dateTimeA = `${a.dia}T${a.hora}`;
          const dateTimeB = `${b.dia}T${b.hora}`;
          return new Date(dateTimeB).getTime() - new Date(dateTimeA).getTime();
        });

        const formatted = sorted.map((entry: any) => {
          const date = new Date(entry.dia);
          return {
            dia: date.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            gratitud: entry.gratitud,
            hora: entry.hora,
          };
        });

        console.log('📊 Datos formateados:', formatted);
        setEntries(formatted);
      }
    } catch (err: any) {
      console.error('❌ Error obteniendo historial:', err);
      setError('No se pudo cargar el historial de gratitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Historial de gratitud</Text>
          <Text style={styles.headerSubtitle}>Tu registro de gratitud</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Feather name="alert-circle" size={48} color={colors.textMuted} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={async () => {
              const guest = await isGuestMode();
              fetchGratitudeHistory(guest);
            }}
          >
            <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather name="heart" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>No hay registros de gratitud aún</Text>
          <Text style={styles.emptySubtext}>
            Completa tu primer registro diario para empezar
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {entries.map((entry, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.date}>{entry.dia}</Text>
              <Text style={styles.text}>{entry.gratitud}</Text>
            </View>
          ))}
        </ScrollView>
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
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginBottom: spacing.sm,
  },
  date: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  text: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: fontSizes.md,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: fontSizes.sm,
  },
  emptyText: {
    fontSize: fontSizes.md,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});