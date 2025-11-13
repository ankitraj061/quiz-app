import { Request, response, Response } from "express";
import { StudentRepository } from "../repository/student.repository";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { TResendLink, TResponseData, TStudentCreate, TSubmitQuiz } from "../types/student.types";
import { omit } from "../utils/objectManipilator";
import { generateToken } from "../utils/jwtUtils";
import { getCookieOptions } from "../config";
import { TUserLogin } from "../types/auth.types";
import { QuizController } from "./quiz.controller";
import { QuizRepository } from "../repository/quiz.repository";
import { HTTP_STATUS } from "../utils/httpCodes";
import { logger } from "../utils/logger";
import { PasswordUtils } from "../utils/password";
import { appEventEmitter, AppEvents } from "../events/eventEmitter";
import { VerificationTokenRepository } from "../repository/verificationToken.repository";

export class StudentController {
    static createStudent = async (req: Request, res: Response) => {
        const data = req.body as TStudentCreate;
        // filter leader
        const leader = data.students.filter((student) => student.isTeamLeader);
        if (leader.length === 0) {
            throw new ApiError("Atleast one of the student should be leader.");
        }
        if (leader.length >= 2) {
            throw new ApiError("Only one student can be leader.");
        }

        const team = await StudentRepository.createTeam(omit(data, ["students", "password"]));
        if (!team) {
            throw new ApiError("Failed to create team, please try again.");
        }
        const hashedPassword = await PasswordUtils.hash(data.password);

        const createdStudent = await StudentRepository.create(data.students.map((student) => ({
            ...student, teamId: team.id
        })), hashedPassword);

        if (!createdStudent) {
            throw new ApiError("Failed to register, please try again");
        }

        const createdTeam = await StudentRepository.getTeamById(team.id);
        const teamLeader = createdTeam.filter(stud => stud.isTeamLeader);

        // send verification link to only leader
        appEventEmitter.emit(AppEvents.SEND_EMAIL_VERIFICATION, {
            leader: teamLeader[0],
            teamName: data.teamName
        });

        // Send welcome email to other students
        appEventEmitter.emit(AppEvents.STUDENT_REGISTERED, {
            students: createdTeam.filter(student => !student.isTeamLeader),
            teamName: data.teamName,
            leaderName: teamLeader[0].name
        });

        ApiResponse.success(res, { team, studentAdded: createdStudent.count }, "Successfully created student.");
    }

    static loginStudent = async (req: Request, res: Response) => {
        const { email, phone, password } = req.body as TUserLogin;
        let student;
        if (email) {
            student = await StudentRepository.getByEmail(email);
        } else if (phone) {
            student = await StudentRepository.getByPhone(phone);
        }
        if (!student) {
            throw new ApiError("Invalid email or phone number, student doesn't exist.");
        }
        if (!student.isVerified) {
            throw new ApiError("Please verify your email before logging in. Check your inbox for the verification link.");
        }

        const passwordComparison = await PasswordUtils.compare(password, student.password);
        if (!passwordComparison) {
            throw new Error("Password not matched, pleae enter correct password");
        }
        const token = generateToken({ phoneNumber: student.phone, userId: student.id, role: "STUDENT", iat: Math.floor(Date.now() / 1000) });
        res.cookie('token', token, getCookieOptions());
        ApiResponse.success(res, {}, "Log in successful");
    }


    static async getQuizForStudents(req: Request, res: Response) {
        const studentId = QuizController.getUserId(req);
        const data = await QuizRepository.getAllQuizForStudents(studentId);
        if (!data) {
            throw new ApiError("Failed to get all the quiz for the students.");
        }
        ApiResponse.success(res, data, "Retrieved all the quiz for the students", 201);
    }

    static async getQuizDetail(req: Request, res: Response) {
        const quizId = req.params.quizId as string;
        const data = await QuizRepository.getByIdForStudent(quizId);
        if (!data) {
            throw new ApiError("No quiz exists with provided id, please send correct id.");
        }
        ApiResponse.success(res, data, "Successfully retrieved the quiz details.");
    }

    static async submitQuiz(req: Request, res: Response) {
        const studentId = QuizController.getUserId(req);

        const { quizId, response, submittedAt } = req.body as TSubmitQuiz;

        const [questions, student] = await Promise.all([QuizRepository.getAllQuestions(quizId), StudentRepository.getById(studentId)]);
        if (!student) {
            throw new ApiError("No student exists.");
        }

        if (!questions) {
            throw new ApiError("Failed to get questions.", HTTP_STATUS.BAD_REQUEST);
        }
        if (questions.length !== response.length) {
            throw new ApiError("Plaease answer all the questions.", HTTP_STATUS.BAD_REQUEST);
        }

        const studentAnswerMap: Record<string, string> = {};
        response.forEach((question) => {
            studentAnswerMap[question.questionId] = question.answer;
        });

        const responseDataOfStudent: TResponseData[] = [];
        let totalScore = 0;
        questions.forEach((question) => {
            const studentAnswer = studentAnswerMap[question.id];
            const responseData = {
                studentId,
                questionId: question.id,
                studentAnswer,
                isCorrect: (studentAnswer === question.answer),
                score: studentAnswer === question.answer ? question.score : 0
            };
            totalScore += responseData.score;
            responseDataOfStudent.push(responseData);
        });

        const createdStudentResponse = await StudentRepository.saveStudentResponse(responseDataOfStudent);

        if (createdStudentResponse.count !== response.length) {
            logger.error("Not all student response saved.");
            throw new ApiError("Failed to save all the question response.");
        }
        const quizParticipant = await StudentRepository.addParticipant(quizId, student.teamId, student.id, totalScore, submittedAt);
        if (!quizParticipant) {
            throw new ApiError("Failed to save the response, please try again.");
        }

        ApiResponse.success(res, {
            totalScore,
            response: responseDataOfStudent.map(res => ({ ...res, studentId: undefined }))
        })
    }

