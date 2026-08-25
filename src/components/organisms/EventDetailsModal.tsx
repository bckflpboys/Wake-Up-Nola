import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image, TextInput, Alert, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../atoms/Badge';
import { Card } from '../atoms/Card';
import Button from '../atoms/Button';
import { Event as EventType, scanners, Scanner } from '../../db/schema';
import { db } from '../../db/client';
import { eq } from 'drizzle-orm';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import apiService from '../../services/api';

interface EventDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    event: EventType | null;
    onSelect?: (event: EventType) => void;
    onScan?: (event: EventType) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
    visible,
    onClose,
    event,
    onSelect,
    onScan,
}) => {
    const [scannerCount, setScannerCount] = useState(0);
    const [scannersList, setScannersList] = useState<Scanner[]>([]);
    const [showAddScanner, setShowAddScanner] = useState(false);
    const [scannerEmail, setScannerEmail] = useState('');
    const [isAddingScanner, setIsAddingScanner] = useState(false);

    useEffect(() => {
        if (event?.id) {
            loadScannerCount();
        }
    }, [event]);

    const loadScannerCount = async () => {
        if (!event) return;
        try {
            const result = await db.select().from(scanners).where(eq(scanners.eventId, event.id));
            setScannersList(result);
            setScannerCount(result.length);
        } catch (e) {
            console.error('Failed to load scanners', e);
        }
    };

    const handleAddScanner = async () => {
        if (!scannerEmail || !scannerEmail.includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address');
            return;
        }

        setIsAddingScanner(true);
        try {
            if (!event) return;
            const response = await apiService.addScanner(event.id, scannerEmail);

            if (response.success) {
                Alert.alert('Success', 'Scanner added!');
                setScannerEmail('');
                setShowAddScanner(false);
                setScannerEmail('');
                // Refresh list
                loadScannerCount();
            } else {
                Alert.alert('Error', response.error || 'Failed to add scanner');
            }
        } catch (e) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setIsAddingScanner(false);
        }
    };

    const handleRemoveScanner = async (email: string) => {
        Alert.alert(
            'Remove Scanner',
            `Are you sure you want to remove ${email} from this event?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (!event) return;
                            const response = await apiService.removeScanner(event.id, email);
                            if (response.success) {
                                Alert.alert('Success', 'Scanner removed');
                                loadScannerCount();
                            } else {
                                Alert.alert('Error', response.error || 'Failed to remove scanner');
                            }
                        } catch (e) {
                            Alert.alert('Error', 'Failed to remove scanner');
                        }
                    }
                }
            ]
        );
    };

    if (!event) return null;

    // Parse specific fields
    let ticketTypes: any[] = [];
    try {
        ticketTypes = JSON.parse(event.ticketTypes || '[]');
    } catch (e) { ticketTypes = []; }

    let imageUrl: string | undefined;
    try {
        const images = JSON.parse(event.images || '[]');
        if (Array.isArray(images) && images.length > 0) imageUrl = images[0];
    } catch (e) { }

    // Calculations
    const scanProgress = event.totalTickets && event.totalTickets > 0
        ? ((event.ticketsScanned || 0) / event.totalTickets) * 100
        : 0;

    // Format currency (assuming generic currency or getting it from event if available, default to $)
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'completed': return 'info';
            case 'cancelled': return 'error';
            default: return 'default';
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
                {/* Header Image Background */}
                <View style={styles.headerImageContainer}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.headerImage} />
                    ) : (
                        <View style={[styles.headerImage, styles.placeholderHeader]}>
                            <Ionicons name="calendar" size={64} color={colors.slate[300]} />
                        </View>
                    )}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close-circle" size={32} color="rgba(0,0,0,0.5)" />
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <Badge
                            label={event.status?.toUpperCase() || 'UNKNOWN'}
                            variant={getStatusVariant(event.status || '')}
                        />
                        <Text style={styles.headerTitle}>{event.title}</Text>
                        <Text style={styles.headerDate}>
                            {new Date(event.date).toLocaleDateString(undefined, {
                                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                            })}
                        </Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    {/* Primary Stats Grid */}
                    <View style={styles.statsGrid}>
                        {/* Revenue */}
                        <Card style={styles.statCard} variant="elevated">
                            <Ionicons name="cash-outline" size={24} color={colors.success.main} />
                            <Text style={styles.statValue}>{formatCurrency(event.revenue || 0)}</Text>
                            <Text style={styles.statLabel}>Total Revenue</Text>
                        </Card>

                        {/* Scanners */}
                        <Card style={styles.statCard} variant="elevated">
                            <Ionicons name="qr-code-outline" size={24} color={colors.primary[500]} />
                            <Text style={styles.statValue}>{scannerCount}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.statLabel}>Active Scanners</Text>
                                <TouchableOpacity
                                    style={styles.addScannerBtn}
                                    onPress={() => setShowAddScanner(true)}
                                >
                                    <Ionicons name="add-circle" size={20} color={colors.primary[500]} />
                                </TouchableOpacity>
                            </View>
                        </Card>
                    </View>

                    <View style={styles.statsGrid}>
                        {/* Sold */}
                        <Card style={styles.statCard} variant="elevated">
                            <Ionicons name="ticket-outline" size={24} color={colors.info.main} />
                            <Text style={styles.statValue}>{event.ticketsSold || 0}</Text>
                            <Text style={styles.statLabel}>Tickets Sold</Text>
                        </Card>

                        {/* Scanned */}
                        <Card style={styles.statCard} variant="elevated">
                            <View style={styles.rowCenter}>
                                <Ionicons name="scan-circle-outline" size={24} color={colors.warning.main} />
                                <Text style={[styles.statSub, { marginLeft: 8, color: colors.warning.main }]}>
                                    {scanProgress.toFixed(1)}%
                                </Text>
                            </View>
                            <Text style={styles.statValue}>{event.ticketsScanned || 0}</Text>
                            <Text style={styles.statLabel}>Checked In</Text>
                        </Card>
                    </View>

                    {/* Progress Bar Detail */}
                    <View style={styles.section}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.sectionTitle}>Check-in Progress</Text>
                            <Text style={styles.progressText}>
                                {event.ticketsScanned || 0} / {event.ticketsSold || 0}
                            </Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${event.ticketsSold ? ((event.ticketsScanned || 0) / event.ticketsSold) * 100 : 0}%` }
                                ]}
                            />
                        </View>
                    </View>

                    {/* Ticket Types Breakdown */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ticket Types</Text>
                        {ticketTypes.map((type: any, index: number) => {
                            const sold = type.quantitySold || 0;
                            const total = type.quantity || 0;
                            const remaining = total - sold;

                            return (
                                <View key={index} style={styles.ticketTypeRow}>
                                    <View style={styles.ticketTypeInfo}>
                                        <Text style={styles.ticketTypeName}>{type.name}</Text>
                                        <Text style={styles.ticketTypePrice}>{formatCurrency(type.price || 0)}</Text>
                                    </View>
                                    <View style={styles.ticketTypeStats}>
                                        <View style={styles.pill}>
                                            <Text style={styles.pillText}>{sold} Sold</Text>
                                        </View>
                                        <View style={[styles.pill, styles.pillOutline]}>
                                            <Text style={styles.pillTextOutline}>{remaining} Left</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                        {ticketTypes.length === 0 && (
                            <Text style={styles.emptyText}>No ticket types defined</Text>
                        )}
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>

                <View style={[styles.footer, { gap: 12 }]}>
                    {/* Action Buttons Row */}
                    <View style={styles.actionButtonsRow}>
                        <Button
                            label="Sync Tickets"
                            onPress={async () => {
                                try {
                                    const result = await import('../../services/sync').then(m => m.default.prepareEvent(event.id));
                                    if (result.success) {
                                        Alert.alert('Success', `Successfully synced ${result.count} tickets!`);
                                    } else {
                                        Alert.alert('Error', `Sync failed: ${result.error}`);
                                    }
                                } catch (e) {
                                    Alert.alert('Error', 'Sync failed to start');
                                }
                            }}
                            variant="warning"
                            icon={<Ionicons name="cloud-download-outline" size={20} color="#FFF" />}
                            style={{ flex: 1 }}
                        />
                        
                        <Button
                            label="Scan"
                            onPress={() => {
                                if (onScan) {
                                    onScan(event);
                                    onClose();
                                }
                            }}
                            variant="primary"
                            icon={<Ionicons name="scan-outline" size={20} color="#FFF" />}
                            style={{ flex: 1 }}
                        />
                    </View>

                    <Button label="Close" onPress={onClose} variant="outline" style={{ width: '100%' }} />
                </View>
            </View>


            {/* Add Scanner Modal Overlay */}
            <Modal
                visible={showAddScanner}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAddScanner(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Manage Scanners</Text>

                        {/* Existing Scanners List */}
                        <View style={styles.scannersListContainer}>
                            <Text style={styles.subHeader}>Active Scanners ({scannersList.length})</Text>
                            {scannersList.length > 0 ? (
                                <ScrollView style={{ maxHeight: 150, marginBottom: 16 }}>
                                    {scannersList.map((scanner, idx) => (
                                        <View key={scanner.id || idx} style={styles.scannerItem}>
                                            <Ionicons name="person-circle-outline" size={24} color={colors.slate[400]} />
                                            <Text style={styles.scannerEmail} numberOfLines={1}>{scanner.email}</Text>
                                            <TouchableOpacity
                                                onPress={() => handleRemoveScanner(scanner.email)}
                                                style={{ padding: 4 }}
                                            >
                                                <Ionicons name="trash-outline" size={20} color={colors.error.main} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            ) : (
                                <Text style={styles.emptyListText}>No scanners added yet.</Text>
                            )}
                        </View>

                        <Text style={styles.subHeader}>Add New Scanner</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="scanner@example.com"
                            value={scannerEmail}
                            onChangeText={setScannerEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <View style={styles.modalButtons}>
                            <Button
                                label="Close"
                                variant="outline"
                                onPress={() => setShowAddScanner(false)}
                                style={{ flex: 1 }}
                            />
                            <View style={{ width: 10 }} />
                            <Button
                                label={isAddingScanner ? "Adding..." : "Add"}
                                variant="primary"
                                onPress={handleAddScanner}
                                disabled={isAddingScanner}
                                style={{ flex: 1 }}
                            />

                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </Modal >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    headerImageContainer: {
        height: 250,
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderHeader: {
        backgroundColor: colors.slate[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255, 0.8)',
        borderRadius: 20,
    },
    headerContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.xl,
        paddingTop: 40,
        backgroundColor: 'transparent',
    },
    // Add a gradient overlay in production for better readibility, simplified here with text shadows or bg
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFF',
        marginTop: spacing.sm,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    headerDate: {
        fontSize: 16,
        color: '#EEE',
        fontWeight: '600',
        marginTop: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    content: {
        padding: spacing.lg,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    statCard: {
        flex: 1,
        padding: spacing.md,
        alignItems: 'flex-start',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.slate[900],
        marginTop: spacing.xs,
    },
    statLabel: {
        fontSize: 12,
        color: colors.slate[500],
        marginTop: 2,
    },
    statSub: {
        fontSize: 14,
        fontWeight: '600',
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    section: {
        marginTop: spacing.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.slate[900],
        marginBottom: spacing.md,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    progressText: {
        color: colors.slate[500],
        fontWeight: '600',
    },
    progressBarBg: {
        height: 12,
        backgroundColor: colors.slate[100],
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.success.main,
        borderRadius: 6,
    },
    ticketTypeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate[100],
    },
    ticketTypeInfo: {
        flex: 1,
    },
    ticketTypeName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.slate[900],
    },
    ticketTypePrice: {
        fontSize: 14,
        color: colors.slate[500],
        marginTop: 2,
    },
    ticketTypeStats: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    pill: {
        backgroundColor: colors.slate[100],
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    pillOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.slate[200],
    },
    pillText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.slate[700],
    },
    pillTextOutline: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.slate[500],
    },
    emptyText: {
        color: colors.slate[400],
        fontStyle: 'italic',
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.slate[100],
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        width: '100%',
    },
    addScannerBtn: {
        marginLeft: 8,
        padding: 4,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 340,
        ...shadows.lg,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: colors.slate[900],
    },
    modalSubtitle: {
        fontSize: 14,
        color: colors.slate[500],
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.slate[300],
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
    },
    scannersListContainer: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate[100],
        paddingBottom: 8,
    },
    subHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.slate[700],
        marginBottom: 8,
    },
    scannerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        backgroundColor: colors.slate[50], // slight background
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 4,
    },
    scannerEmail: {
        fontSize: 14,
        color: colors.slate[800],
        marginLeft: 8,
        flex: 1,
    },
    emptyListText: {
        fontSize: 14,
        color: colors.slate[400],
        fontStyle: 'italic',
        marginBottom: 16,
    }
});
