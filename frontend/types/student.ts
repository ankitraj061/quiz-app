import { QuestionResponse } from "./quiz";

export interface TeamMember {
    name: string;
    email: string;
    phone: string;
}

export interface Team {
    teamName: string;
    password: string;
    students: TeamMember[];
}

export interface QuizAttempt {
    id: string;
    quizTitle: string;
    score: number;
    totalQuestions: number;
    date: string;
    teamName: string;
}


export interface StudentLogin {
    email?: string,
    phone?: string,
    password: string
}

export interface SubmitQuiz {
    quizId: string;
    submittedAt: string;
    response: {
        questionId: string;
        answer: string;
    }[];
}

export type QuizResponse = {
    quiz: {
        id: string,
        name: string,
        description: string,
        duration: string,
        totalPossibleScore: string,
    },
    totalScore: string,
    submittedAt: string,
    student: {
        id: string,
        name: string
    },
    responses: QuestionResponse[]
}