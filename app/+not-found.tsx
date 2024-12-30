import { Stack } from "expo-router";
import { SafeAreaView, ScrollView, Text, View } from "react-native";

export default function NotFound() {
    return (
        <>
            <Stack.Screen options={{ title: "Oops!, page not found", headerShown: false }} />
            <ScrollView showsVerticalScrollIndicator={false} className="border-2 border-purple-800 min-h-[100vh]">
                <View className="h-[400px] w-full bg-red-700 ">
                    <SafeAreaView>
                        <View className='w-[50%] md:w-[30%] lg:w-[90%]'>
                            <Text className='text-2xl font-bold bg-red-800'>Nativewind</Text>
                        </View>
                    </SafeAreaView>
                    <Text>Not Found hello world</Text>
                </View>
                <View className="h-[400px] w-full bg-green-700 ">
                    <Text>Not Found hello world</Text>
                </View>
                <View className="h-[400px] w-full bg-yellow-700 ">
                    <Text>Not Found hello world</Text>
                </View>
            </ScrollView>
        </>
    )
}