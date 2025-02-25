import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Image,
    StyleSheet
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { propertyService } from '@/services/property.services';
import colors from '@/utils/color';
import { getFontSize } from '@/utils/font';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { PropertyCard } from '.';
import Animated, { FadeIn } from 'react-native-reanimated';

// Skeleton component for wishlist
const PropertyCardSkeleton = () => {
    return (
        <Animated.View
            entering={FadeIn.duration(500)}
            className="bg-white rounded-xl mb-4 shadow-sm overflow-hidden"
            style={styles.skeletonCard}
        >
            {/* Image Skeleton */}
            <Animated.View style={styles.skeletonImage} />

            {/* Content Section Skeleton */}
            <View style={styles.skeletonContent}>
                {/* Title and Price */}
                <View style={{ marginBottom: 12 }}>
                    <Animated.View style={styles.skeletonTitle} />
                    <Animated.View style={styles.skeletonPrice} />
                </View>

                {/* Location */}
                <View style={{ marginBottom: 16 }}>
                    <Animated.View style={styles.skeletonLocation} />
                </View>

                {/* Property Features */}
                <View style={styles.skeletonFeatures}>
                    <View style={{ flex: 1 }}>
                        <Animated.View style={styles.skeletonFeatureLabel} />
                        <Animated.View style={styles.skeletonFeatureValue} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Animated.View style={styles.skeletonFeatureLabel} />
                        <Animated.View style={styles.skeletonFeatureValue} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Animated.View style={styles.skeletonFeatureLabel} />
                        <Animated.View style={styles.skeletonFeatureValue} />
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};

// Component to display multiple skeleton cards
const WishlistSkeletonLoader = ({ count = 3 }) => {
    return (
        <>
            {[...Array(count)].map((_, index) => (
                <PropertyCardSkeleton key={`skeleton-${index}`} />
            ))}
        </>
    );
};

export default function Wishlist() {
    const router = useRouter();
    const [wishlistedProperties, setWishlistedProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [properties, setProperties] = useState([]);

    // Fix: Correct usage of useFocusEffect with useCallback
    useFocusEffect(
        useCallback(() => {
            loadWishlistedProperties();
            return () => { }; // cleanup function (optional)
        }, [])
    );

    // This useEffect might be redundant with the useFocusEffect above
    // useEffect(() => {
    //     loadWishlistedProperties();
    // }, []);

    const loadWishlistedProperties = async () => {
        try {
            setLoading(true);
            // Get wishlisted property IDs from AsyncStorage
            const wishlist = await AsyncStorage.getItem('wishlistedProperties');
            const wishlistedIds = wishlist ? JSON.parse(wishlist) : [];
            setWishlistedProperties(wishlistedIds);

            if (wishlistedIds.length > 0) {
                // Fetch full property details for each wishlisted property
                const propertyPromises = wishlistedIds.map(id =>
                    propertyService.getPropertyById(id)
                );
                const propertyResponses = await Promise.all(propertyPromises);

                // Filter out any null responses and set the properties
                const validProperties = propertyResponses
                    .filter(response => response && response.data)
                    .map(response => response.data);

                setProperties(validProperties);
            } else {
                setProperties([]);
            }
        } catch (error) {
            console.error('Error loading wishlisted properties:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadWishlistedProperties();
    };

    const handleWishlistToggle = async (property) => {
        try {
            const updatedWishlist = wishlistedProperties.filter(id => id !== property._id);
            setWishlistedProperties(updatedWishlist);
            await AsyncStorage.setItem('wishlistedProperties', JSON.stringify(updatedWishlist));

            // Remove the property from the displayed list
            setProperties(prevProperties =>
                prevProperties.filter(p => p._id !== property._id)
            );
        } catch (error) {
            console.error('Error updating wishlist:', error);
        }
    };

    const handlePropertyPress = (property) => {
        router.push({
            pathname: '/property-details',
            params: { id: property._id }
        });
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <MaterialIcons
                name="favorite-border"
                size={80}
                color={colors.grey[300]}
            />
            <Text style={styles.emptyTitle}>
                No Wishlisted Properties
            </Text>
            <Text style={styles.emptySubtitle}>
                Properties you like will appear here
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Wishlist</Text>
            </View>

            {loading && !refreshing ? (
                <WishlistSkeletonLoader count={3} />
            ) : (
                <FlatList
                    contentContainerStyle={styles.listContainer}
                    data={properties}
                    renderItem={({ item }) => (
                        <PropertyCard
                            property={item}
                            onPress={handlePropertyPress}
                            onWishlistToggle={handleWishlistToggle}
                            isWishlisted={true}
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
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default
    },
    header: {
        padding: 16,
        backgroundColor: colors.background.paper,
        borderBottomWidth: 1,
        borderBottomColor: colors.grey[200]
    },
    headerTitle: {
        fontSize: getFontSize(20),
        fontWeight: '600',
        color: colors.text.primary
    },
    listContainer: {
        padding: 12,
        flexGrow: 1
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400,
        paddingHorizontal: 24
    },
    emptyTitle: {
        fontSize: getFontSize(20),
        fontWeight: '600',
        color: colors.text.primary,
        marginTop: 16,
        marginBottom: 8
    },
    emptySubtitle: {
        fontSize: getFontSize(14),
        color: colors.text.secondary,
        textAlign: 'center'
    },
    // Skeleton styles
    skeletonCard: {
        backgroundColor: colors.background.card,
        borderRadius: 12,
        marginBottom: 16,
        marginHorizontal: 12,
        shadowColor: colors.common.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    skeletonImage: {
        height: 180,
        width: '100%',
        backgroundColor: colors.grey[200],
    },
    skeletonContent: {
        padding: 16,
    },
    skeletonTitle: {
        height: 20,
        width: '75%',
        backgroundColor: colors.grey[200],
        marginBottom: 8,
        borderRadius: 4,
    },
    skeletonPrice: {
        height: 24,
        width: '50%',
        backgroundColor: colors.grey[200],
        borderRadius: 4,
    },
    skeletonLocation: {
        height: 16,
        width: '85%',
        backgroundColor: colors.grey[200],
        borderRadius: 4,
    },
    skeletonFeatures: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 0.5,
        borderTopColor: colors.grey[200],
    },
    skeletonFeatureLabel: {
        height: 12,
        width: '80%',
        backgroundColor: colors.grey[200],
        marginBottom: 6,
        borderRadius: 4,
    },
    skeletonFeatureValue: {
        height: 14,
        width: '70%',
        backgroundColor: colors.grey[200],
        borderRadius: 4,
    }
});