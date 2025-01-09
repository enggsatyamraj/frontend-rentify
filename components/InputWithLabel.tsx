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
import { getFontSize, getDeviceType } from "@/utils/font";

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
    style,
    ...rest
}) => {
    const [isSecure, setIsSecure] = React.useState(secureTextEntry);
    const [isFocused, setIsFocused] = React.useState(false);
    const isTablet = getDeviceType() === 'tablet';

    // Calculate dynamic sizes based on device type
    const getInputHeight = () => {
        return isTablet ? 56 : 44; // Taller input for tablets
    };

    const getFontSizes = () => ({
        label: getFontSize(isTablet ? 15 : 13),
        input: getFontSize(isTablet ? 16 : 14),
        description: getFontSize(isTablet ? 14 : 12),
        error: getFontSize(isTablet ? 14 : 12)
    });

    const fontSizes = getFontSizes();
    const inputHeight = getInputHeight();

    return (
        <View className="mb-4 space-y-2">
            {/* Label and Description Container */}
            <View className="space-y-1">
                {label && (
                    <Text
                        style={{ fontSize: fontSizes.label }}
                        className="mb-2 font-medium text-gray-900"
                    >
                        {label}
                    </Text>
                )}
                {description && (
                    <Text
                        style={{ fontSize: fontSizes.description }}
                        className="text-gray-500 dark:text-gray-400"
                    >
                        {description}
                    </Text>
                )}
            </View>

            {/* Input Container */}
            <View className="relative flex-row items-center">
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    secureTextEntry={isSecure}
                    placeholderTextColor="#6b7280"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
                        flex-1 px-4
                        text-gray-900
                        bg-transparent border-[1px] 
                        ${isFocused ? 'border-gray-900' : 'border-gray-300'}
                        rounded-lg
                    `}
                    style={[
                        {
                            height: inputHeight,
                            fontSize: fontSizes.input,
                            paddingVertical: isTablet ? 16 : 12,
                        },
                        style
                    ]}
                    {...rest}
                />

                {/* Password Toggle Button */}
                {showToggle && secureTextEntry && (
                    <Pressable
                        onPress={() => setIsSecure(!isSecure)}
                        className="absolute right-4"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={{
                            padding: isTablet ? 8 : 4,
                        }}
                    >
                        <Feather
                            name={isSecure ? "eye-off" : "eye"}
                            size={isTablet ? 24 : 20}
                            color="#6b7280"
                        />
                    </Pressable>
                )}
            </View>

            {/* Error Message */}
            {error && (
                <Text
                    style={{ fontSize: fontSizes.error }}
                    className="font-medium text-red-500"
                >
                    {error}
                </Text>
            )}
        </View>
    );
};

export default InputWithLabel;