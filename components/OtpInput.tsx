import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Dimensions } from 'react-native';
import colors from '@/utils/color';
import { getFontSize } from '@/utils/font';

interface OTPInputProps {
    length: number;
    value: string;
    onChange: (value: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ length, value, onChange }) => {
    const inputRefs = useRef<TextInput[]>([]);
    const [inputValues, setInputValues] = useState<string[]>(Array(length).fill(''));

    const handleChange = (text: string, index: number) => {
        const newInputValues = [...inputValues];
        newInputValues[index] = text;
        setInputValues(newInputValues);

        const newValue = newInputValues.join('');
        onChange(newValue);

        // Move to next input if current input is filled
        if (text.length === 1 && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (event: any, index: number) => {
        // Move to previous input on backspace if current input is empty
        if (event.nativeEvent.key === 'Backspace' && index > 0 && !inputValues[index]) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <View className="flex-row justify-between w-full">
            {Array(length).fill(0).map((_, index) => (
                <TextInput
                    key={index}
                    ref={ref => {
                        if (ref) inputRefs.current[index] = ref;
                    }}
                    className="w-12 h-12 border-[1px] rounded-lg text-center text-gray-900 bg-white"
                    style={{
                        fontSize: getFontSize(18),
                        borderColor: colors.primary.dark
                    }}
                    maxLength={1}
                    keyboardType="numeric"
                    value={inputValues[index]}
                    onChangeText={text => handleChange(text, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                />
            ))}
        </View>
    );
};

export default OTPInput;