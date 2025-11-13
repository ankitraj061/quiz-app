import jwt from "jsonwebtoken";
import { config } from "../config";
import { JwtPayload } from "../types/auth.types";

export function generateToken(payload: JwtPayload) {
    return jwt.sign(payload, config.jwtSecret, {
        expiresIn: "7d",
    });
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch (error) {
        return null;
    }
}