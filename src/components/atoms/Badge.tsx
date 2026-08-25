/**
 * Badge Component - Atom
 * Status badges for models, tasks, offline mode, and standby
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../theme';

interface BadgeProps {
    label: string;
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'primary' | 'accent' | 'standby';
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
                    container: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: colors.success.main, borderWidth: 1 },
                    text: { color: colors.success.main },
                };
            case 'error':
                return {
                    container: { backgroundColor: 'rgba(244, 63, 94, 0.15)', borderColor: colors.error.main, borderWidth: 1 },
                    text: { color: colors.error.main },
                };
            case 'warning':
                return {
                    container: { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: colors.warning.main, borderWidth: 1 },
                    text: { color: colors.warning.main },
                };
            case 'info':
                return {
                    container: { backgroundColor: 'rgba(56, 189, 248, 0.15)', borderColor: colors.info.main, borderWidth: 1 },
                    text: { color: colors.info.main },
                };
            case 'primary':
                return {
                    container: { backgroundColor: 'rgba(139, 92, 246, 0.18)', borderColor: colors.primary[400], borderWidth: 1 },
                    text: { color: colors.primary[300] },
                };
            case 'accent':
                return {
                    container: { backgroundColor: 'rgba(6, 182, 212, 0.18)', borderColor: colors.accent[400], borderWidth: 1 },
                    text: { color: colors.accent[300] },
                };
            case 'standby':
                return {
                    container: { backgroundColor: 'rgba(245, 158, 11, 0.18)', borderColor: colors.standby[400], borderWidth: 1 },
                    text: { color: colors.standby[300] },
                };
            default:
                return {
                    container: { backgroundColor: colors.slate[800], borderColor: colors.slate[700], borderWidth: 1 },
                    text: { color: colors.slate[300] },
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
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: borderRadius.full,
        alignSelf: 'flex-start',
    },
    containerSm: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    text: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    textSm: {
        fontSize: typography.fontSize.xs,
    },
});

export default Badge;
