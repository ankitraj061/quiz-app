import { Student } from "@prisma/client";
import { VerificationTokenRepository } from "../../repository/verificationToken.repository";
import { mailClient } from "../../services/ses.service";
import { logger } from "../../utils/logger";
import { appEventEmitter, AppEvents } from "../eventEmitter";
import { config } from "../../config";
import { getVerficationMailTemplate, getWelcomeMailTemplate } from "../../templates/email.templates";



interface StudentWelcomePayload {
    teamName: string;
    leaderName: string; 
    students: Student[]
}

interface VerificationLinkPayload {
    teamName: string;
    leader: Student
}

// Event Listener for student upon registration
appEventEmitter.on(AppEvents.STUDENT_REGISTERED, async (payload: StudentWelcomePayload) => {
    try {
        console.log('Student registered event received:', payload);

        const sendEmailPromises: Promise<void>[] = [];
        // Send verification email to each student
        for (const student of payload.students) {

            const params = {
                Source: config.fromEmail,
                Destination: {
                    ToAddresses: [student.email]
                },
                Message: {
                    Subject: {
                        Data: `Welcome to Team ${payload.teamName}! 🎉`,
                        Charset: 'UTF-8'
                    },
                    Body: {
                        Html: {
                            Data: getWelcomeMailTemplate(student.name, payload.teamName, student.email, payload.leaderName),
                            Charset: 'UTF-8'
                        }
                    }
                }
            }

            // Send verification email
            sendEmailPromises.push(mailClient.sendEmail(params, student.email));
        }
        await Promise.all(sendEmailPromises);
        console.log('Welcome emails sent successfully');
    } catch (error) {
        console.error('Error in student welcome listener:', error);
        // Don't throw error to prevent blocking the registration response
    }
});

// Event Listener for leader upon registration, sending verification link
appEventEmitter.on(AppEvents.SEND_EMAIL_VERIFICATION, async (payload: VerificationLinkPayload) => {
    try {
        logger.info('Student registered event received, sending verification link to leader:', { payload });

        const student = payload.leader;
        // Send verification email to each student
        const token = mailClient.generateVerificationToken();

        // Store token in database
        await VerificationTokenRepository.create(student.id, student.email, token);

        const verificationLink = `${config.frontendUrl}/auth/student/verify-email?token=${token}`
        const params = {
            Source: config.fromEmail,
            Destination: {
                ToAddresses: [student.email]
            },
            Message: {
                Subject: {
                    Data: `Verify Your Team Registration - ${payload.teamName}`,
                    Charset: 'UTF-8'
                },
                Body: {
                    Html: {
                        Data: getVerficationMailTemplate(student.name, verificationLink, payload.teamName),
                        Charset: 'UTF-8'
                    }
                }
            }
        }
        // Send verification email
        await mailClient.sendEmail(params, student.email)
        logger.info('Verification email sent successfully');
        } catch (error) {
            logger.error('Error in student registered listener:', { error });
            // Don't throw error to prevent blocking the registration response
        }
    });