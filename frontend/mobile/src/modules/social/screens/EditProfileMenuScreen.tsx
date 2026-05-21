import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { getProfile } from '../../../services/authService';

const MENU_ITEMS = [
  { key: 'edit',     label: 'Editar perfil',      route: 'EditProfileScreen' },
  { key: 'settings', label: 'Configuración',       route: 'Settings' },
  { key: 'legal',    label: 'Legal / Seguridad',   route: 'PrivacyPolicy' },
];

export default function EditProfileMenuScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      console.log('Error cargando perfil:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => { fetchProfile(); }, [fetchProfile])
  );

  const nombre = profile?.nombre || 'Usuario';
  const apodo  = profile?.apodo  ? `@${profile.apodo}` : `@${nombre.toLowerCase().replace(' ', '')}`;

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
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
        <Text style={styles.headerTitle}>Perfil</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Feather name="user" size={40} color={colors.white} />
          </View>
          <TouchableOpacity style={styles.avatarEditBadge}>
            <Feather name="edit-2" size={10} color={colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileIdentity}>
          <Text style={styles.username}>{apodo}</Text>
          {'  |  '}
          <Text style={styles.name}>{nombre}</Text>
        </Text>
      </View>

      {/* Opciones */}
      <View style={styles.menuList}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.route)}
          >
            <Text style={styles.menuItemText}>{item.label}</Text>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  profileIdentity: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
  username: {
    fontWeight: '700',
  },
  name: {
    color: colors.textMuted,
  },
  menuList: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  menuItem: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  menuItemText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
});