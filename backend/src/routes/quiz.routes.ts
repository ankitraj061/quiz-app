import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { QuizController } from "../controllers/quiz.controller";
import { ZCreateQuestion, ZCreateQuiz, ZQuestionUpdate, ZQuizUpdate } from "../types/quiz.types";
import { validate } from "../middlewares/validate.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.route("/")
    .post(validate(ZCreateQuiz), authenticateToken, asyncHandler(QuizController.createQuiz));

router.route("/")
    .get(asyncHandler(QuizController.getAllQuiz));
    
router.route("/leaderboard/:quizId")
    .get(asyncHandler(QuizController.getApplicantsOfQuiz));


router.route("/question")
    .post(validate(ZCreateQuestion), asyncHandler(QuizController.createQuestion));

router.route("/question/:questionId")
    .delete(asyncHandler(QuizController.deleteQuestion));

router.route("/question/:questionId")
    .patch(validate(ZQuestionUpdate), asyncHandler(QuizController.updateQuestion));

// get quiz with questions
router.route("/:quizId")
    .get(asyncHandler(QuizController.getCompleteQuiz));

router.route("/:quizId")
    .delete(asyncHandler(QuizController.deleteQuiz));
    
router.route("/:quizId")
    .patch(validate(ZQuizUpdate), asyncHandler(QuizController.updateQuiz));


export default router;