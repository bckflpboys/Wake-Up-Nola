/**
 * Wake Up Nola - Vault & Offline Knowledge Base Service
 * Indexes local shared folders, files (.md, .txt, .json), and provides offline keyword/RAG search.
 */

import { expoDb } from '../db/client';
import { VaultDocument } from '../db/schema';

export interface LocalSharedFolder {
    id: string;
    name: string;
    path: string;
    documentCount: number;
    lastSyncedAt: string;
}

const DEFAULT_DOCUMENTS: VaultDocument[] = [
    {
        id: 'doc-schedule',
        title: 'Daily Schedule & Routine',
        filename: 'daily_schedule.md',
        filepath: 'assets/shared_vault/daily_schedule.md',
        fileType: 'markdown',
        content: 'Morning wake up at 7:30 AM. Team Architecture sync at 8:30 AM to discuss on-device inference for Nola. Review local knowledge vault documents at 11:00 AM. Client follow-up at 4:00 PM for Project Alpha. Gym at 6:00 PM. Remember: Submit monthly expense report before Friday!',
        wordCount: 48,
        tags: 'schedule,routine,reminders',
        isIndexed: true,
        lastModified: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    },
    {
        id: 'doc-project-alpha',
        title: 'Project Alpha - Notes & Architecture',
        filename: 'project_alpha_notes.md',
        filepath: 'assets/shared_vault/project_alpha_notes.md',
        fileType: 'markdown',
        content: 'Goal: Build Nola assistant with offline SLMs. Decompose complex tasks into micro-steps so Gemma 4 or Qwen 3.5 never fail. Data stays 100% on device in shared vault. Offline RAG uses SQLite full-text search with fast keyword indexing.',
        wordCount: 36,
        tags: 'project,architecture,ai',
        isIndexed: true,
        lastModified: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    },
    {
        id: 'doc-contacts',
        title: 'Key Contacts & Collaborators',
        filename: 'quick_contacts.json',
        filepath: 'assets/shared_vault/quick_contacts.json',
        fileType: 'json',
        content: 'Sarah Jenkins (Lead Engineer - sarah.j@techinnovate.io - Prefers async messages. Working on local inference kernels), Marcus Vance (Product Designer - marcus.v@designcraft.co - Reviewed Standby glowing pulse ring), Dr. Elena Rostova (ML Research Advisor - elena.r@aimodel-labs.org - Suggested fine-tuned Gemma 4 for structured JSON output).',
        wordCount: 42,
        tags: 'contacts,team',
        isIndexed: true,
        lastModified: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    },
];

class VaultService {
    private inMemoryDocs: VaultDocument[] = [...DEFAULT_DOCUMENTS];

    public async getAllDocuments(): Promise<VaultDocument[]> {
        if (expoDb) {
            try {
                const rows = expoDb.getAllSync('SELECT * FROM vault_documents ORDER BY created_at DESC');
                if (rows && rows.length > 0) {
                    return rows.map((r: any) => ({
                        ...r,
                        isIndexed: Boolean(r.is_indexed),
                        wordCount: r.word_count || 0,
                        fileType: r.file_type || 'markdown',
                        lastModified: r.last_modified || r.created_at,
                        createdAt: r.created_at,
                    }));
                }
            } catch (err) {
                console.warn('Error reading SQLite vault documents:', err);
            }
        }
        return this.inMemoryDocs;
    }

    public async searchDocuments(query: string): Promise<VaultDocument[]> {
        const docs = await this.getAllDocuments();
        const lowerQuery = query.toLowerCase();
        const terms = lowerQuery.split(' ').filter(t => t.length > 2);

        if (terms.length === 0) return docs.slice(0, 2);

        return docs.filter(doc => {
            const lowerTitle = doc.title.toLowerCase();
            const lowerContent = doc.content.toLowerCase();
            const lowerTags = (doc.tags || '').toLowerCase();
            const lowerFilename = doc.filename.toLowerCase();

            return terms.some(term =>
                lowerTitle.includes(term) ||
                lowerContent.includes(term) ||
                lowerTags.includes(term) ||
                lowerFilename.includes(term)
            );
        });
    }

    public async addDocument(
        title: string,
        filename: string,
        content: string,
        tags: string = '',
        fileType: string = 'markdown'
    ): Promise<VaultDocument> {
        const now = new Date().toISOString();
        const id = `doc-${Date.now()}`;
        const wordCount = content.split(/\s+/).filter(Boolean).length;

        const newDoc: VaultDocument = {
            id,
            title,
            filename,
            filepath: `assets/shared_vault/${filename}`,
            fileType,
            content,
            wordCount,
            tags,
            isIndexed: true,
            lastModified: now,
            createdAt: now,
        };

        if (expoDb) {
            try {
                expoDb.execSync(`
                    INSERT INTO vault_documents (id, title, filename, filepath, file_type, content, word_count, tags, is_indexed, last_modified, created_at)
                    VALUES ('${id}', '${title.replace(/'/g, "''")}', '${filename.replace(/'/g, "''")}', 'assets/shared_vault/${filename.replace(/'/g, "''")}', '${fileType}', '${content.replace(/'/g, "''")}', ${wordCount}, '${tags}', 1, '${now}', '${now}');
                `);
            } catch (err) {
                console.warn('Error inserting doc into SQLite:', err);
            }
        }

        this.inMemoryDocs.unshift(newDoc);
        return newDoc;
    }

    public async deleteDocument(id: string): Promise<boolean> {
        if (expoDb) {
            try {
                expoDb.execSync(`DELETE FROM vault_documents WHERE id = '${id}';`);
            } catch (err) {
                console.warn('Error deleting doc from SQLite:', err);
            }
        }
        this.inMemoryDocs = this.inMemoryDocs.filter(d => d.id !== id);
        return true;
    }

    public async importSamplePack(): Promise<void> {
        for (const doc of DEFAULT_DOCUMENTS) {
            await this.addDocument(doc.title, doc.filename, doc.content, doc.tags || '', doc.fileType || 'markdown');
        }
    }

    public async getSharedFolders(): Promise<LocalSharedFolder[]> {
        const docs = await this.getAllDocuments();
        return [
            {
                id: 'folder-main',
                name: 'assets/shared_vault',
                path: 'assets/shared_vault',
                documentCount: docs.length,
                lastSyncedAt: new Date().toISOString(),
            },
        ];
    }
}

export const vaultService = new VaultService();
export default vaultService;
