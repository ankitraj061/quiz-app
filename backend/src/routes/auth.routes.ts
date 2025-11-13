import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { ZPhone, ZVerifyOtp } from "../types/auth.types";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthController } from "../controllers/auth.controllers";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.route("/request-otp")
    .post(validate(ZPhone), asyncHandler(AuthController.sendOtp));

router.route("/verify-otp")
    .post(validate(ZVerifyOtp), asyncHandler(AuthController.verifyOtp));

router.route("/logout")
    .get(asyncHandler(AuthController.logout));
    
router.route("/me")
    .get(authenticateToken, asyncHandler(AuthController.getCurrentUser));

export default router;