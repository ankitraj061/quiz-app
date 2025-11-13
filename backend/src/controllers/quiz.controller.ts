import { Request, Response } from "express";
import { TCreateQuestion, TCreateQuiz, TQuestionUpdate, TQuizUpdate } from "../types/quiz.types";
import { QuizRepository } from "../repository/quiz.repository";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { HTTP_STATUS } from "../utils/httpCodes";
import { verifyUUID } from "../utils/objectManipilator";

export class QuizController {
    static getUserId(req: Request) {
        if (!req.user) {
            throw new ApiError("Authentication Error", HTTP_STATUS.UNAUTHORIZED);
        }
        return req.user.userId;
    } 

    static async createQuiz(req: Request, res: Response) {
        const { name, duration, questions, description } = req.body as TCreateQuiz;
        const createdBy = QuizController.getUserId(req);

        const data = await QuizRepository.create(name, createdBy, duration, description);
        if (!data) {
            throw new ApiError("Failed to create quiz, please try again");
        }
        let numberOfQuestionsCreated;

        if (questions) {
            const createdQuestions = await QuizRepository.createQuestion(questions, data.id);
            numberOfQuestionsCreated = createdQuestions.count;
        }

        ApiResponse.success(res, { ...data, ...(numberOfQuestionsCreated ? { numberOfQuestionsCreated }:{}) }, "Quiz created successfully", HTTP_STATUS.CREATED);
    }
    static async getAllQuiz(req: Request, res: Response) {
        const createdBy = QuizController.getUserId(req);
        const data = await QuizRepository.getAllByCreatedBy(createdBy);
        if (!data) {
            throw new ApiError("Failed to get all quiz for admin, please try again");
        } 
        ApiResponse.success(res, data, "Quizzes fetched successfully", HTTP_STATUS.CREATED);
    }

    static async getCompleteQuiz(req: Request, res: Response) {
        let quizId = req.params.quizId as string;
        
        if (!quizId) {
            throw new ApiError("Np quiz id is provided");
        }
        const data = await QuizRepository.getCompleteQuizById(quizId);
        if (!data) {
            throw new ApiError("Failed to get the quiz or there is no quiz with given id.");
        }
        
        ApiResponse.success(res, data, "Successfully fetched detailed quiz data.");
    }
    
    static async updateQuiz(req: Request, res: Response) {
        let quizId = req.params.quizId as string;
        
        if (!quizId) {
            throw new ApiError("Np quiz id is provided");
        }
        const updatedQuiz = await QuizRepository.updateQuizById(quizId, req.body as TQuizUpdate);
        if (!updatedQuiz) {
            throw new ApiError("Failed to update quiz, please try again.");
        }        

        ApiResponse.success(res, updatedQuiz, "Updated quiz successfully.");
    }
    static async deleteQuiz(req: Request, res: Response) {
        let quizId = req.params.quizId as string;
        
        if (!quizId) {
            throw new ApiError("Np quiz id is provided");
        }
        const createdBy = QuizController.getUserId(req);
        const quiz = await QuizRepository.getById(quizId);
        if (!quiz) {
            throw new ApiError("No quiz exists with provided ID.", HTTP_STATUS.BAD_REQUEST);
        }
        if (quiz.createdBy !== createdBy) {
            throw new ApiError("Unauthorised access, you are not the creator of the quiz.", HTTP_STATUS.FORBIDDEN);
        }
        const deletedQuiz = await QuizRepository.deleteById(quizId);
        ApiResponse.success(res, deletedQuiz, "Quiz deleted successfully", HTTP_STATUS.OK);
    }

    static async createQuestion(req: Request, res: Response) {
        const data = req.body as TCreateQuestion;
        const createdQuestion = await QuizRepository.createQuestion(data.questions, data.quizId);
        if (createdQuestion.count == 0) {
            throw new ApiError("Failed to create question, please try again.");
        }
        ApiResponse.success(res, { questionsAdded: createdQuestion.count }, "Successfully added question.", HTTP_STATUS.OK);
    }

    static async verifyQuestionId(questionId: string) {
        if (!questionId || questionId.trim() === "") {
            throw new ApiError("Invalid question ID", HTTP_STATUS.BAD_REQUEST);
        }
        const question = await QuizRepository.getQuestionById(questionId);
        if (!question) {
            throw new ApiError("No question found with given question ID");
        }
    }

    static async updateQuestion(req: Request, res: Response) {
        const body = req.body as TQuestionUpdate;
        const questionId = req.params.questionId as string;
        await QuizController.verifyQuestionId(questionId);

        const updatedQuestion = await QuizRepository.updateQuestionById(questionId, body);
        if (!updatedQuestion) {
            throw new ApiError("Failed to update the question, please try again.");
        }
        ApiResponse.success(res, updatedQuestion, "Successfully updated question");
    }
    
    static async deleteQuestion(req: Request, res: Response) {
        const questionId = req.params.questionId as string;
        await QuizController.verifyQuestionId(questionId);

        const deletedQuestion = await QuizRepository.deleteQuestionById(questionId);
        if (!deletedQuestion) {
            throw new ApiError("Failed to remove the question, please try again.");
        }
        ApiResponse.success(res, deletedQuestion, "Successfully removed the question from the quiz.");
    }

    static async getApplicantsOfQuiz(req: Request, res: Response) {
        const quizId = req.params.quizId as string;
        if (!verifyUUID(quizId)) {
            throw new ApiError("Given ID is not valid quiz ID.");
        }
        const quiz = await QuizRepository.getById(quizId);

        if (!quiz) {
            throw new ApiError("No quiz found with given quiz ID.");
        }

        const [participants, questions] = await Promise.all([QuizRepository.getLeaderboard(quizId), QuizRepository.getAllQuestions(quizId)]);
        if (!participants) {
            throw new ApiError("Failed to load participants data.");
        }
        
        let totalMarks = 0;
        questions.forEach(quest => {
            totalMarks += quest.score;
        });

        ApiResponse.success(res, {
            quizDetail: {
                quizName: quiz.name,
                description: quiz.description,
                totalQuestions: questions.length,
                totalMarks
            },
            participants, 
        }, "Sucessfully retrieved leaderboard.");
    }
}