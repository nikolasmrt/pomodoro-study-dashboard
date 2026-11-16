import { useState } from 'react';
import { BookOpenCheck, Plus, RotateCcw, RefreshCw, Sparkles } from 'lucide-react';

interface HeaderProps {
  totalSubjects: number;
  onOpenCreateModal: () => void;
  onRestoreDemo: () => void;
  onResetWeek: () => void;
}

export function Header({
  totalSubjects,
  onOpenCreateModal,
  onRestoreDemo,
  onResetWeek,
}: HeaderProps) {
  const [confirmingReset, setConfirmingReset] = useState(false);

  const handleResetClick = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      window.setTimeout(() => setConfirmingReset(false), 3500);
      return;
    }
    setConfirmingReset(false);
    onResetWeek();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-teal-400 to-emerald-500 text-slate-950 shadow-lg shadow-cyan-500/20">
            <BookOpenCheck className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                StudyFlow
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-300">
                <Sparkles className="h-3 w-3" />
                {totalSubjects} {totalSubjects === 1 ? 'trilha ativa' : 'trilhas ativas'}
              </span>
            </div>
            <p className="text-xs text-slate-400 sm:text-sm">
              Dashboard Interativo de Estudos • Faculdade, Python & Lógica de Programação
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetClick}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all sm:text-sm ${
              confirmingReset
                ? 'border-rose-500/60 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25'
                : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
            title="Zera as horas e pomodoros registrados na semana atual"
          >
            <RotateCcw className="h-4 w-4" />
            {confirmingReset ? 'Confirmar zerar semana?' : 'Zerar Semana'}
          </button>

          <button
            type="button"
            onClick={onRestoreDemo}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white sm:text-sm"
            title="Restaura as disciplinas e tópicos de exemplo"
          >
            <RefreshCw className="h-4 w-4" />
            Restaurar Demo
          </button>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:brightness-110 active:scale-[0.98] sm:text-sm"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Nova Matéria
          </button>
        </div>
      </div>
    </header>
  );
}
