export type StudyCategory = 'faculdade' | 'python' | 'logica' | 'outros';

export type CategoryFilter = StudyCategory | 'all';

export type SubjectColor = 'emerald' | 'cyan' | 'violet' | 'amber' | 'rose' | 'blue';

export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TopicItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  durationMinutes: number;
  completedAt: string;
  type: 'pomodoro' | 'manual';
}

export interface Subject {
  id: string;
  name: string;
  category: StudyCategory;
  color: SubjectColor;
  weeklyGoalHours: number;
  studiedMinutesThisWeek: number;
  completedPomodoros: number;
  topics: TopicItem[];
  createdAt: string;
}

export interface CreateSubjectDTO {
  name: string;
  category: StudyCategory;
  color: SubjectColor;
  weeklyGoalHours: number;
  initialTopics?: string[];
}

export interface UpdateSubjectDTO {
  name?: string;
  category?: StudyCategory;
  color?: SubjectColor;
  weeklyGoalHours?: number;
}

export interface DashboardMetrics {
  totalPlannedHours: number;
  totalStudiedHours: number;
  hoursCompletionRate: number;
  totalTopics: number;
  completedTopics: number;
  topicsCompletionRate: number;
  totalPomodoroCycles: number;
  subjectsOnTrackCount: number;
}

export interface PomodoroDurations {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

export interface IStudyStorageService {
  getSubjects(): Promise<Subject[]>;
  saveSubjects(subjects: Subject[]): Promise<void>;
  getSessions(): Promise<StudySession[]>;
  saveSessions(sessions: StudySession[]): Promise<void>;
  resetData(): Promise<{ subjects: Subject[]; sessions: StudySession[] }>;
}
