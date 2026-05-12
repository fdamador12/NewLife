import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomTabNavigator from '../../../navigation/BottomTabNavigator';
import HomeScreen from './HomeScreen';
import { colors } from '../../../constants/theme';
import ProgressScreen from '../../progress/screens/ProgressScreen';
import MotivationScreen from '../../motivation/screens/MotivationScreen';
import CareScreen from '../../care/screens/CareScreen';
import SocialScreen from '../../social/screens/SocialScreen';
import { analytics, EVENT_TYPES } from '../../../services/analytics';

const SCREENS: Record<string, (navigation: any) => React.ReactNode> = {
  Home: (navigation) => <HomeScreen navigation={navigation} />,
  Progress: (navigation) => <ProgressScreen navigation={navigation} />,
  Motivation: (navigation) => <MotivationScreen navigation={navigation} />,
  Care: (navigation) => <CareScreen navigation={navigation} />,
  Social: (navigation) => <SocialScreen navigation={navigation} />,
};

export default function MainScreen({ navigation, route }: any) {
  // Obtener initialTab del parametro, si no esta usa 'Home'
  const [activeTab, setActiveTab] = useState(route?.params?.initialTab || 'Home');

  // Analytics: wrapper sobre setActiveTab que tambien trackea el cambio de tab.
  // Capturamos el tab anterior (from_tab) y el nuevo (to_tab) para poder
  // analizar flujos de navegacion comunes en el dashboard.
  // No trackeamos si el usuario toca el mismo tab (no es un cambio real).
  const handleTabChange = (newTab: string) => {
    if (newTab !== activeTab) {
      analytics.track(EVENT_TYPES.TAB_SWITCHED, {
        from_tab: activeTab,
        to_tab: newTab,
      });
    }
    setActiveTab(newTab);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {SCREENS[activeTab](navigation)}
      </View>
      <BottomTabNavigator activeTab={activeTab} onTabPress={handleTabChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});