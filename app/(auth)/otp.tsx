import {
    View,
    Text,
    Image,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import colors from "@/utils/color";
import { SafeAreaView } from "react-native-safe-area-context";
import Wrapper from "@/components/Wrapper";
import { getFontSize, getDeviceType } from "@/utils/font";
import OTPInput from "@/components/OtpInput";
import { router, useLocalSearchParams } from "expo-router";
import { AntDesign } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OtpVerification() {
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(45);
    const [canResend, setCanResend] = useState(false);
    const { phoneNumber } = useLocalSearchParams();
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

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [timer]);

    const handleVerify = () => {
        if (otp.length === 6) {
            // Handle OTP verification here
            console.log('OTP:', otp);
        }
    };

    const handleResendOTP = () => {
        if (canResend) {
            // Add your resend OTP logic here
            console.log('Resending OTP to:', phoneNumber);
            setTimer(45);
            setCanResend(false);
            // Implement your resend logic here
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary.dark }}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <Wrapper>
                        <View className="flex-1">
                            {/* Back Button */}
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="mb-8 p-2"
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <AntDesign name="arrowleft" size={isTablet ? 28 : 24} color="#FFFFFF" />
                            </TouchableOpacity>

                            {/* Header Section */}
                            <View className="items-start mb-12">
                                <Text
                                    className="text-white font-bold mb-4 w-full"
                                    style={{
                                        textAlign: 'center',
                                        fontSize: getFontSize(isTablet ? 32 : 24),
                                        lineHeight: getFontSize(isTablet ? 40 : 32)
                                    }}
                                >
                                    Verify Your{"\n"}Phone Number
                                </Text>
                                <Text
                                    className="text-gray-300 w-full text-center"
                                    style={{
                                        fontSize: getFontSize(isTablet ? 18 : 16),
                                        lineHeight: getFontSize(isTablet ? 28 : 24)
                                    }}
                                >
                                    Please enter the 6-digit code sent to{"\n"}
                                    <Text className="font-semibold text-white">
                                        {phoneNumber}
                                    </Text>
                                </Text>
                            </View>

                            {/* OTP Input Section */}
                            <View
                                className="bg-white rounded-[24px] p-8 shadow-lg mx-auto w-full"
                                style={{
                                    maxWidth: isTablet ? 550 : 450,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: getFontSize(isTablet ? 22 : 18),
                                        marginBottom: isTablet ? 24 : 20
                                    }}
                                    className="font-semibold text-gray-800"
                                >
                                    Enter verification code
                                </Text>

                                <View className="mb-8">
                                    <OTPInput
                                        length={6}
                                        value={otp}
                                        onChange={setOtp}
                                    />
                                </View>

                                <TouchableOpacity
                                    onPress={handleVerify}
                                    disabled={otp.length !== 6}
                                    style={{
                                        backgroundColor: otp.length === 6 ? colors.primary.main : colors.grey[300],
                                        borderRadius: isTablet ? 20 : 16,
                                        paddingVertical: isTablet ? 18 : 14,
                                        elevation: 2,
                                        shadowColor: colors.primary.dark,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 4,
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        className="text-center text-white font-semibold"
                                        style={{ fontSize: getFontSize(isTablet ? 18 : 16) }}
                                    >
                                        Verify
                                    </Text>
                                </TouchableOpacity>

                                <View className="flex-row justify-center mt-6 items-center">
                                    <Text
                                        className="text-gray-600"
                                        style={{ fontSize: getFontSize(isTablet ? 16 : 14) }}
                                    >
                                        Didn't receive the code?{' '}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={handleResendOTP}
                                        disabled={!canResend}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={{
                                                fontSize: getFontSize(isTablet ? 16 : 14),
                                                color: canResend ? colors.primary.main : colors.grey[400],
                                            }}
                                            className="font-semibold"
                                        >
                                            {canResend ? 'Resend OTP' : `Wait ${formatTime(timer)}`}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Wrapper>
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    );
}