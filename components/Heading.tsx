import { Text, TextStyle, StyleProp } from 'react-native';
import { getFontSize, getDeviceType } from '@/utils/font';
import colors from '@/utils/color';

interface HeadingProps {
    text: string;
    className?: string;
    style?: StyleProp<TextStyle>;
    variant?: 'h1' | 'h2' | 'h3' | 'h4';
    align?: 'left' | 'center' | 'right';
    color?: string;
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

const getHeadingSizes = (variant: HeadingProps['variant'], isTablet: boolean) => {
    const sizes = {
        h1: {
            fontSize: isTablet ? 40 : 32,
            lineHeight: isTablet ? 48 : 40
        },
        h2: {
            fontSize: isTablet ? 32 : 24,
            lineHeight: isTablet ? 40 : 32
        },
        h3: {
            fontSize: isTablet ? 24 : 20,
            lineHeight: isTablet ? 32 : 28
        },
        h4: {
            fontSize: isTablet ? 20 : 18,
            lineHeight: isTablet ? 28 : 24
        }
    };

    return sizes[variant || 'h2'];
};

const getFontWeight = (weight: HeadingProps['weight']) => {
    const weights = {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold'
    };

    return weights[weight || 'bold'];
};

const getTextAlign = (align: HeadingProps['align']) => {
    const alignments = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    };

    return alignments[align || 'left'];
};

export const Heading = ({
    text,
    className = '',
    style,
    variant = 'h2',
    align = 'left',
    color = colors.text.primary,
    weight = 'bold'
}: HeadingProps) => {
    const isTablet = getDeviceType() === 'tablet';
    const sizes = getHeadingSizes(variant, isTablet);

    return (
        <Text
            className={`${getTextAlign(align)} ${getFontWeight(weight)} ${className}`}
            style={[
                {
                    fontSize: getFontSize(sizes.fontSize),
                    lineHeight: getFontSize(sizes.lineHeight),
                    color: color,
                    letterSpacing: -0.5, // Slightly tighter letter spacing for headings
                },
                style
            ]}
            allowFontScaling={false} // Prevents text scaling when user changes device font size
        >
            {text}
        </Text>
    );
};