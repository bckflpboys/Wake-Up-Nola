/**
 * ScannerView Component - Organism
 * Full-screen camera scanner with feedback overlay
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    Vibration,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../atoms/Button';
import { colors, borderRadius, typography, spacing } from '../../theme';

interface ScannerViewProps {
    onScan: (data: string) => void;
    onClose: () => void;
    scanStatus: 'idle' | 'success' | 'error' | 'duplicate';
    feedbackMessage?: string;
    eventName?: string;
}

const { width, height } = Dimensions.get('window');
const SCAN_SIZE = 280;

export const ScannerView = ({
    onScan,
    onClose,
    scanStatus,
    feedbackMessage,
    eventName,
}: ScannerViewProps) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [isScanningDisabled, setIsScanningDisabled] = useState(false);
    const [pulseAnim] = useState(new Animated.Value(1));
    const [flashAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        // Pulse animation for scan frame
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        if (scanStatus !== 'idle') {
            setIsScanningDisabled(true);

            // Vibrate on scan result
            Vibration.vibrate(scanStatus === 'success' ? [0, 100] : [0, 50, 50, 50]);

            // Flash effect
            Animated.sequence([
                Animated.timing(flashAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(flashAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
            
            // Keep scanning disabled for 3 seconds to prevent double scans
            const timer = setTimeout(() => {
                setIsScanningDisabled(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [scanStatus]);

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <LinearGradient
                colors={colors.gradients.dark as [string, string, ...string[]]}
                style={styles.permissionContainer}
            >
                <View style={styles.permissionIconContainer}>
                    <Ionicons name="camera-outline" size={64} color={colors.slate[400]} />
                </View>
                <Text style={styles.permissionTitle}>Camera Access Required</Text>
                <Text style={styles.permissionText}>
                    We need your permission to use the camera to scan ticket QR codes
                </Text>
                <View style={styles.permissionButtons}>
                    <Button
                        label="Grant Permission"
                        variant="primary"
                        onPress={requestPermission}
                        icon={<Ionicons name="camera" size={20} color="#FFFFFF" />}
                    />
                    <Button
                        label="Cancel"
                        variant="ghost"
                        onPress={onClose}
                        style={{ marginTop: spacing.sm }}
                    />
                </View>
            </LinearGradient>
        );
    }

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (!isScanningDisabled && scanStatus === 'idle') {
            onScan(data);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={handleBarcodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />

            {/* Dark overlay with transparent center */}
            <View style={styles.overlay}>
                {/* Top section */}
                <View style={styles.overlayTop}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                        {eventName && (
                            <View style={styles.eventBadge}>
                                <Ionicons name="calendar" size={14} color="#FFFFFF" />
                                <Text style={styles.eventName} numberOfLines={1}>
                                    {eventName}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Center section with scan frame */}
                <View style={styles.overlayCenter}>
                    <View style={styles.overlaySide} />
                    <Animated.View
                        style={[
                            styles.scanFrame,
                            { transform: [{ scale: pulseAnim }] }
                        ]}
                    >
                        {/* Corner decorations */}
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />

                        {/* Scanning line animation */}
                        <View style={styles.scanLine} />
                    </Animated.View>
                    <View style={styles.overlaySide} />
                </View>

                {/* Bottom section */}
                <View style={styles.overlayBottom}>
                    <View style={styles.tipContainer}>
                        <Ionicons name="qr-code" size={20} color="#FFFFFF" />
                        <Text style={styles.tipText}>Align QR code within frame</Text>
                    </View>
                </View>
            </View>

            {/* Flash overlay */}
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.flashOverlay,
                    {
                        opacity: flashAnim,
                        backgroundColor: scanStatus === 'success'
                            ? 'rgba(34, 197, 94, 0.3)'
                            : (scanStatus === 'duplicate' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)')
                    }
                ]}
            />

            {/* Status Feedback Overlay */}
            {scanStatus !== 'idle' && (
                <View style={styles.feedbackOverlay}>
                    <View
                        style={[
                            styles.feedbackBox,
                            scanStatus === 'success'
                                ? styles.feedbackSuccess
                                : scanStatus === 'duplicate'
                                    ? styles.feedbackWarning
                                    : styles.feedbackError
                        ]}
                    >
                        <View style={styles.feedbackIconContainer}>
                            <Ionicons
                                name={
                                    scanStatus === 'success'
                                        ? 'checkmark'
                                        : scanStatus === 'duplicate'
                                            ? 'warning'
                                            : 'close'
                                }
                                size={48}
                                color="#FFFFFF"
                            />
                        </View>
                        <Text style={styles.feedbackTitle}>
                            {scanStatus === 'success'
                                ? 'Valid Ticket!'
                                : scanStatus === 'duplicate'
                                    ? 'Already Scanned'
                                    : 'Invalid'}
                        </Text>
                        <Text style={styles.feedbackMessage}>
                            {feedbackMessage}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },

    // Permission screen
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing['2xl'],
    },
    permissionIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    permissionTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    permissionText: {
        fontSize: typography.fontSize.base,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: spacing['2xl'],
    },
    permissionButtons: {
        width: '100%',
    },

    // Overlay
    overlay: {
        flex: 1,
    },
    overlayTop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    overlayCenter: {
        flexDirection: 'row',
        height: SCAN_SIZE,
    },
    overlaySide: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    overlayBottom: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center',
        paddingTop: spacing['3xl'],
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: spacing.xl,
    },
    closeButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        maxWidth: 200,
    },
    eventName: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.sm,
        fontWeight: '500',
        marginLeft: spacing.xs,
    },

    // Scan frame
    scanFrame: {
        width: SCAN_SIZE,
        height: SCAN_SIZE,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: colors.primary[500],
        borderWidth: 4,
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: borderRadius['2xl'],
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: borderRadius['2xl'],
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: borderRadius['2xl'],
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: borderRadius['2xl'],
    },
    scanLine: {
        position: 'absolute',
        top: '50%',
        left: 20,
        right: 20,
        height: 2,
        backgroundColor: colors.primary[400],
        opacity: 0.8,
    },

    // Tip
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.full,
    },
    tipText: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.base,
        fontWeight: '500',
        marginLeft: spacing.sm,
    },

    // Flash overlay
    flashOverlay: {
        ...StyleSheet.absoluteFillObject,
    },

    // Feedback overlay
    feedbackOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing['2xl'],
    },
    feedbackBox: {
        width: '100%',
        padding: spacing['2xl'],
        borderRadius: borderRadius['2xl'],
        alignItems: 'center',
    },
    feedbackSuccess: {
        backgroundColor: colors.success.main,
    },
    feedbackError: {
        backgroundColor: colors.error.main,
    },
    feedbackWarning: {
        backgroundColor: colors.warning.main,
    },
    feedbackIconContainer: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    feedbackTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: spacing.sm,
    },
    feedbackMessage: {
        fontSize: typography.fontSize.lg,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 26,
    },
});

export default ScannerView;
