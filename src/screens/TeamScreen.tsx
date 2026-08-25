/**
 * Team Screen (Scanners)
 * List events to manage scanners
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
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { ManageScannersModal } from '../components/organisms/ManageScannersModal';
import { db } from '../db/client';
import { events, scanners, type Event } from '../db/schema';
import { colors, spacing, typography, borderRadius } from '../theme';
import apiService from '../services/api';

export const TeamScreen = () => {
    const [eventsList, setEventsList] = useState<Event[]>([]);
    const [scannerCounts, setScannerCounts] = useState<Record<string, number>>({});
    const [refreshing, setRefreshing] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [showManageModal, setShowManageModal] = useState(false);

    const loadData = async () => {
        try {
            // Fetch events
            const localEvents = await db.select().from(events);
            // Sort by date desc
            localEvents.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

            // Fetch all scanners to count them per event
            const localScanners = await db.select().from(scanners);

            const counts: Record<string, number> = {};
            localScanners.forEach((s: any) => {
                counts[s.eventId] = (counts[s.eventId] || 0) + 1;
            });

            setEventsList(localEvents);
            setScannerCounts(counts);

        } catch (error) {
            console.error('Failed to load team data:', error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    const handleEventPress = (event: Event) => {
        setSelectedEvent(event);
        setShowManageModal(true);
    };

    const renderEventItem = ({ item }: { item: Event }) => {
        const scannerCount = scannerCounts[item.id] || 0;
        let imageUrl: string | undefined;
        try {
            const images = JSON.parse(item.images || '[]');
            imageUrl = images[0];
        } catch { }

        const imageSource = typeof imageUrl === 'string'
            ? { uri: imageUrl }
            : imageUrl;

        return (
            <TouchableOpacity onPress={() => handleEventPress(item)} activeOpacity={0.7}>
                <Card style={styles.eventCard}>
                    <View style={styles.cardContent}>
                        <View style={styles.imageContainer}>
                            {imageUrl ? (
                                <Image source={imageSource} style={styles.eventImage} />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Ionicons name="calendar" size={24} color={colors.primary[500]} />
                                </View>
                            )}
                        </View>
                        <View style={styles.eventInfo}>
                            <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.eventDate}>
                                {new Date(item.date).toLocaleDateString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </Text>
                            <View style={styles.badgeContainer}>
                                <View style={[styles.scannerBadge, { backgroundColor: scannerCount > 0 ? colors.primary[50] : colors.slate[100] }]}>
                                    <Ionicons name="scan-outline" size={14} color={scannerCount > 0 ? colors.primary[600] : colors.slate[500]} />
                                    <Text style={[styles.scannerCountText, { color: scannerCount > 0 ? colors.primary[700] : colors.slate[600] }]}>
                                        {scannerCount} Scanners
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.slate[400]} />
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Scanners</Text>
                <Text style={styles.subtitle}>Select an event to manage its scanning team</Text>
            </View>

            <FlatList
                data={eventsList}
                keyExtractor={item => item.id}
                renderItem={renderEventItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={48} color={colors.slate[300]} />
                        <Text style={styles.emptyText}>No events found</Text>
                    </View>
                }
            />

            <ManageScannersModal
                visible={showManageModal}
                event={selectedEvent}
                onClose={() => setShowManageModal(false)}
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
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.slate[500],
        marginTop: 4,
    },
    listContent: {
        padding: spacing.lg,
        paddingBottom: 100,
    },
    eventCard: {
        marginBottom: spacing.md,
        padding: spacing.md,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageContainer: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.md,
        backgroundColor: colors.slate[100],
        overflow: 'hidden',
        marginRight: spacing.md,
    },
    eventImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventInfo: {
        flex: 1,
        marginRight: spacing.sm,
    },
    eventTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.slate[900],
        marginBottom: 2,
    },
    eventDate: {
        fontSize: typography.fontSize.sm,
        color: colors.slate[500],
        marginBottom: 6,
    },
    badgeContainer: {
        flexDirection: 'row',
    },
    scannerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    scannerCountText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: spacing['5xl'],
    },
    emptyText: {
        fontSize: typography.fontSize.base,
        color: colors.slate[500],
        marginTop: spacing.md,
    },
});

export default TeamScreen;
