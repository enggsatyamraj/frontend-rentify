import {
    View,
    Text,
    Image,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import colors from "@/utils/color";
import { SafeAreaView } from "react-native-safe-area-context";
import Wrapper from "@/components/Wrapper";
import { getFontSize } from "@/utils/font";
import OTPInput from "@/components/OtpInput"
import { router, useLocalSearchParams } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';

export default function OtpVerification() {
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(45);
    const [canResend, setCanResend] = useState(false);
    const { phoneNumber } = useLocalSearchParams();

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
        // Handle OTP verification here
        console.log('OTP:', otp);
    };

    const handleResendOTP = () => {
        // if (canResend) {
        // Add your resend OTP logic here
        console.log('Resending OTP to:', phoneNumber);

        // Reset timer and canResend state
        // setTimer(45);
        // setCanResend(false);
        // }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${secs}s`;
    };

    return (
        <View style={{ backgroundColor: colors.primary.dark }} className="flex-1">
            <SafeAreaView className="flex-1">
                <Wrapper>
                    <TouchableOpacity onPress={() => { router.back() }} className="mb-5">
                        <AntDesign name="arrowleft" size={24} color={"#e5e7eb"} />
                    </TouchableOpacity>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1 }}
                    >
                        <View className="rounded-tr-[20px] rounded-tl-[20px] items-center flex-1">
                            {/* <Text
                                className="text-center text-white mb-8 font-semibold"
                                style={{ fontSize: getFontSize(20) }}
                            >
                                Verify Your {"\n"} Phone Number
                            </Text>
                            <Text
                                className="text-center text-gray-300 mb-8"
                                style={{ fontSize: getFontSize(15) }}
                            >
                                Please enter the 6-digit code sent to{"\n"}
                                {phoneNumber}
                            </Text> */}
                            <View className="bg-gray-200 w-full px-4 py-10 rounded-[20px] max-w-[500px]">
                                <Text style={{ fontSize: getFontSize(16) }} className="mb-5">
                                    ENTER OTP
                                </Text>
                                <View className="mb-6">
                                    <OTPInput
                                        length={6}
                                        value={otp}
                                        onChange={setOtp}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={handleVerify}
                                    disabled={timer > 0}
                                    style={{
                                        backgroundColor: colors.primary.dark,
                                        borderRadius: 20,
                                        paddingVertical: 10,
                                    }}
                                >
                                    <Text
                                        className="text-center text-white"
                                        style={{ fontSize: getFontSize(15) }}
                                    >
                                        Verify
                                    </Text>
                                </TouchableOpacity>

                                <View className="flex-row justify-center mt-4 items-center">
                                    <Text
                                        className="text-gray-600"
                                        style={{ fontSize: getFontSize(14) }}
                                    >
                                        Didn't receive the code?{' '}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={handleResendOTP}
                                        disabled={!canResend}
                                    >
                                        <Text
                                            style={{
                                                fontSize: getFontSize(14),
                                                color: canResend ? colors.primary.dark : colors.gray,
                                            }}
                                            className="font-semibold"
                                        >
                                            {canResend ? 'Resend' : `Wait ${formatTime(timer)}`}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Wrapper>
            </SafeAreaView>
        </View>
    );
}