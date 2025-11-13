import z from "zod";


export const Question = z
  .object({
    id: z.uuid().optional(),
    statement: z.string().min(5, "The question statement should be descriptive."),
    options: z.array(z.string()).min(1, "At least one option is required."),
    answer: z.string(),
    score: z.coerce.number().int().optional(),
  })
  .refine((data) => data.options.includes(data.answer), {
    message: "Answer must be one of the provided options.",
    path: ["answer"],
  });

export const ZCreateQuiz = z.object({
  name: z.string().min(1),
  duration: z.int(),
  description: z.string().optional(),
  questions: z.array(Question).optional()
});

export const ZQuestionUpdate = Question.partial().refine(
  (data) => {
    // Only validate if both fields are provided
    if (data.options !== undefined && data.answer !== undefined) {
      return data.options.includes(data.answer);
    }
    return true; // Skip validation if either is missing
  },
  {
    message: "Answer must be one of the provided options.",
    path: ["answer"],
  }
);

export const ZCreateQuestion = z.object({
  questions: z.array(Question).min(1, "Send atleast one question to add"),
  quizId: z.uuid()
})

export const ZQuizUpdate = ZCreateQuiz.partial();


export type TCreateQuiz = z.infer<typeof ZCreateQuiz>;
export type TCreateQuestion = z.infer<typeof ZCreateQuestion>;
export type TQuestionUpdate = z.infer<typeof ZQuestionUpdate>;
export type TQuizUpdate = z.infer<typeof ZQuizUpdate>;
export type Question = z.infer<typeof Question>;