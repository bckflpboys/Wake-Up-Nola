/**
 * Custom Splash Screen Component
 * Shows Ticket Africa branding while app loads
 */

import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography } from '../theme';

const { width, height } = Dimensions.get('window');

export const CustomSplashScreen = () => {
    return (
        <LinearGradient
            colors={['#4F06F6', '#8F54FF']}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Logo */}
                <Image
                    source={require('../../assets/pulse-logo.jpeg')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                
                {/* App Name */}
                <Text style={styles.appName}>Ticket Africa</Text>
                <Text style={styles.subtitle}>Scanner</Text>
                
                {/* Loading indicator */}
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingDot} />
                    <View style={[styles.loadingDot, styles.loadingDotDelay1]} />
                    <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
                </View>
            </View>
            
            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Powering seamless event experiences</Text>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 32,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
    },
    appName: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    loadingContainer: {
        flexDirection: 'row',
        marginTop: 48,
        gap: 12,
    },
    loadingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    loadingDotDelay1: {
        opacity: 0.6,
    },
    loadingDotDelay2: {
        opacity: 0.4,
    },
    footer: {
        position: 'absolute',
        bottom: 48,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '500',
    },
});

export default CustomSplashScreen;
