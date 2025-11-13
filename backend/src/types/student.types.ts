import { CostExplorer } from "aws-sdk";
import z from "zod";

export const ZStudent = z.object({
  name: z.string().min(2),
  email: z.email(),
  phone: z
    .string()
    .regex(
      /^(?:\+91[\-\s]?)?[6-9]\d{9}$/,
      "Please enter a valid phone number."
    ),
  isTeamLeader: z.boolean().default(false),
  teamId: z.uuid().optional(),
});

export const ZStudentCreate = z.object({
  teamName: z.string().min(2, "The name should have at least length of 2."),
  schoolName: z.string().optional(),
  class: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  students: z.array(ZStudent).min(2),
  password: z.string().min(6, "The password should have atleast length of 6.")
});

export const ZSubmitQuiz = z.object({
  quizId: z.uuid(),
  submittedAt: z.string(),
  response: z.array(z.object({
    questionId: z.uuid(),
    answer: z.string()
  }))
});

export const ZResendLink = z.object({
  email: z.email(),
});


export type TStudentCreate = z.infer<typeof ZStudentCreate>;
export type TStudent = z.infer<typeof ZStudent>;
export type TSubmitQuiz = z.infer<typeof ZSubmitQuiz>;
export type TResponseData = {
  studentId: string,
  questionId: string,
  studentAnswer: string,
  isCorrect: boolean,
  score: number
}
export type TResendLink = z.infer<typeof ZResendLink>;