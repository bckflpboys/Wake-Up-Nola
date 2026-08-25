import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Conversations Table
export const conversations = sqliteTable('conversations', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    activeModel: text('active_model').default('gemma-2-2b'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
});

// Messages Table (with Step-by-Step Micro-Agent Logs)
export const messages = sqliteTable('messages', {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id').notNull(),
    role: text('role').notNull(), // 'user' | 'assistant' | 'system'
    content: text('content').notNull(),
    stepsJson: text('steps_json'), // JSON array of execution steps: [{ step: 1, title: '...', status: 'complete', detail: '...' }]
    latencyMs: integer('latency_ms'),
    modelUsed: text('model_used'),
    createdAt: text('created_at').notNull(),
});

// Vault Documents Table (Local Shared Folder / Offline Knowledge Base)
export const vaultDocuments = sqliteTable('vault_documents', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    filename: text('filename').notNull(),
    filepath: text('filepath'),
    fileType: text('file_type').default('text'), // 'markdown', 'text', 'json', 'pdf', 'note'
    content: text('content').notNull(),
    wordCount: integer('word_count').default(0),
    tags: text('tags'), // JSON string or comma-separated
    isIndexed: integer('is_indexed', { mode: 'boolean' }).default(true),
    lastModified: text('last_modified').notNull(),
    createdAt: text('created_at').notNull(),
});

// Tasks & Schedules Table ("What am I missing today?")
export const tasksAndSchedules = sqliteTable('tasks_and_schedules', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    category: text('category').default('routine'), // 'schedule', 'todo', 'missing_alert', 'reminder'
    dueTime: text('due_time'),
    priority: text('priority').default('medium'), // 'low', 'medium', 'high', 'critical'
    status: text('status').default('pending'), // 'pending', 'completed', 'dismissed'
    reminderMinutes: integer('reminder_minutes').default(15),
    isMissingCheck: integer('is_missing_check', { mode: 'boolean' }).default(false),
    createdAt: text('created_at').notNull(),
});

// AI Model Configurations Table
export const aiModelConfigs = sqliteTable('ai_model_configs', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    modelKey: text('model_key').notNull(), // 'gemma-2-2b', 'smollm2-1.7b', 'qwen2.5-1.5b', 'phi-3.5', 'llama-3.2-1b', 'ollama-lan', 'gemini-cloud'
    type: text('type').notNull(), // 'on-device', 'lan-desktop', 'cloud'
    sizeMb: integer('size_mb').default(1500),
    status: text('status').default('ready'), // 'ready', 'downloading', 'not_found', 'connected'
    localPath: text('local_path'),
    endpointUrl: text('endpoint_url'),
    apiKey: text('api_key'),
    isDefault: integer('is_default', { mode: 'boolean' }).default(false),
    contextLength: integer('context_length').default(4096),
    temperature: real('temperature').default(0.7),
    createdAt: text('created_at').notNull(),
});

// User Preferences Table
export const userPreferences = sqliteTable('user_preferences', {
    id: text('id').primaryKey(),
    userName: text('user_name').default('User'),
    wakeWord: text('wake_word').default('Wake Up Nola'),
    standbyMode: integer('standby_mode', { mode: 'boolean' }).default(true),
    voiceFeedbackEnabled: integer('voice_feedback_enabled', { mode: 'boolean' }).default(false),
    sharedFolderPath: text('shared_folder_path').default('assets/shared_vault'),
    dailyBriefingTime: text('daily_briefing_time').default('07:30 AM'),
    updatedAt: text('updated_at').notNull(),
});

// Inferred Types
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type VaultDocument = typeof vaultDocuments.$inferSelect;
export type NewVaultDocument = typeof vaultDocuments.$inferInsert;

export type TaskAndSchedule = typeof tasksAndSchedules.$inferSelect;
export type NewTaskAndSchedule = typeof tasksAndSchedules.$inferInsert;

export type AIModelConfig = typeof aiModelConfigs.$inferSelect;
export type NewAIModelConfig = typeof aiModelConfigs.$inferInsert;

export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;
