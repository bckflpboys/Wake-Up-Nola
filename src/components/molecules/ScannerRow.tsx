/**
 * ScannerRow Component - Molecule
 * Row displaying scanner team member info
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';

interface ScannerRowProps {
    email: string;
    name?: string;
    addedAt: string;
    scansCount: number;
    isActive: boolean;
    isCurrentUser?: boolean;
    onRemove?: () => void;
}

export const ScannerRow = ({
    email,
    name,
    addedAt,
    scansCount,
    isActive,
    isCurrentUser = false,
    onRemove,
}: ScannerRowProps) => {
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handleRemove = () => {
        Alert.alert(
            'Remove Scanner',
            `Are you sure you want to remove ${name || email} from this event?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: onRemove },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Avatar name={name || email} size="md" />

            <View style={styles.content}>
                <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                        {name || 'Team Member'}
                    </Text>
                    {isCurrentUser && (
                        <Badge label="You" variant="primary" size="sm" />
                    )}
                </View>
                <Text style={styles.email} numberOfLines={1}>
                    {email}
                </Text>
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={12} color={colors.slate[400]} />
                        <Text style={styles.metaText}>Added {formatDate(addedAt)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="scan-outline" size={12} color={colors.slate[400]} />
                        <Text style={styles.metaText}>{scansCount} scans</Text>
                    </View>
                </View>
            </View>

            <View style={styles.rightSection}>
                <Badge
                    label={isActive ? 'Active' : 'Inactive'}
                    variant={isActive ? 'success' : 'default'}
                    size="sm"
                />

                {onRemove && !isCurrentUser && (
                    <TouchableOpacity
                        onPress={handleRemove}
                        style={styles.removeButton}
                    >
                        <Ionicons name="trash-outline" size={18} color={colors.error.main} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
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
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    name: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.slate[900],
        marginRight: spacing.sm,
        flex: 1,
    },
    email: {
        fontSize: typography.fontSize.sm,
        color: colors.slate[500],
        marginBottom: spacing.xs,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[400],
        marginLeft: spacing.xs,
    },
    rightSection: {
        alignItems: 'flex-end',
    },
    removeButton: {
        marginTop: spacing.sm,
        padding: spacing.xs,
    },
});

export default ScannerRow;
