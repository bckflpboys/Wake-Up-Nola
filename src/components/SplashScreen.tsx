/**
 * SplashScreen - Interactive Live WebGL Stitched Embroidery
 * Rendered live with 3D satin-stitch lighting, dilated cloth silhouette,
 * merrowed border bead, and touch relighting.
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { generateEmbroideryHtml } from './embroidery/embroideryHtml';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

interface SplashScreenProps {
    onFinish: () => void;
    statusMessage?: string;
    isReady?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
    onFinish,
    statusMessage = 'Initializing on-device SLM weights...',
    isReady = false,
}) => {
    const [canEnter, setCanEnter] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCanEnter(true);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    const htmlContent = generateEmbroideryHtml();

    return (
        <View style={styles.container}>
            {/* 1. Live WebGL Embroidery Canvas */}
            <View style={styles.webglWrapper}>
                {Platform.OS === 'web' ? (
                    <iframe
                        srcDoc={htmlContent}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            backgroundColor: '#292133',
                        }}
                    />
                ) : (
                    <WebView
                        originWhitelist={['*']}
                        source={{ html: htmlContent }}
                        style={styles.webview}
                        scrollEnabled={false}
                        bounces={false}
                        overScrollMode="never"
                    />
                )}
            </View>

            {/* 2. Floating Bottom Action Card */}
            <View style={styles.bottomCardWrapper}>
                <View style={styles.bottomCard}>
                    <View style={styles.brandRow}>
                        <View style={styles.brandBadge}>
                            <Ionicons name="sparkles" size={14} color={colors.primary[500]} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.appTitle}>WAKE UP NOLA!</Text>
                            <Text style={styles.appSubtitle}>Offline-First Micro-Agent OS</Text>
                        </View>
                        <View style={styles.engineTag}>
                            <Text style={styles.engineText}>GEMMA 4</Text>
                        </View>
                    </View>

                    {/* Status & Entry CTA */}
                    <TouchableOpacity
                        onPress={onFinish}
                        style={styles.enterButton}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.enterBtnText}>
                            {canEnter ? 'Enter Workspace' : statusMessage}
                        </Text>
                        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                    </TouchableOpacity>

                    <Text style={styles.tipText}>
                        👆 Drag across the embroidered patches to relight stitches
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#292133',
    },
    webglWrapper: {
        flex: 1,
    },
    webview: {
        flex: 1,
        backgroundColor: '#292133',
    },
    bottomCardWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? spacing['3xl'] : spacing.xl,
    },
    bottomCard: {
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        borderRadius: borderRadius['2xl'],
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        padding: spacing.lg,
        ...shadows.float,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    brandBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(2, 132, 199, 0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    appTitle: {
        fontSize: typography.fontSize.sm + 1,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 1.2,
    },
    appSubtitle: {
        fontSize: 11,
        color: colors.slate[400],
        marginTop: 1,
    },
    engineTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 3,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.full,
    },
    engineText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#38BDF8',
        letterSpacing: 0.5,
    },
    enterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary[500],
        paddingVertical: spacing.md,
        borderRadius: borderRadius.xl,
        gap: spacing.xs,
        ...shadows.glowBlue,
    },
    enterBtnText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    tipText: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        marginTop: spacing.sm,
    },
});

export default SplashScreen;
