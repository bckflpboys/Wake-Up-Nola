/**
 * History Screen
 * Displays scan history with filtering
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    RefreshControl,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScanHistoryItem } from '../components/molecules/ScanHistoryItem';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { db } from '../db/client';
import { scanHistory, type ScanHistoryEntry } from '../db/schema';
import { desc } from 'drizzle-orm';
import { colors, spacing, typography, borderRadius } from '../theme';

type FilterType = 'all' | 'success' | 'error';

export const HistoryScreen = () => {
    const [scans, setScans] = useState<ScanHistoryEntry[]>([]);
    const [filter, setFilter] = useState<FilterType>('all');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadScans();
    }, [filter]);

    const loadScans = async () => {
        try {
            let allScans = await db.select().from(scanHistory).orderBy(desc(scanHistory.scannedAt));

            if (filter !== 'all') {
                allScans = allScans.filter((scan: any) => {
                    if (filter === 'success') return scan.scanResult === 'success';
                    return scan.scanResult !== 'success';
                });
            }

            setScans(allScans);
        } catch (error) {
            console.error('Failed to load scan history:', error);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadScans();
        setRefreshing(false);
    }, [filter]);

    const getFilterCounts = () => {
        const successCount = scans.filter(s => s.scanResult === 'success').length;
        const errorCount = scans.filter(s => s.scanResult !== 'success').length;
        return { total: scans.length, success: successCount, error: errorCount };
    };

    const counts = getFilterCounts();

    const FilterButton = ({ type, label, count }: { type: FilterType; label: string; count: number }) => (
        <TouchableOpacity
            onPress={() => setFilter(type)}
            style={[
                styles.filterButton,
                filter === type && styles.filterButtonActive,
            ]}
        >
            <Text
                style={[
                    styles.filterButtonText,
                    filter === type && styles.filterButtonTextActive,
                ]}
            >
                {label}
            </Text>
            <View
                style={[
                    styles.filterCount,
                    filter === type && styles.filterCountActive,
                ]}
            >
                <Text
                    style={[
                        styles.filterCountText,
                        filter === type && styles.filterCountTextActive,
                    ]}
                >
                    {count}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="time-outline" size={48} color={colors.slate[300]} />
            </View>
            <Text style={styles.emptyTitle}>No Scans Yet</Text>
            <Text style={styles.emptyText}>
                Your scan history will appear here after you start scanning tickets
            </Text>
        </View>
    );

    const renderItem = ({ item }: { item: ScanHistoryEntry }) => (
        <ScanHistoryItem
            ticketId={item.ticketId}
            ticketType={item.ticketType || 'Ticket'}
            eventTitle={item.eventTitle || 'Event'}
            scannedAt={item.scannedAt}
            attendeeEmail={item.attendeeEmail || undefined}
            attendeeName={item.attendeeName || undefined}
            scanResult={(item.scanResult as any) || 'success'}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Scan History</Text>
                <Badge
                    label={`${scans.length} total`}
                    variant="primary"
                    size="sm"
                />
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <FilterButton type="all" label="All" count={counts.total} />
                <FilterButton type="success" label="Valid" count={counts.success} />
                <FilterButton type="error" label="Invalid" count={counts.error} />
            </View>

            {/* Scan List */}
            <FlatList
                data={scans}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary[500]]}
                        tintColor={colors.primary[500]}
                    />
                }
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
        paddingTop: Platform.OS === 'android' ? 40 : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        backgroundColor: colors.background.primary,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate[100],
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: '700',
        color: colors.slate[900],
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        backgroundColor: colors.background.primary,
        gap: spacing.sm,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        backgroundColor: colors.slate[100],
    },
    filterButtonActive: {
        backgroundColor: colors.primary[500],
    },
    filterButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '500',
        color: colors.slate[600],
    },
    filterButtonTextActive: {
        color: '#FFFFFF',
    },
    filterCount: {
        marginLeft: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
        backgroundColor: colors.slate[200],
    },
    filterCountActive: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    filterCountText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
        color: colors.slate[600],
    },
    filterCountTextActive: {
        color: '#FFFFFF',
    },
    listContent: {
        padding: spacing.xl,
        paddingBottom: 100,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: spacing['5xl'],
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.slate[100],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.slate[700],
        marginBottom: spacing.xs,
    },
    emptyText: {
        fontSize: typography.fontSize.sm,
        color: colors.slate[500],
        textAlign: 'center',
        maxWidth: 260,
    },
});

export default HistoryScreen;
