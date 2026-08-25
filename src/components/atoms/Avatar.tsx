/**
 * Avatar Component - Atom
 * User avatar with fallback initials
 */

import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, typography } from '../../theme';

interface AvatarProps {
    source?: any;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    style?: ViewStyle;
    showBorder?: boolean;
}

export const Avatar = ({
    source,
    name = '',
    size = 'md',
    style,
    showBorder = false,
}: AvatarProps) => {
    const sizes = {
        sm: 32,
        md: 40,
        lg: 56,
        xl: 80,
    };

    const fontSizes = {
        sm: typography.fontSize.xs,
        md: typography.fontSize.sm,
        lg: typography.fontSize.lg,
        xl: typography.fontSize['2xl'],
    };

    const avatarSize = sizes[size];

    const getInitials = (name: string) => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const containerStyle: ViewStyle = {
        width: avatarSize,
        height: avatarSize,
        borderRadius: avatarSize / 2,
        ...(showBorder && {
            borderWidth: 2,
            borderColor: '#FFFFFF',
        }),
    };

    if (source) {
        const imageSource = typeof source === 'string' ? { uri: source } : source;
        return (
            <View style={[containerStyle, styles.imageShadow, style]}>
                <Image
                    source={imageSource}
                    style={[styles.image, { borderRadius: avatarSize / 2 }]}
                />
            </View>
        );
    }

    return (
        <LinearGradient
            colors={colors.gradients.primary as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[containerStyle, styles.fallbackContainer, style]}
        >
            <Text style={[styles.initials, { fontSize: fontSizes[size] }]}>
                {getInitials(name)}
            </Text>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    imageShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    fallbackContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    initials: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
});

export default Avatar;
