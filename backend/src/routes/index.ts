import { Router } from "express";
import studentRouter from "./student.routes";
import adminRouter from "./admin.routes";
import authRouter from "./auth.routes";
import quizRouter from "./quiz.routes";

export const router = Router();

router.use("/admin", adminRouter);
router.use("/student", studentRouter);
router.use("/auth", authRouter);
router.use("/quiz", quizRouter);