    static async getQuizResponse(req: Request, res: Response) {
        const quizId = req.params.quizId;
        const studentId = QuizController.getUserId(req);

        const quizParticipants = await QuizRepository.getQuizParticipants(quizId, studentId);
        if (!quizParticipants) {
            throw new ApiError("No response found");
        }
        const quizResponse = await QuizRepository.getQuizResponse(studentId, quizId);
        if (!quizResponse) {
            throw new ApiError("No quiz response found.");
        }
        const questionResponses = quizParticipants.quiz.questions.map((q) => {
            const response = quizResponse.find((r) => r.questionId === q.id);
            return {
                questionId: q.id,
                statement: q.statement,
                options: q.options as string[],
                correctAnswer: q.answer,
                userAnswer: response?.studentAnswer ?? null,
                isCorrect: response?.isCorrect ?? false,
                scoreAwarded: response?.score ?? 0,
            };
        });
        ApiResponse.success(res, {
            quiz: {
                id: quizParticipants.quiz.id,
                name: quizParticipants.quiz.name,
                description: quizParticipants.quiz.description,
                duration: quizParticipants.quiz.duration,
                totalPossibleScore: quizParticipants.quiz.questions.reduce((sum, q) => sum + q.score, 0),
            },
            totalScore: quizParticipants.totalScore,
            submittedAt: quizParticipants.submittedAt,
            student: {
                id: quizParticipants.student.id,
                name: quizParticipants.student.name
            },
            responses: questionResponses
        });
    }

    static async getAllQuizResponse(req: Request, res: Response) {
        const studentId = QuizController.getUserId(req);
        const participants = await QuizRepository.getAllQuizParticipants(studentId);
        if (!participants) {
            throw new ApiError("Failed to get all quiz responses.");
        }
        const quizHistory = await Promise.all(
            participants.map(async (participant) => {
                const totalQuestions = participant.quiz.questions.length;
                const totalPossibleScore = participant.quiz.questions.reduce(
                    (sum, q) => sum + q.score,
                    0
                );
                const responseStats = await QuizRepository.countScoresAndCorrectAnswer(studentId, participant.quizId);
                const totalCorrect = await QuizRepository.countTotalCorrectAnswer(studentId, participant.quizId);
                return {
                    quizId: participant.quiz.id,
                    quizName: participant.quiz.name,
                    quizDescription: participant.quiz.description,
                    submittedAt: participant.submittedAt,
                    totalQuestions,
                    totalCorrectAnswers: totalCorrect,
                    totalObtainedScore: responseStats._sum.score ?? 0,
                    totalPossibleScore,
                };
            })
        );
        ApiResponse.success(res, quizHistory, "Successfully fetched quiz history.");
    }

    static verifyEmail = async (req: Request, res: Response) => {
        const { token } = req.query;
        logger.info("Verification request", { token });

        if (!token || typeof token !== 'string') {
            throw new ApiError("Invalid verification token");
        }

        // Find token
        const verificationToken = await VerificationTokenRepository.findByToken(token);
        if (!verificationToken) {
            throw new ApiError("Invalid or expired verification token");
        }
        logger.info("Verification token find ", { verificationToken });

        if (!verificationToken.student.teamId) {
            throw new ApiError("No Team exists, please join some team.");
        }
        // Mark token as verified
        await VerificationTokenRepository.markAsVerified(verificationToken.id);
        logger.info("Token Verified");

        // Update student as verified
        StudentRepository.markTeamAsVerified(verificationToken.student.teamId);
        logger.info("All team members marked as verified.");

        ApiResponse.success(res, null, "Email verified successfully");
    };

    static resendVerificationLink = async (req: Request, res: Response) => {
        const { email } = req.body as TResendLink;
        const student = await StudentRepository.getByEmail(email);
        if (!student) {
            throw new ApiError("No student exists with given email.");
        }
        if (!student.teamId) {
            throw new ApiError("Please join some team to verify your account.");
        }
        if (!student.isTeamLeader) {
            throw new ApiError("Only leader can request to resend the link, please contact leader of your team.");
        }
        const team = await StudentRepository.getTeamById(student.teamId);
        console.log(team);
        
        const teamDetail = await StudentRepository.getTeamByStudentId(student.teamId);
        console.log(teamDetail);
        if (!team || !teamDetail) {
            throw new ApiError("No team found.");
        }
        const teamLeader = team.filter(stud => stud.isTeamLeader);
        if (teamLeader.length === 0) {
            throw new ApiError("No team leader found.");
        }

        appEventEmitter.emit(AppEvents.SEND_EMAIL_VERIFICATION, {
            leader: teamLeader[0],
            teamName: teamDetail.teamName
        });

        // Send welcome email to other students
        appEventEmitter.emit(AppEvents.STUDENT_REGISTERED, {
            students: team.filter(student => !student.isTeamLeader),
            teamName: teamDetail.teamName,
            leaderName: teamLeader[0].name
        });
        ApiResponse.success(res, {}, "Verification link sent to leader's mail address.");
    }
}