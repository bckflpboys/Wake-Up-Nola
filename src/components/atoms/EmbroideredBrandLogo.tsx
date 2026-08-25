/**
 * EmbroideredBrandLogo - Atom
 * High-fidelity replica of the Splash Screen WebGL Embroidered Patches:
 * - Word-shaped dilated cloth silhouettes
 * - Pure white merrowed border bead tracing the rims
 * - Dark satin lettering on top with thread depth
 * - Realistic contact drop shadows and organic overlap
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, {
    G,
    Path,
    Text as SvgText,
    Defs,
    LinearGradient,
    Stop,
    Filter,
    FeDropShadow,
    Rect,
} from 'react-native-svg';

interface EmbroideredBrandLogoProps {
    style?: ViewStyle;
    size?: 'sm' | 'md' | 'lg';
}

export const EmbroideredBrandLogo: React.FC<EmbroideredBrandLogoProps> = ({
    style,
    size = 'md',
}) => {
    const width = size === 'sm' ? 140 : size === 'lg' ? 200 : 172;
    const height = size === 'sm' ? 36 : size === 'lg' ? 52 : 44;

    return (
        <View style={[styles.container, style]}>
            <Svg width={width} height={height} viewBox="0 0 178 46">
                <Defs>
                    {/* Shadow for Patch 1 (Wake) */}
                    <Filter id="patchShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <FeDropShadow
                            dx="0"
                            dy="2.5"
                            stdDeviation="2"
                            floodColor="#0F172A"
                            floodOpacity="0.18"
                        />
                    </Filter>

                    {/* Gradient for "Wake" Cyan Cloth */}
                    <LinearGradient id="wakeCloth" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor="#72A8F2" />
                        <Stop offset="100%" stopColor="#4A88E0" />
                    </LinearGradient>

                    {/* Gradient for "Up" Golden Amber Cloth */}
                    <LinearGradient id="upCloth" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor="#F9D768" />
                        <Stop offset="100%" stopColor="#EBB832" />
                    </LinearGradient>

                    {/* Gradient for "Nola!" Rose/Violet Cloth */}
                    <LinearGradient id="nolaCloth" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor="#EFA8D8" />
                        <Stop offset="100%" stopColor="#D977B8" />
                    </LinearGradient>

                    {/* Satin Ink Gradient */}
                    <LinearGradient id="darkInk" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor="#181B26" />
                        <Stop offset="100%" stopColor="#0B0D14" />
                    </LinearGradient>
                </Defs>

                {/* === 1. "Wake" Patch (Dilated Cyan Silhouette + Merrowed Rim) === */}
                <G transform="rotate(-3.5 36 21)" filter="url(#patchShadow)">
                    {/* Dilated Cloth Silhouette */}
                    <Path
                        d="M 12 11 C 12 5, 60 5, 60 11 L 60 27 C 60 33, 12 33, 12 27 Z"
                        fill="url(#wakeCloth)"
                    />
                    {/* White Merrowed Border Bead */}
                    <Path
                        d="M 12 11 C 12 5, 60 5, 60 11 L 60 27 C 60 33, 12 33, 12 27 Z"
                        fill="none"
                        stroke="#FAFAFA"
                        strokeWidth="2.2"
                        strokeDasharray="3 1.2"
                    />
                    {/* Dark Satin Ink Lettering */}
                    <SvgText
                        x="36"
                        y="23"
                        fill="url(#darkInk)"
                        fontSize="13.5"
                        fontWeight="900"
                        letterSpacing="0.4"
                        textAnchor="middle"
                        fontFamily="System"
                    >
                        Wake
                    </SvgText>
                </G>

                {/* === 2. "Up" Patch (Dilated Golden Silhouette + Merrowed Rim) === */}
                <G transform="rotate(3 69 22)" filter="url(#patchShadow)">
                    {/* Dilated Cloth Silhouette */}
                    <Path
                        d="M 52 12 C 52 6, 86 6, 86 12 L 86 28 C 86 34, 52 34, 52 28 Z"
                        fill="url(#upCloth)"
                    />
                    {/* White Merrowed Border Bead */}
                    <Path
                        d="M 52 12 C 52 6, 86 6, 86 12 L 86 28 C 86 34, 52 34, 52 28 Z"
                        fill="none"
                        stroke="#FAFAFA"
                        strokeWidth="2.2"
                        strokeDasharray="3 1.2"
                    />
                    {/* Dark Satin Ink Lettering */}
                    <SvgText
                        x="69"
                        y="24"
                        fill="url(#darkInk)"
                        fontSize="13"
                        fontWeight="900"
                        letterSpacing="0.4"
                        textAnchor="middle"
                        fontFamily="System"
                    >
                        Up
                    </SvgText>
                </G>

                {/* === 3. "Nola!" Patch (Dilated Rose-Violet Silhouette + Merrowed Rim) === */}
                <G transform="rotate(-2 124 22)" filter="url(#patchShadow)">
                    {/* Dilated Cloth Silhouette */}
                    <Path
                        d="M 80 11 C 80 5, 168 5, 168 11 L 168 27 C 168 33, 80 33, 80 27 Z"
                        fill="url(#nolaCloth)"
                    />
                    {/* White Merrowed Border Bead */}
                    <Path
                        d="M 80 11 C 80 5, 168 5, 168 11 L 168 27 C 168 33, 80 33, 80 27 Z"
                        fill="none"
                        stroke="#FAFAFA"
                        strokeWidth="2.2"
                        strokeDasharray="3 1.2"
                    />
                    {/* Dark Satin Ink Lettering */}
                    <SvgText
                        x="124"
                        y="23"
                        fill="url(#darkInk)"
                        fontSize="13.5"
                        fontWeight="900"
                        letterSpacing="0.4"
                        textAnchor="middle"
                        fontFamily="System"
                    >
                        Nola!
                    </SvgText>
                </G>
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default EmbroideredBrandLogo;
