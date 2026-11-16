import { FormEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { CATEGORY_META, SUBJECT_COLOR_THEMES } from '../constants/studyTheme';
import {
  CreateSubjectDTO,
  StudyCategory,
  Subject,
  SubjectColor,
  UpdateSubjectDTO,
} from '../types/study';

interface SubjectModalProps {
  isOpen: boolean;
  editingSubject: Subject | null;
  onClose: () => void;
  onSaveCreate: (dto: CreateSubjectDTO) => void;
  onSaveEdit: (id: string, dto: UpdateSubjectDTO) => void;
}

const GOAL_PRESETS = [4, 6, 8, 10, 12];
const CATEGORIES: StudyCategory[] = ['faculdade', 'python', 'logica', 'outros'];
const COLORS: SubjectColor[] = ['emerald', 'cyan', 'violet', 'amber', 'rose', 'blue'];

export function SubjectModal({
  isOpen,
  editingSubject,
  onClose,
  onSaveCreate,
  onSaveEdit,
}: SubjectModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<StudyCategory>('python');
  const [color, setColor] = useState<SubjectColor>('emerald');
  const [weeklyGoalHours, setWeeklyGoalHours] = useState<number>(6);
  const [topicsInput, setTopicsInput] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (editingSubject) {
      setName(editingSubject.name);
      setCategory(editingSubject.category);
      setColor(editingSubject.color);
      setWeeklyGoalHours(editingSubject.weeklyGoalHours);
      setTopicsInput('');
    } else {
      setName('');
      setCategory('python');
      setColor('emerald');
      setWeeklyGoalHours(6);
      setTopicsInput('');
    }
  }, [isOpen, editingSubject]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSubject) {
      onSaveEdit(editingSubject.id, {
        name,
        category,
        color,
        weeklyGoalHours,
      });
    } else {
      const initialTopics = topicsInput
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);

      onSaveCreate({
        name,
        category,
        color,
        weeklyGoalHours,
        initialTopics,
      });
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="subject-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 id="subject-modal-title" className="text-lg font-semibold text-white">
              {editingSubject ? 'Editar Disciplina / Trilha' : 'Nova Disciplina / Trilha'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Defina sua meta semanal de horas e organize seus tópicos de estudo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="subject-name" className="block text-xs font-medium text-slate-300">
              Nome da disciplina ou trilha
            </label>
            <input
              id="subject-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Cálculo I, Python Assíncrono, Estruturas de Dados..."
              className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="subject-category" className="block text-xs font-medium text-slate-300">
                Categoria
              </label>
              <select
                id="subject-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as StudyCategory)}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_META[cat].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subject-goal" className="block text-xs font-medium text-slate-300">
                Meta semanal (horas)
              </label>
              <input
                id="subject-goal"
                type="number"
                min={1}
                max={80}
                step={1}
                required
                value={weeklyGoalHours}
                onChange={(e) => setWeeklyGoalHours(Math.max(1, Number(e.target.value) || 1))}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 font-mono text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Atalhos de meta semanal */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Sugestões rápidas:</span>
            {GOAL_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setWeeklyGoalHours(preset)}
                className={`rounded-lg border px-2.5 py-1 font-mono text-xs transition-colors ${
                  weeklyGoalHours === preset
                    ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {preset}h
              </button>
            ))}
          </div>

          {/* Seletor de cor */}
          <div>
            <span className="block text-xs font-medium text-slate-300">Cor de destaque</span>
            <div className="mt-2 flex flex-wrap gap-2.5">
              {COLORS.map((itemColor) => {
                const theme = SUBJECT_COLOR_THEMES[itemColor];
                const selected = color === itemColor;
                return (
                  <button
                    key={itemColor}
                    type="button"
                    onClick={() => setColor(itemColor)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                      selected
                        ? 'border-white/40 bg-slate-800 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className={`h-3 w-3 rounded-full ${theme.swatch}`} />
                    {theme.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tópicos iniciais apenas na criação */}
          {!editingSubject && (
            <div>
              <label htmlFor="subject-topics" className="block text-xs font-medium text-slate-300">
                Tópicos iniciais (opcional, separados por vírgula ou linha)
              </label>
              <textarea
                id="subject-topics"
                rows={3}
                value={topicsInput}
                onChange={(e) => setTopicsInput(e.target.value)}
                placeholder={'List Comprehensions\nDecorators\nRecursividade'}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:brightness-110 disabled:opacity-40"
            >
              {editingSubject ? 'Salvar Alterações' : 'Criar Disciplina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
