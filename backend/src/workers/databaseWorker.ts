import { parentPort } from "worker_threads";
import { logger } from "../utils/logger";
import { QuizRepository } from "../repository/quiz.repository";
import { StudentRepository } from "../repository/student.repository";

logger.info("Database worker started...");

export interface DbOperationPayload {
    pdfUrl: string;
    studentId: string;
    quizId: string;
}

parentPort?.on("message", async (payload: DbOperationPayload) => {
    logger.info(`Database updating for ${payload.studentId}`);

    try {
        
        const updatedData = await StudentRepository.markCertificateAsGenerated(payload.studentId, payload.quizId, payload.pdfUrl);
        logger.info("Successfully updated the database.");
        parentPort?.postMessage({
            status: "done",
            userId: payload.studentId
        });
    } catch (error) {
        parentPort?.postMessage({
            status: "error",
            userId: payload.studentId,
            error: error instanceof Error ? error.message: "Unexpected error occurred." 
        });
    }
})