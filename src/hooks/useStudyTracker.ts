import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { studyStorageService } from '../services/studyStorageService';
import {
  CategoryFilter,
  CreateSubjectDTO,
  DashboardMetrics,
  IStudyStorageService,
  StudySession,
  Subject,
  TopicItem,
  UpdateSubjectDTO,
} from '../types/study';
import { calculateHoursProgress, generateId, minutesToHours } from '../utils/studyCalculations';

const MAX_SESSIONS_HISTORY = 50;
const ON_TRACK_THRESHOLD_PERCENT = 60;

export function useStudyTracker(storageService: IStudyStorageService = studyStorageService) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isHydratedRef = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      setIsLoading(true);
      try {
        const [loadedSubjects, loadedSessions] = await Promise.all([
          storageService.getSubjects(),
          storageService.getSessions(),
        ]);

        if (!isMounted) return;

        isHydratedRef.current = true;
        setSubjects(loadedSubjects);
        setSessions(loadedSessions);
        setSelectedSubjectId((prev) => {
          if (prev && loadedSubjects.some((subject) => subject.id === prev)) {
            return prev;
          }
          return loadedSubjects[0]?.id ?? '';
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, [storageService]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    void storageService.saveSubjects(subjects);
  }, [subjects, storageService]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    void storageService.saveSessions(sessions);
  }, [sessions, storageService]);

  const addSubject = useCallback((dto: CreateSubjectDTO): Subject => {
    const initialTopics: TopicItem[] = (dto.initialTopics ?? [])
      .map((title) => title.trim())
      .filter(Boolean)
      .map((title) => ({
        id: generateId('top'),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
      }));

    const newSubject: Subject = {
      id: generateId('subj'),
      name: dto.name.trim(),
      category: dto.category,
      color: dto.color,
      weeklyGoalHours: Math.max(1, dto.weeklyGoalHours),
      studiedMinutesThisWeek: 0,
      completedPomodoros: 0,
      topics: initialTopics,
      createdAt: new Date().toISOString(),
    };

    setSubjects((prev) => [newSubject, ...prev]);
    setSelectedSubjectId((prev) => prev || newSubject.id);

    return newSubject;
  }, []);

  const updateSubject = useCallback((id: string, dto: UpdateSubjectDTO) => {
    setSubjects((prev) =>
      prev.map((subject) => {
        if (subject.id !== id) return subject;
        return {
          ...subject,
          name: dto.name !== undefined ? dto.name.trim() : subject.name,
          category: dto.category ?? subject.category,
          color: dto.color ?? subject.color,
          weeklyGoalHours:
            dto.weeklyGoalHours !== undefined
              ? Math.max(1, dto.weeklyGoalHours)
              : subject.weeklyGoalHours,
        };
      }),
    );

    if (dto.name !== undefined) {
      const updatedName = dto.name.trim();
      setSessions((prev) =>
        prev.map((session) =>
          session.subjectId === id ? { ...session, subjectName: updatedName } : session,
        ),
      );
    }
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setSubjects((prev) => {
      const next = prev.filter((subject) => subject.id !== id);
      setSelectedSubjectId((currentSelected) => {
        if (currentSelected !== id) return currentSelected;
        return next[0]?.id ?? '';
      });
      return next;
    });
  }, []);

  const addTopic = useCallback((subjectId: string, title: string) => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const newTopic: TopicItem = {
      id: generateId('top'),
      title: cleanTitle,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === subjectId
          ? { ...subject, topics: [...subject.topics, newTopic] }
          : subject,
      ),
    );
  }, []);

  const toggleTopic = useCallback((subjectId: string, topicId: string) => {
    setSubjects((prev) =>
      prev.map((subject) => {
        if (subject.id !== subjectId) return subject;
        return {
          ...subject,
          topics: subject.topics.map((topic) =>
            topic.id === topicId ? { ...topic, completed: !topic.completed } : topic,
          ),
        };
      }),
    );
  }, []);

  const deleteTopic = useCallback((subjectId: string, topicId: string) => {
    setSubjects((prev) =>
      prev.map((subject) => {
        if (subject.id !== subjectId) return subject;
        return {
          ...subject,
          topics: subject.topics.filter((topic) => topic.id !== topicId),
        };
      }),
    );
  }, []);

  const recordStudyTime = useCallback(
    (subjectId: string, minutes: number, type: 'pomodoro' | 'manual') => {
      if (!subjectId || minutes <= 0) return;

      let targetSubjectName = '';

      setSubjects((prev) =>
        prev.map((subject) => {
          if (subject.id !== subjectId) return subject;
          targetSubjectName = subject.name;
          return {
            ...subject,
            studiedMinutesThisWeek: subject.studiedMinutesThisWeek + minutes,
            completedPomodoros:
              type === 'pomodoro'
                ? subject.completedPomodoros + 1
                : subject.completedPomodoros,
          };
        }),
      );

      const matchedSubject = subjects.find((subject) => subject.id === subjectId);
      const resolvedName = targetSubjectName || matchedSubject?.name || 'Matéria';

      const newSession: StudySession = {
        id: generateId('sess'),
        subjectId,
        subjectName: resolvedName,
        durationMinutes: minutes,
        completedAt: new Date().toISOString(),
        type,
      };

      setSessions((prev) => [newSession, ...prev].slice(0, MAX_SESSIONS_HISTORY));
    },
    [subjects],
  );

  const resetWeeklyProgress = useCallback(() => {
    setSubjects((prev) =>
      prev.map((subject) => ({
        ...subject,
        studiedMinutesThisWeek: 0,
        completedPomodoros: 0,
      })),
    );
    setSessions([]);
  }, []);

  const restoreDefaultData = useCallback(async () => {
    const { subjects: defaultSubjects, sessions: defaultSessions } =
      await storageService.resetData();
    setSubjects(defaultSubjects);
    setSessions(defaultSessions);
    setSelectedSubjectId(defaultSubjects[0]?.id ?? '');
    setCategoryFilter('all');
    setSearchQuery('');
  }, [storageService]);

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedSubjectId) ?? null,
    [subjects, selectedSubjectId],
  );

  const filteredSubjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return subjects.filter((subject) => {
      const matchesCategory =
        categoryFilter === 'all' || subject.category === categoryFilter;
      if (!matchesCategory) return false;

      if (!query) return true;
      const matchesName = subject.name.toLowerCase().includes(query);
      const matchesTopic = subject.topics.some((topic) =>
        topic.title.toLowerCase().includes(query),
      );
      return matchesName || matchesTopic;
    });
  }, [subjects, categoryFilter, searchQuery]);

  const metrics: DashboardMetrics = useMemo(() => {
    const totalPlannedHours = subjects.reduce(
      (acc, subject) => acc + subject.weeklyGoalHours,
      0,
    );
    const totalStudiedMinutes = subjects.reduce(
      (acc, subject) => acc + subject.studiedMinutesThisWeek,
      0,
    );
    const totalStudiedHours = minutesToHours(totalStudiedMinutes);

    const hoursCompletionRate =
      totalPlannedHours > 0
        ? Math.min(100, Math.round((totalStudiedHours / totalPlannedHours) * 100))
        : 0;

    const totalTopics = subjects.reduce((acc, subject) => acc + subject.topics.length, 0);
    const completedTopics = subjects.reduce(
      (acc, subject) => acc + subject.topics.filter((topic) => topic.completed).length,
      0,
    );
    const topicsCompletionRate =
      totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    const totalPomodoroCycles = subjects.reduce(
      (acc, subject) => acc + subject.completedPomodoros,
      0,
    );

    const subjectsOnTrackCount = subjects.filter(
      (subject) => calculateHoursProgress(subject) >= ON_TRACK_THRESHOLD_PERCENT,
    ).length;

    return {
      totalPlannedHours,
      totalStudiedHours,
      hoursCompletionRate,
      totalTopics,
      completedTopics,
      topicsCompletionRate,
      totalPomodoroCycles,
      subjectsOnTrackCount,
    };
  }, [subjects]);

  return {
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
  };
}
