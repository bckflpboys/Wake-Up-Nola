/**
 * Wake Up Nola - Tasks & Daily Agenda Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { expoDb } from '../db/client';
import { TaskAndSchedule } from '../db/schema';

const DEFAULT_TASKS: TaskAndSchedule[] = [
    {
        id: 'task-1',
        title: 'Team Architecture Sync',
        description: 'Discuss on-device inference pipeline for Gemma 2B',
        category: 'schedule',
        dueTime: '08:30 AM',
        priority: 'high',
        status: 'pending',
        reminderMinutes: 15,
        isMissingCheck: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'task-2',
        title: 'Review Shared Vault Indexing',
        description: 'Ensure offline text extraction and RAG works without wifi',
        category: 'schedule',
        dueTime: '11:00 AM',
        priority: 'medium',
        status: 'pending',
        reminderMinutes: 10,
        isMissingCheck: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'task-3',
        title: 'Client Status Report: Project Alpha',
        description: 'Send sprint update to client',
        category: 'schedule',
        dueTime: '04:00 PM',
        priority: 'high',
        status: 'pending',
        reminderMinutes: 30,
        isMissingCheck: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'task-4',
        title: 'Submit Monthly Expense Report',
        description: 'Missing item from weekly checklist - due before Friday!',
        category: 'missing_alert',
        dueTime: 'Tomorrow 5:00 PM',
        priority: 'critical',
        status: 'pending',
        reminderMinutes: 60,
        isMissingCheck: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'task-5',
        title: 'Backup Vault to External Storage',
        description: 'Ensure all local notes are archived safely',
        category: 'todo',
        dueTime: '08:00 PM',
        priority: 'low',
        status: 'pending',
        reminderMinutes: 0,
        isMissingCheck: false,
        createdAt: new Date().toISOString(),
    },
];

interface TaskContextType {
    tasks: TaskAndSchedule[];
    missingAlerts: TaskAndSchedule[];
    scheduleItems: TaskAndSchedule[];
    toggleTaskStatus: (id: string) => void;
    addTask: (title: string, description: string, dueTime: string, category?: string, priority?: string) => void;
    deleteTask: (id: string) => void;
    refreshTasks: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<TaskAndSchedule[]>([...DEFAULT_TASKS]);

    useEffect(() => {
        refreshTasks();
    }, []);

    const refreshTasks = () => {
        if (expoDb) {
            try {
                const rows = expoDb.getAllSync('SELECT * FROM tasks_and_schedules ORDER BY created_at ASC');
                if (rows && rows.length > 0) {
                    setTasks(
                        rows.map((r: any) => ({
                            id: r.id,
                            title: r.title,
                            description: r.description || '',
                            category: r.category || 'schedule',
                            dueTime: r.due_time || '',
                            priority: r.priority || 'medium',
                            status: r.status || 'pending',
                            reminderMinutes: r.reminder_minutes || 15,
                            isMissingCheck: Boolean(r.is_missing_check),
                            createdAt: r.created_at,
                        }))
                    );
                    return;
                }
            } catch (err) {
                console.warn('Error reading tasks from DB:', err);
            }
        }
    };

    const toggleTaskStatus = (id: string) => {
        setTasks(prev =>
            prev.map(task => {
                if (task.id === id) {
                    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
                    if (expoDb) {
                        try {
                            expoDb.execSync(`UPDATE tasks_and_schedules SET status = '${newStatus}' WHERE id = '${id}'`);
                        } catch (err) {
                            console.warn('Error updating task status:', err);
                        }
                    }
                    return { ...task, status: newStatus };
                }
                return task;
            })
        );
    };

    const addTask = (
        title: string,
        description: string,
        dueTime: string,
        category: string = 'schedule',
        priority: string = 'medium'
    ) => {
        const id = `task-${Date.now()}`;
        const now = new Date().toISOString();
        const newTask: TaskAndSchedule = {
            id,
            title,
            description,
            category,
            dueTime,
            priority,
            status: 'pending',
            reminderMinutes: 15,
            isMissingCheck: category === 'missing_alert',
            createdAt: now,
        };

        if (expoDb) {
            try {
                expoDb.execSync(`
                    INSERT INTO tasks_and_schedules (id, title, description, category, due_time, priority, status, reminder_minutes, is_missing_check, created_at)
                    VALUES ('${id}', '${title.replace(/'/g, "''")}', '${description.replace(/'/g, "''")}', '${category}', '${dueTime}', '${priority}', 'pending', 15, ${category === 'missing_alert' ? 1 : 0}, '${now}');
                `);
            } catch (err) {
                console.warn('Error inserting task into DB:', err);
            }
        }

        setTasks(prev => [newTask, ...prev]);
    };

    const deleteTask = (id: string) => {
        if (expoDb) {
            try {
                expoDb.execSync(`DELETE FROM tasks_and_schedules WHERE id = '${id}'`);
            } catch (err) {
                console.warn('Error deleting task from DB:', err);
            }
        }
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const missingAlerts = tasks.filter(t => t.isMissingCheck || t.category === 'missing_alert');
    const scheduleItems = tasks.filter(t => t.category === 'schedule');

    return (
        <TaskContext.Provider
            value={{
                tasks,
                missingAlerts,
                scheduleItems,
                toggleTaskStatus,
                addTask,
                deleteTask,
                refreshTasks,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};
