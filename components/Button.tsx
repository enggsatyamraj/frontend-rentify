import colors from '@/utils/color';
import { getDeviceType, getFontSize } from '@/utils/font';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
    onPress: () => void;
    text: string;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
    className?: string;
    textClassName?: string
}

export const Button = ({
    onPress,
    text,
    loading = false,
    disabled = false,
    variant = 'primary',
    className = '',
    textClassName = ''
}: ButtonProps) => {
    const isTablet = getDeviceType() === 'tablet';

    const getBackgroundColor = () => {
        if (disabled) return colors.grey[300];
        return variant === 'primary' ? colors.primary.main : 'transparent';
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            className={`rounded-xl ${className}`}
            style={{
                backgroundColor: getBackgroundColor(),
                paddingVertical: isTablet ? 18 : 14,
                borderWidth: variant === 'secondary' ? 1 : 0,
                borderColor: colors.primary.main
            }}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text
                    className={`text-center ${textClassName} font-semibold ${variant === 'primary' ? 'text-white' : 'text-primary'
                        }`}
                    style={{ fontSize: getFontSize(isTablet ? 18 : 16) }}
                >
                    {text}
                </Text>
            )}
        </TouchableOpacity>
    );
};