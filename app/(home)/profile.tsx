import {
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Text,
    StatusBar,
    Alert,
    ActivityIndicator
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import colors from '@/utils/color';
import { STORAGE_KEYS, useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { validateForm, updateProfileSchema } from '@/utils/validations/auth.validation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatDateString = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

export default function Profile() {
    const { user, setUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [imagePermission, setImagePermission] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);


    useEffect(() => {
        const getToken = async () => {
            const token_st = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN)
            setToken(token_st)
        }

        getToken();
    }, [])




    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phoneNumber: user?.phoneNumber || '',
        dateOfBirth: user?.dateOfBirth ? formatDateString(new Date(user.dateOfBirth)) : '',
        aadharNumber: user?.aadharNumber || '',
        profileImage: null,
        address: {
            street: user?.address?.street || '',
            city: user?.address?.city || '',
            region: user?.address?.region || '',
            country: user?.address?.country || '',
            postalCode: user?.address?.postalCode || '',
            coordinates: {
                latitude: user?.address?.coordinates?.latitude || null,
                longitude: user?.address?.coordinates?.longitude || null
            }
        }
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        (async () => {
            const imageStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
            setImagePermission(imageStatus.status === 'granted');
        })();
    }, []);

    // Function to format date input as user types
    const handleDateChange = (text: string) => {
        // Remove any non-digit characters from the input
        let cleanText = text.replace(/\D/g, '');

        // Format the date as DD-MM-YYYY
        if (cleanText.length <= 2) {
            setFormData(prev => ({ ...prev, dateOfBirth: cleanText }));
        } else if (cleanText.length <= 4) {
            setFormData(prev => ({
                ...prev,
                dateOfBirth: cleanText.slice(0, 2) + '-' + cleanText.slice(2)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                dateOfBirth: cleanText.slice(0, 2) + '-' + cleanText.slice(2, 4) + '-' + cleanText.slice(4, 8)
            }));
        }

        // Clear date error when user starts typing
        if (errors.dateOfBirth) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.dateOfBirth;
                return newErrors;
            });
        }
    };

    const fetchCurrentLocation = async () => {
        try {
            setLocationLoading(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrors(prev => ({
                    ...prev,
                    location: 'Location permission denied'
                }));
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const addresses = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (addresses && addresses[0]) {
                const address = addresses[0];
                setFormData(prev => ({
                    ...prev,
                    address: {
                        street: address.street || '',
                        city: address.city || '',
                        region: address.region || '',
                        country: address.country || '',
                        postalCode: address.postalCode || '',
                        coordinates: {
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude
                        }
                    }
                }));
            }
        } catch (error) {
            console.error('Error fetching location:', error);
            setErrors(prev => ({
                ...prev,
                location: 'Failed to fetch location'
            }));
        } finally {
            setLocationLoading(false);
        }
    };

    const handleImagePick = async () => {
        if (!imagePermission) {
            Alert.alert(
                "Permission Required",
                "Please enable photo library access in your device settings to change profile picture.",
                [{ text: "OK" }]
            );
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets[0]) {
                const uri = result.assets[0].uri;
                const fileName = uri.split('/').pop() || 'image.jpg';
                const match = /\.(\w+)$/.exec(fileName);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                setFormData(prev => ({
                    ...prev,
                    profileImage: { uri, type, name: fileName }
                }));
            }
        } catch (error) {
            console.error('Error picking image:', error);
            setErrors(prev => ({
                ...prev,
                image: 'Failed to pick image'
            }));
        }
    };

    // In handleUpdate function:
    const handleUpdate = async () => {
        try {
            setLoading(true);
            const errors: Record<string, string> = {};

            // Basic validations
            if (formData.firstName && !/^[a-zA-Z\s]*$/.test(formData.firstName)) {
                errors.firstName = "First name can only contain letters and spaces";
            }
            if (formData.lastName && !/^[a-zA-Z\s]*$/.test(formData.lastName)) {
                errors.lastName = "Last name can only contain letters and spaces";
            }
            if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
                errors.phoneNumber = "Phone number must be 10 digits";
            }
            if (formData.aadharNumber && !/^\d{12}$/.test(formData.aadharNumber)) {
                errors.aadharNumber = "Aadhar number must be 12 digits";
            }

            if (Object.keys(errors).length > 0) {
                setErrors(errors);
                return;
            }

            // Create update data object
            const updateData: any = {};

            if (formData.firstName) updateData.firstName = formData.firstName;
            if (formData.lastName) updateData.lastName = formData.lastName;
            if (formData.phoneNumber) updateData.phoneNumber = formData.phoneNumber;
            if (formData.aadharNumber) updateData.aadharNumber = formData.aadharNumber;

            if (formData.dateOfBirth) {
                const [day, month, year] = formData.dateOfBirth.split('-').map(Number);
                const date = new Date(year, month - 1, day, 12);
                updateData.dateOfBirth = date.toISOString();
            }

            // Only include address if it has any non-empty values
            if (Object.values(formData.address).some(value => value !== '' && value !== null)) {
                updateData.address = formData.address;
            }

            if (formData.profileImage) {
                updateData.profileImage = formData.profileImage;
            }

            if (!token) throw new Error('Authorization token not found');

            const response = await authService.updateProfile(updateData, token);

            if (response.success) {
                setUser(response.data, token);
                setIsEditing(false);
                setErrors({});
            }
        } catch (error: any) {
            setErrors(prev => ({
                ...prev,
                general: error.response?.data?.message || error.message
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phoneNumber: user?.phoneNumber || '',
            dateOfBirth: user?.dateOfBirth ? formatDateString(new Date(user.dateOfBirth)) : '',
            aadharNumber: user?.aadharNumber || '',
            profileImage: null,
            address: user?.address || {
                street: '',
                city: '',
                region: '',
                country: '',
                postalCode: '',
                coordinates: {
                    latitude: null,
                    longitude: null
                }
            }
        });
        setErrors({});
        setIsEditing(false);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.default }}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
                >
                    <View className="px-4 py-4">
                        {/* Header */}
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                                    Profile
                                </Text>
                                <Text className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                                    {isEditing ? 'Edit your information' : 'View your information'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setIsEditing(!isEditing)}
                                className="p-2 rounded-full"
                                style={{ backgroundColor: colors.background.variant }}
                            >
                                <Feather
                                    name={isEditing ? "x" : "edit-2"}
                                    size={20}
                                    color={colors.primary.main}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Profile Image */}
                        <View className="items-center mb-6">
                            <TouchableOpacity
                                onPress={handleImagePick}
                                disabled={!isEditing}
                                className="relative"
                            >
                                <Image
                                    source={
                                        formData.profileImage
                                            ? { uri: formData.profileImage.uri }
                                            : user?.profileImage
                                                ? { uri: user.profileImage }
                                                : require('@/assets/images/default-avatar.jpg')
                                    }
                                    className="w-24 h-24 rounded-full"
                                    style={{ borderWidth: 3, borderColor: colors.background.paper }}
                                />
                                {isEditing && (
                                    <View
                                        className="absolute bottom-0 right-0 p-2 rounded-full"
                                        style={{ backgroundColor: colors.primary.main }}
                                    >
                                        <Feather name="camera" size={14} color="white" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Form */}
                        <View
                            className="rounded-2xl p-4"
                            style={{
                                backgroundColor: colors.background.paper,
                                shadowColor: colors.grey[300],
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 3,
                                elevation: 2
                            }}
                        >
                            {/* Personal Information */}
                            <Text className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
                                Personal Information
                            </Text>

                            <Input
                                label="First Name"
                                value={formData.firstName}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                                placeholder="Enter first name"
                                disabled={!isEditing}
                                error={errors.firstName}
                                leftIcon="user"
                            />

                            <Input
                                label="Last Name"
                                value={formData.lastName}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                                placeholder="Enter last name"
                                disabled={!isEditing}
                                error={errors.lastName}
                                leftIcon="user"
                            />

                            <Input
                                label="Date of Birth"
                                value={formData.dateOfBirth}
                                onChangeText={handleDateChange}
                                placeholder="DD-MM-YYYY"
                                disabled={!isEditing}
                                error={errors.dateOfBirth}
                                leftIcon="calendar"
                                keyboardType="numeric"
                                maxLength={10}
                            />

                            {/* Contact Information */}
                            <Text className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.text.primary }}>
                                Contact Information
                            </Text>

                            <Input
                                label="Phone Number"
                                value={formData.phoneNumber}
                                onChangeText={(text) => {
                                    const cleaned = text.replace(/\D/g, '');
                                    setFormData(prev => ({ ...prev, phoneNumber: cleaned }));
                                }}
                                placeholder="Enter phone number"
                                disabled={!isEditing}
                                keyboardType="phone-pad"
                                error={errors.phoneNumber}
                                leftIcon="phone"
                                maxLength={10}
                            />

                            <Input
                                label="Aadhar Number"
                                value={formData.aadharNumber}
                                onChangeText={(text) => {
                                    const cleaned = text.replace(/\D/g, '');
                                    setFormData(prev => ({ ...prev, aadharNumber: cleaned }));
                                }}
                                placeholder="Enter Aadhar number"
                                disabled={!isEditing}
                                keyboardType="numeric"
                                maxLength={12}
                                error={errors.aadharNumber}
                                leftIcon="credit-card"
                            />

                            {/* Address Section */}
                            <View className="mt-6">
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                                        Address Details
                                    </Text>
                                    {isEditing && (
                                        <TouchableOpacity
                                            onPress={fetchCurrentLocation}
                                            className="flex-row items-center"
                                            disabled={locationLoading}
                                        >
                                            {locationLoading ? (
                                                <ActivityIndicator size="small" color={colors.primary.main} />
                                            ) : (
                                                <>
                                                    <Feather name="navigation" size={16} color={colors.primary.main} />
                                                    <Text className="ml-2" style={{ color: colors.primary.main }}>
                                                        Use Current Location
                                                    </Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {errors.location && (
                                    <Text className="text-xs mb-2" style={{ color: colors.error.main }}>
                                        {errors.location}
                                    </Text>
                                )}

                                <Input
                                    label="Street"
                                    value={formData.address.street}
                                    onChangeText={(text) => setFormData(prev => ({
                                        ...prev,
                                        address: { ...prev.address, street: text }
                                    }))}
                                    placeholder="Enter street address"
                                    disabled={!isEditing}
                                    error={errors.street}
                                    leftIcon="map-pin"
                                />

                                <Input
                                    label="City"
                                    value={formData.address.city}
                                    onChangeText={(text) => setFormData(prev => ({
                                        ...prev,
                                        address: { ...prev.address, city: text }
                                    }))}
                                    placeholder="Enter city"
                                    disabled={!isEditing}
                                    error={errors.city}
                                    leftIcon="map"
                                />

                                <Input
                                    label="Region/State"
                                    value={formData.address.region}
                                    onChangeText={(text) => setFormData(prev => ({
                                        ...prev,
                                        address: { ...prev.address, region: text }
                                    }))}
                                    placeholder="Enter region or state"
                                    disabled={!isEditing}
                                    error={errors.region}
                                    leftIcon="map"
                                />

                                <Input
                                    label="Country"
                                    value={formData.address.country}
                                    onChangeText={(text) => setFormData(prev => ({
                                        ...prev,
                                        address: { ...prev.address, country: text }
                                    }))}
                                    placeholder="Enter country"
                                    disabled={!isEditing}
                                    error={errors.country}
                                    leftIcon="globe"
                                />

                                <Input
                                    label="Postal Code"
                                    value={formData.address.postalCode}
                                    onChangeText={(text) => {
                                        const cleaned = text.replace(/\D/g, '');
                                        setFormData(prev => ({
                                            ...prev,
                                            address: { ...prev.address, postalCode: cleaned }
                                        }));
                                    }}
                                    placeholder="Enter postal code"
                                    disabled={!isEditing}
                                    error={errors.postalCode}
                                    leftIcon="hash"
                                    keyboardType="numeric"
                                    maxLength={6}
                                />

                                {formData.address?.coordinates?.latitude && formData.address?.coordinates?.longitude && (
                                    <View className="mt-4 p-3 rounded-lg" style={{ backgroundColor: colors.background.variant }}>
                                        <Text className="text-sm" style={{ color: colors.text.secondary }}>
                                            📍 Location coordinates
                                        </Text>
                                        <Text className="text-xs mt-1" style={{ color: colors.text.hint }}>
                                            Lat: {formData.address.coordinates.latitude.toFixed(6)}{'\n'}
                                            Long: {formData.address.coordinates.longitude.toFixed(6)}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {isEditing && (
                                <View className="mt-8 flex flex-col gap-4 mb-4">
                                    <Button
                                        text={loading ? "Updating..." : "Save Changes"}
                                        onPress={handleUpdate}
                                        loading={loading}
                                        disabled={loading}
                                    />
                                    <Button
                                        text="Cancel"
                                        onPress={handleCancel}
                                        variant="secondary"
                                        disabled={loading}
                                    />
                                </View>
                            )}

                            {/* {errors.general && (
                                <Text className="text-red-500 text-center mt-4">
                                    {errors.general}
                                </Text>
                            )} */}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}