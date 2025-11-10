export interface Question {
  id?: string;
  statement: string;
  options: string[];
  answer: number | string
}

export interface Quiz {
  id: string;
  name: string;
  description: string;
  duration: number;
  questions: Question[];
  createdAt: string;
}

export type QuestionResponse = {
  questionId: string,
  statement: string,
  options: string[],
  correctAnswer: string,
  userAnswer: string,
  isCorrect: string,
  scoreAwarded: string,
}

export type QuizHistory = {
    quizId: string;
    quizName: string;
    quizDescription: string | null;
    submittedAt: Date | null;
    totalQuestions: number;
    totalCorrectAnswers: number;
    totalObtainedScore: number;
    totalPossibleScore: number;
}[];
