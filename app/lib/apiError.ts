import { ApiErrorResponse } from "@/types/apiTypes";

/**
 * Custom API Error class with structured error data
 */
export class ApiError extends Error {
    statusCode: number;
    errors?: string[];
    timestamp?: string;
    path?: string;

    constructor(
        message: string,
        statusCode: number,
        errors?: string[],
        timestamp?: string,
        path?: string
    ) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.errors = errors;
        this.timestamp = timestamp;
        this.path = path;

        // Maintains proper stack trace for where our error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }
}

/**
 * Handles API errors by parsing the response and throwing a structured error
 * @param res - Fetch Response object
 * @param context - Context message for better error reporting
 * @throws {ApiError} Structured error with status code and message
 */
export async function handleApiError(
    res: Response,
    context: string = "API request"
): Promise<never> {
    let errorData: ApiErrorResponse | null = null;

    try {
        errorData = await res.json();
    } catch (parseError) {
        // If JSON parsing fails, throw a generic error
        throw new ApiError(
            `${context} failed: ${res.status} ${res.statusText}`,
            res.status
        );
    }

    // Throw structured error with all available information
    throw new ApiError(
        errorData?.message || `${context} failed: ${res.status} ${res.statusText}`,
        errorData?.statusCode || res.status,
        errorData?.errors,
        errorData?.timeStamp.toString(),
        errorData?.path
    );
}

/**
 * Safe JSON parser that handles non-JSON responses
 * @param res - Fetch Response object
 * @returns Parsed JSON data or null
 */
export async function safeJsonParse<T>(res: Response): Promise<T | null> {
    try {
        return await res.json();
    } catch (error) {
        console.error("Failed to parse JSON response:", error);
        return null;
    }
}
