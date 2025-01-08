import { View, Text } from 'react-native'
import React from 'react'

export default function Wrapper({ children }: { children: React.ReactNode }) {
    return (
        <View className='flex-1 px-3 py-6 '>
            {children}
        </View>
    )
}