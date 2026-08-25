/**
 * StatCard Component - Molecule
 * Dashboard statistic display card
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows, spacing, typography } from '../../theme';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: keyof typeof Ionicons.glyphMap;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    variant?: 'default' | 'primary' | 'success' | 'warning';
    style?: ViewStyle;
}

export const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    variant = 'default',
    style,
}: StatCardProps) => {
    const getVariantColors = () => {
        switch (variant) {
            case 'primary':
                return {
                    gradient: colors.gradients.primary,
                    iconBg: 'rgba(255,255,255,0.2)',
                    textColor: '#FFFFFF',
                    subtitleColor: 'rgba(255,255,255,0.8)',
                };
            case 'success':
                return {
                    gradient: colors.gradients.success,
                    iconBg: 'rgba(255,255,255,0.2)',
                    textColor: '#FFFFFF',
                    subtitleColor: 'rgba(255,255,255,0.8)',
                };
            case 'warning':
                return {
                    gradient: [colors.warning.main, colors.warning.dark],
                    iconBg: 'rgba(255,255,255,0.2)',
                    textColor: '#FFFFFF',
                    subtitleColor: 'rgba(255,255,255,0.8)',
                };
            default:
                return {
                    gradient: null,
                    iconBg: colors.primary[50],
                    textColor: colors.slate[900],
                    subtitleColor: colors.slate[500],
                };
        }
    };

    const variantColors = getVariantColors();

    const content = (
        <>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: variantColors.iconBg }]}>
                    <Ionicons
                        name={icon}
                        size={22}
                        color={variant === 'default' ? colors.primary[500] : '#FFFFFF'}
                    />
                </View>
                {trend && (
                    <View style={[styles.trendContainer, trend.isPositive ? styles.trendPositive : styles.trendNegative]}>
                        <Ionicons
                            name={trend.isPositive ? 'trending-up' : 'trending-down'}
                            size={14}
                            color={trend.isPositive ? colors.success.dark : colors.error.dark}
                        />
                        <Text style={[styles.trendText, trend.isPositive ? styles.trendTextPositive : styles.trendTextNegative]}>
                            {trend.value}%
                        </Text>
                    </View>
                )}
            </View>

            <Text style={[styles.value, { color: variantColors.textColor }]}>
                {typeof value === 'number' ? value.toLocaleString() : value}
            </Text>

            <Text style={[styles.title, { color: variantColors.subtitleColor }]}>
                {title}
            </Text>

            {subtitle && (
                <Text style={[styles.subtitle, { color: variantColors.subtitleColor }]}>
                    {subtitle}
                </Text>
            )}
        </>
    );

    if (variantColors.gradient) {
        return (
            <LinearGradient
                colors={variantColors.gradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.container, style]}
            >
                {content}
            </LinearGradient>
        );
    }

    return (
        <View style={[styles.container, styles.defaultContainer, style]}>
            {content}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
        borderRadius: borderRadius['2xl'],
        minWidth: 160,
    },
    defaultContainer: {
        backgroundColor: colors.background.primary,
        ...shadows.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    trendPositive: {
        backgroundColor: colors.success.light,
    },
    trendNegative: {
        backgroundColor: colors.error.light,
    },
    trendText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
        marginLeft: 2,
    },
    trendTextPositive: {
        color: colors.success.dark,
    },
    trendTextNegative: {
        color: colors.error.dark,
    },
    value: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: '800',
        marginBottom: spacing.xs,
    },
    title: {
        fontSize: typography.fontSize.sm,
        fontWeight: '500',
    },
    subtitle: {
        fontSize: typography.fontSize.xs,
        marginTop: spacing.xs,
    },
});

export default StatCard;
