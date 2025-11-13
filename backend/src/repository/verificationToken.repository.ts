import { prisma } from "../db/prisma";

export class VerificationTokenRepository {
    static async create(studentId: string, email: string, token: string) {
        // Token expires in 24 hours
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        return prisma.verificationToken.create({
            data: {
                studentId,
                email,
                token,
                expiresAt
            }
        });
    }

    static async findByToken(token: string) {
        return prisma.verificationToken.findFirst({
            where: {
                token,
                expiresAt: {
                    gt: new Date()
                },
                verifiedAt: null
            },
            include: {
                student: true
            }
        });
    }

    static async markAsVerified(tokenId: string) {
        return prisma.verificationToken.update({
            where: { id: tokenId },
            data: { verifiedAt: new Date() }
        });
    }
}