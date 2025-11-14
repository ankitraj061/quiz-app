import { RequestHandler } from "express";

export function roleRequired(role: "STUDENT" | "ADMIN"): RequestHandler {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            res.status(401).json({
                success: false,
                statusCode: 401,
                message: "Failed to authenticate user",
                errors: [],
                timeStamp: new Date().toISOString(),
                path: req.originalUrl
            });
            return;
        }

        if (req.user?.role !== role) {
            res.status(401).json({
                success: false,
                statusCode: 401,
                message: "User is not allowed to perform the given task.",
                errors: [],
                timeStamp: new Date().toISOString(),
                path: req.originalUrl
            })
            return;
        }
        next();
    }
}