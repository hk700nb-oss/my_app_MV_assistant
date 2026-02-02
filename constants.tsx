
import { DimensionConfig } from './types';

export const DIMENSIONS: DimensionConfig[] = [
  { key: 'music', label: '音乐与文本创作', weight: 0.3, color: '#3b82f6', icon: 'fa-music' },
  { key: 'tech', label: 'AIGC 视觉技术', weight: 0.3, color: '#8b5cf6', icon: 'fa-microchip' },
  { key: 'fusion', label: '视听融合深度', weight: 0.2, color: '#10b981', icon: 'fa-wave-square' },
  { key: 'creative', label: '叙事、创意与过程', weight: 0.2, color: '#f59e0b', icon: 'fa-lightbulb' },
];

export const WEIGHT_MUSIC = 0.3;
export const WEIGHT_TECH = 0.3;
export const WEIGHT_FUSION = 0.2;
export const WEIGHT_CREATIVE = 0.2;

export const GEMINI_MODEL = 'gemini-3-pro-preview';
