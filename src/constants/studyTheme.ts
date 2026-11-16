import { StudyCategory, SubjectColor } from '../types/study';

export interface CategoryMeta {
  label: string;
  shortLabel: string;
  badgeClass: string;
}

export const CATEGORY_META: Record<StudyCategory, CategoryMeta> = {
  faculdade: {
    label: 'Faculdade',
    shortLabel: 'Faculdade',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
  python: {
    label: 'Python',
    shortLabel: 'Python',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  logica: {
    label: 'Lógica & Algoritmos',
    shortLabel: 'Lógica',
    badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  },
  outros: {
    label: 'Outros Estudos',
    shortLabel: 'Outros',
    badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  },
};

export interface SubjectColorTheme {
  label: string;
  dot: string;
  bar: string;
  barTrack: string;
  ring: string;
  borderActive: string;
  softBg: string;
  text: string;
  swatch: string;
}

export const SUBJECT_COLOR_THEMES: Record<SubjectColor, SubjectColorTheme> = {
  emerald: {
    label: 'Esmeralda',
    dot: 'bg-emerald-400',
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    barTrack: 'bg-emerald-950/60',
    ring: 'ring-emerald-500/40',
    borderActive: 'border-emerald-500/50 shadow-emerald-500/10',
    softBg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    swatch: 'bg-emerald-500',
  },
  cyan: {
    label: 'Ciano',
    dot: 'bg-cyan-400',
    bar: 'bg-gradient-to-r from-cyan-500 to-sky-400',
    barTrack: 'bg-cyan-950/60',
    ring: 'ring-cyan-500/40',
    borderActive: 'border-cyan-500/50 shadow-cyan-500/10',
    softBg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    swatch: 'bg-cyan-500',
  },
  violet: {
    label: 'Violeta',
    dot: 'bg-violet-400',
    bar: 'bg-gradient-to-r from-violet-500 to-fuchsia-400',
    barTrack: 'bg-violet-950/60',
    ring: 'ring-violet-500/40',
    borderActive: 'border-violet-500/50 shadow-violet-500/10',
    softBg: 'bg-violet-500/10',
    text: 'text-violet-400',
    swatch: 'bg-violet-500',
  },
  amber: {
    label: 'Âmbar',
    dot: 'bg-amber-400',
    bar: 'bg-gradient-to-r from-amber-500 to-orange-400',
    barTrack: 'bg-amber-950/60',
    ring: 'ring-amber-500/40',
    borderActive: 'border-amber-500/50 shadow-amber-500/10',
    softBg: 'bg-amber-500/10',
    text: 'text-amber-400',
    swatch: 'bg-amber-500',
  },
  rose: {
    label: 'Rosa',
    dot: 'bg-rose-400',
    bar: 'bg-gradient-to-r from-rose-500 to-pink-400',
    barTrack: 'bg-rose-950/60',
    ring: 'ring-rose-500/40',
    borderActive: 'border-rose-500/50 shadow-rose-500/10',
    softBg: 'bg-rose-500/10',
    text: 'text-rose-400',
    swatch: 'bg-rose-500',
  },
  blue: {
    label: 'Azul',
    dot: 'bg-blue-400',
    bar: 'bg-gradient-to-r from-blue-500 to-indigo-400',
    barTrack: 'bg-blue-950/60',
    ring: 'ring-blue-500/40',
    borderActive: 'border-blue-500/50 shadow-blue-500/10',
    softBg: 'bg-blue-500/10',
    text: 'text-blue-400',
    swatch: 'bg-blue-500',
  },
};
