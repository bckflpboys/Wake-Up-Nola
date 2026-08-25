/**
 * Wake Up Nola - PulseWakeButton
 * Animated glowing standby wake button with ambient pulse effects
 */

import React, { useEffect, useRef } from 'react';
import {
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, typography, spacing } from '../../theme';

interface PulseWakeButtonProps {
    isStandby: boolean;
    isListening: boolean;
    isProcessing: boolean;
    onPress: () => void;
    onLongPress?: () => void;
}

export const PulseWakeButton: React.FC<PulseWakeButtonProps> = ({
    isStandby,
    isListening,
    isProcessing,
    onPress,
    onLongPress,
}) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isListening || isProcessing) {
            // Fast pulse when listening or processing
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.25,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else if (isStandby) {
            // Slow, calm ambient breathing pulse
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.12,
                        duration: 1800,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1800,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isStandby, isListening, isProcessing]);

    const getColors = (): readonly [string, string, ...string[]] => {
        if (isListening) return ['#06B6D4', '#3B82F6'] as const;
        if (isProcessing) return ['#8B5CF6', '#EC4899'] as const;
        if (isStandby) return ['#F59E0B', '#D97706'] as const;
        return ['#3B82F6', '#1D4ED8'] as const;
    };

    const getStatusText = () => {
        if (isListening) return 'Listening...';
        if (isProcessing) return 'Decomposing Task...';
        if (isStandby) return 'WAKE UP NOLA';
        return 'READY';
    };

    return (
        <View style={styles.wrapper}>
            {/* Outer Animated Glowing Rings */}
            <Animated.View
                style={[
                    styles.outerGlow,
                    {
                        transform: [{ scale: pulseAnim }],
                        borderColor: isListening
                            ? 'rgba(6, 182, 212, 0.4)'
                            : isProcessing
                            ? 'rgba(139, 92, 246, 0.4)'
                            : 'rgba(245, 158, 11, 0.35)',
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.middleGlow,
                    {
                        transform: [{ scale: pulseAnim }],
                        borderColor: isListening
                            ? 'rgba(6, 182, 212, 0.6)'
                            : isProcessing
                            ? 'rgba(139, 92, 246, 0.6)'
                            : 'rgba(245, 158, 11, 0.5)',
                    },
                ]}
            />

            {/* Core Interactive Touch Button */}
            <TouchableOpacity
                onPress={onPress}
                onLongPress={onLongPress}
                activeOpacity={0.85}
                style={styles.touchable}
            >
                <LinearGradient
                    colors={getColors()}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.coreButton}
                >
                    <Ionicons
                        name={
                            isListening
                                ? 'mic'
                                : isProcessing
                                ? 'hardware-chip-outline'
                                : 'radio-outline'
                        }
                        size={42}
                        color="#FFFFFF"
                    />
                    <Text style={styles.buttonLabel}>{getStatusText()}</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 240,
        height: 240,
        marginVertical: spacing.lg,
    },
    outerGlow: {
        position: 'absolute',
        width: 230,
        height: 230,
        borderRadius: 115,
        borderWidth: 2,
    },
    middleGlow: {
        position: 'absolute',
        width: 195,
        height: 195,
        borderRadius: 97.5,
        borderWidth: 3,
    },
    touchable: {
        width: 160,
        height: 160,
        borderRadius: 80,
        ...shadows.glowAmber,
    },
    coreButton: {
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
    },
    buttonLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: spacing.xs,
        letterSpacing: 1.2,
        textAlign: 'center',
    },
});

export default PulseWakeButton;
