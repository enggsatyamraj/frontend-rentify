import { Tabs } from 'expo-router';
import { Platform, View, Dimensions } from 'react-native';
import colors from '@/utils/color';
import { Feather, AntDesign } from '@expo/vector-icons';
import { getFontSize, getDeviceType } from '@/utils/font';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TabLayout() {
    const isTablet = getDeviceType() === 'tablet';
    const iconSize = isTablet ? 28 : 24;
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1 }}>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: colors.primary.main,
                    tabBarInactiveTintColor: colors.grey[400],
                    tabBarStyle: {
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 85,
                        backgroundColor: colors.background.paper,
                        borderTopRightRadius: 24,
                        borderTopLeftRadius: 24,
                        paddingBottom: insets.bottom,
                        borderTopWidth: 1,
                        borderColor: 'rgba(0,0,0,0.1)',
                        elevation: 0,
                        shadowColor: '#000',
                        shadowOffset: {
                            width: 0,
                            height: -2,
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                    },
                    tabBarItemStyle: {
                        height: 50,
                        paddingTop: 8,
                        paddingBottom: Platform.OS === 'ios' ? 8 : 4,
                    },
                    tabBarLabelStyle: {
                        fontSize: getFontSize(11),
                        fontWeight: '500',
                        marginTop: 4,
                    },
                    headerShown: false,
                    contentStyle: {
                        paddingBottom: 85 + insets.bottom,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color }) => (
                            <Feather name="home" size={iconSize} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="wishlist"
                    options={{
                        title: 'Wishlist',
                        tabBarIcon: ({ color }) => (
                            <Feather name="heart" size={iconSize} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="list-property"
                    options={{
                        title: 'List',
                        tabBarIcon: ({ color }) => (
                            <AntDesign name="plus" size={iconSize} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="(profile)"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color }) => (
                            <Feather name="user" size={iconSize} color={color} />
                        ),
                    }}
                />
            </Tabs>
        </View>
    );
}