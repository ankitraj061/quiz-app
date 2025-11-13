import express, { json, urlencoded } from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config, corsOptions } from "./config";
import { JwtPayload } from "./types/auth.types";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload
        }
    }
}

export const app = express();

app
    .use(cookieParser())
    .use(cors(corsOptions))
    .use(json())
    .use(urlencoded())
    .use(helmet())
    .get("/", (req, res) => {
        res.json({
            message: "Backend of quiz app is running",
            success: true,
        });
    })
    .get("/health", (req, res) => {
        res.json({
            message: "Backend of quiz app is running and it's healthy",
            success: true,
        });
    });


