/**
 * ScanHistoryItem Component - Molecule
 * Individual scan history entry
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../atoms/Badge';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';

interface ScanHistoryItemProps {
    ticketId: string;
    ticketType: string;
    eventTitle: string;
    scannedAt: string;
    attendeeEmail?: string;
    attendeeName?: string;
    scanResult: 'success' | 'error' | 'duplicate' | 'invalid';
    onPress?: () => void;
}

export const ScanHistoryItem = ({
    ticketId,
    ticketType,
    eventTitle,
    scannedAt,
    attendeeEmail,
    attendeeName,
    scanResult,
    onPress,
}: ScanHistoryItemProps) => {
    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const today = new Date();
        const isToday = d.toDateString() === today.toDateString();

        if (isToday) {
            return 'Today';
        }

        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const getResultConfig = () => {
        switch (scanResult) {
            case 'success':
                return {
                    icon: 'checkmark-circle' as const,
                    color: colors.success.main,
                    bgColor: colors.success.light,
                    label: 'Valid',
                };
            case 'duplicate':
                return {
                    icon: 'copy' as const,
                    color: colors.warning.main,
                    bgColor: colors.warning.light,
                    label: 'Duplicate',
                };
            case 'invalid':
                return {
                    icon: 'close-circle' as const,
                    color: colors.error.main,
                    bgColor: colors.error.light,
                    label: 'Invalid',
                };
            default:
                return {
                    icon: 'alert-circle' as const,
                    color: colors.error.main,
                    bgColor: colors.error.light,
                    label: 'Error',
                };
        }
    };

    const resultConfig = getResultConfig();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.container}
            disabled={!onPress}
        >
            {/* Status Icon */}
            <View style={[styles.iconContainer, { backgroundColor: resultConfig.bgColor }]}>
                <Ionicons name={resultConfig.icon} size={24} color={resultConfig.color} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={styles.ticketId} numberOfLines={1}>
                        {ticketId}
                    </Text>
                    <Badge label={ticketType} variant="primary" size="sm" />
                </View>

                <Text style={styles.eventTitle} numberOfLines={1}>
                    {eventTitle}
                </Text>

                {(attendeeName || attendeeEmail) && (
                    <View style={styles.attendeeRow}>
                        <Ionicons name="person-outline" size={12} color={colors.slate[400]} />
                        <Text style={styles.attendeeText} numberOfLines={1}>
                            {attendeeName || attendeeEmail}
                        </Text>
                    </View>
                )}

                <View style={styles.bottomRow}>
                    <View style={styles.timeContainer}>
                        <Ionicons name="time-outline" size={12} color={colors.slate[400]} />
                        <Text style={styles.timeText}>
                            {formatDate(scannedAt)} at {formatTime(scannedAt)}
                        </Text>
                    </View>
                    <Badge
                        label={resultConfig.label}
                        variant={scanResult === 'success' ? 'success' : scanResult === 'duplicate' ? 'warning' : 'error'}
                        size="sm"
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    content: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    ticketId: {
        fontSize: typography.fontSize.base,
        fontWeight: '700',
        color: colors.slate[900],
        flex: 1,
        marginRight: spacing.sm,
    },
    eventTitle: {
        fontSize: typography.fontSize.sm,
        color: colors.slate[600],
        marginBottom: spacing.xs,
    },
    attendeeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    attendeeText: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[500],
        marginLeft: spacing.xs,
        flex: 1,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.xs,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[400],
        marginLeft: spacing.xs,
    },
});

export default ScanHistoryItem;
