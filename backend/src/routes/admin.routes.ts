import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ZCreateAdmin, ZUserLogin } from "../types/auth.types";
import { validate } from "../middlewares/validate.middleware";
import { AdminController } from "../controllers/admin.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.route("/auth/login")
    .post(validate(ZUserLogin), asyncHandler(AdminController.loginAdmin));
    
router.route("/")
    .post(authenticateToken, validate(ZCreateAdmin), asyncHandler(AdminController.createAdmin));
export default router;