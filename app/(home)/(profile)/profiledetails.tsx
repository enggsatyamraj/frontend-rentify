import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AntDesign from '@expo/vector-icons/AntDesign';
import { getFontSize } from '@/utils/font';
import { router, useFocusEffect } from 'expo-router';
import { authService } from '@/services/auth.service';
import { STORAGE_KEYS, useAuthStore } from '@/store/auth.store';
import colors from '@/utils/color';

interface UserInfo {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profileImage?: string;
    aadharVerified: boolean;
    isVerified: boolean;
}

export default function ProfileDetails() {
    const [canEdit, setEdit] = React.useState<boolean>(false);
    const { token } = useAuthStore();
    const [loading, setLoading] = React.useState<boolean>(false);
    const [profile, setProfile] = React.useState<UserInfo | null>(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await authService.getProfile(token!);
            setProfile(response?.userInfo);
        } catch (err) {
            console.log('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            fetchProfile()
        }, [token])
    )

    const InfoRow = ({ label, value }: { label: string; value: string }) => (
        <View className="flex-row items-center justify-between py-5 border-b border-gray-100">
            <Text style={{ fontSize: getFontSize(15) }} className="text-gray-600">
                {label}
            </Text>
            <Text style={{ fontSize: getFontSize(15) }} className="text-gray-900">
                {value || 'Not available'}
            </Text>
        </View>
    );

    const VerificationBadge = ({ verified, label }: { verified: boolean; label: string }) => (
        <View className="flex-row items-center bg-gray-50 px-4 py-3 rounded-lg">
            <View className={`w-2 h-2 rounded-full mr-2 ${verified ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text style={{ fontSize: getFontSize(14) }} className="text-gray-600">
                {label}
            </Text>
            <Text style={{ fontSize: getFontSize(14) }} className="text-gray-900 ml-1">
                {verified ? 'Verified' : 'Not Verified'}
            </Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Minimal Header */}
            <View className="flex-row items-center justify-between px-4 h-16">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center"
                >
                    <AntDesign name="left" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEdit(prev => !prev)}>
                    <AntDesign
                        name={canEdit ? "save" : "edit"}
                        size={22}
                        color={colors.primary.main}
                    />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : profile ? (
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Profile Header Section */}
                    <View className="items-center pt-6 pb-10">
                        <View className="relative mb-6">
                            {profile.profileImage ? (
                                <Image
                                    source={{ uri: profile.profileImage }}
                                    className="w-24 h-24 rounded-full"
                                    style={{ backgroundColor: colors.grey[100] }}
                                />
                            ) : (
                                <View
                                    className="w-24 h-24 rounded-full items-center justify-center"
                                    style={{ backgroundColor: colors.primary.light }}
                                >
                                    <Text className="text-white" style={{ fontSize: getFontSize(36) }}>
                                        {profile.firstName?.[0]?.toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            {canEdit && (
                                <TouchableOpacity
                                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white items-center justify-center"
                                    style={{
                                        borderWidth: 1.5,
                                        borderColor: colors.primary.main,
                                        shadowColor: colors.grey[400],
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 3,
                                        elevation: 2
                                    }}
                                >
                                    <AntDesign name="camera" size={16} color={colors.primary.main} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={{ fontSize: getFontSize(22) }} className="font-medium text-gray-900">
                            {`${profile.firstName} ${profile.lastName}`}
                        </Text>
                        <Text style={{ fontSize: getFontSize(14) }} className="text-gray-500 mt-1">
                            {profile.email}
                        </Text>
                    </View>

                    {/* Verification Status */}
                    <View className="px-4 flex-row justify-between gap-3 mb-8">
                        <VerificationBadge verified={profile.isVerified} label="Account:" />
                        <VerificationBadge verified={profile.aadharVerified} label="Aadhar:" />
                    </View>

                    {/* Profile Information */}
                    <View className="px-4">
                        <Text style={{ fontSize: getFontSize(16) }} className="text-gray-900 font-medium mb-4">
                            Personal Information
                        </Text>
                        <InfoRow label="First Name" value={profile.firstName} />
                        <InfoRow label="Last Name" value={profile.lastName} />
                        <InfoRow label="Email" value={profile.email} />
                        <InfoRow label="Phone" value={profile.phoneNumber} />
                    </View>
                </ScrollView>
            ) : (
                <View className="flex-1 justify-center items-center">
                    <Text style={{ fontSize: getFontSize(15) }} className="text-gray-500">
                        Profile information not available
                    </Text>
                </View>
            )}
        </SafeAreaView>
    )
}