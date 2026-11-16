import { Subject, TopicItem } from '../types/study';

export function generateId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function minutesToHours(minutes: number): number {
  return Number((minutes / 60).toFixed(2));
}

export function formatHoursLabel(hours: number): string {
  const formatted = hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1);
  return `${formatted}h`;
}

export function formatMinutesAsTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function calculateHoursProgress(subject: Subject): number {
  if (subject.weeklyGoalHours <= 0) return 0;
  const studiedHours = subject.studiedMinutesThisWeek / 60;
  return Math.min(100, Math.round((studiedHours / subject.weeklyGoalHours) * 100));
}

export function calculateTopicsProgress(topics: TopicItem[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const total = topics.length;
  if (total === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }
  const completed = topics.filter((topic) => topic.completed).length;
  const percentage = Math.round((completed / total) * 100);
  return { completed, total, percentage };
}

export function formatTimerDisplay(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatRelativeTime(isoDate: string): string {
  const timestamp = new Date(isoDate).getTime();
  if (Number.isNaN(timestamp)) return 'agora';

  const diffMinutes = Math.floor((Date.now() - timestamp) / 60000);
  if (diffMinutes < 1) return 'agora';
  if (diffMinutes < 60) return `há ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `há ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  return `há ${diffDays}d`;
}
