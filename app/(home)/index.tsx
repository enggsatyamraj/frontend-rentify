import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import colors from "@/utils/color";
import { Feather } from '@expo/vector-icons';
import { getFontSize, getDeviceType } from "@/utils/font";

export default function Home() {
    const router = useRouter();
    const { logout, user, isLoading } = useAuthStore();
    const isTablet = getDeviceType() === 'tablet';

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.default }}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />

            {/* Header with Logout */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                <View>
                    <Text
                        className="text-gray-800 font-medium"
                        style={{ fontSize: getFontSize(isTablet ? 16 : 14) }}
                    >
                        Welcome back,
                    </Text>
                    <Text
                        className="text-primary-600 font-semibold"
                        style={{ fontSize: getFontSize(isTablet ? 18 : 16) }}
                    >
                        {user?.firstName} {user?.lastName}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    disabled={isLoading}
                    className="flex-row items-center bg-primary-50 rounded-full px-4 py-2 active:opacity-80"
                >
                    <Feather
                        name="log-out"
                        size={isTablet ? 20 : 18}
                        color={colors.primary.main}
                    />
                    <Text
                        className="ml-2 text-primary-600 font-medium"
                        style={{ fontSize: getFontSize(isTablet ? 15 : 13) }}
                    >
                        {isLoading ? "Logging out..." : "Logout"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Rest of your home page content */}
            <View className="flex-1 p-4">
                {/* Add your home page content here */}
            </View>
        </SafeAreaView>
    );
}