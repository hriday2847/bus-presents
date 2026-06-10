export interface DivinityStory {
  title: string;
  description: string;
}

export interface DivinityMantra {
  text: string;
  translation: string;
}

export interface DivineSound {
  frequency: number;
  type: OscillatorType;
  label: string;
  description: string;
}

export interface Divinity {
  id: string; // e.g. "bapusa", "mataji", "balaji", "maasa"
  name: string; // e.g. "BAPUSA", "MATAJI"
  title: string; // e.g. "BAPUSA MERE BHAGWAN"
  subtitle: string;
  description: string;
  rating: string;
  duration: string;
  relDate: string;
  apparitionUrl?: string; // Hotlinked overlay image
  backdropUrl: string; // Hotlinked background image
  videoUrl?: string; // Video background if available
  about: string;
  stories: DivinityStory[];
  mantras: DivinityMantra[];
  sound: DivineSound;
}

export interface JournalEntry {
  id: string;
  divinityId: string;
  title: string;
  content: string;
  timestamp: string;
}

export interface MeditationSession {
  id: string;
  divinityId: string;
  durationMinutes: number;
  timestamp: string;
}

export interface DivinityReview {
  id: string;
  divinityId: string;
  user: string;
  stars: number;
  content: string;
  date: string;
}
