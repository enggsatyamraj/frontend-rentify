import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import { getFontSize } from "@/utils/font";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Feather } from "@expo/vector-icons";
import colors from "@/utils/color";

export default function index() {
    const user = useAuthStore((state) => state.user);
    const { logout } = useAuthStore();
    const [loading, setLoading] = React.useState<boolean>(false);

    const getInitial = () => {
        if (user?.firstName) {
            return user.firstName.charAt(0).toUpperCase();
        }
        return "?";
    };

    const supportArray = [
        {
            title: "Help Center",
            icon: "questioncircleo"
        },
        {
            title: "Contact Us",
            icon: "customerservice"
        },
        {
            title: "Report an Issue",
            icon: "warning"
        },
        {
            title: "FAQs",
            icon: "bulb1"
        },
        {
            title: "Give Feedback",
            icon: "message1"
        }
    ];

    const legalArray = [
        {
            title: "Privacy Policy",
            icon: "Safety"
        },
        {
            title: "Terms of Service",
            icon: "filetext1"
        },
        {
            title: "License Agreement",
            icon: "profile"
        },
        {
            title: "Community Guidelines",
            icon: "team"
        },
        {
            title: "Legal Information",
            icon: "solution1"
        }
    ];

    const renderProfileImage = () => {
        if (user?.profileImage) {
            return (
                <Image
                    source={{ uri: user.profileImage }}
                    style={{ width: 60, height: 60, borderRadius: 50 }}
                />
            );
        }

        return (
            <View
                style={{
                    width: 60,
                    height: 60,
                    borderRadius: 50,
                    backgroundColor: colors.primary.light,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text
                    style={{
                        fontSize: getFontSize(40),
                        fontWeight: "400",
                        color: "#fff",
                    }}
                >
                    {getInitial()}
                </Text>
            </View>
        );
    };

    const handleLogout = async () => {
        try {
            setLoading(true);
            await logout();
            router.replace('/(auth)/login');
        } catch (error) {
            console.log('Logout error: ', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, paddingBottom: 50 }}>
            <ScrollView showsVerticalScrollIndicator={false} className="px-3 pt-3 pb-12">
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Text style={{ fontSize: getFontSize(25), fontWeight: 500 }}>
                        Profile
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => router.push("/(home)/(profile)/profiledetails")}
                    style={{
                        marginTop: 20,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        {renderProfileImage()}
                        <View style={{ gap: 4 }}>
                            <Text style={{ fontSize: getFontSize(17) }}>
                                {user?.firstName}{" "}{user?.lastName}
                            </Text>
                            <Text style={{ opacity: 0.6 }}>show profile</Text>
                        </View>
                    </View>
                    <View>
                        <AntDesign name="right" size={24} color="black" />
                    </View>
                </TouchableOpacity>

                <View className="h-[0.5px] my-6 w-full bg-gray-700"></View>

                <Text style={{ fontSize: getFontSize(20), marginBottom: 10 }}>Support</Text>
                {
                    supportArray.map((item, index) => {
                        return (
                            <TouchableOpacity className="flex flex-row items-center justify-between py-3" key={index}>
                                <View className="flex gap-2 flex-row items-center">
                                    <AntDesign name={item.icon} size={24} color="black" />
                                    <Text>{item.title}</Text>
                                </View>
                                <AntDesign name="right" size={20} color="black" />
                            </TouchableOpacity>
                        )
                    })
                }

                <View className="h-[0.5px] my-6 w-full bg-gray-700"></View>
                <Text style={{ fontSize: getFontSize(20), marginBottom: 10 }}>Legal support</Text>
                {
                    legalArray.map((item, index) => {
                        return (
                            <TouchableOpacity className="flex flex-row items-center justify-between py-3" key={index}>
                                <View className="flex gap-2 flex-row items-center">
                                    <AntDesign name={item.icon} size={24} color="black" />
                                    <Text>{item.title}</Text>
                                </View>
                                <AntDesign name="right" size={20} color="black" />
                            </TouchableOpacity>
                        )
                    })
                }

                <View className="h-[0.5px] my-6 w-full bg-gray-700"></View>


                <TouchableOpacity
                    onPress={handleLogout}
                    disabled={loading}
                    className="flex-row mb-7 items-center bg-primary-50 rounded-full  active:opacity-80"
                >
                    <Feather
                        name="log-out"
                        size={18}
                        color={"black"}
                    />
                    <Text
                        className="ml-2 text-primary-600 font-medium"
                        style={{ fontSize: getFontSize(17) }}
                    >
                        {loading ? "Logging out..." : "Logout"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
