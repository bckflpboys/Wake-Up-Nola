/**
 * AttendeeRow Component - Molecule
 * Row displaying attendee info with check-in status
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';

interface AttendeeRowProps {
    id: string;
    name?: string;
    email: string;
    ticketCount: number;
    ticketsScanned: number;
    ticketType: string;
    checkInStatus: 'pending' | 'partial' | 'complete';
    onPress?: () => void;
}

export const AttendeeRow = ({
    name,
    email,
    ticketCount,
    ticketsScanned,
    ticketType,
    checkInStatus,
    onPress,
}: AttendeeRowProps) => {
    const getStatusConfig = () => {
        switch (checkInStatus) {
            case 'complete':
                return {
                    label: 'Checked In',
                    variant: 'success' as const,
                    icon: 'checkmark-circle' as const,
                };
            case 'partial':
                return {
                    label: 'Partial',
                    variant: 'warning' as const,
                    icon: 'time' as const,
                };
            default:
                return {
                    label: 'Not Arrived',
                    variant: 'default' as const,
                    icon: 'hourglass-outline' as const,
                };
        }
    };

    const statusConfig = getStatusConfig();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.container}
            disabled={!onPress}
        >
            <Avatar name={name || email} size="md" />

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={1}>
                    {name || 'Guest'}
                </Text>
                <Text style={styles.email} numberOfLines={1}>
                    {email}
                </Text>
                <View style={styles.ticketInfo}>
                    <Ionicons name="ticket-outline" size={14} color={colors.slate[400]} />
                    <Text style={styles.ticketText}>
                        {ticketCount}x {ticketType}
                    </Text>
                </View>
            </View>

            <View style={styles.rightSection}>
                <Badge label={statusConfig.label} variant={statusConfig.variant} size="sm" />
                <View style={styles.scanCount}>
                    <Text style={styles.scanCountText}>
                        {ticketsScanned}/{ticketCount}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    content: {
        flex: 1,
        marginLeft: spacing.md,
    },
    name: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.slate[900],
        marginBottom: 2,
    },
    email: {
        fontSize: typography.fontSize.sm,
        color: colors.slate[500],
        marginBottom: spacing.xs,
    },
    ticketInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ticketText: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[500],
        marginLeft: spacing.xs,
    },
    rightSection: {
        alignItems: 'flex-end',
    },
    scanCount: {
        marginTop: spacing.xs,
        backgroundColor: colors.slate[100],
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
    },
    scanCountText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
        color: colors.slate[600],
    },
});

export default AttendeeRow;
