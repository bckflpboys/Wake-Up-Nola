/**
 * Chat Screen - Talk with Nola
 * Modern, airy light-blueish layout inspired by VoxCode
 * Features floating hero input, colorful action pills, thinking visualizer, and bottom bar.
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNola } from '../contexts/NolaContext';
import { useVault } from '../contexts/VaultContext';
import { StepExecutionViewer } from '../components/molecules/StepExecutionViewer';
import { Badge } from '../components/atoms/Badge';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

interface ChatScreenProps {
    onNavigateTab?: (tab: 'chat' | 'connectors' | 'vault' | 'tasks' | 'models') => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ onNavigateTab }) => {
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
    const [thinkingExpanded, setThinkingExpanded] = useState<Record<string, boolean>>({});
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages, activeSteps]);

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
        await sendMessage(prompt);
    };

    const toggleThinking = (id: string) => {
        setThinkingExpanded(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const hasUserMessages = messages.some(m => m.role === 'user');

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                {/* 1. Top Navigation Bar */}
                <View style={styles.topNav}>
                    <TouchableOpacity
                        onPress={() => onNavigateTab?.('connectors')}
                        style={styles.iconCircleBtn}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={18} color={colors.text.primary} />
                    </TouchableOpacity>

                    {/* Brand Pill */}
                    <View style={styles.brandPill}>
                        <Text style={styles.brandPillText}>WAKE UP NOLA</Text>
                    </View>

                    {/* Standby / Play Button */}
                    <TouchableOpacity
                        onPress={startVoiceTrigger}
                        style={[styles.iconCircleBtn, isListening && styles.iconCircleBtnActive]}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isListening ? 'mic' : 'play-outline'}
                            size={16}
                            color={isListening ? colors.primary[500] : colors.text.primary}
                        />
                    </TouchableOpacity>

                    {/* New Chat Button */}
                    <TouchableOpacity
                        onPress={clearChatHistory}
                        style={styles.iconCircleBtn}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add-outline" size={18} color={colors.text.primary} />
                    </TouchableOpacity>

                    {/* Connectors / Settings Button */}
                    <TouchableOpacity
                        onPress={() => onNavigateTab?.('connectors')}
                        style={styles.iconCircleBtn}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="settings-outline" size={16} color={colors.text.primary} />
                    </TouchableOpacity>
                </View>

                {/* 2. Context & Status Pill Bar */}
                <View style={styles.contextBar}>
                    <TouchableOpacity
                        onPress={() => onNavigateTab?.('vault')}
                        style={styles.contextPill}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="folder-outline" size={13} color={colors.text.primary} />
                        <Text style={styles.contextPillText}>Shared Vault</Text>
                        <Text style={styles.contextPillDivider}>|</Text>
                        <Ionicons name="git-branch-outline" size={13} color={colors.text.secondary} />
                        <Text style={styles.contextPillSub}>{documents.length} docs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onNavigateTab?.('connectors')}
                        style={styles.connectorsPill}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="extension-puzzle-outline" size={13} color={colors.primary[600]} />
                        <Text style={styles.connectorsPillText}>Connectors</Text>
                    </TouchableOpacity>
                </View>

                {/* Model Selector Dropdown Modal */}
                {showModelPicker && (
                    <View style={styles.modelDropdownCard}>
                        <Text style={styles.dropdownHeader}>Select Active AI Engine</Text>
                        {availableModels.map(m => {
                            const isSelected = m.modelKey === activeModel.modelKey;
                            return (
                                <TouchableOpacity
                                    key={m.id}
                                    onPress={() => {
                                        setActiveModel(m.modelKey);
                                        setShowModelPicker(false);
                                    }}
                                    style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                                    activeOpacity={0.8}
                                >
                                    <View>
                                        <Text style={[styles.dropdownName, isSelected && styles.dropdownNameSelected]}>
                                            {m.name}
                                        </Text>
                                        <Text style={styles.dropdownDesc}>{m.sizeMb > 0 ? `${m.sizeMb} MB • On-Device` : m.type}</Text>
                                    </View>
                                    {isSelected && (
                                        <Ionicons name="checkmark-circle" size={18} color={colors.primary[500]} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* 3. Main Workspace / Messages Scroll */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollArea}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Section (Shown before or above messages) */}
                    {!hasUserMessages && (
                        <View style={styles.heroSection}>
                            {/* Ambient Mesh Orb */}
                            <View style={styles.meshOrb}>
                                <Ionicons name="planet-outline" size={44} color={colors.slate[800]} />
                            </View>

                            {/* Headline Greeting */}
                            <Text style={styles.heroGreeting}>What shall we do, Alex?</Text>

                            {/* Floating Card Input Box (Hero Mode) */}
                            <View style={styles.heroCardInput}>
                                <TextInput
                                    style={styles.heroTextInput}
                                    placeholder="Type '/' to invoke skills or ask anything..."
                                    placeholderTextColor={colors.slate[400]}
                                    value={input}
                                    onChangeText={setInput}
                                    multiline
                                />

                                <View style={styles.heroCardActions}>
                                    <TouchableOpacity
                                        onPress={() => onNavigateTab?.('connectors')}
                                        style={styles.actionPillBtn}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="extension-puzzle-outline" size={14} color={colors.accent[600]} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleQuickPrompt('Break down this task into failsafe micro-steps')}
                                        style={styles.actionPillBtn}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="bulb-outline" size={14} color={colors.primary[600]} />
                                    </TouchableOpacity>

                                    {/* Model Switcher Pill */}
                                    <TouchableOpacity
                                        onPress={() => setShowModelPicker(!showModelPicker)}
                                        style={styles.heroModelPill}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="hardware-chip-outline" size={13} color={colors.primary[600]} />
                                        <Text style={styles.heroModelText} numberOfLines={1}>
                                            {activeModel.name}
                                        </Text>
                                        <Ionicons name="chevron-down" size={12} color={colors.slate[500]} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => onNavigateTab?.('vault')}
                                        style={styles.actionPillBtn}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="attach-outline" size={16} color={colors.slate[600]} />
                                    </TouchableOpacity>

                                    {/* Send Orb Button */}
                                    <TouchableOpacity
                                        onPress={handleSend}
                                        disabled={!input.trim() || isProcessing}
                                        style={[
                                            styles.sendOrbBtn,
                                            (!input.trim() || isProcessing) && styles.sendOrbDisabled,
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

                            {/* Vibrant Colorful Action Pills */}
                            <View style={styles.actionTagsWrap}>
                                <TouchableOpacity
                                    onPress={() => handleQuickPrompt('Scan and verify all connected device apps and vault files')}
                                    style={[styles.actionTag, { backgroundColor: colors.tags.emeraldBg }]}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="checkmark-circle-outline" size={14} color="#FFFFFF" />
                                    <Text style={styles.actionTagText}>Device Vault Connected</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleQuickPrompt('What am I missing today?')}
                                    style={[styles.actionTag, { backgroundColor: colors.tags.navyBg }]}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="alert-circle-outline" size={14} color="#FFFFFF" />
                                    <Text style={styles.actionTagText}>What Am I Missing?</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleQuickPrompt('Summarize Project Alpha notes from my shared vault')}
                                    style={[styles.actionTag, { backgroundColor: colors.tags.tealBg }]}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="rocket-outline" size={14} color="#FFFFFF" />
                                    <Text style={styles.actionTagText}>Project Alpha Notes</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleQuickPrompt('Plan my afternoon schedule with failsafe steps')}
                                    style={[styles.actionTag, { backgroundColor: colors.tags.violetBg }]}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="grid-outline" size={14} color="#FFFFFF" />
                                    <Text style={styles.actionTagText}>Decompose Tasks</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Messages Flow */}
                    {messages.map((msg, idx) => {
                        const isUser = msg.role === 'user';
                        const isExpanded = thinkingExpanded[msg.id] || false;

                        if (isUser) {
                            return (
                                <View key={msg.id || idx} style={styles.userMessageRow}>
                                    <View style={styles.userPillBubble}>
                                        <Text style={styles.userBubbleText}>{msg.content}</Text>
                                        <Ionicons name="chatbubble-outline" size={13} color="#FFFFFF" style={styles.userMsgIcon} />
                                    </View>
                                </View>
                            );
                        }

                        return (
                            <View key={msg.id || idx} style={styles.assistantCardWrapper}>
                                <View style={styles.assistantCard}>
                                    {/* Thinking Header Banner */}
                                    {msg.steps && msg.steps.length > 0 && (
                                        <TouchableOpacity
                                            onPress={() => toggleThinking(msg.id)}
                                            style={styles.thinkingHeader}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.thinkingIconBox}>
                                                <Ionicons name="bulb" size={13} color={colors.primary[500]} />
                                            </View>
                                            <Text style={styles.thinkingTitle}>
                                                Task Reasoning ({msg.steps.length} Steps)
                                            </Text>
                                            <Text style={styles.thinkingViewText}>
                                                {isExpanded ? 'HIDE' : 'VIEW'}
                                            </Text>
                                            <Ionicons
                                                name={isExpanded ? 'chevron-up' : 'chevron-forward'}
                                                size={12}
                                                color={colors.primary[500]}
                                            />
                                        </TouchableOpacity>
                                    )}

                                    {/* Collapsible Steps Box */}
                                    {isExpanded && msg.steps && (
                                        <View style={styles.expandedStepsWrap}>
                                            <StepExecutionViewer steps={msg.steps} />
                                        </View>
                                    )}

                                    {/* Main Assistant Content */}
                                    <Text style={styles.assistantBodyText}>{msg.content}</Text>

                                    {/* Assistant Card Footer */}
                                    <View style={styles.cardFooterRow}>
                                        <Text style={styles.footerModelName}>
                                            {msg.modelUsed || activeModel.name}
                                        </Text>
                                        {msg.latencyMs && (
                                            <View style={styles.latencyWrap}>
                                                <Ionicons name="time-outline" size={11} color={colors.standby[500]} />
                                                <Text style={styles.latencyNumber}>
                                                    {(msg.latencyMs / 1000).toFixed(2)}s
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    {/* Live Processing Indicator */}
                    {isProcessing && (
                        <View style={styles.liveProcessingBox}>
                            <StepExecutionViewer steps={activeSteps} isProcessing={true} />
                        </View>
                    )}
                </ScrollView>

                {/* 4. Bottom Sticky Input Bar */}
                <View style={styles.bottomBarWrapper}>
                    <View style={styles.bottomInputRow}>
                        {/* Skills / Puzzle Button */}
                        <TouchableOpacity
                            onPress={() => onNavigateTab?.('connectors')}
                            style={styles.bottomIconBtn}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="extension-puzzle-outline" size={18} color={colors.primary[600]} />
                        </TouchableOpacity>

                        {/* Standby / Mic Button */}
                        <TouchableOpacity
                            onPress={startVoiceTrigger}
                            style={[styles.bottomIconBtn, isListening && styles.bottomIconBtnListening]}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isListening ? 'mic' : 'bulb-outline'}
                                size={18}
                                color={isListening ? colors.accent[600] : colors.primary[600]}
                            />
                        </TouchableOpacity>

                        {/* Input Capsule */}
                        <View style={styles.bottomInputCapsule}>
                            <TouchableOpacity onPress={() => onNavigateTab?.('vault')}>
                                <Ionicons name="attach-outline" size={18} color={colors.slate[400]} />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.bottomTextInput}
                                placeholder="Type a request..."
                                placeholderTextColor={colors.slate[400]}
                                value={input}
                                onChangeText={setInput}
                                multiline
                            />
                        </View>

                        {/* Send Orb Button */}
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!input.trim() || isProcessing}
                            style={[
                                styles.bottomSendOrb,
                                (!input.trim() || isProcessing) && styles.bottomSendOrbDisabled,
                            ]}
                            activeOpacity={0.8}
                        >
                            {isProcessing ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Floating Bottom Active Model Selector Pill */}
                    <TouchableOpacity
                        onPress={() => setShowModelPicker(!showModelPicker)}
                        style={styles.floatingBottomModelPill}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="hardware-chip-outline" size={13} color={colors.primary[600]} />
                        <Text style={styles.floatingModelText}>{activeModel.name.toUpperCase()}</Text>
                        <Ionicons name="chevron-down" size={12} color={colors.slate[500]} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
    topNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    iconCircleBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(15, 23, 42, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.subtle,
    },
    iconCircleBtnActive: {
        borderColor: colors.primary[500],
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
    },
    brandPill: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(15, 23, 42, 0.12)',
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
        ...shadows.subtle,
    },
    brandPillText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: 1,
    },
    contextBar: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        gap: spacing.sm,
    },
    contextPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(15, 23, 42, 0.1)',
        borderRadius: borderRadius.full,
        paddingVertical: 5,
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
        paddingVertical: 5,
        paddingHorizontal: spacing.md,
        gap: 5,
    },
    connectorsPillText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.primary[600],
    },
    modelDropdownCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: spacing.md,
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(15, 23, 42, 0.1)',
        ...shadows.lg,
        position: 'absolute',
        top: 90,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    dropdownHeader: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.text.muted,
        textTransform: 'uppercase',
        marginBottom: spacing.sm,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
        marginBottom: 4,
    },
    dropdownItemSelected: {
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
    },
    dropdownName: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.text.primary,
    },
    dropdownNameSelected: {
        color: colors.primary[600],
        fontWeight: '700',
    },
    dropdownDesc: {
        fontSize: 11,
        color: colors.text.muted,
        marginTop: 2,
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing['4xl'],
    },
    heroSection: {
        alignItems: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.xl,
    },
    meshOrb: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(15, 23, 42, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        ...shadows.md,
    },
    heroGreeting: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: -0.8,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    heroCardInput: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius['2xl'],
        padding: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(15, 23, 42, 0.08)',
        ...shadows.md,
        marginBottom: spacing.xl,
    },
    heroTextInput: {
        fontSize: typography.fontSize.sm,
        color: colors.text.primary,
        minHeight: 50,
        textAlignVertical: 'top',
        lineHeight: 20,
    },
    heroCardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.slate[100],
    },
    actionPillBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.slate[50],
        borderWidth: 1,
        borderColor: colors.slate[200],
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroModelPill: {
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
    heroModelText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.text.primary,
        maxWidth: 110,
    },
    sendOrbBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.text.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendOrbDisabled: {
        backgroundColor: colors.slate[300],
    },
    actionTagsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    actionTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        gap: 6,
        ...shadows.subtle,
    },
    actionTagText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    userMessageRow: {
        alignItems: 'flex-end',
        marginVertical: spacing.xs,
    },
    userPillBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary[500],
        paddingVertical: 8,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        maxWidth: '85%',
        ...shadows.sm,
    },
    userBubbleText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: '#FFFFFF',
        marginRight: 6,
    },
    userMsgIcon: {
        marginLeft: 2,
    },
    assistantCardWrapper: {
        marginVertical: spacing.sm,
    },
    assistantCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(15, 23, 42, 0.08)',
        ...shadows.subtle,
    },
    thinkingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.slate[50],
        paddingVertical: 6,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        gap: 6,
    },
    thinkingIconBox: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    thinkingTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.text.primary,
        flex: 1,
    },
    thinkingViewText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.primary[600],
    },
    expandedStepsWrap: {
        marginBottom: spacing.sm,
    },
    assistantBodyText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.primary,
        lineHeight: 22,
    },
    cardFooterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.md,
        paddingTop: spacing.xs,
        borderTopWidth: 1,
        borderTopColor: colors.slate[100],
    },
    footerModelName: {
        fontSize: 11,
        color: colors.text.muted,
        fontWeight: '600',
    },
    latencyWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    latencyNumber: {
        fontSize: 10,
        color: colors.standby[600],
        fontWeight: '700',
    },
    liveProcessingBox: {
        marginVertical: spacing.sm,
    },
    bottomBarWrapper: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.xs,
        borderTopWidth: 1,
        borderTopColor: 'rgba(15, 23, 42, 0.08)',
        alignItems: 'center',
    },
    bottomInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        gap: spacing.xs,
    },
    bottomIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.slate[50],
        borderWidth: 1,
        borderColor: colors.slate[200],
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomIconBtnListening: {
        borderColor: colors.accent[500],
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
    },
    bottomInputCapsule: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.slate[50],
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.slate[200],
        height: 40,
    },
    bottomTextInput: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        color: colors.text.primary,
        marginLeft: spacing.xs,
    },
    bottomSendOrb: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.text.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    bottomSendOrbDisabled: {
        backgroundColor: colors.slate[300],
    },
    floatingBottomModelPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.slate[100],
        paddingVertical: 3,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        marginTop: 6,
        gap: 4,
    },
    floatingModelText: {
        fontSize: 10,
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: 0.5,
    },
});

export default ChatScreen;
