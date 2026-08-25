/**
 * Dashboard Screen (Simplified)
 * Main screen with event selection, stats, and scan functionality
 * Navigation is handled by the MainNavigator
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    RefreshControl,
    Platform,
    Alert,
    TouchableOpacity,
    Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/atoms/Button';
import { Badge } from '../components/atoms/Badge';
import { Card } from '../components/atoms/Card';
import { EventCard } from '../components/molecules/EventCard';
import { StatCard } from '../components/molecules/StatCard';
import { AttendeeList } from '../components/organisms/AttendeeList';
import { ScannerView } from '../components/organisms/ScannerView';
import PrepareEventModal from '../components/organisms/PrepareEventModal';
import { EventSelectorModal } from '../components/molecules/EventSelectorModal';
import { EventDetailsModal } from '../components/organisms/EventDetailsModal';
import syncService from '../services/sync';
import { useAuth } from '../contexts/AuthContext';
import { useSync } from '../contexts/SyncContext';
import { db, resetDatabase } from '../db/client';
import { events, scanHistory, Event, tickets } from '../db/schema';
import { desc, inArray } from 'drizzle-orm';
import apiService from '../services/api';
import { MOCK_EVENTS, MOCK_TICKETS } from '../data/mockData';
import { quickScanTest } from '../utils/testScanAPI';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

interface LocalEvent extends Event {
    // Extend if needed, but Event from schema covers it
}

export const DashboardScreen = () => {
    const { user, logout } = useAuth();
    const { status: syncStatus, lastSyncAt, triggerSync, pendingOperations, isOnline } = useSync();

    const [eventsList, setEventsList] = useState<LocalEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<LocalEvent | null>(null);
    const [viewingEvent, setViewingEvent] = useState<LocalEvent | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'scanning' | 'attendees'>('list');
    const [refreshing, setRefreshing] = useState(false);
    const [todayScans, setTodayScans] = useState(0);
    const [totalScans, setTotalScans] = useState(0);

    const [showPrepareModal, setShowPrepareModal] = useState(false);
    const [showScanSelector, setShowScanSelector] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Scanner state
    const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error' | 'duplicate'>('idle');
    const [feedbackMessage, setFeedbackMessage] = useState('');

    useEffect(() => {
        const init = async () => {
            if (user?.email === 'demo@ticketafrica.shop') {
                await seedDemoData();
            }
            loadEvents();
            loadStats();
        };
        init();
    }, [user?.email]);

    const seedDemoData = async () => {
        // Force update demo data to ensure assets are fresh
        console.log('Seeding/Updating demo data...');
        try {
            // 1. Update/Insert Mock Events
            for (const event of MOCK_EVENTS) {
                await db.insert(events).values(event as Event)
                    .onConflictDoUpdate({
                        target: events.id,
                        set: event as any
                    });
            }

            // 2. Update/Insert Mock Tickets
            for (const ticket of MOCK_TICKETS) {
                // Check if ticket exists to avoid overwriting scan status if already scanned in this session?
                // For demo mode, resetting is explicitly usually better, or preserving if user wants.
                // But generally if I just changed the image, I shouldn't touch tickets if not needed.
                // But the user might have messed up data.
                // Let's just upsert tickets too.

                await db.insert(tickets).values({
                    ...ticket,
                    id: ticket.ticketId, // Use ticketId as ID for simplicity in demo
                    synced: false,
                    syncStatus: 'synced',
                    scannedAt: ticket.scannedAt || null,
                    lastSyncAt: new Date().toISOString(),
                } as any).onConflictDoUpdate({
                    target: tickets.id,
                    set: {
                        ticketType: ticket.ticketType,
                        price: ticket.price,
                        customerName: ticket.customerName,
                        // Don't overwrite status if it was scanned in this session?
                        // Actually, simplified demo: always reset or always fresh.
                        // I will leave ticket status as is if it exists, only update static info.
                        // Actually, let's just ignore conflict for tickets to preserve scan state.
                    }
                });
            }

            // 3. Ensure some history exists
            const existingHistory = await db.select().from(scanHistory);
            if (existingHistory.length === 0) {
                for (const ticket of MOCK_TICKETS) {
                    if (ticket.status === 'scanned') {
                        await db.insert(scanHistory).values({
                            id: Math.random().toString(36).substr(2, 9),
                            ticketId: ticket.ticketId,
                            eventId: ticket.eventId,
                            scannedAt: ticket.scannedAt || new Date().toISOString(),
                            synced: true,
                            scanResult: 'success',
                            scannedBy: user?.email || 'demo@ticketafrica.shop',
                        });
                    }
                }
            }

            console.log('Demo data updated successfully');
        } catch (e) {
            console.error('Failed to seed demo data', e);
        }
    };

    const handleSettings = () => {
        Alert.alert(
            'Settings',
            'Choose an action',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Test Scan API',
                    onPress: async () => {
                        // Test with a sample ticket ID
                        const testTicketId = 'TEST123-PAY456';
                        const testEventId = selectedEvent?.id || eventsList[0]?.id;
                        
                        if (!testEventId) {
                            Alert.alert('Error', 'No event selected. Please select an event first.');
                            return;
                        }
                        
                        Alert.alert(
                            'Testing Scan API',
                            `Testing with:\nTicket: ${testTicketId}\nEvent: ${testEventId}\n\nCheck console for results...`
                        );
                        
                        try {
                            await quickScanTest(testTicketId, testEventId, apiService.getToken() || '');
                            Alert.alert('Test Complete', 'Check the console logs for detailed results');
                        } catch (error: any) {
                            Alert.alert('Test Failed', error.message);
                        }
                    }
                },
                {
                    text: 'Reload Data',
                    onPress: onRefresh
                },
                {
                    text: 'Reset App & Logout',
                    style: 'destructive',
                    onPress: async () => {
                        Alert.alert(
                            'Are you sure?',
                            'This will delete all local data and require you to login again. Use this if the app is behaving incorrectly.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Reset Everything',
                                    style: 'destructive',
                                    onPress: async () => {
                                        await resetDatabase();
                                        await logout();
                                    }
                                }
                            ]
                        );
                    }
                }
            ]
        );
    };

    const loadEvents = async () => {
        try {
            const localEvents = await db.select().from(events).orderBy(desc(events.date));
            setEventsList(localEvents as LocalEvent[]);

            // Auto-select first event if none selected (Optional now, as flow is explicit)
            if (localEvents.length > 0 && !selectedEvent) {
                setSelectedEvent(localEvents[0] as LocalEvent);
            }
        } catch (error) {
            console.error('Failed to load events:', error);
        }
    };

    const loadStats = async () => {
        try {
            const allScans = await db.select().from(scanHistory);
            setTotalScans(allScans.length);

            // Count today's scans
            const today = new Date().toDateString();
            const todaysScans = allScans.filter((scan: any) => {
                const scanDate = new Date(scan.scannedAt).toDateString();
                return scanDate === today;
            });
            setTodayScans(todaysScans.length);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await triggerSync();
        await loadEvents();
        await loadStats();
        setRefreshing(false);
    }, [triggerSync]);

    const handleStartScanFlow = () => {
        // Always show selector to let user choose/confirm
        setShowScanSelector(true);
    };

    const handleSelectEventForScan = (event: LocalEvent) => {
        setSelectedEvent(event);
        setShowScanSelector(false);
        // Slight delay to allow modal to close smoothly
        setTimeout(() => setViewMode('scanning'), 300);
    };

    const handlePrepareEvent = () => {
        setShowPrepareModal(true);
    };

    const handleEventPress = (event: LocalEvent) => {
        setViewingEvent(event);
        setShowDetailsModal(true);
    };

    const handleScanCode = async (code: string) => {
        if (!selectedEvent) return;

        console.log('[DASHBOARD] Scanning code:', code, 'for event:', selectedEvent.id);

        try {
            // Updated to use SyncService's smart offline validation
            const response = await syncService.validateAndRecordScan(
                code,
                selectedEvent.id,
                user?.email || 'unknown'
            );

            if (response.success) {
                setScanStatus('success');
                const ticketType = response.ticket?.ticketType || 'Ticket';
                setFeedbackMessage(`${code}\n${ticketType}\nCheck-in Successful`);

                // Update local stats
                setTodayScans(prev => prev + 1);
                setTotalScans(prev => prev + 1);
            } else {
                // Determine if it was a duplicate or invalid
                if (response.message.includes('Already scanned')) {
                    setScanStatus('duplicate');
                    setFeedbackMessage(response.message);
                } else if (response.message.includes('not found locally')) {
                    // Fallback to online API if allowed/needed
                    console.log('[DASHBOARD] Trying online validation...');
                    try {
                        const onlineResponse = await apiService.scanTicket(code, selectedEvent.id);
                        console.log('[DASHBOARD] Online response:', onlineResponse);
                        
                        // Handle different response formats from backend
                        let isSuccess = false;
                        let ticketType = 'Ticket';
                        let errorMsg = 'Invalid ticket';
                        
                        if (onlineResponse.success && onlineResponse.data) {
                            // Check various success indicators
                            if (onlineResponse.data.success === true || 
                                onlineResponse.data.message?.toLowerCase().includes('success') ||
                                onlineResponse.data.message?.toLowerCase().includes('valid')) {
                                isSuccess = true;
                                ticketType = onlineResponse.data.ticketDetails?.ticketType || 
                                            (onlineResponse.data as any).ticketType || 
                                            'Ticket';
                            } else if (onlineResponse.data.success === false) {
                                // Check if it's a duplicate scan
                                if (onlineResponse.data.message?.toLowerCase().includes('already') ||
                                    onlineResponse.data.message?.toLowerCase().includes('duplicate')) {
                                    setScanStatus('duplicate');
                                    setFeedbackMessage(onlineResponse.data.message || 'Ticket already scanned');
                                    setTimeout(() => setScanStatus('idle'), 3000);
                                    return;
                                }
                                errorMsg = onlineResponse.data.message || onlineResponse.data.error || 'Invalid ticket';
                            }
                        } else if (onlineResponse.error) {
                            errorMsg = onlineResponse.error;
                        }
                        
                        if (isSuccess) {
                            setScanStatus('success');
                            setFeedbackMessage(`${code}\n${ticketType}\nCheck-in Successful (Online)`);
                            setTodayScans(prev => prev + 1);
                            setTotalScans(prev => prev + 1);
                            
                            // Record in local history for offline viewing
                            await syncService.recordScan(
                                code,
                                selectedEvent.id,
                                selectedEvent.title,
                                ticketType,
                                user?.email || 'unknown',
                                'success'
                            );
                        } else {
                            console.log('[DASHBOARD] Scan failed:', errorMsg);
                            setScanStatus('error');
                            setFeedbackMessage(errorMsg);
                        }
                    } catch (e: any) {
                        console.error('[DASHBOARD] Online scan error:', e);
                        setScanStatus('error');
                        setFeedbackMessage('Network error: Unable to verify ticket online');
                    }
                } else {
                    setScanStatus('error');
                    setFeedbackMessage(response.message);
                }
            }
        } catch (error: any) {
            console.error('[DASHBOARD] Scan error:', error);
            setScanStatus('error');
            setFeedbackMessage('Scan failed: ' + (error.message || 'Unknown error'));
        }

        // Reset after delay
        setTimeout(() => {
            setScanStatus('idle');
        }, 3000);
    };

    const getSyncStatusBadge = () => {
        if (!isOnline) {
            return <Badge label="Offline" variant="warning" size="sm" />;
        }
        if (syncStatus === 'syncing') {
            return <Badge label="Syncing..." variant="info" size="sm" />;
        }
        if (pendingOperations > 0) {
            return <Badge label={`${pendingOperations} pending`} variant="warning" size="sm" />;
        }
        return <Badge label="Synced" variant="success" size="sm" />;
    };

    // Render scanner view when scanning
    if (viewMode === 'scanning') {
        return (
            <ScannerView
                onScan={handleScanCode}
                onClose={() => setViewMode('list')}
                scanStatus={scanStatus}
                feedbackMessage={feedbackMessage}
                eventName={selectedEvent?.title}
            />
        );
    }

    // Render attendee list
    if (viewMode === 'attendees') {
        return (
            <AttendeeList
                eventId={selectedEvent?.id || ''}
                onClose={() => setViewMode('list')}
            />
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.greeting}>
                        {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}
                    </Text>
                    <Text style={styles.userName}>{user?.name || 'Organizer'} 👋</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={handleSettings} style={{ marginRight: 12 }}>
                        <Ionicons name="settings-outline" size={24} color={colors.slate[600]} />
                    </TouchableOpacity>
                    <Image
                        source={require('../../assets/pulse-logo.jpeg')}
                        style={styles.logoImage}
                        resizeMode="cover"
                    />
                </View>
            </View>

            {/* Main Content */}
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary[500]]}
                        tintColor={colors.primary[500]}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Stats Cards */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.statsContainer}
                >
                    <StatCard
                        title="Today's Scans"
                        value={todayScans}
                        icon="scan-outline"
                        variant="primary"
                        style={styles.statCard}
                    />
                    <StatCard
                        title="Total Scans"
                        value={totalScans}
                        icon="checkmark-done"
                        variant="default"
                        style={styles.statCard}
                    />
                    <StatCard
                        title="Events"
                        value={eventsList.length}
                        icon="calendar"
                        variant="default"
                        style={styles.statCard}
                    />
                </ScrollView>

                {/* Events Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Your Events (Read-only)</Text>
                    {getSyncStatusBadge()}
                </View>

                {eventsList.length === 0 ? (
                    <Card variant="outlined" style={styles.emptyCard}>
                        <View style={styles.emptyContent}>
                            <Ionicons name="calendar-outline" size={48} color={colors.slate[300]} />
                            <Text style={styles.emptyTitle}>No Events Yet</Text>
                            <Text style={styles.emptyText}>
                                Events you're assigned to will appear here. Pull to refresh.
                            </Text>
                        </View>
                    </Card>
                ) : (
                    eventsList.map((event) => {
                        let imageUrl;
                        try {
                            const images = JSON.parse(event.images || '[]');
                            imageUrl = images[0];
                        } catch {
                            imageUrl = undefined;
                        }

                        return (
                            <EventCard
                                key={event.id}
                                id={event.id}
                                title={event.title}
                                date={event.date}
                                location={event.location || ''}
                                imageUrl={imageUrl}
                                ticketsSold={event.ticketsSold || 0}
                                ticketsScanned={event.ticketsScanned || 0}
                                totalTickets={event.totalTickets || 0}
                                status={event.status as any}
                                selected={selectedEvent?.id === event.id}
                                onPress={() => handleEventPress(event)}
                            />
                        );
                    })
                )}

                {/* Bottom padding for button */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Scan Button & Attendee Button */}
            <View style={styles.actionButtonsContainer}>
                <View style={styles.buttonRow}>
                    <Button
                        label="Prepare Event"
                        variant="warning"
                        onPress={handlePrepareEvent}
                        icon={<Ionicons name="cloud-download" size={20} color="#FFFFFF" />}
                        style={{ flex: 1, marginRight: spacing.sm }}
                    />
                    <Button
                        label="Scan Event"
                        onPress={handleStartScanFlow}
                        icon={<Ionicons name="scan" size={20} color="#FFFFFF" />}
                        style={{ flex: 1 }}
                    />
                </View>

            </View>

            {/* Modals */}
            <PrepareEventModal
                visible={showPrepareModal}
                onClose={() => setShowPrepareModal(false)}
                events={eventsList}
            />

            <EventSelectorModal
                visible={showScanSelector}
                onClose={() => setShowScanSelector(false)}
                onSelect={handleSelectEventForScan}
                events={eventsList}
                title="Select Event to Scan"
            />

            <EventDetailsModal
                visible={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                event={viewingEvent}
                onSelect={(event) => setSelectedEvent(event as LocalEvent)}
                onScan={(event) => {
                    setSelectedEvent(event as LocalEvent);
                    setViewMode('scanning');
                }}
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
        paddingVertical: spacing.md,
        backgroundColor: colors.background.primary,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate[100],
    },
    headerLeft: {},
    greeting: {
        fontSize: typography.fontSize.sm,
        color: colors.slate[500],
    },
    userName: {
        fontSize: typography.fontSize.xl,
        fontWeight: '700',
        color: colors.slate[900],
        marginTop: 2,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoImage: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.primary[500],
    },
    content: {
        flex: 1,
        padding: spacing.xl,
    },
    statsContainer: {
        paddingBottom: spacing.xl,
        gap: spacing.md,
    },
    statCard: {
        marginRight: spacing.md,
        minWidth: 150,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
        color: colors.slate[900],
    },
    emptyCard: {
        padding: spacing['3xl'],
    },
    emptyContent: {
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.slate[700],
        marginTop: spacing.md,
    },
    emptyText: {
        fontSize: typography.fontSize.sm,
        color: colors.slate[500],
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    actionButtonsContainer: {
        position: 'absolute',
        bottom: spacing.xl,
        left: spacing.xl,
        right: spacing.xl,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
});

export default DashboardScreen;
