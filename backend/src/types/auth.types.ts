import z from "zod";

export const ZPhone = z.object({
    phoneNumber: z
        .string()
        .regex(
            /^(?:\+91[\-\s]?)?[6-9]\d{9}$/,
            "Please enter a valid phone number."
        ),
});

export const ZVerifyOtp = z.object({
    phoneNumber: z
        .string()
        .regex(
            /^(?:\+91[\-\s]?)?[6-9]\d{9}$/,
            "Please enter a valid phone number."
        ),
    otp: z.string().length(6, "Only 6 digit OTP is allowed."),
    role: z.enum(["STUDENT", "ADMIN"])
})

export const ZUserLogin = z
  .object({
    email: z.string().email("Invalid email format").optional().or(z.literal("")),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits").optional().or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone number is required",
  });

export type TPhone = z.infer<typeof ZPhone>; 
export type TVerifyOtp = z.infer<typeof ZVerifyOtp>; 
export type OtpStore = {
    attempts: number,
    otp: string,
    expiresAt: number
};

export type JwtPayload = {
    phoneNumber: string,
    iat: number,
    userId: string,
    role: "STUDENT" | "ADMIN"
};

export type TUserLogin = z.infer<typeof ZUserLogin>;