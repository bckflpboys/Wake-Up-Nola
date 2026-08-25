/**
 * Model Manager Screen - On-Device SLMs, Desktop LAN, and Cloud
 * Configure Google Gemma 4, Alibaba Qwen 3.5, Phi-4, DeepSeek, and LAN Ollama
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

export const ModelManagerScreen: React.FC = () => {
    const {
        activeModel,
        availableModels,
        setActiveModel,
        lanEndpoint,
        setLanEndpoint,
        isOfflineMode,
        toggleOfflineMode,
    } = useNola();

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

    const onDeviceModels = availableModels.filter(m => m.type === 'on-device');
    const lanModels = availableModels.filter(m => m.type === 'lan-desktop');
    const cloudModels = availableModels.filter(m => m.type === 'cloud');

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>AI Model Hub</Text>
                        <Text style={styles.headerSubtitle}>
                            Active: {activeModel.name}
                        </Text>
                    </View>

                    {/* Strict Offline Mode Toggle */}
                    <TouchableOpacity
                        onPress={toggleOfflineMode}
                        style={[
                            styles.offlineToggle,
                            isOfflineMode ? styles.offlineActive : styles.offlineInactive,
                        ]}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={isOfflineMode ? 'airplane' : 'globe'}
                            size={14}
                            color={isOfflineMode ? '#FFFFFF' : colors.text.secondary}
                        />
                        <Text
                            style={[
                                styles.offlineText,
                                isOfflineMode && styles.offlineTextActive,
                            ]}
                        >
                            {isOfflineMode ? 'OFFLINE ONLY' : 'HYBRID'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Storage Guide Banner */}
                <View style={styles.banner}>
                    <Ionicons name="folder-outline" size={20} color={colors.primary[600]} />
                    <View style={styles.bannerTextWrap}>
                        <Text style={styles.bannerTitle}>GGUF Model Directory</Text>
                        <Text style={styles.bannerDesc}>
                            Place downloaded .gguf models in assets/models/ to activate them on-device.
                        </Text>
                    </View>
                </View>

                {/* Models List */}
                <ScrollView
                    style={styles.scrollList}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* On-Device SLMs */}
                    <Text style={styles.sectionTitle}>On-Device Edge Models (Phone Native)</Text>
                    {onDeviceModels.map(model => (
                        <ModelCard
                            key={model.id}
                            model={model}
                            isActive={model.modelKey === activeModel.modelKey}
                            onSelect={() => setActiveModel(model.modelKey)}
                        />
                    ))}

                    {/* Local WiFi LAN */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Desktop LAN (Ollama / Local Server)</Text>
                        <TouchableOpacity
                            onPress={() => setIsLanModalVisible(true)}
                            style={styles.editLanBtn}
                        >
                            <Text style={styles.editLanText}>Configure IP</Text>
                        </TouchableOpacity>
                    </View>
                    {lanModels.map(model => (
                        <ModelCard
                            key={model.id}
                            model={model}
                            isActive={model.modelKey === activeModel.modelKey}
                            onSelect={() => setActiveModel(model.modelKey)}
                        />
                    ))}

                    {/* Cloud Models */}
                    <Text style={styles.sectionTitle}>Cloud Intelligence (Online Fallback)</Text>
                    {cloudModels.map(model => (
                        <ModelCard
                            key={model.id}
                            model={model}
                            isActive={model.modelKey === activeModel.modelKey}
                            onSelect={() => setActiveModel(model.modelKey)}
                        />
                    ))}
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
                                    <Ionicons name="close" size={24} color={colors.slate[600]} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                <Text style={styles.modalHelp}>
                                    Run Ollama on your PC or Mac on the same WiFi network and enter its IP address below (e.g. OLLAMA_HOST=0.0.0.0:11434).
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
        backgroundColor: '#FFFFFF',
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
        marginBottom: spacing.sm,
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(2, 132, 199, 0.15)',
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
    scrollList: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing['3xl'],
    },
    sectionTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.text.muted,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    editLanBtn: {
        paddingVertical: 2,
        paddingHorizontal: spacing.sm,
    },
    editLanText: {
        fontSize: typography.fontSize.xs,
        color: colors.primary[600],
        fontWeight: '700',
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
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
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
