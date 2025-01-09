import {
    View,
    Text,
    Image,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from "react-native";
import React, { useState } from "react";
import colors from "@/utils/color";
import { SafeAreaView } from "react-native-safe-area-context";
import Wrapper from "@/components/Wrapper";
import { getFontSize, getDeviceType } from "@/utils/font";
import InputWithLabel from "@/components/InputWithLabel";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Login() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const router = useRouter();
    const isTablet = getDeviceType() === 'tablet';

    // Calculate image dimensions based on screen size and device type
    const getImageDimensions = () => {
        if (isTablet) {
            // For tablets, use a larger portion of the screen
            const imageWidth = Math.min(SCREEN_WIDTH * 0.6, 600); // Max width of 600
            return {
                width: imageWidth,
                height: imageWidth * 0.75, // Maintain aspect ratio
            };
        } else {
            // For phones, use previous scaling
            const imageWidth = Math.min(SCREEN_WIDTH * 0.85, 400);
            return {
                width: imageWidth,
                height: imageWidth * 0.75,
            };
        }
    };

    const handleContinue = () => {
        if (phoneNumber.length < 10) {
            // Add validation feedback here
            return;
        }
        router.push({ pathname: "/(auth)/otp", params: { phoneNumber } });
    };

    const imageDimensions = getImageDimensions();

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
                    <View className="flex-1 px-4 pt-8">
                        {/* Header Text */}
                        <View className="items-center mb-8">
                            <Text
                                className="text-center text-white font-bold mb-4"
                                style={{
                                    fontSize: getFontSize(isTablet ? 32 : 24),
                                    lineHeight: getFontSize(isTablet ? 40 : 32)
                                }}
                            >
                                Discover Houses{"\n"}Near You
                            </Text>
                            <Text
                                className="text-center text-gray-200"
                                style={{
                                    fontSize: getFontSize(isTablet ? 18 : 16),
                                    lineHeight: getFontSize(isTablet ? 28 : 24)
                                }}
                            >
                                Explore thousands of Flats, PG, commercials{"\n"}
                                based on your preferred location
                            </Text>
                        </View>

                        {/* Image Container */}
                        <View className="flex-1 items-center justify-center py-8">
                            <Image
                                source={require("@/assets/images/splash_screen_house.png")}
                                style={{
                                    width: imageDimensions.width,
                                    height: imageDimensions.height,
                                    resizeMode: 'contain'
                                }}
                            />
                        </View>

                        {/* Login Form */}
                        <View className="bg-white rounded-[24px] p-6 shadow-lg mx-auto w-full"
                            style={{ maxWidth: isTablet ? 600 : 450 }}>
                            <Text
                                style={{
                                    fontSize: getFontSize(isTablet ? 22 : 18),
                                    marginBottom: isTablet ? 24 : 20
                                }}
                                className="font-semibold text-gray-800"
                            >
                                Enter your phone number
                            </Text>

                            <View className="mb-6">
                                <InputWithLabel
                                    value={phoneNumber}
                                    onChangeText={text => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
                                    placeholder="Enter your phone number"
                                    keyboardType="numeric"
                                    maxLength={10}
                                    style={{
                                        fontSize: getFontSize(isTablet ? 18 : 16),
                                        paddingVertical: isTablet ? 16 : 12,
                                        paddingHorizontal: isTablet ? 20 : 16,
                                    }}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleContinue}
                                style={{
                                    backgroundColor: colors.primary.main,
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
                                    Continue
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    );
}