import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ZUserLogin } from "../types/auth.types";
import { validate } from "../middlewares/validate.middleware";
import { AdminController } from "../controllers/admin.controller";

const router = Router();

router.route("/auth/login")
    .post(validate(ZUserLogin), asyncHandler(AdminController.loginAdmin));
    
export default router;