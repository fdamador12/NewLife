import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { apiError } from '../../../utils/apiError';
import { createPost, uploadPostImage } from '../../../services/communityService';

function ImagePreview({ uri }: { uri: string }) {
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  useEffect(() => {
    Image.getSize(uri, (w, h) => setAspectRatio(w / h), () => setAspectRatio(1));
  }, [uri]);
  const displayRatio = Math.max(0.5, Math.min(3, aspectRatio));
  return (
    <Image source={{ uri }} style={[styles.imagePreview, { aspectRatio: displayRatio }]} resizeMode="cover" />
  );
}

export default function CreatePostCommunityScreen({ navigation, route }: any) {
  const { community } = route.params;
  const communityName = community.nombre || community.name || '';
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canPublish = body.trim().length > 0;

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
          console.error('[CreatePostCommunity] uploadPostImage fallo:', uploadErr?.message);
          Alert.alert('Error al subir imagen', apiError(uploadErr, 'No se pudo subir la imagen.'));
          setLoading(false);
          return;
        }
      }
      await createPost(community.id, body.trim(), title.trim() || undefined, uploadedUrl);
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
        <View style={styles.communityBadge}>
          <View style={styles.communityDot} />
          <Text style={styles.communityBadgeText}>{communityName}</Text>
        </View>

        <TextInput
          style={styles.titleInput}
          placeholder="Título (opcional)"
          placeholderTextColor={colors.border}
          value={title} onChangeText={setTitle}
          multiline textAlignVertical="top"
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
        disabled={!canPublish || loading}
        onPress={handlePublish}
      >
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.publishButtonText}>Publicar</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  scroll: { paddingHorizontal: spacing.xl, gap: spacing.md },
  communityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.white, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    alignSelf: 'flex-start', elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
  },
  communityDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent },
  communityBadgeText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.text },
  titleInput: { fontSize: fontSizes.xxl, fontWeight: '800', color: colors.text, minHeight: 60, paddingVertical: spacing.sm },
  bodyInput: { fontSize: fontSizes.md, color: colors.textLight, minHeight: 80, lineHeight: 22 },
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
});