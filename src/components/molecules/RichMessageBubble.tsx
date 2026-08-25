/**
 * RichMessageBubble - Molecule
 * Premium chat bubble renderer supporting Markdown, Code blocks with copy,
 * Audio waveform player, File attachment previews, and Thinking Chain-of-Thought drawers.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Clipboard,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '../../contexts/NolaContext';
import { StepExecutionViewer } from './StepExecutionViewer';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface RichMessageBubbleProps {
    message: ChatMessage;
    onAskAboutFile?: (filename: string) => void;
    onSaveToVault?: (content: string) => void;
    onScheduleTask?: (title: string) => void;
}

export const RichMessageBubble: React.FC<RichMessageBubbleProps> = ({
    message,
    onAskAboutFile,
    onSaveToVault,
    onScheduleTask,
}) => {
    const isUser = message.role === 'user';
    const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

    // Copy code helper
    const handleCopyCode = (code: string, index: number) => {
        Clipboard.setString(code);
        setCopiedCodeIndex(index);
        setTimeout(() => setCopiedCodeIndex(null), 2000);
    };

    // Toggle audio playback simulation
    const toggleAudioPlay = () => {
        setIsPlayingAudio(!isPlayingAudio);
    };

    if (isUser) {
        return (
            <View style={styles.userBubbleWrapper}>
                <View style={styles.userBubble}>
                    <Text style={styles.userBubbleText}>{message.content}</Text>
                    <View style={styles.userMetaRow}>
                        <Ionicons name="checkmark-done" size={13} color="rgba(255, 255, 255, 0.85)" />
                    </View>
                </View>
            </View>
        );
    }

    // Parse blocks from message content (Code blocks, File references, Audio references)
    const content = message.content || '';
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

    // Split text into regular markdown and code segments
    const renderContentBlocks = () => {
        const parts: Array<{ type: 'text' | 'code'; language?: string; code?: string; content?: string; index?: number }> = [];
        let lastIdx = 0;
        let match;
        let codeCounter = 0;

        while ((match = codeBlockRegex.exec(content)) !== null) {
            if (match.index > lastIdx) {
                parts.push({
                    type: 'text',
                    content: content.slice(lastIdx, match.index),
                });
            }
            parts.push({
                type: 'code',
                language: match[1] || 'typescript',
                code: (match[2] || '').trim(),
                index: codeCounter++,
            });
            lastIdx = match.index + match[0].length;
        }

        if (lastIdx < content.length) {
            parts.push({
                type: 'text',
                content: content.slice(lastIdx),
            });
        }

        if (parts.length === 0) {
            parts.push({ type: 'text', content });
        }

        return parts.map((part, pIdx) => {
            if (part.type === 'code') {
                const codeStr = part.code || '';
                const langStr = part.language || 'code';
                const isCopied = copiedCodeIndex === part.index;

                return (
                    <View key={`code-${pIdx}`} style={styles.codeBlockCard}>
                        <View style={styles.codeHeaderRow}>
                            <View style={styles.codeLangBadge}>
                                <Ionicons name="terminal-outline" size={12} color="#38BDF8" />
                                <Text style={styles.codeLangText}>{langStr.toUpperCase()}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => handleCopyCode(codeStr, part.index ?? pIdx)}
                                style={styles.copyBtn}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={isCopied ? 'checkmark' : 'copy-outline'}
                                    size={12}
                                    color={isCopied ? colors.success.main : colors.slate[400]}
                                />
                                <Text style={[styles.copyBtnText, isCopied && styles.copyBtnTextDone]}>
                                    {isCopied ? 'Copied' : 'Copy'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.codeScrollView}>
                            <Text style={styles.codeText}>{codeStr}</Text>
                        </ScrollView>
                    </View>
                );
            }

            // Clean text with bold and bullet list formatting
            const textStr = part.content || '';

            // Check for file references inside text
            const fileMatches = [...textStr.matchAll(/\[FILE:\s*([^\]]+)\]/g)];
            const audioMatches = [...textStr.matchAll(/\[AUDIO:\s*([^\]]+)\]/g)];

            // Clean tags from regular rendering
            const cleanText = textStr
                .replace(/\[FILE:\s*([^\]]+)\]/g, '')
                .replace(/\[AUDIO:\s*([^\]]+)\]/g, '')
                .trim();

            return (
                <View key={`text-block-${pIdx}`}>
                    {cleanText ? (
                        <Text style={styles.assistantBodyText}>{renderFormattedMarkdown(cleanText)}</Text>
                    ) : null}

                    {/* Render Embedded File Cards */}
                    {fileMatches.map((fMatch, fIdx) => {
                        const filename = fMatch[1].trim();
                        const ext = filename.split('.').pop() || 'doc';
                        return (
                            <TouchableOpacity
                                key={`file-${fIdx}`}
                                onPress={() => onAskAboutFile?.(filename)}
                                style={styles.fileAttachmentCard}
                                activeOpacity={0.8}
                            >
                                <View style={styles.fileIconBox}>
                                    <Ionicons
                                        name={ext === 'md' ? 'document-text' : ext === 'json' ? 'code-slash' : 'reader'}
                                        size={20}
                                        color={colors.primary[600]}
                                    />
                                </View>
                                <View style={styles.fileInfoWrap}>
                                    <Text style={styles.fileNameText} numberOfLines={1}>{filename}</Text>
                                    <Text style={styles.fileMetaText}>Vault File • Offline Synced</Text>
                                </View>
                                <View style={styles.fileActionBtn}>
                                    <Text style={styles.fileActionText}>Inspect</Text>
                                    <Ionicons name="chevron-forward" size={12} color={colors.primary[600]} />
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    {/* Render Embedded Audio Waveform Player */}
                    {audioMatches.map((aMatch, aIdx) => {
                        const audioTitle = aMatch[1].trim();
                        return (
                            <View key={`audio-${aIdx}`} style={styles.audioPlayerCard}>
                                <TouchableOpacity
                                    onPress={toggleAudioPlay}
                                    style={[styles.audioPlayBtn, isPlayingAudio && styles.audioPlayBtnActive]}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name={isPlayingAudio ? 'pause' : 'play'}
                                        size={16}
                                        color="#FFFFFF"
                                    />
                                </TouchableOpacity>

                                <View style={styles.audioWaveformWrap}>
                                    <Text style={styles.audioTitleText} numberOfLines={1}>🎙️ {audioTitle}</Text>
                                    {/* Waveform Bars */}
                                    <View style={styles.waveformBarsRow}>
                                        {[40, 70, 30, 90, 60, 100, 45, 80, 55, 95, 75, 40, 85, 50, 65, 35].map((height, barIdx) => (
                                            <View
                                                key={`wave-bar-${barIdx}`}
                                                style={[
                                                    styles.waveformBar,
                                                    { height: Math.max(6, (height / 100) * 20) },
                                                    isPlayingAudio && barIdx < 9 ? styles.waveformBarPlayed : styles.waveformBarInactive,
                                                ]}
                                            />
                                        ))}
                                    </View>
                                </View>

                                <Text style={styles.audioDurationText}>0:18</Text>
                            </View>
                        );
                    })}
                </View>
            );
        });
    };

    return (
        <View style={styles.assistantCardWrapper}>
            <View style={styles.assistantCard}>
                {/* 1. Enhanced Thinking & Reasoning Header Drawer */}
                {message.steps && message.steps.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setIsThinkingExpanded(!isThinkingExpanded)}
                        style={[styles.thinkingDrawer, isThinkingExpanded && styles.thinkingDrawerExpanded]}
                        activeOpacity={0.7}
                    >
                        <View style={styles.thinkingIconBadge}>
                            <Ionicons name="bulb" size={13} color={colors.primary[500]} />
                        </View>
                        <View style={styles.thinkingTitleWrap}>
                            <Text style={styles.thinkingTitle}>
                                Task Decomposition
                            </Text>
                            <Text style={styles.thinkingSub}>
                                {message.steps.length} atomic steps verified
                            </Text>
                        </View>
                        <View style={styles.thinkingViewChip}>
                            <Text style={styles.thinkingViewText}>
                                {isThinkingExpanded ? 'HIDE' : 'VIEW STEPS'}
                            </Text>
                            <Ionicons
                                name={isThinkingExpanded ? 'chevron-up' : 'chevron-down'}
                                size={12}
                                color={colors.primary[600]}
                            />
                        </View>
                    </TouchableOpacity>
                )}

                {/* 2. Expanded Step Visualizer */}
                {isThinkingExpanded && message.steps && (
                    <View style={styles.expandedStepsBox}>
                        <StepExecutionViewer steps={message.steps} />
                    </View>
                )}

                {/* 3. Message Body (Markdown, Code, Files, Audio) */}
                {renderContentBlocks()}

                {/* 4. Action Row (Save to vault, Add to tasks) */}
                <View style={styles.cardFooter}>
                    <View style={styles.footerModelWrap}>
                        <Ionicons name="hardware-chip-outline" size={11} color={colors.text.muted} />
                        <Text style={styles.footerModelName}>
                            {message.modelUsed || 'Gemma 4 E2B'}
                        </Text>
                        {message.latencyMs && (
                            <>
                                <Text style={styles.metaDot}>•</Text>
                                <Ionicons name="time-outline" size={11} color={colors.standby[600]} />
                                <Text style={styles.latencyText}>
                                    {(message.latencyMs / 1000).toFixed(2)}s
                                </Text>
                            </>
                        )}
                    </View>

                    <View style={styles.quickActionPills}>
                        {onSaveToVault && (
                            <TouchableOpacity
                                onPress={() => onSaveToVault(message.content)}
                                style={styles.quickPillBtn}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="bookmark-outline" size={12} color={colors.primary[600]} />
                                <Text style={styles.quickPillText}>Save</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};

// Helper: Basic Markdown Line Formatter
function renderFormattedMarkdown(text: string) {
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
        // Bullet list
        if (line.startsWith('• ') || line.startsWith('* ') || line.startsWith('- ')) {
            return `\n• ${line.replace(/^[•*-]\s*/, '')}`;
        }
        return (lIdx > 0 ? '\n' : '') + line;
    }).join('');
}

