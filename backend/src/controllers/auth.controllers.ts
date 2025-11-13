import { Request, Response } from "express";
import { otpHandler } from "../utils/otpUtils";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { HTTP_STATUS } from "../utils/httpCodes";
import { TVerifyOtp } from "../types/auth.types";
import { StudentRepository } from "../repository/student.repository";
import { AdminRepository } from "../repository/admin.repository";
import { generateToken } from "../utils/jwtUtils";
import { getCookieOptions } from "../config";
import { logger } from "../utils/logger";


export class AuthController {
    static async sendOtp(req: Request, res: Response) {
        const { phoneNumber } = req.body;
        const otp = otpHandler.generateOTP();
        otpHandler.storeOtp(phoneNumber, otp);
        const otpSent = await otpHandler.sendOTP(phoneNumber, otp);
        if (!otpSent) {
            throw new ApiError("Failed to generate OTP, please try again.")
        }

        ApiResponse.success(res, {}, "OTP sent successfully", HTTP_STATUS.CREATED);
    }

    static async verifyOtp(req: Request, res: Response) {
        const { phoneNumber, otp, role } = req.body as TVerifyOtp;
        const otpData = otpHandler.getOtpData(phoneNumber);

        let userId: string | undefined;
        if (role === "STUDENT") {
            const studentData = await StudentRepository.getByPhone(phoneNumber);
            if (!studentData) {
                throw new ApiError("No student exist with phone number please register first.", HTTP_STATUS.BAD_REQUEST);
            }
            userId = studentData.id;
        } else {
            const adminData = await AdminRepository.getByPhone(phoneNumber);
            if (!adminData) {
                throw new ApiError("No admin exist with phone number.", HTTP_STATUS.BAD_REQUEST);
            }
            userId = adminData.id;
        }

        if (!otpData) {
            throw new ApiError("OTP not found or expired", 401);
        }

        if (Date.now() > otpData.expiresAt) {
            otpHandler.deleteOtp(phoneNumber);
            throw new ApiError("OTP has expired", 401);
        }

        if (otpData.attempts > 3) {
            otpHandler.deleteOtp(phoneNumber);
            throw new ApiError("Too many failed attempts.", 429);
        }

        if (otpData.otp !== otp) {
            const succ = otpHandler.setOtpAttempt(phoneNumber, otpData.attempts + 1);
            if (!succ) {
                throw new ApiError("OTP not found, please generate again.");
            }
            throw new ApiError(`Invalid OTP, attempts left: ${4 - otpData.attempts}`)
        }

        otpHandler.deleteOtp(phoneNumber);
        const token = generateToken({ phoneNumber, userId, role, iat: Math.floor(Date.now() / 1000) });
        res.cookie('token', token, getCookieOptions());
        ApiResponse.success(res, { phoneNumber }, "OTP verification successful");
    }

    static async logout(req: Request, res: Response) {
        res.clearCookie('token', getCookieOptions());
        ApiResponse.success(res, "Logged out successfully");
    }

    static async getCurrentUser(req: Request, res: Response) {
        const user = req.user;
        if (!user) {
            throw new ApiError("Authentication Error");
        }
        logger.info("User ", user);
        let userData;
        let studentTeam;
        if (user.role === "STUDENT") {
            userData = await StudentRepository.getById(user.userId)
            studentTeam = await StudentRepository.getTeamByStudentId(userData?.teamId);
        } else {
            userData = await AdminRepository.getById(user.userId);
        }
        if (!userData) {
            throw new ApiError("No user found");
        }
      
        ApiResponse.success(res, { userData, team: studentTeam}, "Profile retrieved successfully.");
    }
} 