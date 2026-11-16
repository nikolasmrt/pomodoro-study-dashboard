import { CheckSquare, Clock, Flame, Target } from 'lucide-react';
import { DashboardMetrics } from '../types/study';
import { formatHoursLabel, formatMinutesAsTime } from '../utils/studyCalculations';

interface KpiOverviewProps {
  metrics: DashboardMetrics;
  totalSubjects: number;
}

export function KpiOverview({ metrics, totalSubjects }: KpiOverviewProps) {
  const focusTimeFormatted = formatMinutesAsTime(metrics.totalPomodoroCycles * 25);

  return (
    <section aria-label="Resumo semanal" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-2xl border border-slate-800/80 bg-slate-900/75 p-5 shadow-lg shadow-black/20 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Horas na Semana
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-white">
                {formatHoursLabel(metrics.totalStudiedHours)}
              </span>
              <span className="text-xs text-slate-400">
                / {formatHoursLabel(metrics.totalPlannedHours)} planejadas
              </span>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Progresso da meta</span>
            <span className="font-mono font-semibold text-cyan-300">
              {metrics.hoursCompletionRate}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${metrics.hoursCompletionRate}%` }}
            />
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-800/80 bg-slate-900/75 p-5 shadow-lg shadow-black/20 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Tópicos Concluídos
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-white">
                {metrics.topicsCompletionRate}%
              </span>
              <span className="text-xs text-slate-400">
                ({metrics.completedTopics}/{metrics.totalTopics} itens)
              </span>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
            <CheckSquare className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Avanço no conteúdo</span>
            <span className="font-mono font-semibold text-emerald-300">
              {metrics.completedTopics} feitos
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${metrics.topicsCompletionRate}%` }}
            />
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-800/80 bg-slate-900/75 p-5 shadow-lg shadow-black/20 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Ciclos Pomodoro
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-white">
                {metrics.totalPomodoroCycles}
              </span>
              <span className="text-xs text-slate-400">ciclos completos</span>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
            <Flame className="h-5 w-5" />
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Equivalente a{' '}
          <span className="font-mono font-semibold text-violet-300">
            {focusTimeFormatted}
          </span>{' '}
          em blocos de foco profundo.
        </p>
      </article>

      <article className="rounded-2xl border border-slate-800/80 bg-slate-900/75 p-5 shadow-lg shadow-black/20 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Matérias no Ritmo
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-white">
                {metrics.subjectsOnTrackCount}
              </span>
              <span className="text-xs text-slate-400">
                de {totalSubjects} {totalSubjects === 1 ? 'disciplina' : 'disciplinas'}
              </span>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
            <Target className="h-5 w-5" />
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Critério: disciplinas com{' '}
          <span className="font-mono font-semibold text-amber-300">≥ 60%</span> da meta
          semanal cumprida.
        </p>
      </article>
    </section>
  );
}
