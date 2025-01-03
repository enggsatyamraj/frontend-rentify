import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Use whichever is smaller, width or height
const SCALE = SCREEN_WIDTH > SCREEN_HEIGHT ? SCREEN_HEIGHT : SCREEN_WIDTH;

// Base width for scaling calculations
const BASE_WIDTH = 375;

// Modified configuration with reduced scaling for larger screens
const fontConfig = {
    phone: {
        small: { min: 0.8, max: 0.9 },    // Slightly reduced max
        medium: { min: 0.85, max: 1.0 },  // Reduced max
        large: { min: 0.9, max: 1.1 },    // Reduced max
    },
    tablet: {
        small: { min: 1.0, max: 1.1 },    // Significantly reduced
        medium: { min: 1.1, max: 1.2 },   // Significantly reduced
        large: { min: 1.2, max: 1.3 },    // Significantly reduced
    },
};

// Helper function to get device type
export const getDeviceType = (): 'phone' | 'tablet' => {
    const pixelDensity = PixelRatio.get();
    const adjustedWidth = SCREEN_WIDTH * pixelDensity;
    const adjustedHeight = SCREEN_HEIGHT * pixelDensity;

    if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
        return 'tablet';
    } else if (pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920)) {
        return 'tablet';
    } else {
        return 'phone';
    }
};

// Helper function to determine screen size category
const getScreenSizeCategory = (): 'small' | 'medium' | 'large' => {
    if (SCALE < 350) return 'small';
    if (SCALE > 500) return 'large';
    return 'medium';
};

export const getFontSize = (size: number): number => {
    const deviceType = getDeviceType();
    const screenCategory = getScreenSizeCategory();
    const config = fontConfig[deviceType][screenCategory];

    // Calculate the scale factor
    const scaleFactor = SCALE / BASE_WIDTH;

    // Clamp the scale factor between the configured min and max
    const clampedScaleFactor = Math.min(Math.max(scaleFactor, config.min), config.max);

    // Calculate the new size
    let newSize = size * clampedScaleFactor;

    // Reduced tablet scaling
    if (deviceType === 'tablet') {
        newSize *= 1.05; // Reduced from 1.1 to 1.05 (only 5% increase for tablets)
    }

    // Round the size and adjust for the device's font scale
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) / PixelRatio.getFontScale();
};

// Function to adjust font configuration
export const adjustFontConfig = (
    deviceType: 'phone' | 'tablet',
    sizeCategory: 'small' | 'medium' | 'large',
    minScale: number,
    maxScale: number
) => {
    fontConfig[deviceType][sizeCategory] = { min: minScale, max: maxScale };
};

// Example usage
console.log('Device type:', getDeviceType());
console.log('Font size for 16:', getFontSize(16));