import { View, Text, ScrollView, Modal, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { getFontSize } from "@/utils/font";
import InputWithLabel from "@/components/InputWithLabel";
import { propertyService } from "@/services/property.services";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CreatePropertyFormData } from "@/utils/validations/property.validation";
import { MaterialIcons } from '@expo/vector-icons';

export default function ListProperty() {
    const [listedProperties, setListedProperties] = useState<any[]>([]);
    const [showListPropertyModal, setShowListPropertyModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [formData, setFormData] = useState<Partial<CreatePropertyFormData>>({});
    const [images, setImages] = useState<File[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Fetch user's properties
    const fetchProperties = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                setErrorMessage("Please login to list properties");
                return;
            }

            const response = await propertyService.getUserProperties(token);
            setListedProperties(response.data);
        } catch (error: any) {
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleListProperty = () => {
        setShowListPropertyModal(true);
    };

    const handleSubmitProperty = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                setErrorMessage("Please login to list properties");
                return;
            }

            await propertyService.createProperty(formData as CreatePropertyFormData, images, token);
            setShowListPropertyModal(false);
            fetchProperties(); // Refresh the list
        } catch (error: any) {
            setErrorMessage(error.message);
        }
    };

    const PropertyCard = ({ property }: { property: any }) => (
        <View className="mb-4 bg-white rounded-lg shadow p-4">
            {property.images && property.images[0] && (
                <Image
                    source={{ uri: property.images[0].url }}
                    className="w-full h-48 rounded-lg mb-3"
                />
            )}
            <Text className="text-lg font-bold mb-2">{property.title}</Text>
            <Text className="text-gray-600 mb-2">₹{property.price.basePrice}/month</Text>
            <Text className="text-gray-500">{property.location.city}</Text>
        </View>
    );

    const renderPropertyForm = () => (
        <View className="space-y-4">
            <InputWithLabel
                label="Property Title"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter property title"
            />

            <InputWithLabel
                label="Description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Describe your property"
                multiline
                numberOfLines={4}
            />

            <InputWithLabel
                label="Base Price (₹)"
                value={formData.price?.basePrice?.toString()}
                onChangeText={(text) => setFormData({
                    ...formData,
                    price: {
                        ...formData.price,
                        basePrice: parseInt(text) || 0
                    }
                })}
                placeholder="Enter base price"
                keyboardType="numeric"
            />

            {/* Add more fields based on your property schema */}

            <Button
                text="List Property"
                onPress={handleSubmitProperty}
                className="mt-4"
            />
        </View>
    );

    return (
        <SafeAreaView className="flex-1">
            <ScrollView className="px-3 py-6">
                <View className="flex flex-row items-center justify-between mb-6">
                    <Text style={{ fontSize: getFontSize(20) }} className="font-bold">
                        Your Properties
                    </Text>
                    <Button
                        className="px-5 py-2"
                        text="Add New"
                        variant="primary"
                        onPress={handleListProperty}
                    />
                </View>

                {loading ? (
                    <Text>Loading properties...</Text>
                ) : errorMessage ? (
                    <Text className="text-red-500">{errorMessage}</Text>
                ) : listedProperties.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-8">
                        <MaterialIcons name="home" size={64} color="#9ca3af" />
                        <Text className="text-gray-500 mt-4 text-center">
                            You haven't listed any properties yet.{'\n'}
                            Add your first property to get started!
                        </Text>
                    </View>
                ) : (
                    <View>
                        {listedProperties.map((property) => (
                            <PropertyCard key={property._id} property={property} />
                        ))}
                    </View>
                )}

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={showListPropertyModal}
                >
                    <SafeAreaView className="flex-1">
                        <ScrollView className="px-3 py-6">
                            <View className="flex flex-row items-center justify-between mb-6">
                                <Text style={{ fontSize: getFontSize(20) }} className="font-bold">
                                    List Your Property
                                </Text>
                                <Button
                                    className="px-3 py-2"
                                    text="Close"
                                    variant="secondary"
                                    onPress={() => setShowListPropertyModal(false)}
                                />
                            </View>
                            {renderPropertyForm()}
                        </ScrollView>
                    </SafeAreaView>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
}