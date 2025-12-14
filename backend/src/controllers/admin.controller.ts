import { Request, Response } from "express";
import {
  TChangePassword,
  TCreateAdmin,
  TUserLogin,
  TVerifyPassword,
} from "../types/auth.types";
import { AdminRepository } from "../repository/admin.repository";
import { ApiError } from "../utils/ApiError";
import { generateToken } from "../utils/jwtUtils";
import { getCookieOptions } from "../config";
import { ApiResponse } from "../utils/ApiResponse";
import { PasswordUtils } from "../utils/password";
import { HTTP_STATUS } from "../utils/httpCodes";

export class AdminController {
  static async loginAdmin(req: Request, res: Response) {
    const data = req.body as TUserLogin;
    let admin;

    if (data.email) {
      admin = await AdminRepository.getByEmail(data.email);
    } else if (data.phone) {
      admin = await AdminRepository.getByPhone(data.phone);
    }

    if (!admin) {
      throw new ApiError(
        "Invalid email or phone number, admin doesn't exist.",
        HTTP_STATUS.BAD_REQUEST
      );
    }
    const passwordComparison = await PasswordUtils.compare(
      data.password,
      admin.password
    );
    if (!passwordComparison) {
      throw new Error("Password not matched, pleae enter correct password");
    }
    const token = generateToken({
      phoneNumber: admin.phone,
      userId: admin.id,
      role: "ADMIN",
      iat: Math.floor(Date.now() / 1000),
    });
    res.cookie("token", token, getCookieOptions());
    ApiResponse.success(res, {}, "Log in successful");
  }

  static async createAdmin(req: Request, res: Response) {
    const data = req.body as TCreateAdmin;
    const hashedPassword = await PasswordUtils.hash(data.password);

    const adminCreate = await AdminRepository.create({
      ...data,
      password: hashedPassword,
    });
    if (!adminCreate) {
      throw new ApiError("Failed to create admin, please try again.");
    }
    ApiResponse.success(
      res,
      { email: adminCreate.email, password: data.password },
      "Admin created successfully."
    );
  }

  static async verifyPassword(req: Request, res: Response) {
    const adminId = (req as any).user?.userId as string;
    const { currentPassword } = req.body as TVerifyPassword;

    const admin = await AdminRepository.getAuthById(adminId);
    if (!admin) {
      throw new ApiError("Admin not found", HTTP_STATUS.NOT_FOUND);
    }

    const isValid = await PasswordUtils.compare(
      currentPassword,
      admin.password
    );
    if (!isValid) {
      throw new ApiError(
        "Current password is incorrect",
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    ApiResponse.success(res, {}, "Password verified");
  }

  static async changePassword(req: Request, res: Response) {
    const adminId = (req as any).user?.userId as string;
    const { currentPassword, newPassword } = req.body as TChangePassword;

    const admin = await AdminRepository.getAuthById(adminId);
    if (!admin) {
      throw new ApiError("Admin not found", HTTP_STATUS.NOT_FOUND);
    }

    const isValid = await PasswordUtils.compare(
      currentPassword,
      admin.password
    );
    if (!isValid) {
      throw new ApiError(
        "Current password is incorrect",
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const hashedPassword = await PasswordUtils.hash(newPassword);
    await AdminRepository.updatePassword(adminId, hashedPassword);

    ApiResponse.success(res, {}, "Password updated successfully");
  }
}
