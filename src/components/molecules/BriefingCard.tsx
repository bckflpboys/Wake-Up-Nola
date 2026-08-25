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
import { colors, spacing, typography, borderRadius } from '../../theme';

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

    const criticalCount = briefing.missingItems.filter(i => i.urgency === 'critical').length;

    return (
        <Card variant="glowAmber" style={styles.card}>
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
                        <Ionicons name="alert-circle" size={20} color={colors.warning.main} />
                    </View>
                    <Text style={styles.missingTitle}>What Am I Missing Today?</Text>
                    <Badge
                        label={`${briefing.missingItems.length} ACTION REQUIRED`}
                        variant="warning"
                        size="sm"
                    />
                </View>

                {briefing.missingItems.map((item, idx) => (
                    <View key={item.id || idx} style={styles.itemRow}>
                        <Ionicons name="chevron-forward" size={14} color={colors.warning.main} style={styles.bulletIcon} />
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
                    <Ionicons name="calendar-outline" size={18} color={colors.accent[400]} />
                    <Text style={styles.metricValue}>{briefing.scheduledEventsCount} Events</Text>
                    <Text style={styles.metricLabel}>Today's Schedule</Text>
                </TouchableOpacity>

                <View style={styles.metricDivider} />

                <TouchableOpacity
                    onPress={onViewVault}
                    style={styles.metricItem}
                    activeOpacity={0.7}
                >
                    <Ionicons name="folder-open-outline" size={18} color={colors.primary[400]} />
                    <Text style={styles.metricValue}>3 Files</Text>
                    <Text style={styles.metricLabel}>Shared Vault</Text>
                </TouchableOpacity>

                <View style={styles.metricDivider} />

                <TouchableOpacity
                    onPress={onAskMissing}
                    style={styles.metricItem}
                    activeOpacity={0.7}
                >
                    <Ionicons name="shield-checkmark-outline" size={18} color={colors.success.main} />
                    <Text style={styles.metricValue}>100% Offline</Text>
                    <Text style={styles.metricLabel}>On-Device AI</Text>
                </TouchableOpacity>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.lg,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    greeting: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: -0.5,
    },
    date: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        marginTop: 2,
    },
    missingBox: {
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    missingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    missingIconWrap: {
        marginRight: spacing.xs,
    },
    missingTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.standby[300],
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
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.text.primary,
    },
    itemDesc: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[400],
        marginTop: 2,
        lineHeight: 16,
    },
    metricsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.06)',
    },
    metricItem: {
        flex: 1,
        alignItems: 'center',
    },
    metricValue: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.text.primary,
        marginTop: 4,
    },
    metricLabel: {
        fontSize: 10,
        color: colors.text.muted,
        marginTop: 1,
    },
    metricDivider: {
        width: 1,
        height: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
});

export default BriefingCard;
