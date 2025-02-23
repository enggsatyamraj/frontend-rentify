import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Image,
    StyleSheet
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { propertyService } from '@/services/property.services';
import colors from '@/utils/color';
import { getFontSize } from '@/utils/font';
import { useRouter } from 'expo-router';// You might need to adjust this import path
import { MaterialIcons } from '@expo/vector-icons';
import { PropertyCard } from '.';

export default function Wishlist() {
    const router = useRouter();
    const [wishlistedProperties, setWishlistedProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        loadWishlistedProperties();
    }, []);

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
                setProperties(propertyResponses.map(response => response.data).filter(Boolean));
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

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Wishlist</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Wishlist</Text>
            </View>

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
    }
});