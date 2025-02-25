import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    ActivityIndicator,
    Platform,
    Linking
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { propertyService } from '@/services/property.services';
import colors from '@/utils/color';
import { getFontSize } from '@/utils/font';
import { MaterialIcons, Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Carousel from 'react-native-reanimated-carousel';
import MapView, { Marker } from 'react-native-maps';
import Animated, { FadeIn } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Skeleton components for property details
const PropertyDetailsSkeleton = () => {
    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            {/* Image Carousel Skeleton */}
            <Animated.View
                entering={FadeIn.duration(500)}
                style={{
                    height: 250,
                    width: '100%',
                    backgroundColor: colors.grey[200],
                }}
            />

            {/* Property Info Skeleton */}
            <View style={{
                padding: 16,
                backgroundColor: colors.common.white,
            }}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                }}>
                    <Animated.View
                        entering={FadeIn.duration(500)}
                        style={{
                            height: 28,
                            width: '70%',
                            backgroundColor: colors.grey[200],
                            borderRadius: 4,
                        }}
                    />
                    <Animated.View
                        entering={FadeIn.duration(500)}
                        style={{
                            height: 28,
                            width: '20%',
                            backgroundColor: colors.grey[200],
                            borderRadius: 6,
                        }}
                    />
                </View>

                <Animated.View
                    entering={FadeIn.duration(500)}
                    style={{
                        height: 28,
                        width: '40%',
                        backgroundColor: colors.grey[200],
                        borderRadius: 4,
                        marginBottom: 16,
                    }}
                />

                <Animated.View
                    entering={FadeIn.duration(500)}
                    style={{
                        height: 20,
                        width: '100%',
                        backgroundColor: colors.grey[200],
                        borderRadius: 4,
                        marginBottom: 16,
                    }}
                />

                <Animated.View
                    entering={FadeIn.duration(500)}
                    style={{
                        height: 40,
                        width: '100%',
                        backgroundColor: colors.grey[200],
                        borderRadius: 4,
                    }}
                />
            </View>

            {/* Owner Info Skeleton */}
            <View style={{
                padding: 16,
                backgroundColor: colors.common.white,
                marginTop: 8,
            }}>
                <Animated.View
                    entering={FadeIn.duration(500)}
                    style={{
                        height: 22,
                        width: '60%',
                        backgroundColor: colors.grey[200],
                        borderRadius: 4,
                        marginBottom: 16,
                    }}
                />

                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                }}>
                    <Animated.View
                        entering={FadeIn.duration(500)}
                        style={{
                            height: 40,
                            width: 40,
                            borderRadius: 20,
                            backgroundColor: colors.grey[200],
                        }}
                    />
                    <Animated.View
                        entering={FadeIn.duration(500)}
                        style={{
                            height: 20,
                            width: '60%',
                            backgroundColor: colors.grey[200],
                            borderRadius: 4,
                        }}
                    />
                </View>
            </View>

            {/* Description Skeleton */}
            <View style={{
                padding: 16,
                backgroundColor: colors.common.white,
                marginTop: 8,
            }}>
                <Animated.View
                    entering={FadeIn.duration(500)}
                    style={{
                        height: 22,
                        width: '40%',
                        backgroundColor: colors.grey[200],
                        borderRadius: 4,
                        marginBottom: 8,
                    }}
                />

                <Animated.View
                    entering={FadeIn.duration(500)}
                    style={{
                        height: 80,
                        width: '100%',
                        backgroundColor: colors.grey[200],
                        borderRadius: 4,
                    }}
                />
            </View>

            {/* Property Details Skeleton */}
            <View style={{
                padding: 16,
                backgroundColor: colors.common.white,
                marginTop: 8,
            }}>
                <Animated.View
                    entering={FadeIn.duration(500)}
                    style={{
                        height: 22,
                        width: '50%',
                        backgroundColor: colors.grey[200],
                        borderRadius: 4,
                        marginBottom: 16,
                    }}
                />

                {[...Array(8)].map((_, index) => (
                    <Animated.View
                        key={`details-row-${index}`}
                        entering={FadeIn.delay(100 * index).duration(500)}
                        style={{
                            height: 20,
                            width: '100%',
                            backgroundColor: colors.grey[200],
                            borderRadius: 4,
                            marginBottom: 12,
                        }}
                    />
                ))}
            </View>

            {/* Amenities Skeleton */}
            <View style={{
                padding: 16,
                backgroundColor: colors.common.white,
                marginTop: 8,
            }}>
                <Animated.View
                    entering={FadeIn.duration(500)}
                    style={{
                        height: 22,
                        width: '40%',
                        backgroundColor: colors.grey[200],
                        borderRadius: 4,
                        marginBottom: 12,
                    }}
                />

                <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                }}>
                    {[...Array(6)].map((_, index) => (
                        <Animated.View
                            key={`amenity-${index}`}
                            entering={FadeIn.delay(50 * index).duration(500)}
                            style={{
                                height: 32,
                                width: 80,
                                backgroundColor: colors.grey[200],
                                borderRadius: 16,
                            }}
                        />
                    ))}
                </View>
            </View>

            {/* Location Skeleton */}
            <View style={{
                padding: 16,
                backgroundColor: colors.common.white,
                marginTop: 8,
                marginBottom: 16,
            }}>
                <Animated.View
                    entering={FadeIn.duration(500)}
                    style={{
                        height: 22,
                        width: '40%',
                        backgroundColor: colors.grey[200],
                        borderRadius: 4,
                        marginBottom: 12,
                    }}
                />

                <Animated.View
                    entering={FadeIn.duration(500)}
                    style={{
                        height: 200,
                        width: '100%',
                        backgroundColor: colors.grey[200],
                        borderRadius: 12,
                        marginBottom: 12,
                    }}
                />

                <Animated.View
                    entering={FadeIn.duration(500)}
                    style={{
                        height: 48,
                        width: '100%',
                        backgroundColor: colors.grey[200],
                        borderRadius: 8,
                    }}
                />
            </View>
        </ScrollView>
    );
};

