import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { Question, TCreateQuestion, TQuestionUpdate, TQuizUpdate } from "../types/quiz.types";
import { ApiError } from "../utils/ApiError";

export class QuizRepository {
    static async create(name: string, createdBy: string, duration: number, description: string | undefined) {
        return await prisma.quiz.create({
            data: {
                createdBy, name, duration, description
            }
        });
    }
    static async getAllByCreatedBy(createdBy: string) {
        return await prisma.quiz.findMany({
            where: { createdBy },
            select: {
                id: true, name: true, description: true, duration: true, questions: {
                    select: { id: true }
                }
            }
        });
    }

    static async getById(id: string) {
        return await prisma.quiz.findUnique({ where: { id } });
    }

    static async getQuestionById(id: string) {
        return await prisma.question.findFirst({ where: { id } });
    }
    static async deleteById(id: string) {
        return await prisma.quiz.delete({ where: { id } });
    }

    static async createQuestion(data: Question[], quizId: string) {
        return await prisma.question.createMany({
            data: data.map((d) => ({ ...d, quizId }))
        });
    }

    static async updateQuizById(quizId: string, data: TQuizUpdate) {
        return prisma.$transaction(async (tx) => {
            const { name, description, duration, questions } = data;

            // 1. Update quiz metadata
            const updatedQuiz = await tx.quiz.update({
                where: { id: quizId },
                data: {
                    ...(name !== undefined && { name }),
                    ...(description !== undefined && { description }),
                    ...(duration !== undefined && { duration }),
                },
            });

            // 2. If no questions provided, skip question sync
            if (!questions) {
                return updatedQuiz;
            }

            // 3. Get current questions in DB
            const existingQuestions = await tx.question.findMany({
                where: { quizId },
                select: { id: true },
            });
            const existingIds = new Set(existingQuestions.map(q => q.id));

            const newQuestions: Prisma.QuestionCreateManyInput[] = [];
            const updatePromises: Promise<any>[] = [];

            for (const q of questions) {


                if (q.id) {
                    const questionExists = await tx.question.findUnique({
                        where: { id: q.id, quizId }
                    });
                    if (!questionExists) throw new ApiError("Invalid question ID");

                    // Existing question → update
                    if (existingIds.has(q.id)) {
                        updatePromises.push(
                            tx.question.update({
                                where: { id: q.id },
                                data: {
                                    statement: q.statement,
                                    options: q.options as any, // Prisma Json type
                                    answer: q.answer,
                                    score: q.score ?? 1,
                                },
                            })
                        );
                        existingIds.delete(q.id); // mark as "kept"
                    }
                    // If id is provided but not in DB → treat as invalid (optional: throw error)
                } else {
                    // New question → create
                    newQuestions.push({
                        statement: q.statement,
                        options: q.options as any,
                        answer: q.answer,
                        score: q.score ?? 1,
                        quizId
                    });
                }
            }

            // 4. Delete questions not in the update payload
            const idsToDelete = Array.from(existingIds);
            if (idsToDelete.length > 0) {
                await tx.question.deleteMany({
                    where: { id: { in: idsToDelete } },
                });
            }

            // 5. Create new questions
            if (newQuestions.length > 0) {
                await tx.question.createMany({
                    data: newQuestions.map((q) => ({ ...q, quizId })),
                });
            }

            // 6. Apply updates
            await Promise.all(updatePromises);

            return updatedQuiz;
        });
    }

    static async updateQuestionById(questionId: string, data: TQuestionUpdate) {
        return await prisma.question.update({
            where: { id: questionId },
            data
        });
    }

    static async deleteQuestionById(questionId: string) {
        return await prisma.question.delete({
            where: { id: questionId }
        });
    }

    static async getCompleteQuizById(quizId: string) {
        return await prisma.quiz.findFirst({
            where: { id: quizId },
            select: {
                id: true, name: true, admin: {
                    select: { id: true, name: true }
                },
                description: true, duration: true,
                questions: {
                    select: {
                        id: true,
                        statement: true,
                        options: true,
                        answer: true,
                        score: true
                    }
                }
            }
        })
    }

    static async getAllQuizForStudents(studentId: string) {
        return await prisma.quiz.findMany({
            where: {
                isActive: true,
                participants: {
                    none: {
                        studentId
                    }
                }
            },
            select: {
                id: true, name: true, description: true, duration: true, questions: {
                    select: { id: true }
                }
            }
        });
    }

    static async getByIdForStudent(id: string) {
        return prisma.quiz.findUnique({
            where: { id },
            select: {
                id: true, name: true, duration: true, questions: {
                    select: {
                        id: true, statement: true, options: true
                    }
                }
            }
        });
    }
    static async getAllQuestions(quizId: string) {
        return prisma.question.findMany({
            where: { quizId },
            select: {
                id: true, answer: true, score: true
            }
        });
    }

    static async getQuizParticipants(quizId: string, studentId: string) {
        return await prisma.quizParticipant.findUnique({
            where: {
                quizId_studentId: {
                    quizId,
                    studentId,
                },
            },
            include: {
                quiz: {
                    include: {
                        questions: {
                            orderBy: {
                                createdAt: 'asc', // or any order you prefer
                            },
                        },
                    },
                },
                student: true,
            },
        });
    }

    static async getQuizResponse(studentId: string, quizId: string) {
        return prisma.studentResponse.findMany({
            where: {
                studentId, question: {
                    quizId
                }
            }, include: {
                question: {
                    select: { id: true, statement: true, options: true, answer: true }
                }
            }
        });
    }

    static async getAllQuizParticipants(studentId: string) {
        return await prisma.quizParticipant.findMany({
            where: {
                studentId,
                submittedAt: { not: null },
            },
            include: {
                quiz: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        questions: {
                            select: {
                                id: true,
                                score: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                submittedAt: 'desc',
            },
        });
    }
    static async countScoresAndCorrectAnswer(studentId: string, quizId: string) {
        return await prisma.studentResponse.aggregate({
            where: {
                studentId,
                question: {
                    quizId,
                },
            },
            _sum: {
                score: true,
            },
            _count: {
                _all: true,
            },
        });
    }

    static async countTotalCorrectAnswer(studentId: string, quizId: string) {
        return await prisma.studentResponse.count({
            where: {
                studentId,
                question: {
                    quizId,
                },
                isCorrect: true,
            },
        });
    }
}