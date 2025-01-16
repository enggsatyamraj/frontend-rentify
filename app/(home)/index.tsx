import { View, Text, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Location from 'expo-location'

export default function Home() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [address, setAddress] = useState<Location.LocationGeocodedAddress | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            // Request location permission
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                Alert.alert(
                    "Location Permission",
                    "Please allow location access to use this feature",
                    [{ text: "OK" }]
                );
                return;
            }

            try {
                // Get current location
                let location = await Location.getCurrentPositionAsync({});
                setLocation(location);

                // Get address from coordinates
                const [addressResponse] = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
                setAddress(addressResponse);
            } catch (err) {
                setErrorMsg('Error getting location');
                console.error(err);
            }
        })();
    }, []);

    return (
        <SafeAreaView className="p-4">
            <Text className="text-xl font-bold mb-4">Location Details</Text>

            {errorMsg ? (
                <Text className="text-red-500">{errorMsg}</Text>
            ) : !location ? (
                <Text>Getting location...</Text>
            ) : (
                <View className="space-y-2">
                    <Text>Coordinates:</Text>
                    <Text>Latitude: {location.coords.latitude}</Text>
                    <Text>Longitude: {location.coords.longitude}</Text>

                    {address && (
                        <View className="mt-4 space-y-1">
                            <Text>Address:</Text>
                            <Text>{address.street}</Text>
                            <Text>{address.city}, {address.region}</Text>
                            <Text>{address.country} {address.postalCode}</Text>
                        </View>
                    )}
                </View>
            )}
        </SafeAreaView>
    )
}