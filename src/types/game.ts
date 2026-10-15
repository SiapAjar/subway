export type AnimalType = 
  | 'kelinci'
  | 'jerapah'
  | 'kuda'
  | 'katak'
  | 'harimau'
  | 'singa'
  | 'burung'
  | 'monyet'
  | 'babi'
  | 'anjing'
  | 'kucing';

export interface AnimalInfo {
  id: AnimalType;
  name: string;
  emoji: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  description: string;
  perk: string;
}

export interface Question {
  id: string;
  question: string;
  correctAnswer: string;
  options: string[]; // 4 options shuffled
  explanation?: string;
}

export interface TeacherTokenData {
  token: string;
  title: string;
  sheetUrl?: string;
  createdAt: number;
  questions: Question[];
}

export type GameMode = 'individu' | 'battle';

export type GameScreen = 
  | 'home'
  | 'character_select'
  | 'playing_individu'
  | 'playing_battle'
  | 'game_over_individu'
  | 'game_over_battle'
  | 'teacher_dashboard';

export interface PlayerSession {
  name: string;
  character: AnimalType;
  score: number;
  distance: number;
  coins: number;
  lives: number;
  questionsAttempted: number;
  questionsCorrect: number;
}
