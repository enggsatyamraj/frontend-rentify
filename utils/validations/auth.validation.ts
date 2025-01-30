import { z } from 'zod';

const nameSchema = {
    firstName: z.string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name cannot exceed 50 characters")
        .regex(/^[a-zA-Z\s]*$/, "First name can only contain letters and spaces")
        .transform(val => val.trim()),

    lastName: z.string()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name cannot exceed 50 characters")
        .regex(/^[a-zA-Z\s]*$/, "Last name can only contain letters and spaces")
        .transform(val => val.trim())
};

const emailSchema = {
    email: z.string()
        .email("Invalid email address")
        .max(100, "Email cannot exceed 100 characters")
        .transform(val => val.trim())
};

const passwordSchema = {
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password cannot exceed 100 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
        .refine(val => !val.includes(' '), "Password cannot contain spaces")
};

const otpSchema = {
    otp: z.string()
        .length(6, "OTP must be 6 digits")
        .regex(/^\d+$/, "OTP must contain only numbers")
        .transform(val => val.trim())
};

// New schema for new password
const newPasswordSchema = {
    newPassword: z.string()
        .min(8, "New password must be at least 8 characters")
        .max(100, "New password cannot exceed 100 characters")
        .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
        .regex(/[a-z]/, "New password must contain at least one lowercase letter")
        .regex(/[0-9]/, "New password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "New password must contain at least one special character")
        .refine(val => !val.includes(' '), "New password cannot contain spaces")
};

export const signupSchema = z.object({
    ...nameSchema,
    ...emailSchema,
    ...passwordSchema,
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

export const signinSchema = z.object({
    ...emailSchema,
    password: z.string().min(1, "Password is required")
});

export const verifyOtpSchema = z.object({
    ...emailSchema,
    ...otpSchema
});

export const resendOtpSchema = z.object({
    ...emailSchema
});

// New schema for forgot password
export const forgotPasswordSchema = z.object({
    ...emailSchema
});

// New schema for reset password
export const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"),
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password cannot exceed 100 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
        .refine(val => !val.includes(' '), "Password cannot contain spaces")
});

// Inferred types
export type SignupFormData = z.infer<typeof signupSchema>;
export type SigninFormData = z.infer<typeof signinSchema>;
export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;
export type ResendOtpFormData = z.infer<typeof resendOtpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const validateForm = async <T>(
    schema: z.ZodSchema<T>,
    data: T
): Promise<{ success: boolean; error?: string }> => {
    try {
        await schema.parseAsync(data);
        return { success: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message };
        }
        return { success: false, error: 'Validation failed' };
    }
};