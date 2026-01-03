export type Difficulty = "Лесно" | "Средно" | "Трудно";

export interface Exercise {
  id: number;
  name: string;
  bgName: string;
  difficulty: Difficulty;
  categories: string[];
  targetArea: string;
  repetitions: number;
  benefits: string[];
  youtubeId: string;
  steps: string[];
}
