import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { apiError } from '../../../utils/apiError';
import { createPost } from '../../../services/communityService';

export default function CreatePostCommunityScreen({ navigation, route }: any) {
  const { community } = route.params;
  const communityName = community.nombre || community.name || '';

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const canPublish = title.trim().length > 0;

  const handlePublish = async () => {
    if (!canPublish) return;
    setLoading(true);
    try {
      await createPost(community.id, body.trim(), title.trim());
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', apiError(err, 'No se pudo publicar.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Comunidad fija */}
        <View style={styles.communityBadge}>
          <View style={styles.communityDot} />
          <Text style={styles.communityBadgeText}>{communityName}</Text>
        </View>

        {/* Título */}
        <TextInput
          style={styles.titleInput}
          placeholder="Escribe un titulo..."
          placeholderTextColor={colors.border}
          value={title}
          onChangeText={setTitle}
          multiline
          textAlignVertical="top"
        />

        {/* Cuerpo */}
        <TextInput
          style={styles.bodyInput}
          placeholder="Añade un cuerpo de texto..."
          placeholderTextColor={colors.border}
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
        />

        {/* Cargar imagen — pendiente */}
        <TouchableOpacity style={styles.imageUpload} disabled>
          <Feather name="image" size={32} color={colors.border} />
          <Text style={styles.imageUploadText}>Cargar imagen</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.publishButton, (!canPublish || loading) && styles.publishButtonDisabled]}
        disabled={!canPublish || loading}
        onPress={handlePublish}
      >
        {loading
          ? <ActivityIndicator color={colors.white} />
          : <Text style={styles.publishButtonText}>Publicar</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  communityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  communityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  communityBadgeText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  titleInput: {
    fontSize: fontSizes.xxl,
    fontWeight: '800',
    color: colors.text,
    minHeight: 60,
    paddingVertical: spacing.sm,
  },
  bodyInput: {
    fontSize: fontSizes.md,
    color: colors.textLight,
    minHeight: 80,
    lineHeight: 22,
  },
  imageUpload: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginTop: spacing.sm,
  },
  imageUploadText: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    fontWeight: '500',
  },
  publishButton: {
    position: 'absolute',
    bottom: 32,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    elevation: 4,
  },
  publishButtonDisabled: { opacity: 0.4 },
  publishButtonText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
});