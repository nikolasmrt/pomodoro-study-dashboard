import { useState } from 'react';
import { BarChart3, CheckCircle2, Columns3, LayoutList } from 'lucide-react';
import { SUBJECT_COLOR_THEMES } from '../constants/studyTheme';
import { Subject } from '../types/study';
import { calculateHoursProgress, formatHoursLabel, minutesToHours } from '../utils/studyCalculations';

interface WeeklyComparisonChartProps {
  subjects: Subject[];
  selectedSubjectId: string;
  onSelectSubject: (subjectId: string) => void;
}

type ChartLayout = 'columns' | 'bars';

export function WeeklyComparisonChart({
  subjects,
  selectedSubjectId,
  onSelectSubject,
}: WeeklyComparisonChartProps) {
  const [layout, setLayout] = useState<ChartLayout>('columns');

  const totalPlanned = subjects.reduce((acc, s) => acc + s.weeklyGoalHours, 0);
  const totalStudied = minutesToHours(
    subjects.reduce((acc, s) => acc + s.studiedMinutesThisWeek, 0),
  );
  const deltaHours = Number((totalStudied - totalPlanned).toFixed(1));

  const maxHours = Math.max(
    4,
    ...subjects.map((subject) =>
      Math.max(subject.weeklyGoalHours, minutesToHours(subject.studiedMinutesThisWeek)),
    ),
  );
  const chartCeiling = Math.ceil(maxHours / 2) * 2;
  const gridTicks = [chartCeiling, Math.round(chartCeiling / 2), 0];

  return (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-900/75 p-5 shadow-lg shadow-black/20 backdrop-blur-md sm:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-white sm:text-lg">
              Horas Planejadas vs. Horas Realizadas
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Comparativo semanal por disciplina •{' '}
            {deltaHours >= 0 ? (
              <span className="font-medium text-emerald-400">
                Meta semanal superada em +{formatHoursLabel(deltaHours)}
              </span>
            ) : (
              <span className="font-medium text-amber-300">
                Faltam {formatHoursLabel(Math.abs(deltaHours))} para atingir a meta total
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-slate-600" />
              Planejado
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-r from-cyan-400 to-emerald-400" />
              Realizado
            </span>
          </div>

          <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950/70 p-0.5">
            <button
              type="button"
              onClick={() => setLayout('columns')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                layout === 'columns'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Visualização em colunas"
            >
              <Columns3 className="h-3.5 w-3.5" />
              Colunas
            </button>
            <button
              type="button"
              onClick={() => setLayout('bars')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                layout === 'bars'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Visualização em barras horizontais"
            >
              <LayoutList className="h-3.5 w-3.5" />
              Barras
            </button>
          </div>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center text-center text-sm text-slate-400">
          Cadastre uma disciplina para visualizar o comparativo semanal.
        </div>
      ) : layout === 'columns' ? (
        <div className="mt-6">
          <div className="relative flex gap-3">
            {/* Eixo Y */}
            <div className="flex h-56 flex-col justify-between pt-6 text-right font-mono text-[11px] text-slate-500">
              {gridTicks.map((tick) => (
                <span key={tick} className="leading-none">
                  {tick}h
                </span>
              ))}
            </div>

            {/* Área do Gráfico */}
            <div className="relative flex-1 overflow-x-auto pb-2">
              <div className="relative min-w-[440px]">
                {/* Linhas de grade */}
                <div className="pointer-events-none absolute inset-x-0 top-6 flex h-[200px] flex-col justify-between">
                  {gridTicks.map((tick) => (
                    <div key={tick} className="w-full border-b border-dashed border-slate-800/90" />
                  ))}
                </div>

                {/* Grupos de Colunas */}
                <div
                  className="relative z-10 grid gap-4 px-2"
                  style={{
                    gridTemplateColumns: `repeat(${subjects.length}, minmax(84px, 1fr))`,
                  }}
                >
                  {subjects.map((subject) => {
                    const theme = SUBJECT_COLOR_THEMES[subject.color];
                    const studiedHours = minutesToHours(subject.studiedMinutesThisWeek);
                    const plannedHeightPct = Math.min(
                      100,
                      (subject.weeklyGoalHours / chartCeiling) * 100,
                    );
                    const studiedHeightPct = Math.min(
                      100,
                      (studiedHours / chartCeiling) * 100,
                    );
                    const rawRatio =
                      subject.weeklyGoalHours > 0
                        ? Math.round((studiedHours / subject.weeklyGoalHours) * 100)
                        : 0;
                    const goalAchieved = studiedHours >= subject.weeklyGoalHours;
                    const isSelected = subject.id === selectedSubjectId;

                    return (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => onSelectSubject(subject.id)}
                        className={`group flex flex-col items-center rounded-xl px-1.5 pb-2 text-left transition-colors ${
                          isSelected ? 'bg-slate-800/45' : 'hover:bg-slate-800/25'
                        }`}
                        title={`Clique para vincular "${subject.name}" ao Pomodoro`}
                      >
                        <div className="flex h-56 w-full items-end justify-center gap-2 pt-6">
                          {/* Barra Planejada */}
                          <div className="relative flex h-full w-6 items-end justify-center sm:w-7">
                            <div
                              className="relative w-full rounded-t-md bg-slate-700/80 transition-all duration-500 group-hover:bg-slate-600"
                              style={{ height: `${Math.max(4, plannedHeightPct)}%` }}
                            >
                              <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-slate-400">
                                {formatHoursLabel(subject.weeklyGoalHours)}
                              </span>
                            </div>
                          </div>

                          {/* Barra Realizada */}
                          <div className="relative flex h-full w-6 items-end justify-center sm:w-7">
                            <div
                              className={`relative w-full rounded-t-md transition-all duration-500 ${
                                goalAchieved
                                  ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-md shadow-emerald-500/20'
                                  : theme.bar
                              }`}
                              style={{ height: `${Math.max(4, studiedHeightPct)}%` }}
                            >
                              <span
                                className={`absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] font-semibold ${
                                  goalAchieved ? 'text-emerald-300' : theme.text
                                }`}
                              >
                                {formatHoursLabel(studiedHours)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2.5 flex w-full flex-col items-center text-center">
                          <span className="line-clamp-1 w-full text-xs font-medium text-slate-200">
                            {subject.name}
                          </span>
                          <span
                            className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                              goalAchieved
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {goalAchieved && <CheckCircle2 className="h-3 w-3" />}
                            {rawRatio}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {subjects.map((subject) => {
            const theme = SUBJECT_COLOR_THEMES[subject.color];
            const studiedHours = minutesToHours(subject.studiedMinutesThisWeek);
            const plannedWidthPct = Math.min(100, (subject.weeklyGoalHours / chartCeiling) * 100);
            const studiedWidthPct = Math.min(100, (studiedHours / chartCeiling) * 100);
            const pct = calculateHoursProgress(subject);
            const goalAchieved = studiedHours >= subject.weeklyGoalHours;
            const isSelected = subject.id === selectedSubjectId;

            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => onSelectSubject(subject.id)}
                className={`w-full rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? 'border-cyan-500/40 bg-slate-800/50'
                    : 'border-slate-800/70 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${theme.dot}`} />
                    <span className="truncate text-sm font-medium text-slate-100">
                      {subject.name}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 font-mono text-xs">
                    <span className={goalAchieved ? 'font-semibold text-emerald-300' : theme.text}>
                      {formatHoursLabel(studiedHours)}
                    </span>
                    <span className="text-slate-500">/</span>
                    <span className="text-slate-400">
                      {formatHoursLabel(subject.weeklyGoalHours)}
                    </span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                        goalAchieved
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-[11px] text-slate-400">Planejado</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-800/80">
                      <div
                        className="h-full rounded-full bg-slate-600 transition-all duration-500"
                        style={{ width: `${Math.max(2, plannedWidthPct)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-[11px] text-slate-400">Realizado</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-800/80">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          goalAchieved
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : theme.bar
                        }`}
                        style={{ width: `${studiedHours > 0 ? Math.max(2, studiedWidthPct) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
