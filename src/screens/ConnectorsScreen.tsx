/**
 * Connectors Screen - Device Apps & API Integration Hub
 * Scans, connects, and indexes all apps, APIs, files, and local endpoints on the device
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
    onNavigateChat?: () => void;
}

export const ConnectorsScreen: React.FC<ConnectorsScreenProps> = ({ onNavigateChat }) => {
    const [connectors, setConnectors] = useState<DeviceConnector[]>(connectorService.getConnectors());
    const [isScanning, setIsScanning] = useState(false);
    const [scanMessage, setScanMessage] = useState('');
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
        setConnectors([...connectorService.getConnectors()]);
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

    const connectedCount = connectors.filter(c => c.status === 'connected').length;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Connectors & APIs</Text>
                        <Text style={styles.headerSubtitle}>
                            {connectedCount} of {connectors.length} device systems connected to Nola
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setIsAddModalVisible(true)}
                        style={styles.addApiBtn}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={18} color="#FFFFFF" />
                        <Text style={styles.addApiText}>Add API</Text>
                    </TouchableOpacity>
                </View>

                {/* Deep Device Scan Action Card */}
                <View style={styles.scanBanner}>
                    <View style={styles.scanContentWrap}>
                        <View style={styles.scanIconBox}>
                            <Ionicons name="scan-circle" size={32} color={colors.primary[500]} />
                        </View>
                        <View style={styles.scanTextWrap}>
                            <Text style={styles.scanTitle}>Deep Device Scanner</Text>
                            <Text style={styles.scanDesc}>
                                Scan and grant Nola access to your calendar, shared vault, contacts, and local WiFi LAN.
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
                            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                        )}
                        <Text style={styles.scanBtnText}>
                            {isScanning ? 'Scanning Device...' : 'Scan & Sync Everything'}
                        </Text>
                    </TouchableOpacity>

                    {isScanning && scanMessage ? (
                        <Text style={styles.scanStepText}>⚡ {scanMessage}</Text>
                    ) : null}
                </View>

                {/* Connectors List */}
                <ScrollView
                    style={styles.scrollList}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Category: Local Data & Vault */}
                    <Text style={styles.categoryTitle}>Local Device & Storage</Text>
                    {connectors
                        .filter(c => c.category === 'local_data' || c.category === 'device_app')
                        .map(conn => {
                            const isConnected = conn.status === 'connected';
                            return (
                                <Card key={conn.id} variant="default" style={styles.connectorCard}>
                                    <View style={styles.cardHeader}>
                                        <View style={[styles.iconWrap, { backgroundColor: isConnected ? 'rgba(2, 132, 199, 0.1)' : colors.slate[100] }]}>
                                            <Ionicons
                                                name={conn.icon as any}
                                                size={22}
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
                                            <Text style={styles.connDesc}>{conn.description}</Text>
                                            <View style={styles.metaRow}>
                                                <Text style={styles.accessScope}>🔒 {conn.accessScope}</Text>
                                                {conn.lastSynced && (
                                                    <Text style={styles.lastSynced}>• {conn.lastSynced}</Text>
                                                )}
                                            </View>
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

                    {/* Category: AI Endpoints & APIs */}
                    <Text style={styles.categoryTitle}>AI Models & External APIs</Text>
                    {connectors
                        .filter(c => c.category === 'ai_endpoint' || c.category === 'cloud_api')
                        .map(conn => {
                            const isConnected = conn.status === 'connected';
                            return (
                                <Card key={conn.id} variant="default" style={styles.connectorCard}>
                                    <View style={styles.cardHeader}>
                                        <View style={[styles.iconWrap, { backgroundColor: isConnected ? 'rgba(13, 148, 136, 0.1)' : colors.slate[100] }]}>
                                            <Ionicons
                                                name={conn.icon as any}
                                                size={22}
                                                color={isConnected ? colors.accent[600] : colors.slate[400]}
                                            />
                                        </View>

                                        <View style={styles.cardInfo}>
                                            <View style={styles.titleRow}>
                                                <Text style={styles.connName}>{conn.name}</Text>
                                                <Badge
                                                    label={isConnected ? 'ACTIVE' : 'OFFLINE'}
                                                    variant={isConnected ? 'accent' : 'default'}
                                                    size="sm"
                                                />
                                            </View>
                                            <Text style={styles.connDesc}>{conn.description}</Text>
                                            <View style={styles.metaRow}>
                                                <Text style={styles.accessScope}>⚡ {conn.accessScope}</Text>
                                            </View>
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

                {/* Add Custom API Modal */}
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
                                    <Ionicons name="close" size={24} color={colors.slate[600]} />
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
        backgroundColor: colors.background.primary,
        paddingTop: Platform.OS === 'android' ? 30 : 0,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.text.muted,
        marginTop: 2,
    },
    addApiBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.text.primary,
        paddingVertical: 7,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        ...shadows.sm,
    },
    addApiText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 4,
    },
    scanBanner: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(2, 132, 199, 0.15)',
        ...shadows.sm,
    },
    scanContentWrap: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
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
        fontSize: typography.fontSize.base,
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
        paddingVertical: spacing.sm + 2,
        borderRadius: borderRadius.lg,
        ...shadows.glowBlue,
    },
    scanButtonDisabled: {
        backgroundColor: colors.slate[400],
    },
    scanBtnText: {
        fontSize: typography.fontSize.sm,
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
    scrollList: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing['4xl'],
    },
    categoryTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.text.muted,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    connectorCard: {
        marginBottom: spacing.sm,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(15, 23, 42, 0.06)',
        ...shadows.subtle,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconWrap: {
        width: 42,
        height: 42,
        borderRadius: borderRadius.md,
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
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        marginTop: 2,
        lineHeight: 16,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    accessScope: {
        fontSize: 10,
        color: colors.primary[600],
        fontWeight: '600',
    },
    lastSynced: {
        fontSize: 10,
        color: colors.text.muted,
        marginLeft: 4,
    },
    toggleSwitch: {
        width: 44,
        height: 24,
        borderRadius: 12,
        padding: 2,
        marginLeft: spacing.sm,
        marginTop: 2,
    },
    toggleOn: {
        backgroundColor: colors.success.main,
    },
    toggleOff: {
        backgroundColor: colors.slate[300],
    },
    toggleKnob: {
        width: 20,
        height: 20,
        borderRadius: 10,
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
        backgroundColor: '#FFFFFF',
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
    modalTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
        color: colors.text.primary,
    },
    closeBtn: {
        padding: spacing.xs,
    },
    modalBody: {
        maxHeight: 340,
        marginVertical: spacing.sm,
    },
    modalFooter: {
        marginTop: spacing.md,
    },
});

export default ConnectorsScreen;
