import { config } from "@/lib/utils";
import { QuizResponse, StudentLogin, SubmitQuiz, Team } from "@/types/student";
import { ApiError, handleApiError } from "./apiError";
import { ApiSuccessReponse } from "@/types/apiTypes";
import { Quiz, QuizHistory } from "@/types/quiz";

export async function createStudent(team: Team) {
    let res = await fetch(`${config.backendUrl}/api/v1/student`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(team)
    });

    if (!res.ok) {
        await handleApiError(res, "Failed to create student")
    }
    res = await res.json();
}

export async function loginStudent(data: StudentLogin) {
    let res = await fetch(`${config.backendUrl}/api/v1/student/auth/login`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify(data)
    });
    
    if (!res.ok) {
        await handleApiError(res, "Failed to login")
    }
    res = await res.json();
    return res;
}

export async function getQuizzes() {
    let res = await fetch(`${config.backendUrl}/api/v1/student/quiz`, {
        method: "GET",
        credentials: "include",
    });
    
    if (!res.ok) {
        await handleApiError(res, "Failed to get all quizzes")
    }
    const data: ApiSuccessReponse<Quiz[]> = await res.json();
    
    return data;
}

export async function getQuizDetail(quizId: string) {
    let res = await fetch(`${config.backendUrl}/api/v1/student/quiz-detail/${quizId}`, {
        method: "GET",
        credentials: "include",
    });
    
    if (!res.ok) {
        await handleApiError(res, "Failed to get quiz detail.")
    }
    const data: ApiSuccessReponse<Quiz> = await res.json();
    return data;
}

export async function submitQuiz(responseData: SubmitQuiz) {
    let res = await fetch(`${config.backendUrl}/api/v1/student/quiz/submit`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseData),
        credentials: "include"
    });

    if (!res.ok) {
        await handleApiError(res, "Failed to submit the quiz.")
    }
    const response: ApiSuccessReponse<unknown> = await res.json();
    return response;
}

export async function getQuizResults(quizId: string) {
    let res = await fetch(`${config.backendUrl}/api/v1/student/quiz-response/${quizId}`, {
        method: "GET",
        credentials: "include"
    });

    if (!res.ok) {
        await handleApiError(res, "Failed to submit the quiz.")
    }
    const response: ApiSuccessReponse<QuizResponse> = await res.json();
    return response;
}

export async function getQuizHistory() {
    let res = await fetch(`${config.backendUrl}/api/v1/student/quiz-response`, {
        method: "GET",
        credentials: "include"
    });

    if (!res.ok) {
        await handleApiError(res, "Failed to submit the quiz.")
    }
    const response: ApiSuccessReponse<QuizHistory> = await res.json();
    return response;
}
