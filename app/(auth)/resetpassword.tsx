import {
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Text,
    StatusBar,
} from "react-native";
import React, { useState, useEffect } from "react";
import colors from "@/utils/color";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontSize, getDeviceType } from "@/utils/font";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Heading } from "@/components/Heading";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { validateForm, resetPasswordSchema } from "@/utils/validations/auth.validation";
import { authService } from "@/services/auth.service";
import { AntDesign } from "@expo/vector-icons";
import OTPInput from "@/components/OtpInput";

export default function ResetPassword() {
    const [formData, setFormData] = useState({
        otp: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(45);
    const [canResend, setCanResend] = useState(false);

    const router = useRouter();
    const { email } = useLocalSearchParams();
    const isTablet = getDeviceType() === 'tablet';

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => interval && clearInterval(interval);
    }, [timer]);

    const handleResendOTP = async () => {
        if (!canResend) return;

        setLoading(true);
        try {
            const response = await authService.forgotPassword({ email: email as string });
            if (response.success) {
                setTimer(45);
                setCanResend(false);
                setError("");
            } else {
                setError(response.message);
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            // First check if passwords match
            if (formData.newPassword !== formData.confirmPassword) {
                setError("Passwords do not match");
                return;
            }

            // Only validate the fields that will be sent to the backend
            const validation = await validateForm(resetPasswordSchema, {
                email: email as string,
                otp: formData.otp,
                newPassword: formData.newPassword
                // Don't include confirmPassword as it's not part of the API payload
            });

            if (!validation.success) {
                // @ts-ignore
                setError(validation.error);
                return;
            }

            setLoading(true);
            // Send only the required fields to the backend
            const response = await authService.resetPassword({
                email: email as string,
                otp: formData.otp,
                newPassword: formData.newPassword
            });

            if (response.success) {
                router.replace('/(auth)/login');
            } else {
                setError(response.message);
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.default }}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >

                    <View className="flex-1 px-6 pt-4">
                        {/* Header Section */}
                        <View className="mb-8">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="mb-6 w-10 h-10 rounded-full bg-gray-50 items-center justify-center active:bg-gray-100"
                            >
                                <AntDesign
                                    name="arrowleft"
                                    size={24}
                                    color={colors.text.primary}
                                />
                            </TouchableOpacity>

                            <View className="mb-2">
                                <Heading
                                    text="Reset Password"
                                    variant="h1"
                                    className="mb-2"
                                />
                                <Text
                                    className="text-gray-600"
                                    style={{
                                        fontSize: getFontSize(isTablet ? 16 : 15),
                                        lineHeight: getFontSize(isTablet ? 24 : 22)
                                    }}
                                >
                                    Enter the verification code sent to{' '}
                                    <Text className="text-primary-600 font-medium">
                                        {email}
                                    </Text>
                                </Text>
                            </View>
                        </View>

                        {/* Form Section */}
                        <View className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <Text
                                className="text-gray-800 font-semibold mb-4"
                                style={{
                                    fontSize: getFontSize(isTablet ? 18 : 16)
                                }}
                            >
                                Enter verification code
                            </Text>

                            <View className="mb-6">
                                <OTPInput
                                    length={6}
                                    value={formData.otp}
                                    onChange={(value) => {
                                        setFormData(prev => ({ ...prev, otp: value }));
                                        setError("");
                                    }}
                                />
                            </View>

                            <Input
                                label="New Password"
                                value={formData.newPassword}
                                onChangeText={(text) => {
                                    setFormData(prev => ({ ...prev, newPassword: text }));
                                    setError("");
                                }}
                                placeholder="Enter new password"
                                isPassword
                                error={error}
                                containerStyle={{ marginBottom: 16 }}
                                leftIcon="lock"
                            />

                            <Input
                                label="Confirm Password"
                                value={formData.confirmPassword}
                                onChangeText={(text) => {
                                    setFormData(prev => ({ ...prev, confirmPassword: text }));
                                    setError("");
                                }}
                                placeholder="Confirm new password"
                                isPassword
                                error={error}
                                containerStyle={{ marginBottom: 20 }}
                                leftIcon="lock"
                            />

                            <Button
                                text="Reset Password"
                                onPress={handleSubmit}
                                loading={loading}
                                disabled={!formData.otp || !formData.newPassword || !formData.confirmPassword || loading}
                                variant="primary"
                                className="py-4 rounded-2xl"
                            />

                            {/* Resend Code */}
                            <View className="flex-row justify-center mt-6 items-center">
                                <Text
                                    className="text-gray-600"
                                    style={{
                                        fontSize: getFontSize(isTablet ? 15 : 14)
                                    }}
                                >
                                    Didn't receive the code?{' '}
                                </Text>
                                <TouchableOpacity
                                    onPress={handleResendOTP}
                                    disabled={!canResend || loading}
                                    className="active:opacity-70"
                                >
                                    <Text
                                        style={{
                                            fontSize: getFontSize(isTablet ? 15 : 14),
                                            color: canResend ? colors.primary.main : colors.grey[400],
                                            fontWeight: '600'
                                        }}
                                    >
                                        {canResend ? 'Resend Code' : `Wait ${formatTime(timer)}`}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

        </SafeAreaView>
    );
}