export const XP_PER_ACTION: Record<string, number> = {
  checkin: 10,
  sober_day: 20,
  module_complete: 15,
};

export const FORM_THRESHOLDS: { form: string; xp: number }[] = [
  { form: 'seed',              xp: 0    },
  { form: 'sprout',            xp: 100  },
  { form: 'moss',              xp: 300  },
  { form: 'flower_lavanda',    xp: 500  },
  { form: 'flower_azucena',    xp: 700  },
  { form: 'flower_baobab',     xp: 900  },
  { form: 'flower_lirio',      xp: 1100 },
  { form: 'flower_crisantemo', xp: 1300 },
];

export function calculateForm(xp: number): string {
  let current = 'seed';
  for (const threshold of FORM_THRESHOLDS) {
    if (xp >= threshold.xp) current = threshold.form;
  }
  return current;
}

export function calculateUnlocked(xp: number): string[] {
  return FORM_THRESHOLDS.filter(t => xp >= t.xp).map(t => t.form);
}

export function calculateLevel(xp: number): number {
  if (xp >= 500) return 4;
  if (xp >= 300) return 3;
  if (xp >= 100) return 2;
  return 1;
}