const styles = StyleSheet.create({
    // User Bubble
    userBubbleWrapper: {
        alignItems: 'flex-end',
        marginVertical: spacing.xs + 2,
    },
    userBubble: {
        backgroundColor: colors.primary[500],
        paddingVertical: 10,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.xl,
        borderBottomRightRadius: 4,
        maxWidth: '85%',
        ...shadows.subtle,
    },
    userBubbleText: {
        fontSize: typography.fontSize.sm + 0.5,
        fontWeight: '600',
        color: '#FFFFFF',
        lineHeight: 20,
    },
    userMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },

    // Assistant Card
    assistantCardWrapper: {
        marginVertical: spacing.xs + 2,
    },
    assistantCard: {
        backgroundColor: colors.background.surface,
        borderRadius: borderRadius.xl,
        borderTopLeftRadius: 4,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.slate[200],
        ...shadows.card,
    },

    // Thinking Drawer
    thinkingDrawer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.slate[50],
        paddingVertical: 8,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.slate[200],
        marginBottom: spacing.sm,
        gap: 8,
    },
    thinkingDrawerExpanded: {
        backgroundColor: 'rgba(2, 132, 199, 0.05)',
        borderColor: 'rgba(2, 132, 199, 0.2)',
    },
    thinkingIconBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    thinkingTitleWrap: {
        flex: 1,
    },
    thinkingTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.text.primary,
    },
    thinkingSub: {
        fontSize: 10,
        color: colors.text.muted,
        marginTop: 1,
    },
    thinkingViewChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.surface,
        paddingVertical: 4,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.slate[200],
        gap: 3,
    },
    thinkingViewText: {
        fontSize: 10,
        fontWeight: '800',
        color: colors.primary[600],
    },
    expandedStepsBox: {
        marginBottom: spacing.sm,
    },

    // Main Text
    assistantBodyText: {
        fontSize: typography.fontSize.sm + 0.5,
        color: colors.text.primary,
        lineHeight: 22,
    },

    // Code Block Card
    codeBlockCard: {
        backgroundColor: '#0B1120',
        borderRadius: borderRadius.lg,
        marginVertical: spacing.sm,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    codeHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0F172A',
        paddingVertical: 6,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    codeLangBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    codeLangText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#38BDF8',
        fontFamily: 'monospace',
    },
    copyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        paddingVertical: 3,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.sm,
        gap: 4,
    },
    copyBtnText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.slate[400],
    },
    copyBtnTextDone: {
        color: colors.success.main,
    },
    codeScrollView: {
        padding: spacing.md,
    },
    codeText: {
        fontSize: 12,
        color: '#E2E8F0',
        fontFamily: 'monospace',
        lineHeight: 18,
    },

    // Embedded File Attachment Card
    fileAttachmentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.slate[50],
        padding: spacing.sm + 2,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.slate[200],
        marginVertical: spacing.xs + 2,
    },
    fileIconBox: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.md,
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    fileInfoWrap: {
        flex: 1,
    },
    fileNameText: {
        fontSize: typography.fontSize.xs + 1,
        fontWeight: '700',
        color: colors.text.primary,
    },
    fileMetaText: {
        fontSize: 10,
        color: colors.text.muted,
        marginTop: 1,
    },
    fileActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.surface,
        paddingVertical: 4,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.slate[200],
        gap: 2,
    },
    fileActionText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.primary[600],
    },

    // Embedded Audio Player Card
    audioPlayerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(2, 132, 199, 0.06)',
        padding: spacing.sm + 2,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: 'rgba(2, 132, 199, 0.2)',
        marginVertical: spacing.xs + 2,
        gap: spacing.sm,
    },
    audioPlayBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary[500],
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.subtle,
    },
    audioPlayBtnActive: {
        backgroundColor: colors.accent[500],
    },
    audioWaveformWrap: {
        flex: 1,
    },
    audioTitleText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: 4,
    },
    waveformBarsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2.5,
        height: 20,
    },
    waveformBar: {
        width: 3,
        borderRadius: 2,
    },
    waveformBarPlayed: {
        backgroundColor: colors.primary[600],
    },
    waveformBarInactive: {
        backgroundColor: colors.slate[300],
    },
    audioDurationText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.text.muted,
        fontFamily: 'monospace',
    },

    // Card Footer
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.md,
        paddingTop: spacing.xs + 2,
        borderTopWidth: 1,
        borderTopColor: colors.slate[100],
    },
    footerModelWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerModelName: {
        fontSize: 10,
        color: colors.text.muted,
        fontWeight: '600',
    },
    metaDot: {
        fontSize: 10,
        color: colors.slate[300],
    },
    latencyText: {
        fontSize: 10,
        color: colors.standby[600],
        fontWeight: '700',
    },
    quickActionPills: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    quickPillBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.slate[50],
        paddingVertical: 3,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.slate[200],
        gap: 3,
    },
    quickPillText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.primary[600],
    },
});

export default RichMessageBubble;
