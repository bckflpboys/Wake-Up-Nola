/**
 * Chat Screen - Main Workspace & Standby Agent
 * Features:
 * - AttachmentModal (Document upload, Camera capture, Gallery picker, Instant note)
 * - VoiceStudioModal (Live animated equalizer, recording, speech-to-text)
 * - Rich Multi-Modal Message Bubbles with code copy and file preview
 * - Roll-in / Roll-out composer with single bottom bar
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Modal,
    Pressable,
    Keyboard,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNola } from '../contexts/NolaContext';
import { useVault } from '../contexts/VaultContext';
import { StepExecutionViewer } from '../components/molecules/StepExecutionViewer';
import { RichMessageBubble } from '../components/molecules/RichMessageBubble';
import { EmbroideredBrandLogo } from '../components/atoms/EmbroideredBrandLogo';
import { AttachmentModal } from '../components/molecules/AttachmentModal';
import { VoiceStudioModal } from '../components/molecules/VoiceStudioModal';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

interface ChatScreenProps {
    isComposing?: boolean;
    onToggleCompose?: (composing: boolean) => void;
    onNavigateTab?: (tab: 'chat' | 'connectors' | 'vault' | 'tasks' | 'models') => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
    isComposing = false,
    onToggleCompose,
    onNavigateTab,
}) => {
    const {
        activeModel,
        availableModels,
        setActiveModel,
        isListening,
        isProcessing,
        activeSteps,
        messages,
        sendMessage,
        clearChatHistory,
    } = useNola();

    const { documents } = useVault();

    const [input, setInput] = useState('');
    const [showModelPicker, setShowModelPicker] = useState(false);
    const [showSkillsModal, setShowSkillsModal] = useState(false);
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; type: string; uri?: string; content?: string }>>([]);

    const inputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const hasUserMessages = messages.some(m => m.role === 'user');

    useEffect(() => {
        if (hasUserMessages) {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages, activeSteps, hasUserMessages]);

    const handleInputChange = (text: string) => {
        setInput(text);
        if (text.length > 0 && !isComposing) {
            onToggleCompose?.(true);
        }
    };

    const handleFocusInput = () => {
        onToggleCompose?.(true);
    };

    const handleCollapseComposer = () => {
        Keyboard.dismiss();
        onToggleCompose?.(false);
    };

    const handleSend = async () => {
        if ((!input.trim() && attachedFiles.length === 0) || isProcessing) return;

        let fullPrompt = input.trim();
        if (attachedFiles.length > 0) {
            const filesContext = attachedFiles.map(f => `[ATTACHMENT: ${f.name}]\n${f.content || ''}`).join('\n\n');
            fullPrompt = `${fullPrompt}\n\n${filesContext}`.trim();
        }

        setInput('');
        setAttachedFiles([]);
        try {
            await sendMessage(fullPrompt);
        } catch (e) {
            console.warn('Send message error:', e);
        }
    };

    const handleQuickPrompt = async (prompt: string) => {
        setInput(prompt);
        onToggleCompose?.(true);
        await sendMessage(prompt);
    };

    const handleAttachFile = (fileInfo: { name: string; content?: string; type: string; uri?: string }) => {
        setAttachedFiles(prev => [...prev, fileInfo]);
        onToggleCompose?.(true);
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                {/* 1. Top Minimalist Header */}
                <View style={styles.topNav}>
                    <TouchableOpacity
                        onPress={() => onNavigateTab?.('connectors')}
                        style={styles.iconCircleBtn}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={17} color={colors.text.primary} />
                    </TouchableOpacity>

                    {/* Embroidered Brand Logo - Splash Screen Patch Style */}
                    <EmbroideredBrandLogo size="md" />

                    {/* Right Action Cluster */}
                    <View style={styles.rightNavCluster}>
                        {/* Voice Studio Trigger */}
                        <TouchableOpacity
                            onPress={() => setShowVoiceModal(true)}
                            style={[styles.iconCircleBtn, isListening && styles.iconCircleBtnActive]}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="mic"
                                size={16}
                                color={isListening ? colors.error.dark : colors.text.primary}
                            />
                        </TouchableOpacity>

                        {/* Clear / New Chat */}
                        <TouchableOpacity
                            onPress={clearChatHistory}
                            style={styles.iconCircleBtn}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add-outline" size={17} color={colors.text.primary} />
                        </TouchableOpacity>

                        {/* Settings & Connectors Hub */}
                        <TouchableOpacity
                            onPress={() => onNavigateTab?.('connectors')}
                            style={styles.iconCircleBtn}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="settings-outline" size={15} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 2. Sub-Context Pills Bar */}
                <View style={styles.contextBar}>
                    <TouchableOpacity
                        onPress={() => onNavigateTab?.('vault')}
                        style={styles.contextPill}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="cube-outline" size={13} color={colors.text.primary} />
                        <Text style={styles.contextPillText}>Vault</Text>
                        <Text style={styles.contextPillDivider}>|</Text>
                        <Ionicons name="git-branch-outline" size={12} color={colors.text.secondary} />
                        <Text style={styles.contextPillSub}>{documents.length} docs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setShowModelPicker(true)}
                        style={styles.contextPill}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="hardware-chip-outline" size={13} color={colors.primary[600]} />
                        <Text style={styles.contextPillText} numberOfLines={1}>
                            {activeModel.name.split(' ')[0]}
                        </Text>
                        <Ionicons name="chevron-down" size={10} color={colors.text.secondary} style={{ marginLeft: 2 }} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onNavigateTab?.('tasks')}
                        style={styles.contextPill}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="checkbox-outline" size={13} color={colors.accent[600]} />
                        <Text style={styles.contextPillText}>Agenda</Text>
                    </TouchableOpacity>
                </View>

                {/* 3. Main Body: Scrollable Flow */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollArea}
                    contentContainerStyle={[
                        styles.scrollContent,
                        !hasUserMessages && styles.scrollContentHero,
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* === HERO MODE (Initial Landing) === */}
                    {!hasUserMessages ? (
                        <View style={styles.heroWrapper}>
                            {/* Spherical Assistant Wireframe Orb */}
                            <View style={styles.heroOrbContainer}>
                                <View style={styles.heroOrbGlow} />
                                <View style={styles.heroOrbCircle}>
                                    <Ionicons name="planet-outline" size={38} color={colors.slate[800]} />
                                </View>
                            </View>

                            {/* Headline Greeting */}
                            <Text style={styles.heroTitle}>What shall we do,{'\n'}Alex?</Text>

                            {/* Floating Central Input Card */}
                            <View style={styles.heroCard}>
                                <TextInput
                                    style={styles.heroTextInput}
                                    placeholder="Type '/' to invoke plugins and skills or ask anything..."
                                    placeholderTextColor={colors.slate[400]}
                                    value={input}
                                    onChangeText={handleInputChange}
                                    onFocus={handleFocusInput}
                                    multiline
                                />

                                {/* Attached Files Chips in Hero Card */}
                                {attachedFiles.length > 0 && (
                                    <View style={styles.attachmentPillRow}>
                                        {attachedFiles.map((file, idx) => (
                                            <View key={`hero-att-${idx}`} style={styles.attachedChip}>
                                                <Ionicons name="document-attach-outline" size={12} color={colors.primary[600]} />
                                                <Text style={styles.attachedChipText} numberOfLines={1}>{file.name}</Text>
                                                <TouchableOpacity onPress={() => handleRemoveAttachment(idx)}>
                                                    <Ionicons name="close-circle" size={14} color={colors.slate[400]} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <View style={styles.heroCardBottomRow}>
                                    <View style={styles.heroLeftActions}>
                                        <TouchableOpacity
                                            onPress={() => setShowSkillsModal(true)}
                                            style={styles.microActionBtn}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="extension-puzzle-outline" size={15} color={colors.accent[600]} />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => setShowVoiceModal(true)}
                                            style={styles.microActionBtn}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="mic-outline" size={15} color={colors.primary[600]} />
                                        </TouchableOpacity>

                                        {/* Model Dropdown Pill */}
                                        <TouchableOpacity
                                            onPress={() => setShowModelPicker(true)}
                                            style={styles.heroModelDropdownPill}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="hardware-chip-outline" size={12} color={colors.primary[600]} />
                                            <Text style={styles.heroModelDropdownText} numberOfLines={1}>
                                                {activeModel.name.split(' ')[0]}...
                                            </Text>
                                            <Ionicons name="chevron-down" size={11} color={colors.slate[400]} />
                                        </TouchableOpacity>

                                        {/* Attach Media / File Button */}
                                        <TouchableOpacity
                                            onPress={() => setShowAttachmentModal(true)}
                                            style={styles.microActionBtn}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="attach-outline" size={16} color={colors.slate[500]} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Send Orb Button */}
                                    <TouchableOpacity
                                        onPress={handleSend}
                                        disabled={(!input.trim() && attachedFiles.length === 0) || isProcessing}
                                        style={[
                                            styles.heroSendOrb,
                                            ((!input.trim() && attachedFiles.length === 0) || isProcessing) && styles.heroSendOrbDisabled,
                                        ]}
                                        activeOpacity={0.8}
                                    >
                                        {isProcessing ? (
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                        ) : (
                                            <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Vibrant Action Chips Grid */}
                            <View style={styles.chipsContainer}>
                                <TouchableOpacity
                                    onPress={() => handleQuickPrompt('Scan and verify all connected device apps and vault files')}
                                    style={[styles.actionChip, { backgroundColor: colors.chips.emerald.bg, borderColor: colors.chips.emerald.border }]}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="checkmark-circle-outline" size={13} color="#FFFFFF" />
                                    <Text style={styles.chipText}>GitHub Connected</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleQuickPrompt('What am I missing from my schedule today?')}
                                    style={[styles.actionChip, { backgroundColor: colors.chips.navy.bg, borderColor: colors.chips.navy.border }]}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="globe-outline" size={13} color="#FFFFFF" />
                                    <Text style={styles.chipText}>Free Browser Agent</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleQuickPrompt('Summarize Project Alpha notes from my shared vault')}
                                    style={[styles.actionChip, { backgroundColor: colors.chips.teal.bg, borderColor: colors.chips.teal.border }]}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="rocket-outline" size={13} color="#FFFFFF" />
                                    <Text style={styles.chipText}>Create SaaS</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleQuickPrompt('Review my shared contacts and lead engineer notes')}
                                    style={[styles.actionChip, { backgroundColor: colors.chips.amber.bg, borderColor: colors.chips.amber.border }]}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="bag-handle-outline" size={13} color="#FFFFFF" />
                                    <Text style={styles.chipText}>Create Store</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleQuickPrompt('Break down my afternoon tasks into verified steps')}
                                    style={[styles.actionChip, { backgroundColor: colors.chips.violet.bg, borderColor: colors.chips.violet.border }]}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="game-controller-outline" size={13} color="#FFFFFF" />
                                    <Text style={styles.chipText}>Create Apps & Games</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        /* === ACTIVE CONVERSATION STREAM === */
                        <View style={styles.chatFlowContainer}>
                            {messages.map((msg, idx) => (
                                <RichMessageBubble
                                    key={msg.id || idx}
                                    message={msg}
                                    onAskAboutFile={(filename) => handleQuickPrompt(`What are the key takeaways from ${filename}?`)}
                                    onSaveToVault={(content) => onNavigateTab?.('vault')}
                                    onScheduleTask={(title) => onNavigateTab?.('tasks')}
                                />
                            ))}

                            {/* Live Step Execution Indicator */}
                            {isProcessing && (
                                <View style={styles.liveStepBox}>
                                    <View style={styles.liveStepHeader}>
                                        <ActivityIndicator size="small" color={colors.primary[500]} />
                                        <Text style={styles.liveStepTitle}>
                                            Thinking ({activeModel.name})...
                                        </Text>
                                    </View>
                                    <StepExecutionViewer steps={activeSteps} />
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>

                {/* 4. Single Dynamic Bottom Interface */}
                {hasUserMessages && (
                    <>
                        {isComposing ? (
                            /* === COMPOSER DOCKED (Bottom Nav Rolls Away) === */
                            <View style={styles.composerWrapper}>
                                {/* Attached File Chips */}
                                {attachedFiles.length > 0 && (
                                    <View style={styles.composerAttachmentRow}>
                                        {attachedFiles.map((file, idx) => (
                                            <View key={`comp-att-${idx}`} style={styles.attachedChip}>
                                                <Ionicons name="document-attach-outline" size={12} color={colors.primary[600]} />
                                                <Text style={styles.attachedChipText} numberOfLines={1}>{file.name}</Text>
                                                <TouchableOpacity onPress={() => handleRemoveAttachment(idx)}>
                                                    <Ionicons name="close-circle" size={14} color={colors.slate[400]} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <View style={styles.composerTopBar}>
                                    <TouchableOpacity
                                        onPress={handleCollapseComposer}
                                        style={styles.rollDownBtn}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="chevron-down" size={14} color={colors.primary[600]} />
                                        <Text style={styles.rollDownText}>Tabs</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setShowModelPicker(true)}
                                        style={styles.composerModelTag}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="hardware-chip-outline" size={12} color={colors.primary[600]} />
                                        <Text style={styles.composerModelText}>
                                            {activeModel.name.split(' ')[0]}
                                        </Text>
                                        <Ionicons name="chevron-down" size={10} color={colors.slate[400]} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.composerInputRow}>
                                    {/* Skills / Puzzle */}
                                    <TouchableOpacity
                                        onPress={() => setShowSkillsModal(true)}
                                        style={styles.composerIconBtn}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="extension-puzzle-outline" size={17} color={colors.primary[600]} />
                                    </TouchableOpacity>

                                    {/* Input Capsule */}
                                    <View style={styles.composerInputCapsule}>
                                        <TouchableOpacity onPress={() => setShowAttachmentModal(true)}>
                                            <Ionicons name="attach-outline" size={17} color={colors.slate[400]} />
                                        </TouchableOpacity>
                                        <TextInput
                                            ref={inputRef}
                                            style={styles.composerTextInput}
                                            placeholder="Type a request..."
                                            placeholderTextColor={colors.slate[400]}
                                            value={input}
                                            onChangeText={handleInputChange}
                                            multiline
                                            autoFocus
                                        />
                                    </View>

                                    {/* Voice Button */}
                                    <TouchableOpacity
                                        onPress={() => setShowVoiceModal(true)}
                                        style={styles.composerIconBtn}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="mic-outline" size={17} color={colors.slate[600]} />
                                    </TouchableOpacity>

                                    {/* Send Orb Button */}
                                    <TouchableOpacity
                                        onPress={handleSend}
                                        disabled={(!input.trim() && attachedFiles.length === 0) || isProcessing}
                                        style={[
                                            styles.composerSendOrb,
                                            ((!input.trim() && attachedFiles.length === 0) || isProcessing) && styles.composerSendOrbDisabled,
                                        ]}
                                        activeOpacity={0.8}
                                    >
                                        {isProcessing ? (
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                        ) : (
                                            <Ionicons name="arrow-up" size={17} color="#FFFFFF" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            /* === COMPACT FLOATING CHAT TRIGGER (Bottom Navbar is Visible) === */
                            <View style={styles.compactTriggerWrapper}>
                                <TouchableOpacity
                                    onPress={() => onToggleCompose?.(true)}
                                    style={styles.compactTriggerBar}
                                    activeOpacity={0.85}
                                >
                                    <Ionicons name="chatbubble-outline" size={15} color={colors.primary[600]} />
                                    <Text style={styles.compactTriggerText}>Tap to type a message...</Text>
                                    <View style={styles.compactModelTag}>
                                        <Ionicons name="hardware-chip-outline" size={11} color={colors.text.secondary} />
                                        <Text style={styles.compactModelText}>{activeModel.name.split(' ')[0]}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}

                {/* 5. Attachment Picker Modal */}
                <AttachmentModal
                    visible={showAttachmentModal}
                    onClose={() => setShowAttachmentModal(false)}
                    onAttachFile={handleAttachFile}
                    onOpenVoiceStudio={() => setShowVoiceModal(true)}
                    onOpenCreateNote={() => onNavigateTab?.('vault')}
                />

                {/* 6. Voice Recording Studio Modal */}
                <VoiceStudioModal
                    visible={showVoiceModal}
                    onClose={() => setShowVoiceModal(false)}
                    onSendVoicePrompt={handleQuickPrompt}
                />

                {/* 7. Bottom Sheet Model Selector Modal */}
                <Modal
                    visible={showModelPicker}
                    animationType="fade"
                    transparent={true}
                    onRequestClose={() => setShowModelPicker(false)}
                >
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => setShowModelPicker(false)}
                    >
                        <View style={styles.modelModalCard}>
                            <View style={styles.modelModalHeader}>
                                <Text style={styles.modelModalTitle}>Select AI Engine</Text>
                                <TouchableOpacity onPress={() => setShowModelPicker(false)}>
                                    <Ionicons name="close" size={20} color={colors.slate[500]} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={{ maxHeight: 320 }}>
                                {availableModels.map(m => {
                                    const isSelected = m.modelKey === activeModel.modelKey;
                                    return (
                                        <TouchableOpacity
                                            key={m.id}
                                            onPress={() => {
                                                setActiveModel(m.modelKey);
                                                setShowModelPicker(false);
                                            }}
                                            style={[styles.modelOptionRow, isSelected && styles.modelOptionRowActive]}
                                            activeOpacity={0.8}
                                        >
                                            <View style={styles.modelOptionLeft}>
                                                <Ionicons
                                                    name={m.type === 'on-device' ? 'hardware-chip' : m.type === 'lan-desktop' ? 'wifi' : 'cloud'}
                                                    size={18}
                                                    color={isSelected ? colors.primary[600] : colors.slate[400]}
                                                />
                                                <View style={{ marginLeft: 10 }}>
                                                    <Text style={[styles.modelOptionName, isSelected && styles.modelOptionNameActive]}>
                                                        {m.name}
                                                    </Text>
                                                    <Text style={styles.modelOptionDesc}>
                                                        {m.type === 'cloud' ? 'OpenRouter API' : m.type === 'lan-desktop' ? 'Desktop WiFi' : `${m.sizeMb} MB • On-Device`}
                                                    </Text>
                                                </View>
                                            </View>
                                            {isSelected && (
                                                <Ionicons name="checkmark-circle" size={20} color={colors.primary[500]} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </Pressable>
                </Modal>

                {/* 8. Skills & Plugins Modal */}
                <Modal
                    visible={showSkillsModal}
                    animationType="fade"
                    transparent={true}
                    onRequestClose={() => setShowSkillsModal(false)}
                >
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => setShowSkillsModal(false)}
                    >
                        <View style={styles.modelModalCard}>
                            <View style={styles.modelModalHeader}>
                                <Text style={styles.modelModalTitle}>Assistant Skills & Plugins</Text>
                                <TouchableOpacity onPress={() => setShowSkillsModal(false)}>
                                    <Ionicons name="close" size={20} color={colors.slate[500]} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={{ maxHeight: 300 }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowSkillsModal(false);
                                        handleQuickPrompt('Scan device shared folder and extract missing action items');
                                    }}
                                    style={styles.skillRow}
                                >
                                    <Ionicons name="folder-open-outline" size={20} color={colors.primary[600]} />
                                    <View style={{ marginLeft: 10, flex: 1 }}>
                                        <Text style={styles.skillTitle}>Shared Vault RAG</Text>
                                        <Text style={styles.skillDesc}>Search notes & extract answers offline</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        setShowSkillsModal(false);
                                        handleQuickPrompt('Check my calendar and agenda: what am I missing today?');
                                    }}
                                    style={styles.skillRow}
                                >
                                    <Ionicons name="alert-circle-outline" size={20} color={colors.standby[600]} />
                                    <View style={{ marginLeft: 10, flex: 1 }}>
                                        <Text style={styles.skillTitle}>Missing Action Watchdog</Text>
                                        <Text style={styles.skillDesc}>Detects schedule gaps and flagged items</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        setShowSkillsModal(false);
                                        onNavigateTab?.('connectors');
                                    }}
                                    style={styles.skillRow}
                                >
                                    <Ionicons name="extension-puzzle-outline" size={20} color={colors.accent[600]} />
                                    <View style={{ marginLeft: 10, flex: 1 }}>
                                        <Text style={styles.skillTitle}>Deep Device Connectors</Text>
                                        <Text style={styles.skillDesc}>Manage app and API permissions</Text>
                                    </View>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </Pressable>
                </Modal>
            </KeyboardAvoidingView>
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

    // 1. Top Header
    topNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs,
    },
    iconCircleBtn: {
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
    iconCircleBtnActive: {
        borderColor: colors.error.dark,
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
    },
    rightNavCluster: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs + 2,
    },

    // 2. Sub Context Pills
    contextBar: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs,
        gap: spacing.sm,
    },
    contextPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.surface,
        borderWidth: 1,
        borderColor: colors.slate[200],
        borderRadius: borderRadius.full,
        paddingVertical: 6,
        paddingHorizontal: spacing.md,
        gap: 5,
        ...shadows.subtle,
    },
    contextPillText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.text.primary,
    },
    contextPillDivider: {
        color: colors.slate[300],
        fontSize: 10,
        marginHorizontal: 1,
    },
    contextPillSub: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.text.muted,
    },

    // 3. Scroll Area
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xs,
        paddingBottom: spacing['4xl'],
    },
    scrollContentHero: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: spacing['2xl'],
    },

    // Hero Mode
    heroWrapper: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    heroOrbContainer: {
        width: 88,
        height: 88,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    heroOrbGlow: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(2, 132, 199, 0.12)',
    },
    heroOrbCircle: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: colors.background.surface,
        borderWidth: 1.5,
        borderColor: colors.slate[200],
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.card,
    },
    heroTitle: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: '800',
        color: colors.text.primary,
        textAlign: 'center',
        lineHeight: 34,
        letterSpacing: -0.6,
        marginBottom: spacing.lg,
    },
    heroCard: {
        width: '100%',
        backgroundColor: colors.background.surface,
        borderRadius: borderRadius['2xl'],
        borderWidth: 1,
        borderColor: colors.slate[200],
        padding: spacing.md,
        ...shadows.card,
        marginBottom: spacing.lg,
    },
    heroTextInput: {
        minHeight: 64,
        fontSize: typography.fontSize.sm,
        color: colors.text.primary,
        textAlignVertical: 'top',
        paddingTop: 0,
    },
    attachmentPillRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginVertical: 6,
    },
    attachedChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        borderRadius: borderRadius.full,
        paddingVertical: 3,
        paddingHorizontal: spacing.sm,
        gap: 4,
    },
    attachedChipText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.primary[700],
        maxWidth: 140,
    },
    heroCardBottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.xs,
        paddingTop: spacing.xs,
        borderTopWidth: 1,
        borderTopColor: colors.slate[100],
    },
    heroLeftActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    microActionBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.background.canvas,
        borderWidth: 1,
        borderColor: colors.slate[200],
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroModelDropdownPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.canvas,
        borderWidth: 1,
        borderColor: colors.slate[200],
        borderRadius: borderRadius.full,
        paddingVertical: 5,
        paddingHorizontal: spacing.sm + 2,
        gap: 4,
    },
    heroModelDropdownText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.text.secondary,
        maxWidth: 70,
    },
    heroSendOrb: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.text.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.subtle,
    },
    heroSendOrbDisabled: {
        opacity: 0.35,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.sm,
        width: '100%',
    },
    actionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 9,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        gap: 6,
        ...shadows.subtle,
    },
    chipText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    chatFlowContainer: {
        paddingTop: spacing.xs,
    },
    liveStepBox: {
        backgroundColor: colors.background.surface,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.slate[200],
        padding: spacing.md,
        marginTop: spacing.sm,
        ...shadows.subtle,
    },
    liveStepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    liveStepTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.primary[600],
    },

    // 4. Composer Mode
    composerWrapper: {
        backgroundColor: colors.background.surface,
        borderTopWidth: 1,
        borderTopColor: colors.slate[200],
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xs + 2,
        paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
        ...shadows.card,
    },
    composerAttachmentRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 6,
    },
    composerTopBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    rollDownBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        paddingVertical: 4,
        paddingHorizontal: spacing.sm + 2,
        borderRadius: borderRadius.full,
        gap: 4,
    },
    rollDownText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.primary[600],
    },
    composerModelTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.canvas,
        borderWidth: 1,
        borderColor: colors.slate[200],
        borderRadius: borderRadius.full,
        paddingVertical: 3,
        paddingHorizontal: spacing.sm,
        gap: 4,
    },
    composerModelText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    composerInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs + 2,
    },
    composerIconBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.background.canvas,
        borderWidth: 1,
        borderColor: colors.slate[200],
        alignItems: 'center',
        justifyContent: 'center',
    },
    composerInputCapsule: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.canvas,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.slate[200],
        paddingHorizontal: spacing.md,
        paddingVertical: Platform.OS === 'ios' ? 8 : 4,
        gap: 8,
    },
    composerTextInput: {
        flex: 1,
        fontSize: typography.fontSize.xs + 1,
        color: colors.text.primary,
        maxHeight: 80,
    },
    composerSendOrb: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.text.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.subtle,
    },
    composerSendOrbDisabled: {
        opacity: 0.35,
    },

    // Compact Trigger Bar
    compactTriggerWrapper: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.sm,
        backgroundColor: colors.background.canvas,
    },
    compactTriggerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.surface,
        borderWidth: 1,
        borderColor: colors.slate[200],
        borderRadius: borderRadius.full,
        paddingVertical: 10,
        paddingHorizontal: spacing.lg,
        ...shadows.subtle,
    },
    compactTriggerText: {
        flex: 1,
        fontSize: typography.fontSize.xs + 1,
        color: colors.text.muted,
        marginLeft: spacing.sm,
    },
    compactModelTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.canvas,
        paddingVertical: 3,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.full,
        gap: 4,
    },
    compactModelText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.text.secondary,
    },

    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.background.overlay,
        justifyContent: 'flex-end',
    },
    modelModalCard: {
        backgroundColor: colors.background.surface,
        borderTopLeftRadius: borderRadius['2xl'],
        borderTopRightRadius: borderRadius['2xl'],
        padding: spacing.lg,
        maxHeight: '70%',
    },
    modelModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate[100],
    },
    modelModalTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '800',
        color: colors.text.primary,
    },
    modelOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.lg,
        marginBottom: 4,
    },
    modelOptionRowActive: {
        backgroundColor: 'rgba(2, 132, 199, 0.06)',
    },
    modelOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    modelOptionName: {
        fontSize: typography.fontSize.xs + 1,
        fontWeight: '700',
        color: colors.text.primary,
    },
    modelOptionNameActive: {
        color: colors.primary[600],
    },
    modelOptionDesc: {
        fontSize: 11,
        color: colors.text.muted,
        marginTop: 1,
    },
    skillRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate[100],
    },
    skillTitle: {
        fontSize: typography.fontSize.xs + 1,
        fontWeight: '700',
        color: colors.text.primary,
    },
    skillDesc: {
        fontSize: 11,
        color: colors.text.muted,
        marginTop: 1,
    },
});

export default ChatScreen;
