/**
 * Tasks Screen - Daily Agenda & Missing Items
 * Tracks scheduled routines, overdue items, and task automations
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
import { colors, spacing, typography, borderRadius } from '../theme';

interface TasksScreenProps {
    onAskNolaAboutSchedule?: (prompt: string) => void;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({ onAskNolaAboutSchedule }) => {
    const {
        tasks,
        missingAlerts,
        scheduleItems,
        toggleTaskStatus,
        addTask,
        deleteTask,
    } = useTasks();

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueTime, setDueTime] = useState('02:00 PM');
    const [category, setCategory] = useState<'schedule' | 'missing_alert' | 'todo'>('schedule');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

    const handleCreateTask = () => {
        if (!title.trim()) {
            Alert.alert('Missing Title', 'Please enter a task or schedule title.');
            return;
        }

        addTask(title.trim(), description.trim(), dueTime.trim(), category, priority);
        setTitle('');
        setDescription('');
        setIsAddModalVisible(false);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Agenda & Tasks</Text>
                        <Text style={styles.headerSubtitle}>
                            {tasks.length} items synced offline on this device
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setIsAddModalVisible(true)}
                        style={styles.addBtn}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                        <Text style={styles.addBtnText}>New Item</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.scrollList}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Critical "What Am I Missing" Radar Section */}
                    {missingAlerts.length > 0 && (
                        <View style={styles.sectionWrap}>
                            <View style={styles.sectionHeaderRow}>
                                <Ionicons name="alert-circle" size={18} color={colors.warning.main} />
                                <Text style={styles.sectionTitleWarning}>What Am I Missing Radar</Text>
                                <Badge
                                    label={`${missingAlerts.length} OVERDUE`}
                                    variant="warning"
                                    size="sm"
                                />
                            </View>

                            {missingAlerts.map(item => {
                                const isDone = item.status === 'completed';
                                return (
                                    <Card key={item.id} variant="glowAmber" style={styles.taskCard}>
                                        <View style={styles.taskRow}>
                                            <TouchableOpacity
                                                onPress={() => toggleTaskStatus(item.id)}
                                                style={[styles.checkbox, isDone && styles.checkboxDone]}
                                                activeOpacity={0.7}
                                            >
                                                {isDone && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                                            </TouchableOpacity>

                                            <View style={styles.taskBody}>
                                                <Text style={[styles.taskTitle, isDone && styles.taskDoneText]}>
                                                    {item.title}
                                                </Text>
                                                {item.description ? (
                                                    <Text style={styles.taskDesc}>{item.description}</Text>
                                                ) : null}
                                                <View style={styles.taskMeta}>
                                                    <Ionicons name="time-outline" size={12} color={colors.standby[400]} />
                                                    <Text style={styles.taskDueText}>{item.dueTime || 'Due ASAP'}</Text>
                                                </View>
                                            </View>

                                            <TouchableOpacity
                                                onPress={() => deleteTask(item.id)}
                                                style={styles.deleteBtn}
                                            >
                                                <Ionicons name="trash-outline" size={16} color={colors.slate[500]} />
                                            </TouchableOpacity>
                                        </View>
                                    </Card>
                                );
                            })}
                        </View>
                    )}

                    {/* Today's Schedule Timeline */}
                    <View style={styles.sectionWrap}>
                        <View style={styles.sectionHeaderRow}>
                            <Ionicons name="calendar" size={18} color={colors.accent[400]} />
                            <Text style={styles.sectionTitle}>Today's Schedule & Routine</Text>
                            <Badge
                                label={`${scheduleItems.length} EVENTS`}
                                variant="accent"
                                size="sm"
                            />
                        </View>

                        {scheduleItems.map(item => {
                            const isDone = item.status === 'completed';
                            return (
                                <Card key={item.id} variant="default" style={styles.taskCard}>
                                    <View style={styles.taskRow}>
                                        <TouchableOpacity
                                            onPress={() => toggleTaskStatus(item.id)}
                                            style={[styles.checkbox, isDone && styles.checkboxDone]}
                                            activeOpacity={0.7}
                                        >
                                            {isDone && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                                        </TouchableOpacity>

                                        <View style={styles.taskBody}>
                                            <View style={styles.scheduleHeader}>
                                                <Text style={[styles.taskTitle, isDone && styles.taskDoneText]}>
                                                    {item.title}
                                                </Text>
                                                <Badge
                                                    label={item.dueTime || 'All Day'}
                                                    variant="primary"
                                                    size="sm"
                                                />
                                            </View>

                                            {item.description ? (
                                                <Text style={styles.taskDesc}>{item.description}</Text>
                                            ) : null}
                                        </View>

                                        <TouchableOpacity
                                            onPress={() => deleteTask(item.id)}
                                            style={styles.deleteBtn}
                                        >
                                            <Ionicons name="trash-outline" size={16} color={colors.slate[500]} />
                                        </TouchableOpacity>
                                    </View>
                                </Card>
                            );
                        })}
                    </View>

                    {/* Other Tasks */}
                    <View style={styles.sectionWrap}>
                        <Text style={styles.sectionTitle}>Other Tasks & Todos</Text>
                        {tasks
                            .filter(t => t.category === 'todo')
                            .map(item => {
                                const isDone = item.status === 'completed';
                                return (
                                    <Card key={item.id} variant="default" style={styles.taskCard}>
                                        <View style={styles.taskRow}>
                                            <TouchableOpacity
                                                onPress={() => toggleTaskStatus(item.id)}
                                                style={[styles.checkbox, isDone && styles.checkboxDone]}
                                                activeOpacity={0.7}
                                            >
                                                {isDone && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                                            </TouchableOpacity>

                                            <View style={styles.taskBody}>
                                                <Text style={[styles.taskTitle, isDone && styles.taskDoneText]}>
                                                    {item.title}
                                                </Text>
                                                {item.description ? (
                                                    <Text style={styles.taskDesc}>{item.description}</Text>
                                                ) : null}
                                            </View>

                                            <TouchableOpacity
                                                onPress={() => deleteTask(item.id)}
                                                style={styles.deleteBtn}
                                            >
                                                <Ionicons name="trash-outline" size={16} color={colors.slate[500]} />
                                            </TouchableOpacity>
                                        </View>
                                    </Card>
                                );
                            })}
                    </View>
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
                                <Text style={styles.modalTitle}>Add Schedule Item or Task</Text>
                                <TouchableOpacity
                                    onPress={() => setIsAddModalVisible(false)}
                                    style={styles.closeBtn}
                                >
                                    <Ionicons name="close" size={24} color={colors.slate[400]} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                <Input
                                    label="Item Title"
                                    placeholder="e.g. Client Architecture Review"
                                    value={title}
                                    onChangeText={setTitle}
                                />
                                <Input
                                    label="Time / Due Time"
                                    placeholder="e.g. 03:30 PM or Friday 5:00 PM"
                                    value={dueTime}
                                    onChangeText={setDueTime}
                                />
                                <Input
                                    label="Description & Details"
                                    placeholder="Optional notes or details..."
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={3}
                                />

                                {/* Category Selector */}
                                <Text style={styles.label}>Category</Text>
                                <View style={styles.categoryRow}>
                                    <TouchableOpacity
                                        onPress={() => setCategory('schedule')}
                                        style={[
                                            styles.categoryChip,
                                            category === 'schedule' && styles.categoryChipActive,
                                        ]}
                                    >
                                        <Text style={[styles.categoryText, category === 'schedule' && styles.categoryTextActive]}>
                                            📅 Schedule
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setCategory('missing_alert')}
                                        style={[
                                            styles.categoryChip,
                                            category === 'missing_alert' && styles.categoryChipWarning,
                                        ]}
                                    >
                                        <Text style={[styles.categoryText, category === 'missing_alert' && styles.categoryTextActive]}>
                                            ⚠️ Missing Radar
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setCategory('todo')}
                                        style={[
                                            styles.categoryChip,
                                            category === 'todo' && styles.categoryChipActive,
                                        ]}
                                    >
                                        <Text style={[styles.categoryText, category === 'todo' && styles.categoryTextActive]}>
                                            ✅ Todo
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <Button
                                    label="Save to Offline Database"
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
        color: colors.text.secondary,
        marginTop: 2,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary[600],
        paddingVertical: 7,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
    },
    addBtnText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 4,
    },
    scrollList: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing['4xl'],
    },
    sectionWrap: {
        marginBottom: spacing.xl,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitleWarning: {
        fontSize: typography.fontSize.base,
        fontWeight: '700',
        color: colors.standby[300],
        marginLeft: spacing.xs,
        flex: 1,
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '700',
        color: colors.text.primary,
        marginLeft: spacing.xs,
        flex: 1,
    },
    taskCard: {
        marginBottom: spacing.sm,
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
        borderColor: colors.slate[600],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
        marginTop: 2,
    },
    checkboxDone: {
        backgroundColor: colors.success.main,
        borderColor: colors.success.main,
    },
    taskBody: {
        flex: 1,
    },
    scheduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    taskTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.text.primary,
    },
    taskDoneText: {
        textDecorationLine: 'line-through',
        color: colors.slate[500],
    },
    taskDesc: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[400],
        marginTop: 2,
        lineHeight: 16,
    },
    taskMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    taskDueText: {
        fontSize: typography.fontSize.xs,
        color: colors.standby[400],
        marginLeft: 4,
        fontWeight: '600',
    },
    deleteBtn: {
        padding: spacing.xs,
        marginLeft: spacing.sm,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.background.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background.secondary,
        borderTopLeftRadius: borderRadius['2xl'],
        borderTopRightRadius: borderRadius['2xl'],
        maxHeight: '85%',
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.slate[800],
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
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
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.slate[300],
        marginBottom: spacing.xs,
    },
    categoryRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    categoryChip: {
        flex: 1,
        backgroundColor: colors.background.card,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.slate[800],
    },
    categoryChipActive: {
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: colors.primary[500],
    },
    categoryChipWarning: {
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderColor: colors.standby[500],
    },
    categoryText: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[400],
        fontWeight: '600',
    },
    categoryTextActive: {
        color: colors.text.primary,
        fontWeight: '700',
    },
    modalFooter: {
        marginTop: spacing.md,
    },
});

export default TasksScreen;
