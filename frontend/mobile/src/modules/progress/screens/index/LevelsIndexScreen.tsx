import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';
import { useLevelProgress } from '../../../../hooks/useLevelProgress';
import { useToast } from '../../../../feedback/ToastContext';

const LEVELS = 12;
const SUBLEVELS = 3;

export default function LevelsIndexScreen({ navigation }: any) {
  const { progress, loading, isLocked, isCompleted } = useLevelProgress();
  const { showToast } = useToast();

  console.log('🔍 LevelsIndexScreen - Progress actual:', progress);

  const handleLevelPress = (nivel: number, subnivel: number) => {
    console.log(`📌 Click en Nivel ${nivel} Módulo ${subnivel}`);
    console.log(`📊 Progress: nivel=${progress.nivel}, subnivel=${progress.subnivel}`);
    console.log(`🔒 isLocked=${isLocked(nivel, subnivel)}`);

    if (isLocked(nivel, subnivel)) {
      console.log('❌ Módulo bloqueado');
      showToast(`Completa el Nivel ${progress.nivel}, Módulo ${progress.subnivel} primero`, 'info');
      return;
    }

    console.log('✅ Navegando a módulo');
    navigation.navigate(`Nivel${nivel}Modulo${subnivel}`);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Los 12 Pasos</Text>
          <Text style={styles.headerSubtitle}>
            Nivel {progress.nivel}, Módulo {progress.subnivel}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {Array.from({ length: LEVELS }, (_, i) => i + 1).map((nivel) => (
          <View key={nivel} style={styles.levelColumn}>
            <Text style={styles.levelTitle}>Paso {nivel}</Text>

            {Array.from({ length: SUBLEVELS }, (_, i) => i + 1).map((subnivel) => {
              const locked = isLocked(nivel, subnivel);
              const completed = isCompleted(nivel, subnivel);

              return (
                <TouchableOpacity
                  key={`${nivel}-${subnivel}`}
                  style={[
                    styles.card,
                    locked && styles.cardLocked,
                    completed && styles.cardCompleted,
                  ]}
                  onPress={() => handleLevelPress(nivel, subnivel)}
                  disabled={locked}
                >
                  {locked ? (
                    <Feather name="lock" size={24} color={colors.textMuted} />
                  ) : completed ? (
                    <Feather name="check-circle" size={24} color={colors.accent} />
                  ) : (
                    <Text style={styles.moduleNumber}>{subnivel}</Text>
                  )}
                  <Text style={styles.cardLabel}>
                    {locked ? 'Bloqueado' : completed ? 'Completado' : `Módulo ${subnivel}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>
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
  grid: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  levelColumn: {
    marginBottom: spacing.lg,
  },
  levelTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardLocked: {
    opacity: 0.5,
    backgroundColor: '#F5F5F5',
  },
  cardCompleted: {
    backgroundColor: '#E8F5E9',
  },
  moduleNumber: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.accent,
    minWidth: 30,
  },
  cardLabel: {
    fontSize: fontSizes.sm,
    color: colors.text,
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});