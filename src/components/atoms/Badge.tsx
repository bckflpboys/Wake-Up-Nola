/**
 * Badge Component - Atom
 * Status badges for models, tasks, offline mode, and standby
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../theme';

interface BadgeProps {
    label: string;
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'primary' | 'accent' | 'standby' | 'dark';
    size?: 'sm' | 'md';
    style?: ViewStyle;
}

export const Badge = ({
    label,
    variant = 'default',
    size = 'md',
    style,
}: BadgeProps) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'success':
                return {
                    container: { backgroundColor: 'rgba(5, 150, 105, 0.1)', borderColor: 'rgba(5, 150, 105, 0.3)', borderWidth: 1 },
                    text: { color: colors.success.dark },
                };
            case 'error':
                return {
                    container: { backgroundColor: 'rgba(225, 29, 72, 0.1)', borderColor: 'rgba(225, 29, 72, 0.3)', borderWidth: 1 },
                    text: { color: colors.error.dark },
                };
            case 'warning':
                return {
                    container: { backgroundColor: 'rgba(217, 119, 6, 0.1)', borderColor: 'rgba(217, 119, 6, 0.3)', borderWidth: 1 },
                    text: { color: colors.warning.dark },
                };
            case 'info':
                return {
                    container: { backgroundColor: 'rgba(2, 132, 199, 0.1)', borderColor: 'rgba(2, 132, 199, 0.3)', borderWidth: 1 },
                    text: { color: colors.primary[700] },
                };
            case 'primary':
                return {
                    container: { backgroundColor: 'rgba(2, 132, 199, 0.12)', borderColor: 'rgba(2, 132, 199, 0.3)', borderWidth: 1 },
                    text: { color: colors.primary[700] },
                };
            case 'accent':
                return {
                    container: { backgroundColor: 'rgba(13, 148, 136, 0.12)', borderColor: 'rgba(13, 148, 136, 0.3)', borderWidth: 1 },
                    text: { color: colors.accent[700] },
                };
            case 'standby':
                return {
                    container: { backgroundColor: 'rgba(217, 119, 6, 0.12)', borderColor: 'rgba(217, 119, 6, 0.3)', borderWidth: 1 },
                    text: { color: colors.standby[700] },
                };
            case 'dark':
                return {
                    container: { backgroundColor: colors.text.primary },
                    text: { color: '#FFFFFF' },
                };
            default:
                return {
                    container: { backgroundColor: colors.slate[100], borderColor: colors.slate[200], borderWidth: 1 },
                    text: { color: colors.text.secondary },
                };
        }
    };

    const variantStyles = getVariantStyles();

    return (
        <View
            style={[
                styles.container,
                variantStyles.container,
                size === 'sm' && styles.containerSm,
                style,
            ]}
        >
            <Text
                style={[
                    styles.text,
                    variantStyles.text,
                    size === 'sm' && styles.textSm,
                ]}
            >
                {label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: 3,
        borderRadius: borderRadius.full,
        alignSelf: 'flex-start',
    },
    containerSm: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
    },
    text: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    textSm: {
        fontSize: 10,
    },
});

export default Badge;
