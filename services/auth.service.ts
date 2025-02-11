import { BASE_URL } from "@/utils/const";
import { ForgotPasswordData, ResendOtpData, ResetPasswordData, SigninData, SignupData, VerifyOtpData } from "@/utils/interface/auth.interface";
import { UpdateProfileFormData } from "@/utils/validations/auth.validation";


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
        const response = await fetch(`${BASE_URL}/auth/user-details`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        console.log("get profile is hitted")
        const result = await response.json();
        console.log("get profile result::::::::::", result);
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
    },

    // async updateProfile(data: UpdateProfileFormData, token: string | null) {
    //     // Transform coordinates to GeoJSON format if present
    //     if (data.address?.coordinates) {
    //         data.address.location = {
    //             type: 'Point',
    //             coordinates: [data.address.coordinates.longitude, data.address.coordinates.latitude]
    //         };
    //         delete data.address.coordinates;
    //     }

    //     const response = await fetch(`${BASE_URL}/auth/update`, {
    //         method: 'PUT',
    //         headers: {
    //             'Authorization': `Bearer ${token}`,
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(data)
    //     });

    //     const result = await response.json();
    //     console.log("Update Profile Result:", result);
    //     if (!response.ok) throw new Error(result.message);
    //     return result;
    // }

    async updateProfile(data: UpdateProfileFormData | FormData, token: string | null) {
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`
        };

        // Check if data is FormData (for image upload)
        if (!(data instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
            // Transform coordinates to GeoJSON format if present
            if (data.address?.coordinates) {
                // @ts-ignore
                data.address.location = {
                    type: 'Point',
                    coordinates: [data.address.coordinates.longitude, data.address.coordinates.latitude]
                };
                delete data.address.coordinates;
            }
        }

        const response = await fetch(`${BASE_URL}/auth/update`, {
            method: 'PUT',
            headers,
            body: data instanceof FormData ? data : JSON.stringify(data)
        });

        const result = await response.json();
        console.log("Update Profile Result:", result);
        if (!response.ok) throw new Error(result.message);
        return result;
    }
}