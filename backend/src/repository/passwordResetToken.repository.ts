import { prisma } from "../db/prisma";
import { v4 as uuidv4 } from "uuid";

export class PasswordResetTokenRepository {
  static async create(
    studentId: string,
    email: string,
    expiryMinutes: number = 30
  ) {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    return await prisma.passwordResetToken.create({
      data: {
        studentId,
        email,
        token,
        expiresAt,
      },
    });
  }

  static async findByToken(token: string) {
    return await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { student: true },
    });
  }

  static async markAsUsed(tokenId: string) {
    return await prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    });
  }

  static async deleteByStudentId(studentId: string) {
    return await prisma.passwordResetToken.deleteMany({
      where: { studentId },
    });
  }

  static async findByEmail(email: string) {
    return await prisma.passwordResetToken.findFirst({
      where: { email },
      include: { student: true },
    });
  }
}
