import { StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, fontSizes } from '../../../../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorText: {
    fontSize: fontSizes.md,
    color: colors.accent,
  },
  card: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastCard: {
    borderBottomWidth: 0,
    paddingBottom: 40,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },

  // ===============Vertical Bar Chart====================
  verticalBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 10,
  },
  verticalBarWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  verticalBarBackground: {
    width: 28,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  verticalBar: {
    width: '100%',
    borderRadius: 14,
  },
  barLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  barLabelHighlighted: {
    fontWeight: '700',
    color: '#1F2937',
  },

  
  // ==============Emotion Bar Chart=============================
  emotionBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 10,
  },
  emotionBarWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  emotionBarBackground: {
    width: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  emotionBar: {
    width: '100%',
    borderRadius: 8,
  },
  emotionLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 10,
    textAlign: 'center',
  },
emotionPercentageLabel: {
  fontSize: 10,
  fontWeight: '700',
  color: '#FFFFFF',
  position: 'absolute',
  bottom: 4,
  alignSelf: 'center',
},


// ==================== Horizontal Bar Chart ===========================
listHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
},
listHeaderText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#374151',
},
listHeaderCount: {
  fontSize: 13,
  color: '#9CA3AF',
},
horizontalBarContainer: {
  gap: 16,
},
horizontalBarRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
},
horizontalBar: {
  height: 44,
  borderRadius: 22,
  paddingHorizontal: 12,
  minWidth: 40,
},
horizontalBarLabel: {
  fontSize: 12,
  fontWeight: '700',
  color: '#FFFFFF',
},
horizontalBarRightLabel: {
  width: '100%',
  fontSize: 12,
  fontWeight: '600',
  color: '#374151',
  textAlign: 'right',
  paddingRight: 20,
  position: 'absolute',
  right: 20,
  top: 12, // ✨ Centra verticalmente con respecto a la barra (44/2 = 22, menos padding)
},

  // ===========Pie Chart===========================================
  pieWrapper: {
    alignItems: 'center',
    marginVertical: 20,
  },
  pieContainer: {
    position: 'relative',
  },
  pieTooltip: {
    position: 'absolute',
    right: 20,
    top: '40%',
    backgroundColor: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pieTooltipText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  legendContainer: {
    alignItems: 'center',
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#4B5563',
  },

// ==============Summary Card============================
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  summaryIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  summaryIconText: {
    fontSize: 18,
  },
  summaryText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    flex: 1,
  },
});