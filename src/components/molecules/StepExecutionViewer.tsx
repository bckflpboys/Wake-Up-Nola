/**
 * StepExecutionViewer - Molecule
 * Visualizes micro-agent task decomposition steps in real-time
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
                <Ionicons name="git-network-outline" size={14} color={colors.primary[600]} />
                <Text style={styles.headerTitle}>Task Decomposition & Steps</Text>
                {isProcessing && (
                    <ActivityIndicator size="small" color={colors.primary[600]} style={styles.spinner} />
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
                                    <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                                </View>
                            )}
                            {isRunning && (
                                <View style={[styles.statusCircle, styles.circleRunning]}>
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                </View>
                            )}
                            {isFailed && (
                                <View style={[styles.statusCircle, styles.circleFailed]}>
                                    <Ionicons name="close" size={11} color="#FFFFFF" />
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
        backgroundColor: colors.slate[50],
        borderWidth: 1,
        borderColor: colors.slate[200],
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        marginVertical: spacing.xs,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate[200],
    },
    headerTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.text.primary,
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
        marginBottom: 6,
    },
    iconColumn: {
        alignItems: 'center',
        width: 20,
        marginRight: spacing.xs,
    },
    statusCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    circleComplete: {
        backgroundColor: colors.success.main,
    },
    circleRunning: {
        backgroundColor: colors.primary[500],
    },
    circleFailed: {
        backgroundColor: colors.error.main,
    },
    circlePending: {
        backgroundColor: colors.slate[300],
    },
    pendingNumber: {
        fontSize: 9,
        color: colors.slate[700],
        fontWeight: '700',
    },
    connectingLine: {
        width: 1.5,
        height: 12,
        backgroundColor: colors.slate[300],
        marginTop: 2,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    stepTitleRunning: {
        color: colors.primary[600],
        fontWeight: '700',
    },
    stepTitleComplete: {
        color: colors.text.primary,
    },
    stepDetail: {
        fontSize: 10,
        color: colors.text.muted,
        marginTop: 1,
    },
});

export default StepExecutionViewer;
