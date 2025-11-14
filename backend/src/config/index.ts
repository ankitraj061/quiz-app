import dotenv from 'dotenv';
import { CookieOptions } from 'express';

dotenv.config();

export const config = {
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    port: Number(process.env.PORT) || 9090,
    isProduction: process.env.NODE_ENV === 'production',
    awsRegion: process.env.AWS_REGION,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3BucketName: process.env.AWS_S3_BUCKET_NAME,
    jwtSecret: process.env.JWT_SECRET || "my-session-secret",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    cookieMaxAge: Number(process.env.COOKIE_MAX_AGE),

    subDomain: process.env.SUB_DOMAIN,

    fromEmail: process.env.FROM_EMAIL!,
}


export const cookieOptionsDev: CookieOptions = {
    httpOnly: true,
    secure: false, // HTTP allowed in development
    sameSite: 'lax', // Allows cross-origin in development
    maxAge: config.cookieMaxAge,
    path: '/'
}

export const cookieOptionsProd: CookieOptions = {
    httpOnly: true,
    secure: true, // HTTPS only
    sameSite: 'strict', // Strict in production
    maxAge: config.cookieMaxAge,
    path: '/',
    domain: config.subDomain // Share across subdomains
}

export const getCookieOptions = (): CookieOptions => {
    return config.isProduction ? cookieOptionsProd : cookieOptionsDev;
}

export const corsOptions = {
    origin: config.frontendUrl, // Must match frontend exactly
    credentials: true, // MUST BE TRUE
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    // exposedHeaders: ['Set-Cookie']
}