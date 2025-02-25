import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Switch,
    Image,
    Alert,
    Platform
} from 'react-native';
import React, { useState, useEffect } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import { getFontSize } from '@/utils/font';
import { Button } from '@/components/Button';
import InputWithLabel from '@/components/InputWithLabel';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store/auth.store';
import { propertyService } from '@/services/property.services';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { ScrollView } from 'react-native-actions-sheet';

interface PropertyFormData {
    title: string;
    description: string;
    propertyType: 'full-house' | 'single-room' | 'multi-room' | 'pg';
    price: {
        basePrice: number;
        billType: 'daily' | 'monthly';
        securityDeposit: number;
    };
    location: {
        address: string;
        city: string;
        state: string;
        pincode: string;
        landmark?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    details: {
        roomType: 'single' | 'double' | 'triple' | 'full-house';
        totalRooms: number;
        availableRooms: number;
        sharedBathroom: boolean;
        furnishingStatus: 'fully' | 'semi' | 'unfurnished';
        roomSize: number;
        floorNumber: number;
        parking: boolean;
    };
    amenities: string[];
    preferredTenants: ('family' | 'bachelors' | 'girls' | 'boys' | 'any')[];
    availableFrom: Date;
    rules: string[];
    foodAvailable: boolean;
    maintainenceCharges: {
        amount: number;
        billType: 'monthly' | 'quarterly' | 'yearly';
        includesFood: boolean;
        includesUtility: boolean;
    };
}

interface ListPropertyFormProps {
    closeListPropertyActionSheet: () => void;
}

// Custom Switch Component
const CustomSwitch = ({ value, onValueChange }: { value: boolean; onValueChange: (value: boolean) => void }) => (
    <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E7EB', true: '#2A3C6E' }}
        thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : value ? '#FFFFFF' : '#FFFFFF'}
        ios_backgroundColor="#E5E7EB"
    />
);

