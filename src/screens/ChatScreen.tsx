/**
 * Chat Screen - Talk with Nola
 * Conversational interface with real-time micro-agent step visualization
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
import { StepExecutionViewer } from '../components/molecules/StepExecutionViewer';
import { Badge } from '../components/atoms/Badge';
import { colors, spacing, typography, borderRadius } from '../theme';

interface ChatScreenProps {
    onNavigateTab?: (tab: 'wakeup' | 'vault' | 'tasks' | 'models') => void;
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
    } = useNola();

    const [input, setInput] = useState('');
    const [showModelPicker, setShowModelPicker] = useState(false);
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

    const handleQuickChip = (prompt: string) => {
        setInput(prompt);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                {/* Header with Model Selector */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => setShowModelPicker(!showModelPicker)}
                        style={styles.modelSelector}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="hardware-chip-outline" size={16} color={colors.accent[400]} />
                        <Text style={styles.activeModelText}>{activeModel.name}</Text>
                        <Ionicons name="chevron-down" size={14} color={colors.slate[400]} />
                    </TouchableOpacity>

                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            onPress={clearChatHistory}
                            style={styles.clearBtn}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="trash-outline" size={18} color={colors.slate[400]} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Model Selector Dropdown */}
                {showModelPicker && (
                    <View style={styles.dropdown}>
                        <Text style={styles.dropdownTitle}>Select Active Inference Engine:</Text>
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
                                >
                                    <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]}>
                                        {m.name}
                                    </Text>
                                    <Badge
                                        label={m.type === 'on-device' ? 'OFFLINE' : m.type.toUpperCase()}
                                        variant={m.type === 'on-device' ? 'primary' : 'info'}
                                        size="sm"
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* Chat Messages List */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map((msg, idx) => {
                        const isUser = msg.role === 'user';
                        return (
                            <View
                                key={msg.id || idx}
                                style={[
                                    styles.messageBubbleWrapper,
                                    isUser ? styles.userBubbleWrapper : styles.assistantBubbleWrapper,
                                ]}
                            >
                                {!isUser && (
                                    <View style={styles.avatarWrap}>
                                        <Ionicons name="sparkles" size={14} color={colors.accent[300]} />
                                    </View>
                                )}

                                <View
                                    style={[
                                        styles.messageBubble,
                                        isUser ? styles.userBubble : styles.assistantBubble,
                                    ]}
                                >
                                    {/* Message Text */}
                                    <Text
                                        style={[
                                            styles.messageText,
                                            isUser ? styles.userMessageText : styles.assistantMessageText,
                                        ]}
                                    >
                                        {msg.content}
                                    </Text>

                                    {/* Render step execution logs if available */}
                                    {msg.steps && msg.steps.length > 0 && (
                                        <View style={styles.stepsWrap}>
                                            <StepExecutionViewer steps={msg.steps} />
                                        </View>
                                    )}

                                    {/* Footer Info */}
                                    {!isUser && msg.latencyMs && (
                                        <View style={styles.msgFooter}>
                                            <Text style={styles.latencyText}>
                                                ⚡ {msg.latencyMs}ms • {msg.modelUsed || activeModel.name}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })}

                    {/* Live Processing Indicator & Steps */}
                    {isProcessing && (
                        <View style={styles.processingWrapper}>
                            <StepExecutionViewer steps={activeSteps} isProcessing={true} />
                        </View>
                    )}
                </ScrollView>

                {/* Quick Suggestion Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.chipsScroll}
                    contentContainerStyle={styles.chipsContainer}
                >
                    <TouchableOpacity
                        style={styles.chip}
                        onPress={() => handleQuickChip('What am I missing today?')}
                    >
                        <Text style={styles.chipText}>⚠️ What am I missing?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.chip}
                        onPress={() => handleQuickChip('Summarize Project Alpha notes from my shared folder')}
                    >
                        <Text style={styles.chipText}>📂 Project Alpha Notes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.chip}
                        onPress={() => handleQuickChip('Who is in my local contacts?')}
                    >
                        <Text style={styles.chipText}>👥 Local Contacts</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Input Bar */}
                <View style={styles.inputContainer}>
                    <TouchableOpacity
                        style={styles.vaultAttachBtn}
                        onPress={() => onNavigateTab?.('vault')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="folder-outline" size={20} color={colors.accent[400]} />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.textInput}
                        placeholder="Ask Nola or assign a task..."
                        placeholderTextColor={colors.slate[500]}
                        value={input}
                        onChangeText={setInput}
                        multiline
                    />

                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!input.trim() || isProcessing}
                        style={[
                            styles.sendButton,
                            (!input.trim() || isProcessing) && styles.sendButtonDisabled,
                        ]}
                        activeOpacity={0.8}
                    >
                        {isProcessing ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
                        )}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    },
    modelSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        paddingVertical: 6,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    activeModelText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.text.primary,
        marginHorizontal: 6,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    clearBtn: {
        padding: spacing.xs,
    },
    dropdown: {
        backgroundColor: colors.background.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate[800],
        padding: spacing.md,
    },
    dropdownTitle: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[400],
        marginBottom: spacing.sm,
        fontWeight: '600',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: 4,
    },
    dropdownItemSelected: {
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderWidth: 1,
        borderColor: colors.primary[600],
    },
    dropdownItemText: {
        fontSize: typography.fontSize.sm,
        color: colors.slate[300],
    },
    dropdownItemTextActive: {
        color: colors.text.primary,
        fontWeight: '700',
    },
    messagesList: {
        flex: 1,
    },
    messagesContent: {
        padding: spacing.lg,
        paddingBottom: spacing.lg,
    },
    messageBubbleWrapper: {
        flexDirection: 'row',
        marginVertical: spacing.sm,
        alignItems: 'flex-start',
    },
    userBubbleWrapper: {
        justifyContent: 'flex-end',
    },
    assistantBubbleWrapper: {
        justifyContent: 'flex-start',
    },
    avatarWrap: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
        marginTop: 4,
    },
    messageBubble: {
        maxWidth: '85%',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    userBubble: {
        backgroundColor: colors.primary[600],
        borderBottomRightRadius: 2,
    },
    assistantBubble: {
        backgroundColor: colors.background.card,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderBottomLeftRadius: 2,
        flex: 1,
    },
    messageText: {
        fontSize: typography.fontSize.sm,
        lineHeight: 21,
    },
    userMessageText: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
    assistantMessageText: {
        color: colors.slate[200],
    },
    stepsWrap: {
        marginTop: spacing.sm,
    },
    msgFooter: {
        marginTop: spacing.xs,
        paddingTop: spacing.xs,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    latencyText: {
        fontSize: 10,
        color: colors.slate[500],
    },
    processingWrapper: {
        marginVertical: spacing.sm,
    },
    chipsScroll: {
        maxHeight: 40,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.xs,
    },
    chipsContainer: {
        gap: spacing.sm,
        alignItems: 'center',
    },
    chip: {
        backgroundColor: colors.background.card,
        paddingVertical: 5,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    chipText: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[300],
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.background.secondary,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
    },
    vaultAttachBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    textInput: {
        flex: 1,
        backgroundColor: colors.background.card,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        color: colors.text.primary,
        fontSize: typography.fontSize.sm,
        maxHeight: 90,
        borderWidth: 1,
        borderColor: colors.slate[800],
    },
    sendButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.accent[500],
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: spacing.sm,
    },
    sendButtonDisabled: {
        backgroundColor: colors.slate[700],
        opacity: 0.5,
    },
});

export default ChatScreen;