const InfoRow = ({ label, value }) => (
    <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.grey[200],
    }}>
        <Text style={{
            fontSize: getFontSize(14),
            color: colors.text.secondary,
            flex: 1,
        }}>{label}</Text>
        <Text style={{
            fontSize: getFontSize(14),
            color: colors.text.primary,
            fontWeight: '500',
            flex: 2,
            textAlign: 'right',
        }}>{value}</Text>
    </View>
);

export default function PropertyDetails() {
    const { id } = useLocalSearchParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSlide, setActiveSlide] = useState(0);
    const [imagesLoading, setImagesLoading] = useState({});

    useEffect(() => {
        fetchPropertyDetails();
    }, [id]);

    const fetchPropertyDetails = async () => {
        try {
            setLoading(true);
            const response = await propertyService.getPropertyById(id);
            setProperty(response.data);

            // Initialize image loading states
            const loadingStates = {};
            response.data.images.forEach(img => {
                loadingStates[img.url] = true;
            });
            setImagesLoading(loadingStates);
        } catch (error) {
            console.error('Error fetching property details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageLoad = (imageUrl) => {
        setImagesLoading(prev => ({
            ...prev,
            [imageUrl]: false
        }));
    };

    const openGoogleMaps = () => {
        let mapUrl = '';
        if (property.location.coordinates?.latitude && property.location.coordinates?.longitude) {
            // If coordinates are available, use them
            const { latitude, longitude } = property.location.coordinates;
            const scheme = Platform.select({
                ios: 'maps:0,0?q=',
                android: 'geo:0,0?q='
            });
            const latLng = `${latitude},${longitude}`;
            const label = encodeURIComponent(property.title);
            mapUrl = Platform.select({
                ios: `${scheme}${label}@${latLng}`,
                android: `${scheme}${latLng}(${label})`
            });
        } else {
            // If coordinates aren't available, use the full address
            const fullAddress = encodeURIComponent(
                `${property.location.address}, ${property.location.landmark || ''} ${property.location.city}, ${property.location.state} ${property.location.pincode}`
            );

            mapUrl = Platform.select({
                ios: `maps:0,0?q=${fullAddress}`,
                android: `geo:0,0?q=${fullAddress}`
            });
        }

        Linking.openURL(mapUrl);
    };

    const handleCallOwner = () => {
        if (property.owner.phoneNumber) {
            Linking.openURL(`tel:${property.owner.phoneNumber}`);
        }
    };

    const renderHeader = () => (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            backgroundColor: colors.common.white,
        }}>
            <TouchableOpacity
                onPress={() => router.back()}
                style={{
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor: colors.background.input,
                }}>
                <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={{
                fontSize: getFontSize(18),
                fontWeight: '600',
                color: colors.text.primary,
            }}>
                Property Details
            </Text>
            <View style={{ width: 40 }} />
        </View>
    );

    const renderCarousel = () => {
        const images = property.images?.length > 0
            ? property.images.map(img => img.url)
            : ['https://via.placeholder.com/400x200'];

        return (
            <View style={{
                height: 250,
                width: '100%',
                position: 'relative',
            }}>
                <Carousel
                    width={SCREEN_WIDTH}
                    height={250}
                    data={images}
                    renderItem={({ item }) => (
                        <View style={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            backgroundColor: colors.grey[200], // Background color while loading
                        }}>
                            <Image
                                source={{ uri: item }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                }}
                                onLoad={() => handleImageLoad(item)}
                                resizeMode="cover"
                            />
                            {imagesLoading[item] && (
                                <View style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(255,255,255,0.5)',
                                }}>
                                    <ActivityIndicator size="large" color={colors.primary.main} />
                                </View>
                            )}
                        </View>
                    )}
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
                        {images.map((_, index) => (
                            <View
                                key={index}
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: 3,
                                    marginHorizontal: 3,
                                    backgroundColor: index === activeSlide
                                        ? colors.primary.main
                                        : 'rgba(255, 255, 255, 0.7)',
                                }}
                            />
                        ))}
                    </View>
                )}
            </View>
        );
    };

    const renderPropertyInfo = () => (
        <View style={{
            padding: 16,
            backgroundColor: colors.common.white,
        }}>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 8,
            }}>
                <Text style={{
                    fontSize: getFontSize(24),
                    fontWeight: '600',
                    color: colors.text.primary,
                    flex: 1,
                }}>
                    {property.title}
                </Text>
                <View style={{
                    backgroundColor: property.status.isVerified ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                }}>
                    <MaterialIcons
                        name={property.status.isVerified ? "verified" : "error-outline"}
                        size={16}
                        color={colors.common.white}
                    />
                    <Text style={{
                        color: colors.common.white,
                        fontSize: getFontSize(12),
                        fontWeight: '500',
                    }}>
                        {property.status.isVerified ? 'Verified' : 'Unverified'}
                    </Text>
                </View>
            </View>

            <Text style={{
                fontSize: getFontSize(22),
                color: colors.primary.main,
                fontWeight: '700',
                marginBottom: 16,
            }}>
                ₹{property.price.basePrice.toLocaleString()}/
                <Text style={{
                    fontSize: getFontSize(16),
                    color: colors.text.secondary,
                    fontWeight: '500',
                }}>
                    {property.price.billType}
                </Text>
            </Text>

            <InfoRow
                label="Security Deposit"
                value={`₹${property.price.securityDeposit.toLocaleString()}`}
            />

            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 16,
            }}>
                <MaterialIcons
                    name="location-on"
                    size={20}
                    color={colors.text.secondary}
                />
                <Text style={{
                    marginLeft: 4,
                    fontSize: getFontSize(14),
                    color: colors.text.secondary,
                    flex: 1,
                }}>
                    {property.location.address}, {property.location.landmark && `${property.location.landmark}, `}
                    {property.location.city}, {property.location.state} - {property.location.pincode}
                </Text>
            </View>
        </View>
    );

    const renderOwnerInfo = () => (
        <View style={{
            padding: 16,
            backgroundColor: colors.common.white,
            marginTop: 8,
        }}>
            <Text style={{
                fontSize: getFontSize(18),
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: 16,
            }}>
                Owner Information
            </Text>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
            }}>
                <FontAwesome5 name="user-circle" size={40} color={colors.text.secondary} />
                <View style={{ flex: 1 }}>
                    <Text style={{
                        fontSize: getFontSize(16),
                        fontWeight: '600',
                        color: colors.text.primary,
                        marginBottom: 4,
                    }}>
                        {property.owner.firstName} {property.owner.lastName}
                    </Text>
                    {/* <TouchableOpacity
                        onPress={handleCallOwner}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                        }}>
                        <Feather name="phone" size={16} color={colors.primary.main} />
                        <Text style={{
                            color: colors.primary.main,
                            fontSize: getFontSize(14),
                        }}>
                            {property.owner.phoneNumber}
                        </Text>
                    </TouchableOpacity> */}
                </View>
            </View>
        </View>
    );

    const renderDescription = () => (
        <View style={{
            padding: 16,
            backgroundColor: colors.common.white,
            marginTop: 8,
        }}>
            <Text style={{
                fontSize: getFontSize(18),
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: 8,
            }}>
                Description
            </Text>
            <Text style={{
                fontSize: getFontSize(14),
                color: colors.text.secondary,
                lineHeight: 20,
            }}>
                {property.description}
            </Text>
        </View>
    );

    const renderDetails = () => (
        <View style={{
            padding: 16,
            backgroundColor: colors.common.white,
            marginTop: 8,
        }}>
            <Text style={{
                fontSize: getFontSize(18),
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: 16,
            }}>
                Property Details
            </Text>
            <InfoRow
                label="Property Type"
                value={property.propertyType.split('-').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            />
            <InfoRow label="Room Type" value={property.details.roomType} />
            <InfoRow label="Total Rooms" value={property.details.totalRooms} />
            <InfoRow label="Available Rooms" value={property.details.availableRooms} />
            <InfoRow label="Room Size" value={`${property.details.roomSize} sq ft`} />
            <InfoRow label="Floor Number" value={property.details.floorNumber} />
            <InfoRow label="Furnishing" value={property.details.furnishingStatus} />
            <InfoRow label="Shared Bathroom" value={property.details.sharedBathroom ? 'Yes' : 'No'} />
            <InfoRow label="Parking Available" value={property.details.parking ? 'Yes' : 'No'} />
            <InfoRow label="Food Available" value={property.foodAvailable ? 'Yes' : 'No'} />
            <InfoRow
                label="Available From"
                value={new Date(property.availableFrom).toLocaleDateString()}
            />
        </View>
    );

    const renderMaintenance = () => (
        <View style={{
            padding: 16,
            backgroundColor: colors.common.white,
            marginTop: 8,
        }}>
            <Text style={{
                fontSize: getFontSize(18),
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: 16,
            }}>
                Maintenance Details
            </Text>
            <InfoRow
                label="Maintenance Amount"
                value={`₹${property.maintainenceCharges.amount}/${property.maintainenceCharges.billType}`}
            />
            <InfoRow
                label="Includes Food"
                value={property.maintainenceCharges.includesFood ? 'Yes' : 'No'}
            />
            <InfoRow
                label="Includes Utilities"
                value={property.maintainenceCharges.includesUtility ? 'Yes' : 'No'}
            />
        </View>
    );

    const renderAmenities = () => (
        <View style={{
            padding: 16,
            backgroundColor: colors.common.white,
            marginTop: 8,
        }}>
            <Text style={{
                fontSize: getFontSize(18),
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: 12,
            }}>
                Amenities
            </Text>
            <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
            }}>
                {property.amenities.map((amenity, index) => (
                    <View
                        key={index}
                        style={{
                            backgroundColor: colors.background.input,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16,
                        }}
                    >
                        <Text style={{
                            fontSize: getFontSize(14),
                            color: colors.text.primary,
                        }}>
                            {amenity}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderPreferredTenants = () => (
        <View style={{
            padding: 16,
            backgroundColor: colors.common.white,
            marginTop: 8,
        }}>
            <Text style={{
                fontSize: getFontSize(18),
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: 12,
            }}>
                Preferred Tenants
            </Text>
            <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
            }}>
                {property.preferredTenants.map((tenant, index) => (
                    <View
                        key={index}
                        style={{
                            backgroundColor: colors.background.input,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16,
                        }}
                    >
                        <Text style={{
                            fontSize: getFontSize(14),
                            color: colors.text.primary,
                        }}>
                            {tenant.charAt(0).toUpperCase() + tenant.slice(1)}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderRules = () => (
        <View style={{
            padding: 16,
            backgroundColor: colors.common.white,
            marginTop: 8,
        }}>
            <Text style={{
                fontSize: getFontSize(18),
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: 12,
            }}>
                House Rules
            </Text>
            {property.rules.map((rule, index) => (
                <View
                    key={index}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 8,
                        gap: 8,
                    }}
                >
                    <MaterialIcons name="check-circle" size={20} color={colors.primary.main} />
                    <Text style={{
                        fontSize: getFontSize(14),
                        color: colors.text.secondary,
                        flex: 1,
                    }}>
                        {rule}
                    </Text>
                </View>
            ))}
        </View>
    );

    const renderLocation = () => (
        <View style={{
            padding: 16,
            backgroundColor: colors.common.white,
            marginTop: 8,
            marginBottom: 16,
        }}>
            <Text style={{
                fontSize: getFontSize(18),
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: 12,
            }}>
                Location
            </Text>

            {property.location.coordinates?.latitude && property.location.coordinates?.longitude && (
                <View style={{
                    height: 200,
                    borderRadius: 12,
                    overflow: 'hidden',
                    marginBottom: 12,
                }}>
                    <MapView
                        style={{ flex: 1 }}
                        initialRegion={{
                            latitude: property.location.coordinates.latitude,
                            longitude: property.location.coordinates.longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        }}
                    >
                        <Marker
                            coordinate={{
                                latitude: property.location.coordinates.latitude,
                                longitude: property.location.coordinates.longitude,
                            }}
                            title={property.title}
                        />
                    </MapView>
                </View>
            )}

            <TouchableOpacity
                onPress={openGoogleMaps}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.primary.main,
                    padding: 12,
                    borderRadius: 8,
                    justifyContent: 'center',
                }}
            >
                <Feather name="map-pin" size={20} color={colors.common.white} />
                <Text style={{
                    marginLeft: 8,
                    color: colors.common.white,
                    fontSize: getFontSize(16),
                    fontWeight: '500',
                }}>
                    Visit this location
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.default }}>
            {renderHeader()}

            {loading ? (
                <PropertyDetailsSkeleton />
            ) : !property ? (
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Text style={{
                        fontSize: getFontSize(18),
                        color: colors.text.primary,
                        textAlign: 'center',
                    }}>
                        Property not found
                    </Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    {renderCarousel()}
                    {renderPropertyInfo()}
                    {renderOwnerInfo()}
                    {renderDescription()}
                    {renderDetails()}
                    {renderMaintenance()}
                    {renderAmenities()}
                    {renderPreferredTenants()}
                    {renderRules()}
                    {renderLocation()}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}