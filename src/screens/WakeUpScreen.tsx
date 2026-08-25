/**
 * Wake Up Screen
 * Standby interface with pulsing wake button, proactive briefing, and missing items radar
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNola } from '../contexts/NolaContext';
import { useTasks } from '../contexts/TaskContext';
import { PulseWakeButton } from '../components/atoms/PulseWakeButton';
import { BriefingCard } from '../components/molecules/BriefingCard';
import { Badge } from '../components/atoms/Badge';
import { colors, spacing, typography, borderRadius } from '../theme';

interface WakeUpScreenProps {
    onNavigateTab: (tab: 'chat' | 'vault' | 'tasks' | 'models') => void;
}

export const WakeUpScreen: React.FC<WakeUpScreenProps> = ({ onNavigateTab }) => {
    const {
        activeModel,
        isStandby,
        isListening,
        isProcessing,
        dailyBriefing,
        startVoiceTrigger,
        sendMessage,
    } = useNola();

    const handleWakePress = () => {
        startVoiceTrigger();
    };

    const handleQuickPrompt = async (prompt: string) => {
        onNavigateTab('chat');
        await sendMessage(prompt);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Top Status Bar */}
                <View style={styles.topBar}>
                    <View style={styles.brandWrap}>
                        <Ionicons name="sparkles" size={18} color={colors.standby[400]} />
                        <Text style={styles.brandTitle}>Wake Up Nola</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => onNavigateTab('models')}
                        style={styles.modelBadge}
                        activeOpacity={0.7}
                    >
                        <View style={styles.activeDot} />
                        <Text style={styles.modelName}>{activeModel.name}</Text>
                        <Ionicons name="chevron-forward" size={12} color={colors.slate[400]} />
                    </TouchableOpacity>
                </View>

                {/* Standby Pulse Wake Section */}
                <View style={styles.pulseSection}>
                    <Text style={styles.standbySubtitle}>
                        {isListening
                            ? 'Listening for your voice command...'
                            : isProcessing
                            ? 'Processing offline task steps...'
                            : 'Nola is on standby on your device'}
                    </Text>

                    <PulseWakeButton
                        isStandby={isStandby}
                        isListening={isListening}
                        isProcessing={isProcessing}
                        onPress={handleWakePress}
                    />

                    <Text style={styles.tapHint}>
                        Tap to Wake Up or speak naturally
                    </Text>
                </View>

                {/* Proactive Daily Briefing & Missing Item Card */}
                <BriefingCard
                    briefing={dailyBriefing}
                    onAskMissing={() => handleQuickPrompt('What am I missing today?')}
                    onViewSchedule={() => onNavigateTab('tasks')}
                    onViewVault={() => onNavigateTab('vault')}
                />

                {/* Quick Offline Actions Grid */}
                <Text style={styles.sectionHeader}>Quick Offline Actions</Text>
                <View style={styles.actionsGrid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => handleQuickPrompt('What am I missing today?')}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                            <Ionicons name="alert-circle-outline" size={22} color={colors.standby[400]} />
                        </View>
                        <Text style={styles.actionTitle}>What Am I Missing?</Text>
                        <Text style={styles.actionDesc}>Scan overdue tasks & weekly items</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => handleQuickPrompt('Summarize Project Alpha notes from my shared folder')}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                            <Ionicons name="folder-open-outline" size={22} color={colors.accent[400]} />
                        </View>
                        <Text style={styles.actionTitle}>Search Shared Vault</Text>
                        <Text style={styles.actionDesc}>Query local documents offline</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => handleQuickPrompt('Plan my afternoon schedule with failsafe steps')}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                            <Ionicons name="git-network-outline" size={22} color={colors.primary[400]} />
                        </View>
                        <Text style={styles.actionTitle}>Decompose a Task</Text>
                        <Text style={styles.actionDesc}>Break big goals into micro-steps</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => onNavigateTab('models')}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                            <Ionicons name="hardware-chip-outline" size={22} color={colors.success.main} />
                        </View>
                        <Text style={styles.actionTitle}>On-Device Models</Text>
                        <Text style={styles.actionDesc}>Gemma 2B • SmolLM • Qwen</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
    contentContainer: {
        padding: spacing.lg,
        paddingBottom: spacing['4xl'],
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    brandWrap: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    brandTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '800',
        color: colors.text.primary,
        marginLeft: spacing.xs,
        letterSpacing: -0.3,
    },
    modelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.slate[100],
        paddingVertical: 5,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.slate[200],
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.success.main,
        marginRight: 6,
    },
    modelName: {
        fontSize: typography.fontSize.xs,
        color: colors.text.primary,
        fontWeight: '600',
        marginRight: 4,
    },
    pulseSection: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: spacing.md,
    },
    standbySubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.slate[400],
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    tapHint: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[500],
        marginTop: spacing.xs,
        letterSpacing: 0.2,
    },
    sectionHeader: {
        fontSize: typography.fontSize.base,
        fontWeight: '700',
        color: colors.text.primary,
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    actionCard: {
        width: '47.5%',
        backgroundColor: colors.background.card,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    actionIcon: {
        width: 38,
        height: 38,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    actionTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: 2,
    },
    actionDesc: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[400],
        lineHeight: 16,
    },
});

export default WakeUpScreen;
