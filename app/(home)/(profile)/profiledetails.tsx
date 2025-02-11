import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, Feather } from '@expo/vector-icons';
import { getFontSize } from '@/utils/font';
import { router, useFocusEffect } from 'expo-router';
import { authService } from '@/services/auth.service';
import { STORAGE_KEYS, useAuthStore } from '@/store/auth.store';
import colors from '@/utils/color';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Button } from '@/components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface Address {
    street?: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

interface UserInfo {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    profileImage?: string;
    aadharVerified: boolean;
    isVerified: boolean;
    dateOfBirth?: string;
    aadharNumber?: string;
    address?: Address;
}

interface ImagePickerResult {
    uri: string;
    name?: string;
    type: string;
}

const InputField = ({
    label,
    value,
    onChangeText,
    editable,
    placeholder,
    icon
}: {
    label: string;
    value?: string;
    onChangeText: (text: string) => void;
    editable: boolean;
    placeholder: string;
    icon?: React.ComponentProps<typeof Feather>['name'];
}) => (
    <View className="mb-4">
        <Text className="text-gray-600 mb-2 font-medium" style={{ fontSize: getFontSize(14) }}>
            {label}
        </Text>
        <View className="flex-row items-center border border-gray-200 rounded-xl bg-white overflow-hidden">
            {icon && (
                <View className="pl-4">
                    <Feather name={icon} size={20} color={colors.grey[500]} />
                </View>
            )}
            {editable ? (
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    className="flex-1 p-4 text-gray-900"
                    placeholderTextColor={colors.grey[500]}
                    style={{ fontSize: getFontSize(16) }}
                />
            ) : (
                <Text className="flex-1 p-4 text-gray-900" style={{ fontSize: getFontSize(16) }}>
                    {value || 'Not available'}
                </Text>
            )}
        </View>
    </View>
);

const Card = ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        {title && (
            <Text className="text-gray-900 font-semibold mb-4" style={{ fontSize: getFontSize(16) }}>
                {title}
            </Text>
        )}
        {children}
    </View>
);

