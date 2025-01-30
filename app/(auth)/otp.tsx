import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Dimensions,
    StyleSheet,
    LayoutAnimation,
    Keyboard,
} from "react-native";
import React, { useState, useEffect } from "react";
import colors from "@/utils/color";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontSize, getDeviceType } from "@/utils/font";
import OTPInput from "@/components/OtpInput";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from '@expo/vector-icons';
import { validateForm, verifyOtpSchema, type VerifyOtpFormData } from "@/utils/validations/auth.validation";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/Button";
import { Heading } from "@/components/Heading";

const window = Dimensions.get('window');
const isSmallDevice = window.width < 375;
const isBigDevice = window.width >= 768;

export default function OtpVerification() {
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(45);
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const { email } = useLocalSearchParams();
    const isTablet = getDeviceType() === 'tablet';

    useEffect(() => {
        const keyboardDidShowListener = Platform.OS === 'ios'
            ? Keyboard.addListener('keyboardWillShow', () => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setKeyboardVisible(true);
            })
            : Keyboard.addListener('keyboardDidShow', () => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setKeyboardVisible(true);
            });

        const keyboardDidHideListener = Platform.OS === 'ios'
            ? Keyboard.addListener('keyboardWillHide', () => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setKeyboardVisible(false);
            })
            : Keyboard.addListener('keyboardDidHide', () => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setKeyboardVisible(false);
            });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

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

    const handleVerify = async () => {
        if (otp.length !== 6) return;

        const validation = await validateForm(verifyOtpSchema, { email, otp });
        if (!validation.success) {
            setError(validation.error);
            return;
        }

        setLoading(true);
        try {
            const response = await authService.verify({ email: email as string, otp });
            if (response.success) {
                router.replace("/(auth)/login");
            } else {
                setError(response.message);
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) return;

        setLoading(true);
        try {
            await authService.resendOtp({ email: email as string });
            setTimer(45);
            setCanResend(false);
            setError("");
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

    const getStyles = () => {
        if (isSmallDevice) return {
            containerPadding: 16,
            spacing: 16,
            formPadding: 16
        };
        if (isBigDevice) return {
            containerPadding: 32,
            spacing: 24,
            formPadding: 24
        };
        return {
            containerPadding: isTablet ? 24 : 20,
            spacing: isTablet ? 20 : 18,
            formPadding: isTablet ? 20 : 18
        };
    };

    const styles = getStyles();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.default }}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={{
                        flex: 1,
                        paddingHorizontal: styles.containerPadding,
                        paddingTop: Platform.OS === 'ios' ? 8 : 16
                    }}>
                        {/* Header Section */}
                        <View style={{ marginBottom: styles.spacing * 2 }}>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="mb-6 rounded-full active:bg-gray-100"
                                style={localStyles.backButton}
                            >
                                <Feather
                                    name="arrow-left"
                                    size={isBigDevice ? 24 : isSmallDevice ? 20 : 22}
                                    color={colors.text.primary}
                                />
                            </TouchableOpacity>

                            {!keyboardVisible && (
                                <View style={{ marginBottom: styles.spacing }}>
                                    <Heading
                                        text="Verify Your Email"
                                        variant={isBigDevice ? "h1" : "h2"}
                                        className="mb-3"
                                    />
                                    <Text
                                        className="text-gray-600"
                                        style={{
                                            fontSize: getFontSize(isSmallDevice ? 14 : isBigDevice ? 17 : 15),
                                            lineHeight: getFontSize(isSmallDevice ? 20 : isBigDevice ? 26 : 22)
                                        }}
                                    >
                                        Please enter the 6-digit code sent to{"\n"}
                                        <Text className="text-primary-600 font-medium">
                                            {email}
                                        </Text>
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* OTP Form Section */}
                        <View style={[localStyles.formContainer, { padding: styles.formPadding }]}>
                            <Text
                                style={{
                                    fontSize: getFontSize(isSmallDevice ? 16 : isBigDevice ? 20 : 18),
                                    marginBottom: styles.spacing,
                                    color: colors.text.primary,
                                    fontWeight: '600'
                                }}
                            >
                                Enter verification code
                            </Text>

                            <View style={{ marginBottom: styles.spacing * 1.5 }}>
                                <OTPInput
                                    length={6}
                                    value={otp}
                                    onChange={(value) => {
                                        setOtp(value);
                                        setError("");
                                    }}
                                />
                                {error && (
                                    <Text
                                        className="text-red-500 mt-3 text-center"
                                        style={{ fontSize: getFontSize(isSmallDevice ? 12 : 13) }}
                                    >
                                        {error}
                                    </Text>
                                )}
                            </View>

                            <Button
                                text="Verify Email"
                                onPress={handleVerify}
                                loading={loading}
                                disabled={otp.length !== 6}
                                className={`bg-primary-600 rounded-2xl ${isBigDevice ? 'py-4' : 'py-3.5'}`}
                                textClassName="font-semibold"
                                loadingColor={colors.common.white}
                            />

                            <View className="flex-row justify-center mt-6 items-center">
                                <Text
                                    className="text-gray-600"
                                    style={{
                                        fontSize: getFontSize(isSmallDevice ? 13 : isBigDevice ? 16 : 14)
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
                                            fontSize: getFontSize(isSmallDevice ? 13 : isBigDevice ? 16 : 14),
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

const localStyles = StyleSheet.create({
    backButton: {
        width: isBigDevice ? 48 : 40,
        height: isBigDevice ? 48 : 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.variant,
    },
    formContainer: {
        backgroundColor: colors.background.paper,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.grey[100],
        ...Platform.select({
            ios: {
                shadowColor: colors.grey[400],
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    }
});