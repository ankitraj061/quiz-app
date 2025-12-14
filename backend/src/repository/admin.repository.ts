import { prisma } from "../db/prisma";
import { TCreateAdmin } from "../types/auth.types";

export class AdminRepository {
  static async getByPhone(phone: string) {
    return prisma.admin.findUnique({ where: { phone } });
  }
  static async getByEmail(email: string) {
    return prisma.admin.findUnique({ where: { email } });
  }
  static getById = async (id: string) => {
    return prisma.admin.findUnique({ where: { id } });
  };
  static getAuthById = async (id: string) => {
    return prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        password: true,
      },
    });
  };
  static create = async (data: TCreateAdmin) => {
    return prisma.admin.create({
      data,
    });
  };
  static updatePassword = async (adminId: string, hashedPassword: string) => {
    return prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedPassword },
    });
  };
}
