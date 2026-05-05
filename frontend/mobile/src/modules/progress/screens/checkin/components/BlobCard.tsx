import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fontSizes, spacing, borderRadius } from '../../../../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.xl * 2;

type Props = {
  children: React.ReactNode;
  badge: string;
};

export default function BlobCard({ children, badge }: Props) {
  const [cardHeight, setCardHeight] = useState(200);

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.badgeFloating}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
      <View style={{ width: CARD_WIDTH, height: cardHeight }}>
        <Svg
          width={CARD_WIDTH}
          height={cardHeight}
          viewBox="0 0 300 414"
          preserveAspectRatio="none"
          style={[StyleSheet.absoluteFill, styles.cardShadow]}
        >
          <Path
            d="M151.451 0.5C188.662 0.57261 238.886 9.3057 270.96 15.7598C288.76 19.3417 300.646 35.874 299.16 53.9941C295.669 96.5513 290.114 172.594 290.114 225.545C290.114 273.408 294.653 326.271 298.103 359.546C300.048 378.298 287.827 395.711 269.337 399.226C236.887 405.393 186.994 413.534 149.912 413.5C112.491 413.465 61.9364 405.08 29.7615 398.903C12.0076 395.495 -0.0354135 379.229 1.09839 361.163C3.21462 327.442 6.11401 272.657 6.11401 225.545C6.11401 172.578 2.66698 95.3912 0.546631 52.9199C-0.334995 35.2607 11.4389 19.5004 28.7517 16.0137C61.174 9.48396 113.125 0.425265 151.451 0.5Z"
            fill="white"
            stroke="#E3E3E3"
            strokeWidth="1"
          />
        </Svg>
        <View
          style={styles.cardContent}
          onLayout={(e) => setCardHeight(e.nativeEvent.layout.height + 20)}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

export const CARD_WIDTH_EXPORT = CARD_WIDTH;

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'relative',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  badgeFloating: {
    position: 'absolute',
    top: -18,
    left: spacing.lg,
    zIndex: 1,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    transform: [{ rotate: '-2deg' }],
  },
  badgeText: {
    fontSize: fontSizes.md,
    color: colors.white,
    fontWeight: '700',
  },
  cardContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
});