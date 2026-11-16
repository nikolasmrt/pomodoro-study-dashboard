import { useCallback, useState } from 'react';
import { BookOpen, Plus, Search } from 'lucide-react';
import { Header } from './components/Header';
import { KpiOverview } from './components/KpiOverview';
import { PomodoroTimer } from './components/PomodoroTimer';
import { SubjectCard } from './components/SubjectCard';
import { SubjectModal } from './components/SubjectModal';
import { WeeklyComparisonChart } from './components/WeeklyComparisonChart';
import { CATEGORY_META } from './constants/studyTheme';
import { usePomodoro } from './hooks/usePomodoro';
import { useStudyTracker } from './hooks/useStudyTracker';
import { CategoryFilter, Subject } from './types/study';

const FILTER_TABS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'faculdade', label: CATEGORY_META.faculdade.shortLabel },
  { value: 'python', label: CATEGORY_META.python.shortLabel },
  { value: 'logica', label: CATEGORY_META.logica.shortLabel },
  { value: 'outros', label: CATEGORY_META.outros.shortLabel },
];

export function App() {
  const {
    subjects,
    filteredSubjects,
    sessions,
    selectedSubjectId,
    selectedSubject,
    setSelectedSubjectId,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    isLoading,
    metrics,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    toggleTopic,
    deleteTopic,
    recordStudyTime,
    resetWeeklyProgress,
    restoreDefaultData,
  } = useStudyTracker();

  const handlePomodoroCycleComplete = useCallback(
    (subjectId: string, durationMinutes: number) => {
      recordStudyTime(subjectId, durationMinutes, 'pomodoro');
    },
    [recordStudyTime],
  );

  const pomodoro = usePomodoro({
    selectedSubjectId,
    selectedSubjectName: selectedSubject?.name,
    onCycleComplete: handlePomodoroCycleComplete,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const handleOpenCreateModal = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/30 via-slate-950 to-slate-950 text-slate-100">
      <Header
        totalSubjects={subjects.length}
        onOpenCreateModal={handleOpenCreateModal}
        onRestoreDemo={() => void restoreDefaultData()}
        onResetWeek={resetWeeklyProgress}
      />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/60">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              Carregando suas trilhas de estudo...
            </div>
          </div>
        ) : (
          <>
            <KpiOverview metrics={metrics} totalSubjects={subjects.length} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Coluna Principal: Gráfico Comparativo + Trilhas e Checklists */}
              <div className="space-y-6 lg:col-span-8">
                <WeeklyComparisonChart
                  subjects={subjects}
                  selectedSubjectId={selectedSubjectId}
                  onSelectSubject={setSelectedSubjectId}
                />

                {/* Barra de Filtros e Busca */}
                <section className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {FILTER_TABS.map((tab) => (
                        <button
                          key={tab.value}
                          type="button"
                          onClick={() => setCategoryFilter(tab.value)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                            categoryFilter === tab.value
                              ? 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/40'
                              : 'border border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar matéria ou tópico..."
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Grid de Disciplinas */}
                  {filteredSubjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-12 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-400">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-white">
                        {subjects.length === 0
                          ? 'Nenhuma disciplina cadastrada'
                          : 'Nenhuma disciplina encontrada para o filtro'}
                      </h3>
                      <p className="mt-1 max-w-sm text-xs text-slate-400 sm:text-sm">
                        {subjects.length === 0
                          ? 'Adicione suas matérias da faculdade, estudos de Python ou algoritmos para começar a acompanhar seu progresso.'
                          : 'Tente limpar a busca ou selecionar outra categoria acima.'}
                      </p>
                      {subjects.length === 0 && (
                        <button
                          type="button"
                          onClick={handleOpenCreateModal}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950"
                        >
                          <Plus className="h-4 w-4" />
                          Cadastrar Primeira Matéria
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      {filteredSubjects.map((subject) => (
                        <SubjectCard
                          key={subject.id}
                          subject={subject}
                          isSelectedForPomodoro={subject.id === selectedSubjectId}
                          onSelectForPomodoro={setSelectedSubjectId}
                          onEdit={handleOpenEditModal}
                          onDelete={deleteSubject}
                          onAddManualMinutes={(id, minutes) =>
                            recordStudyTime(id, minutes, 'manual')
                          }
                          onAddTopic={addTopic}
                          onToggleTopic={toggleTopic}
                          onDeleteTopic={deleteTopic}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Coluna Lateral: Cronômetro Pomodoro Integrado */}
              <div className="lg:col-span-4">
                <PomodoroTimer
                  subjects={subjects}
                  selectedSubjectId={selectedSubjectId}
                  selectedSubject={selectedSubject}
                  onSelectSubject={setSelectedSubjectId}
                  mode={pomodoro.mode}
                  durations={pomodoro.durations}
                  secondsLeft={pomodoro.secondsLeft}
                  progressRatio={pomodoro.progressRatio}
                  isRunning={pomodoro.isRunning}
                  isMuted={pomodoro.isMuted}
                  cyclesCompletedInSession={pomodoro.cyclesCompletedInSession}
                  lastCompletedBanner={pomodoro.lastCompletedBanner}
                  recentSessions={sessions}
                  onToggleTimer={pomodoro.toggleTimer}
                  onResetTimer={pomodoro.resetTimer}
                  onSwitchMode={pomodoro.switchMode}
                  onUpdateDurations={pomodoro.updateDurations}
                  onCompleteCycleNow={pomodoro.completeCurrentCycleNow}
                  onToggleMute={pomodoro.toggleMute}
                  onDismissBanner={pomodoro.dismissBanner}
                />
              </div>
            </div>
          </>
        )}
      </main>

      <SubjectModal
        isOpen={isModalOpen}
        editingSubject={editingSubject}
        onClose={handleCloseModal}
        onSaveCreate={addSubject}
        onSaveEdit={updateSubject}
      />
    </div>
  );
}

export default App;