const ProfileDetails = () => {
    const [canEdit, setEdit] = useState(false);
    const { token, setUser } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [profile, setProfile] = useState<UserInfo | null>(null);
    const [formData, setFormData] = useState<Partial<UserInfo>>({});
    const [imageLoading, setImageLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<ImagePickerResult | null>(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await authService.getProfile(token!);
            const userInfo = response?.userInfo;
            console.log("this is the userinfo", userInfo);
            setProfile(userInfo);
            setFormData(userInfo);
        } catch (err) {
            console.error('Error fetching profile:', err);
            Alert.alert('Error', 'Failed to fetch profile information');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchProfile();
        }, [token])
    );

    const handleImagePick = async () => {
        try {
            setImageLoading(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets[0]) {
                const localUri = result.assets[0].uri;
                const filename = localUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                setSelectedImage({
                    uri: localUri,
                    name: filename,
                    type,
                });
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setImageLoading(false);
        }
    };

    const getCurrentLocation = async () => {
        try {
            setLocationLoading(true);
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (address[0]) {
                setFormData(prev => ({
                    ...prev,
                    address: {
                        street: address[0].street,
                        city: address[0].city,
                        region: address[0].region,
                        country: address[0].country,
                        postalCode: address[0].postalCode,
                        coordinates: {
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude
                        }
                    }
                }));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to get current location');
        } finally {
            setLocationLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setUpdateLoading(true);

            let updateData;
            if (selectedImage) {
                // Create FormData for image upload
                const formData = new FormData();
                formData.append('profileImage', {
                    uri: selectedImage.uri,
                    name: selectedImage.name,
                    type: selectedImage.type,
                } as any);

                // Append other form data
                Object.keys(formData).forEach(key => {
                    if (key !== 'profileImage') {
                        formData.append(key, formData[key]);
                    }
                });

                updateData = formData;
            } else {
                updateData = formData;
            }

            const response = await authService.updateProfile(updateData, token);

            if (response.success) {
                await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
                setUser(response.data, token!);
                setProfile(response.data);
                setSelectedImage(null);
                setEdit(false);
                Alert.alert('Success', 'Profile updated successfully');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 px-4 py-6">
                    <View className="w-24 h-24 rounded-full bg-gray-200 self-center mb-6" />
                    {[1, 2, 3, 4].map(i => (
                        <Animated.View
                            key={i}
                            entering={FadeIn.delay(i * 100)}
                            className="h-12 bg-gray-200 rounded-xl mb-4"
                        />
                    ))}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 h-16">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-full bg-white shadow-sm"
                >
                    <AntDesign name="left" size={20} color={colors.text.primary} />
                </TouchableOpacity>
                <Text className="text-xl font-semibold">Profile Details</Text>
                <TouchableOpacity
                    onPress={() => setEdit(!canEdit)}
                    className="w-10 h-10 items-center justify-center rounded-full bg-white shadow-sm"
                >
                    <AntDesign name={canEdit ? "check" : "edit"} size={20} color={colors.primary.main} />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {profile && (
                    <>
                        {/* Profile Image */}
                        <View className="items-center py-6">
                            <TouchableOpacity
                                onPress={canEdit ? handleImagePick : undefined}
                                disabled={imageLoading}
                                className="relative"
                            >
                                {imageLoading ? (
                                    <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center">
                                        <ActivityIndicator color={colors.primary.main} />
                                    </View>
                                ) : selectedImage ? (
                                    <Image
                                        source={{ uri: selectedImage.uri }}
                                        className="w-24 h-24 rounded-full"
                                    />
                                ) : profile.profileImage ? (
                                    <Image
                                        source={{ uri: profile.profileImage }}
                                        className="w-24 h-24 rounded-full"
                                    />
                                ) : (
                                    <View className="w-24 h-24 rounded-full bg-primary-600 items-center justify-center">
                                        <Text className="text-white text-2xl">
                                            {profile.firstName?.trim()?.[0]?.toUpperCase() || '?'}
                                        </Text>
                                    </View>
                                )}
                                {canEdit && (
                                    <View className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-sm">
                                        <Feather name="camera" size={18} color={colors.primary.main} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Personal Information */}
                        <Card title="Personal Information">
                            <InputField
                                label="First Name"
                                value={formData.firstName}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                                editable={canEdit}
                                placeholder="Enter first name"
                                icon="user"
                            />
                            <InputField
                                label="Last Name"
                                value={formData.lastName}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                                editable={canEdit}
                                placeholder="Enter last name"
                                icon="user"
                            />
                            <InputField
                                label="Phone Number"
                                value={formData.phoneNumber}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
                                editable={canEdit}
                                placeholder="Enter phone number"
                                icon="phone"
                            />
                            <InputField
                                label="Aadhar Number"
                                value={formData.aadharNumber}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, aadharNumber: text }))}
                                editable={canEdit}
                                placeholder="Enter Aadhar number"
                                icon="credit-card"
                            />
                        </Card>

                        {/* Address Information */}
                        <Card title="Address Information">
                            {canEdit && (
                                <Button
                                    text="Use Current Location"
                                    onPress={getCurrentLocation}
                                    loading={locationLoading}
                                    variant="secondary"
                                    className="mb-4"
                                    loadingColor={colors.primary.main}
                                />
                            )}
                            <InputField
                                label="Street"
                                value={formData.address?.street}
                                onChangeText={(text) => setFormData(prev => ({
                                    ...prev,
                                    address: { ...prev.address, street: text }
                                }))}
                                editable={canEdit}
                                placeholder="Enter street"
                                icon="map-pin"
                            />
                            <InputField
                                label="City"
                                value={formData.address?.city}
                                onChangeText={(text) => setFormData(prev => ({
                                    ...prev,
                                    address: { ...prev.address, city: text }
                                }))}
                                editable={canEdit}
                                placeholder="Enter city"
                                icon="map"
                            />
                            <InputField
                                label="Region"
                                value={formData.address?.region}
                                onChangeText={(text) => setFormData(prev => ({
                                    ...prev,
                                    address: { ...prev.address, region: text }
                                }))}
                                editable={canEdit}
                                placeholder="Enter region"
                                icon="map"
                            />
                            <InputField
                                label="Postal Code"
                                value={formData.address?.postalCode}
                                onChangeText={(text) => setFormData(prev => ({
                                    ...prev,
                                    address: { ...prev.address, postalCode: text }
                                }))}
                                editable={canEdit}
                                placeholder="Enter postal code"
                                icon="mail"
                            />
                            <InputField
                                label="Country"
                                value={formData.address?.country}
                                onChangeText={(text) => setFormData(prev => ({
                                    ...prev,
                                    address: { ...prev.address, country: text }
                                }))}
                                editable={canEdit}
                                placeholder="Enter country"
                                icon="globe"
                            />
                        </Card>

                        {/* Action Buttons */}
                        {canEdit && (
                            <View className="flex-row space-x-4 mt-6 gap-3 mb-10">
                                <Button
                                    text="Cancel"
                                    onPress={() => {
                                        setFormData(profile);
                                        setSelectedImage(null);
                                        setEdit(false);
                                    }}
                                    variant="secondary"
                                    className="flex-1"
                                />
                                <Button
                                    text="Save Changes"
                                    onPress={handleUpdateProfile}
                                    loading={updateLoading}
                                    className="flex-1"
                                />
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileDetails;