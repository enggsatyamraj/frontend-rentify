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

export default function index() {
    const router = useRouter();
    const height = Dimensions.get("window").height;
    console.log(height);
    const [showSpinner, setShowSpinner] = useState(false);
    const [showView, setShowView] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            router.replace("/(auth)/login");
        }, 5000);
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
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
