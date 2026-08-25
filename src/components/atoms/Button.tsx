/**
 * Button Component - Atom
 * Premium button with multiple variants and states
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
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows, typography, spacing } from '../../theme';

interface ButtonProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
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
        sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
        md: { paddingVertical: spacing.md + 2, paddingHorizontal: spacing.xl },
        lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing['2xl'] },
    };

    const textSizes = {
        sm: typography.fontSize.sm,
        md: typography.fontSize.base,
        lg: typography.fontSize.lg,
    };

    const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
        switch (variant) {
            case 'secondary':
                return {
                    container: styles.secondaryContainer,
                    text: styles.secondaryText,
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
            case 'warning':
                return {
                    container: styles.warningContainer,
                    text: styles.warningText,
                };
            default:
                return {
                    container: styles.primaryContainer,
                    text: styles.primaryText,
                };
        }
    };

    const variantStyles = getVariantStyles();

    const content = (
        <>
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? colors.primary[500] : 'white'}
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
        </>
    );

    // Use gradient for primary variant
    if (variant === 'primary' && !isDisabled) {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.8}
                style={[fullWidth && styles.fullWidth, style]}
            >
                <LinearGradient
                    colors={colors.gradients.primary as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                        styles.baseContainer,
                        sizeStyles[size],
                        shadows.md,
                        isDisabled && styles.disabledContainer,
                    ]}
                >
                    {content}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
            style={[
                styles.baseContainer,
                variantStyles.container,
                sizeStyles[size],
                variant !== 'ghost' && shadows.sm,
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabledContainer,
                style,
            ]}
        >
            {content}
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
        fontWeight: '600',
        textAlign: 'center',
    },

    // Primary
    primaryContainer: {
        backgroundColor: colors.primary[500],
    },
    primaryText: {
        color: '#FFFFFF',
    },

    // Secondary
    secondaryContainer: {
        backgroundColor: colors.slate[100],
    },
    secondaryText: {
        color: colors.slate[700],
    },

    // Outline
    outlineContainer: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary[500],
    },
    outlineText: {
        color: colors.primary[500],
    },

    // Ghost
    ghostContainer: {
        backgroundColor: 'transparent',
    },
    ghostText: {
        color: colors.primary[500],
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

    // Warning
    warningContainer: {
        backgroundColor: colors.warning.main,
    },
    warningText: {
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
