import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Share,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../../../constants/theme';
import { Grupo } from '../../../services/gruposService';

interface GroupDetailModalProps {
  visible: boolean;
  grupo: Grupo | null;
  onClose: () => void;
}

export default function GroupDetailModal({
  visible,
  grupo,
  onClose,
}: GroupDetailModalProps) {
  if (!grupo) return null;

  const handleCopyEmail = async (email: string) => {
    try {
      await Share.share({
        message: email,
        title: 'Email del grupo',
      });
    } catch (error) {
      console.error('Error copying email:', error);
    }
  };

  const handleOpenLink = (url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  // ✅ PARSEO MANUAL (sin URL)
  const getDisplayValue = (id: string, value?: string) => {
    if (!value) return '';

    try {
      if (id === 'email') return value;

      // quitar protocolo
      let clean = value.replace(/^https?:\/\//, '');

      // separar dominio y path
      const [domain, ...pathParts] = clean.split('/');

      if (id === 'instagram' || id === 'facebook') {
        return pathParts[0] ? `@${pathParts[0]}` : domain;
      }

      if (id === 'sitio_web' || id === 'comunidad') {
        return domain.replace('www.', '');
      }

      return value;
    } catch {
      return value;
    }
  };

  const liens = [
    {
      id: 'email',
      label: 'Email',
      icon: 'mail',
      value: grupo.email,
      action: () => handleCopyEmail(grupo.email!),
      show: !!grupo.email,
    },
    {
      id: 'sitio_web',
      label: 'Sitio web',
      icon: 'globe',
      value: grupo.sitio_web,
      action: () => handleOpenLink(grupo.sitio_web!),
      show: !!grupo.sitio_web,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: 'instagram',
      value: grupo.instagram,
      action: () => handleOpenLink(grupo.instagram!),
      show: !!grupo.instagram,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: 'facebook',
      value: grupo.facebook,
      action: () => handleOpenLink(grupo.facebook!),
      show: !!grupo.facebook,
    },
    {
      id: 'comunidad',
      label: 'Comunidad',
      icon: 'share-2',
      value: grupo.comunidad_url,
      action: () => handleOpenLink(grupo.comunidad_url!),
      show: !!grupo.comunidad_url,
    },
  ];

  const visibleLinks = liens.filter((link) => link.show);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Enlaces y contacto</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {visibleLinks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="link-2" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>No hay enlaces disponibles</Text>
              </View>
            ) : (
              visibleLinks.map((link) => (
                <TouchableOpacity
                  key={link.id}
                  style={styles.linkButton}
                  onPress={link.action}
                >
                  <View style={styles.linkIconContainer}>
                    <Feather name={link.icon as any} size={20} color={colors.primary} />
                  </View>

                  <View style={styles.linkInfo}>
                    <Text style={styles.linkLabel}>{link.label}</Text>

                    <Text style={styles.linkValue} numberOfLines={1}>
                      {getDisplayValue(link.id, link.value)}
                    </Text>
                  </View>

                  <Feather name="chevron-right" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  modalContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 123, 247, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  linkLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  linkValue: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
  closeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.primary,
  },
});