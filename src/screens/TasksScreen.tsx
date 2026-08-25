/**
 * Tasks Screen - Agenda, Missing Action Verification & Decomposed Steps
 * Surfaces "What am I missing?" items and sequential task breakdowns
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Modal,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../contexts/TaskContext';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { TaskAndSchedule } from '../db/schema';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

interface TasksScreenProps {
    onAskNolaAboutSchedule?: (prompt: string) => void;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({ onAskNolaAboutSchedule }) => {
    const {
        tasks,
        missingAlerts,
        toggleTaskStatus,
        addTask,
        refreshTasks,
    } = useTasks();

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [isMissingCheck, setIsMissingCheck] = useState(false);

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    const handleCreateTask = async () => {
        if (!title.trim()) {
            Alert.alert('Missing Title', 'Please enter a task title.');
            return;
        }

        addTask(
            title.trim(),
            description.trim(),
            isMissingCheck ? 'missing_alert' : 'schedule',
            scheduledTime.trim() || 'Today',
            priority
        );

        setTitle('');
        setDescription('');
        setScheduledTime('');
        setPriority('medium');
        setIsMissingCheck(false);
        setIsAddModalVisible(false);
    };

    const handleRunMissingScan = async () => {
        if (onAskNolaAboutSchedule) {
            onAskNolaAboutSchedule('Check my agenda and tell me: what am I missing today?');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Daily Agenda</Text>
                        <Text style={styles.headerSubtitle}>
                            {pendingTasks.length} pending • {missingAlerts.length} missing action checks
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setIsAddModalVisible(true)}
                        style={styles.addBtn}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={18} color="#FFFFFF" />
                        <Text style={styles.addBtnText}>New Task</Text>
                    </TouchableOpacity>
                </View>

                {/* Missing Checks Quick Banner */}
                <View style={styles.missingBanner}>
                    <View style={styles.missingHeader}>
                        <View style={styles.alertIconBox}>
                            <Ionicons name="alert-circle" size={20} color={colors.standby[600]} />
                        </View>
                        <View style={styles.alertTextWrap}>
                            <Text style={styles.alertTitle}>"What am I missing?" Watchdog</Text>
                            <Text style={styles.alertSub}>
                                Standby AI monitors schedule gaps and flagged items
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleRunMissingScan}
                            style={styles.scanButton}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                            <Text style={styles.scanBtnText}>Verify</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tasks List */}
                <ScrollView
                    style={styles.scrollList}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Flagged Missing Checks Section */}
                    {missingAlerts.length > 0 && (
                        <View style={styles.sectionWrap}>
                            <Text style={styles.sectionHeader}>⚠️ Flagged Follow-Ups</Text>
                            {missingAlerts.map(task => (
                                <TaskItem key={task.id} task={task} onToggle={() => toggleTaskStatus(task.id)} />
                            ))}
                        </View>
                    )}

                    {/* Pending Agenda Section */}
                    <View style={styles.sectionWrap}>
                        <Text style={styles.sectionHeader}>📌 Scheduled Agenda ({pendingTasks.length})</Text>
                        {pendingTasks.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <Ionicons name="checkmark-done-circle-outline" size={36} color={colors.success.main} />
                                <Text style={styles.emptyText}>All caught up! No pending tasks.</Text>
                            </View>
                        ) : (
                            pendingTasks.map(task => (
                                <TaskItem key={task.id} task={task} onToggle={() => toggleTaskStatus(task.id)} />
                            ))
                        )}
                    </View>

                    {/* Completed Section */}
                    {completedTasks.length > 0 && (
                        <View style={styles.sectionWrap}>
                            <Text style={styles.sectionHeader}>✓ Completed ({completedTasks.length})</Text>
                            {completedTasks.map(task => (
                                <TaskItem key={task.id} task={task} onToggle={() => toggleTaskStatus(task.id)} />
                            ))}
                        </View>
                    )}
                </ScrollView>

                {/* Add Task Modal */}
                <Modal
                    visible={isAddModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsAddModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Add New Agenda Item</Text>
                                <TouchableOpacity
                                    onPress={() => setIsAddModalVisible(false)}
                                    style={styles.closeBtn}
                                >
                                    <Ionicons name="close" size={24} color={colors.slate[600]} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                <Input
                                    label="Task Title"
                                    placeholder="e.g. Call Alice about Project Alpha"
                                    value={title}
                                    onChangeText={setTitle}
                                />
                                <Input
                                    label="Scheduled Time (Optional)"
                                    placeholder="e.g. 14:00 or Tomorrow 10am"
                                    value={scheduledTime}
                                    onChangeText={setScheduledTime}
                                />
                                <Input
                                    label="Notes & Details"
                                    placeholder="Details or checklist items..."
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                />

                                {/* Missing Check Toggle */}
                                <TouchableOpacity
                                    onPress={() => setIsMissingCheck(!isMissingCheck)}
                                    style={[
                                        styles.flagToggle,
                                        isMissingCheck && styles.flagToggleActive,
                                    ]}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name={isMissingCheck ? 'checkbox' : 'square-outline'}
                                        size={20}
                                        color={isMissingCheck ? colors.standby[600] : colors.slate[400]}
                                    />
                                    <View style={styles.flagTextWrap}>
                                        <Text style={styles.flagTitle}>Flag for "What Am I Missing?" checks</Text>
                                        <Text style={styles.flagSub}>Nola will highlight this item in morning briefings</Text>
                                    </View>
                                </TouchableOpacity>
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <Button
                                    label="Create Task"
                                    variant="primary"
                                    onPress={handleCreateTask}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

const TaskItem: React.FC<{ task: TaskAndSchedule; onToggle: () => void }> = ({ task, onToggle }) => {
    const isCompleted = task.status === 'completed';

    return (
        <Card variant="default" style={styles.taskCard}>
            <TouchableOpacity onPress={onToggle} style={styles.taskRow} activeOpacity={0.7}>
                <View style={[styles.checkbox, isCompleted && styles.checkboxChecked]}>
                    {isCompleted && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>

                <View style={styles.taskInfo}>
                    <View style={styles.taskTitleRow}>
                        <Text style={[styles.taskTitle, isCompleted && styles.taskTitleDone]}>
                            {task.title}
                        </Text>
                        {task.isMissingCheck && (
                            <Badge label="MISSING CHECK" variant="standby" size="sm" />
                        )}
                    </View>

                    {task.description && (
                        <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>
                    )}

                    <View style={styles.taskMeta}>
                        {task.dueTime && (
                            <View style={styles.timeWrap}>
                                <Ionicons name="time-outline" size={11} color={colors.primary[600]} />
                                <Text style={styles.timeText}>{task.dueTime}</Text>
                            </View>
                        )}
                        <Badge
                            label={task.priority?.toUpperCase() || 'NORMAL'}
                            variant={task.priority === 'high' || task.priority === 'critical' ? 'error' : 'default'}
                            size="sm"
                        />
                    </View>
                </View>
            </TouchableOpacity>
        </Card>
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
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.text.primary,
        paddingVertical: 7,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        ...shadows.sm,
    },
    addBtnText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 4,
    },
    missingBanner: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.sm,
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(217, 119, 6, 0.25)',
        ...shadows.subtle,
    },
    missingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    alertIconBox: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(217, 119, 6, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    alertTextWrap: {
        flex: 1,
    },
    alertTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.text.primary,
    },
    alertSub: {
        fontSize: typography.fontSize.xs,
        color: colors.text.muted,
        marginTop: 1,
    },
    scanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.standby[600],
        paddingVertical: 6,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
    },
    scanBtnText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 4,
    },
    scrollList: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing['3xl'],
    },
    sectionWrap: {
        marginBottom: spacing.lg,
    },
    sectionHeader: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.text.muted,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: spacing.sm,
    },
    emptyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(15, 23, 42, 0.06)',
    },
    emptyText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        marginTop: spacing.xs,
    },
    taskCard: {
        marginBottom: spacing.xs + 4,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(15, 23, 42, 0.08)',
        ...shadows.subtle,
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.slate[300],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: colors.success.main,
        borderColor: colors.success.main,
    },
    taskInfo: {
        flex: 1,
    },
    taskTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    taskTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.text.primary,
        flex: 1,
    },
    taskTitleDone: {
        textDecorationLine: 'line-through',
        color: colors.slate[400],
    },
    taskDesc: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        marginTop: 2,
        lineHeight: 16,
    },
    taskMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: spacing.sm,
    },
    timeWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    timeText: {
        fontSize: 11,
        color: colors.primary[600],
        fontWeight: '600',
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
    flagToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.slate[50],
        borderWidth: 1,
        borderColor: colors.slate[200],
        marginTop: spacing.sm,
    },
    flagToggleActive: {
        backgroundColor: 'rgba(217, 119, 6, 0.08)',
        borderColor: 'rgba(217, 119, 6, 0.3)',
    },
    flagTextWrap: {
        marginLeft: spacing.sm,
        flex: 1,
    },
    flagTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.text.primary,
    },
    flagSub: {
        fontSize: 11,
        color: colors.text.muted,
        marginTop: 1,
    },
    modalFooter: {
        marginTop: spacing.md,
    },
});

export default TasksScreen;
