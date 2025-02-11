export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    isVerified: string;
    token: string;
    deviceToken?: string;
    phoneNumber?: string;
    profileImage?: string;
    aadharNumber?: string;
    dateOfBirth?: string;
    address?: {
        street?: string
        city?: string
        region?: string;
        country?: {
            type: string,
        },
        postalCode?: {
            type: string,
        },
        coordinates?: {
            latitude?: {
                type: number,
            },
            longitude?: {
                type: number,
            },
        },
    }
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
    deviceToken: string;
    deviceType: 'ios' | 'android' | 'web';
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
