import { View, Text, Alert, Platform, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Location from 'expo-location'
import WebView from 'react-native-webview'
import { Feather } from '@expo/vector-icons'  // We're already using this in the app
import { Linking } from 'react-native'

export default function Home() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [address, setAddress] = useState<Location.LocationGeocodedAddress | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Function to open Google Maps
    const openInGoogleMaps = () => {
        if (location) {
            const { latitude, longitude } = location.coords;
            const label = address?.street || "Current Location";
            const url = Platform.select({
                ios: `comgooglemaps://?q=${latitude},${longitude}(${label})&center=${latitude},${longitude}`,
                android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`
            });

            // First try to open in Google Maps app
            Linking.canOpenURL(url!)
                .then(supported => {
                    if (supported) {
                        return Linking.openURL(url!);
                    } else {
                        // If Google Maps app is not installed, open in browser
                        const browserUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                        return Linking.openURL(browserUrl);
                    }
                })
                .catch(err => {
                    console.error('Error opening maps:', err);
                    Alert.alert('Error', 'Could not open maps application');
                });
        }
    };

    useEffect(() => {
        (async () => {
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
                let location = await Location.getCurrentPositionAsync({});
                setLocation(location);

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

    const getMapHTML = (latitude: number, longitude: number) => `
        <!DOCTYPE html>
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
                <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
                <style>
                    #map { height: 100vh; }
                </style>
            </head>
            <body style="margin: 0; padding: 0;">
                <div id="map"></div>
                <script>
                    const map = L.map('map').setView([${latitude}, ${longitude}], 13);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors'
                    }).addTo(map);
                    L.marker([${latitude}, ${longitude}]).addTo(map)
                        .bindPopup('Your Location')
                        .openPopup();
                </script>
            </body>
        </html>
    `;

    return (
        <SafeAreaView className="flex-1">
            <View className="p-4">
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

                        {/* Google Maps Button */}
                        <Pressable
                            onPress={openInGoogleMaps}
                            className="flex-row items-center bg-blue-500 p-3 rounded-lg mt-4"
                        >
                            <Feather name="map" size={20} color="white" />
                            <Text className="text-white ml-2 font-medium">
                                Open in Google Maps
                            </Text>
                        </Pressable>
                    </View>
                )}
            </View>

            {/* Map View */}
            {location && (
                <View className="flex-1 mt-4">
                    <WebView
                        className="flex-1"
                        source={{
                            html: getMapHTML(
                                location.coords.latitude,
                                location.coords.longitude
                            )
                        }}
                        style={{ height: 400 }}
                    />
                </View>
            )}
        </SafeAreaView>
    )
}