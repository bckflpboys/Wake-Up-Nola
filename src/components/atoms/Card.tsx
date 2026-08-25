/**
 * Card Component - Atom
 * High contrast container card for dark cyberpunk theme
 */

import React, { ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '../../theme';

interface CardProps {
    children: ReactNode;
    onPress?: () => void;
    variant?: 'default' | 'elevated' | 'outlined' | 'glowViolet' | 'glowCyan' | 'glowAmber';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    style?: ViewStyle;
}

export const Card = ({
    children,
    onPress,
    variant = 'default',
    padding = 'md',
    style,
}: CardProps) => {
    const paddingStyles = {
        none: 0,
        sm: spacing.sm,
        md: spacing.lg,
        lg: spacing['2xl'],
    };

    const getVariantStyles = (): ViewStyle => {
        switch (variant) {
            case 'elevated':
                return {
                    ...shadows.lg,
                    backgroundColor: colors.background.card,
                    borderWidth: 1,
                    borderColor: colors.slate[800],
                };
            case 'outlined':
                return {
                    borderWidth: 1,
                    borderColor: colors.slate[700],
                    backgroundColor: colors.background.secondary,
                };
            case 'glowViolet':
                return {
                    ...shadows.glowViolet,
                    backgroundColor: colors.background.card,
                    borderWidth: 1,
                    borderColor: colors.primary[700],
                };
            case 'glowCyan':
                return {
                    ...shadows.glowCyan,
                    backgroundColor: colors.background.card,
                    borderWidth: 1,
                    borderColor: colors.accent[600],
                };
            case 'glowAmber':
                return {
                    ...shadows.glowAmber,
                    backgroundColor: colors.background.card,
                    borderWidth: 1,
                    borderColor: colors.standby[600],
                };
            default:
                return {
                    ...shadows.sm,
                    backgroundColor: colors.background.card,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.07)',
                };
        }
    };

    const cardStyle: ViewStyle = {
        ...styles.base,
        ...getVariantStyles(),
        padding: paddingStyles[padding],
    };

    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                style={[cardStyle, style]}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <View style={[cardStyle, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
    },
});

export default Card;
