export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    isVerified: string;
    token: string;
}

export interface SignupData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    confirmPassword: string;
}

export interface SigninData {
    email: string;
    password: string;
}

export interface VerifyOtpData {
    email: string;
    otp: string;
}

export interface ResendOtpData {
    email: string;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    email: string;
    otp: string;
    newPassword: string;
}
