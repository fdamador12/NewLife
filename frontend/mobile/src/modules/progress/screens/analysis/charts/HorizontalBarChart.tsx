import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../../../../constants/theme';
import { styles } from '../styles/analysisStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const HorizontalBarChart = ({
  data,
  maxWidth = SCREEN_WIDTH - 160,
}: {
  data: Array<{ label: string; value: number; color: string }>;
  maxWidth?: number;
}) => {

  // ✅ CONTROL TOTAL AQUÍ
  if (!data || data.length === 0) {
    return null;
  }

  const maxValue = Math.max(...data.map(d => d.value));

  // ✨ FUNCIÓN PARA DIVIDIR LABELS
  const splitLabel = (label: string) => {
    if (label.includes('Compañeros')) {
      return ['Compañeros', label.replace('Compañeros ', '')];
    }
    return [label, ''];
  };

  return (
    <View style={styles.card}>

      {/* HEADER */}
      <View style={styles.cardHeader}>
        <Feather name="users" size={20} color={colors.primary} />
        <Text style={styles.cardTitle}>Vínculos de riesgo</Text>
      </View>

      <Text style={styles.cardDescription}>
        Según tus registros, estas son las personas que más te detonan.
      </Text>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>Lista de personas</Text>
        <Text style={styles.listHeaderCount}>
          {data.length} personas registradas
        </Text>
      </View>

      {/* GRÁFICA */}
      <View style={styles.horizontalBarContainer}>
        {data.map((item, index) => {
          const barWidth = (item.value / maxValue) * maxWidth;
          const [line1, line2] = splitLabel(item.label);

          return (
            <View
              key={index}
              style={{
                marginBottom: 0,
                flexDirection: 'row',
                alignItems: 'flex-start',
              }}
            >
              {/* BARRA */}
              <View style={[styles.horizontalBarRow, { flex: 1, marginRight: 10 }]}>
                <View
                  style={[
                    styles.horizontalBar,
                    {
                      backgroundColor: item.color,
                      width: barWidth,
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                  ]}
                >
                  <Text style={styles.horizontalBarLabel}>
                    {item.value}%
                  </Text>
                </View>
              </View>

              {/* LABEL */}
              <View style={{ width: 100 }}>
                <Text
                  style={[
                    styles.horizontalBarRightLabel,
                    { marginBottom: 2 },
                  ]}
                >
                  {line1}
                </Text>

                {line2 && (
                  <Text
                    style={[
                      styles.horizontalBarRightLabel,
                      { marginTop: 15 },
                    ]}
                  >
                    {line2}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};