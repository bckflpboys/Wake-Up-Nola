/**
 * Chat Screen - Wake Up Nola Main Workspace
 * Seamless Roll-in / Roll-out between Composer Mode and Navigation Mode
 * When composing: Bottom navigation rolls away, input bar docks cleanly at the bottom.
 * When browsing: Bottom navigation is visible with a compact floating chat pill.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Modal,
    Pressable,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNola } from '../contexts/NolaContext';
import { useVault } from '../contexts/VaultContext';
import { StepExecutionViewer } from '../components/molecules/StepExecutionViewer';
import { RichMessageBubble } from '../components/molecules/RichMessageBubble';
import { EmbroideredBrandLogo } from '../components/atoms/EmbroideredBrandLogo';
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
        messages,
        isProcessing,
        activeSteps,
        sendMessage,
        clearChatHistory,
        isListening,
        startVoiceTrigger,
    } = useNola();

    const { documents } = useVault();

    const [input, setInput] = useState('');
    const [showModelPicker, setShowModelPicker] = useState(false);
    const [showSkillsModal, setShowSkillsModal] = useState(false);
    const [thinkingExpanded, setThinkingExpanded] = useState<Record<string, boolean>>({});

    const inputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    // Has the user started a conversation yet?
    const hasUserMessages = messages.some(m => m.role === 'user');

    useEffect(() => {
        if (hasUserMessages) {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages, activeSteps, hasUserMessages]);

    // Auto-enter composer mode when input text is entered
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
        if (!input.trim() || isProcessing) return;
        const text = input.trim();
        setInput('');
        try {
            await sendMessage(text);
        } catch (e) {
            console.warn('Send message error:', e);
        }
    };

    const handleQuickPrompt = async (prompt: string) => {
        setInput(prompt);
        onToggleCompose?.(true);
        await sendMessage(prompt);
    };

    const toggleThinking = (id: string) => {
        setThinkingExpanded(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
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
                        <TouchableOpacity
                            onPress={startVoiceTrigger}
                            style={[styles.iconCircleBtn, isListening && styles.iconCircleBtnActive]}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isListening ? 'mic' : 'play-outline'}
                                size={15}
                                color={isListening ? colors.primary[500] : colors.text.primary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={clearChatHistory}
                            style={styles.iconCircleBtn}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add-outline" size={17} color={colors.text.primary} />
                        </TouchableOpacity>

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
                        onPress={() => onNavigateTab?.('connectors')}
                        style={styles.connectorsPill}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="document-text-outline" size={13} color={colors.primary[600]} />
                        <Text style={styles.connectorsPillText}>Open Hub</Text>
                    </TouchableOpacity>
                </View>

                {/* 3. Main Workspace Scroll */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollArea}
                    contentContainerStyle={[
                        styles.scrollContent,
                        !hasUserMessages && styles.heroScrollContent,
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
                                            onPress={() => handleQuickPrompt('Break down this goal into failsafe micro-steps')}
                                            style={styles.microActionBtn}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="bulb-outline" size={15} color={colors.primary[600]} />
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

                                        <TouchableOpacity
                                            onPress={() => onNavigateTab?.('vault')}
                                            style={styles.microActionBtn}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="attach-outline" size={16} color={colors.slate[500]} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Send Orb Button */}
                                    <TouchableOpacity
                                        onPress={handleSend}
                                        disabled={!input.trim() || isProcessing}
                                        style={[
                                            styles.heroSendOrb,
                                            (!input.trim() || isProcessing) && styles.heroSendOrbDisabled,
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
                                    <StepExecutionViewer steps={activeSteps} isProcessing={true} />
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>

                {/* 4. DYNAMIC BOTTOM COMPOSER / TRIGGER */}
                {hasUserMessages && (
                    <>
                        {isComposing ? (
                            /* === ACTIVE COMPOSER (Bottom Navigation is Hidden) === */
                            <View style={styles.activeComposerBar}>
                                <View style={styles.composerHeaderRow}>
                                    {/* Roll-Away Button: Collapses composer & brings back Navbar */}
                                    <TouchableOpacity
                                        onPress={handleCollapseComposer}
                                        style={styles.rollAwayBtn}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
                                        <Text style={styles.rollAwayText}>Tabs</Text>
                                    </TouchableOpacity>

                                    {/* Model selector chip inside composer header */}
                                    <TouchableOpacity
                                        onPress={() => setShowModelPicker(true)}
                                        style={styles.composerModelChip}
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
                                        <TouchableOpacity onPress={() => onNavigateTab?.('vault')}>
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

                                    {/* Send Orb Button */}
                                    <TouchableOpacity
                                        onPress={handleSend}
                                        disabled={!input.trim() || isProcessing}
                                        style={[
                                            styles.composerSendOrb,
                                            (!input.trim() || isProcessing) && styles.composerSendOrbDisabled,
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

                {/* 5. Bottom Sheet Model Selector Modal */}
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
                                                    <Text style={styles.modelOptionSub}>
                                                        {m.sizeMb > 0 ? `${m.sizeMb} MB • On-Device` : m.type}
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

                {/* 6. Skills & Plugins Modal */}
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
        borderColor: colors.primary[500],
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
    },
    brandPill: {
        backgroundColor: colors.background.surface,
        borderWidth: 1,
        borderColor: colors.slate[200],
        paddingHorizontal: spacing.lg,
        paddingVertical: 7,
        borderRadius: borderRadius.full,
        ...shadows.subtle,
    },
    brandPillText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: 1.2,
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
        gap: 6,
        ...shadows.subtle,
    },
    contextPillText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.text.primary,
    },
    contextPillDivider: {
        color: colors.slate[300],
        fontSize: typography.fontSize.xs,
    },
    contextPillSub: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
    },
    connectorsPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(2, 132, 199, 0.25)',
        borderRadius: borderRadius.full,
        paddingVertical: 6,
        paddingHorizontal: spacing.md,
        gap: 5,
    },
    connectorsPillText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.primary[600],
    },

    // 3. Scroll Area
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xs,
        paddingBottom: spacing['2xl'],
    },
    heroScrollContent: {
        justifyContent: 'center',
        paddingTop: spacing.md,
    },

    // Hero Section
    heroWrapper: {
        alignItems: 'center',
        width: '100%',
    },
    heroOrbContainer: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    heroOrbGlow: {
        position: 'absolute',
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
    },
    heroOrbCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.background.surface,
        borderWidth: 1,
        borderColor: colors.slate[200],
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.card,
    },
    heroTitle: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: -0.6,
        textAlign: 'center',
        lineHeight: 34,
        marginBottom: spacing.xl,
    },

    // Floating Hero Card
    heroCard: {
        width: '100%',
        backgroundColor: colors.background.surface,
        borderRadius: borderRadius['2xl'],
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.slate[200],
        ...shadows.card,
        marginBottom: spacing.xl,
    },
    heroTextInput: {
        fontSize: typography.fontSize.sm,
        color: colors.text.primary,
        minHeight: 52,
        textAlignVertical: 'top',
        lineHeight: 20,
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
        backgroundColor: colors.slate[50],
        borderWidth: 1,
        borderColor: colors.slate[200],
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroModelDropdownPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.slate[50],
        borderWidth: 1,
        borderColor: colors.slate[200],
        paddingHorizontal: spacing.sm,
        paddingVertical: 5,
        borderRadius: borderRadius.full,
        gap: 4,
    },
    heroModelDropdownText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.text.primary,
        maxWidth: 90,
    },
    heroSendOrb: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.text.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.subtle,
    },
    heroSendOrbDisabled: {
        backgroundColor: colors.slate[300],
    },

    // Colorful Action Chips
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.sm,
        maxWidth: 340,
    },
    actionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        gap: 6,
        ...shadows.subtle,
    },
    chipText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // Active Chat Stream
    chatFlowContainer: {
        paddingTop: spacing.xs,
    },
    userBubbleRow: {
        alignItems: 'flex-end',
        marginVertical: spacing.xs + 2,
    },
    userBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary[500],
        paddingVertical: 9,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.full,
        borderBottomRightRadius: 6,
        maxWidth: '85%',
        ...shadows.subtle,
    },
    userBubbleText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: '#FFFFFF',
        marginRight: 6,
    },
    userIcon: {
        marginLeft: 2,
    },
    assistantCardRow: {
        marginVertical: spacing.xs + 2,
    },
    assistantCard: {
        backgroundColor: colors.background.surface,
        borderRadius: borderRadius.xl,
        borderTopLeftRadius: 6,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.slate[200],
        ...shadows.card,
    },
    reasoningHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.slate[50],
        paddingVertical: 6,
        paddingHorizontal: spacing.sm + 2,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        gap: 6,
    },
    reasoningIconBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reasoningTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.text.primary,
        flex: 1,
    },
    reasoningViewText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.primary[600],
    },
    reasoningExpandedBox: {
        marginBottom: spacing.sm,
    },
    assistantText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.primary,
        lineHeight: 22,
    },
    assistantFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.md,
        paddingTop: spacing.xs,
        borderTopWidth: 1,
        borderTopColor: colors.slate[100],
    },
    footerModelText: {
        fontSize: 11,
        color: colors.text.muted,
        fontWeight: '600',
    },
    footerLatencyWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    footerLatencyText: {
        fontSize: 10,
        color: colors.standby[600],
        fontWeight: '700',
    },
    liveStepBox: {
        marginVertical: spacing.sm,
    },

    // 4A. ACTIVE COMPOSER BAR (When composing, Navbar is hidden)
    activeComposerBar: {
        backgroundColor: colors.background.surface,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xs,
        paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.slate[200],
        ...shadows.card,
    },
    composerHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
        paddingHorizontal: 2,
    },
    rollAwayBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.slate[100],
        paddingVertical: 3,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.full,
        gap: 2,
    },
    rollAwayText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.text.secondary,
    },
    composerModelChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        paddingVertical: 3,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.full,
        gap: 4,
    },
    composerModelText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.primary[600],
    },
    composerInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs + 2,
    },
    composerIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.slate[50],
        borderWidth: 1,
        borderColor: colors.slate[200],
        alignItems: 'center',
        justifyContent: 'center',
    },
    composerInputCapsule: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.slate[50],
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.slate[200],
        minHeight: 40,
        maxHeight: 90,
    },
    composerTextInput: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        color: colors.text.primary,
        marginLeft: spacing.xs,
        maxHeight: 80,
    },
    composerSendOrb: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.text.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.subtle,
    },
    composerSendOrbDisabled: {
        backgroundColor: colors.slate[300],
    },

    // 4B. COMPACT FLOATING CHAT TRIGGER (When browsing, Navbar is visible)
    compactTriggerWrapper: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xs,
    },
    compactTriggerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.surface,
        borderRadius: borderRadius.full,
        paddingVertical: 8,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.slate[200],
        ...shadows.subtle,
    },
    compactTriggerText: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[400],
        marginLeft: spacing.xs,
        flex: 1,
    },
    compactModelTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.slate[100],
        paddingVertical: 2,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.full,
        gap: 3,
    },
    compactModelText: {
        fontSize: 10,
        fontWeight: '700',
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
        fontSize: typography.fontSize.lg,
        fontWeight: '800',
        color: colors.text.primary,
    },
    modelOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.lg,
        marginBottom: 4,
    },
    modelOptionRowActive: {
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
    },
    modelOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modelOptionName: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.text.primary,
    },
    modelOptionNameActive: {
        color: colors.primary[600],
    },
    modelOptionSub: {
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
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.text.primary,
    },
    skillDesc: {
        fontSize: 11,
        color: colors.text.muted,
        marginTop: 2,
    },
});

export default ChatScreen;
