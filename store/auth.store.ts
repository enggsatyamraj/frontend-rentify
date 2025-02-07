import { authService } from '@/services/auth.service';
import { ResendOtpData, SigninData, SignupData, User, VerifyOtpData } from '@/utils/interface/auth.interface';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

export const STORAGE_KEYS = {
    USER: '@auth_user',
    TOKEN: '@auth_token'
};

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;
    setUser: (user: User, token: string) => Promise<void>;
    signup: (data: SignupData) => Promise<{ success: boolean; message: string }>;
    verify: (data: VerifyOtpData) => Promise<{ success: boolean; message: string }>;
    signin: (data: SigninData) => Promise<{ success: boolean; message: string }>;
    resendOtp: (data: ResendOtpData) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    clearError: () => void;
    initializeAuth: () => Promise<boolean>;
    checkTokenValidity: () => Promise<boolean>;
}

interface JWTPayload {
    userId: string;
    exp: number;
    iat: number;
}

interface SigninResponse {
    success: boolean;
    message: string;
    token: string;
    user: {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
        // deviceToken?: string;
        phoneNumber?: string;
        profileImage?: string,
        aadharNumber?: string
    };
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isInitialized: false,

    checkTokenValidity: async () => {
        try {
            console.log("Checking token validity...");
            const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
            const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);

            console.log("Stored Token:", token);
            console.log("Stored User Data:", userData);

            if (!token || !userData) {
                console.log("No token or user data found");
                await get().logout();
                return false;
            }

            // Decode token
            const decodedToken = jwtDecode<JWTPayload>(token);
            const currentTime = Date.now() / 1000;

            console.log("Token expiration:", new Date(decodedToken.exp * 1000));
            console.log("Current time:", new Date(currentTime * 1000));

            if (decodedToken.exp < currentTime) {
                console.log("Token has expired");
                await get().logout();
                return false;
            }

            // If token is valid, restore the user state
            set({
                user: JSON.parse(userData),
                token: token
            });

            return true;
        } catch (error) {
            console.error('Error checking token validity:', error);
            await get().logout();
            return false;
        }
    },

    initializeAuth: async () => {
        try {
            set({ isLoading: true });
            const isValid = await get().checkTokenValidity();
            console.log("Token validity check result:", isValid);
            return isValid;
        } catch (error) {
            console.error('Error initializing auth:', error);
            return false;
        } finally {
            set({ isLoading: false, isInitialized: true });
        }
    },

    setUser: async (user: User, token: string) => {
        try {
            await AsyncStorage.multiSet([
                [STORAGE_KEYS.USER, JSON.stringify(user)],
                [STORAGE_KEYS.TOKEN, token]
            ]);
            set({ user, token });
            console.log("user data is setted in the local storage successfully.................")
            const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
            console.log("user data inside the setUser..................", userData);
        } catch (error) {
            console.error('Error saving auth data:', error);
            throw error;
        }
    },

    // initializeAuth: async () => {
    //     try {
    //         set({ isLoading: true });

    //         const [[, userStr], [, token]] = await AsyncStorage.multiGet([
    //             STORAGE_KEYS.USER,
    //             STORAGE_KEYS.TOKEN
    //         ]);

    //         if (userStr && token) {
    //             const isValid = await get().checkTokenValidity();
    //             if (isValid) {
    //                 const user = JSON.parse(userStr);
    //                 set({ user, token });
    //             } else {
    //                 await get().logout();
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Error initializing auth:', error);
    //         await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.TOKEN]);
    //         set({ user: null, token: null });
    //     } finally {
    //         set({ isLoading: false, isInitialized: true });
    //     }
    // },

    signup: async (data: SignupData) => {
        try {
            set({ isLoading: true, error: null });
            const response = await authService.signup(data);
            return { success: response.success, message: response.message };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message;
            set({ error: errorMessage });
            return { success: false, message: errorMessage };
        } finally {
            set({ isLoading: false });
        }
    },

    verify: async (data: VerifyOtpData) => {
        try {
            set({ isLoading: true, error: null });
            const response = await authService.verify(data);
            return { success: response.success, message: response.message };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message;
            set({ error: errorMessage });
            return { success: false, message: errorMessage };
        } finally {
            set({ isLoading: false });
        }
    },

    signin: async (data: SigninData) => {
        try {
            set({ isLoading: true, error: null });

            console.log("Signing in with device info:", {
                email: data.email,
                deviceType: data.deviceType,
                deviceTokenLength: data.deviceToken?.length || 0
            });

            const response = await authService.signin(data) as SigninResponse;
            console.log("Signin Response::::::::::::::::::::", response);

            if (response.success && response.token && response.user) {
                try {
                    // Store device token along with other user data
                    const userData = {
                        ...response.user,
                        deviceToken: data.deviceToken // Store device token with user data
                    };

                    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
                    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

                    set({
                        // @ts-ignore
                        user: userData,
                        token: response.token
                    });

                    // Verify storage
                    const verifyUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
                    const verifyToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);

                    console.log("Verification after storage - User:", verifyUser);
                    console.log("Verification after storage - Token:", verifyToken);

                    return {
                        success: true,
                        message: response.message
                    };
                } catch (storageError) {
                    console.error("Storage Error:", storageError);
                    return {
                        success: false,
                        message: "Failed to save login data"
                    };
                }
            }

            return {
                success: false,
                message: response.message || 'Invalid login response'
            };
        } catch (error: any) {
            console.error("Signin Error:", error);
            const errorMessage = error.response?.data?.message || error.message;
            set({ error: errorMessage });
            return { success: false, message: errorMessage };
        } finally {
            set({ isLoading: false });
        }
    },

    resendOtp: async (data: ResendOtpData) => {
        try {
            set({ isLoading: true, error: null });
            const response = await authService.resendOtp(data);
            return { success: response.success, message: response.message };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message;
            set({ error: errorMessage });
            return { success: false, message: errorMessage };
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        try {
            set({ isLoading: true });
            await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.TOKEN]);
            set({ user: null, token: null, error: null });
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    clearError: () => {
        set({ error: null });
    }
}));

// Helper to add token to requests
export const setupAxiosInterceptors = (axiosInstance: any) => {
    axiosInstance.interceptors.request.use(
        async (config: any) => {
            const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error: any) => {
            return Promise.reject(error);
        }
    );

    // Handle 401 responses
    axiosInstance.interceptors.response.use(
        (response: any) => response,
        async (error: any) => {
            if (error.response?.status === 401) {
                await useAuthStore.getState().logout();
            }
            return Promise.reject(error);
        }
    );
};