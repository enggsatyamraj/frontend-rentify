import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import React, { useState } from "react";
import colors from "@/utils/color";
import { getFontSize } from "@/utils/font";
import { SafeAreaView } from "react-native-safe-area-context";
import InputWithLabel from "@/components/InputWithLabel";

export default function Login() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    return (
        <SafeAreaView
            style={{ backgroundColor: colors.primary.dark }}
            className="flex-1"
            edges={["top"]}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ backgroundColor: colors.primary.dark }}
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: "space-between",
                    }}
                    className="w-full"
                >
                    {/* Top Section */}
                    <View className="items-center pt-10 px-6">
                        <Text
                            style={{ fontSize: getFontSize(28), lineHeight: getFontSize(34) }}
                            className="text-center text-gray-200 font-bold mb-4"
                        >
                            Discover houses{"\n"}near you
                        </Text>

                        <Text
                            style={{ fontSize: getFontSize(16), lineHeight: getFontSize(22) }}
                            className="text-center text-gray-300 mb-8"
                        >
                            Explore thousands of Flats, PG, commercials{"\n"}on rent based on
                            your preferred location
                        </Text>

                        <Image
                            source={require("../../assets/images/splash_screen_house.png")}
                            className="w-[60%]"
                            resizeMode="contain"
                        />
                    </View>

                    {/* Login Form Section */}
                    <View className="bg-white rounded-t-[30px] px-6 pt-8 pb-6 shadow-lg">
                        <Text
                            style={{ fontSize: getFontSize(24), lineHeight: getFontSize(28) }}
                            className="font-bold text-gray-900 mb-6"
                        >
                            LOGIN
                        </Text>

                        <View className="space-y-4">
                            {/* Email Input */}
                            <InputWithLabel
                                label="Email"
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            {/* Password Input */}
                            <InputWithLabel
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter your password"
                                secureTextEntry
                            />

                            {/* Forgot Password Link */}
                            <TouchableOpacity className="self-end">
                                <Text
                                    style={{ fontSize: getFontSize(12) }}
                                    className="text-gray-500"
                                >
                                    Forgot Password?
                                </Text>
                            </TouchableOpacity>

                            {/* Login Button */}
                            <TouchableOpacity
                                className="bg-[#1a365d] rounded-lg py-4 mt-4 shadow-md"
                                style={{ backgroundColor: colors.primary.dark }}
                            >
                                <Text
                                    className="text-white text-center font-semibold"
                                    style={{ fontSize: getFontSize(16), lineHeight: getFontSize(20) }}
                                >
                                    LOGIN
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
