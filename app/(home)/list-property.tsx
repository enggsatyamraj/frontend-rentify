import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Modal,
    Image,
    ActivityIndicator,
    RefreshControl
} from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontSize } from "@/utils/font";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import colors from "@/utils/color";
import { useAuthStore } from "@/store/auth.store";
import { propertyService } from "@/services/property.services";
import { useFocusEffect } from "@react-navigation/native";
import { Button } from "@/components/Button";
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from "expo-router";

export default function listProperty() {
    const height = Dimensions.get("window").height;
    const width = Dimensions.get("window").width;
    const [showListModal, setShowListModal] = React.useState<boolean>(false);
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const [userPropertyLoading, setUserPropertyLoading] =
        React.useState<boolean>(false);
    const [properties, setProperties] = React.useState<any[]>([]);
    const [refreshing, setRefreshing] = React.useState<boolean>(false);


    const getResponsiveButtonShape = () => {
        if (width > 1024) {
            return {
                width: 200,
                height: 50,
                borderRadius: 10,
            };
        }
        return {
            width: 150,
            height: 40,
            borderRadius: 8,
        };
    };

    const fetchUserProperties = async () => {
        try {
            console.log("this is the token:::::::::::::: ", token);
            console.log("this is the user:::::::::::::: ", user);
            setUserPropertyLoading(true);
            const response = await propertyService.getUserProperties(token!);
            console.log("User properties:", response.data);
            setProperties(response.data);
        } catch (error) {
            console.error("Error fetching user properties:", error);
        } finally {
            setUserPropertyLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchUserProperties();
    }, [token])

    useFocusEffect(
        React.useCallback(() => {
            fetchUserProperties();
        }, [token])
    );

    const handleOpen = () => {
        setShowListModal(prev => !prev);
        console.log("add property button clicked");
    };

    return (
        <SafeAreaView className="flex-1">
            <View className="flex-1">
                <ScrollView className="px-3 py-3"
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary.main]} // Android
                            tintColor={colors.primary.main} // iOS
                            title="Pull to refresh" // iOS
                            titleColor={colors.primary.main} // iOS
                        />
                    }

                >
                    {properties.length > 0 && (
                        <Text style={{ fontSize: getFontSize(23) }}>Listed Property</Text>
                    )}
                    <View
                        style={{ minHeight: Dimensions.get("window").height - 200 }}
                        className="flex-1 justify-center items-center"
                    >
                        {userPropertyLoading ? (
                            <View className="">
                                <ActivityIndicator size="large" color={colors.primary.dark} />
                            </View>
                        ) : (
                            <View className="flex-1 items-center justify-center py-8">
                                {properties.length === 0 && (
                                    <View className="items-center px-4">
                                        <Text
                                            className="text-gray-800 text-center mb-2"
                                            style={{ fontSize: getFontSize(20), fontWeight: "600" }}
                                        >
                                            No Properties Listed Yet
                                        </Text>

                                        <Text
                                            className="text-gray-500 text-center mb-6"
                                            style={{ fontSize: getFontSize(14) }}
                                        >
                                            Start listing your properties to reach potential tenants.
                                            It only takes a few minutes!
                                        </Text>

                                        <Button
                                            text="Add Property"
                                            onPress={handleOpen}
                                            className="px-2"
                                            variant="primary"
                                        />
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                    <View>
                        <Modal visible={showListModal} presentationStyle="formSheet" animationType="slide">
                            <View style={{ flex: 1, backgroundColor: 'white' }}>
                                <SafeAreaView className="px-3 py-3">
                                    <ScrollView>
                                        <View className="flex flex-row justify-between items-center">
                                            <Text style={{ fontSize: getFontSize(22) }}>List your properties</Text>
                                            <TouchableOpacity onPress={handleOpen}>
                                                <AntDesign name="close" size={26} color="black" />
                                            </TouchableOpacity>
                                        </View>
                                        {
                                            (!user?.phoneNumber || !user?.aadharNumber) && (
                                                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", height: height - 200 }}>
                                                    <Text style={{ fontSize: getFontSize(16), textAlign: "center" }}>
                                                        Please add you phone number and aadhar number to list your property
                                                    </Text>
                                                    <Button text="Add details" className="px-3 mt-4" onPress={() => {
                                                        setShowListModal(false);
                                                        router.push("/(home)/(profile)/profiledetails")
                                                    }} />
                                                </View>
                                            )
                                        }
                                    </ScrollView>
                                </SafeAreaView>
                            </View>
                        </Modal>
                    </View>
                </ScrollView>

                {properties.length > 0 && (
                    <TouchableOpacity
                        style={{
                            backgroundColor: colors.primary.dark,
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            position: "absolute",
                            bottom: 90,
                            right: 20,
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                        }}
                        className="flex justify-center items-center"
                    >
                        <FontAwesome6 name="plus" size={24} color={"#fff"} />
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}
