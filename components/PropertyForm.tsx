import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Image,
    Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { propertyService } from '@/services/property.services';
import { useAuthStore } from '@/store/auth.store';
import { getFontSize } from '@/utils/font';
import { ScrollView } from 'react-native-actions-sheet';
import colors from '@/utils/color';
import AntDesign from '@expo/vector-icons/AntDesign';
import { validateForm } from '@/utils/validations/auth.validation';

const PropertyForm = ({ onClose, onSuccess }) => {
    const token = useAuthStore((state) => state.token);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [datePickerVisible, setDatePickerVisible] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        propertyType: 'full-house',
        price: {
            basePrice: '',
            billType: 'monthly',
            securityDeposit: ''
        },
        location: {
            address: '',
            city: '',
            state: '',
            pincode: '',
            landmark: ''
        },
        details: {
            roomType: 'single',
            totalRooms: '',
            availableRooms: '',
            sharedBathroom: false,
            furnishingStatus: 'fully',
            roomSize: '',
            floorNumber: '',
            parking: false
        },
        amenities: [],
        preferredTenants: [],
        availableFrom: new Date(),
        foodAvailable: false,
        rules: [],
        maintainenceCharges: {
            amount: '',
            billType: 'monthly',
            includesFood: false,
            includesUtility: false
        }
    });

    const AMENITIES_OPTIONS = [
        'wifi', 'tv', 'fridge', 'washing-machine', 'kitchen',
        'geyser', 'ac', 'cupboard', 'bed', 'water-purifier',
        'power-backup', 'lift', 'security', 'cctv'
    ];

    const TENANT_OPTIONS = ['family', 'bachelors', 'girls', 'boys', 'any'];

    const handleImagePick = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Please allow access to your photo library');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImages([...images, ...result.assets]);
        }
    };

    const handleSubmit = async () => {
        try {
            // if (!validateForm()) return;

            if (images.length === 0) {
                Alert.alert('Error', 'Please upload at least one image');
                return;
            }

            setLoading(true);

            // Format images for the API
            const formattedImages = images.map((image, index) => ({
                uri: image.uri,
                type: 'image/jpeg',
                name: `image-${index}.jpg`
            }));

            await propertyService.createProperty(formData, formattedImages, token);

            Alert.alert('Success', 'Property listed successfully', [
                {
                    text: 'OK',
                    onPress: () => {
                        closeListPropertyActionSheet();
                        router.replace('/(home)/(tabs)/home');
                    }
                }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to list property');
        } finally {
            setLoading(false);
        }
    };

    const updateFormField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const updateNestedField = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const toggleArrayField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(item => item !== value)
                : [...prev[field], value]
        }));
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>List your properties</Text>
                <TouchableOpacity onPress={onClose}>
                    <AntDesign name="close" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Basic Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Property Title"
                        value={formData.title}
                        onChangeText={(value) => updateFormField('title', value)}
                    />

                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Description"
                        multiline
                        numberOfLines={4}
                        value={formData.description}
                        onChangeText={(value) => updateFormField('description', value)}
                    />

                    <View style={styles.pickerContainer}>
                        <Text style={styles.label}>Property Type</Text>
                        <Picker
                            selectedValue={formData.propertyType}
                            onValueChange={(value) => updateFormField('propertyType', value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Full House" value="full-house" />
                            <Picker.Item label="Single Room" value="single-room" />
                            <Picker.Item label="Multi Room" value="multi-room" />
                            <Picker.Item label="PG" value="pg" />
                        </Picker>
                    </View>
                </View>

                {/* Price Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Price Details</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Base Price"
                        keyboardType="numeric"
                        value={formData.price.basePrice}
                        onChangeText={(value) => updateNestedField('price', 'basePrice', value)}
                    />

                    <View style={styles.pickerContainer}>
                        <Text style={styles.label}>Bill Type</Text>
                        <Picker
                            selectedValue={formData.price.billType}
                            onValueChange={(value) => updateNestedField('price', 'billType', value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Monthly" value="monthly" />
                            <Picker.Item label="Daily" value="daily" />
                        </Picker>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Security Deposit"
                        keyboardType="numeric"
                        value={formData.price.securityDeposit}
                        onChangeText={(value) => updateNestedField('price', 'securityDeposit', value)}
                    />
                </View>

                {/* Location */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location</Text>

                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Address"
                        multiline
                        numberOfLines={3}
                        value={formData.location.address}
                        onChangeText={(value) => updateNestedField('location', 'address', value)}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="City"
                        value={formData.location.city}
                        onChangeText={(value) => updateNestedField('location', 'city', value)}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="State"
                        value={formData.location.state}
                        onChangeText={(value) => updateNestedField('location', 'state', value)}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Pincode"
                        keyboardType="numeric"
                        maxLength={6}
                        value={formData.location.pincode}
                        onChangeText={(value) => updateNestedField('location', 'pincode', value)}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Landmark (Optional)"
                        value={formData.location.landmark}
                        onChangeText={(value) => updateNestedField('location', 'landmark', value)}
                    />
                </View>

                {/* Property Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Property Details</Text>

                    <View style={styles.pickerContainer}>
                        <Text style={styles.label}>Room Type</Text>
                        <Picker
                            selectedValue={formData.details.roomType}
                            onValueChange={(value) => updateNestedField('details', 'roomType', value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Single" value="single" />
                            <Picker.Item label="Double" value="double" />
                            <Picker.Item label="Triple" value="triple" />
                            <Picker.Item label="Full House" value="full-house" />
                        </Picker>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Total Rooms"
                        keyboardType="numeric"
                        value={formData.details.totalRooms}
                        onChangeText={(value) => updateNestedField('details', 'totalRooms', value)}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Available Rooms"
                        keyboardType="numeric"
                        value={formData.details.availableRooms}
                        onChangeText={(value) => updateNestedField('details', 'availableRooms', value)}
                    />

                    <View style={styles.pickerContainer}>
                        <Text style={styles.label}>Furnishing Status</Text>
                        <Picker
                            selectedValue={formData.details.furnishingStatus}
                            onValueChange={(value) => updateNestedField('details', 'furnishingStatus', value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Fully Furnished" value="fully" />
                            <Picker.Item label="Semi Furnished" value="semi" />
                            <Picker.Item label="Unfurnished" value="unfurnished" />
                        </Picker>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Room Size (sq ft)"
                        keyboardType="numeric"
                        value={formData.details.roomSize}
                        onChangeText={(value) => updateNestedField('details', 'roomSize', value)}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Floor Number"
                        keyboardType="numeric"
                        value={formData.details.floorNumber}
                        onChangeText={(value) => updateNestedField('details', 'floorNumber', value)}
                    />
                </View>

                {/* Amenities */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Amenities</Text>
                    <View style={styles.checkboxGroup}>
                        {AMENITIES_OPTIONS.map((amenity) => (
                            <TouchableOpacity
                                key={amenity}
                                style={[
                                    styles.checkbox,
                                    formData.amenities.includes(amenity) && styles.checkboxSelected
                                ]}
                                onPress={() => toggleArrayField('amenities', amenity)}
                            >
                                <Text style={[
                                    styles.checkboxText,
                                    formData.amenities.includes(amenity) && styles.checkboxTextSelected
                                ]}>
                                    {amenity.replace('-', ' ')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Preferred Tenants */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferred Tenants</Text>
                    <View style={styles.checkboxGroup}>
                        {TENANT_OPTIONS.map((tenant) => (
                            <TouchableOpacity
                                key={tenant}
                                style={[
                                    styles.checkbox,
                                    formData.preferredTenants.includes(tenant) && styles.checkboxSelected
                                ]}
                                onPress={() => toggleArrayField('preferredTenants', tenant)}
                            >
                                <Text style={[
                                    styles.checkboxText,
                                    formData.preferredTenants.includes(tenant) && styles.checkboxTextSelected
                                ]}>
                                    {tenant}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Images */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Property Images</Text>
                    <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePick}>
                        <Text style={styles.imagePickerButtonText}>Select Images</Text>
                    </TouchableOpacity>
                    <View style={styles.imagePreviewContainer}>
                        {images.map((image, index) => (
                            <Image
                                key={index}
                                source={{ uri: image.uri }}
                                style={styles.imagePreview}
                            />
                        ))}
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.submitButtonText}>
                        {loading ? 'Listing Property...' : 'List Property'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: 'white',
    },
    headerTitle: {
        fontSize: getFontSize(18),
        fontWeight: '600',
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: getFontSize(18),
        fontWeight: '600',
        marginBottom: 16,
        color: colors.primary.dark,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: getFontSize(16),
        backgroundColor: 'white',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: 'white',
    },
    picker: {
        ...Platform.select({
            ios: {
                height: 120,
            },
            android: {
                height: 50,
            },
        }),
    },
    label: {
        fontSize: getFontSize(14),
        color: '#666',
        marginBottom: 4,
        paddingHorizontal: 12,
        paddingTop: 8,
    },
    checkboxGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    checkbox: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.primary.main,
        backgroundColor: 'white',
        marginBottom: 8,
    },
    checkboxSelected: {
        backgroundColor: colors.primary.main,
    },
    checkboxText: {
        color: colors.primary.main,
        fontSize: getFontSize(14),
        textTransform: 'capitalize',
    },
    checkboxTextSelected: {
        color: 'white',
    },
    imagePickerButton: {
        backgroundColor: colors.primary.main,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    imagePickerButtonText: {
        color: 'white',
        fontSize: getFontSize(16),
        fontWeight: '500',
    },
    imagePreviewContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    submitButton: {
        backgroundColor: colors.primary.dark,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 32,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: 'white',
        fontSize: getFontSize(16),
        fontWeight: '600',
    },
});

export default PropertyForm;