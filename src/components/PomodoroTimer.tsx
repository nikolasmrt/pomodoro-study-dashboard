import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Coffee,
  FastForward,
  History,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Timer,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { SUBJECT_COLOR_THEMES } from '../constants/studyTheme';
import { CycleFeedback } from '../hooks/usePomodoro';
import { PomodoroDurations, PomodoroMode, StudySession, Subject } from '../types/study';
import {
  formatHoursLabel,
  formatMinutesAsTime,
  formatRelativeTime,
  formatTimerDisplay,
} from '../utils/studyCalculations';

interface PomodoroTimerProps {
  subjects: Subject[];
  selectedSubjectId: string;
  selectedSubject: Subject | null;
  onSelectSubject: (subjectId: string) => void;
  mode: PomodoroMode;
  durations: PomodoroDurations;
  secondsLeft: number;
  progressRatio: number;
  isRunning: boolean;
  isMuted: boolean;
  cyclesCompletedInSession: number;
  lastCompletedBanner: CycleFeedback | null;
  recentSessions: StudySession[];
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSwitchMode: (mode: PomodoroMode) => void;
  onUpdateDurations: (durations: PomodoroDurations) => void;
  onCompleteCycleNow: () => void;
  onToggleMute: () => void;
  onDismissBanner: () => void;
}

const MODE_CONFIG: Record<
  PomodoroMode,
  {
    label: string;
    ringStroke: string;
    badgeClass: string;
    buttonGradient: string;
  }
> = {
  focus: {
    label: 'Modo Foco',
    ringStroke: 'stroke-cyan-400',
    badgeClass: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    buttonGradient: 'from-cyan-400 to-emerald-400 text-slate-950 shadow-cyan-500/20',
  },
  shortBreak: {
    label: 'Pausa Curta',
    ringStroke: 'stroke-emerald-400',
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    buttonGradient: 'from-emerald-400 to-teal-400 text-slate-950 shadow-emerald-500/20',
  },
  longBreak: {
    label: 'Pausa Longa',
    ringStroke: 'stroke-violet-400',
    badgeClass: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
    buttonGradient: 'from-violet-400 to-fuchsia-400 text-slate-950 shadow-violet-500/20',
  },
};

