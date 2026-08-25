/**
 * Connectors Screen - Device Apps & API Integration Hub
 * Progressive disclosure with live scanning, real synchronization, and detail inspection
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    ActivityIndicator,
    Modal,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { connectorService, DeviceConnector } from '../services/connectorService';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

interface ConnectorsScreenProps {
    onNavigateBack?: () => void;
    onNavigateChat?: () => void;
}

type FilterCategory = 'all' | 'device_app' | 'local_data' | 'ai_endpoint';

export const ConnectorsScreen: React.FC<ConnectorsScreenProps> = ({
    onNavigateBack,
    onNavigateChat,
}) => {
    const [connectors, setConnectors] = useState<DeviceConnector[]>(connectorService.getConnectors());
    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
    const [isScanning, setIsScanning] = useState(false);
    const [scanMessage, setScanMessage] = useState('');
    const [selectedConnector, setSelectedConnector] = useState<DeviceConnector | null>(null);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [syncingId, setSyncingId] = useState<string | null>(null);

    // Form fields for new custom API
    const [apiName, setApiName] = useState('');
    const [apiUrl, setApiUrl] = useState('');
    const [apiKey, setApiKey] = useState('');

    const handleDeepScan = async () => {
        setIsScanning(true);
        try {
            const updated = await connectorService.deepScanDevice((step) => {
                setScanMessage(step);
            });
            setConnectors([...updated]);
        } finally {
            setIsScanning(false);
            setScanMessage('');
        }
    };

    const handleSyncSingle = async (id: string) => {
        setSyncingId(id);
        try {
            const updatedConn = await connectorService.syncSingleConnector(id);
            setConnectors([...connectorService.getConnectors()]);
            if (selectedConnector && selectedConnector.id === id) {
                setSelectedConnector(updatedConn);
            }
        } finally {
            setSyncingId(null);
        }
    };

    const handleToggle = (id: string) => {
        connectorService.toggleConnector(id);
        const updated = connectorService.getConnectors();
        setConnectors([...updated]);
        if (selectedConnector && selectedConnector.id === id) {
            setSelectedConnector(updated.find(c => c.id === id) || null);
        }
    };

    const handleAddCustomApi = () => {
        if (!apiName.trim() || !apiUrl.trim()) {
            Alert.alert('Missing Details', 'Please provide a name and endpoint URL.');
            return;
        }

        connectorService.addCustomApiConnector(apiName.trim(), apiUrl.trim(), apiKey.trim());
        setConnectors([...connectorService.getConnectors()]);
        setApiName('');
        setApiUrl('');
        setApiKey('');
        setIsAddModalVisible(false);
    };

    const filteredConnectors = connectors.filter(c => {
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'ai_endpoint') return c.category === 'ai_endpoint' || c.category === 'cloud_api';
        return c.category === selectedCategory;
    });

    const connectedCount = connectors.filter(c => c.status === 'connected').length;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* 1. Header with Back Button */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={onNavigateBack}
                        style={styles.backBtn}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={18} color={colors.text.primary} />
                    </TouchableOpacity>

                    <View style={styles.headerTitleWrap}>
                        <Text style={styles.headerTitle}>Connectors & APIs</Text>
                        <Text style={styles.headerSubtitle}>
                            {connectedCount} of {connectors.length} systems active
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => setIsAddModalVisible(true)}
                        style={styles.addApiBtn}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                        <Text style={styles.addApiText}>Add API</Text>
                    </TouchableOpacity>
                </View>

                {/* 2. Deep Device Scan Radar Card */}
                <View style={styles.scanBanner}>
                    <View style={styles.scanContentWrap}>
                        <View style={styles.scanIconBox}>
                            <Ionicons name="scan-circle" size={30} color={colors.primary[500]} />
                        </View>
                        <View style={styles.scanTextWrap}>
                            <Text style={styles.scanTitle}>Deep Device Scanner</Text>
                            <Text style={styles.scanDesc}>
                                Real-time sync across SQLite storage, calendar, contacts, LAN, and GitHub.
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleDeepScan}
                        disabled={isScanning}
                        style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
                        activeOpacity={0.85}
                    >
                        {isScanning ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Ionicons name="sync-outline" size={15} color="#FFFFFF" />
                        )}
                        <Text style={styles.scanBtnText}>
                            {isScanning ? 'Scanning Everything...' : 'Deep Scan & Sync All'}
                        </Text>
                    </TouchableOpacity>

                    {isScanning && scanMessage ? (
                        <Text style={styles.scanStepText}>⚡ {scanMessage}</Text>
                    ) : null}
                </View>

                {/* 3. Progressive Disclosure Filter Pills */}
                <View style={styles.filterPillsRow}>
                    <TouchableOpacity
                        onPress={() => setSelectedCategory('all')}
                        style={[styles.filterPill, selectedCategory === 'all' && styles.filterPillActive]}
                    >
                        <Text style={[styles.filterText, selectedCategory === 'all' && styles.filterTextActive]}>
                            All ({connectors.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setSelectedCategory('device_app')}
                        style={[styles.filterPill, selectedCategory === 'device_app' && styles.filterPillActive]}
                    >
                        <Text style={[styles.filterText, selectedCategory === 'device_app' && styles.filterTextActive]}>
                            Device Apps
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setSelectedCategory('local_data')}
                        style={[styles.filterPill, selectedCategory === 'local_data' && styles.filterPillActive]}
                    >
                        <Text style={[styles.filterText, selectedCategory === 'local_data' && styles.filterTextActive]}>
                            Vault & Storage
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setSelectedCategory('ai_endpoint')}
                        style={[styles.filterPill, selectedCategory === 'ai_endpoint' && styles.filterPillActive]}
                    >
                        <Text style={[styles.filterText, selectedCategory === 'ai_endpoint' && styles.filterTextActive]}>
                            AI & APIs
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* 4. Connectors List */}
                <ScrollView
                    style={styles.scrollList}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredConnectors.map(conn => {
                        const isConnected = conn.status === 'connected';
                        const isSyncing = syncingId === conn.id;

                        return (
                            <Card
                                key={conn.id}
                                variant="default"
                                style={styles.connectorCard}
                                onPress={() => setSelectedConnector(conn)}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={[styles.iconWrap, { backgroundColor: isConnected ? 'rgba(2, 132, 199, 0.08)' : colors.slate[100] }]}>
                                        <Ionicons
                                            name={conn.icon as any}
                                            size={20}
                                            color={isConnected ? colors.primary[600] : colors.slate[400]}
                                        />
                                    </View>

                                    <View style={styles.cardInfo}>
                                        <View style={styles.titleRow}>
                                            <Text style={styles.connName}>{conn.name}</Text>
                                            <Badge
                                                label={isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                                                variant={isConnected ? 'success' : 'default'}
                                                size="sm"
                                            />
                                        </View>
                                        <Text style={styles.connDesc} numberOfLines={2}>{conn.description}</Text>
                                        <View style={styles.metaRow}>
                                            <Text style={styles.accessScope}>🔒 {conn.accessScope}</Text>
                                            {conn.lastSynced && (
                                                <Text style={styles.lastSyncedText}>• {conn.lastSynced}</Text>
                                            )}
                                        </View>
                                    </View>

                                    {/* Action Buttons: 1-Tap Sync + Toggle */}
                                    <View style={styles.cardActionCluster}>
                                        <TouchableOpacity
                                            onPress={() => handleSyncSingle(conn.id)}
                                            disabled={isSyncing}
                                            style={styles.microSyncBtn}
                                            activeOpacity={0.7}
                                        >
                                            {isSyncing ? (
                                                <ActivityIndicator size="small" color={colors.primary[600]} />
                                            ) : (
                                                <Ionicons name="refresh-outline" size={16} color={colors.primary[600]} />
                                            )}
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => handleToggle(conn.id)}
                                            style={[styles.toggleSwitch, isConnected ? styles.toggleOn : styles.toggleOff]}
                                            activeOpacity={0.8}
                                        >
                                            <View style={[styles.toggleKnob, isConnected ? styles.knobOn : styles.knobOff]} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Card>
                        );
                    })}
                </ScrollView>

                {/* 5. Detailed Connector Inspector Modal */}
                {selectedConnector && (
                    <Modal
                        visible={!!selectedConnector}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setSelectedConnector(null)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <View style={styles.modalTitleRow}>
                                        <View style={[styles.iconWrap, { backgroundColor: 'rgba(2, 132, 199, 0.08)' }]}>
                                            <Ionicons
                                                name={selectedConnector.icon as any}
                                                size={22}
                                                color={colors.primary[600]}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.modalTitle}>{selectedConnector.name}</Text>
                                            <Text style={styles.modalSubtitle}>{selectedConnector.accessScope}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setSelectedConnector(null)}
                                        style={styles.closeBtn}
                                    >
                                        <Ionicons name="close" size={22} color={colors.slate[600]} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.modalBody}>
                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailLabel}>OVERVIEW & DATA ACCESS</Text>
                                        <Text style={styles.detailText}>{selectedConnector.description}</Text>
                                    </View>

                                    <View style={styles.detailGrid}>
                                        <View style={styles.detailGridItem}>
                                            <Text style={styles.gridItemLabel}>Category</Text>
                                            <Text style={styles.gridItemValue}>
                                                {selectedConnector.category.replace('_', ' ').toUpperCase()}
                                            </Text>
                                        </View>

                                        <View style={styles.detailGridItem}>
                                            <Text style={styles.gridItemLabel}>Status</Text>
                                            <Text
                                                style={[
                                                    styles.gridItemValue,
                                                    { color: selectedConnector.status === 'connected' ? colors.success.dark : colors.slate[600] },
                                                ]}
                                            >
                                                {selectedConnector.status.toUpperCase()}
                                            </Text>
                                        </View>

                                        <View style={styles.detailGridItem}>
                                            <Text style={styles.gridItemLabel}>Items Tracked</Text>
                                            <Text style={styles.gridItemValue}>{selectedConnector.itemCount ?? 0}</Text>
                                        </View>

                                        <View style={styles.detailGridItem}>
                                            <Text style={styles.gridItemLabel}>Last Synced</Text>
                                            <Text style={styles.gridItemValue}>{selectedConnector.lastSynced || 'Standby'}</Text>
                                        </View>
                                    </View>
                                </ScrollView>

                                <View style={styles.modalFooter}>
                                    <TouchableOpacity
                                        onPress={() => handleSyncSingle(selectedConnector.id)}
                                        style={styles.syncModalBtn}
                                        activeOpacity={0.8}
                                    >
                                        {syncingId === selectedConnector.id ? (
                                            <ActivityIndicator size="small" color={colors.primary[700]} />
                                        ) : (
                                            <Ionicons name="refresh" size={16} color={colors.primary[700]} />
                                        )}
                                        <Text style={styles.syncModalBtnText}>Sync Now</Text>
                                    </TouchableOpacity>

                                    <View style={{ flex: 1 }}>
                                        <Button
                                            label={selectedConnector.status === 'connected' ? 'Disconnect System' : 'Connect System'}
                                            variant={selectedConnector.status === 'connected' ? 'outline' : 'primary'}
                                            onPress={() => handleToggle(selectedConnector.id)}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Modal>
                )}

                {/* 6. Add Custom API Modal */}
                <Modal
                    visible={isAddModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsAddModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Connect Custom API / Webhook</Text>
                                <TouchableOpacity
                                    onPress={() => setIsAddModalVisible(false)}
                                    style={styles.closeBtn}
                                >
                                    <Ionicons name="close" size={22} color={colors.slate[600]} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                <Input
                                    label="Connector / Service Name"
                                    placeholder="e.g. Local Home Assistant API"
                                    value={apiName}
                                    onChangeText={setApiName}
                                />

                                <Input
                                    label="Endpoint URL"
                                    placeholder="https://api.mydevice.local/v1"
                                    value={apiUrl}
                                    onChangeText={setApiUrl}
                                />

                                <Input
                                    label="API Key / Token (Optional)"
                                    placeholder="Bearer token or secret..."
                                    value={apiKey}
                                    onChangeText={setApiKey}
                                    secureTextEntry
                                />
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <Button
                                    label="Save & Index Connector"
                                    variant="primary"
                                    onPress={handleAddCustomApi}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background.canvas,
        paddingTop: Platform.OS === 'android' ? 32 : 0,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs + 2,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.background.surface,
        borderWidth: 1,
        borderColor: colors.slate[200],
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.subtle,
    },
    headerTitleWrap: {
        flex: 1,
        marginLeft: spacing.md,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: -0.4,
    },
    headerSubtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.text.muted,
        marginTop: 1,
    },
    addApiBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.text.primary,
        paddingVertical: 7,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        gap: 4,
    },
    addApiText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    scanBanner: {
        marginHorizontal: spacing.lg,
        marginVertical: spacing.xs + 2,
        backgroundColor: colors.background.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.slate[200],
        ...shadows.subtle,
    },
    scanContentWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    scanIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    scanTextWrap: {
        flex: 1,
    },
    scanTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.text.primary,
    },
    scanDesc: {
        fontSize: typography.fontSize.xs,
        color: colors.text.muted,
        marginTop: 2,
        lineHeight: 16,
    },
    scanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary[500],
        paddingVertical: 9,
        borderRadius: borderRadius.lg,
        gap: 6,
        ...shadows.subtle,
    },
    scanButtonDisabled: {
        opacity: 0.7,
    },
    scanBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: typography.fontSize.xs + 1,
    },
    scanStepText: {
        fontSize: 11,
        color: colors.primary[700],
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 6,
    },
    filterPillsRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs,
        gap: 6,
    },
    filterPill: {
        paddingVertical: 5,
        paddingHorizontal: spacing.sm + 2,
        borderRadius: borderRadius.full,
        backgroundColor: colors.background.surface,
        borderWidth: 1,
        borderColor: colors.slate[200],
    },
    filterPillActive: {
        backgroundColor: colors.text.primary,
        borderColor: colors.text.primary,
    },
    filterText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    filterTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    scrollList: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xs,
        paddingBottom: spacing['4xl'],
    },
    connectorCard: {
        marginBottom: spacing.sm,
        padding: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrap: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    cardInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    connName: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.text.primary,
    },
    connDesc: {
        fontSize: 11,
        color: colors.text.muted,
        lineHeight: 15,
        marginVertical: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
        marginTop: 2,
    },
    accessScope: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.slate[500],
    },
    lastSyncedText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.primary[700],
    },
    cardActionCluster: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginLeft: spacing.xs,
    },
    microSyncBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleSwitch: {
        width: 44,
        height: 24,
        borderRadius: 12,
        padding: 2,
        justifyContent: 'center',
    },
    toggleOn: {
        backgroundColor: colors.primary[500],
    },
    toggleOff: {
        backgroundColor: colors.slate[300],
    },
    toggleKnob: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        ...shadows.subtle,
    },
    knobOn: {
        alignSelf: 'flex-end',
    },
    knobOff: {
        alignSelf: 'flex-start',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.background.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background.surface,
        borderTopLeftRadius: borderRadius['2xl'],
        borderTopRightRadius: borderRadius['2xl'],
        maxHeight: '85%',
        padding: spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate[100],
    },
    modalTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    modalTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '800',
        color: colors.text.primary,
    },
    modalSubtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.text.muted,
        marginTop: 1,
    },
    closeBtn: {
        padding: spacing.xs,
    },
    modalBody: {
        marginVertical: spacing.sm,
    },
    detailSection: {
        marginBottom: spacing.md,
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.slate[400],
        letterSpacing: 0.8,
        marginBottom: spacing.xs,
    },
    detailText: {
        fontSize: typography.fontSize.xs + 1,
        color: colors.text.primary,
        lineHeight: 20,
    },
    detailGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    detailGridItem: {
        width: '48%',
        backgroundColor: colors.slate[50],
        padding: spacing.sm + 2,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.slate[200],
    },
    gridItemLabel: {
        fontSize: 10,
        color: colors.text.muted,
        fontWeight: '600',
        marginBottom: 2,
    },
    gridItemValue: {
        fontSize: typography.fontSize.xs + 1,
        fontWeight: '700',
        color: colors.text.primary,
    },
    modalFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    syncModalBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: 'rgba(2, 132, 199, 0.3)',
        gap: 4,
    },
    syncModalBtnText: {
        fontSize: typography.fontSize.xs + 1,
        fontWeight: '700',
        color: colors.primary[700],
    },
});

export default ConnectorsScreen;
