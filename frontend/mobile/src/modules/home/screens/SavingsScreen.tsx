import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { getAhorro } from '../../../services/progressService';

interface AhorroData {
  dias_limpios: number;
  gasto_diario: number;
  ahorro_total: number;
  gasto_semanal: number;
}

export default function SavingsScreen({ navigation }: any) {
  const [ahorro, setAhorro] = useState<AhorroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAhorro = async () => {
      try {
        const data = await getAhorro();
        setAhorro(data);
      } catch (e) {
        console.log('Error obteniendo ahorro:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAhorro();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi ahorro</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Card principal — ahorro total */}
        <View style={styles.mainCard}>
          <View style={styles.mainIconWrapper}>
            <Feather name="dollar-sign" size={32} color="#F5A623" />
          </View>
          <Text style={styles.mainLabel}>Total ahorrado</Text>
          <Text style={styles.mainAmount}>
            ${(ahorro?.ahorro_total ?? 0).toLocaleString()}
          </Text>
          <Text style={styles.mainSub}>
            Desde que llevas registro con NewLife
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Feather name="calendar" size={20} color={colors.primary} />
            <Text style={styles.statNumber}>{ahorro?.dias_limpios ?? 0}</Text>
            <Text style={styles.statLabel}>Días limpios</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="trending-up" size={20} color="#2ECC71" />
            <Text style={styles.statNumber}>
              ${(ahorro?.gasto_diario ?? 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Ahorro por día</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="clock" size={20} color="#9B59B6" />
            <Text style={styles.statNumber}>
              ${(ahorro?.gasto_semanal ?? 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Gasto semanal</Text>
          </View>
        </View>

        {/* Botón ver detalle */}
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => navigation.navigate('Analysis')}
          activeOpacity={0.85}
        >
          <Feather name="bar-chart-2" size={20} color={colors.white} />
          <Text style={styles.detailButtonText}>Ver detalle por día</Text>
          <Feather name="chevron-right" size={20} color={colors.white} />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
  },
  mainCard: {
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
    marginBottom: spacing.lg,
  },
  mainIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  mainLabel: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    fontWeight: '600',
  },
  mainAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
  },
  mainSub: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: fontSizes.md,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  detailButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailButtonText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.white,
  },
});