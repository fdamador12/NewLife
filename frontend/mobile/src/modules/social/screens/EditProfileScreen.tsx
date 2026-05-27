import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Image, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { apiError } from '../../../utils/apiError';
import { getProfile } from '../../../services/authService';
import { uploadAndSetAvatar, removeAvatar } from '../../../services/mediaService';
import { cacheService } from '../../../services/cacheService';
import { CACHE_KEYS } from '../../../services/cacheKeys';
import api from '../../../services/api';

/**
 * Pantalla de edicion de perfil PERSONAL/SOCIAL.
 *
 * Edita solo campos de la tabla `usuarios`:
 *  - Foto de perfil (avatar_url) — sube a MinIO automaticamente al elegir foto
 *  - Descripcion — se guarda con boton dinamico (solo aparece cuando hay cambios)
 *
 * El boton "Guardar" SOLO aparece cuando descripcion fue editada y NO se ha
 * guardado todavia. Esto sigue el patron de Instagram/Discord donde no hay
 * botones flotantes innecesarios.
 *
 * Apodo, pronombre, motivo_sobrio y gasto_semanal estan en Configuracion →
 * Mi Informacion (tabla `informacion_personal`).
 */
export default function EditProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [descripcion, setDescripcion] = useState('');
  const [originalDescripcion, setOriginalDescripcion] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Hay cambios sin guardar si la descripcion actual difiere de la original
  const hasUnsavedChanges = descripcion.trim() !== originalDescripcion.trim();

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getProfile();
      const initialDesc = data.descripcion || '';
      setDescripcion(initialDesc);
      setOriginalDescripcion(initialDesc);
      setAvatarUrl(data.avatar_url || null);
    } catch (err) {
      console.log('Error cargando perfil:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => { fetchProfile(); }, [fetchProfile])
  );

  // Si el usuario intenta salir con cambios sin guardar, avisar
  useEffect(() => {
    const beforeRemove = navigation.addListener('beforeRemove', (e: any) => {
      if (!hasUnsavedChanges || saving) return;
      e.preventDefault();
      Alert.alert(
        '¿Descartar cambios?',
        'Tienes cambios en la descripción sin guardar.',
        [
          { text: 'Seguir editando', style: 'cancel' },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      );
    });
    return beforeRemove;
  }, [hasUnsavedChanges, saving, navigation]);

  const invalidateProfileCache = async () => {
    try {
      await cacheService.clear(CACHE_KEYS.PROFILE);
    } catch {
      // ignorar
    }
  };

  /**
   * Abre la galeria, sube la imagen y actualiza el avatar al instante.
   */
  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso requerido',
        'Se necesita acceso a tu galería para cambiar tu foto de perfil.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploadingAvatar(true);
    try {
      const newUrl = await uploadAndSetAvatar(result.assets[0].uri);
      setAvatarUrl(newUrl);
      await invalidateProfileCache();
    } catch (err: any) {
      Alert.alert(
        'Error',
        `No se pudo actualizar tu foto.\n\nDetalle: ${err?.message || 'Error desconocido'}`,
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    Alert.alert(
      '¿Quitar foto de perfil?',
      'Volverás al avatar por defecto.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: async () => {
            setUploadingAvatar(true);
            try {
              await removeAvatar();
              setAvatarUrl(null);
              await invalidateProfileCache();
            } catch (err: any) {
              Alert.alert('Error', apiError(err, 'No se pudo quitar la foto.'));
            } finally {
              setUploadingAvatar(false);
            }
          },
        },
      ],
    );
  };

  /**
   * Persiste solo la descripcion (el avatar ya se guardo solo al subir).
   */
  const handleSave = async () => {
    if (!hasUnsavedChanges) return;
    setSaving(true);
    try {
      await api.patch('/user/profile', {
        descripcion: descripcion.trim(),
      });
      setOriginalDescripcion(descripcion.trim());
      await invalidateProfileCache();
    } catch (err: any) {
      Alert.alert('Error', apiError(err, 'No se pudo guardar.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 16);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 40) + spacing.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar perfil</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: hasUnsavedChanges ? 100 + bottomInset : bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handlePickAvatar}
            activeOpacity={0.85}
            disabled={uploadingAvatar}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Feather name="user" size={48} color={colors.white} />
              </View>
            )}

            {uploadingAvatar && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color={colors.white} size="large" />
              </View>
            )}

            {!uploadingAvatar && (
              <View style={styles.avatarEditBadge}>
                <Feather name="camera" size={14} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.avatarHint}>Toca la foto para cambiarla</Text>

          {avatarUrl && !uploadingAvatar && (
            <TouchableOpacity onPress={handleRemoveAvatar}>
              <Text style={styles.removeAvatarText}>Quitar foto</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.textArea}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Cuéntanos algo sobre ti..."
          placeholderTextColor={colors.border}
          multiline
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.charCount}>{descripcion.length}/500</Text>

        <Text style={styles.helperText}>
          Tu apodo, pronombre y otros datos personales puedes editarlos en{' '}
          <Text style={styles.helperTextBold}>Configuración → Mi información</Text>.
        </Text>
      </ScrollView>

      {/* Boton "Guardar" solo aparece cuando hay cambios sin guardar */}
      {hasUnsavedChanges && (
        <View style={[styles.saveButtonContainer, { paddingBottom: bottomInset }]}>
          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.saveButtonText}>Guardar cambios</Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const AVATAR_SIZE = 120;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  scroll: { paddingHorizontal: spacing.xl },

  avatarSection: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#F0F0F0',
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  avatarHint: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  removeAvatarText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontWeight: '600',
    textDecorationLine: 'underline',
    paddingVertical: spacing.xs,
  },

  label: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  textArea: {
    backgroundColor: '#F0F0F0',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSizes.md,
    color: colors.text,
    height: 140,
  },
  charCount: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xl,
    lineHeight: 20,
    textAlign: 'center',
  },
  helperTextBold: {
    fontWeight: '700',
    color: colors.text,
  },

  saveButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    elevation: 4,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
});