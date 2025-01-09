import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import colors from "@/utils/color";
import { getFontSize } from "@/utils/font";

const countryCodes = [
    { label: 'India (+91)', value: '+91' },
    { label: 'USA (+1)', value: '+1' },
    { label: 'UK (+44)', value: '+44' },
    { label: 'Canada (+1)', value: '+1' },
    { label: 'Australia (+61)', value: '+61' },
    { label: 'China (+86)', value: '+86' },
    { label: 'Germany (+49)', value: '+49' },
    { label: 'France (+33)', value: '+33' },
];

const CountryCodeDropdown = ({ value, onChange }) => {
    const renderItem = item => {
        return (
            <View style={styles.item}>
                <Text style={styles.textItem}>{item.label}</Text>
            </View>
        );
    };

    return (
        <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={countryCodes}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Code"
            searchPlaceholder="Search country..."
            value={value}
            onChange={onChange}
            renderItem={renderItem}
        />
    );
};

export default CountryCodeDropdown;

const styles = StyleSheet.create({
    dropdown: {
        height: 50,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        width: 120,
        borderWidth: 1,
        borderColor: colors.grey[300],
    },
    item: {
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textItem: {
        fontSize: getFontSize(14),
        color: colors.grey[300],
    },
    placeholderStyle: {
        fontSize: getFontSize(14),
        color: colors.grey[500],
    },
    selectedTextStyle: {
        fontSize: getFontSize(14),
        color: colors.grey[700],
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: getFontSize(14),
    },
});