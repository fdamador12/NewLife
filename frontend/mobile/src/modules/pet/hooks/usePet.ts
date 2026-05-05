import { usePetContext } from '../context/PetContext';

export function usePet() {
  return usePetContext();
}