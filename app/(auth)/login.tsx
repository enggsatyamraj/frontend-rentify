import {
    View,
    Text,
    Image,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import colors from "@/utils/color";
import { SafeAreaView } from "react-native-safe-area-context";
import Wrapper from "@/components/Wrapper";
import { getFontSize } from "@/utils/font";
import InputWithLabel from "@/components/InputWithLabel";
import { useRouter } from "expo-router";

export default function login() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const router = useRouter();

    const handleContinue = () => {
        router.push({ pathname: "/(auth)/otp", params: { phoneNumber } });
    }

    return (
        <View style={{ backgroundColor: colors.primary.dark }} className="flex-1">
            <SafeAreaView className="flex-1">
                <Wrapper>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1 }}
                    >
                        <View
                            className=" rounded-tr-[20px] rounded-tl-[20px] items-center flex-1">
                            <Text
                                className="text-center text-white mb-8 font-semibold"
                                style={{ fontSize: getFontSize(22) }}
                            >
                                Discover houses {"\n"} near you
                            </Text>
                            <Text
                                className="text-center text-gray-300"
                                style={{ fontSize: getFontSize(15) }}
                            >
                                Explore thousands of Flats, PG, commercials {"\n"} on rent based
                                on your preferred location
                            </Text>
                            <View className="flex-1 items-center justify-center">
                                <Image
                                    source={require("@/assets/images/splash_screen_house.png")}
                                // style={{ width: '100%' }}
                                />
                            </View>
                            <View className="bg-gray-200 w-full px-4 py-10 rounded-[20px] max-w-[800px]">
                                <Text style={{ fontSize: getFontSize(16) }} className="mb-5">
                                    Enter phone number to continue
                                </Text>
                                <InputWithLabel
                                    // label="Enter Phone Number"
                                    value={phoneNumber}
                                    onChangeText={(text) => { setPhoneNumber(text) }}
                                    placeholder="Enter your phone number"
                                    keyboardType="numeric"
                                    maxLength={10}
                                />
                                <TouchableOpacity
                                    onPress={handleContinue}
                                    style={{
                                        backgroundColor: colors.primary.dark,
                                        borderRadius: 20,
                                        paddingVertical: 10,
                                    }}
                                >
                                    <Text className="text-center text-white" style={{ fontSize: getFontSize(15) }}>continue</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Wrapper>
            </SafeAreaView>
        </View>
    );
}
