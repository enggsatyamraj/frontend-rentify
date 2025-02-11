import {
    View,
    Text,
    Image,
    ScrollView,
    Dimensions,
    ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { getFontSize } from "@/utils/font";
import { MotiView } from "moti";
import colors from "@/utils/color";
import { STORAGE_KEYS, useAuthStore } from "@/store/auth.store";
import AsyncStorage from "@react-native-async-storage/async-storage";



export default function SplashScreen() {
    const router = useRouter();
    const height = Dimensions.get("window").height;
    const [showSpinner, setShowSpinner] = useState(false);
    const [showView, setShowView] = useState(true);
    const [isChecking, setIsChecking] = useState(false);
    const { initializeAuth, checkTokenValidity } = useAuthStore();

    const checkAuthAndNavigate = async () => {
        try {
            setIsChecking(true);

            // First, wait for auth initialization
            await initializeAuth();

            // Get stored user data
            const userDataStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
            const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
            console.log("User Data from Storage:", userDataStr);
            console.log("Token from Storage:", token);

            if (userDataStr && token) {
                // Check token validity only if we have both user and token
                console.log("Checking token validity...");
                const isValid = await checkTokenValidity();
                console.log("Token validity:", isValid);
                console.log("Token validity:", isValid);

                if (isValid) {
                    router.replace("/(home)");
                    return;
                }
            }

            // If we get here, either no user/token or invalid token
            router.replace("/(auth)/login");

        } catch (error) {
            console.error("Auth check error:", error);
            router.replace("/(auth)/login");
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;

        const startAuthCheck = () => {
            timer = setTimeout(() => {
                if (!isChecking) {
                    checkAuthAndNavigate();
                }
            }, 4000);
        };

        startAuthCheck();

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, []);

    return (
        <SafeAreaView className="w-full h-[100vh] boder-2 border-black items-center justify-center flex">
            <View
                style={{ height: height * 0.28, maxHeight: 400 }}
                className={`w-[60%] items-center justify-center`}
            >
                <Text
                    style={{ fontSize: getFontSize(16) }}
                    className="-mb-[20px] font-semibold"
                >
                    Welcome to Rentify
                </Text>
                <Image
                    style={{ width: "100%", height: "100%", resizeMode: "contain" }}
                    source={require("../assets/images/splash_screen_house.png")}
                    className="max-w-[400px]"
                />
                {showView && (
                    <View style={{ width: "100%", maxWidth: 400, overflow: "hidden" }}>
                        <MotiView
                            from={{
                                scaleX: 0,
                            }}
                            animate={{
                                scaleX: 1,
                            }}
                            transition={{
                                type: "timing",
                                duration: 3000,
                            }}
                            onDidAnimate={(key, finished) => {
                                if (key === "scaleX" && finished) {
                                    setShowSpinner(true);
                                    setShowView(false);
                                }
                            }}
                            style={{
                                height: 7,
                                backgroundColor: colors.primary.dark,
                                borderRadius: 10,
                                width: "100%",
                                transformOrigin: "left",
                            }}
                        />
                    </View>
                )}
                {showSpinner && (
                    <View className="mt-4">
                        <ActivityIndicator
                            size={height > 900 ? "large" : "small"}
                            color={colors.primary.dark}
                        />
                        <Text
                            className="mt-2 text-gray-600 text-center"
                            style={{ fontSize: getFontSize(14) }}
                        >
                            {isChecking ? "Checking login status..." : "Loading..."}
                        </Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}