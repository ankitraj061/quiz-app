import AWS, { SNS } from "aws-sdk";
import { config } from "../config";
import { logger } from "./logger";
import { OtpStore } from "../types/auth.types";

class OtpHandler {
    private static instance: OtpHandler;
    private otpStore: Map<string, OtpStore> = new Map();
    private sns: SNS | undefined;

    private constructor() {
        this.initialiseSns();
    }
    
    private initialiseSns() {
        try {
            AWS.config.update({
                region: config.awsRegion,
                accessKeyId: config.awsAccessKeyId,
                secretAccessKey: config.awsSecretAccessKey
            });
            this.sns = new SNS();
        } catch (error) {
            logger.error("Failed to initialise SNS client", { error });
        }

    }
    public static getInstance() {
        if (!this.instance) {
            this.instance = new OtpHandler();
        }
        return this.instance;
    }


    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendOTP(phoneNumber: string, otp: string) {
        if (!this.sns) {
            logger.error("SNS is not initialised, retrying..");
            this.initialiseSns();
            if (!this.sns) {
                logger.error("SNS initialisation failed, check for the errors.");
                return;
            }
        }

        const params = {
            Message: `Your OTP is: ${otp}. Valid for 5 minutes.`,
            PhoneNumber: phoneNumber,
            MessageAttributes: {
                'AWS.SNS.SMS.SMSType': {
                    DataType: 'String',
                    StringValue: 'Transactional' 
                }
            }
        };

        try {
            const result = await this.sns.publish(params).promise();
            console.log('SMS sent:', result.MessageId);
            return { success: true, messageId: result.MessageId };
        } catch (error) {
            console.error('Error sending SMS:', error);
            throw error;
        }
    }

    storeOtp(phoneNumber: string, otp: string) {
        const expiresAt = Date.now  () * 5 * 60 * 1000;
        this.otpStore.set(phoneNumber, {
            otp,
            expiresAt,
            attempts: 0
        })
    }

    getOtpData(phoneNumber: string) {
        return this.otpStore.get(phoneNumber);
    }
    deleteOtp(phoneNumber: string) {
        this.otpStore.delete(phoneNumber);
    }
    setOtpAttempt(phoneNumber: string, attempts: number) {
        const otpData = this.getOtpData(phoneNumber);
        if (!otpData) {
            return false;
        }
        this.otpStore.set(phoneNumber, {
            ...otpData, attempts: attempts
        })
        return true;
    }
    
}

export const otpHandler = OtpHandler.getInstance();