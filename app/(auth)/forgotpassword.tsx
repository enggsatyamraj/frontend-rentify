import {
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Text,
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
import { validateForm, forgotPasswordSchema } from "@/utils/validations/auth.validation";
import { authService } from "@/services/auth.service";
import { AntDesign } from "@expo/vector-icons";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const router = useRouter();
    const isTablet = getDeviceType() === 'tablet';

    const handleSubmit = async () => {
        try {
            const validation = await validateForm(forgotPasswordSchema, { email });
            if (!validation.success) {
                // @ts-ignore
                setError(validation.error);
                return;
            }

            setLoading(true);
            const response = await authService.forgotPassword({ email: email.trim() });

            if (response.success) {
                setSuccess(true);
                router.push({
                    pathname: '/(auth)/resetpassword',
                    params: { email: email.trim() }
                });
            } else {
                setError(response.message);
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

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
                                    text="Forgot Password"
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
                                    Enter your email address to receive a password reset code
                                </Text>
                            </View>
                        </View>

                        {/* Form Section */}
                        <View className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <Input
                                label="Email Address"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setError("");
                                }}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                error={error}
                                containerStyle={{ marginBottom: 20 }}
                                leftIcon="mail"
                            />

                            <Button
                                text="Send Reset Code"
                                onPress={handleSubmit}
                                loading={loading}
                                disabled={!email || loading}
                                variant="primary"
                                className="py-4 rounded-2xl"
                            />

                            {/* Back to Login Link */}
                            <View className="flex-row justify-center mt-6">
                                <Text
                                    className="text-gray-600"
                                    style={{ fontSize: getFontSize(isTablet ? 15 : 14) }}
                                >
                                    Remember your password?{' '}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => router.replace('/(auth)/login')}
                                    className="active:opacity-70"
                                >
                                    <Text
                                        className="text-primary-600 font-semibold"
                                        style={{ fontSize: getFontSize(isTablet ? 15 : 14) }}
                                    >
                                        Sign In
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    );
}