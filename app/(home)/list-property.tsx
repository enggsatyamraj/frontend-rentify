import { View, Text, ScrollView, TouchableOpacity, Dimensions, Modal } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getFontSize } from '@/utils/font'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import colors from '@/utils/color';
import { useAuthStore } from '@/store/auth.store';
import { propertyService } from '@/services/property.services';

export default function listProperty() {
    const height = Dimensions.get('window').height;
    const width = Dimensions.get('window').width;
    const [showListModal, setShowListModal] = React.useState<boolean>(false);
    const token = useAuthStore(state => state.token);
    const [userPropertyLoading, setUserPropertyLoading] = React.useState<boolean>(false);
    const [properties, setProperties] = React.useState<any[]>([]);
    const getResponsiveButtonShape = () => {
        if (width > 1024) {
            return {
                width: 200,
                height: 50,
                borderRadius: 10
            }
        }
        return {
            width: 150,
            height: 40,
            borderRadius: 8
        }
    }

    useEffect(() => {
        const fetchUserProperties = async () => {
            try {
                setUserPropertyLoading(true);
                const response = await propertyService.getUserProperties(token!);
                console.log('User properties:', response.data);
                setProperties(response.data);
            } catch (error) {
                console.error('Error fetching user properties:', error)
            } finally {
                setUserPropertyLoading(false);
            }
        }
        fetchUserProperties();
    }, [])


    const openListModel = () => {
        setShowListModal(prev => prev = !prev)
    }
    return (
        <SafeAreaView className='border-2 border-blue-700 flex-1'>
            <View className='flex-1'>
                <ScrollView className='px-3 py-3'>
                    <Text style={{ fontSize: getFontSize(23) }}>Listed Property</Text>
                </ScrollView>
                <TouchableOpacity
                    onPress={openListModel}
                    style={{
                        backgroundColor: colors.primary.dark,
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        position: 'absolute',
                        bottom: 90,
                        right: 20,
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                    }}
                    className='flex justify-center items-center'
                >
                    <FontAwesome6 name="plus" size={24} color={'#fff'} />
                </TouchableOpacity>

                {/* list property model */}
                <Modal animationType='slide' visible={showListModal} >
                    <SafeAreaView className='flex-1 bg-white'>
                        {/* Header */}
                        <View className='flex-row justify-between items-center px-4 py-3 border-b border-gray-200'>
                            <Text className='text-xl font-semibold'>List your Property</Text>
                            <TouchableOpacity
                                onPress={openListModel}
                                className='p-2'
                            >
                                <FontAwesome6 name="xmark" size={24} color={'#000'} />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <ScrollView className='flex-1 px-4 py-3'>
                            <Text>Content inside the modal</Text>
                        </ScrollView>
                    </SafeAreaView>
                </Modal>

                {
                    properties.length == 0 ? (
                        <View className='border-2 border-red-900 justify-center items-center'>
                            <Text className='text-lg'>No property listed yet</Text>
                        </View>
                    ) : (
                        <View>
                            <Text>Your properties will be seen here</Text>
                        </View>
                    )
                }
            </View>
        </SafeAreaView>
    )
}