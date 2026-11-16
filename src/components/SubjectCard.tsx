import { FormEvent, useState } from 'react';
import {
  Check,
  Clock,
  Flame,
  Pencil,
  Play,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { CATEGORY_META, SUBJECT_COLOR_THEMES } from '../constants/studyTheme';
import { Subject } from '../types/study';
import {
  calculateHoursProgress,
  calculateTopicsProgress,
  formatHoursLabel,
  formatMinutesAsTime,
} from '../utils/studyCalculations';

interface SubjectCardProps {
  subject: Subject;
  isSelectedForPomodoro: boolean;
  onSelectForPomodoro: (id: string) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
  onAddManualMinutes: (id: string, minutes: number) => void;
  onAddTopic: (subjectId: string, title: string) => void;
  onToggleTopic: (subjectId: string, topicId: string) => void;
  onDeleteTopic: (subjectId: string, topicId: string) => void;
}

export function SubjectCard({
  subject,
  isSelectedForPomodoro,
  onSelectForPomodoro,
  onEdit,
  onDelete,
  onAddManualMinutes,
  onAddTopic,
  onToggleTopic,
  onDeleteTopic,
}: SubjectCardProps) {
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const theme = SUBJECT_COLOR_THEMES[subject.color];
  const category = CATEGORY_META[subject.category];
  const hoursPercent = calculateHoursProgress(subject);
  const topicsStats = calculateTopicsProgress(subject.topics);

  const handleSubmitTopic = (e: FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    onAddTopic(subject.id, newTopicTitle);
    setNewTopicTitle('');
  };

  const handleDeleteClick = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      window.setTimeout(() => setConfirmingDelete(false), 3000);
      return;
    }
    onDelete(subject.id);
  };

  return (
    <article
      className={`flex flex-col rounded-2xl border bg-slate-900/75 p-5 shadow-lg shadow-black/20 backdrop-blur-md transition-all ${
        isSelectedForPomodoro
          ? `${theme.borderActive} ring-1 ${theme.ring}`
          : 'border-slate-800/80 hover:border-slate-700/80'
      }`}
    >
      {/* Cabeçalho da Matéria */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${category.badgeClass}`}
            >
              {category.label}
            </span>

            {isSelectedForPomodoro && (
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-medium text-cyan-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                Ativa no Pomodoro
              </span>
            )}
          </div>

          <h3 className="mt-2 truncate text-base font-semibold text-white" title={subject.name}>
            {subject.name}
          </h3>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(subject)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
            title="Editar disciplina"
            aria-label={`Editar ${subject.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className={`rounded-lg p-1.5 transition-colors ${
              confirmingDelete
                ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-rose-400'
            }`}
            title={confirmingDelete ? 'Clique novamente para excluir' : 'Excluir disciplina'}
            aria-label={`Excluir ${subject.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Ações rápidas de tempo e foco */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-950/70 px-2 py-1 font-mono text-[11px] text-slate-300">
            <Flame className={`h-3.5 w-3.5 ${theme.text}`} />
            {subject.completedPomodoros} ciclos
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onAddManualMinutes(subject.id, 15)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/70 px-2.5 py-1 font-mono text-[11px] font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            title="Registrar +15 minutos manuais nesta disciplina"
          >
            <Clock className="h-3 w-3 text-slate-400" />
            +15m
          </button>

          <button
            type="button"
            onClick={() => onSelectForPomodoro(subject.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              isSelectedForPomodoro
                ? `${theme.softBg} ${theme.text} ring-1 ${theme.ring}`
                : 'border border-slate-800 bg-slate-950/70 text-slate-200 hover:border-cyan-500/40 hover:text-cyan-300'
            }`}
          >
            <Play className="h-3 w-3 fill-current" />
            {isSelectedForPomodoro ? 'Focando' : 'Focar'}
          </button>
        </div>
      </div>

      {/* Barras de Progresso */}
      <div className="mt-4 space-y-3.5">
        {/* Progresso de Horas */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Meta semanal</span>
            <span className="font-mono text-slate-200">
              <strong className="font-semibold text-white">
                {formatMinutesAsTime(subject.studiedMinutesThisWeek)}
              </strong>{' '}
              / {formatHoursLabel(subject.weeklyGoalHours)}{' '}
              <span className={`ml-1 font-semibold ${hoursPercent >= 100 ? 'text-emerald-400' : theme.text}`}>
                ({hoursPercent}%)
              </span>
            </span>
          </div>
          <div className={`h-2 w-full overflow-hidden rounded-full ${theme.barTrack}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                hoursPercent >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : theme.bar
              }`}
              style={{ width: `${hoursPercent}%` }}
            />
          </div>
        </div>

        {/* Progresso dos Tópicos */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Checklist de tópicos</span>
            <span className="font-mono text-slate-200">
              {topicsStats.completed}/{topicsStats.total} tópicos{' '}
              <span className="ml-1 font-semibold text-emerald-300">
                ({topicsStats.percentage}%)
              </span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${topicsStats.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lista de Tópicos */}
      <div className="mt-4 flex-1">
        {subject.topics.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-800 py-4 text-center text-xs text-slate-500">
            Nenhum tópico adicionado ainda. Crie o primeiro abaixo!
          </p>
        ) : (
          <ul className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
            {subject.topics.map((topic) => (
              <li
                key={topic.id}
                className="group flex items-center justify-between gap-2 rounded-xl border border-slate-800/60 bg-slate-950/50 px-3 py-2 transition-colors hover:border-slate-700/80"
              >
                <button
                  type="button"
                  onClick={() => onToggleTopic(subject.id, topic.id)}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                      topic.completed
                        ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                        : 'border-slate-600 bg-slate-900 group-hover:border-slate-400'
                    }`}
                  >
                    {topic.completed && <Check className="h-3 w-3 stroke-[3]" />}
                  </span>
                  <span
                    className={`truncate text-xs transition-colors sm:text-sm ${
                      topic.completed
                        ? 'text-slate-500 line-through'
                        : 'text-slate-200 group-hover:text-white'
                    }`}
                    title={topic.title}
                  >
                    {topic.title}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteTopic(subject.id, topic.id)}
                  className="rounded p-1 text-slate-500 opacity-0 transition-all hover:bg-slate-800 hover:text-rose-400 group-hover:opacity-100 focus:opacity-100"
                  title="Remover tópico"
                  aria-label={`Remover tópico ${topic.title}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Formulário para novo tópico */}
      <form onSubmit={handleSubmitTopic} className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={newTopicTitle}
          onChange={(e) => setNewTopicTitle(e.target.value)}
          placeholder="Ex: List Comprehensions, Recursividade..."
          className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!newTopicTitle.trim()}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-200 transition-colors hover:border-cyan-500/50 hover:bg-cyan-500/20 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          title="Adicionar tópico"
          aria-label="Adicionar tópico"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </article>
  );
}
