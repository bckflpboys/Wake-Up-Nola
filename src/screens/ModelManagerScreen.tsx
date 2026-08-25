/**
 * Model Manager Screen - On-Device SLMs, Desktop LAN, and OpenRouter Cloud
 * Progressive disclosure with filter tags, live connection testers, and back navigation
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
    Modal,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNola } from '../contexts/NolaContext';
import { ModelCard } from '../components/molecules/ModelCard';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

interface ModelManagerScreenProps {
    onNavigateBack?: () => void;
}

type ModelTab = 'all' | 'on-device' | 'lan-desktop' | 'cloud';

export const ModelManagerScreen: React.FC<ModelManagerScreenProps> = ({
    onNavigateBack,
}) => {
    const {
        activeModel,
        availableModels,
        setActiveModel,
        lanEndpoint,
        setLanEndpoint,
        openRouterApiKey,
        setOpenRouterApiKey,
        testOpenRouterConnection,
        testLanConnection,
        isOfflineMode,
        toggleOfflineMode,
    } = useNola();

    const [selectedTab, setSelectedTab] = useState<ModelTab>('all');
    const [isLanModalVisible, setIsLanModalVisible] = useState(false);
    const [isOpenRouterModalVisible, setIsOpenRouterModalVisible] = useState(false);

    const [endpointInput, setEndpointInput] = useState(lanEndpoint);
    const [apiKeyInput, setApiKeyInput] = useState(openRouterApiKey);

    const [isTestingLan, setIsTestingLan] = useState(false);
    const [lanTestResult, setLanTestResult] = useState<string | null>(null);

    const [isTestingOpenRouter, setIsTestingOpenRouter] = useState(false);
    const [openRouterTestResult, setOpenRouterTestResult] = useState<string | null>(null);

    const handleSaveLanEndpoint = () => {
        if (!endpointInput.trim()) {
            Alert.alert('Invalid Endpoint', 'Please enter a valid LAN URL (e.g. http://192.168.1.100:11434)');
            return;
        }

        setLanEndpoint(endpointInput.trim());
        setIsLanModalVisible(false);
    };

    const handleTestLan = async () => {
        setIsTestingLan(true);
        setLanTestResult(null);
        try {
            const res = await testLanConnection(endpointInput.trim());
            setLanTestResult(res.message);
        } finally {
            setIsTestingLan(false);
        }
    };

    const handleSaveOpenRouterKey = () => {
        setOpenRouterApiKey(apiKeyInput.trim());
        setIsOpenRouterModalVisible(false);
    };

    const handleTestOpenRouter = async () => {
        setIsTestingOpenRouter(true);
        setOpenRouterTestResult(null);
        try {
            const res = await testOpenRouterConnection(apiKeyInput.trim());
            setOpenRouterTestResult(res.message);
        } finally {
            setIsTestingOpenRouter(false);
        }
    };

    const filteredModels = availableModels.filter(m => {
        if (selectedTab === 'all') return true;
        return m.type === selectedTab;
    });

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
                        <Text style={styles.headerTitle}>AI Model Hub</Text>
                        <Text style={styles.headerSubtitle} numberOfLines={1}>
                            Active: {activeModel.name}
                        </Text>
                    </View>

                    {/* Strict Offline Toggle */}
                    <TouchableOpacity
                        onPress={toggleOfflineMode}
                        style={[
                            styles.offlineToggle,
                            isOfflineMode ? styles.offlineActive : styles.offlineInactive,
                        ]}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={isOfflineMode ? 'airplane' : 'globe-outline'}
                            size={13}
                            color={isOfflineMode ? '#FFFFFF' : colors.text.secondary}
                        />
                        <Text
                            style={[
                                styles.offlineText,
                                isOfflineMode && styles.offlineTextActive,
                            ]}
                        >
                            {isOfflineMode ? 'OFFLINE' : 'HYBRID'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* 2. Model Directory & Credentials Banner */}
                <View style={styles.banner}>
                    <Ionicons name="hardware-chip-outline" size={20} color={colors.primary[600]} />
                    <View style={styles.bannerTextWrap}>
                        <Text style={styles.bannerTitle}>Multi-Backend Inference</Text>
                        <Text style={styles.bannerDesc}>
                            Runs small models locally on-device. Connects to desktop Ollama on WiFi or OpenRouter for frontier cloud AI.
                        </Text>
                    </View>
                </View>

                {/* 3. Filter Tabs */}
                <View style={styles.filterRow}>
                    <TouchableOpacity
                        onPress={() => setSelectedTab('all')}
                        style={[styles.filterPill, selectedTab === 'all' && styles.filterPillActive]}
                    >
                        <Text style={[styles.filterText, selectedTab === 'all' && styles.filterTextActive]}>
                            All ({availableModels.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setSelectedTab('on-device')}
                        style={[styles.filterPill, selectedTab === 'on-device' && styles.filterPillActive]}
                    >
                        <Text style={[styles.filterText, selectedTab === 'on-device' && styles.filterTextActive]}>
                            On-Device SLMs
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setSelectedTab('lan-desktop')}
                        style={[styles.filterPill, selectedTab === 'lan-desktop' && styles.filterPillActive]}
                    >
                        <Text style={[styles.filterText, selectedTab === 'lan-desktop' && styles.filterTextActive]}>
                            Desktop LAN
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setSelectedTab('cloud')}
                        style={[styles.filterPill, selectedTab === 'cloud' && styles.filterPillActive]}
                    >
                        <Text style={[styles.filterText, selectedTab === 'cloud' && styles.filterTextActive]}>
                            OpenRouter
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* 4. Quick Config Actions Row */}
                <View style={styles.quickActionsRow}>
                    {/* OpenRouter Config Button */}
                    <TouchableOpacity
                        onPress={() => setIsOpenRouterModalVisible(true)}
                        style={styles.configPillBtn}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="key-outline" size={14} color={colors.primary[600]} />
                        <Text style={styles.configPillText}>
                            {openRouterApiKey ? 'OpenRouter Connected' : 'Configure OpenRouter Key'}
                        </Text>
                    </TouchableOpacity>

                    {/* Desktop LAN Config Button */}
                    <TouchableOpacity
                        onPress={() => setIsLanModalVisible(true)}
                        style={styles.configPillBtn}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="wifi-outline" size={14} color={colors.accent[600]} />
                        <Text style={styles.configPillText}>Desktop LAN IP</Text>
                    </TouchableOpacity>
                </View>

                {/* 5. Models List */}
                <ScrollView
                    style={styles.scrollList}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredModels.map(model => (
                        <ModelCard
                            key={model.id}
                            model={model}
                            isActive={model.modelKey === activeModel.modelKey}
                            onSelect={() => setActiveModel(model.modelKey)}
                        />
                    ))}
                </ScrollView>

                {/* Configure OpenRouter Key Modal */}
                <Modal
                    visible={isOpenRouterModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsOpenRouterModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Ionicons name="key-outline" size={20} color={colors.primary[600]} />
                                    <Text style={styles.modalTitle}>OpenRouter API Key</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setIsOpenRouterModalVisible(false)}
                                    style={styles.closeBtn}
                                >
                                    <Ionicons name="close" size={22} color={colors.slate[600]} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                <Text style={styles.modalHelp}>
                                    OpenRouter provides access to Gemini 2.0 Flash, DeepSeek-R1, Qwen 2.5 72B, and Llama 3.3. Enter your API key from openrouter.ai/keys below:
                                </Text>

                                <Input
                                    label="OpenRouter API Key"
                                    placeholder="sk-or-v1-..."
                                    value={apiKeyInput}
                                    onChangeText={setApiKeyInput}
                                    secureTextEntry
                                />

                                {openRouterTestResult && (
                                    <View style={styles.testResultBox}>
                                        <Ionicons name="information-circle-outline" size={16} color={colors.primary[600]} />
                                        <Text style={styles.testResultText}>{openRouterTestResult}</Text>
                                    </View>
                                )}
                            </ScrollView>

                            <View style={styles.modalFooterRow}>
                                <TouchableOpacity
                                    onPress={handleTestOpenRouter}
                                    disabled={isTestingOpenRouter}
                                    style={styles.testBtn}
                                    activeOpacity={0.8}
                                >
                                    {isTestingOpenRouter ? (
                                        <ActivityIndicator size="small" color={colors.text.primary} />
                                    ) : (
                                        <Text style={styles.testBtnText}>Test Key</Text>
                                    )}
                                </TouchableOpacity>

                                <View style={{ flex: 1 }}>
                                    <Button
                                        label="Save Key"
                                        variant="primary"
                                        onPress={handleSaveOpenRouterKey}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Configure Desktop LAN Modal */}
                <Modal
                    visible={isLanModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsLanModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Ionicons name="wifi-outline" size={20} color={colors.accent[600]} />
                                    <Text style={styles.modalTitle}>Desktop Ollama LAN Endpoint</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setIsLanModalVisible(false)}
                                    style={styles.closeBtn}
                                >
                                    <Ionicons name="close" size={22} color={colors.slate[600]} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                <Text style={styles.modalHelp}>
                                    Run Ollama on your PC or Mac on the same WiFi network and enter its IP address below (e.g. http://192.168.1.100:11434).
                                </Text>

                                <Input
                                    label="LAN Endpoint URL"
                                    placeholder="http://192.168.1.100:11434"
                                    value={endpointInput}
                                    onChangeText={setEndpointInput}
                                />

                                {lanTestResult && (
                                    <View style={styles.testResultBox}>
                                        <Ionicons name="information-circle-outline" size={16} color={colors.primary[600]} />
                                        <Text style={styles.testResultText}>{lanTestResult}</Text>
                                    </View>
                                )}
                            </ScrollView>

                            <View style={styles.modalFooterRow}>
                                <TouchableOpacity
                                    onPress={handleTestLan}
                                    disabled={isTestingLan}
                                    style={styles.testBtn}
                                    activeOpacity={0.8}
                                >
                                    {isTestingLan ? (
                                        <ActivityIndicator size="small" color={colors.text.primary} />
                                    ) : (
                                        <Text style={styles.testBtnText}>Ping Endpoint</Text>
                                    )}
                                </TouchableOpacity>

                                <View style={{ flex: 1 }}>
                                    <Button
                                        label="Save LAN IP"
                                        variant="primary"
                                        onPress={handleSaveLanEndpoint}
                                    />
                                </View>
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
    offlineToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        borderWidth: 1,
    },
    offlineActive: {
        backgroundColor: colors.primary[500],
        borderColor: colors.primary[500],
    },
    offlineInactive: {
        backgroundColor: colors.background.surface,
        borderColor: colors.slate[200],
    },
    offlineText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.text.secondary,
        marginLeft: 4,
    },
    offlineTextActive: {
        color: '#FFFFFF',
    },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.lg,
        marginVertical: spacing.xs + 2,
        backgroundColor: colors.background.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.slate[200],
        ...shadows.subtle,
    },
    bannerTextWrap: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    bannerTitle: {
        fontSize: typography.fontSize.xs + 1,
        fontWeight: '700',
        color: colors.text.primary,
    },
    bannerDesc: {
        fontSize: 11,
        color: colors.text.muted,
        marginTop: 2,
        lineHeight: 16,
    },
    filterRow: {
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
    quickActionsRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs,
        gap: spacing.sm,
    },
    configPillBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background.surface,
        paddingVertical: 7,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.slate[200],
        gap: 5,
        ...shadows.subtle,
    },
    configPillText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.text.primary,
    },
    scrollList: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xs,
        paddingBottom: spacing['4xl'],
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
    modalTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '800',
        color: colors.text.primary,
    },
    closeBtn: {
        padding: spacing.xs,
    },
    modalBody: {
        marginVertical: spacing.sm,
    },
    modalHelp: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        lineHeight: 18,
        marginBottom: spacing.md,
    },
    testResultBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        padding: spacing.sm + 2,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: 'rgba(2, 132, 199, 0.2)',
        marginTop: spacing.sm,
        gap: spacing.xs,
    },
    testResultText: {
        fontSize: typography.fontSize.xs,
        color: colors.primary[700],
        fontWeight: '600',
        flex: 1,
    },
    modalFooterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    testBtn: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.slate[100],
        borderWidth: 1,
        borderColor: colors.slate[300],
        alignItems: 'center',
        justifyContent: 'center',
    },
    testBtnText: {
        fontSize: typography.fontSize.xs + 1,
        fontWeight: '700',
        color: colors.text.primary,
    },
});

export default ModelManagerScreen;
