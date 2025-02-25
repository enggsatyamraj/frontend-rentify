import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    TextInput,
    FlatList,
    RefreshControl,
    Modal,
    ScrollView,
    ActivityIndicator,
    Image,
    Dimensions
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import colors from "@/utils/color";
import { Feather, MaterialIcons, AntDesign, FontAwesome } from '@expo/vector-icons';
import { getFontSize, getDeviceType } from "@/utils/font";
import { Button } from "@/components/Button";
import Carousel from 'react-native-reanimated-carousel';
import { propertyService } from "@/services/property.services";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from "@react-navigation/native";
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Skeleton for PropertyCard
const PropertyCardSkeleton = () => {
    return (
        <Animated.View
            entering={FadeIn.duration(500)}
            className="bg-white rounded-xl mb-4 shadow-sm overflow-hidden"
        >
            {/* Image Skeleton */}
            <Animated.View className="h-[180px] w-full bg-gray-200" />

            {/* Content Section Skeleton */}
            <View className="p-4">
                {/* Title and Price */}
                <View className="mb-3">
                    <Animated.View className="h-6 w-3/4 bg-gray-200 mb-2 rounded" />
                    <Animated.View className="h-7 w-1/2 bg-gray-200 rounded" />
                </View>

                {/* Location */}
                <View className="mb-4">
                    <Animated.View className="h-5 w-4/5 bg-gray-200 rounded" />
                </View>

                {/* Property Features */}
                <View className="flex-row justify-between pt-3 border-t border-gray-200">
                    <View className="flex-1">
                        <Animated.View className="h-4 w-16 bg-gray-200 mb-1 rounded" />
                        <Animated.View className="h-5 w-20 bg-gray-200 rounded" />
                    </View>
                    <View className="flex-1">
                        <Animated.View className="h-4 w-16 bg-gray-200 mb-1 rounded" />
                        <Animated.View className="h-5 w-20 bg-gray-200 rounded" />
                    </View>
                    <View className="flex-1">
                        <Animated.View className="h-4 w-16 bg-gray-200 mb-1 rounded" />
                        <Animated.View className="h-5 w-20 bg-gray-200 rounded" />
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};

// Component to display multiple skeleton cards
const SkeletonLoader = ({ count = 3 }) => {
    return (
        <>
            {[...Array(count)].map((_, index) => (
                <PropertyCardSkeleton key={`skeleton-${index}`} />
            ))}
        </>
    );
};

export const PropertyCard = ({ property, onPress, onWishlistToggle, isWishlisted }) => {
    const [activeSlide, setActiveSlide] = useState(0);

    const images = property.images?.length > 0
        ? property.images.map(img => img.url)
        : ['https://via.placeholder.com/400x200'];

    const renderWishlistButton = () => (
        <TouchableOpacity
            onPress={() => onWishlistToggle(property)}
            style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 20,
                padding: 8,
            }}
        >
            <FontAwesome
                name={isWishlisted ? "heart" : "heart-o"}
                size={20}
                color={isWishlisted ? colors.primary.main : colors.text.primary}
            />
        </TouchableOpacity>
    );

    const renderPropertyBadges = () => (
        <View style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 2,
            flexDirection: 'row',
            gap: 6,
        }}>
            {property.status.isVerified && (
                <View style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.9)',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <MaterialIcons
                        name="verified"
                        size={14}
                        color="#FFFFFF"
                        style={{ marginRight: 3 }}
                    />
                    <Text style={{
                        color: '#FFFFFF',
                        fontSize: getFontSize(10),
                        fontWeight: '600',
                    }}>
                        Verified
                    </Text>
                </View>
            )}

            {property.status.isFeatured && (
                <View style={{
                    backgroundColor: 'rgba(249, 168, 37, 0.9)',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <MaterialIcons
                        name="star"
                        size={14}
                        color="#FFFFFF"
                        style={{ marginRight: 3 }}
                    />
                    <Text style={{
                        color: '#FFFFFF',
                        fontSize: getFontSize(10),
                        fontWeight: '600',
                    }}>
                        Featured
                    </Text>
                </View>
            )}
        </View>
    );

    const renderCarouselItem = ({ item }) => (
        <View style={{
            width: '100%',
            height: '100%',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            overflow: 'hidden',
            backgroundColor: colors.grey[200], // Background color as placeholder
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
        <TouchableOpacity
            onPress={() => onPress(property)}
            style={{
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
                {renderWishlistButton()}
                {renderPropertyBadges()}
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
                    marginBottom: 12,
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

                {/* Metadata Stats */}
                {property.metaData && (
                    <View style={{
                        flexDirection: 'row',
                        marginBottom: 12,
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginRight: 16,
                        }}>
                            <Feather
                                name="eye"
                                size={14}
                                color={colors.text.secondary}
                            />
                            <Text style={{
                                marginLeft: 4,
                                fontSize: getFontSize(12),
                                color: colors.text.secondary,
                            }}>
                                {property.metaData.views || 0} Views
                            </Text>
                        </View>
                        {/* <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <Feather
                                name="heart"
                                size={14}
                                color={colors.text.secondary}
                            />
                            <Text style={{
                                marginLeft: 4,
                                fontSize: getFontSize(12),
                                color: colors.text.secondary,
                            }}>
                                {property.metaData.favoriteCount || 0} Favorites
                            </Text>
                        </View> */}
                    </View>
                )}

                {/* Available From */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                }}>
                    <Feather
                        name="calendar"
                        size={14}
                        color={colors.text.secondary}
                    />
                    <Text style={{
                        marginLeft: 4,
                        fontSize: getFontSize(12),
                        color: colors.text.secondary,
                    }}>
                        Available from: {new Date(property.availableFrom).toLocaleDateString()}
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
        </TouchableOpacity>
    );
};

export default function Home() {
    const router = useRouter();
    const { logout, user, isLoading, token } = useAuthStore();
    const isTablet = getDeviceType() === 'tablet';
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [wishlistedProperties, setWishlistedProperties] = useState([]);
    const isFocused = useIsFocused();
    const [filters, setFilters] = useState({
        propertyType: '',
        priceRange: { min: '', max: '' },
        roomType: '',
        furnishing: '',
        city: '',
        preferredTenants: ''
    });
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Load wishlisted properties from AsyncStorage on mount
    useEffect(() => {
        loadWishlistedProperties();
        showWishlistProperty();
    }, [isFocused]);

    // useFocusEffect(
    //     useCallback(() => {
    //         loadWishlistedProperties();
    //         showWishlistProperty();
    //         return () => { };
    //     }, [])
    // )

    const showWishlistProperty = async () => {
        const wishlistProperty = await AsyncStorage.getItem('wishlistedProperties');
        console.log("this is the wishlist property:::::::::", wishlistProperty);
    }

    const loadWishlistedProperties = async () => {
        try {
            const wishlist = await AsyncStorage.getItem('wishlistedProperties');
            if (wishlist) {
                setWishlistedProperties(JSON.parse(wishlist));
            }
        } catch (error) {
            console.error('Error loading wishlist:', error);
        }
    };

    const handleWishlistToggle = async (property) => {
        try {
            const isWishlisted = wishlistedProperties.includes(property._id);
            let updatedWishlist;

            if (isWishlisted) {
                updatedWishlist = wishlistedProperties.filter(id => id !== property._id);
            } else {
                updatedWishlist = [...wishlistedProperties, property._id];
            }

            setWishlistedProperties(updatedWishlist);
            await AsyncStorage.setItem('wishlistedProperties', JSON.stringify(updatedWishlist));
        } catch (error) {
            console.error('Error updating wishlist:', error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchText(debouncedSearchText);
        }, 300);

        return () => clearTimeout(timer);
    }, [debouncedSearchText]);

    const fetchProperties = async (pageNum = 1, shouldRefresh = false) => {
        try {
            setLoading(true);
            const propertyFilters = {
                page: pageNum,
                limit: 10,
                ...(searchText && { city: searchText }),
                ...(filters.propertyType && { propertyType: filters.propertyType }),
                ...(filters.priceRange.min && { minPrice: Number(filters.priceRange.min) }),
                ...(filters.priceRange.max && { maxPrice: Number(filters.priceRange.max) }),
                ...(filters.roomType && { roomType: filters.roomType }),
                ...(filters.furnishing && { furnishingStatus: filters.furnishing }),
                ...(filters.preferredTenants && { preferredTenants: filters.preferredTenants })
            };

            const response = await propertyService.getProperties(propertyFilters);

            if (shouldRefresh) {
                setProperties(response.data);
            } else {
                setProperties(prev => [...prev, ...response.data]);
            }

            setHasMore(response.pagination.page < response.pagination.pages);
            setPage(pageNum);
        } catch (error) {
            console.error("Error fetching properties:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProperties(1, true);
    }, [searchText, filters]);

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchProperties(1, true);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            fetchProperties(page + 1);
        }
    };

    const handlePropertyPress = (property) => {
        router.push({
            pathname: '/property-details',
            params: { id: property._id }
        });
    };

    const clearFilters = () => {
        setFilters({
            propertyType: '',
            priceRange: { min: '', max: '' },
            roomType: '',
            furnishing: '',
            city: '',
            preferredTenants: ''
        });
        setDebouncedSearchText('');
        setSearchText('');
    };

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
                        placeholder="Search by city..."
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

                    <ScrollView>
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

                        {/* Preferred Tenants */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{
                                fontSize: getFontSize(16),
                                fontWeight: '500',
                                color: colors.text.primary,
                                marginBottom: 8,
                            }}>
                                Preferred Tenants
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {['family', 'bachelors', 'girls', 'boys', 'any'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => setFilters(prev => ({
                                            ...prev,
                                            preferredTenants: prev.preferredTenants === type ? '' : type
                                        }))}
                                        style={{
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            borderRadius: 20,
                                            backgroundColor: filters.preferredTenants === type
                                                ? colors.primary.main
                                                : colors.background.input,
                                        }}
                                    >
                                        <Text style={{
                                            color: filters.preferredTenants === type
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
                                    fetchProperties(1, true);
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
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16,
        }}>
            <Text style={{
                fontSize: getFontSize(20),
                fontWeight: "600",
                color: colors.text.primary,
                textAlign: 'center',
                marginBottom: 8,
            }}>
                No Properties Found
            </Text>
            <Text style={{
                fontSize: getFontSize(14),
                color: colors.text.secondary,
                textAlign: 'center',
                marginBottom: 24,
            }}>
                Try adjusting your filters or search criteria
            </Text>
            <Button
                text="Clear Filters"
                onPress={clearFilters}
                variant="primary"
            />
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.default, paddingBottom: 30 }}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
            {renderSearchAndFilter()}
            {renderFilterModal()}

            <FlatList
                contentContainerStyle={{ padding: 12 }}
                data={properties}
                renderItem={({ item }) => (
                    <PropertyCard
                        property={item}
                        onPress={handlePropertyPress}
                        onWishlistToggle={handleWishlistToggle}
                        isWishlisted={wishlistedProperties.includes(item._id)}
                    />
                )}
                keyExtractor={(item) => item._id}
                ListEmptyComponent={!loading && renderEmptyState()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary.main]}
                        tintColor={colors.primary.main}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => (
                    loading && !refreshing && <SkeletonLoader count={3} />
                )}
            />
        </SafeAreaView>
    );
}