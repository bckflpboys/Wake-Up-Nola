/**
 * Analytics Screen
 * Visual dashboard for event statistics
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnalyticsChart } from '../components/organisms/AnalyticsChart';
import { StatCard } from '../components/molecules/StatCard';
import { EventSelectorModal } from '../components/molecules/EventSelectorModal';
import { colors, spacing, typography } from '../theme';
import { db } from '../db/client';
import { scanHistory, tickets, events, Event } from '../db/schema';

const screenWidth = Dimensions.get('window').width;

export const AnalyticsScreen = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [showEventSelector, setShowEventSelector] = useState(false);
    const [eventsList, setEventsList] = useState<Event[]>([]);

    const [stats, setStats] = useState({
        totalRevenue: 0,
        ticketsSold: 0,
        checkInRate: 0,
        totalTickets: 0,
        scannedCount: 0,
    });

    // Chart state
    const [chartData, setChartData] = useState({
        scansOverTime: {
            labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
            datasets: [{ data: [0, 0, 0, 0, 0, 0] }]
        },
        ticketTypes: [] as any[],
    });

    useEffect(() => {
        loadData();
    }, [selectedEvent]); // Reload when event selection changes

    const getRandomColor = (index: number) => {
        const palette = [
            '#F83B3B', '#FF6B6B', '#FFA3A3', '#FFD1D1',
            '#4F46E5', '#818CF8', '#C7D2FE',
            '#10B981', '#34D399', '#6EE7B7'
        ];
        return palette[index % palette.length];
    };

    const loadData = async () => {
        try {
            const allTickets = await db.select().from(tickets);
            const allScans = await db.select().from(scanHistory);
            const allEvents = await db.select().from(events);

            setEventsList(allEvents);

            // Filter based on selected event
            let filteredEvents = allEvents;
            let filteredTickets = allTickets;
            let filteredScans = allScans;

            if (selectedEvent) {
                // @ts-ignore
                filteredEvents = allEvents.filter(e => e.id === selectedEvent.id);
                // @ts-ignore
                filteredTickets = allTickets.filter((t: any) => t.eventId === selectedEvent.id);
                // @ts-ignore
                filteredScans = allScans.filter((s: any) => s.eventId === selectedEvent.id);
            }

            const eventMap = new Map();
            allEvents.forEach((e: any) => eventMap.set(e.id, { title: e.title, createdAt: e.createdAt }));

            // --- Stats Calculation (Using Event Summaries) ---
            // 'tickets' table is only downloaded tickets. 'events' table has summary stats.
            const totalTicketsAvailable = filteredEvents.reduce((acc: number, e: any) => acc + (e.totalTickets || 0), 0);
            const totalSold = filteredEvents.reduce((acc: number, e: any) => acc + (e.ticketsSold || 0), 0);
            const totalRevenue = filteredEvents.reduce((acc: number, e: any) => acc + (e.revenue || 0), 0);

            // Check-in rate: Scans vs Sold
            // Use local scans as primary source for scanner app, but if we have global stats in event object use that?
            // User requested "showing all sold tickets in every event".
            // Let's stick to sold from event summary.
            const totalScannedGlobal = filteredEvents.reduce((acc: number, e: any) => acc + (e.ticketsScanned || 0), 0);

            setStats({
                totalRevenue: totalRevenue,
                ticketsSold: totalSold,
                checkInRate: totalSold > 0 ? (totalScannedGlobal / totalSold) : 0,
                totalTickets: totalTicketsAvailable,
                scannedCount: totalScannedGlobal,
            });

            // --- Ticket Distribution (Pie Chart) ---
            // Extract from Event Ticket Types JSON
            const ticketTypeItems: any[] = [];

            filteredEvents.forEach((event: any) => {
                try {
                    const types = JSON.parse(event.ticketTypes || '[]');
                    if (Array.isArray(types)) {
                        types.forEach((t: any) => {
                            // Only include if there are sales
                            if ((t.quantitySold || 0) > 0) {
                                ticketTypeItems.push({
                                    name: t.name,
                                    eventName: event.title,
                                    createdAt: event.createdAt,
                                    population: t.quantitySold || 0,
                                });
                            }
                        });
                    }
                } catch (e) {
                    // ignore parse errors
                }
            });

            // Fallback: If no types found in JSON (old data?), use tickets table
            if (ticketTypeItems.length === 0 && filteredTickets.length > 0) {
                const typeMap = new Map<string, number>();
                filteredTickets.forEach((t: any) => {
                    const type = t.ticketType || 'Standard';
                    const key = `${type}|${t.eventId}`;
                    typeMap.set(key, (typeMap.get(key) || 0) + 1);
                });

                Array.from(typeMap.entries()).forEach(([key, count]) => {
                    const [type, eid] = key.split('|');
                    const eventData = eventMap.get(eid) || { title: 'Unknown', createdAt: '0' };
                    ticketTypeItems.push({
                        name: type,
                        eventName: eventData.title,
                        createdAt: eventData.createdAt,
                        population: count
                    });
                });
            }

            const ticketTypeData = ticketTypeItems.map((item, index) => ({
                ...item,
                color: getRandomColor(index),
                legendFontColor: "#7F7F7F",
                legendFontSize: 12
            }));

            // Sort by event creation date (latest first)
            ticketTypeData.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            });

            // --- Check-in Trends (Line Chart) ---
            if (filteredScans.length > 0) {
                const timestamps = filteredScans.map((s: any) => new Date(s.scannedAt).getTime());
                const maxTime = Math.max(...timestamps);

                const lastScanDate = new Date(maxTime);
                lastScanDate.setMinutes(0, 0, 0); // Top of hour

                const chartLabels: string[] = [];
                const chartValues: number[] = [];

                // Show last 6 hours leading up to latest scan
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(lastScanDate);
                    d.setHours(d.getHours() - i);
                    const label = d.getHours().toString().padStart(2, '0') + ":00";
                    chartLabels.push(label);

                    // Count scans in this hour
                    const count = filteredScans.filter((s: any) => {
                        const scanTime = new Date(s.scannedAt);
                        return scanTime.getHours() === d.getHours() &&
                            scanTime.getDate() === d.getDate() &&
                            scanTime.getMonth() === d.getMonth() &&
                            scanTime.getFullYear() === d.getFullYear();
                    }).length;
                    chartValues.push(count);
                }

                setChartData(prev => ({
                    ...prev,
                    scansOverTime: {
                        labels: chartLabels,
                        datasets: [{ data: chartValues }]
                    },
                    ticketTypes: ticketTypeData
                }));
            } else {
                setChartData(prev => ({
                    ...prev,
                    ticketTypes: ticketTypeData,
                    // Zero chart
                    scansOverTime: {
                        labels: ["00:00", "04:00", "08:00", "12:00", "16:00"],
                        datasets: [{ data: [0, 0, 0, 0, 0] }]
                    }
                }));
            }

        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [selectedEvent]);

    const handleSelectEvent = (event: Event) => {
        if (event.id === 'all') {
            setSelectedEvent(null);
        } else {
            setSelectedEvent(event);
        }
        setShowEventSelector(false);
    };

    // Prepare events list with "All Events" option
    // We cheat types here to add a fake "All Events" option
    const selectorEvents = [
        { id: 'all', title: 'All Events', date: new Date().toISOString() } as any,
        ...eventsList
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Analytics</Text>

                <TouchableOpacity
                    style={styles.dateBadge}
                    onPress={() => setShowEventSelector(true)}
                >
                    <Text style={styles.dateText} numberOfLines={1}>
                        {selectedEvent ? selectedEvent.title : 'All Events'}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={colors.slate[600]} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />
                }
            >
                {/* Key Metrics */}
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Total Revenue"
                        value={`R ${stats.totalRevenue.toLocaleString()}`}
                        icon="cash-outline"
                        variant="primary"
                        style={styles.halfCard}
                    />
                    <StatCard
                        title="Check-in Rate"
                        value={`${(stats.checkInRate * 100).toFixed(0)}%`}
                        icon="people-outline"
                        variant="success"
                        style={styles.halfCard}
                    />
                </View>

                <View style={styles.statsGrid}>
                    <StatCard
                        title="Tickets Sold"
                        value={stats.ticketsSold}
                        icon="ticket-outline"
                        style={styles.halfCard}
                    />
                    <StatCard
                        title="Scanned"
                        value={stats.scannedCount}
                        icon="scan-circle-outline"
                        style={styles.halfCard}
                    />
                </View>

                {/* Charts */}
                <AnalyticsChart
                    type="line"
                    data={chartData.scansOverTime}
                    title="Check-in Trends"
                    subtitle={selectedEvent ? `Hourly volume for ${selectedEvent.title}` : "Hourly volume - All Events"}
                />

                <AnalyticsChart
                    type="pie"
                    data={chartData.ticketTypes}
                    title="Ticket Distribution"
                    subtitle="Sales by ticket category & event"
                    hideLegend={true}
                >
                    <View>
                        {chartData.ticketTypes.map((item: any, i) => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderBottomWidth: i === chartData.ticketTypes.length - 1 ? 0 : 1, borderBottomColor: colors.slate[50], paddingBottom: 8 }}>
                                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: item.color, marginRight: 12 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.slate[800] }}>{item.name}</Text>
                                    <Text style={{ fontSize: 12, color: colors.slate[500] }}>{item.eventName}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 14, color: colors.slate[900] }}>{item.population}</Text>
                                    <Text style={{ fontSize: 11, color: colors.slate[400] }}>tickets</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </AnalyticsChart>

                <View style={{ height: 100 }} />
            </ScrollView>

            <EventSelectorModal
                visible={showEventSelector}
                onClose={() => setShowEventSelector(false)}
                onSelect={handleSelectEvent}
                events={selectorEvents}
                title="Filter Analytics by Event"
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
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
    headerTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: '700',
        color: colors.slate[900],
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.slate[100],
        borderRadius: 100,
        maxWidth: 200,
    },
    dateText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.slate[700],
        flexShrink: 1,
    },
    content: {
        padding: spacing.lg,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    halfCard: {
        flex: 1,
    },
});
