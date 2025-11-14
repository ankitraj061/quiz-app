import {
    S3Client,
    PutObjectCommand,
    PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { config } from "../config";
import { logger } from "../utils/logger";
import fs from "fs";

class S3Service {
    private static instance: S3Service;
    private s3Service: S3Client | undefined;

    constructor() {
        this.initialiseS3Service();
    }

    private initialiseS3Service() {
        try {
            this.s3Service = new S3Client({
                region: config.awsRegion,
                credentials: {
                    accessKeyId: config.awsAccessKeyId,
                    secretAccessKey: config.awsSecretAccessKey,
                },
            });
        } catch (error) {
            logger.error("Failed to initialise s3 instance.");
        }
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new S3Service();
        }
        return this.instance;
    }

    static async uploadToS3(localFilePath: string, key: string) {
        const service = this.getInstance();
        if (!service.s3Service) {
            service.initialiseS3Service();
        }
        if (!service.s3Service) {
            throw new Error("S3 client is not initialised");
        }
        const fileStream = fs.createReadStream(localFilePath);

        const uploadParams: PutObjectCommandInput = {
            Bucket: config.s3BucketName,
            Key: key,
            Body: fileStream,
            ContentType: "application/pdf",
            ACL: "public-read",
        };

        await service.s3Service.send(new PutObjectCommand(uploadParams));

        return `https://${config.s3BucketName}.s3.amazonaws.com/${key}`;
    }
}

export const s3Service = S3Service.getInstance(); 