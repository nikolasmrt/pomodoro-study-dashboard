import { IStudyStorageService, StudySession, Subject, TopicItem } from '../types/study';

const STORAGE_KEYS = {
  SUBJECTS: 'study_dashboard_subjects_v1',
  SESSIONS: 'study_dashboard_sessions_v1',
} as const;

function buildSeedTopic(id: string, title: string, completed: boolean, offsetHours: number): TopicItem {
  return {
    id,
    title,
    completed,
    createdAt: new Date(Date.now() - offsetHours * 3600_000).toISOString(),
  };
}

export function createSeedSubjects(): Subject[] {
  const now = Date.now();
  const daysAgo = (days: number) => new Date(now - days * 86_400_000).toISOString();

  return [
    {
      id: 'subj_python_ds',
      name: 'Python & Estruturas de Dados',
      category: 'python',
      color: 'emerald',
      weeklyGoalHours: 10,
      studiedMinutesThisWeek: 375,
      completedPomodoros: 15,
      createdAt: daysAgo(6),
      topics: [
        buildSeedTopic('top_py_1', 'List Comprehensions e Generators', true, 72),
        buildSeedTopic('top_py_2', 'Decorators e Context Managers', true, 48),
        buildSeedTopic('top_py_3', 'Type Hints & Pydantic', true, 24),
        buildSeedTopic('top_py_4', 'Programação Assíncrona (asyncio)', false, 12),
        buildSeedTopic('top_py_5', 'Manipulação de Arquivos e JSON', false, 6),
      ],
    },
    {
      id: 'subj_logica_alg',
      name: 'Lógica de Programação & Algoritmos',
      category: 'logica',
      color: 'violet',
      weeklyGoalHours: 8,
      studiedMinutesThisWeek: 300,
      completedPomodoros: 12,
      createdAt: daysAgo(6),
      topics: [
        buildSeedTopic('top_log_1', 'Recursividade e Caso Base', true, 64),
        buildSeedTopic('top_log_2', 'Complexidade de Algoritmos (Big-O)', true, 40),
        buildSeedTopic('top_log_3', 'Busca Binária e Ordenação', true, 20),
        buildSeedTopic('top_log_4', 'Pilhas, Filas e Listas Encadeadas', false, 10),
        buildSeedTopic('top_log_5', 'Programação Dinâmica', false, 4),
      ],
    },
    {
      id: 'subj_bd_rel',
      name: 'Banco de Dados Relacionais',
      category: 'faculdade',
      color: 'cyan',
      weeklyGoalHours: 6,
      studiedMinutesThisWeek: 250,
      completedPomodoros: 10,
      createdAt: daysAgo(5),
      topics: [
        buildSeedTopic('top_bd_1', 'Modelagem Entidade-Relacionamento (MER)', true, 50),
        buildSeedTopic('top_bd_2', 'Normalização (1FN, 2FN, 3FN)', true, 30),
        buildSeedTopic('top_bd_3', 'Consultas SQL Avançadas (JOINs e CTEs)', false, 16),
        buildSeedTopic('top_bd_4', 'Índices e Transações ACID', false, 8),
      ],
    },
    {
      id: 'subj_eng_soft',
      name: 'Engenharia de Software & Arquitetura',
      category: 'faculdade',
      color: 'amber',
      weeklyGoalHours: 6,
      studiedMinutesThisWeek: 150,
      completedPomodoros: 6,
      createdAt: daysAgo(4),
      topics: [
        buildSeedTopic('top_eng_1', 'Princípios SOLID e Clean Code', true, 36),
        buildSeedTopic('top_eng_2', 'Padrões de Projeto (Strategy, Factory, Observer)', false, 18),
        buildSeedTopic('top_eng_3', 'Testes Unitários com Pytest/Vitest', false, 9),
        buildSeedTopic('top_eng_4', 'Arquitetura em Camadas e REST APIs', false, 3),
      ],
    },
  ];
}

export function createSeedSessions(): StudySession[] {
  const minutesAgo = (mins: number) => new Date(Date.now() - mins * 60_000).toISOString();

  return [
    {
      id: 'sess_seed_1',
      subjectId: 'subj_python_ds',
      subjectName: 'Python & Estruturas de Dados',
      durationMinutes: 25,
      completedAt: minutesAgo(42),
      type: 'pomodoro',
    },
    {
      id: 'sess_seed_2',
      subjectId: 'subj_logica_alg',
      subjectName: 'Lógica de Programação & Algoritmos',
      durationMinutes: 25,
      completedAt: minutesAgo(135),
      type: 'pomodoro',
    },
    {
      id: 'sess_seed_3',
      subjectId: 'subj_bd_rel',
      subjectName: 'Banco de Dados Relacionais',
      durationMinutes: 25,
      completedAt: minutesAgo(260),
      type: 'pomodoro',
    },
    {
      id: 'sess_seed_4',
      subjectId: 'subj_eng_soft',
      subjectName: 'Engenharia de Software & Arquitetura',
      durationMinutes: 25,
      completedAt: minutesAgo(480),
      type: 'pomodoro',
    },
  ];
}

/**
 * Implementação da camada de persistência utilizando localStorage.
 * Segue o contrato IStudyStorageService para permitir troca transparente
 * por uma implementação REST/GraphQL no futuro sem impactar hooks ou UI.
 */
export class LocalStorageStudyService implements IStudyStorageService {
  private readJson<T>(key: string): T | null {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  private writeJson<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erro ao persistir chave "${key}" no localStorage:`, error);
    }
  }

  async getSubjects(): Promise<Subject[]> {
    const stored = this.readJson<Subject[]>(STORAGE_KEYS.SUBJECTS);
    if (stored && Array.isArray(stored)) {
      return stored;
    }
    const seed = createSeedSubjects();
    this.writeJson(STORAGE_KEYS.SUBJECTS, seed);
    return seed;
  }

  async saveSubjects(subjects: Subject[]): Promise<void> {
    this.writeJson(STORAGE_KEYS.SUBJECTS, subjects);
  }

  async getSessions(): Promise<StudySession[]> {
    const stored = this.readJson<StudySession[]>(STORAGE_KEYS.SESSIONS);
    if (stored && Array.isArray(stored)) {
      return stored;
    }
    const seed = createSeedSessions();
    this.writeJson(STORAGE_KEYS.SESSIONS, seed);
    return seed;
  }

  async saveSessions(sessions: StudySession[]): Promise<void> {
    this.writeJson(STORAGE_KEYS.SESSIONS, sessions);
  }

  async resetData(): Promise<{ subjects: Subject[]; sessions: StudySession[] }> {
    const subjects = createSeedSubjects();
    const sessions = createSeedSessions();
    this.writeJson(STORAGE_KEYS.SUBJECTS, subjects);
    this.writeJson(STORAGE_KEYS.SESSIONS, sessions);
    return { subjects, sessions };
  }
}

export const studyStorageService: IStudyStorageService = new LocalStorageStudyService();