const RING_RADIUS = 88;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function PomodoroTimer({
  subjects,
  selectedSubjectId,
  selectedSubject,
  onSelectSubject,
  mode,
  durations,
  secondsLeft,
  progressRatio,
  isRunning,
  isMuted,
  cyclesCompletedInSession,
  lastCompletedBanner,
  recentSessions,
  onToggleTimer,
  onResetTimer,
  onSwitchMode,
  onUpdateDurations,
  onCompleteCycleNow,
  onToggleMute,
  onDismissBanner,
}: PomodoroTimerProps) {
  const [showSettings, setShowSettings] = useState(false);

  const modeStyle = MODE_CONFIG[mode];
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progressRatio);
  const canRunFocus = mode !== 'focus' || Boolean(selectedSubjectId);
  const activeTheme = selectedSubject ? SUBJECT_COLOR_THEMES[selectedSubject.color] : null;

  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 shadow-xl shadow-black/30 backdrop-blur-md sm:p-6">
        {/* Cabeçalho do Pomodoro */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
              <Timer className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Cronômetro Pomodoro</h2>
              <p className="text-xs text-slate-400">
                {cyclesCompletedInSession} {cyclesCompletedInSession === 1 ? 'ciclo' : 'ciclos'}{' '}
                nesta sessão
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleMute}
              className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200"
              title={isMuted ? 'Ativar alerta sonoro' : 'Silenciar alerta sonoro'}
              aria-label={isMuted ? 'Ativar alerta sonoro' : 'Silenciar alerta sonoro'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setShowSettings((prev) => !prev)}
              className={`rounded-lg border p-2 transition-colors ${
                showSettings
                  ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
              title="Configurar tempos do Pomodoro"
              aria-label="Configurar tempos do Pomodoro"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Configurações rápidas */}
        {showSettings && (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
            <p className="mb-2.5 text-xs font-medium text-slate-300">
              Duração dos ciclos (em minutos)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <label className="block">
                <span className="text-[11px] text-slate-400">Foco</span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={durations.focus}
                  onChange={(e) =>
                    onUpdateDurations({ ...durations, focus: Number(e.target.value) || 1 })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 font-mono text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-[11px] text-slate-400">Pausa Curta</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={durations.shortBreak}
                  onChange={(e) =>
                    onUpdateDurations({
                      ...durations,
                      shortBreak: Number(e.target.value) || 1,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 font-mono text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-[11px] text-slate-400">Pausa Longa</span>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={durations.longBreak}
                  onChange={(e) =>
                    onUpdateDurations({
                      ...durations,
                      longBreak: Number(e.target.value) || 1,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 font-mono text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </label>
            </div>
          </div>
        )}

        {/* Seletor de Matéria Vinculada */}
        <div className="mt-4">
          <label htmlFor="pomodoro-subject-select" className="block text-xs font-medium text-slate-400">
            Matéria vinculada ao ciclo
          </label>
          <select
            id="pomodoro-subject-select"
            value={selectedSubjectId}
            onChange={(e) => onSelectSubject(e.target.value)}
            disabled={subjects.length === 0}
            className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-2.5 text-sm font-medium text-slate-100 transition-colors focus:border-cyan-500 focus:outline-none disabled:opacity-50"
          >
            {subjects.length === 0 ? (
              <option value="">Cadastre uma matéria primeiro</option>
            ) : (
              subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({formatMinutesAsTime(subject.studiedMinutesThisWeek)} /{' '}
                  {formatHoursLabel(subject.weeklyGoalHours)})
                </option>
              ))
            )}
          </select>

          {selectedSubject && activeTheme && (
            <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-950/60 px-3 py-1.5 text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <span className={`h-2 w-2 rounded-full ${activeTheme.dot}`} />
                Progresso atual:
              </span>
              <span className="font-mono font-medium text-slate-200">
                {formatMinutesAsTime(selectedSubject.studiedMinutesThisWeek)} •{' '}
                {selectedSubject.completedPomodoros} ciclos
              </span>
            </div>
          )}
        </div>

        {/* Seletor de Modo */}
        <div className="mt-4 grid grid-cols-3 gap-1.5 rounded-xl border border-slate-800 bg-slate-950/70 p-1">
          <button
            type="button"
            onClick={() => onSwitchMode('focus')}
            className={`rounded-lg py-1.5 text-xs font-medium transition-all ${
              mode === 'focus'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Foco ({durations.focus}m)
          </button>
          <button
            type="button"
            onClick={() => onSwitchMode('shortBreak')}
            className={`rounded-lg py-1.5 text-xs font-medium transition-all ${
              mode === 'shortBreak'
                ? 'bg-slate-800 text-emerald-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pausa ({durations.shortBreak}m)
          </button>
          <button
            type="button"
            onClick={() => onSwitchMode('longBreak')}
            className={`rounded-lg py-1.5 text-xs font-medium transition-all ${
              mode === 'longBreak'
                ? 'bg-slate-800 text-violet-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Longa ({durations.longBreak}m)
          </button>
        </div>

        {/* Relógio Circular SVG */}
        <div className="relative my-6 flex items-center justify-center">
          <svg className="h-52 w-52 -rotate-90 transform" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r={RING_RADIUS}
              fill="transparent"
              strokeWidth="10"
              className="stroke-slate-800/90"
            />
            <circle
              cx="100"
              cy="100"
              r={RING_RADIUS}
              fill="transparent"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              className={`${modeStyle.ringStroke} transition-[stroke-dashoffset] duration-700 ease-linear`}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${modeStyle.badgeClass}`}
            >
              {mode === 'focus' ? <Clock className="h-3 w-3" /> : <Coffee className="h-3 w-3" />}
              {modeStyle.label}
            </span>
            <span className="mt-2 font-mono text-4xl font-bold tracking-tight text-white tabular-nums">
              {formatTimerDisplay(secondsLeft)}
            </span>
            <span className="mt-1 max-w-[140px] truncate text-[11px] text-slate-400">
              {mode === 'focus'
                ? selectedSubject?.name ?? 'Selecione uma matéria'
                : 'Descanse a mente'}
            </span>
          </div>
        </div>

        {/* Controles Principais */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleTimer}
            disabled={!canRunFocus}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-4 py-3 text-sm font-semibold shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${modeStyle.buttonGradient}`}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 fill-current" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                Iniciar {mode === 'focus' ? 'Foco' : 'Pausa'}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onResetTimer}
            className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            title="Reiniciar timer atual"
            aria-label="Reiniciar timer atual"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onCompleteCycleNow}
          disabled={!canRunFocus}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FastForward className="h-3.5 w-3.5" />
          {mode === 'focus'
            ? `Concluir ciclo agora (+${durations.focus} min na matéria)`
            : 'Pular pausa e voltar ao foco'}
        </button>

        {/* Feedback de ciclo concluído */}
        {lastCompletedBanner && (
          <div className="mt-4 flex items-start justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                Ciclo concluído!{' '}
                <strong className="font-semibold text-white">
                  +{lastCompletedBanner.minutes} min
                </strong>{' '}
                somados em <strong className="text-white">{lastCompletedBanner.subjectName}</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={onDismissBanner}
              className="rounded p-0.5 text-emerald-300/70 hover:text-emerald-100"
              aria-label="Fechar aviso"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Histórico Recente de Sessões */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/75 p-5 shadow-lg shadow-black/20 backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-white">Sessões Recentes</h3>
          </div>
          <span className="font-mono text-xs text-slate-400">{recentSessions.length} registros</span>
        </div>

        {recentSessions.length === 0 ? (
          <p className="py-3 text-center text-xs text-slate-500">
            Nenhuma sessão registrada nesta semana ainda.
          </p>
        ) : (
          <ul className="space-y-2">
            {recentSessions.slice(0, 5).map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-800/60 bg-slate-950/50 px-3 py-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-200">{session.subjectName}</p>
                  <p className="text-[11px] text-slate-500">
                    {session.type === 'pomodoro' ? 'Ciclo Pomodoro' : 'Registro manual'} •{' '}
                    {formatRelativeTime(session.completedAt)}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-cyan-500/10 px-2 py-1 font-mono text-[11px] font-semibold text-cyan-300">
                  +{session.durationMinutes}m
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
