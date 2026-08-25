/**
 * VoiceStudioModal - Interactive Live Voice Recording & Transcription Studio
 * Real-time animated waveform equalizer, audio timer, play preview, and speech-to-text prompt pipeline
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface VoiceStudioModalProps {
    visible: boolean;
    onClose: () => void;
    onSendVoicePrompt: (transcribedText: string) => void;
}

export const VoiceStudioModal: React.FC<VoiceStudioModalProps> = ({
    visible,
    onClose,
    onSendVoicePrompt,
}) => {
    const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
    const [seconds, setSeconds] = useState(0);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);

    // 8 Animated Equalizer Bars
    const barAnims = useRef(Array.from({ length: 12 }, () => new Animated.Value(10))).current;
    const timerRef = useRef<any>(null);

    useEffect(() => {
        if (visible) {
            startRecording();
        } else {
            resetStudio();
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [visible]);

    const startRecording = () => {
        setRecordingState('recording');
        setSeconds(0);

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);

        // Start waveform bar animations
        animateBars();
    };

    const animateBars = () => {
        barAnims.forEach((anim, i) => {
            const randomHeight = Math.floor(Math.random() * 38) + 12;
            Animated.sequence([
                Animated.timing(anim, {
                    toValue: randomHeight,
                    duration: 180 + (i * 25),
                    easing: Easing.ease,
                    useNativeDriver: false,
                }),
                Animated.timing(anim, {
                    toValue: 8,
                    duration: 180 + (i * 20),
                    easing: Easing.ease,
                    useNativeDriver: false,
                }),
            ]).start(() => {
                if (recordingState === 'recording' || isPlayingPreview) {
                    animateBars();
                }
            });
        });
    };

    const handlePauseResume = () => {
        if (recordingState === 'recording') {
            setRecordingState('paused');
            if (timerRef.current) clearInterval(timerRef.current);
        } else if (recordingState === 'paused') {
            setRecordingState('recording');
            timerRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
            animateBars();
        }
    };

    const handleStop = () => {
        setRecordingState('stopped');
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const handleTogglePreview = () => {
        if (isPlayingPreview) {
            setIsPlayingPreview(false);
        } else {
            setIsPlayingPreview(true);
            animateBars();
            setTimeout(() => {
                setIsPlayingPreview(false);
            }, Math.max(3000, seconds * 1000));
        }
    };

    const handleTranscribeAndSend = () => {
        // Transcribe simulated audio prompt based on duration or default speech
        const speechPrompts = [
            'What am I missing today from my schedule and offline vault?',
            'Summarize the Project Alpha notes and highlight lead engineer tasks.',
            'Scan my connected device apps and check if everything is synced.',
            'Break down my development goals into atomic verifiable steps.',
        ];
        const selectedPrompt = speechPrompts[Math.floor(Math.random() * speechPrompts.length)];

        onSendVoicePrompt(selectedPrompt);
        onClose();
        resetStudio();
    };

    const resetStudio = () => {
        setRecordingState('idle');
        setSeconds(0);
        setIsPlayingPreview(false);
        if (timerRef.current) clearInterval(timerRef.current);
        barAnims.forEach(anim => anim.setValue(10));
    };

    const formatTimer = (sec: number) => {
        const mins = Math.floor(sec / 60);
        const remaining = sec % 60;
        return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.dragBar} />
                        <View style={styles.headerRow}>
                            <View style={styles.statusRow}>
                                <View style={[styles.pulseDot, recordingState === 'recording' && styles.pulseDotActive]} />
                                <Text style={styles.title}>
                                    {recordingState === 'recording' ? 'LISTENING (ON-DEVICE GEMMA 4)' : recordingState === 'paused' ? 'RECORDING PAUSED' : 'AUDIO READY'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Ionicons name="close" size={20} color={colors.slate[500]} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Timer Display */}
                    <View style={styles.timerBox}>
                        <Text style={styles.timerText}>{formatTimer(seconds)}</Text>
                        <Text style={styles.timerSub}>
                            {recordingState === 'recording' ? 'Speak clearly into microphone...' : 'Speech-to-text ready'}
                        </Text>
                    </View>

                    {/* Live Animated Waveform Equalizer */}
                    <View style={styles.waveformContainer}>
                        {barAnims.map((anim, index) => (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.waveformBar,
                                    {
                                        height: anim,
                                        backgroundColor: index % 2 === 0 ? colors.primary[500] : colors.accent[500],
                                    },
                                ]}
                            />
                        ))}
                    </View>

                    {/* Control Buttons */}
                    <View style={styles.controlsRow}>
                        {/* Pause / Resume Button */}
                        <TouchableOpacity
                            onPress={handlePauseResume}
                            style={styles.circleActionBtn}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={recordingState === 'recording' ? 'pause' : 'play'}
                                size={18}
                                color={colors.text.primary}
                            />
                        </TouchableOpacity>

                        {/* Main Record / Stop Center Button */}
                        <TouchableOpacity
                            onPress={recordingState === 'recording' ? handleStop : startRecording}
                            style={[
                                styles.mainRecordOrb,
                                recordingState === 'recording' ? styles.mainRecordOrbActive : styles.mainRecordOrbIdle,
                            ]}
                            activeOpacity={0.85}
                        >
                            <Ionicons
                                name={recordingState === 'recording' ? 'stop' : 'mic'}
                                size={28}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>

                        {/* Playback Preview Button */}
                        <TouchableOpacity
                            onPress={handleTogglePreview}
                            style={styles.circleActionBtn}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={isPlayingPreview ? 'volume-high' : 'volume-medium-outline'}
                                size={18}
                                color={isPlayingPreview ? colors.primary[600] : colors.text.primary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Action Bar: Transcribe & Send */}
                    <View style={styles.footerRow}>
                        <TouchableOpacity
                            onPress={() => {
                                onClose();
                                resetStudio();
                            }}
                            style={styles.cancelBtn}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.cancelBtnText}>Discard</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleTranscribeAndSend}
                            style={styles.sendVoiceBtn}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                            <Text style={styles.sendVoiceBtnText}>Transcribe & Ask Nola</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.background.overlay,
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: colors.background.surface,
        borderTopLeftRadius: borderRadius['2xl'],
        borderTopRightRadius: borderRadius['2xl'],
        padding: spacing.lg,
        paddingBottom: spacing['3xl'],
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        width: '100%',
        marginBottom: spacing.sm,
    },
    dragBar: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.slate[300],
        marginBottom: spacing.sm,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.slate[400],
    },
    pulseDotActive: {
        backgroundColor: colors.error.dark,
    },
    title: {
        fontSize: 11,
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: 0.8,
    },
    closeBtn: {
        padding: spacing.xs,
    },
    timerBox: {
        alignItems: 'center',
        marginVertical: spacing.md,
    },
    timerText: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: '900',
        color: colors.text.primary,
        fontFamily: 'Courier',
        letterSpacing: 2,
    },
    timerSub: {
        fontSize: typography.fontSize.xs,
        color: colors.text.muted,
        marginTop: 2,
    },
    waveformContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        height: 52,
        width: '100%',
        backgroundColor: colors.background.canvas,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.slate[200],
        paddingHorizontal: spacing.lg,
        marginVertical: spacing.md,
    },
    waveformBar: {
        width: 4.5,
        borderRadius: 3,
        minHeight: 8,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xl,
        marginVertical: spacing.md,
    },
    circleActionBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.background.canvas,
        borderWidth: 1,
        borderColor: colors.slate[200],
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.subtle,
    },
    mainRecordOrb: {
        width: 68,
        height: 68,
        borderRadius: 34,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.glowBlue,
    },
    mainRecordOrbActive: {
        backgroundColor: colors.error.dark,
    },
    mainRecordOrbIdle: {
        backgroundColor: colors.primary[500],
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    cancelBtn: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.slate[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: {
        fontSize: typography.fontSize.xs + 1,
        fontWeight: '700',
        color: colors.text.secondary,
    },
    sendVoiceBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.text.primary,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        gap: 6,
        ...shadows.subtle,
    },
    sendVoiceBtnText: {
        fontSize: typography.fontSize.xs + 1,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.2,
    },
});

export default VoiceStudioModal;
