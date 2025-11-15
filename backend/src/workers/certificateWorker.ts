import { parentPort } from "worker_threads";
import { logger } from "../utils/logger";
import { CertificateGeneratorPayload } from "../types/quiz.types";
import { generateCertificate } from "../services/pdfGenerator.service";
import { s3Service } from "../services/s3.service";
import { config } from "../config";
import { mailClient } from "../services/ses.service";
import { sanitizeS3KeySegment } from "../utils/helper";

logger.info("Certificate worker started...");


parentPort?.on("message", async (payload: CertificateGeneratorPayload) => {
    logger.info(`Certificate Generation received for ${payload.studentName}`);

    try {
        const pdfBuffer = await generateCertificate(payload.teamName, payload.studentName, payload.quizTitle, payload.completionDate, payload.score);
        logger.info("PDF generation successful.");
        logger.info("Uploading pdf to S3.");
        const cleanQuizTitle = sanitizeS3KeySegment(payload.quizTitle);
        const cleanTeamName = sanitizeS3KeySegment(payload.teamName);
        const cleanStudentName = sanitizeS3KeySegment(payload.studentName);

        const pdfUrl = await s3Service.uploadToS3(pdfBuffer, `certificates/${cleanQuizTitle}/${cleanTeamName}/${cleanStudentName}`);
        logger.info("S3 upload successful.", { pdfUrl });

        
        logger.info("Sending email to the student.");
        const emailBody = `
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <p>Dear ${payload.studentName},</p>
                <p>Congratulations on participating in <strong>${payload.quizTitle}</strong>!</p>
                <p>Here is your certificate of participation: <a href=${pdfUrl}>Certificate</a>.</p>
                <br>
                <p>Keep shining,<br><strong>PW IOI Team</strong></p>
            </body>
            </html>
        `;

        const params = {
            Source: config.fromEmail,
            Destination: {
                ToAddresses: [payload.studentEmail]
            },
            Message: {
                Subject: {
                    Data: `Your PW - DARE TO SHINE Certificate is Here!`,
                    Charset: 'UTF-8'
                },
                Body: {
                    Html: {
                        Data: emailBody,
                        Charset: 'UTF-8'
                    }
                }
            }
        }
        await mailClient.sendEmail(params, payload.studentEmail);
        logger.info("Successfully sent mail.");

        parentPort?.postMessage({
            status: "done",
            studentId: payload.studentId,
            quizId: payload.quizId,
            pdfUrl,
        });
    } catch (error) {
        parentPort?.postMessage({
            status: "error",
            userId: payload.studentId,
            error: error instanceof Error ? error.message : "Unexpected error occurred."
        });
    }
})