import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { ScannerRow } from '../molecules/ScannerRow';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { db } from '../../db/client';
import { scanners, type Scanner, type Event } from '../../db/schema';
import { eq } from 'drizzle-orm';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface ManageScannersModalProps {
    visible: boolean;
    onClose: () => void;
    event: Event | null;
}

export const ManageScannersModal: React.FC<ManageScannersModalProps> = ({
    visible,
    onClose,
    event,
}) => {
    const { user } = useAuth();
    const [scannersList, setScannersList] = useState<Scanner[]>([]);
    const [loading, setLoading] = useState(false);
    const [newScannerEmail, setNewScannerEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [showAddInput, setShowAddInput] = useState(false);

    useEffect(() => {
        if (visible && event) {
            loadScanners();
            setShowAddInput(false);
            setNewScannerEmail('');
        }
    }, [visible, event]);

    const loadScanners = async () => {
        if (!event) return;
        setLoading(true);
        try {
            // First try to fetch from API to get latest
            try {
                const response = await apiService.getScannersForEvent(event.id);
                if (response.success && response.data) {
                    // Update local DB (simple replacement strategy for now or upsert)
                    // For now, just rely on the API response for the list view to be fresh

                    // But we must support offline view too from local DB
                    // Let's rely on local DB first, then update from API
                }
            } catch (e) {
                console.log('Online fetch failed, using local');
            }

            const localScanners = await db.select()
                .from(scanners)
                .where(eq(scanners.eventId, event.id));
            setScannersList(localScanners);
        } catch (error) {
            console.error('Failed to load scanners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddScanner = async () => {
        if (!newScannerEmail.trim() || !event) {
            return;
        }

        setIsAdding(true);

        try {
            const response = await apiService.addScanner(event.id, newScannerEmail.trim());

            if (response.success) {
                // Add to local database
                const now = new Date().toISOString();
                await db.insert(scanners).values({
                    id: `${event.id}_${newScannerEmail.trim()}`,
                    eventId: event.id,
                    email: newScannerEmail.trim().toLowerCase(),
                    addedAt: now,
                    addedBy: user?.email || '',
                    isActive: true,
                    scansCount: 0,
                    synced: true,
                });

                await loadScanners();
                setNewScannerEmail('');
                setShowAddInput(false);
                Alert.alert('Success', 'Scanner added successfully');
            } else {
                Alert.alert('Error', response.error || 'Failed to add scanner');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to add scanner');
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveScanner = async (email: string) => {
        if (!event) return;

        try {
            const response = await apiService.removeScanner(event.id, email);

            if (response.success) {
                await db.delete(scanners)
                    .where(eq(scanners.id, `${event.id}_${email}`));
                await loadScanners();
            } else {
                // checking if it failed because it's not in backend but is in local?
                // Just delete local if backend 404s? 
                // For safety, show error.
                Alert.alert('Error', response.error || 'Failed to remove scanner');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to remove scanner');
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Manage Scanners</Text>
                        <Text style={styles.subtitle}>{event?.title}</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={colors.slate[900]} />
                    </TouchableOpacity>
                </View>

                {showAddInput ? (
                    <View style={styles.addSection}>
                        <Text style={styles.sectionLabel}>Add New Scanner</Text>
                        <Input
                            label="Email Address"
                            placeholder="scanner@example.com"
                            leftIcon="mail-outline"
                            value={newScannerEmail}
                            onChangeText={setNewScannerEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <View style={styles.addButtons}>
                            <Button
                                label="Cancel"
                                variant="ghost"
                                onPress={() => setShowAddInput(false)}
                                style={{ flex: 1, marginRight: spacing.sm }}
                            />
                            <Button
                                label={isAdding ? "Adding..." : "Add Scanner"}
                                variant="primary"
                                onPress={handleAddScanner}
                                loading={isAdding}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </View>
                ) : (
                    <Button
                        label="Add Scanner"
                        variant="primary"
                        icon={<Ionicons name="add" size={20} color="#FFF" />}
                        onPress={() => setShowAddInput(true)}
                        style={{ margin: spacing.lg }}
                    />
                )}

                <View style={styles.listContainer}>
                    <Text style={styles.listTitle}>Current Team ({scannersList.length})</Text>

                    {loading ? (
                        <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary[500]} />
                    ) : scannersList.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={48} color={colors.slate[300]} />
                            <Text style={styles.emptyText}>No scanners assigned yet.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={scannersList}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <ScannerRow
                                    email={item.email}
                                    name={item.name || undefined}
                                    addedAt={item.addedAt}
                                    scansCount={item.scansCount || 0}
                                    isActive={true}
                                    isCurrentUser={item.email === user?.email}
                                    onRemove={() => handleRemoveScanner(item.email)}
                                />
                            )}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: colors.background.primary,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate[200],
    },
    title: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.slate[900],
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.slate[500],
        marginTop: 2,
    },
    closeButton: {
        padding: spacing.xs,
    },
    addSection: {
        backgroundColor: colors.background.primary,
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate[200],
    },
    sectionLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.slate[700],
        marginBottom: spacing.md,
    },
    addButtons: {
        flexDirection: 'row',
        marginTop: spacing.sm,
    },
    listContainer: {
        flex: 1,
        padding: spacing.lg,
    },
    listTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.slate[800],
        marginBottom: spacing.md,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing['4xl'],
    },
    emptyText: {
        marginTop: spacing.md,
        color: colors.slate[500],
    },
});
