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
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import colors from "@/utils/color";
import { Feather, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { getFontSize, getDeviceType } from "@/utils/font";
import { Button } from "@/components/Button";
import Carousel from 'react-native-reanimated-carousel';
import { propertyService } from "@/services/property.services";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PropertyCard = ({ property, onPress }) => {
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
                {/* {renderVerificationBadge()} */}
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

    // Debounce search text
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
            pathname: '/(home)/property-details',
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

            {/* Header with Logout */}
            {/* <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                <View>
                    <Text
                        className="text-gray-800 font-medium"
                        style={{ fontSize: getFontSize(isTablet ? 16 : 14) }}
                    >
                        Welcome back,
                    </Text>
                    <Text
                        className="text-primary-600 font-semibold"
                        style={{ fontSize: getFontSize(isTablet ? 18 : 16) }}
                    >
                        {user?.firstName} {user?.lastName}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    disabled={isLoading}
                    className="flex-row items-center bg-primary-50 rounded-full px-4 py-2 active:opacity-80"
                >
                    <Feather
                        name="log-out"
                        size={isTablet ? 20 : 18}
                        color={colors.primary.main}
                    />
                    <Text
                        className="ml-2 text-primary-600 font-medium"
                        style={{ fontSize: getFontSize(isTablet ? 15 : 13) }}
                    >
                        {isLoading ? "Logging out..." : "Logout"}
                    </Text>
                </TouchableOpacity>
            </View> */}

            {renderSearchAndFilter()}
            {renderFilterModal()}

            <FlatList
                contentContainerStyle={{ padding: 12 }}
                data={properties}
                renderItem={({ item }) => (
                    <PropertyCard
                        property={item}
                        onPress={handlePropertyPress}
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
                    loading && (
                        <View style={{ padding: 16 }}>
                            <ActivityIndicator size="small" color={colors.primary.main} />
                        </View>
                    )
                )}
            />
        </SafeAreaView>
    );
}