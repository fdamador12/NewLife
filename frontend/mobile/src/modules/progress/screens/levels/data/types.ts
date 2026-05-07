export type StepType = 'intro' | 'mascot_choice' | 'mascot_open' | 'phrase' | 'complete_sentence' | 'mascot_checklist';

export type PhraseContent = {
  text: string;
  author?: string;
};

export type MascotChoiceContent = {
  question: string;
  options: string[];
};

export type MascotOpenContent = {
  question: string;
};

export type CompleteSentenceContent = {
  prefix: string;
};

export type MascotChecklistContent = {
  question: string;
  options: string[];
};

export type ModuleContent = {
  steps: StepType[];
  intro: {
    title: string;
    description: string;
  };
  mascot_choice?: MascotChoiceContent[];
  mascot_open?: MascotOpenContent[];
  phrase?: PhraseContent[];
  complete_sentence?: CompleteSentenceContent[];
  mascot_checklist?: MascotChecklistContent[];
};

export type LevelContent = Record<number, ModuleContent>;