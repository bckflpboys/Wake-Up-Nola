/**
 * Card Component - Atom
 * High contrast container card for modern light aesthetic
 */

import React, { ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '../../theme';

interface CardProps {
    children: ReactNode;
    onPress?: () => void;
    variant?: 'default' | 'elevated' | 'outlined' | 'glowBlue' | 'glowAmber' | 'glowTeal';
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
        md: spacing.md,
        lg: spacing.lg,
    };

    const getVariantStyles = (): ViewStyle => {
        switch (variant) {
            case 'elevated':
                return {
                    ...shadows.lg,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: 'rgba(15, 23, 42, 0.06)',
                };
            case 'outlined':
                return {
                    borderWidth: 1,
                    borderColor: colors.slate[200],
                    backgroundColor: '#FFFFFF',
                };
            case 'glowBlue':
                return {
                    ...shadows.glowBlue,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: 'rgba(2, 132, 199, 0.3)',
                };
            case 'glowAmber':
                return {
                    ...shadows.sm,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: 'rgba(217, 119, 6, 0.35)',
                };
            case 'glowTeal':
                return {
                    ...shadows.sm,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: 'rgba(13, 148, 136, 0.35)',
                };
            default:
                return {
                    ...shadows.subtle,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: 'rgba(15, 23, 42, 0.08)',
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
