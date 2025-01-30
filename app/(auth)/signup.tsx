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
import { validateForm, signupSchema, type SignupFormData } from "@/utils/validations/auth.validation";
import { authService } from "@/services/auth.service";
import { AntDesign } from "@expo/vector-icons";

export default function Signup() {
    const [formData, setFormData] = useState<SignupFormData>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState<Partial<SignupFormData>>({});
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const isTablet = getDeviceType() === 'tablet';

    const handleSignup = async () => {
        const validation = await validateForm(signupSchema, formData);
        if (!validation.success) {
            setErrors({ [validation.error.split(' ')[0].toLowerCase()]: validation.error });
            return;
        }

        setLoading(true);
        try {
            const response = await authService.signup(formData);
            if (response.success) {
                router.push({
                    pathname: '/(auth)/otp',
                    params: { email: formData.email }
                });
            } else {
                setErrors({ email: response.message });
            }
        } catch (error: any) {
            setErrors({ email: error.message });
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
                        <View className="mb-6">
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
                                    text="Create Account"
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
                                    Join us to discover your perfect property
                                </Text>
                            </View>
                        </View>

                        {/* Form Section */}
                        <View className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            {/* Name Row */}
                            <View className="flex-row gap-4 mb-4">
                                <View className="flex-1">
                                    <Input
                                        label="First Name"
                                        value={formData.firstName}
                                        onChangeText={(text) => {
                                            setFormData(prev => ({ ...prev, firstName: text }));
                                            setErrors({});
                                        }}
                                        placeholder="John"
                                        error={errors.firstName}
                                        leftIcon="user"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Input
                                        label="Last Name"
                                        value={formData.lastName}
                                        onChangeText={(text) => {
                                            setFormData(prev => ({ ...prev, lastName: text }));
                                            setErrors({});
                                        }}
                                        placeholder="Doe"
                                        error={errors.lastName}
                                        leftIcon="user"
                                    />
                                </View>
                            </View>

                            <Input
                                label="Email Address"
                                value={formData.email}
                                onChangeText={(text) => {
                                    setFormData(prev => ({ ...prev, email: text }));
                                    setErrors({});
                                }}
                                placeholder="john.doe@example.com"
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
                                placeholder="Create a strong password"
                                isPassword
                                error={errors.password}
                                containerStyle={{ marginBottom: 16 }}
                                leftIcon="lock"
                            />

                            <Input
                                label="Confirm Password"
                                value={formData.confirmPassword}
                                onChangeText={(text) => {
                                    setFormData(prev => ({ ...prev, confirmPassword: text }));
                                    setErrors({});
                                }}
                                placeholder="Confirm your password"
                                isPassword
                                error={errors.confirmPassword}
                                containerStyle={{ marginBottom: 16 }}
                                leftIcon="lock"
                            />

                            <Button
                                text="Create Account"
                                onPress={handleSignup}
                                loading={loading}
                                disabled={!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.confirmPassword}
                                className="bg-primary-600 py-4 rounded-2xl mt-4"
                                textClassName="font-semibold"
                                loadingColor={colors.common.white}
                            />

                            {/* Privacy Notice */}
                            <Text
                                className="text-center text-gray-500 mt-4 px-4"
                                style={{ fontSize: getFontSize(isTablet ? 13 : 12) }}
                            >
                                By creating an account, you agree to our Terms of Service and Privacy Policy
                            </Text>
                        </View>

                        {/* Login Link */}
                        <View className="flex-row justify-center mt-6 mb-4">
                            <Text
                                className="text-gray-600"
                                style={{ fontSize: getFontSize(isTablet ? 15 : 14) }}
                            >
                                Already have an account?{' '}
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
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    );
}