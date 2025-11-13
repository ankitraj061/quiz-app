import { config } from "@/lib/utils";
import { Quiz } from "@/types/quiz";
import { handleApiError } from "./apiError";
import { ApiSuccessReponse } from "@/types/apiTypes";

export async function createQuiz(quiz: Quiz) {
    quiz.questions = quiz.questions.map((ques) => ({ ...ques, answer: ques.options[Number(ques.answer)] }))
    const res = await fetch(`${config.backendUrl}/api/v1/quiz`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify(quiz)
    });
    if (!res.ok) {
        await handleApiError(res, "Failed to create quiz.")
    }
    const response: ApiSuccessReponse<unknown> = await res.json();
    return response;
}

export async function getQuizOfAdmin(): Promise<Quiz[]> {
    const res = await fetch(`${config.backendUrl}/api/v1/quiz`, {
        method: "GET", credentials: "include"
    });
    if (!res.ok) {
        await handleApiError(res, "Failed to get all quizzes");
    }
    const resposne: ApiSuccessReponse<Quiz[]> = await res.json();
    return resposne.data;
}

export async function getQuiz(id: string): Promise<Quiz> {
    const res = await fetch(`${config.backendUrl}/api/v1/quiz/${id}`, {
        method: "GET", credentials: "include"
    });
    if (!res.ok) {
        await handleApiError(res, "Failed to get quiz");
    }
    const resposne: ApiSuccessReponse<Quiz> = await res.json();
    return resposne.data;
}


export async function deleteQuiz(quizId: string) {
    const res = await fetch(`${config.backendUrl}/api/v1/quiz/${quizId}`, {
        method: "DELETE", credentials: "include"
    });
    if (!res.ok) {
        await handleApiError(res, "Failed to delete the quiz");
    }
    const resposne: ApiSuccessReponse<unknown> = await res.json();
    return resposne;
}


export async function updateQuiz(quiz: Quiz) {
    quiz.questions = quiz.questions.map((ques) => ({ ...ques, answer: ques.options[Number(ques.answer)] }))
    
    const res = await fetch(`${config.backendUrl}/api/v1/quiz/${quiz.id}`, {
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify(quiz)
    });
    if (!res.ok) {
        await handleApiError(res, "Failed to update the quiz.")
    }
    const response: ApiSuccessReponse<unknown> = await res.json();
    return response;
}