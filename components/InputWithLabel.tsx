import React from "react";
import {
    View,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    Pressable,
    StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface InputWithLabelProps extends TextInputProps {
    label?: string;
    description?: string;
    error?: string;
    secureTextEntry?: boolean;
    showToggle?: boolean;
}

const InputWithLabel: React.FC<InputWithLabelProps> = ({
    label,
    description,
    error,
    secureTextEntry = false,
    showToggle = false,
    value,
    onChangeText,
    placeholder,
    ...rest
}) => {
    const [isSecure, setIsSecure] = React.useState(secureTextEntry);
    const [isFocused, setIsFocused] = React.useState(false);

    return (
        <View className="mb-4 space-y-2">
            {/* Label and Description Container */}
            <View className="space-y-1">
                {label && (
                    <Text className="text-sm font-medium text-gray-900 dark:text-gray-50">
                        {label}
                    </Text>
                )}
                {description && (
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                        {description}
                    </Text>
                )}
            </View>

            {/* Input Container */}
            <View
                className={`
                    relative flex-row items-center border rounded-md bg-transparent
                    ${isFocused
                        ? "border-gray-900 dark:border-gray-50"
                        : "border-gray-200 dark:border-gray-800"}
                    ${error ? "border-red-500 dark:border-red-900" : ""}
                `}
            >
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    secureTextEntry={isSecure}
                    placeholderTextColor="#6b7280"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
                        flex-1 h-10 px-3 py-2 text-base
                        text-gray-900 dark:text-gray-50
                        bg-transparent
                    `}
                    {...rest}
                />

                {/* Password Toggle Button */}
                {showToggle && secureTextEntry && (
                    <Pressable
                        onPress={() => setIsSecure(!isSecure)}
                        className="pr-3 pl-2"
                        hitSlop={8}
                    >
                        <Feather
                            name={isSecure ? "eye-off" : "eye"}
                            size={20}
                            color="#6b7280"
                        />
                    </Pressable>
                )}
            </View>

            {/* Error Message */}
            {error && (
                <Text className="text-sm font-medium text-red-500 dark:text-red-900">
                    {error}
                </Text>
            )}
        </View>
    );
};

export default InputWithLabel;