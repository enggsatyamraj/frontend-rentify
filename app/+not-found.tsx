import colors from "@/utils/color";
import { getDeviceType, getFontSize } from "@/utils/font";
import { AntDesign } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function NotFound() {
    const router = useRouter();
    const isTablet = getDeviceType() === 'tablet';
    return (
        <>
            <Stack.Screen options={{ title: "Oops!, page not found", headerShown: false }} />
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 " contentContainerStyle={{
                alignItems: 'center',
                flex: 1,
                justifyContent: 'center'
            }}
                style={{ backgroundColor: colors.primary.dark }}
            >
                <Text style={{ fontSize: getFontSize(30), color: "#fff" }}>Page Not found</Text>
                {/* <TouchableOpacity
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
                </TouchableOpacity> */}
            </ScrollView>
        </>
    )
}