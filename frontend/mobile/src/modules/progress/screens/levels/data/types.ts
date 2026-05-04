export type StepType = 'intro' | 'mascot_choice' | 'mascot_open' | 'phrase' | 'complete_sentence';

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
};

export type LevelContent = Record<number, ModuleContent>;