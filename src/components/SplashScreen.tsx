/**
 * SplashScreen - Interactive Live WebGL Stitched Embroidery
 * - Matches app's light-blue background (#F4F7FB)
 * - Self-drawing progressive stitching animation
 * - Automatically opens the Chat workspace upon completion
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Animated,
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
    statusMessage = 'Initializing offline models...',
    isReady = false,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();

        // Fallback auto-transition after 6.0 seconds (matches relaxed slow stitching animation)
        const timer = setTimeout(() => {
            handleComplete();
        }, 6000);

        return () => clearTimeout(timer);
    }, []);

    const handleComplete = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
        }).start(() => {
            onFinish();
        });
    };

    const handleWebViewMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'SPLASH_COMPLETE') {
                handleComplete();
            }
        } catch {
            // ignore
        }
    };

    const htmlContent = generateEmbroideryHtml();

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* 1. Live WebGL Self-Drawing Embroidery Canvas */}
            <View style={styles.webglWrapper}>
                {Platform.OS === 'web' ? (
                    <iframe
                        srcDoc={htmlContent}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            backgroundColor: '#F4F7FB',
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
                        onMessage={handleWebViewMessage}
                    />
                )}
            </View>

            {/* 2. Floating Bottom Pill */}
            <View style={styles.bottomCardWrapper}>
                <TouchableOpacity
                    onPress={handleComplete}
                    style={styles.bottomCard}
                    activeOpacity={0.85}
                >
                    <View style={styles.brandRow}>
                        <View style={styles.brandBadge}>
                            <Ionicons name="sparkles" size={14} color={colors.primary[500]} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.appTitle}>WAKE UP NOLA!</Text>
                            <Text style={styles.appSubtitle}>Offline Assistant • Gemma 4 Ready</Text>
                        </View>
                        <View style={styles.skipTag}>
                            <Text style={styles.skipText}>Enter</Text>
                            <Ionicons name="chevron-forward" size={12} color={colors.primary[600]} />
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.canvas,
    },
    webglWrapper: {
        flex: 1,
    },
    webview: {
        flex: 1,
        backgroundColor: colors.background.canvas,
    },
    bottomCardWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? spacing['3xl'] : spacing.xl,
        alignItems: 'center',
    },
    bottomCard: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: colors.background.surface,
        borderRadius: borderRadius['2xl'],
        borderWidth: 1,
        borderColor: colors.slate[200],
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        ...shadows.card,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    brandBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    appTitle: {
        fontSize: typography.fontSize.sm + 1,
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: 0.8,
    },
    appSubtitle: {
        fontSize: 11,
        color: colors.text.muted,
        marginTop: 1,
    },
    skipTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        paddingVertical: 5,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        gap: 3,
    },
    skipText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.primary[600],
    },
});

export default SplashScreen;
