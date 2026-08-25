/**
 * StepExecutionViewer - Molecule
 * Visualizes the micro-agent task decomposition steps in real-time
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InferenceStep } from '../../services/aiEngine';
import { colors, borderRadius, spacing, typography } from '../../theme';

interface StepExecutionViewerProps {
    steps: InferenceStep[];
    isProcessing?: boolean;
}

export const StepExecutionViewer: React.FC<StepExecutionViewerProps> = ({
    steps,
    isProcessing = false,
}) => {
    if (!steps || steps.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Ionicons name="git-network-outline" size={16} color={colors.accent[400]} />
                <Text style={styles.headerTitle}>Task Decomposition & Steps</Text>
                {isProcessing && (
                    <ActivityIndicator size="small" color={colors.accent[400]} style={styles.spinner} />
                )}
            </View>

            {steps.map((step, idx) => {
                const isComplete = step.status === 'complete';
                const isRunning = step.status === 'running';
                const isFailed = step.status === 'failed';

                return (
                    <View key={`step-${step.step}-${idx}`} style={styles.stepRow}>
                        {/* Status Icon */}
                        <View style={styles.iconColumn}>
                            {isComplete && (
                                <View style={[styles.statusCircle, styles.circleComplete]}>
                                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                                </View>
                            )}
                            {isRunning && (
                                <View style={[styles.statusCircle, styles.circleRunning]}>
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                </View>
                            )}
                            {isFailed && (
                                <View style={[styles.statusCircle, styles.circleFailed]}>
                                    <Ionicons name="close" size={12} color="#FFFFFF" />
                                </View>
                            )}
                            {!isComplete && !isRunning && !isFailed && (
                                <View style={[styles.statusCircle, styles.circlePending]}>
                                    <Text style={styles.pendingNumber}>{step.step}</Text>
                                </View>
                            )}
                            {idx < steps.length - 1 && <View style={styles.connectingLine} />}
                        </View>

                        {/* Step Details */}
                        <View style={styles.stepContent}>
                            <Text
                                style={[
                                    styles.stepTitle,
                                    isRunning && styles.stepTitleRunning,
                                    isComplete && styles.stepTitleComplete,
                                ]}
                            >
                                {step.title}
                            </Text>
                            {step.detail && (
                                <Text style={styles.stepDetail}>{step.detail}</Text>
                            )}
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        borderWidth: 1,
        borderColor: 'rgba(6, 182, 212, 0.25)',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginVertical: spacing.sm,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingBottom: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    },
    headerTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.accent[300],
        marginLeft: spacing.xs,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    spinner: {
        marginLeft: 'auto',
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    iconColumn: {
        alignItems: 'center',
        width: 24,
        marginRight: spacing.sm,
    },
    statusCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    circleComplete: {
        backgroundColor: colors.success.main,
    },
    circleRunning: {
        backgroundColor: colors.accent[500],
    },
    circleFailed: {
        backgroundColor: colors.error.main,
    },
    circlePending: {
        backgroundColor: colors.slate[700],
    },
    pendingNumber: {
        fontSize: 10,
        color: colors.slate[300],
        fontWeight: '700',
    },
    connectingLine: {
        width: 2,
        height: 16,
        backgroundColor: colors.slate[800],
        marginTop: 2,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.slate[300],
    },
    stepTitleRunning: {
        color: colors.accent[400],
        fontWeight: '700',
    },
    stepTitleComplete: {
        color: colors.text.primary,
    },
    stepDetail: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[400],
        marginTop: 2,
    },
});

export default StepExecutionViewer;
