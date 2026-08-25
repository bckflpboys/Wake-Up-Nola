/**
 * Sync Service
 * Handles bidirectional sync between SQLite and MongoDB
 * Implements offline-first with background sync
 */

import NetInfo from '@react-native-community/netinfo';
import { db } from '../db/client';
import {
    events,
    scanners,
    tickets,
    attendees,
    scanHistory,
    syncQueue,
    type NewEvent,
    type NewScanner,
    type NewAttendee,
    type NewScanHistoryEntry,
} from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import apiService, { EventData, ScanHistoryItem } from './api';

// Sync status types
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

export interface SyncState {
    status: SyncStatus;
    lastSyncAt: Date | null;
    pendingOperations: number;
    error: string | null;
}

class SyncService {
    private isSyncing = false;
    private syncInterval: NodeJS.Timeout | null = null;
    private listeners: Array<(state: SyncState) => void> = [];
    private currentState: SyncState = {
        status: 'idle',
        lastSyncAt: null,
        pendingOperations: 0,
        error: null,
    };

    /**
     * Subscribe to sync state changes
     */
    subscribe(listener: (state: SyncState) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener(this.currentState));
    }

    private updateState(partial: Partial<SyncState>) {
        this.currentState = { ...this.currentState, ...partial };
        this.notifyListeners();
    }

    /**
     * Check network connectivity
     */
    async isOnline(): Promise<boolean> {
        const state = await NetInfo.fetch();
        return state.isConnected === true && state.isInternetReachable === true;
    }

    /**
     * Start background sync (call on app start)
     */
    startBackgroundSync(intervalMs: number = 30000) {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        // Initial sync
        this.fullSync();

        // Set up interval
        this.syncInterval = setInterval(() => {
            this.fullSync();
        }, intervalMs);

        // Listen for network changes
        NetInfo.addEventListener(state => {
            if (state.isConnected && state.isInternetReachable) {
                // Network restored, trigger sync
                this.processPendingQueue();
            } else {
                this.updateState({ status: 'offline' });
            }
        });
    }

    /**
     * Stop background sync
     */
    stopBackgroundSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    /**
     * Full sync - pull from server and push pending changes
     */
    async fullSync(): Promise<void> {
        if (this.isSyncing) return;

        const online = await this.isOnline();
        if (!online) {
            this.updateState({ status: 'offline' });
            return;
        }

        this.isSyncing = true;
        this.updateState({ status: 'syncing', error: null });

        try {
            // First, push any pending operations
            await this.processPendingQueue();

            // Then, pull fresh data from server
            await Promise.all([
                this.syncEvents(),
                this.syncScanHistory(),
            ]);

            this.updateState({
                status: 'success',
                lastSyncAt: new Date(),
                error: null,
            });
        } catch (error: any) {
            console.error('Sync error:', error);
            this.updateState({
                status: 'error',
                error: error.message || 'Sync failed',
            });
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Sync events from server to local DB
     */
    async syncEvents(): Promise<void> {
        const response = await apiService.getScannerEvents();

        if (!response.success || !response.data) {
            console.warn('Failed to fetch events:', response.error);
            return;
        }

        for (const event of response.data) {
            await this.upsertEvent(event);
        }
    }

    /**
     * Upsert event to local database
     */
    private async upsertEvent(eventData: EventData): Promise<void> {
        const now = new Date().toISOString();

        // Calculate totals from ticket types
        let totalTickets = 0;
        let ticketsSold = 0;
        let revenue = 0;

        if (eventData.ticketTypes) {
            for (const tt of eventData.ticketTypes) {
                totalTickets += tt.quantity || 0;
                ticketsSold += tt.quantitySold || 0;
                revenue += (tt.quantitySold || 0) * (tt.price || 0);
            }
        }

        const eventRecord: NewEvent = {
            id: eventData._id,
            title: eventData.title,
            description: eventData.description || '',
            date: eventData.date,
            endTime: eventData.endTime || '',
            location: typeof eventData.location === 'string' ? eventData.location : JSON.stringify(eventData.location),
            images: JSON.stringify(eventData.images || []),
            organizerId: eventData.organizer,
            category: eventData.category || '',
            status: eventData.status || 'active',
            ticketTypes: JSON.stringify(eventData.ticketTypes || []),
            totalTickets,
            ticketsSold,
            ticketsScanned: (await db.select().from(scanHistory).where(and(eq(scanHistory.eventId, eventData._id), eq(scanHistory.scanResult, 'success')))).length,
            revenue,
            synced: true,
            lastSyncAt: now,
            createdAt: eventData.createdAt || now,
            updatedAt: eventData.updatedAt || now,
        };

        try {
            // Try to update first
            const existing = await db.select().from(events).where(eq(events.id, eventData._id));

            if (existing.length > 0) {
                await db.update(events)
                    .set(eventRecord)
                    .where(eq(events.id, eventData._id));
            } else {
                await db.insert(events).values(eventRecord);
            }

            // Sync scanners for this event
            if (eventData.scanners) {
                await this.syncScannersForEvent(eventData._id, eventData.scanners);
            }
        } catch (error) {
            console.error('Failed to upsert event:', error);
        }
    }

    /**
     * Sync scanners for an event
     */
    private async syncScannersForEvent(eventId: string, scannerEmails: string[]): Promise<void> {
        const now = new Date().toISOString();

        for (const email of scannerEmails) {
            const scannerId = `${eventId}_${email}`;

            try {
                const existing = await db.select().from(scanners).where(eq(scanners.id, scannerId));

                if (existing.length === 0) {
                    await db.insert(scanners).values({
                        id: scannerId,
                        eventId,
                        email,
                        name: '',
                        addedAt: now,
                        isActive: true,
                        scansCount: 0,
                        synced: true,
                    });
                }
            } catch (error) {
                console.error('Failed to sync scanner:', error);
            }
        }
    }

    /**
     * Sync scan history from server
     */
    async syncScanHistory(): Promise<void> {
        const response = await apiService.getScanHistory();

        if (!response.success || !response.data) {
            console.warn('Failed to fetch scan history:', response.error);
            return;
        }

        for (const scan of response.data) {
            await this.upsertScanHistoryEntry(scan);
        }
    }

    /**
     * Upsert scan history entry
     */
    private async upsertScanHistoryEntry(scanData: ScanHistoryItem): Promise<void> {
        const entry: NewScanHistoryEntry = {
            id: scanData._id,
            ticketId: scanData.ticketId,
            orderId: scanData.orderNumber,
            eventId: scanData.eventId,
            eventTitle: scanData.eventTitle,
            ticketType: scanData.ticketType,
            attendeeEmail: scanData.attendantEmail,
            attendeeName: '',
            scannedBy: scanData.scannedBy,
            scannedAt: scanData.scannedAt,
            scanResult: 'success',
            synced: true,
        };

        try {
            const existing = await db.select().from(scanHistory).where(eq(scanHistory.id, scanData._id));

            if (existing.length === 0) {
                await db.insert(scanHistory).values(entry);
            }
        } catch (error) {
            console.error('Failed to upsert scan history:', error);
        }
    }

    /**
     * Add operation to sync queue (for offline mode)
     */
    async queueOperation(
        operation: string,
        tableName: string,
        recordId: string,
        payload: object
    ): Promise<void> {
        const now = new Date().toISOString();

        await db.insert(syncQueue).values({
            id: `${tableName}_${recordId}_${Date.now()}`,
            operation,
            tableName,
            recordId,
            payload: JSON.stringify(payload),
            status: 'pending',
            attempts: 0,
            createdAt: now,
        });

        await this.updatePendingCount();
    }

    /**
     * Process pending sync queue
     */
    async processPendingQueue(): Promise<void> {
        const pending = await db.select()
            .from(syncQueue)
            .where(eq(syncQueue.status, 'pending'));

        for (const item of pending) {
            try {
                await db.update(syncQueue)
                    .set({ status: 'syncing', lastAttemptAt: new Date().toISOString() })
                    .where(eq(syncQueue.id, item.id));

                const payload = JSON.parse(item.payload);
                let success = false;

                switch (item.operation) {
                    case 'scan':
                        const scanResponse = await apiService.scanTicket(payload.ticketId, payload.eventId);
                        success = scanResponse.success;
                        break;
                    case 'add_scanner':
                        const addResponse = await apiService.addScanner(payload.eventId, payload.email);
                        success = addResponse.success;
                        break;
                    case 'remove_scanner':
                        const removeResponse = await apiService.removeScanner(payload.eventId, payload.email);
                        success = removeResponse.success;
                        break;
                }

                if (success) {
                    await db.update(syncQueue)
                        .set({ status: 'synced' })
                        .where(eq(syncQueue.id, item.id));
                } else {
                    throw new Error('Operation failed');
                }
            } catch (error: any) {
                await db.update(syncQueue)
                    .set({
                        status: 'pending',
                        attempts: (item.attempts || 0) + 1,
                        errorMessage: error.message,
                    })
                    .where(eq(syncQueue.id, item.id));
            }
        }

        await this.updatePendingCount();
    }

    /**
     * Update pending operations count
     */
    private async updatePendingCount(): Promise<void> {
        const pending = await db.select()
            .from(syncQueue)
            .where(eq(syncQueue.status, 'pending'));

        this.updateState({ pendingOperations: pending.length });
    }

    /**
     * Get current sync state
     */
    getState(): SyncState {
        return this.currentState;
    }

    /**
     * Record a scan locally (offline-first)
     */
    /**
     * Validate and record a scan (Offline-First Logic)
     */
    async validateAndRecordScan(
        ticketCode: string,
        eventId: string,
        scannerEmail: string
    ): Promise<{ success: boolean; message: string; ticket?: any }> {
        const now = new Date().toISOString();

        console.log('[SCAN] Validating ticket:', ticketCode, 'for event:', eventId);

        // 1. Check Local DB first (Offline Priority)
        try {
            // Find ALL tickets matching ticketCode (for quantity > 1, there are multiple rows)
            const localTickets = await db.select()
                .from(tickets)
                .where(and(eq(tickets.ticketId, ticketCode), eq(tickets.eventId, eventId)));

            console.log('[SCAN] Local ticket search result:', localTickets.length > 0 ? `Found ${localTickets.length}` : 'Not found');

            if (localTickets.length > 0) {
                // Find an unscanned ticket
                const ticket = localTickets.find((t: any) => !t.isScanned);

                // A. Check if already scanned
                if (!ticket) {
                    // All tickets in this order are scanned
                    const lastScanned = localTickets[0];
                    await this.recordHistory(ticketCode, eventId, 'duplicate', 'Already scanned', lastScanned.ticketType || 'Standard');
                    return { success: false, message: `Already scanned by ${lastScanned.scannedBy || 'unknown'}` };
                }

                // B. Mark as scanned locally
                await db.update(tickets)
                    .set({
                        isScanned: true,
                        scannedAt: now,
                        scannedBy: scannerEmail,
                        synced: false // Pending sync to server
                    })
                    .where(eq(tickets.id, ticket.id));

                // C. Record History & Queue Sync
                await this.recordHistory(ticketCode, eventId, 'success', undefined, ticket.ticketType || 'Standard');
                await this.queueOperation('scan', 'tickets', ticketCode, { ticketId: ticketCode, eventId });

                console.log('[SCAN] Ticket validated offline successfully');
                return { success: true, message: 'Verified Offline', ticket };
            }
        } catch (e) {
            console.warn('[SCAN] Offline validation error:', e);
        }

        // 2. Fallback: If not in local DB, assume not prepared. Return specific flag.
        console.log('[SCAN] Ticket not found locally, will try online');
        return { success: false, message: 'Ticket not found locally. Trying online...' };
    }

    /**
     * Helper to record history
     */
    private async recordHistory(
        ticketId: string,
        eventId: string,
        result: 'success' | 'error' | 'duplicate' | 'invalid',
        errorMessage?: string,
        ticketType: string = 'Unknown'
    ) {
        const id = `scan_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await db.insert(scanHistory).values({
            id,
            ticketId,
            eventId,
            eventTitle: 'Event', // Todo: fetch title
            ticketType,
            scannedBy: 'Me', // Todo: fetch email
            scannedAt: new Date().toISOString(),
            scanResult: result,
            errorMessage,
            synced: false,
        });
    }

    /**
     * Record a scan locally (Legacy / Logger)
     */
    async recordScan(
        ticketId: string,
        eventId: string,
        eventTitle: string,
        ticketType: string,
        scannerEmail: string,
        result: 'success' | 'error' | 'duplicate' | 'invalid',
        errorMessage?: string
    ): Promise<void> {
        await this.recordHistory(ticketId, eventId, result, errorMessage, ticketType);

        if (result === 'success') {
            await this.queueOperation('scan', 'tickets', ticketId, {
                ticketId,
                eventId,
            });
        }
    }
    /**
     * Prepare event for offline scanning (Download all tickets)
     */
    async prepareEvent(eventId: string): Promise<{ success: boolean; count: number; error?: string }> {
        try {
            const online = await this.isOnline();
            if (!online) {
                return { success: false, count: 0, error: 'Network required to download tickets' };
            }

            const response = await apiService.getEventTickets(eventId);

            if (!response.success || !response.data) {
                return { success: false, count: 0, error: response.error || 'Failed to fetch tickets' };
            }

            const ticketList = response.data.tickets;
            const now = new Date().toISOString();
            let count = 0;

            for (const t of ticketList) {
                // Upsert ticket to local DB
                await db.insert(tickets).values({
                    id: t._id,
                    ticketId: t.ticketId,
                    eventId: response.data.eventId, // Ensure from response to be safe
                    orderId: t.orderId,
                    ticketType: t.ticketType,
                    price: t.price,
                    isScanned: t.isScanned,
                    scannedAt: t.scannedAt,
                    scannedBy: t.scannedBy,
                    customerName: t.customerName,
                    customerEmail: t.customerEmail,
                    synced: true,
                }).onConflictDoUpdate({
                    target: tickets.id,
                    set: {
                        isScanned: t.isScanned,
                        scannedAt: t.scannedAt,
                        scannedBy: t.scannedBy,
                        synced: true,
                    }
                });
                count++;
            }

            return { success: true, count };
        } catch (error: any) {
            console.error('Failed to prepare event:', error);
            return { success: false, count: 0, error: error.message };
        }
    }
}

export const syncService = new SyncService();
export default syncService;
