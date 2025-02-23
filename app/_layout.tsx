import 'react-native-reanimated'
import 'react-native-gesture-handler'
import { Stack } from "expo-router";
import "../global.css";
import Toast from 'react-native-toast-message';

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name='(home)' options={{ headerShown: false }} />
            <Stack.Screen name='property-details' options={{ headerShown: false }} />
            <Toast />
        </Stack>
    )
}