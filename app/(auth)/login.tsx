import {
    View,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Text,
    Dimensions,
    StatusBar,
} from "react-native";
import React, { useState } from "react";
import colors from "@/utils/color";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontSize, getDeviceType } from "@/utils/font";
import { useRouter } from "expo-router";
import { Heading } from "@/components/Heading";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { validateForm, signinSchema, type SigninFormData } from "@/utils/validations/auth.validation";
import { STORAGE_KEYS, useAuthStore } from "@/store/auth.store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Login() {
    const [formData, setFormData] = useState<SigninFormData>({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState<Partial<SigninFormData>>({});

    const router = useRouter();
    const isTablet = getDeviceType() === 'tablet';
    const { signin, isLoading } = useAuthStore(); // Use store's loading state

    const getImageDimensions = () => {
        if (isTablet) {
            return {
                width: SCREEN_WIDTH * 0.45,
                height: SCREEN_HEIGHT * 0.3,
            };
        }
        return {
            width: SCREEN_WIDTH * 0.85,
            height: SCREEN_HEIGHT * 0.25,
        };
    };

    const handleLogin = async () => {
        try {
            // First validate the form
            const validation = await validateForm(signinSchema, formData);
            if (!validation.success) {
                setErrors({ password: validation.error });
                return;
            }

            console.log("Attempting login with:", formData.email);

            // Use the store's signin method
            const response = await signin({
                email: formData.email.trim(),
                password: formData.password
            });

            console.log("Login response:", response);

            if (response.success) {
                // Verify storage before navigation
                const verifyToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
                const verifyUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);

                console.log("Final verification - Token exists:", !!verifyToken);
                console.log("Final verification - User exists:", !!verifyUser);

                if (verifyToken && verifyUser) {
                    router.replace('/(home)');
                } else {
                    setErrors({ password: "Login successful but failed to save session" });
                }
            } else {
                setErrors({ password: response.message });
            }
        } catch (error: any) {
            console.error("Login error:", error);
            setErrors({ password: error.message });
        }
    };

    const imageDimensions = getImageDimensions();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.default }}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <View className="flex-1 px-6">
                        {/* Top Section */}
                        <View className="items-center pt-8">
                            <Image
                                source={require("@/assets/images/splash_screen_house.png")}
                                style={{
                                    width: imageDimensions.width,
                                    height: imageDimensions.height,
                                    resizeMode: 'contain'
                                }}
                            />
                        </View>

                        {/* Welcome Text */}
                        <View className="mt-6 mb-8">
                            <Text
                                className="text-primary-600 font-semibold mb-2"
                                style={{ fontSize: getFontSize(isTablet ? 16 : 14) }}
                            >
                                Welcome back
                            </Text>
                            <Heading
                                text="Find Your Dream Home"
                                className="text-gray-800"
                                style={{
                                    fontSize: getFontSize(isTablet ? 28 : 24),
                                    lineHeight: getFontSize(isTablet ? 34 : 30)
                                }}
                            />
                        </View>

                        {/* Login Form */}
                        <View className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <Input
                                label="Email Address"
                                value={formData.email}
                                onChangeText={(text) => {
                                    setFormData(prev => ({ ...prev, email: text }));
                                    setErrors({});
                                }}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                error={errors.email}
                                containerStyle={{ marginBottom: 16 }}
                                leftIcon="mail"
                            />

                            <Input
                                label="Password"
                                value={formData.password}
                                onChangeText={(text) => {
                                    setFormData(prev => ({ ...prev, password: text }));
                                    setErrors({});
                                }}
                                placeholder="Enter your password"
                                isPassword
                                error={errors.password}
                                containerStyle={{ marginBottom: 12 }}
                                leftIcon="lock"
                            />

                            <TouchableOpacity
                                onPress={() => router.push('/(auth)/forgotpassword')}
                                className="mb-6"
                            >
                                <Text
                                    className="text-right text-primary-600 font-medium"
                                    style={{ fontSize: getFontSize(isTablet ? 15 : 13) }}
                                >
                                    Forgot your password?
                                </Text>
                            </TouchableOpacity>

                            <Button
                                text="Sign In"
                                onPress={handleLogin}
                                loading={isLoading}
                                disabled={!formData.email || !formData.password || isLoading}
                                className="bg-primary-600 py-4 rounded-2xl"
                                textClassName="font-semibold"
                                loadingColor={colors.common.white}
                            />
                        </View>

                        {/* Sign Up Link */}
                        <View className="flex-row justify-center mt-6 mb-4">
                            <Text
                                className="text-gray-600"
                                style={{ fontSize: getFontSize(isTablet ? 15 : 14) }}
                            >
                                Don't have an account?{' '}
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/(auth)/signup')}
                                className="active:opacity-70"
                            >
                                <Text
                                    className="text-primary-600 font-semibold"
                                    style={{ fontSize: getFontSize(isTablet ? 15 : 14) }}
                                >
                                    Create Account
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    );
}