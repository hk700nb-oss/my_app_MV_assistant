
export interface ReviewScores {
  music: number;
  tech: number;
  fusion: number;
  creative: number;
}

export interface ReviewDetails {
  musicDesc: string;
  techDesc: string;
  fusionDesc: string;
  creativeDesc: string;
  overallSuggestion: string;
}

export interface ReviewResult {
  id: string;
  fileName: string;
  scores: ReviewScores;
  totalScore: number;
  details: ReviewDetails;
  timestamp: number;
}

export interface DimensionConfig {
  key: keyof ReviewScores;
  label: string;
  weight: number;
  color: string;
  icon: string;
}
