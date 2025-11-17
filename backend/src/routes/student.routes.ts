import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { ZStudentCreate } from "../types/student.types";
import { asyncHandler } from "../utils/asyncHandler";
import { StudentController } from "../controllers/student.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { ZUserLogin } from "../types/auth.types";
import { roleRequired } from "../middlewares/requiredRole.middleware";

const router = Router();

router.route("/")
    .post(validate(ZStudentCreate), asyncHandler(StudentController.createStudent));

router.route("/auth/login")
    .post(validate(ZUserLogin), asyncHandler(StudentController.loginStudent));

router.route("/quiz")
    .get(authenticateToken, roleRequired("STUDENT"), asyncHandler(StudentController.getQuizForStudents));

router.route("/quiz/submit")
    .post(authenticateToken, roleRequired("STUDENT"), asyncHandler(StudentController.submitQuiz));

router.route("/quiz-response")
    .get(authenticateToken, roleRequired("STUDENT"), asyncHandler(StudentController.getAllQuizResponse));

router.route("/quiz-detail/:quizId")
    .get(authenticateToken, roleRequired("STUDENT"), asyncHandler(StudentController.getQuizDetail));

router.route("/quiz-response/:quizId")
    .get(authenticateToken,  roleRequired("STUDENT"), asyncHandler(StudentController.getQuizResponse));

router.route('/verify-email')
    .get(asyncHandler(StudentController.verifyEmail));

router.route("/resend-link")
    .post(asyncHandler(StudentController.resendVerificationLink));

export default router;