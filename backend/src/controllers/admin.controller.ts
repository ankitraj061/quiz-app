import { Request, Response } from "express";
import { TUserLogin } from "../types/auth.types";
import { AdminRepository } from "../repository/admin.repository";
import { ApiError } from "../utils/ApiError";
import { generateToken } from "../utils/jwtUtils";
import { getCookieOptions } from "../config";
import { ApiResponse } from "../utils/ApiResponse";


export class AdminController {
    static async loginAdmin(req: Request, res: Response) {
        const data = req.body as TUserLogin;
        let admin;

        if (data.email) {
            admin = await AdminRepository.getByEmail(data.email);
        } else if (data.phone) {
            admin = await AdminRepository.getByPhone(data.phone)
        }

        if (!admin) {
            throw new ApiError("Invalid email or phone number, admin doesn't exist.");
        }
        if (data.password !== admin.password) {
            throw new Error("Password not matched, pleae enter correct password");
        }
        const token = generateToken({ phoneNumber: admin.phone, userId: admin.id, role: "ADMIN", iat: Math.floor(Date.now() / 1000) });
        res.cookie('token', token, getCookieOptions());
        ApiResponse.success(res, {}, "Log in successful");
    }
}