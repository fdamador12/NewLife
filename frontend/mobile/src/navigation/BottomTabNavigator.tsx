import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useBottomInset } from '../hooks/useBottomInset';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5;

const TABS = [
  { key: 'Home', label: 'Inicio', icon: 'home' },
  { key: 'Progress', label: 'Progreso', icon: 'bar-chart-2' },
  { key: 'Motivation', label: 'Motivación', icon: 'zap' },
  { key: 'Care', label: 'Cuidado', icon: 'book-open' },
  { key: 'Social', label: 'Social', icon: 'users' },
];

type Props = {
  activeTab: string;
  onTabPress: (key: string) => void;
};

export default function BottomTabNavigator({ activeTab, onTabPress }: Props) {
  const activeIndex = TABS.findIndex((t) => t.key === activeTab);
  const circlePosition = useRef(new Animated.Value(activeIndex * TAB_WIDTH)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bottomInset = useBottomInset(24);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(circlePosition, {
        toValue: activeIndex * TAB_WIDTH,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 6,
        }),
      ]),
    ]).start();
  }, [activeIndex]);

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomInset }]}>

      <Animated.View
        style={[
          styles.circleWrapper,
          {
            transform: [{ translateX: circlePosition }],
          },
        ]}
      >
        <View style={styles.wingsRow}>
          <View style={styles.wingLeft} />
          <View style={styles.wingCenter} />
          <View style={styles.wingRight} />
        </View>
        <Animated.View style={[styles.activeCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Icon name={TABS[activeIndex].icon} size={24} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>

      <View style={styles.bar}>
        {TABS.map((tab, index) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => onTabPress(tab.key)}
              activeOpacity={0.8}
            >
              {isActive ? (
                <Text style={styles.activeLabel}>{tab.label}</Text>
              ) : (
                <Icon name={tab.icon} size={22} color="#6B7A8A" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    backgroundColor: '#2A3240',
  },
  circleWrapper: {
    position: 'absolute',
    top: -28,
    zIndex: 10,
    alignItems: 'center',
    width: TAB_WIDTH,
  },
  wingsRow: {
    flexDirection: 'row',
    width: 90,
    height: 20,
    position: 'absolute',
    top: 28,
  },
  wingLeft: {
    width: 20,
    height: 20,
    backgroundColor: '#2A3240',
    borderTopLeftRadius: 20,
    transform: [{ scaleX: -1 }],
  },
  wingCenter: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  wingRight: {
    width: 20,
    height: 20,
    backgroundColor: '#2A3240',
    borderTopLeftRadius: 20,
  },
  activeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00BCD4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bar: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 16 : 0,
  },
  tab: {
    width: TAB_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  activeLabel: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 30,
  },
});