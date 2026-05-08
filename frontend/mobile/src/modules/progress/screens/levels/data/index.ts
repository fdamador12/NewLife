import { nivel1 } from './nivel1';
import { nivel2 } from './nivel2';
import { nivel3 } from './nivel3';
import { nivel4 } from './nivel4';
import { nivel5 } from './nivel5';
import { nivel6 } from './nivel6';
import { nivel7 } from './nivel7';
import { nivel8 } from './nivel8';
import { nivel9 } from './nivel9';
import { nivel10 } from './nivel10';
import { nivel11 } from './nivel11';
import { nivel12 } from './nivel12';

export const MODULES_CONTENT: Record<number, Record<number, any>> = {
  1: nivel1,
  2: nivel2,
  3: nivel3,
  4: nivel4,
  5: nivel5,
  6: nivel6,
  7: nivel7,
  8: nivel8,
  9: nivel9,
  10: nivel10,
  11: nivel11,
  12: nivel12,
};

export type { ModuleContent, StepType, LevelContent } from './types';