export default function ListPropertyForm({ closeListPropertyActionSheet }: ListPropertyFormProps) {
    const token = useAuthStore((state) => state.token);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<{ uri: string; file: File }[]>([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [newAmenity, setNewAmenity] = useState('');
    const [newRule, setNewRule] = useState('');
    const [customAmenities, setCustomAmenities] = useState<string[]>([]);

    const [formData, setFormData] = useState<PropertyFormData>({
        title: '',
        description: '',
        propertyType: 'full-house',
        price: {
            basePrice: 0,
            billType: 'monthly',
            securityDeposit: 0
        },
        location: {
            address: '',
            city: '',
            state: '',
            pincode: '',
            landmark: '',
            coordinates: {
                latitude: 0,
                longitude: 0
            }
        },
        details: {
            roomType: 'full-house',
            totalRooms: 1,
            availableRooms: 1,
            sharedBathroom: false,
            furnishingStatus: 'unfurnished',
            roomSize: 0,
            floorNumber: 0,
            parking: false
        },
        amenities: [],
        preferredTenants: ['any'],
        availableFrom: new Date(),
        rules: [],
        foodAvailable: false,
        maintainenceCharges: {
            amount: 0,
            billType: 'monthly',
            includesFood: false,
            includesUtility: false
        }
    });

    // Constants
    const amenityOptions = [
        'wifi', 'tv', 'fridge', 'washing-machine', 'kitchen',
        'geyser', 'ac', 'cupboard', 'bed', 'water-purifier',
        'power-backup', 'lift', 'security', 'cctv'
    ];

    const tenantOptions = ['family', 'bachelors', 'girls', 'boys', 'any'];

    // Handle numeric input with validation
    const handleNumericInput = (value: string, parentKey: keyof PropertyFormData, childKey?: string) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        const numberValue = numericValue === '' ? 0 : parseInt(numericValue, 10);

        if (childKey) {
            handleNestedChange(parentKey, childKey, numberValue);
        } else {
            setFormData(prev => ({
                ...prev,
                [parentKey]: numberValue
            }));
        }
    };

    // Amenities and Rules management
    const addCustomAmenity = () => {
        if (newAmenity.trim()) {
            const formattedAmenity = newAmenity.trim().toLowerCase();
            if (!formData.amenities.includes(formattedAmenity) && !amenityOptions.includes(formattedAmenity)) {
                setCustomAmenities(prev => [...prev, formattedAmenity]);
                setFormData(prev => ({
                    ...prev,
                    amenities: [...prev.amenities, formattedAmenity]
                }));
                setNewAmenity('');
            } else {
                Alert.alert('Error', 'This amenity already exists');
            }
        }
    };

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const addNewRule = () => {
        if (newRule.trim()) {
            setFormData(prev => ({
                ...prev,
                rules: [...prev.rules, newRule.trim()]
            }));
            setNewRule('');
        }
    };

    const removeRule = (index: number) => {
        setFormData(prev => ({
            ...prev,
            rules: prev.rules.filter((_, i) => i !== index)
        }));
    };

    // Location handling
    const getCurrentLocation = async () => {
        try {
            setLocationLoading(true);

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            let address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (address.length > 0) {
                const currentAddress = address[0];
                setFormData(prev => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        address: `${currentAddress.street || ''} ${currentAddress.district || ''}`,
                        city: currentAddress.city || '',
                        state: currentAddress.region || '',
                        pincode: currentAddress.postalCode || '',
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

    // Image handling
    const pickImages = async () => {
        if (images.length >= 10) {
            Alert.alert('Error', 'Maximum 10 images allowed');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.7,
                selectionLimit: 10 - images.length
            });

            if (!result.canceled) {
                const newImages = await Promise.all(
                    result.assets.map(async (asset) => {
                        const response = await fetch(asset.uri);
                        const blob = await response.blob();
                        return {
                            uri: asset.uri,
                            file: blob
                        };
                    })
                );

                setImages([...images, ...newImages]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick images');
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    // Date handling
    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate && event.type !== 'dismissed') {
            setFormData(prev => ({
                ...prev,
                availableFrom: selectedDate
            }));
        }
    };

    // Form validation
    const validateForm = () => {
        if (!formData.title.trim()) {
            Alert.alert('Error', 'Please enter property title');
            return false;
        }
        if (!formData.description.trim()) {
            Alert.alert('Error', 'Please enter property description');
            return false;
        }
        if (!formData.price.basePrice || formData.price.basePrice <= 0) {
            Alert.alert('Error', 'Please enter a valid base price');
            return false;
        }
        if (!formData.price.securityDeposit || formData.price.securityDeposit <= 0) {
            Alert.alert('Error', 'Please enter a valid security deposit');
            return false;
        }
        if (!formData.location.address.trim()) {
            Alert.alert('Error', 'Please enter property address');
            return false;
        }
        if (!formData.location.city.trim()) {
            Alert.alert('Error', 'Please enter city');
            return false;
        }
        if (!formData.location.state.trim()) {
            Alert.alert('Error', 'Please enter state');
            return false;
        }
        if (!formData.location.pincode.trim()) {
            Alert.alert('Error', 'Please enter pincode');
            return false;
        }
        if (formData.details.totalRooms <= 0) {
            Alert.alert('Error', 'Please enter valid total rooms');
            return false;
        }
        if (formData.details.availableRooms <= 0) {
            Alert.alert('Error', 'Please enter valid available rooms');
            return false;
        }
        if (formData.details.availableRooms > formData.details.totalRooms) {
            Alert.alert('Error', 'Available rooms cannot be more than total rooms');
            return false;
        }
        if (formData.details.roomSize <= 0) {
            Alert.alert('Error', 'Please enter valid room size');
            return false;
        }
        return true;
    };

    // Form submission
    const handleSubmit = async () => {
        try {
            if (!validateForm()) return;

            if (images.length === 0) {
                Alert.alert('Error', 'Please upload at least one image');
                return;
            }

            setLoading(true);

            // Format images for upload
            const formattedImages = images.map((image, index) => ({
                uri: image.uri,
                type: 'image/jpeg',
                name: `image-${index}.jpg`
            }));

            await propertyService.createProperty(
                formData,
                formattedImages,
                token
            );

            Alert.alert('Success', 'Property listed successfully', [
                {
                    text: 'OK',
                    onPress: closeListPropertyActionSheet
                }
            ]);
        } catch (error: any) {
            console.error('Error creating property:', error);
            console.log("Errors::::::::::::", error.errors);

            // Handle validation errors
            if (error.errors) {
                const errorMessages = error.errors
                    .map((err: { field: string; message: string }) => `• ${err.message}`)
                    .join('\n');

                Alert.alert(
                    'Validation Error',
                    'Please fix the following issues:\n\n' + errorMessages
                );
            } else {
                // Handle other types of errors
                Alert.alert('Error', error.message || 'Failed to list property');
            }
        } finally {
            setLoading(false);
        }
    };

    // Form value handlers
    const handleNestedChange = (
        parentKey: keyof PropertyFormData,
        childKey: string,
        value: any
    ) => {
        setFormData(prev => ({
            ...prev,
            [parentKey]: {
                ...prev[parentKey],
                [childKey]: value
            }
        }));
    };

    // const toggleAmenity = (amenity: string) => {
    //     setFormData(prev => ({
    //         ...prev,
    //         amenities: prev.amenities.includes(amenity)
    //             ? prev.amenities.filter(a => a !== amenity)
    //             : [...prev.amenities, amenity]
    //     }));
    // };

    const toggleTenant = (tenant: string) => {
        setFormData(prev => ({
            ...prev,
            preferredTenants: prev.preferredTenants.includes(tenant)
                ? prev.preferredTenants.filter(t => t !== tenant)
                : [...prev.preferredTenants, tenant]
        }));
    };

    // Style generators
    const getToggleStyle = (isActive: boolean) => ({
        backgroundColor: isActive ? '#2A3C6E' : '#E5E7EB'
    });

    const getToggleTextStyle = (isActive: boolean) => ({
        color: isActive ? '#FFFFFF' : '#374151'
    });

    return (
        <ScrollView className='px-3 py-2'>
            {/* Header */}
            <View className='flex-row items-center justify-between mb-4'>
                <View className='flex-row items-center gap-2'>
                    <TouchableOpacity onPress={closeListPropertyActionSheet}>
                        <AntDesign name="left" size={20} color="black" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: getFontSize(20) }} className='font-semibold'>
                        List your property
                    </Text>
                </View>
            </View>

            {/* Basic Information */}
            <View className='mb-4'>
                <Text className='text-lg font-semibold mb-2'>Basic Information</Text>

                <InputWithLabel
                    label="Property Title*"
                    value={formData.title}
                    onChangeText={(value) => setFormData(prev => ({ ...prev, title: value }))}
                    placeholder="Enter property title"
                />

                <InputWithLabel
                    label="Description*"
                    value={formData.description}
                    onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
                    placeholder="Describe your property"
                    multiline
                    numberOfLines={3}
                />

                {/* Property Type Selection */}
                <View className='mb-3'>
                    <Text className='mb-1'>Property Type*</Text>
                    <View className='flex-row flex-wrap gap-2'>
                        {['full-house', 'single-room', 'multi-room', 'pg'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                className={`px-4 py-2 rounded-full`}
                                style={getToggleStyle(formData.propertyType === type)}
                                onPress={() => setFormData(prev => ({ ...prev, propertyType: type as any }))}
                            >
                                <Text style={getToggleTextStyle(formData.propertyType === type)}>
                                    {type.split('-').map(word =>
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Price Details */}
            <View className='mb-4'>
                <Text className='text-lg font-semibold mb-2'>Price Details</Text>

                <InputWithLabel
                    label="Base Price*"
                    value={formData.price.basePrice.toString()}
                    onChangeText={(value) => handleNumericInput(value, 'price', 'basePrice')}
                    placeholder="₹"
                    keyboardType="numeric"
                    isNumeric
                />

                <InputWithLabel
                    label="Security Deposit*"
                    value={formData.price.securityDeposit.toString()}
                    onChangeText={(value) => handleNumericInput(value, 'price', 'securityDeposit')}
                    placeholder="₹"
                    keyboardType="numeric"
                    isNumeric
                />

                <View className='mb-3'>
                    <Text className='mb-1'>Bill Type</Text>
                    <View className='flex-row gap-2'>
                        {['monthly'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                className={`px-4 py-2 rounded-full`}
                                style={getToggleStyle(formData.price.billType === type)}
                                onPress={() => handleNestedChange('price', 'billType', type)}
                            >
                                <Text style={getToggleTextStyle(formData.price.billType === type)}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Location Section */}
            <View className='mb-4'>
                <Text className='text-lg font-semibold mb-2'>Location</Text>

                <View className='mb-3'>
                    <View className='flex-row justify-between items-center mb-2'>
                        <Text className='mb-1'>Address*</Text>
                        <TouchableOpacity
                            onPress={getCurrentLocation}
                            disabled={locationLoading}
                            className='flex-row items-center'
                        >
                            <MaterialIcons name="my-location" size={18} color="#2A3C6E" />
                            <Text className='ml-1 text-[#2A3C6E]'>
                                {locationLoading ? 'Getting location...' : 'Use current location'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <InputWithLabel
                        value={formData.location.address}
                        onChangeText={(value) => handleNestedChange('location', 'address', value)}
                        placeholder="Enter complete address"
                        multiline
                    />
                </View>

                <View className='flex-row gap-2 mb-3'>
                    <View className='flex-1'>
                        <InputWithLabel
                            label="City*"
                            value={formData.location.city}
                            onChangeText={(value) => handleNestedChange('location', 'city', value)}
                            placeholder="City"
                        />
                    </View>
                    <View className='flex-1'>
                        <InputWithLabel
                            label="State*"
                            value={formData.location.state}
                            onChangeText={(value) => handleNestedChange('location', 'state', value)}
                            placeholder="State"
                        />
                    </View>
                </View>

                <InputWithLabel
                    label="Pincode*"
                    value={formData.location.pincode}
                    onChangeText={(value) => handleNestedChange('location', 'pincode', value)}
                    placeholder="Enter pincode"
                    keyboardType="numeric"
                    isNumeric
                />

                <InputWithLabel
                    label="Landmark"
                    value={formData.location.landmark}
                    onChangeText={(value) => handleNestedChange('location', 'landmark', value)}
                    placeholder="Enter nearby landmark"
                />
            </View>

            {/* Property Details */}
            <View className='mb-4'>
                <Text className='text-lg font-semibold mb-2'>Property Details</Text>

                <View className='mb-3'>
                    <Text className='mb-1'>Room Type*</Text>
                    <View className='flex-row flex-wrap gap-2'>
                        {['single', 'double', 'triple', 'full-house'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                className={`px-4 py-2 rounded-full`}
                                style={getToggleStyle(formData.details.roomType === type)}
                                onPress={() => handleNestedChange('details', 'roomType', type as any)}
                            >
                                <Text style={getToggleTextStyle(formData.details.roomType === type)}>
                                    {type.split('-').map(word =>
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className='flex-row gap-2 mb-3'>
                    <View className='flex-1'>
                        <InputWithLabel
                            label="Total Rooms*"
                            value={formData.details.totalRooms.toString()}
                            onChangeText={(value) => handleNumericInput(value, 'details', 'totalRooms')}
                            placeholder="Total rooms"
                            keyboardType="numeric"
                            isNumeric
                        />
                    </View>
                    <View className='flex-1'>
                        <InputWithLabel
                            label="Available Rooms*"
                            value={formData.details.availableRooms.toString()}
                            onChangeText={(value) => handleNumericInput(value, 'details', 'availableRooms')}
                            placeholder="Available rooms"
                            keyboardType="numeric"
                            isNumeric
                        />
                    </View>
                </View>

                <InputWithLabel
                    label="Room Size (sq ft)*"
                    value={formData.details.roomSize.toString()}
                    onChangeText={(value) => handleNumericInput(value, 'details', 'roomSize')}
                    placeholder="Enter room size"
                    keyboardType="numeric"
                    isNumeric
                />

                <InputWithLabel
                    label="Floor Number*"
                    value={formData.details.floorNumber.toString()}
                    onChangeText={(value) => handleNumericInput(value, 'details', 'floorNumber')}
                    placeholder="Enter floor number"
                    keyboardType="numeric"
                    isNumeric
                />

                <View className='mb-3'>
                    <Text className='mb-1'>Furnishing Status*</Text>
                    <View className='flex-row flex-wrap gap-2'>
                        {['fully', 'semi', 'unfurnished'].map((status) => (
                            <TouchableOpacity
                                key={status}
                                className={`px-4 py-2 rounded-full`}
                                style={getToggleStyle(formData.details.furnishingStatus === status)}
                                onPress={() => handleNestedChange('details', 'furnishingStatus', status as any)}
                            >
                                <Text style={getToggleTextStyle(formData.details.furnishingStatus === status)}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className='flex-row justify-between items-center mb-3'>
                    <Text>Shared Bathroom</Text>
                    <CustomSwitch
                        value={formData.details.sharedBathroom}
                        onValueChange={(value) => handleNestedChange('details', 'sharedBathroom', value)}
                    />
                </View>

                <View className='flex-row justify-between items-center mb-3'>
                    <Text>Parking Available</Text>
                    <CustomSwitch
                        value={formData.details.parking}
                        onValueChange={(value) => handleNestedChange('details', 'parking', value)}
                    />
                </View>
            </View>

            {/* Available From */}
            <View className='mb-4'>
                <Text className='text-lg font-semibold mb-2'>Availability</Text>
                <View className='mb-3'>
                    <Text className='mb-1'>Available From*</Text>
                    <TouchableOpacity
                        className='border border-gray-300 rounded-lg p-2'
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text>{formData.availableFrom.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Date Picker Modal */}
            {showDatePicker && (
                <DateTimePicker
                    value={formData.availableFrom}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                />
            )}

            {/* Amenities */}
            {/* Amenities */}
            <View className='mb-4'>
                <Text className='text-lg font-semibold mb-2'>Amenities</Text>

                {/* Custom Amenity Input - Moved to top */}
                <View className='flex-row items-center gap-2 mb-3'>
                    <TextInput
                        className='flex-1 border border-gray-300 rounded-lg p-2'
                        value={newAmenity}
                        onChangeText={setNewAmenity}
                        placeholder="Add custom amenity"
                    />
                    <TouchableOpacity
                        onPress={addCustomAmenity}
                        className='bg-[#2A3C6E] p-2 rounded-lg h-[44px] items-center justify-center'
                    >
                        <AntDesign name="plus" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* All Amenities Display */}
                <View className='flex-row flex-wrap gap-2'>
                    {/* Show custom amenities mixed with predefined ones */}
                    {[...amenityOptions, ...customAmenities].map((amenity) => (
                        <TouchableOpacity
                            key={amenity}
                            className={`px-4 py-2 rounded-full`}
                            style={getToggleStyle(formData.amenities.includes(amenity))}
                            onPress={() => toggleAmenity(amenity)}
                        >
                            <Text style={getToggleTextStyle(formData.amenities.includes(amenity))}>
                                {amenity.split('-').map(word =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Preferred Tenants */}
            <View className='mb-4'>
                <Text className='text-lg font-semibold mb-2'>Preferred Tenants</Text>
                <View className='flex-row flex-wrap gap-2'>
                    {tenantOptions.map((tenant) => (
                        <TouchableOpacity
                            key={tenant}
                            className={`px-4 py-2 rounded-full`}
                            style={getToggleStyle(formData.preferredTenants.includes(tenant))}
                            onPress={() => toggleTenant(tenant)}
                        >
                            <Text style={getToggleTextStyle(formData.preferredTenants.includes(tenant))}>
                                {tenant.charAt(0).toUpperCase() + tenant.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            {/* Maintenance Details */}
            <View className='mb-4'>
                <Text className='text-lg font-semibold mb-2'>Maintenance Details</Text>

                <InputWithLabel
                    label="Maintenance Amount"
                    value={formData.maintainenceCharges.amount.toString()}
                    onChangeText={(value) => handleNumericInput(value, 'maintainenceCharges', 'amount')}
                    placeholder="₹"
                    keyboardType="numeric"
                    isNumeric
                />

                <View className='mb-3'>
                    <Text className='mb-1'>Bill Type</Text>
                    <View className='flex-row flex-wrap gap-2'>
                        {['monthly', 'quarterly', 'yearly'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                className={`px-4 py-2 rounded-full`}
                                style={getToggleStyle(formData.maintainenceCharges.billType === type)}
                                onPress={() => handleNestedChange('maintainenceCharges', 'billType', type)}
                            >
                                <Text style={getToggleTextStyle(formData.maintainenceCharges.billType === type)}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className='flex-row justify-between items-center mb-3'>
                    <Text>Includes Food</Text>
                    <CustomSwitch
                        value={formData.maintainenceCharges.includesFood}
                        onValueChange={(value) => handleNestedChange('maintainenceCharges', 'includesFood', value)}
                    />
                </View>

                <View className='flex-row justify-between items-center mb-3'>
                    <Text>Includes Utility</Text>
                    <CustomSwitch
                        value={formData.maintainenceCharges.includesUtility}
                        onValueChange={(value) => handleNestedChange('maintainenceCharges', 'includesUtility', value)}
                    />
                </View>
            </View>

            {/* House Rules */}
            {/* House Rules */}
            <View className='mb-4'>
                <Text className='text-lg font-semibold mb-2'>House Rules</Text>

                {/* Add Rule Input */}
                <View className='flex-row items-center gap-2 mb-3'>
                    <TextInput
                        className='flex-1 border border-gray-300 rounded-lg p-2'
                        value={newRule}
                        onChangeText={setNewRule}
                        placeholder="Add a house rule"
                    />
                    <TouchableOpacity
                        onPress={addNewRule}
                        className='bg-[#2A3C6E] p-2 rounded-lg h-[44px] items-center justify-center'
                    >
                        <AntDesign name="plus" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Display Rules */}
                <View className='flex-row flex-wrap gap-2'>
                    {formData.rules.map((rule, index) => (
                        <TouchableOpacity
                            key={index}
                            className='flex-row items-center bg-[#2A3C6E] rounded-full px-4 py-2'
                        >
                            <Text className='text-white mr-2'>{rule}</Text>
                            <TouchableOpacity
                                onPress={() => removeRule(index)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <AntDesign name="close" size={16} color="white" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Images */}
            <View className='mb-4'>
                <Text className='text-lg font-semibold mb-2'>Property Images*</Text>
                <TouchableOpacity
                    onPress={pickImages}
                    className='border-2 border-dashed border-gray-300 rounded-lg p-4 items-center justify-center mb-3'
                >
                    <MaterialIcons name="add-photo-alternate" size={32} color="gray" />
                    <Text className='text-gray-500 mt-2'>Add Images (Max 10)</Text>
                </TouchableOpacity>

                {images.length > 0 && (
                    <View className='flex-row flex-wrap gap-2'>
                        {images.map((image, index) => (
                            <View key={index} className='relative'>
                                <Image
                                    source={{ uri: image.uri }}
                                    className='w-20 h-20 rounded-lg'
                                />
                                <TouchableOpacity
                                    onPress={() => removeImage(index)}
                                    className='absolute -top-2 -right-2 bg-red-500 rounded-full p-1'
                                >
                                    <AntDesign name="close" size={12} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Submit Button */}
            <View className='mb-6'>
                <Button
                    text={loading ? "Listing Property..." : "List Property"}
                    onPress={handleSubmit}
                    variant="primary"
                    className="w-full"
                    disabled={loading}
                />
            </View>
        </ScrollView>
    );
}
