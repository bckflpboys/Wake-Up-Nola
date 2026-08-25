/**
 * Button Component - Atom
 * Premium button with multiple variants and states for modern light UI
 */

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors, borderRadius, shadows, typography, spacing } from '../../theme';

interface ButtonProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'dark';
    size?: 'sm' | 'md' | 'lg';
    onPress?: () => void;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    style?: ViewStyle;
}

export const Button = ({
    label,
    variant = 'primary',
    size = 'md',
    onPress,
    disabled = false,
    loading = false,
    fullWidth = true,
    icon,
    iconPosition = 'left',
    style,
}: ButtonProps) => {
    const isDisabled = disabled || loading;

    const sizeStyles = {
        sm: { paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md },
        md: { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.xl },
        lg: { paddingVertical: spacing.md, paddingHorizontal: spacing['2xl'] },
    };

    const textSizes = {
        sm: typography.fontSize.xs,
        md: typography.fontSize.sm,
        lg: typography.fontSize.base,
    };

    const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
        switch (variant) {
            case 'secondary':
                return {
                    container: styles.secondaryContainer,
                    text: styles.secondaryText,
                };
            case 'dark':
                return {
                    container: styles.darkContainer,
                    text: styles.darkText,
                };
            case 'outline':
                return {
                    container: styles.outlineContainer,
                    text: styles.outlineText,
                };
            case 'ghost':
                return {
                    container: styles.ghostContainer,
                    text: styles.ghostText,
                };
            case 'danger':
                return {
                    container: styles.dangerContainer,
                    text: styles.dangerText,
                };
            case 'success':
                return {
                    container: styles.successContainer,
                    text: styles.successText,
                };
            default:
                return {
                    container: styles.primaryContainer,
                    text: styles.primaryText,
                };
        }
    };

    const variantStyles = getVariantStyles();

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
            style={[
                styles.baseContainer,
                variantStyles.container,
                sizeStyles[size],
                variant === 'primary' && shadows.glowBlue,
                variant === 'dark' && shadows.sm,
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabledContainer,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? colors.primary[500] : '#FFFFFF'}
                    size="small"
                />
            ) : (
                <>
                    {icon && iconPosition === 'left' && icon}
                    <Text
                        style={[
                            styles.baseText,
                            variantStyles.text,
                            { fontSize: textSizes[size] },
                            (icon && iconPosition === 'left' ? { marginLeft: spacing.sm } : undefined),
                            (icon && iconPosition === 'right' ? { marginRight: spacing.sm } : undefined),
                            isDisabled && styles.disabledText,
                        ]}
                    >
                        {label}
                    </Text>
                    {icon && iconPosition === 'right' && icon}
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    baseContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.lg,
    },
    fullWidth: {
        width: '100%',
    },
    baseText: {
        fontWeight: '700',
        textAlign: 'center',
    },

    // Primary
    primaryContainer: {
        backgroundColor: colors.primary[500],
    },
    primaryText: {
        color: '#FFFFFF',
    },

    // Dark
    darkContainer: {
        backgroundColor: colors.text.primary,
    },
    darkText: {
        color: '#FFFFFF',
    },

    // Secondary
    secondaryContainer: {
        backgroundColor: colors.slate[100],
        borderWidth: 1,
        borderColor: colors.slate[200],
    },
    secondaryText: {
        color: colors.text.primary,
    },

    // Outline
    outlineContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: colors.slate[200],
    },
    outlineText: {
        color: colors.text.primary,
    },

    // Ghost
    ghostContainer: {
        backgroundColor: 'transparent',
    },
    ghostText: {
        color: colors.primary[600],
    },

    // Danger
    dangerContainer: {
        backgroundColor: colors.error.main,
    },
    dangerText: {
        color: '#FFFFFF',
    },

    // Success
    successContainer: {
        backgroundColor: colors.success.main,
    },
    successText: {
        color: '#FFFFFF',
    },

    // Disabled
    disabledContainer: {
        opacity: 0.5,
    },
    disabledText: {
        opacity: 0.7,
    },
});

export default Button;
