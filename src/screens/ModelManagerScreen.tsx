/**
 * Model Manager Screen - On-Device SLMs, Desktop LAN, and Cloud
 * Progressive disclosure with filter tags, memory meters, and back navigation
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
        isOfflineMode,
        toggleOfflineMode,
    } = useNola();

    const [selectedTab, setSelectedTab] = useState<ModelTab>('all');
    const [isLanModalVisible, setIsLanModalVisible] = useState(false);
    const [endpointInput, setEndpointInput] = useState(lanEndpoint);

    const handleSaveLanEndpoint = () => {
        if (!endpointInput.trim()) {
            Alert.alert('Invalid Endpoint', 'Please enter a valid LAN URL (e.g. http://192.168.1.100:11434)');
            return;
        }

        setLanEndpoint(endpointInput.trim());
        setIsLanModalVisible(false);
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
                        <Text style={styles.headerSubtitle}>
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

                {/* 2. GGUF Model Directory Banner */}
                <View style={styles.banner}>
                    <Ionicons name="folder-outline" size={18} color={colors.primary[600]} />
                    <View style={styles.bannerTextWrap}>
                        <Text style={styles.bannerTitle}>GGUF Model Directory</Text>
                        <Text style={styles.bannerDesc}>
                            Drop downloaded .gguf models into assets/models/ to load them locally.
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
                            On-Device Mobile
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
                            Cloud
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* 4. Models List */}
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

                    {/* Configure LAN Action Box */}
                    {selectedTab === 'all' || selectedTab === 'lan-desktop' ? (
                        <TouchableOpacity
                            onPress={() => setIsLanModalVisible(true)}
                            style={styles.lanConfigCard}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="wifi-outline" size={20} color={colors.primary[600]} />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.lanConfigTitle}>Configure Desktop LAN Endpoint</Text>
                                <Text style={styles.lanConfigSub}>Current: {lanEndpoint}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={colors.slate[400]} />
                        </TouchableOpacity>
                    ) : null}
                </ScrollView>

                {/* Configure LAN Modal */}
                <Modal
                    visible={isLanModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsLanModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Desktop Ollama LAN Endpoint</Text>
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
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <Button
                                    label="Connect to Desktop Ollama"
                                    variant="primary"
                                    onPress={handleSaveLanEndpoint}
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
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.text.primary,
    },
    bannerDesc: {
        fontSize: 11,
        color: colors.text.muted,
        marginTop: 1,
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
    scrollList: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xs,
        paddingBottom: spacing['4xl'],
    },
    lanConfigCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(2, 132, 199, 0.2)',
        marginTop: spacing.sm,
        ...shadows.subtle,
    },
    lanConfigTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.text.primary,
    },
    lanConfigSub: {
        fontSize: 11,
        color: colors.primary[600],
        marginTop: 2,
        fontFamily: 'monospace',
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
        maxHeight: '80%',
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
    modalFooter: {
        marginTop: spacing.md,
    },
});

export default ModelManagerScreen;
