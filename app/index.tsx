import { View, Text, Image, ScrollView, Dimensions } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { getFontSize } from "@/utils/font";
import { useHrefAttrs } from "expo-router/build/link/useLinkHooks";

export default function index() {
    const router = useRouter();
    const height = Dimensions.get("window").height;

    // useEffect(() => {
    //     setTimeout(() => {
    //         router.push("/(auth)/login")
    //     }, 1000)
    // }, [])

    return (
        // <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', flexGrow: 1 }} className='border-2 border-red-900 min-h-[100vh]'>
        <SafeAreaView className="w-full h-[100vh] boder-2 border-black items-center justify-center flex">
            <View style={{ height: height * 0.28, maxHeight: 400 }} className={`w-[60%] items-center justify-center`}>
                <Text style={{ fontSize: getFontSize(16) }} className="-mb-[20px] font-semibold">Welcome to Rentify</Text>
                <Image
                    style={{ width: "100%", height: "100%", resizeMode: "contain" }}
                    source={require("../assets/images/splash_screen_house.png")}
                    className="max-w-[400px]"
                />
            </View>
        </SafeAreaView>
    );
}
