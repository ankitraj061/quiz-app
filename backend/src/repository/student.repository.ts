import { primitiveTypes } from "zod/v4/core/util.cjs";
import { prisma } from "../db/prisma"
import { TResponseData, TStudent, TStudentCreate } from "../types/student.types"

export class StudentRepository {
    static createTeam = async (data: Omit<Omit<TStudentCreate, "students">, "password">) => {
        return prisma.team.create({
            data: {
                ...data
            }
        });

    }
    static create = async (data: TStudent[], password: string) => {
        return prisma.student.createMany({ data: data.map((d) => ({ ...d, password })) });
    }

    static getByPhone = async (phone: string) => {
        return prisma.student.findUnique({ where: { phone } })
    }

    static getByEmail = async (email: string) => {
        return prisma.student.findUnique({ where: { email } });
    }
    static getById = async (id: string) => {
        return prisma.student.findUnique({ where: { id } });
    }
    static getTeamByStudentId = async (id: string | null | undefined) => {
        if (!id) {
            return null
        }
        return prisma.team.findFirst({ where: { id } });
    }

    static async saveStudentResponse(data: TResponseData[]) {
        return prisma.studentResponse.createMany({
            data
        });
    };

    static async addParticipant(quizId: string, teamId: string | null, studentId: string, totalScore: number, submittedAt: string) {
        return await prisma.quizParticipant.create({
            data: {
                quizId, totalScore, teamId, studentId, submittedAt
            }
        })
    }

    static async getTeamById(teamId: string) {
        return await prisma.student.findMany({
            where: {
                teamId
            }, select: {
                id: true, name: true, email: true, phone: true, teamId: true, isTeamLeader: true
            }
        });
    }

    static async markTeamAsVerified(teamId: string) {
        // Verifies ALL students in the team at once
        return prisma.student.updateMany({
            where: { teamId: teamId },
            data: { isVerified: true }
        });
    }
}

