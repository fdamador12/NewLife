import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { getProfile } from '../../../services/authService';
import { Avatar } from '../components/Avatar';

/**
 * Menu del perfil propio (accesible desde Comunidad).
 *
 * Muestra:
 *  - Avatar real del usuario (tappable abre EditProfileScreen)
 *  - @apodo | Nombre
 *  - Descripcion (si tiene)
 *  - Opciones: Editar perfil, Ver mi perfil publico, Configuracion
 *
 * "Ver mi perfil publico" lleva al SocialProfileScreen tal como lo veria
 * cualquier otro usuario. Util para ver como te perciben en la comunidad.
 *
 * NOTA: se removio "Legal/Seguridad" porque las politicas de privacidad
 * ya estan accesibles desde Configuracion (evita duplicacion).
 */

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
  const apodo = profile?.apodo ? `@${profile.apodo}` : `@${nombre.toLowerCase().replace(' ', '')}`;
  const avatarUrl = profile?.avatar_url || null;
  const descripcion = profile?.descripcion || '';

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

      {/* Avatar + identidad */}
      <View style={styles.avatarSection}>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={() => navigation.navigate('EditProfileScreen')}
          activeOpacity={0.85}
        >
          <Avatar url={avatarUrl} name={nombre} size={100} />
          <View style={styles.avatarEditBadge}>
            <Feather name="edit-2" size={10} color={colors.white} />
          </View>
        </TouchableOpacity>

        <Text style={styles.profileIdentity}>
          <Text style={styles.username}>{apodo}</Text>
          {'  |  '}
          <Text style={styles.name}>{nombre}</Text>
        </Text>

        {descripcion ? (
          <Text style={styles.description}>{descripcion}</Text>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('EditProfileScreen')}>
            <Text style={styles.descriptionPlaceholder}>
              Agrega una descripción
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Opciones */}
      <View style={styles.menuList}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfileScreen')}
          activeOpacity={0.8}
        >
          <View style={styles.menuItemLeft}>
            <Feather name="edit-2" size={18} color={colors.textMuted} />
            <Text style={styles.menuItemText}>Editar perfil</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('SocialProfile', { isOwn: true })}
          activeOpacity={0.8}
        >
          <View style={styles.menuItemLeft}>
            <Feather name="eye" size={18} color={colors.textMuted} />
            <Text style={styles.menuItemText}>Ver mi perfil público</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.8}
        >
          <View style={styles.menuItemLeft}>
            <Feather name="settings" size={18} color={colors.textMuted} />
            <Text style={styles.menuItemText}>Configuración</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </TouchableOpacity>
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
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
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
  description: {
    fontSize: fontSizes.sm,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.sm,
  },
  descriptionPlaceholder: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
    textDecorationLine: 'underline',
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
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
});