import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { config } from "../config";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError
} from "@prisma/client/runtime/library";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = "Something went wrong";
  let errors: string[] = [];

  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": { // Unique constraint failed
        statusCode = 409;
        const target = err.meta?.target as string[] | undefined;
        const field = target && target.length > 0 ? target[0] : "field";
        message = `A record with this ${field} already exists`;
        errors.push(`Duplicate value for ${field}`);
        break;
      }

      case "P2003": { // Foreign key constraint failed
        statusCode = 400;
        const field = err.meta?.field_name as string | undefined;
        message = field
          ? `Invalid value for ${field}: referenced record does not exist`
          : "Invalid reference to related record";
        if (field) errors.push(`Foreign key constraint failed on ${field}`);
        break;
      }

      case "P2025": { // Record not found
        statusCode = 404;
        const cause = err.meta?.cause as string | undefined;
        message = cause || "Requested resource not found";
        if (cause) errors.push(cause);
        break;
      }

      case "P2000": { // Value too long for column
        statusCode = 400;
        const field = err.meta?.column_name as string | undefined;
        message = field
          ? `Value for ${field} is too long`
          : "Input value is too long";
        if (field) errors.push(`Value exceeds maximum length for ${field}`);
        break;
      }

      case "P2001": { // Record searched for does not exist
        statusCode = 404;
        const field = err.meta?.model_name as string | undefined;
        message = field
          ? `${field} not found`
          : "Record not found";
        break;
      }

      case "P2011": { // Null constraint violation
        statusCode = 400;
        const field = err.meta?.constraint as string | undefined;
        message = field
          ? `${field} is required and cannot be null`
          : "Required field is missing";
        if (field) errors.push(`Null constraint violation for ${field}`);
        break;
      }

      case "P2012": { // Missing required value
        statusCode = 400;
        const field = err.meta?.path as string | undefined;
        message = field
          ? `${field} is required`
          : "Missing required field";
        if (field) errors.push(`Required value missing for ${field}`);
        break;
      }

      case "P2014": { // Invalid relation
        statusCode = 400;
        const relation = err.meta?.relation_name as string | undefined;
        message = relation
          ? `Invalid relation: ${relation}`
          : "Invalid relationship between records";
        break;
      }

      default:
        statusCode = 400;
        message = "Database request error";
        if (err.meta) {
          errors.push(JSON.stringify(err.meta));
        }
    }
  } else if (err instanceof PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided";

    // Extract field info from validation error message
    const fieldMatch = err.message.match(/Argument `(\w+)`/);
    if (fieldMatch) {
      const field = fieldMatch[1];
      message = `Invalid value provided for ${field}`;
      errors.push(err.message);
    }
  } else if (err instanceof PrismaClientInitializationError) {
    statusCode = 500;
    message = "Database connection error";
  } else if (err instanceof PrismaClientRustPanicError) {
    statusCode = 500;
    message = "Unexpected database error";
  } else {
    if (!config.isProduction) {
      message = err?.message || message;
      errors.push(err?.message);
    }
  }

  logger.error("Error:", {
    error: err,
    code: err.code,
    meta: err.meta,
    path: req.originalUrl
  });

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errors.length > 0 && !config.isProduction && { errors }),
    timeStamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};