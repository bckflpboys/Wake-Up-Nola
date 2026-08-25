import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";
import { Platform } from "react-native";

let expoDb: any = null;
let db: any = null;

if (Platform.OS !== 'web') {
  try {
    expoDb = openDatabaseSync("wake_up_nola.db", {
      enableChangeListener: true,
    });
    db = drizzle(expoDb, { schema });
  } catch (err) {
    console.warn("Failed to open SQLite database natively:", err);
  }
}

if (!db) {
  // Mock database fallback for web preview
  db = {
    select: () => ({ from: () => ({ orderBy: () => Promise.resolve([]) }) }),
    insert: () => ({ values: () => Promise.resolve() }),
    update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
    delete: () => ({ where: () => Promise.resolve() }),
  };
}

export { db, expoDb };
export const initDatabase = initializeDatabase;

/**
 * Initialize all Wake Up Nola SQLite Tables
 */
export async function initializeDatabase() {
  if (Platform.OS === 'web' || !expoDb) {
    console.log('✅ Database initialization skipped (web / in-memory mode)');
    return true;
  }

  try {
    // 1. Conversations Table
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        active_model TEXT DEFAULT 'gemma-2-2b',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // 2. Messages Table (with Micro-Agent Step Execution)
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        steps_json TEXT,
        latency_ms INTEGER,
        model_used TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id)
      );
    `);

    // 3. Vault Documents Table (Local Shared Folder / Offline RAG)
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS vault_documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        filename TEXT NOT NULL,
        filepath TEXT,
        file_type TEXT DEFAULT 'markdown',
        content TEXT NOT NULL,
        word_count INTEGER DEFAULT 0,
        tags TEXT,
        is_indexed INTEGER DEFAULT 1,
        last_modified TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // 4. Tasks and Schedules Table ("What am I missing")
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS tasks_and_schedules (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'schedule',
        due_time TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'pending',
        reminder_minutes INTEGER DEFAULT 15,
        is_missing_check INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);

    // 5. AI Model Configs Table
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS ai_model_configs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        model_key TEXT NOT NULL,
        type TEXT NOT NULL,
        size_mb INTEGER DEFAULT 1500,
        status TEXT DEFAULT 'ready',
        local_path TEXT,
        endpoint_url TEXT,
        api_key TEXT,
        is_default INTEGER DEFAULT 0,
        context_length INTEGER DEFAULT 4096,
        temperature REAL DEFAULT 0.7,
        created_at TEXT NOT NULL
      );
    `);

    // 6. User Preferences Table
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id TEXT PRIMARY KEY,
        user_name TEXT DEFAULT 'Alex',
        wake_word TEXT DEFAULT 'Wake Up Nola',
        standby_mode INTEGER DEFAULT 1,
        voice_feedback_enabled INTEGER DEFAULT 0,
        shared_folder_path TEXT DEFAULT 'assets/shared_vault',
        daily_briefing_time TEXT DEFAULT '07:30 AM',
        updated_at TEXT NOT NULL
      );
    `);

    // Seed initial models if empty
    await seedDefaultData();

    console.log("✅ Wake Up Nola Database initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    return false;
  }
}

/**
 * Seed initial models, sample vault files, and routine items
 */
async function seedDefaultData() {
  try {
    const existingModels = expoDb.getAllSync('SELECT COUNT(*) as count FROM ai_model_configs');
    if (existingModels && existingModels[0]?.count === 0) {
      const now = new Date().toISOString();

      // Seed Default On-Device and Hybrid Models
      expoDb.execSync(`
        INSERT INTO ai_model_configs (id, name, model_key, type, size_mb, status, local_path, endpoint_url, is_default, context_length, temperature, created_at)
        VALUES
        ('model-gemma-2b', 'Google Gemma 2 (2B)', 'gemma-2-2b', 'on-device', 1500, 'ready', 'assets/models/gemma-2-2b-it-Q4_K_M.gguf', '', 1, 4096, 0.7, '${now}'),
        ('model-smollm-1.7b', 'SmolLM2 (1.7B Fast)', 'smollm2-1.7b', 'on-device', 980, 'ready', 'assets/models/SmolLM2-1.7B-Instruct-Q4_K_M.gguf', '', 0, 4096, 0.6, '${now}'),
        ('model-qwen-1.5b', 'Qwen 2.5 (1.5B Steps)', 'qwen2.5-1.5b', 'on-device', 1100, 'ready', 'assets/models/qwen2.5-1.5b-instruct-q4_k_m.gguf', '', 0, 8192, 0.5, '${now}'),
        ('model-llama-1b', 'Llama 3.2 (1B Mobile)', 'llama-3.2-1b', 'on-device', 800, 'ready', 'assets/models/Llama-3.2-1B-Instruct-Q4_K_M.gguf', '', 0, 4096, 0.7, '${now}'),
        ('model-ollama-lan', 'Desktop Ollama (LAN WiFi)', 'ollama-lan', 'lan-desktop', 0, 'ready', '', 'http://192.168.1.100:11434', 0, 8192, 0.7, '${now}'),
        ('model-gemini-cloud', 'Gemini 2.5 Flash (Online)', 'gemini-cloud', 'cloud', 0, 'ready', '', '', 0, 32768, 0.7, '${now}');
      `);

      // Seed Initial Vault Documents
      expoDb.execSync(`
        INSERT INTO vault_documents (id, title, filename, filepath, file_type, content, word_count, tags, is_indexed, last_modified, created_at)
        VALUES
        ('doc-schedule', 'Daily Schedule & Routine', 'daily_schedule.md', 'assets/shared_vault/daily_schedule.md', 'markdown', 'Morning wake up at 7:30 AM. Team Architecture sync at 8:30 AM to discuss on-device inference for Nola. Client follow-up at 4:00 PM for Project Alpha. Gym at 6:00 PM. Remember: Submit monthly expense report before Friday!', 48, 'schedule,routine,reminders', 1, '${now}', '${now}'),
        ('doc-project-alpha', 'Project Alpha - Notes & Architecture', 'project_alpha_notes.md', 'assets/shared_vault/project_alpha_notes.md', 'markdown', 'Goal: Build Nola assistant with offline SLMs. Decompose complex tasks into micro-steps so Gemma 2B or Qwen 1.5B never fail. Data stays 100% on device in shared vault.', 36, 'project,architecture,ai', 1, '${now}', '${now}'),
        ('doc-contacts', 'Key Contacts & Collaborators', 'quick_contacts.json', 'assets/shared_vault/quick_contacts.json', 'json', 'Sarah Jenkins (Lead Engineer - sarah.j@techinnovate.io), Marcus Vance (Product Designer - marcus.v@designcraft.co), Dr. Elena Rostova (ML Research Advisor - elena.r@aimodel-labs.org)', 28, 'contacts,team', 1, '${now}', '${now}');
      `);

      // Seed Initial Tasks & Schedules
      expoDb.execSync(`
        INSERT INTO tasks_and_schedules (id, title, description, category, due_time, priority, status, reminder_minutes, is_missing_check, created_at)
        VALUES
        ('task-1', 'Team Architecture Sync', 'Discuss on-device inference pipeline for Gemma 2B', 'schedule', '08:30 AM', 'high', 'pending', 15, 0, '${now}'),
        ('task-2', 'Review Shared Vault Indexing', 'Ensure offline text extraction and RAG works without wifi', 'schedule', '11:00 AM', 'medium', 'pending', 10, 0, '${now}'),
        ('task-3', 'Client Status Report: Project Alpha', 'Send sprint update to client', 'schedule', '04:00 PM', 'high', 'pending', 30, 0, '${now}'),
        ('task-4', 'Submit Monthly Expense Report', 'Missing item from weekly goals - due before Friday!', 'missing_alert', 'Tomorrow 5:00 PM', 'critical', 'pending', 60, 1, '${now}'),
        ('task-5', 'Backup Vault to External Storage', 'Ensure all local notes are archived safely', 'todo', '08:00 PM', 'low', 'pending', 0, 0, '${now}');
      `);

      // Seed User Preferences
      expoDb.execSync(`
        INSERT INTO user_preferences (id, user_name, wake_word, standby_mode, voice_feedback_enabled, shared_folder_path, daily_briefing_time, updated_at)
        VALUES
        ('pref-default', 'Alex', 'Wake Up Nola', 1, 0, 'assets/shared_vault', '07:30 AM', '${now}');
      `);

      // Seed First Welcome Conversation
      expoDb.execSync(`
        INSERT INTO conversations (id, title, active_model, created_at, updated_at)
        VALUES
        ('conv-welcome', 'Welcome to Wake Up Nola', 'gemma-2-2b', '${now}', '${now}');
      `);

      const welcomeSteps = JSON.stringify([
        { step: 1, title: 'Initializing on-device Gemma 2B pipeline', status: 'complete', detail: 'Local model engine ready' },
        { step: 2, title: 'Indexed local shared vault documents', status: 'complete', detail: '3 documents indexed (Daily Schedule, Project Alpha, Contacts)' },
        { step: 3, title: 'Synthesized standby briefing', status: 'complete', detail: 'Identified 1 critical missing item and 3 scheduled events' }
      ]);

      expoDb.execSync(`
        INSERT INTO messages (id, conversation_id, role, content, steps_json, latency_ms, model_used, created_at)
        VALUES
        ('msg-welcome-1', 'conv-welcome', 'assistant', 'Good morning! I am Nola, your offline-first personal assistant. I am standing by on your device. You can ask me "What am I missing today?", search your shared documents, or ask me to break down any task.', '${welcomeSteps}', 120, 'gemma-2-2b', '${now}');
      `);
    }
  } catch (err) {
    console.warn("Seeding initial data error:", err);
  }
}

/**
 * Hard Reset / Clear Database
 */
export async function resetDatabase() {
  if (Platform.OS === 'web' || !expoDb) return;
  try {
    expoDb.execSync(`DROP TABLE IF EXISTS messages;`);
    expoDb.execSync(`DROP TABLE IF EXISTS conversations;`);
    expoDb.execSync(`DROP TABLE IF EXISTS vault_documents;`);
    expoDb.execSync(`DROP TABLE IF EXISTS tasks_and_schedules;`);
    expoDb.execSync(`DROP TABLE IF EXISTS ai_model_configs;`);
    expoDb.execSync(`DROP TABLE IF EXISTS user_preferences;`);
    console.log("✅ Database reset - initializing fresh tables");
    await initializeDatabase();
    return true;
  } catch (error) {
    console.error("❌ Failed to reset database:", error);
    return false;
  }
}
