import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';
import { useGrupos } from '../../hooks/useGrupos';
import { Grupo } from '../../services/gruposService';
import GroupDetailModal from './components/GroupDetailModal';
import { analytics, EVENT_TYPES, CONTACT_METHODS } from '../../../../services/analytics';

// Normaliza texto: quita acentos, simbolos y pasa a minusculas
const normalizeText = (text: string) => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .toLowerCase();
};

export default function GroupsScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { grupos, loading, error } = useGrupos();

  // Analytics: trackear vista de la lista de grupos al montar
  useEffect(() => {
    analytics.track(EVENT_TYPES.SUPPORT_GROUP_LIST_VIEWED);
  }, []);

  const normalizedSearch = normalizeText(search);

  const filtered = grupos.filter((g) => {
    const nombre = normalizeText(g.nombre);
    const descripcion = normalizeText(g.descripcion || '');
    const lugar = normalizeText(g.lugar || '');

    return (
      nombre.includes(normalizedSearch) ||
      descripcion.includes(normalizedSearch) ||
      lugar.includes(normalizedSearch)
    );
  });

  // Analytics: trackear llamada a grupo (AWAITED antes de Linking).
  const handleCallPhone = async (grupo: Grupo) => {
    if (grupo.telefonos && grupo.telefonos.length > 0) {
      await analytics.track(EVENT_TYPES.SUPPORT_GROUP_CONTACTED, {
        group_id: grupo.grupo_id,
        contact_method: CONTACT_METHODS.PHONE,
      });
      Linking.openURL(`tel:${grupo.telefonos[0]}`);
    }
  };

  const handleWhatsApp = async (grupo: Grupo) => {
    if (grupo.whatsapp && grupo.whatsapp.length > 0) {
      await analytics.track(EVENT_TYPES.SUPPORT_GROUP_CONTACTED, {
        group_id: grupo.grupo_id,
        contact_method: CONTACT_METHODS.WHATSAPP,
      });
      Linking.openURL(`https://wa.me/${grupo.whatsapp[0]}`);
    }
  };

  // Analytics: trackear apertura del modal de detalle del grupo
  const handleOpenLinks = (grupo: Grupo) => {
    analytics.track(EVENT_TYPES.SUPPORT_GROUP_VIEWED, {
      group_id: grupo.grupo_id,
    });
    setSelectedGrupo(grupo);
    setShowModal(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Fundaciones y grupos</Text>
          <Text style={styles.headerSubtitle}>Listado sugerido por la app.</Text>
        </View>
      </View>

      <View style={styles.searchWrapper}>
        <Feather name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Feather name="alert-circle" size={48} color={colors.textMuted} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather name="inbox" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>
            {search.trim() ? 'No se encontraron grupos' : 'Sin grupos disponibles'}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {filtered.map((grupo) => (
            <View key={grupo.grupo_id} style={styles.groupCard}>
              {/* Fila horizontal: logo cuadrado a la izquierda + texto a la derecha */}
              <View style={styles.cardTopRow}>
                {grupo.logo_url ? (
                  <Image
                    source={{ uri: grupo.logo_url }}
                    style={styles.groupLogo}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.groupLogoPlaceholder}>
                    <Feather name="home" size={28} color={colors.textMuted} />
                  </View>
                )}

                <View style={styles.groupInfo}>
                  <Text style={styles.groupName} numberOfLines={2}>
                    {grupo.nombre}
                  </Text>
                  {grupo.descripcion && (
                    <Text style={styles.groupDescription} numberOfLines={3}>
                      {grupo.descripcion}
                    </Text>
                  )}
                </View>
              </View>

              {/* Ubicacion */}
              {(grupo.lugar || grupo.direccion) && (
                <View style={styles.locationSection}>
                  {grupo.lugar && (
                    <Text style={styles.locationPlace}>{grupo.lugar}</Text>
                  )}
                  {grupo.direccion && (
                    <View style={styles.locationRow}>
                      <Feather name="map-pin" size={14} color={colors.textMuted} />
                      <Text style={styles.locationAddress} numberOfLines={2}>
                        {grupo.direccion}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Acciones */}
              <View style={styles.groupActions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    !grupo.telefonos?.length && styles.actionButtonDisabled,
                  ]}
                  onPress={() => handleCallPhone(grupo)}
                  disabled={!grupo.telefonos?.length}
                >
                  <Feather
                    name="phone"
                    size={20}
                    color={grupo.telefonos?.length ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      !grupo.telefonos?.length && styles.actionButtonTextDisabled,
                    ]}
                  >
                    Llamar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    !grupo.whatsapp?.length && styles.actionButtonDisabled,
                  ]}
                  onPress={() => handleWhatsApp(grupo)}
                  disabled={!grupo.whatsapp?.length}
                >
                  <Feather
                    name="message-circle"
                    size={20}
                    color={grupo.whatsapp?.length ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      !grupo.whatsapp?.length && styles.actionButtonTextDisabled,
                    ]}
                  >
                    WhatsApp
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleOpenLinks(grupo)}
                >
                  <Feather name="link-2" size={20} color={colors.primary} />
                  <Text style={styles.actionButtonText}>Enlaces</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={{ height: spacing.xl }} />
        </ScrollView>
      )}

      <GroupDetailModal
        visible={showModal}
        grupo={selectedGrupo}
        onClose={() => setShowModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingTop: 60, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg,
  },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  headerSubtitle: { fontSize: fontSizes.sm, color: colors.textMuted },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: borderRadius.full, paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm, marginHorizontal: spacing.xl,
    marginBottom: spacing.lg, gap: spacing.sm,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3,
  },
  searchInput: { flex: 1, fontSize: fontSizes.md, color: colors.text },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  errorText: {
    fontSize: fontSizes.md, color: colors.textMuted,
    textAlign: 'center', paddingHorizontal: spacing.xl,
  },
  emptyText: { fontSize: fontSizes.md, color: colors.textMuted, textAlign: 'center' },
  scroll: { paddingHorizontal: spacing.xl, gap: spacing.md },
  groupCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.md,
    padding: spacing.lg, gap: spacing.md,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  // NUEVO: fila superior con logo a la izquierda y texto a la derecha
  cardTopRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  groupLogo: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: '#F0F0F0',
  },
  groupLogoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  groupName: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text },
  groupDescription: { fontSize: fontSizes.sm, color: colors.textMuted, lineHeight: 18 },
  locationSection: {
    gap: spacing.xs, paddingTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: spacing.sm,
  },
  locationPlace: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.text },
  locationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  locationAddress: { flex: 1, fontSize: fontSizes.sm, color: colors.textMuted, lineHeight: 18 },
  groupActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionButton: {
    flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.md, paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md, backgroundColor: '#F8F9FA',
    borderWidth: 1, borderColor: colors.border, gap: spacing.xs,
  },
  actionButtonDisabled: { opacity: 0.4 },
  actionButtonText: { fontSize: fontSizes.xs, fontWeight: '600', color: colors.text },
  actionButtonTextDisabled: { color: colors.textMuted },
});