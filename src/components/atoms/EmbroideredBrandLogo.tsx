/**
 * EmbroideredBrandLogo - Atom
 * Navbar brand logo designed in the style of the splash screen embroidered patches.
 * Features 3 overlapping word patches (Wake, Up, Nola!) with satin-stitch styling and merrowed borders.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, typography, shadows } from '../../theme';

interface EmbroideredBrandLogoProps {
    style?: ViewStyle;
    size?: 'sm' | 'md' | 'lg';
}

export const EmbroideredBrandLogo: React.FC<EmbroideredBrandLogoProps> = ({
    style,
    size = 'md',
}) => {
    const isSm = size === 'sm';
    const isLg = size === 'lg';

    const fontSize = isSm ? 9 : isLg ? 13 : 10.5;
    const paddingH = isSm ? 5 : isLg ? 8 : 6.5;
    const paddingV = isSm ? 2 : isLg ? 4 : 2.5;

    return (
        <View style={[styles.container, style]}>
            {/* 1. "Wake" Patch - Electric Blue */}
            <View
                style={[
                    styles.patch,
                    styles.wakePatch,
                    { paddingHorizontal: paddingH, paddingVertical: paddingV, transform: [{ rotate: '-3deg' }] },
                ]}
            >
                <Text style={[styles.patchText, { fontSize }]}>WAKE</Text>
            </View>

            {/* 2. "Up" Patch - Warm Golden Amber */}
            <View
                style={[
                    styles.patch,
                    styles.upPatch,
                    { paddingHorizontal: paddingH, paddingVertical: paddingV, transform: [{ rotate: '2.5deg' }], marginLeft: -3 },
                ]}
            >
                <Text style={[styles.patchText, { fontSize }]}>UP</Text>
            </View>

            {/* 3. "Nola!" Patch - Vibrant Mint Teal */}
            <View
                style={[
                    styles.patch,
                    styles.nolaPatch,
                    { paddingHorizontal: paddingH, paddingVertical: paddingV, transform: [{ rotate: '-2deg' }], marginLeft: -3 },
                ]}
            >
                <Text style={[styles.patchText, { fontSize }]}>NOLA!</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    patch: {
        borderRadius: borderRadius.md,
        borderWidth: 1.2,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.subtle,
    },
    wakePatch: {
        backgroundColor: '#0284C7', // Electric Ocean Cyan
        borderColor: '#0369A1',     // Merrowed rim
        zIndex: 3,
    },
    upPatch: {
        backgroundColor: '#D97706', // Golden Amber
        borderColor: '#B45309',     // Merrowed rim
        zIndex: 2,
    },
    nolaPatch: {
        backgroundColor: '#0D9488', // Mint Teal
        borderColor: '#0F766E',     // Merrowed rim
        zIndex: 1,
    },
    patchText: {
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 0.6,
    },
});

export default EmbroideredBrandLogo;
