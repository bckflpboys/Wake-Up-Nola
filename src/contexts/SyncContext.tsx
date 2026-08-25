/**
 * Sync Context
 * Global sync state management
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import syncService, { SyncState } from '../services/sync';
import { useAuth } from './AuthContext';

interface SyncContextType extends SyncState {
    triggerSync: () => Promise<void>;
    isOnline: boolean;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [syncState, setSyncState] = useState<SyncState>(syncService.getState());
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            // Start background sync when authenticated
            syncService.startBackgroundSync(30000); // 30 seconds

            // Subscribe to sync state changes
            const unsubscribe = syncService.subscribe(state => {
                setSyncState(state);
                setIsOnline(state.status !== 'offline');
            });

            return () => {
                unsubscribe();
                syncService.stopBackgroundSync();
            };
        }
    }, [isAuthenticated]);

    const triggerSync = async () => {
        await syncService.fullSync();
    };

    return (
        <SyncContext.Provider
            value={{
                ...syncState,
                triggerSync,
                isOnline,
            }}
        >
            {children}
        </SyncContext.Provider>
    );
}

export function useSync() {
    const context = useContext(SyncContext);
    if (context === undefined) {
        throw new Error('useSync must be used within a SyncProvider');
    }
    return context;
}

export default SyncContext;
