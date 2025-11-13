import { prisma } from "../db/prisma";

export class AdminRepository {
    static async getByPhone(phone: string) {
        return prisma.admin.findUnique({ where: { phone } });
    }
    static async getByEmail(email: string) {
        return prisma.admin.findUnique({ where: { email } });
    }
    static getById = async (id: string) => {
        return prisma.admin.findUnique({ where: { id } });
    }
}