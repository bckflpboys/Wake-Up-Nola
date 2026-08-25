/**
 * Input Component - Atom
 * Styled text input for modern light theme
 */

import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
}

export const Input = ({
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    secureTextEntry,
    ...props
}: InputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(secureTextEntry);

    const hasError = !!error;

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, hasError && styles.labelError]}>
                    {label}
                </Text>
            )}

            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputFocused,
                    hasError && styles.inputError,
                ]}
            >
                {leftIcon && (
                    <Ionicons
                        name={leftIcon}
                        size={18}
                        color={hasError ? colors.error.main : isFocused ? colors.primary[600] : colors.slate[400]}
                        style={styles.leftIcon}
                    />
                )}

                <TextInput
                    style={[
                        styles.input,
                        leftIcon && styles.inputWithLeftIcon,
                        (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
                    ]}
                    placeholderTextColor={colors.slate[400]}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={isSecure}
                    {...props}
                />

                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setIsSecure(!isSecure)}
                        style={styles.rightIconButton}
                    >
                        <Ionicons
                            name={isSecure ? 'eye-outline' : 'eye-off-outline'}
                            size={18}
                            color={colors.slate[400]}
                        />
                    </TouchableOpacity>
                )}

                {rightIcon && !secureTextEntry && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        style={styles.rightIconButton}
                        disabled={!onRightIconPress}
                    >
                        <Ionicons
                            name={rightIcon}
                            size={18}
                            color={colors.slate[400]}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color={colors.error.main} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {hint && !error && (
                <Text style={styles.hintText}>{hint}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    labelError: {
        color: colors.error.main,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: colors.slate[200],
        borderRadius: borderRadius.lg,
        ...shadows.subtle,
    },
    inputFocused: {
        borderColor: colors.primary[500],
        backgroundColor: '#FFFFFF',
    },
    inputError: {
        borderColor: colors.error.main,
        backgroundColor: colors.error.light,
    },
    input: {
        flex: 1,
        paddingVertical: spacing.sm + 4,
        paddingHorizontal: spacing.md,
        fontSize: typography.fontSize.sm,
        color: colors.text.primary,
    },
    inputWithLeftIcon: {
        paddingLeft: spacing.xs,
    },
    inputWithRightIcon: {
        paddingRight: spacing.xs,
    },
    leftIcon: {
        marginLeft: spacing.md,
    },
    rightIconButton: {
        padding: spacing.sm,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    errorText: {
        fontSize: typography.fontSize.xs,
        color: colors.error.main,
        marginLeft: spacing.xs,
    },
    hintText: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[500],
        marginTop: spacing.xs,
    },
});

export default Input;
