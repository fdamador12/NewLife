import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Modal, Image, ActivityIndicator, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { apiError } from '../../../utils/apiError';
import { createPost, uploadPostImage } from '../../../services/communityService';

/**
 * Vista previa de imagen con aspect ratio REAL (no altura fija).
 * Asi el preview muestra exactamente el recorte que el usuario hizo en
 * el ImagePicker — sin deformar ni cortar.
 *
 * Limita el aspect ratio mostrado a [0.5, 3] para evitar que imagenes
 * super verticales/horizontales se vean ridiculas en el preview.
 */
function ImagePreview({ uri }: { uri: string }) {
  const [aspectRatio, setAspectRatio] = useState<number>(1);

  useEffect(() => {
    Image.getSize(
      uri,
      (w, h) => setAspectRatio(w / h),
      () => setAspectRatio(1),
    );
  }, [uri]);

  const displayRatio = Math.max(0.5, Math.min(3, aspectRatio));

  return (
    <Image
      source={{ uri }}
      style={[styles.imagePreview, { aspectRatio: displayRatio }]}
      resizeMode="cover"
    />
  );
}

export default function CreatePostScreen({ navigation, route }: any) {
  const { communities = [] } = route.params || {};
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [showCommunityPicker, setShowCommunityPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleCommunity = (id: string) => {
    setSelectedCommunities(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const communitiesWithAccess = communities.filter((c: any) => c.tipo_acceso !== 'SOLO_VER');

  const toggleAll = () => {
    const accessibleIds = communitiesWithAccess.map((c: any) => c.id);
    if (selectedCommunities.length === accessibleIds.length) setSelectedCommunities([]);
    else setSelectedCommunities(accessibleIds);
  };

  const selectedNames = communities
    .filter((c: any) => selectedCommunities.includes(c.id))
    .map((c: any) => c.nombre).join(', ');

  const selectedWithAccess = selectedCommunities.filter(id =>
    communitiesWithAccess.some((c: any) => c.id === id)
  );

  const canPublish = body.trim().length > 0 && selectedWithAccess.length > 0;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a tu galería para subir imágenes.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePublish = async () => {
    if (!canPublish) return;
    setLoading(true);
    try {
      let uploadedUrl: string | undefined;
      if (imageUri) {
        try {
          uploadedUrl = await uploadPostImage(imageUri);
        } catch (uploadErr: any) {
          console.error('[CreatePost] uploadPostImage fallo:', uploadErr?.message);
          Alert.alert('Error al subir imagen', apiError(uploadErr, 'No se pudo subir la imagen.'));
          setLoading(false);
          return;
        }
      }
      await Promise.all(
        selectedWithAccess.map(communityId =>
          createPost(communityId, body.trim(), title.trim() || undefined, uploadedUrl)
        )
      );
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', apiError(err, 'No se pudo publicar.'));
    } finally {
      setLoading(false);
    }
  };

  const buttonBottom = Math.max(insets.bottom + 16, 24);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: buttonBottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.communitySelector} onPress={() => setShowCommunityPicker(true)}>
          <View style={styles.communityDot} />
          <Text style={[styles.communitySelectorText, selectedCommunities.length > 0 && styles.communitySelectorTextSelected]}>
            {selectedCommunities.length > 0 ? selectedNames : 'Seleccionar comunidad'}
          </Text>
          <Feather name="chevron-down" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <TextInput
          style={styles.titleInput}
          placeholder="Título (opcional)"
          placeholderTextColor={colors.border}
          value={title} onChangeText={setTitle}
          multiline
        />

        <TextInput
          style={styles.bodyInput}
          placeholder="¿Qué quieres compartir? *"
          placeholderTextColor={colors.border}
          value={body} onChangeText={setBody}
          multiline textAlignVertical="top"
        />

        <TouchableOpacity style={styles.imageUpload} onPress={pickImage} activeOpacity={0.8}>
          {imageUri ? (
            <View>
              {/*
                Preview de imagen con aspect ratio REAL del recorte.
                ImagePreview lee las dimensiones de la imagen recortada y
                la muestra preservando exactamente esa proporcion.
              */}
              <ImagePreview uri={imageUri} />
              <TouchableOpacity
                style={styles.imageRemoveBtn}
                onPress={() => setImageUri(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>Cargar imagen (opcional)</Text>
              <View style={styles.imagePlaceholderIcon}>
                <Feather name="image" size={32} color={colors.border} />
              </View>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.publishButton,
          { bottom: buttonBottom },
          (!canPublish || loading) && styles.publishButtonDisabled,
        ]}
        onPress={handlePublish}
        disabled={!canPublish || loading}
      >
        {loading
          ? <ActivityIndicator color={colors.white} />
          : <Text style={styles.publishButtonText}>Publicar</Text>
        }
      </TouchableOpacity>

      <Modal visible={showCommunityPicker} transparent animationType="slide" statusBarTranslucent>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowCommunityPicker(false)} activeOpacity={1}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) + 24 }]}>
            <Text style={styles.modalTitle}>Publicar en</Text>

            <TouchableOpacity style={styles.communityOption} onPress={toggleAll}>
              <View style={[styles.checkbox,
              selectedCommunities.length === communitiesWithAccess.length && communitiesWithAccess.length > 0 && styles.checkboxSelected]}>
                {selectedCommunities.length === communitiesWithAccess.length && communitiesWithAccess.length > 0 && (
                  <Feather name="check" size={12} color={colors.white} />
                )}
              </View>
              <Text style={styles.communityOptionText}>Todas mis comunidades</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {communities.map((community: any) => {
              const hasAccess = community.tipo_acceso !== 'SOLO_VER';
              return (
                <TouchableOpacity
                  key={community.id}
                  style={[styles.communityOption, !hasAccess && styles.communityOptionDisabled]}
                  onPress={() => hasAccess && toggleCommunity(community.id)}
                  activeOpacity={hasAccess ? 0.7 : 1}
                >
                  <View style={[styles.checkbox,
                  selectedCommunities.includes(community.id) && styles.checkboxSelected,
                  !hasAccess && styles.checkboxDisabled]}>
                    {selectedCommunities.includes(community.id) && (
                      <Feather name="check" size={12} color={colors.white} />
                    )}
                  </View>
                  <View style={styles.communityOptionInfo}>
                    <Feather name="users" size={16} color={hasAccess ? colors.textMuted : colors.border} />
                    <View>
                      <Text style={[styles.communityOptionText, !hasAccess && styles.communityOptionTextDisabled]}>
                        {community.nombre}
                      </Text>
                      {!hasAccess && <Text style={styles.noAccessText}>Solo lectura</Text>}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.modalConfirmButton} onPress={() => setShowCommunityPicker(false)}>
              <Text style={styles.modalConfirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  scroll: { paddingHorizontal: spacing.xl, gap: spacing.md },
  communitySelector: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.white, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border, elevation: 1,
  },
  communityDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  communitySelectorText: { fontSize: fontSizes.sm, color: colors.textMuted, fontWeight: '500' },
  communitySelectorTextSelected: { color: colors.text, fontWeight: '600' },
  titleInput: { fontSize: fontSizes.xxl, fontWeight: '800', color: colors.text, paddingVertical: spacing.sm },
  bodyInput: { fontSize: fontSizes.md, color: colors.textLight, minHeight: 80, lineHeight: 24 },
  imageUpload: {
    backgroundColor: colors.white, borderRadius: borderRadius.md, overflow: 'hidden',
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3,
  },
  imagePlaceholder: { padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  imagePlaceholderText: { fontSize: fontSizes.md, color: colors.textMuted, fontWeight: '500' },
  imagePlaceholderIcon: {
    width: 80, height: 80, backgroundColor: '#F0F0F0',
    borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center',
  },
  // Preview: ancho 100%, alto calculado por aspectRatio dinamico
  imagePreview: { width: '100%', borderRadius: borderRadius.md, backgroundColor: '#E8E8E8' },
  imageRemoveBtn: {
    position: 'absolute', top: 8, right: 8, width: 30, height: 30,
    borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  publishButton: {
    position: 'absolute', left: spacing.xl, right: spacing.xl,
    backgroundColor: colors.primary, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, alignItems: 'center', elevation: 4,
  },
  publishButtonDisabled: { opacity: 0.4 },
  publishButtonText: { color: colors.white, fontSize: fontSizes.lg, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: spacing.xl, paddingHorizontal: spacing.xl, gap: spacing.md,
  },
  modalTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  communityOption: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  communityOptionInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  communityOptionText: { fontSize: fontSizes.md, color: colors.text, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F0F0F0' },
  modalConfirmButton: {
    backgroundColor: colors.primary, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm,
  },
  modalConfirmText: { color: colors.white, fontSize: fontSizes.md, fontWeight: '700' },
  communityOptionDisabled: { opacity: 0.5 },
  checkboxDisabled: { backgroundColor: '#E0E0E0', borderColor: '#E0E0E0' },
  communityOptionTextDisabled: { color: colors.textMuted },
  noAccessText: { fontSize: fontSizes.xs, color: colors.textMuted, marginTop: 2 },
});