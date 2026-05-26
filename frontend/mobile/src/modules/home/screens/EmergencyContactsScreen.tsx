import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Linking, Modal, TextInput, ActivityIndicator, Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { getContacts, createContact, updateContact, deleteContact } from '../../../services/authService';
import {
  getGuestContacts,
  createGuestContact,
  updateGuestContact,
  deleteGuestContact,
  isGuestMode,
} from '../../../services/guestService';
import FieldError from '../../../feedback/FieldError';
import { useToast } from '../../../feedback/ToastContext';
import { useConfirm } from '../../../feedback/ConfirmContext';
import { analytics, EVENT_TYPES, CONTACT_METHODS } from '../../../services/analytics';

type Contact = {
  contacto_id?: string;
  id?: string;
  nombre: string;
  telefono: string;
};

export default function EmergencyContactsScreen({ navigation }: any) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const { showToast } = useToast();
  const { showConfirm } = useConfirm();

  useEffect(() => {
    analytics.track(EVENT_TYPES.EMERGENCY_CONTACTS_VIEWED, { source: 'sos' });
  }, []);

  useEffect(() => {
    fetchContacts();
  }, []);

  // ✅ Detectar altura exacta del teclado
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const guest = await isGuestMode();
      if (guest) {
        const data = await getGuestContacts();
        setContacts(data);
      } else {
        const data = await getContacts();
        setContacts(Array.isArray(data) ? data : data.rows || []);
      }
    } catch (e) {
      console.log('Error obteniendo contactos:', e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (contact?: Contact) => {
    setNameError('');
    setPhoneError('');
    if (contact) {
      setEditingContact(contact);
      setName(contact.nombre);
      setPhone(contact.telefono ? String(contact.telefono) : '');
    } else {
      setEditingContact(null);
      setName('');
      setPhone('');
    }
    setIsClosing(false);
    setShowModal(true);
  };

  // ✅ Cierre suave
  const closeModal = () => {
    Keyboard.dismiss();
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, 300);
  };

  const saveContact = async () => {
    Keyboard.dismiss();
    setNameError('');
    setPhoneError('');

    let valid = true;

    if (!name.trim()) {
      setNameError('El nombre es obligatorio');
      valid = false;
    }

    if (!phone.trim()) {
      setPhoneError('El número de teléfono es obligatorio');
      valid = false;
    } else if (phone.length !== 10) {
      setPhoneError('Debe tener exactamente 10 dígitos');
      valid = false;
    } else {
      const isDuplicate = contacts.some((c) => {
        const isSelf = editingContact ? (
          (editingContact.contacto_id !== undefined && c.contacto_id === editingContact.contacto_id) ||
          (editingContact.id !== undefined && c.id === editingContact.id)
        ) : false;
        return !isSelf && String(c.telefono) === String(phone);
      });
      if (isDuplicate) {
        setPhoneError('Este número ya está registrado en tus contactos');
        valid = false;
      }
    }

    if (!valid) return;

    try {
      const guest = await isGuestMode();
      if (guest) {
        if (editingContact) {
          await updateGuestContact(editingContact.contacto_id || editingContact.id || '', name, phone);
        } else {
          await createGuestContact(name, phone);
        }
      } else {
        if (editingContact) {
          await updateContact(editingContact.contacto_id || '', name, phone);
        } else {
          await createContact(name, phone);
        }
      }
      fetchContacts();
      showToast(editingContact ? 'Contacto actualizado' : 'Contacto guardado', 'success');
      closeModal();
    } catch (e: any) {
      console.log('Error guardando contacto:', e);
      showToast(e.response?.data?.message || 'Error al guardar el contacto. Intenta de nuevo.', 'error');
    }
  };

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Eliminar contacto',
      message: '¿Seguro que quieres eliminarlo? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      destructive: true,
      onConfirm: async () => {
        try {
          const guest = await isGuestMode();
          if (guest) {
            await deleteGuestContact(id);
          } else {
            await deleteContact(id);
          }
          fetchContacts();
          showToast('Contacto eliminado', 'success');
        } catch (e) {
          console.log('Error eliminando contacto:', e);
          showToast('No se pudo eliminar el contacto. Intenta de nuevo.', 'error');
        }
      },
    });
  };

  const callContact = async (phone: string) => {
    await analytics.track(EVENT_TYPES.EMERGENCY_CONTACT_USED, {
      contact_method: CONTACT_METHODS.PHONE,
    });
    Linking.openURL(`tel:${phone}`);
  };

  const smsContact = async (phone: string) => {
    await analytics.track(EVENT_TYPES.EMERGENCY_CONTACT_USED, {
      contact_method: CONTACT_METHODS.SMS,
    });
    Linking.openURL(`sms:${phone}`);
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('SOS')}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contactos de emergencia</Text>
        <TouchableOpacity onPress={() => openModal()}>
          <Icon name="plus" size={24} color={'#FF6B6B'} />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Accede rápidamente a tus <Text style={styles.subtitleBold}>contactos clave.</Text>
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {contacts.length === 0 ? (
            <Text style={styles.emptyText}>No tienes contactos de emergencia aún.</Text>
          ) : (
            contacts.map((contact) => (
              <View key={contact.contacto_id || contact.id} style={styles.card}>
                <View style={styles.cardInfo}>
                  <Text style={styles.contactName}>{contact.nombre}</Text>
                  <Text style={styles.contactPhone}>{contact.telefono}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => callContact(contact.telefono)}>
                    <Icon name="phone" size={18} color={'#FF6B6B'} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={() => smsContact(contact.telefono)}>
                    <Icon name="message-circle" size={18} color={'#FF6B6B'} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => openModal(contact)}>
                    <Icon name="edit-2" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => handleDelete(contact.contacto_id || contact.id || '')}>
                    <Icon name="trash-2" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={showModal} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.modalOverlay}>

          {/* ✅ Backdrop — toca para cerrar modal */}
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeModal}
          />

          {/* ✅ Modal sube exactamente la altura del teclado */}
          <View style={[styles.modalCard, { marginBottom: keyboardHeight }]}>

            {/* ✅ Toca dentro para cerrar teclado sin cerrar modal */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={Keyboard.dismiss}
              style={styles.modalInner}
            >
              <Text style={styles.modalTitle}>
                {editingContact ? 'Editar contacto' : 'Nuevo contacto'}
              </Text>

              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre..."
                  placeholderTextColor={colors.border}
                  value={name}
                  onChangeText={(t) => { setName(t); if (nameError) setNameError(''); }}
                />
                <FieldError message={nameError} />
              </View>

              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Número telefónico..."
                  placeholderTextColor={colors.border}
                  value={phone}
                  onChangeText={(t) => {
                    const cleaned = t.replace(/[^0-9]/g, '');
                    setPhone(cleaned);
                    if (phoneError) setPhoneError('');
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                <FieldError message={phoneError} />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancel} onPress={closeModal}>
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSave} onPress={saveContact}>
                  <Text style={styles.modalSaveText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  subtitleBold: {
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSizes.md,
    marginTop: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    gap: spacing.md,
  },
  cardInfo: { gap: 4 },
  contactName: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  contactPhone: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#FF6B6B',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonSecondary: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 52,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.md * 2,
    borderTopRightRadius: borderRadius.md * 2,
  },
  modalInner: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    fontWeight: '600',
  },
  modalSave: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: fontSizes.md,
    color: colors.white,
    fontWeight: '700',
  },
});