import { BASE_URL } from "@/utils/const";
import { ForgotPasswordData, ResendOtpData, ResetPasswordData, SigninData, SignupData, VerifyOtpData } from "@/utils/interface/auth.interface";


export const authService = {
    async signup(data: SignupData) {
        const response = await fetch(`${BASE_URL}/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
    },

    async verify(data: VerifyOtpData) {
        const response = await fetch(`${BASE_URL}/auth/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
    },

    async resendOtp(data: ResendOtpData) {
        const response = await fetch(`${BASE_URL}/auth/resend-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
    },

    async signin(data: SigninData) {
        const response = await fetch(`${BASE_URL}/auth/signin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
    },

    async getProfile(token: string) {
        const response = await fetch(`${BASE_URL}/auth/profile`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result.data;
    },

    async forgotPassword(data: ForgotPasswordData) {
        const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
    },

    async resetPassword(data: ResetPasswordData) {
        const response = await fetch(`${BASE_URL}/auth/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
    }
}