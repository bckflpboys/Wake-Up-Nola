/**
 * SplashScreen - Interactive Live WebGL Stitched Embroidery
 * Minimalist, immersive full-screen presentation with a sleek WAKE UP NOLA loading bar.
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
    statusMessage = 'INITIALIZING ON-DEVICE SLM',
    isReady = false,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fade in container
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        // Smooth progress bar filling over 4.8s
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 4800,
            useNativeDriver: false,
        }).start();

        // Fallback auto-transition after 5.4s
        const timer = setTimeout(() => {
            handleComplete();
        }, 5400);

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

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* 1. Full-screen Live WebGL Canvas */}
            <TouchableOpacity
                activeOpacity={1}
                onPress={handleComplete}
                style={styles.webglWrapper}
            >
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
            </TouchableOpacity>

            {/* 2. Sleek WAKE UP NOLA Loading Bar (No Card Box) */}
            <View style={styles.loadingBarContainer}>
                <View style={styles.loadingHeaderRow}>
                    <View style={styles.brandRow}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.brandLabel}>WAKE UP NOLA</Text>
                    </View>
                    <Text style={styles.statusLabel}>GEMMA 4 READY</Text>
                </View>

                {/* Loading Track */}
                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
                </View>
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
    loadingBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: spacing['2xl'],
        paddingBottom: Platform.OS === 'ios' ? spacing['3xl'] : spacing.xl,
        alignItems: 'center',
    },
    loadingHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 320,
        marginBottom: 8,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary[500],
    },
    brandLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: 1.2,
    },
    statusLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: colors.primary[600],
        letterSpacing: 0.8,
    },
    progressTrack: {
        width: '100%',
        maxWidth: 320,
        height: 3.5,
        borderRadius: 2,
        backgroundColor: 'rgba(2, 132, 199, 0.15)',
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
        backgroundColor: colors.primary[500],
        ...shadows.glowBlue,
    },
});

export default SplashScreen;
