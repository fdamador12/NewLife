export class PetEntity {
  _id: string;
  usuario_id: string;
  xp: number;
  selected_form: string;
  unlocked_forms: string[];
  last_actions: Record<string, string>;
  updated_at: string;
}