interface TeamMember {
  name: string;
  email: string;
  phone: string;
}

interface Team {
  teamName: string;
  password: string;
  members: TeamMember[];
}

export interface QuizAttempt {
  id: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  date: string;
  teamName: string;
}

const STORAGE_KEYS = {
  TEAM_DATA: 'quiz_team_data',
  CURRENT_SESSION: 'quiz_current_session',
  QUIZ_ATTEMPTS: 'quiz_attempts',
};

export const saveTeamData = (team: Team): void => {
  localStorage.setItem(STORAGE_KEYS.TEAM_DATA, JSON.stringify(team));
};

export const getTeamData = (): Team | null => {
  const data = localStorage.getItem(STORAGE_KEYS.TEAM_DATA);
  return data ? JSON.parse(data) : null;
};

export const setCurrentSession = (teamName: string): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, teamName);
};

export const getCurrentSession = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
};

export const clearCurrentSession = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
};

export const saveQuizAttempt = (attempt: QuizAttempt): void => {
  const attempts = getQuizAttempts();
  attempts.push(attempt);
  localStorage.setItem(STORAGE_KEYS.QUIZ_ATTEMPTS, JSON.stringify(attempts));
};

export const getQuizAttempts = (): QuizAttempt[] => {
  const data = localStorage.getItem(STORAGE_KEYS.QUIZ_ATTEMPTS);
  return data ? JSON.parse(data) : [];
};