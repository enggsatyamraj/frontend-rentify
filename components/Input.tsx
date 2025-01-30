import { View, TextInput, Text, TouchableOpacity, ViewStyle, TextStyle, Platform, Dimensions } from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import colors from '@/utils/color';
import { getDeviceType, getFontSize } from '@/utils/font';

const window = Dimensions.get('window');
const isSmallDevice = window.width < 375;
const isBigDevice = window.width >= 768;

interface InputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    label?: string;
    isPassword?: boolean;
    error?: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    leftIcon?: keyof typeof Feather.glyphMap;
    rightIcon?: keyof typeof Feather.glyphMap;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    labelStyle?: TextStyle;
    disabled?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    maxLength?: number;
    multiline?: boolean;
    numberOfLines?: number;
}

export const Input = ({
    value,
    onChangeText,
    placeholder,
    label,
    isPassword = false,
    error,
    keyboardType = 'default',
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    inputStyle,
    labelStyle,
    disabled = false,
    autoCapitalize = 'none',
    maxLength,
    multiline = false,
    numberOfLines = 1
}: InputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isTablet = getDeviceType() === 'tablet';

    const getIconSize = () => {
        if (isSmallDevice) return 18;
        if (isBigDevice) return 22;
        return 20;
    };

    const getPadding = () => {
        if (isSmallDevice) return {
            paddingVertical: 10,
            paddingHorizontal: 12,
            iconPadding: 36
        };
        if (isBigDevice) return {
            paddingVertical: 16,
            paddingHorizontal: 18,
            iconPadding: 52
        };
        return {
            paddingVertical: isTablet ? 14 : 12,
            paddingHorizontal: 16,
            iconPadding: 44
        };
    };

    const getFontSizes = () => {
        if (isSmallDevice) return {
            label: getFontSize(13),
            input: getFontSize(14),
            error: getFontSize(11)
        };
        if (isBigDevice) return {
            label: getFontSize(16),
            input: getFontSize(17),
            error: getFontSize(14)
        };
        return {
            label: getFontSize(isTablet ? 15 : 14),
            input: getFontSize(isTablet ? 16 : 15),
            error: getFontSize(isTablet ? 13 : 12)
        };
    };

    const padding = getPadding();
    const fontSizes = getFontSizes();

    return (
        <View style={[{ marginBottom: error ? 20 : 16 }, containerStyle]}>
            {label && (
                <Text
                    className="text-gray-700 font-medium"
                    style={[
                        {
                            fontSize: fontSizes.label,
                            marginBottom: isBigDevice ? 8 : 6
                        },
                        labelStyle
                    ]}
                >
                    {label}
                </Text>
            )}
            <View>
                {leftIcon && (
                    <View
                        className="absolute z-10"
                        style={{
                            left: padding.paddingHorizontal,
                            height: '100%',
                            justifyContent: 'center',
                            opacity: disabled ? 0.5 : 1
                        }}
                    >
                        <Feather
                            name={leftIcon}
                            size={getIconSize()}
                            color={error ? colors.status.error : isFocused ? colors.primary.main : colors.grey[400]}
                        />
                    </View>
                )}
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.text.hint}
                    secureTextEntry={isPassword && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    editable={!disabled}
                    maxLength={maxLength}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="rounded-xl bg-white"
                    style={[
                        {
                            fontSize: fontSizes.input,
                            paddingVertical: padding.paddingVertical,
                            paddingHorizontal: padding.paddingHorizontal,
                            paddingLeft: leftIcon ? padding.iconPadding : padding.paddingHorizontal,
                            paddingRight: (isPassword || rightIcon) ? padding.iconPadding : padding.paddingHorizontal,
                            backgroundColor: disabled ? colors.grey[100] : colors.background.input,
                            borderColor: error ? colors.status.error : isFocused ? colors.primary.main : colors.grey[200],
                            borderWidth: isFocused ? 1.5 : 1,
                            opacity: disabled ? 0.6 : 1,
                            color: colors.text.primary,
                            minHeight: multiline ? (numberOfLines * (isBigDevice ? 28 : isTablet ? 24 : 20)) : undefined,
                            ...Platform.select({
                                ios: {
                                    shadowColor: colors.grey[400],
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 2,
                                },
                                android: {
                                    elevation: 1,
                                },
                            }),
                        },
                        inputStyle
                    ]}
                />
                {(isPassword || rightIcon) && (
                    <TouchableOpacity
                        onPress={isPassword ? () => setShowPassword(!showPassword) : onRightIconPress}
                        disabled={disabled}
                        style={{
                            position: 'absolute',
                            right: padding.paddingHorizontal,
                            height: '100%',
                            justifyContent: 'center',
                            opacity: disabled ? 0.5 : 1
                        }}
                    >
                        <Feather
                            name={rightIcon || (showPassword ? "eye-off" : "eye")}
                            size={getIconSize()}
                            color={isFocused ? colors.primary.main : colors.grey[400]}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <Text
                    className="text-red-500 mt-1"
                    style={{ fontSize: fontSizes.error }}
                >
                    {error}
                </Text>
            )}
        </View>
    );
};