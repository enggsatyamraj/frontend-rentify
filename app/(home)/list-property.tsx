import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    StyleSheet
} from "react-native";
import React, { useRef } from "react";
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
import ActionSheet, { ScrollView } from 'react-native-actions-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PropertyForm from "@/components/PropertyForm";
import ListPropertyForm from "@/components/ListPropertyForm";

export default function ListProperty() {
    const height = Dimensions.get("window").height;
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const [userPropertyLoading, setUserPropertyLoading] = React.useState(false);
    const [properties, setProperties] = React.useState([]);
    const [refreshing, setRefreshing] = React.useState(false);
    const listPropertyActionRef = useRef(null);

    const openListPropertyActionSheet = () => {
        // @ts-ignore
        listPropertyActionRef.current?.show();
    };

    const closeListPropertyActionSheet = () => {
        // @ts-ignore
        listPropertyActionRef.current?.hide();
    };

    const fetchUserProperties = async () => {
        try {
            setUserPropertyLoading(true);
            const response = await propertyService.getUserProperties(token);
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
    }, [token]);

    useFocusEffect(
        React.useCallback(() => {
            fetchUserProperties();
        }, [token])
    );

    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateTitle}>
                No Properties Listed Yet
            </Text>
            <Text style={styles.emptyStateDescription}>
                Start listing your properties to reach potential tenants.
                It only takes a few minutes!
            </Text>
            <Button
                text="Add Property"
                onPress={openListPropertyActionSheet}
                className="px-2"
                variant="primary"
            />
        </View>
    );

    const renderVerificationRequest = () => (
        <View style={styles.verificationContainer}>
            <View style={styles.verificationHeader}>
                <Text style={styles.verificationTitle}>List your properties</Text>
                <TouchableOpacity onPress={closeListPropertyActionSheet}>
                    <AntDesign name="close" size={26} color="black" />
                </TouchableOpacity>
            </View>
            <View style={[styles.verificationContent, { height: height - 200 }]}>
                <Text style={styles.verificationText}>
                    Please add your phone number and aadhar number to list your property
                </Text>
                <Button
                    text="Add details"
                    className="px-3 mt-4"
                    onPress={() => {
                        closeListPropertyActionSheet();
                        router.push("/(home)/(profile)/profiledetails");
                    }}
                />
            </View>
        </View>
    );

    const renderAddPropertyButton = () => (
        <TouchableOpacity
            style={styles.addButton}
            onPress={openListPropertyActionSheet}
        >
            <FontAwesome6 name="plus" size={24} color="#fff" />
        </TouchableOpacity>
    );

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaView style={styles.container}>
                <View style={styles.container}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[colors.primary.main]}
                                tintColor={colors.primary.main}
                                title="Pull to refresh"
                                titleColor={colors.primary.main}
                            />
                        }
                    >
                        {properties.length > 0 && (
                            <View>
                                <Text style={styles.title}>Listed Property</Text>
                                {properties.map((property, index) => (
                                    <Text>{property?.title}</Text>
                                ))}
                            </View>
                        )}
                        <View style={styles.contentContainer}>
                            {userPropertyLoading ? (
                                <ActivityIndicator size="large" color={colors.primary.dark} />
                            ) : (
                                <View style={styles.mainContent}>
                                    {properties.length === 0 && renderEmptyState()}
                                </View>
                            )}
                        </View>

                        <ActionSheet
                            ref={listPropertyActionRef}
                            containerStyle={styles.actionSheetContainer}
                            gestureEnabled={true}
                            closeOnTouchBackdrop={true}
                            indicatorStyle={styles.actionSheetIndicator}
                        >
                            {(!user?.phoneNumber || !user?.aadharNumber)
                                ? renderVerificationRequest()
                                : (
                                    <ListPropertyForm
                                        closeListPropertyActionSheet={closeListPropertyActionSheet}
                                    />
                                )
                            }
                        </ActionSheet>
                    </ScrollView>

                    {properties.length > 0 && renderAddPropertyButton()}
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 12,
    },
    title: {
        fontSize: getFontSize(23),
    },
    contentContainer: {
        minHeight: Dimensions.get("window").height - 200,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
    },
    emptyStateContainer: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    emptyStateTitle: {
        fontSize: getFontSize(20),
        fontWeight: "600",
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyStateDescription: {
        fontSize: getFontSize(14),
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    actionSheetContainer: {
        height: '95%',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        backgroundColor: 'white',
    },
    actionSheetIndicator: {
        width: 60,
        height: 4,
        backgroundColor: '#ddd',
        marginTop: 8,
    },
    verificationContainer: {
        padding: 16,
    },
    verificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    verificationTitle: {
        fontSize: getFontSize(22),
    },
    verificationContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    verificationText: {
        fontSize: getFontSize(16),
        textAlign: "center",
    },
    addButton: {
        backgroundColor: colors.primary.dark,
        width: 60,
        height: 60,
        borderRadius: 30,
        position: "absolute",
        bottom: 90,
        right: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});