import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  ZChangePassword,
  ZCreateAdmin,
  ZUserLogin,
  ZVerifyPassword,
} from "../types/auth.types";
import { validate } from "../middlewares/validate.middleware";
import { AdminController } from "../controllers/admin.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { roleRequired } from "../middlewares/requiredRole.middleware";

const router = Router();

router
  .route("/auth/login")
  .post(validate(ZUserLogin), asyncHandler(AdminController.loginAdmin));

router
  .route("/")
  .post(
    authenticateToken,
    roleRequired("ADMIN"),
    validate(ZCreateAdmin),
    asyncHandler(AdminController.createAdmin)
  );

router
  .route("/verify-password")
  .post(
    authenticateToken,
    roleRequired("ADMIN"),
    validate(ZVerifyPassword),
    asyncHandler(AdminController.verifyPassword)
  );

router
  .route("/change-password")
  .post(
    authenticateToken,
    roleRequired("ADMIN"),
    validate(ZChangePassword),
    asyncHandler(AdminController.changePassword)
  );

export default router;
