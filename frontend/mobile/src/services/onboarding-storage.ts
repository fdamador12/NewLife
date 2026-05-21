import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_SLIDES_KEY = 'hasCompletedOnboardingSlides';
const ONBOARDING_PROFILE_KEY = 'hasCompletedOnboardingProfile';

/**
 * Marca que el usuario completó los 3 slides informativos
 */
export async function markOnboardingSlidesCompleted(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_SLIDES_KEY, 'true');
}

/**
 * Verifica si el usuario completó los 3 slides informativos
 */
export async function hasCompletedOnboardingSlides(): Promise<boolean> {
  const completed = await AsyncStorage.getItem(ONBOARDING_SLIDES_KEY);
  return completed === 'true';
}

/**
 * Marca que completó los 10 steps (onboarding del perfil)
 */
export async function markOnboardingProfileCompleted(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_PROFILE_KEY, 'true');
}

/**
 * Verifica si completó los 10 steps
 */
export async function hasCompletedOnboardingProfile(): Promise<boolean> {
  const completed = await AsyncStorage.getItem(ONBOARDING_PROFILE_KEY);
  return completed === 'true';
}

/**
 * Resetea el estado de slides
 */
export async function resetOnboardingSlides(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_SLIDES_KEY);
}

/**
 * Resetea el perfil
 */
export async function resetOnboardingProfile(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_PROFILE_KEY);
}