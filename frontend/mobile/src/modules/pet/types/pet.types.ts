export type PetForm =
  | 'seed'
  | 'sprout'
  | 'moss'
  | 'flower_lavanda'
  | 'flower_azucena'
  | 'flower_baobab'
  | 'flower_lirio'
  | 'flower_crisantemo';

export interface PetState {
  xp: number;
  level: number;
  form: PetForm;
  selected_form: PetForm;
  unlocked_forms: PetForm[];
}

export interface AddXpResponse {
  xp: number;
  xp_gained: number;
  level: number;
  form: PetForm;
  selected_form: PetForm;
  unlocked_forms: PetForm[];
  new_unlocks: PetForm[];
  evolved: boolean;
}

export type XpAction = 'checkin' | 'sober_day' | 'module_complete';