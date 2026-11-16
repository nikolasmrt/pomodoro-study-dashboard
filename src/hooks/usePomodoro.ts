import { useCallback, useEffect, useRef, useState } from 'react';
import { PomodoroDurations, PomodoroMode } from '../types/study';
import { formatTimerDisplay } from '../utils/studyCalculations';

const DEFAULT_DURATIONS: PomodoroDurations = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

const MODE_LABELS: Record<PomodoroMode, string> = {
  focus: 'Foco',
  shortBreak: 'Pausa Curta',
  longBreak: 'Pausa Longa',
};

const DEFAULT_PAGE_TITLE = 'StudyFlow | Dashboard Interativo de Estudos';

function playCompletionChime(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, idx) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.14;

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.36);
    });
  } catch {
    // Ignore audio context errors when browser blocks autoplay
  }
}

export interface CycleFeedback {
  subjectName: string;
  minutes: number;
  timestamp: number;
}

interface UsePomodoroOptions {
  selectedSubjectId: string;
  selectedSubjectName?: string;
  onCycleComplete: (subjectId: string, durationMinutes: number) => void;
}

export function usePomodoro({
  selectedSubjectId,
  selectedSubjectName,
  onCycleComplete,
}: UsePomodoroOptions) {
  const [durations, setDurations] = useState<PomodoroDurations>(DEFAULT_DURATIONS);
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState<number>(DEFAULT_DURATIONS.focus * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [cyclesCompletedInSession, setCyclesCompletedInSession] = useState<number>(0);
  const [lastCompletedBanner, setLastCompletedBanner] = useState<CycleFeedback | null>(null);

  const onCycleCompleteRef = useRef(onCycleComplete);
  onCycleCompleteRef.current = onCycleComplete;

  const finalizeCurrentPhase = useCallback(() => {
    setIsRunning(false);
    if (!isMuted) {
      playCompletionChime();
    }

    if (mode === 'focus') {
      if (selectedSubjectId) {
        onCycleCompleteRef.current(selectedSubjectId, durations.focus);
        setLastCompletedBanner({
          subjectName: selectedSubjectName || 'Matéria selecionada',
          minutes: durations.focus,
          timestamp: Date.now(),
        });
      }

      const nextCycles = cyclesCompletedInSession + 1;
      setCyclesCompletedInSession(nextCycles);

      const nextBreakMode: PomodoroMode = nextCycles % 4 === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextBreakMode);
      setSecondsLeft(durations[nextBreakMode] * 60);
      return;
    }

    setMode('focus');
    setSecondsLeft(durations.focus * 60);
  }, [
    cyclesCompletedInSession,
    durations,
    isMuted,
    mode,
    selectedSubjectId,
    selectedSubjectName,
  ]);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && secondsLeft <= 0) {
      finalizeCurrentPhase();
    }
  }, [isRunning, secondsLeft, finalizeCurrentPhase]);

  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTimerDisplay(secondsLeft)} • ${MODE_LABELS[mode]} — StudyFlow`;
    } else {
      document.title = DEFAULT_PAGE_TITLE;
    }
    return () => {
      document.title = DEFAULT_PAGE_TITLE;
    };
  }, [isRunning, secondsLeft, mode]);

  const toggleTimer = useCallback(() => {
    if (mode === 'focus' && !selectedSubjectId) return;
    setIsRunning((prev) => !prev);
  }, [mode, selectedSubjectId]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(durations[mode] * 60);
  }, [durations, mode]);

  const switchMode = useCallback(
    (nextMode: PomodoroMode) => {
      setIsRunning(false);
      setMode(nextMode);
      setSecondsLeft(durations[nextMode] * 60);
    },
    [durations],
  );

  const updateDurations = useCallback(
    (nextDurations: PomodoroDurations) => {
      const sanitized: PomodoroDurations = {
        focus: Math.min(120, Math.max(1, Math.round(nextDurations.focus))),
        shortBreak: Math.min(60, Math.max(1, Math.round(nextDurations.shortBreak))),
        longBreak: Math.min(90, Math.max(1, Math.round(nextDurations.longBreak))),
      };
      setDurations(sanitized);
      if (!isRunning) {
        setSecondsLeft(sanitized[mode] * 60);
      }
    },
    [isRunning, mode],
  );

  const completeCurrentCycleNow = useCallback(() => {
    if (mode === 'focus' && !selectedSubjectId) return;
    finalizeCurrentPhase();
  }, [finalizeCurrentPhase, mode, selectedSubjectId]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const dismissBanner = useCallback(() => {
    setLastCompletedBanner(null);
  }, []);

  const totalSecondsForMode = durations[mode] * 60;
  const progressRatio =
    totalSecondsForMode > 0
      ? Math.min(1, Math.max(0, (totalSecondsForMode - secondsLeft) / totalSecondsForMode))
      : 0;

  return {
    mode,
    durations,
    secondsLeft,
    totalSecondsForMode,
    progressRatio,
    isRunning,
    isMuted,
    cyclesCompletedInSession,
    lastCompletedBanner,
    toggleTimer,
    resetTimer,
    switchMode,
    updateDurations,
    completeCurrentCycleNow,
    toggleMute,
    dismissBanner,
  };
}
