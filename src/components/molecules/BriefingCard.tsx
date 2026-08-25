/**
 * BriefingCard - Molecule
 * Displays morning summary, "What am I missing today?" alerts, and schedule highlights
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { DailyBriefing } from '../../services/briefingService';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface BriefingCardProps {
    briefing: DailyBriefing | null;
    onAskMissing: () => void;
    onViewSchedule: () => void;
    onViewVault: () => void;
}

export const BriefingCard: React.FC<BriefingCardProps> = ({
    briefing,
    onAskMissing,
    onViewSchedule,
    onViewVault,
}) => {
    if (!briefing) return null;

    return (
        <Card variant="default" style={styles.card}>
            {/* Greeting & Date Header */}
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.greeting}>{briefing.greeting}, Alex</Text>
                    <Text style={styles.date}>{briefing.dateFormatted}</Text>
                </View>
                <Badge
                    label="STANDBY ACTIVE"
                    variant="standby"
                    size="sm"
                />
            </View>

            {/* "What Am I Missing" Warning Box */}
            <TouchableOpacity
                onPress={onAskMissing}
                activeOpacity={0.8}
                style={styles.missingBox}
            >
                <View style={styles.missingHeader}>
                    <View style={styles.missingIconWrap}>
                        <Ionicons name="alert-circle" size={18} color={colors.warning.main} />
                    </View>
                    <Text style={styles.missingTitle}>What Am I Missing Today?</Text>
                    <Badge
                        label={`${briefing.missingItems.length} ACTION REQUIRED`}
                        variant="warning"
                        size="sm"
                    />
                </View>

                {briefing.missingItems.slice(0, 2).map((item, idx) => (
                    <View key={item.id || idx} style={styles.itemRow}>
                        <Ionicons
                            name="chevron-forward"
                            size={14}
                            color={colors.standby[600]}
                            style={styles.bulletIcon}
                        />
                        <View style={styles.itemTextWrap}>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <Text style={styles.itemDesc}>{item.description}</Text>
                        </View>
                    </View>
                ))}
            </TouchableOpacity>

            {/* Quick Metrics Bar */}
            <View style={styles.metricsBar}>
                <TouchableOpacity
                    onPress={onViewSchedule}
                    style={styles.metricItem}
                    activeOpacity={0.7}
                >
                    <Ionicons name="calendar-outline" size={16} color={colors.primary[600]} />
                    <Text style={styles.metricValue}>{briefing.scheduledEventsCount || 0} Events</Text>
                    <Text style={styles.metricLabel}>Today's Schedule</Text>
                </TouchableOpacity>

                <View style={styles.metricDivider} />

                <TouchableOpacity
                    onPress={onViewVault}
                    style={styles.metricItem}
                    activeOpacity={0.7}
                >
                    <Ionicons name="folder-outline" size={16} color={colors.accent[600]} />
                    <Text style={styles.metricValue}>{briefing.tasksCount || 0} Tasks</Text>
                    <Text style={styles.metricLabel}>Pending Tasks</Text>
                </TouchableOpacity>

                <View style={styles.metricDivider} />

                <View style={styles.metricItem}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={colors.success.main} />
                    <Text style={styles.metricValue}>100%</Text>
                    <Text style={styles.metricLabel}>Private Offline</Text>
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.md,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(15, 23, 42, 0.08)',
        ...shadows.subtle,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    greeting: {
        fontSize: typography.fontSize.lg,
        fontWeight: '800',
        color: colors.text.primary,
    },
    date: {
        fontSize: typography.fontSize.xs,
        color: colors.text.muted,
        marginTop: 2,
    },
    missingBox: {
        backgroundColor: 'rgba(217, 119, 6, 0.06)',
        borderRadius: borderRadius.lg,
        padding: spacing.sm + 2,
        borderWidth: 1,
        borderColor: 'rgba(217, 119, 6, 0.25)',
        marginBottom: spacing.sm,
    },
    missingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    missingIconWrap: {
        marginRight: spacing.xs,
    },
    missingTitle: {
        fontSize: typography.fontSize.xs + 1,
        fontWeight: '700',
        color: colors.standby[800],
        flex: 1,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: spacing.xs,
    },
    bulletIcon: {
        marginTop: 2,
        marginRight: spacing.xs,
    },
    itemTextWrap: {
        flex: 1,
    },
    itemTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.text.primary,
    },
    itemDesc: {
        fontSize: 11,
        color: colors.text.secondary,
        marginTop: 1,
        lineHeight: 15,
    },
    metricsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: spacing.xs + 2,
        borderTopWidth: 1,
        borderTopColor: colors.slate[100],
    },
    metricItem: {
        flex: 1,
        alignItems: 'center',
    },
    metricValue: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.text.primary,
        marginTop: 2,
    },
    metricLabel: {
        fontSize: 10,
        color: colors.text.muted,
        marginTop: 1,
    },
    metricDivider: {
        width: 1,
        height: 24,
        backgroundColor: colors.slate[200],
    },
});

export default BriefingCard;
