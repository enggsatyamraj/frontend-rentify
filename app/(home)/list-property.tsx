import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Modal,
    Image,
    FlatList,
    ScrollView
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontSize } from "@/utils/font";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import colors from "@/utils/color";
import { useAuthStore } from "@/store/auth.store";
import { propertyService } from "@/services/property.services";
import { useFocusEffect } from "@react-navigation/native";
import { Button } from "@/components/Button";
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from "expo-router";
import ActionSheet from 'react-native-actions-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Carousel from 'react-native-reanimated-carousel';
import ListPropertyForm from "@/components/ListPropertyForm";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PropertyCard = ({ property }) => {
    const [activeSlide, setActiveSlide] = useState(0);

    const images = property.images?.length > 0
        ? property.images.map(img => img.url)
        : ['https://via.placeholder.com/400x200'];

    const renderVerificationBadge = () => (
        <View style={{
            position: 'absolute',
            top: 12,
            right: 12,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: property.status.isVerified ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 6,
            zIndex: 1,
        }}>
            <MaterialIcons
                name={property.status.isVerified ? "verified" : "error-outline"}
                size={16}
                color={colors.common.white}
                style={{ marginRight: 4 }}
            />
            <Text style={{
                color: colors.common.white,
                fontSize: getFontSize(12),
                fontWeight: '500',
            }}>
                {property.status.isVerified ? 'Verified' : 'Unverified'}
            </Text>
        </View>
    );

    const renderCarouselItem = ({ item }) => (
        <View style={{
            width: '100%',
            height: '100%',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            overflow: 'hidden',
        }}>
            <Image
                source={{ uri: item }}
                style={{
                    width: '100%',
                    height: '100%',
                }}
                resizeMode="cover"
            />
        </View>
    );

    const renderDot = (index) => (
        <View
            key={index}
            style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                marginHorizontal: 3,
                backgroundColor: index === activeSlide ? colors.primary.main : 'rgba(255, 255, 255, 0.7)',
            }}
        />
    );

    return (
        <View style={{
            backgroundColor: colors.background.card,
            borderRadius: 12,
            marginBottom: 16,
            shadowColor: colors.common.black,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
            overflow: 'hidden',
        }}>
            {/* Image Section */}
            <View style={{ height: 180, width: '100%', position: 'relative' }}>
                {renderVerificationBadge()}
                <Carousel
                    width={SCREEN_WIDTH - 24}
                    height={180}
                    data={images}
                    renderItem={renderCarouselItem}
                    onSnapToItem={setActiveSlide}
                    loop={images.length > 1}
                />
                {images.length > 1 && (
                    <View style={{
                        position: 'absolute',
                        bottom: 12,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        width: '100%',
                    }}>
                        {images.map((_, index) => renderDot(index))}
                    </View>
                )}
            </View>

            {/* Content Section */}
            <View style={{ padding: 16 }}>
                {/* Title and Price */}
                <View style={{ marginBottom: 12 }}>
                    <Text style={{
                        fontSize: getFontSize(18),
                        color: colors.text.primary,
                        fontWeight: '600',
                        marginBottom: 4,
                    }}>
                        {property.title}
                    </Text>
                    <Text style={{
                        fontSize: getFontSize(20),
                        color: colors.primary.main,
                        fontWeight: '700',
                    }}>
                        ₹{property.price.basePrice.toLocaleString()}/
                        <Text style={{
                            fontSize: getFontSize(14),
                            color: colors.text.secondary,
                            fontWeight: '500',
                        }}>
                            {property.price.billType}
                        </Text>
                    </Text>
                </View>

                {/* Location */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 16,
                }}>
                    <MaterialIcons
                        name="location-on"
                        size={16}
                        color={colors.text.secondary}
                    />
                    <Text style={{
                        marginLeft: 4,
                        fontSize: getFontSize(14),
                        color: colors.text.secondary,
                    }}>
                        {property.location.address}, {property.location.city}
                    </Text>
                </View>

                {/* Property Features */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTopWidth: 0.5,
                    borderTopColor: colors.grey[200],
                }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize: getFontSize(12),
                            color: colors.text.secondary,
                            marginBottom: 2,
                        }}>
                            Type
                        </Text>
                        <Text style={{
                            fontSize: getFontSize(13),
                            color: colors.text.primary,
                            fontWeight: '500',
                        }}>
                            {property.details.roomType.split('-').map(word =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize: getFontSize(12),
                            color: colors.text.secondary,
                            marginBottom: 2,
                        }}>
                            Available
                        </Text>
                        <Text style={{
                            fontSize: getFontSize(13),
                            color: colors.text.primary,
                            fontWeight: '500',
                        }}>
                            {property.details.availableRooms} Rooms
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize: getFontSize(12),
                            color: colors.text.secondary,
                            marginBottom: 2,
                        }}>
                            Furnishing
                        </Text>
                        <Text style={{
                            fontSize: getFontSize(13),
                            color: colors.text.primary,
                            fontWeight: '500',
                        }}>
                            {property.details.furnishingStatus.charAt(0).toUpperCase() +
                                property.details.furnishingStatus.slice(1)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default function ListProperty() {
    const height = Dimensions.get("window").height;
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const [userPropertyLoading, setUserPropertyLoading] = useState(false);
    const [properties, setProperties] = useState([]);
    const [allProperties, setAllProperties] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const listPropertyActionRef = useRef(null);
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        propertyType: '',
        priceRange: { min: '', max: '' },
        roomType: '',
        furnishing: ''
    });

    // Debounce search text
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchText(debouncedSearchText);
        }, 300);

        return () => clearTimeout(timer);
    }, [debouncedSearchText]);

    const clearFilters = () => {
        setFilters({
            propertyType: '',
            priceRange: { min: '', max: '' },
            roomType: '',
            furnishing: ''
        });
        setDebouncedSearchText('');
        setSearchText('');
    };

    const applyFilters = () => {
        let filteredProperties = [...allProperties];

        // Apply search filter
        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase().trim();
            filteredProperties = filteredProperties.filter(property =>
                property.title.toLowerCase().includes(searchLower) ||
                property.location.address.toLowerCase().includes(searchLower) ||
                property.location.city.toLowerCase().includes(searchLower)
            );
        }

        // Apply property type filter
        if (filters.propertyType) {
            filteredProperties = filteredProperties.filter(property =>
                property.propertyType === filters.propertyType
            );
        }

        // Apply price range filter
        if (filters.priceRange.min) {
            const minPrice = parseInt(filters.priceRange.min);
            if (!isNaN(minPrice)) {
                filteredProperties = filteredProperties.filter(property =>
                    property.price.basePrice >= minPrice
                );
            }
        }
        if (filters.priceRange.max) {
            const maxPrice = parseInt(filters.priceRange.max);
            if (!isNaN(maxPrice)) {
                filteredProperties = filteredProperties.filter(property =>
                    property.price.basePrice <= maxPrice
                );
            }
        }

        // Apply room type filter
        if (filters.roomType) {
            filteredProperties = filteredProperties.filter(property =>
                property.details.roomType === filters.roomType
            );
        }

        // Apply furnishing filter
        if (filters.furnishing) {
            filteredProperties = filteredProperties.filter(property =>
                property.details.furnishingStatus === filters.furnishing
            );
        }

        setProperties(filteredProperties);
    };

    const openListPropertyActionSheet = () => {
        listPropertyActionRef.current?.show();
    };

    const closeListPropertyActionSheet = () => {
        listPropertyActionRef.current?.hide();
    };

    const handlePropertyAdded = () => {
        fetchUserProperties();
        closeListPropertyActionSheet();
    };

    const fetchUserProperties = async () => {
        try {
            setUserPropertyLoading(true);
            const response = await propertyService.getUserProperties(token);
            setAllProperties(response.data);
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

    useEffect(() => {
        applyFilters();
    }, [searchText, filters, allProperties]);

    const renderSearchAndFilter = () => (
        <View style={{
            backgroundColor: colors.background.paper,
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.grey[200],
        }}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
            }}>
                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.background.input,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    height: 40,
                }}>
                    <Feather name="search" size={20} color={colors.text.secondary} />
                    <TextInput
                        value={debouncedSearchText}
                        onChangeText={setDebouncedSearchText}
                        placeholder="Search properties..."
                        style={{
                            flex: 1,
                            marginLeft: 8,
                            fontSize: getFontSize(14),
                            color: colors.text.primary,
                        }}
                        placeholderTextColor={colors.text.secondary}
                    />
                </View>

                <TouchableOpacity
                    onPress={() => setShowFilters(true)}
                    style={{
                        backgroundColor: colors.background.input,
                        borderRadius: 8,
                        padding: 8,
                        height: 40,
                        width: 40,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Feather name="sliders" size={20} color={colors.text.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
    const renderFilterModal = () => (
        <Modal
            visible={showFilters}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowFilters(false)}
        >
            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'flex-end',
            }}>
                <View style={{
                    backgroundColor: colors.background.paper,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    padding: 16,
                    maxHeight: '80%',
                }}>
                    {/* Header */}
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16,
                    }}>
                        <Text style={{
                            fontSize: getFontSize(18),
                            fontWeight: '600',
                            color: colors.text.primary,
                        }}>
                            Filters
                        </Text>
                        <TouchableOpacity onPress={() => setShowFilters(false)}>
                            <AntDesign name="close" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView >
                        {/* Property Type */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{
                                fontSize: getFontSize(16),
                                fontWeight: '500',
                                color: colors.text.primary,
                                marginBottom: 8,
                            }}>
                                Property Type
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {['full-house', 'single-room', 'multi-room', 'pg'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => setFilters(prev => ({
                                            ...prev,
                                            propertyType: prev.propertyType === type ? '' : type
                                        }))}
                                        style={{
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            borderRadius: 20,
                                            backgroundColor: filters.propertyType === type
                                                ? colors.primary.main
                                                : colors.background.input,
                                        }}
                                    >
                                        <Text style={{
                                            color: filters.propertyType === type
                                                ? colors.common.white
                                                : colors.text.primary,
                                            fontSize: getFontSize(14),
                                        }}>
                                            {type.split('-').map(word =>
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Price Range */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{
                                fontSize: getFontSize(16),
                                fontWeight: '500',
                                color: colors.text.primary,
                                marginBottom: 8,
                            }}>
                                Price Range
                            </Text>
                            <View style={{
                                flexDirection: 'row',
                                gap: 8,
                            }}>
                                <View style={{ flex: 1 }}>
                                    <TextInput
                                        value={filters.priceRange.min}
                                        onChangeText={(value) => setFilters(prev => ({
                                            ...prev,
                                            priceRange: { ...prev.priceRange, min: value }
                                        }))}
                                        placeholder="Min"
                                        keyboardType="numeric"
                                        style={{
                                            backgroundColor: colors.background.input,
                                            padding: 12,
                                            borderRadius: 8,
                                            fontSize: getFontSize(14),
                                            color: colors.text.primary,
                                        }}
                                        placeholderTextColor={colors.text.secondary}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <TextInput
                                        value={filters.priceRange.max}
                                        onChangeText={(value) => setFilters(prev => ({
                                            ...prev,
                                            priceRange: { ...prev.priceRange, max: value }
                                        }))}
                                        placeholder="Max"
                                        keyboardType="numeric"
                                        style={{
                                            backgroundColor: colors.background.input,
                                            padding: 12,
                                            borderRadius: 8,
                                            fontSize: getFontSize(14),
                                            color: colors.text.primary,
                                        }}
                                        placeholderTextColor={colors.text.secondary}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Room Type */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{
                                fontSize: getFontSize(16),
                                fontWeight: '500',
                                color: colors.text.primary,
                                marginBottom: 8,
                            }}>
                                Room Type
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {['single', 'double', 'triple', 'full-house'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => setFilters(prev => ({
                                            ...prev,
                                            roomType: prev.roomType === type ? '' : type
                                        }))}
                                        style={{
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            borderRadius: 20,
                                            backgroundColor: filters.roomType === type
                                                ? colors.primary.main
                                                : colors.background.input,
                                        }}
                                    >
                                        <Text style={{
                                            color: filters.roomType === type
                                                ? colors.common.white
                                                : colors.text.primary,
                                            fontSize: getFontSize(14),
                                        }}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Furnishing */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{
                                fontSize: getFontSize(16),
                                fontWeight: '500',
                                color: colors.text.primary,
                                marginBottom: 8,
                            }}>
                                Furnishing
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {['fully', 'semi', 'unfurnished'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => setFilters(prev => ({
                                            ...prev,
                                            furnishing: prev.furnishing === type ? '' : type
                                        }))}
                                        style={{
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            borderRadius: 20,
                                            backgroundColor: filters.furnishing === type
                                                ? colors.primary.main
                                                : colors.background.input,
                                        }}
                                    >
                                        <Text style={{
                                            color: filters.furnishing === type
                                                ? colors.common.white
                                                : colors.text.primary,
                                            fontSize: getFontSize(14),
                                        }}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Buttons */}
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                            <Button
                                text="Reset Filters"
                                onPress={() => {
                                    clearFilters();
                                    setShowFilters(false);
                                }}
                                variant="secondary"
                                className="flex-1"
                            />
                            <Button
                                text="Apply Filters"
                                onPress={() => {
                                    applyFilters();
                                    setShowFilters(false);
                                }}
                                variant="primary"
                                className="flex-1"
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
    const renderEmptyState = () => (
        <View style={{
            alignItems: 'center',
            paddingHorizontal: 16,
        }}>
            <Text style={{
                fontSize: getFontSize(20),
                fontWeight: "600",
                color: colors.text.primary,
                textAlign: 'center',
                marginBottom: 8,
            }}>
                No Properties Listed Yet
            </Text>
            <Text style={{
                fontSize: getFontSize(14),
                color: colors.text.secondary,
                textAlign: 'center',
                marginBottom: 24,
            }}>
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
        <View style={{ padding: 16 }}>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
            }}>
                <Text style={{
                    fontSize: getFontSize(22),
                }}>
                    List your properties
                </Text>
                <TouchableOpacity onPress={closeListPropertyActionSheet}>
                    <AntDesign name="close" size={26} color="black" />
                </TouchableOpacity>
            </View>
            <View style={{
                height: height - 200,
                justifyContent: "center",
                alignItems: "center",
            }}>
                <Text style={{
                    fontSize: getFontSize(16),
                    textAlign: "center",
                }}>
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
            style={{
                backgroundColor: colors.primary.dark,
                width: 60,
                height: 60,
                borderRadius: 30,
                position: "absolute",
                bottom: 90,
                right: 20,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: colors.common.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
            }}
            onPress={openListPropertyActionSheet}
        >
            <FontAwesome6 name="plus" size={24} color={colors.common.white} />
        </TouchableOpacity>
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1, marginBottom: 30 }}>
                    <Text style={{ fontSize: getFontSize(20), paddingLeft: 10, paddingBottom: 10 }} className='font-semibold'>
                        Your Listed Properties
                    </Text>
                    {renderSearchAndFilter()}
                    {renderFilterModal()}

                    <FlatList
                        contentContainerStyle={{ padding: 12 }}
                        data={properties}
                        renderItem={({ item }) => <PropertyCard property={item} />}
                        keyExtractor={(item) => item._id || item.id}
                        ListEmptyComponent={!userPropertyLoading && renderEmptyState()}
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
                    />

                    {userPropertyLoading && (
                        <View style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(255,255,255,0.7)',
                        }}>
                            <ActivityIndicator size="large" color={colors.primary.dark} />
                        </View>
                    )}

                    <ActionSheet
                        ref={listPropertyActionRef}
                        containerStyle={{
                            height: '95%',
                            borderTopRightRadius: 10,
                            borderTopLeftRadius: 10,
                            backgroundColor: colors.common.white,
                        }}
                        gestureEnabled={true}
                        closeOnTouchBackdrop={true}
                        indicatorStyle={{
                            width: 60,
                            height: 4,
                            backgroundColor: colors.grey[300],
                            marginTop: 8,
                        }}
                    >
                        {(!user?.phoneNumber || !user?.aadharNumber)
                            ? renderVerificationRequest()
                            : (
                                <ListPropertyForm
                                    closeListPropertyActionSheet={handlePropertyAdded}
                                />
                            )
                        }
                    </ActionSheet>

                    {properties.length > 0 && renderAddPropertyButton()}
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}