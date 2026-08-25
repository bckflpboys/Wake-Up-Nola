/**
 * Connectors Screen - Device Apps & API Integration Hub
 * Progressive disclosure with categorized tabs, clean cards, and back navigation
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
                                Scan local storage, calendar, contacts, and WiFi LAN endpoints.
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
                            <Ionicons name="sparkles" size={15} color="#FFFFFF" />
                        )}
                        <Text style={styles.scanBtnText}>
                            {isScanning ? 'Scanning Everything...' : 'Scan & Sync Device'}
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
                                        <Text style={styles.connDesc} numberOfLines={1}>{conn.description}</Text>
                                        <Text style={styles.accessScope}>🔒 {conn.accessScope}</Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => handleToggle(conn.id)}
                                        style={[styles.toggleSwitch, isConnected ? styles.toggleOn : styles.toggleOff]}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[styles.toggleKnob, isConnected ? styles.knobOn : styles.knobOff]} />
                                    </TouchableOpacity>
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
                                        <View>
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
                                    <Text style={styles.detailSectionLabel}>Description</Text>
                                    <Text style={styles.detailText}>{selectedConnector.description}</Text>

                                    <Text style={styles.detailSectionLabel}>Access Scope & Privacy</Text>
                                    <View style={styles.privacyBox}>
                                        <Ionicons name="shield-checkmark-outline" size={16} color={colors.success.main} />
                                        <Text style={styles.privacyText}>
                                            Private on-device access only. No sensitive data is transferred to external third-party cloud servers.
                                        </Text>
                                    </View>

                                    {selectedConnector.lastSynced && (
                                        <Text style={styles.lastSyncText}>Status: {selectedConnector.lastSynced}</Text>
                                    )}
                                </ScrollView>

                                <View style={styles.modalFooter}>
                                    <Button
                                        label={selectedConnector.status === 'connected' ? 'Disconnect System' : 'Connect & Enable'}
                                        variant={selectedConnector.status === 'connected' ? 'outline' : 'primary'}
                                        onPress={() => handleToggle(selectedConnector.id)}
                                    />
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
                                <Text style={styles.modalTitle}>Connect Custom App or API</Text>
                                <TouchableOpacity
                                    onPress={() => setIsAddModalVisible(false)}
                                    style={styles.closeBtn}
                                >
                                    <Ionicons name="close" size={22} color={colors.slate[600]} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                <Input
                                    label="Connector Name"
                                    placeholder="e.g. Local LM Studio or Custom Webhook"
                                    value={apiName}
                                    onChangeText={setApiName}
                                />
                                <Input
                                    label="Endpoint URL"
                                    placeholder="e.g. http://192.168.1.50:1234/v1"
                                    value={apiUrl}
                                    onChangeText={setApiUrl}
                                />
                                <Input
                                    label="API Key / Token (Optional)"
                                    placeholder="Bearer token or leave blank for local LAN"
                                    value={apiKey}
                                    onChangeText={setApiKey}
                                    secureTextEntry
                                />
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <Button
                                    label="Save and Connect"
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
        ...shadows.subtle,
    },
    addApiText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 4,
    },
    scanBanner: {
        marginHorizontal: spacing.lg,
        marginVertical: spacing.xs + 2,
        backgroundColor: colors.background.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.slate[200],
        ...shadows.card,
    },
    scanContentWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    scanIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    scanTextWrap: {
        flex: 1,
    },
    scanTitle: {
        fontSize: typography.fontSize.sm + 1,
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
        paddingVertical: spacing.sm + 1,
        borderRadius: borderRadius.lg,
        ...shadows.glowBlue,
    },
    scanButtonDisabled: {
        backgroundColor: colors.slate[400],
    },
    scanBtnText: {
        fontSize: typography.fontSize.xs + 1,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 6,
    },
    scanStepText: {
        fontSize: typography.fontSize.xs,
        color: colors.primary[600],
        fontWeight: '600',
        textAlign: 'center',
        marginTop: spacing.xs,
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
        marginBottom: spacing.xs + 4,
        backgroundColor: colors.background.surface,
        borderWidth: 1,
        borderColor: colors.slate[200],
        ...shadows.subtle,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrap: {
        width: 38,
        height: 38,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
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
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        marginTop: 1,
    },
    accessScope: {
        fontSize: 10,
        color: colors.primary[600],
        fontWeight: '600',
        marginTop: 3,
    },
    toggleSwitch: {
        width: 40,
        height: 22,
        borderRadius: 11,
        padding: 2,
        marginLeft: spacing.sm,
    },
    toggleOn: {
        backgroundColor: colors.success.main,
    },
    toggleOff: {
        backgroundColor: colors.slate[300],
    },
    toggleKnob: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#FFFFFF',
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
        fontSize: 11,
        color: colors.primary[600],
        fontWeight: '600',
        marginTop: 1,
    },
    closeBtn: {
        padding: spacing.xs,
    },
    modalBody: {
        maxHeight: 340,
        marginVertical: spacing.sm,
    },
    detailSectionLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.text.muted,
        textTransform: 'uppercase',
        marginTop: spacing.sm,
        marginBottom: 4,
    },
    detailText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.primary,
        lineHeight: 20,
    },
    privacyBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.slate[50],
        padding: spacing.sm + 2,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.slate[200],
        marginTop: spacing.xs,
        gap: spacing.xs,
    },
    privacyText: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        flex: 1,
        lineHeight: 16,
    },
    lastSyncText: {
        fontSize: 11,
        color: colors.text.muted,
        marginTop: spacing.md,
    },
    modalFooter: {
        marginTop: spacing.md,
    },
});

export default ConnectorsScreen;
