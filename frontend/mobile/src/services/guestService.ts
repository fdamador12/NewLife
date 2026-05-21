import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// ─── Identificación ───────────────────────────────────────────────────────────

export const initGuest = async (): Promise<string> => {
  let guestId = await AsyncStorage.getItem('guestId');
  if (!guestId) {
    guestId = uuidv4();
    await AsyncStorage.multiSet([
      ['guestId', guestId],
      ['isGuest', 'true'],
    ]);
  }
  return guestId;
};

export const isGuestMode = async (): Promise<boolean> => {
  const val = await AsyncStorage.getItem('isGuest');
  return val === 'true';
};

export const getGuestId = async (): Promise<string | null> => {
  return AsyncStorage.getItem('guestId');
};

// ─── Perfil ───────────────────────────────────────────────────────────────────

export const saveGuestProfile = async (profile: object): Promise<void> => {
  const guestId = await getGuestId();
  await AsyncStorage.setItem(`guestProfile_${guestId}`, JSON.stringify(profile));
};

export const getGuestProfile = async (): Promise<any> => {
  const guestId = await getGuestId();
  const raw = await AsyncStorage.getItem(`guestProfile_${guestId}`);
  return raw ? JSON.parse(raw) : {};
};

// ─── Sobriedad ────────────────────────────────────────────────────────────────

export const saveGuestSobrietyStart = async (lastConsumeDate?: string): Promise<void> => {
  const guestId = await getGuestId();
  const existing = await AsyncStorage.getItem(`guestSobriety_${guestId}`);
  if (!existing) {
    const startDate = lastConsumeDate ? new Date(lastConsumeDate).toISOString() : new Date().toISOString();
    await AsyncStorage.setItem(
      `guestSobriety_${guestId}`,
      JSON.stringify({ startDate })
    );
  }
};

export const getGuestSobrietyTime = async (): Promise<any> => {
  const guestId = await getGuestId();
  const raw = await AsyncStorage.getItem(`guestSobriety_${guestId}`);
  if (!raw) return { contador: { dias: 0, horas: 0, minutos: 0 } };

  const { startDate } = JSON.parse(raw);
  const fechaUltimoConsumo = new Date(startDate);
  const ahora = new Date();
  const ahoraCol = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
  const diffMs = Math.max(0, ahoraCol.getTime() - fechaUltimoConsumo.getTime());
  const totalMinutos = Math.floor(diffMs / (1000 * 60));
  const totalHoras = Math.floor(totalMinutos / 60);
  const dias = Math.floor(totalHoras / 24);
  const horas = totalHoras % 24;
  const minutos = totalMinutos % 60;

  return { contador: { dias, horas, minutos } };
};

// ─── Contactos ────────────────────────────────────────────────────────────────

export const getGuestContacts = async (): Promise<any[]> => {
  const guestId = await getGuestId();
  const raw = await AsyncStorage.getItem(`guestContacts_${guestId}`);
  return raw ? JSON.parse(raw) : [];
};

export const createGuestContact = async (nombre: string, telefono: string): Promise<any> => {
  const guestId = await getGuestId();
  const contacts = await getGuestContacts();
  const newContact = { id: uuidv4(), nombre, telefono };
  contacts.push(newContact);
  await AsyncStorage.setItem(`guestContacts_${guestId}`, JSON.stringify(contacts));
  return newContact;
};

export const updateGuestContact = async (id: string, nombre: string, telefono: string): Promise<any> => {
  const guestId = await getGuestId();
  const contacts = await getGuestContacts();
  const updated = contacts.map((c: any) => c.id === id ? { ...c, nombre, telefono } : c);
  await AsyncStorage.setItem(`guestContacts_${guestId}`, JSON.stringify(updated));
  return updated.find((c: any) => c.id === id);
};

export const deleteGuestContact = async (id: string): Promise<void> => {
  const guestId = await getGuestId();
  const contacts = await getGuestContacts();
  const filtered = contacts.filter((c: any) => c.id !== id);
  await AsyncStorage.setItem(`guestContacts_${guestId}`, JSON.stringify(filtered));
};

// ─── Onboarding status ────────────────────────────────────────────────────────

export const getGuestOnboardingStatus = async (): Promise<{ completed: boolean }> => {
  const guestId = await getGuestId();
  const raw = await AsyncStorage.getItem(`guestProfile_${guestId}`);
  const profile = raw ? JSON.parse(raw) : {};
  return { completed: !!profile.moment_motiv };
};

// ─── Tour ─────────────────────────────────────────────────────────────────────

export const isGuestTourCompleted = async (): Promise<boolean> => {
  const guestId = await getGuestId();
  const val = await AsyncStorage.getItem(`tourCompleted_guest_${guestId}`);
  return val === 'true';
};

export const markGuestTourCompleted = async (): Promise<void> => {
  const guestId = await getGuestId();
  await AsyncStorage.setItem(`tourCompleted_guest_${guestId}`, 'true');
};

// ─── Migración ────────────────────────────────────────────────────────────────

export const getGuestDataForMigration = async (): Promise<any> => {
  const guestId = await getGuestId();
  const profileRaw = await AsyncStorage.getItem(`guestProfile_${guestId}`);
  const sobrietyRaw = await AsyncStorage.getItem(`guestSobriety_${guestId}`);
  const contactsRaw = await AsyncStorage.getItem(`guestContacts_${guestId}`);

  return {
    guestId,
    profile: profileRaw ? JSON.parse(profileRaw) : {},
    sobriety: sobrietyRaw ? JSON.parse(sobrietyRaw) : null,
    contacts: contactsRaw ? JSON.parse(contactsRaw) : [],
  };
};

export const clearGuestData = async (): Promise<void> => {
  const guestId = await getGuestId();
  const keys = await AsyncStorage.getAllKeys();
  const guestKeys = keys.filter(k => k.includes(guestId!) || k === 'isGuest' || k === 'guestId');
  await AsyncStorage.multiRemove(guestKeys);
};

export const markGuestProfileCompleted = async (): Promise<void> => {
  const guestId = await getGuestId();
  await AsyncStorage.setItem(`guestProfileCompleted_${guestId}`, 'true');
};

export const hasGuestCompletedProfile = async (): Promise<boolean> => {
  const guestId = await getGuestId();
  const val = await AsyncStorage.getItem(`guestProfileCompleted_${guestId}`);
  return val === 'true';
};