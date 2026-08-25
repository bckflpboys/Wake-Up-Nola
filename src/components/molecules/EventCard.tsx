/**
 * EventCard Component - Molecule
 * Card displaying event summary with stats
 */

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge } from '../atoms/Badge';
import { colors, borderRadius, shadows, spacing, typography } from '../../theme';

interface EventCardProps {
    id: string;
    title: string;
    date: string;
    location: string;
    imageUrl?: string | number;
    ticketsSold: number;
    ticketsScanned: number;
    totalTickets: number;
    status: 'active' | 'published' | 'completed' | 'draft' | 'cancelled';
    onPress?: () => void;
    selected?: boolean;
}

export const EventCard = ({
    title,
    date,
    location,
    imageUrl,
    ticketsSold,
    ticketsScanned,
    totalTickets,
    status,
    onPress,
    selected = false,
}: EventCardProps) => {
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusVariant = () => {
        switch (status) {
            case 'active':
            case 'published':
                return 'success';
            case 'completed':
                return 'info';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const scanProgress = totalTickets > 0 ? (ticketsScanned / ticketsSold) * 100 : 0;

    const parseLocation = (loc: string) => {
        try {
            const parsed = JSON.parse(loc);
            return parsed.venue?.name || parsed.venue?.city || 'Location TBD';
        } catch {
            return loc || 'Location TBD';
        }
    };

    // Helper to determine source
    const imageSource = typeof imageUrl === 'string'
        ? { uri: imageUrl }
        : (imageUrl as any); // fallback for number/asset

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[
                styles.container,
                selected && styles.containerSelected,
            ]}
        >
            {/* Image / Gradient Background */}
            <View style={styles.imageContainer}>
                {imageUrl ? (
                    <Image source={imageSource} style={styles.image} />
                ) : (
                    <LinearGradient
                        colors={colors.gradients.dark as any}
                        style={styles.imagePlaceholder}
                    >
                        <Ionicons name="calendar" size={32} color={colors.slate[400]} />
                    </LinearGradient>
                )}
                <View style={styles.statusBadge}>
                    <Badge
                        label={status.charAt(0).toUpperCase() + status.slice(1)}
                        variant={getStatusVariant()}
                        size="sm"
                    />
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>

                <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.slate[400]} />
                    <Text style={styles.metaText}>{formatDate(date)}</Text>
                </View>

                <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={14} color={colors.slate[400]} />
                    <Text style={styles.metaText} numberOfLines={1}>
                        {parseLocation(location)}
                    </Text>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{ticketsSold}</Text>
                        <Text style={styles.statLabel}>Sold</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{ticketsScanned}</Text>
                        <Text style={styles.statLabel}>Scanned</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: colors.primary[500] }]}>
                            {scanProgress.toFixed(0)}%
                        </Text>
                        <Text style={styles.statLabel}>Check-in</Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBackground}>
                        <LinearGradient
                            colors={colors.gradients.primary as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressFill, { width: `${Math.min(scanProgress, 100)}%` }]}
                        />
                    </View>
                </View>
            </View>

            {/* Selection Indicator */}
            {
                selected && (
                    <View style={styles.selectionIndicator}>
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary[500]} />
                    </View>
                )
            }
        </TouchableOpacity >
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius['2xl'],
        overflow: 'hidden',
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    containerSelected: {
        borderWidth: 2,
        borderColor: colors.primary[500],
    },
    imageContainer: {
        height: 140,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusBadge: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
    },
    content: {
        padding: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
        color: colors.slate[900],
        marginBottom: spacing.sm,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    metaText: {
        fontSize: typography.fontSize.sm,
        color: colors.slate[500],
        marginLeft: spacing.xs,
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.slate[50],
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginTop: spacing.md,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: typography.fontSize.xl,
        fontWeight: '700',
        color: colors.slate[900],
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[500],
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: colors.slate[200],
    },
    progressContainer: {
        marginTop: spacing.md,
    },
    progressBackground: {
        height: 6,
        backgroundColor: colors.slate[100],
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
    selectionIndicator: {
        position: 'absolute',
        top: spacing.sm,
        left: spacing.sm,
    },
});

export default EventCard;
