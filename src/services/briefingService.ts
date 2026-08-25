/**
 * Wake Up Nola - Morning Briefing & "What Am I Missing?" Service
 */

import { expoDb } from '../db/client';

export interface MissingItem {
    id: string;
    title: string;
    description: string;
    urgency: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    dueTime?: string;
}

export interface DailyBriefing {
    greeting: string;
    dateFormatted: string;
    weatherSummary: string;
    missingItems: MissingItem[];
    scheduledEventsCount: number;
    tasksCount: number;
    vaultSummary: string;
}

class BriefingService {
    public async getDailyBriefing(): Promise<DailyBriefing> {
        const today = new Date();
        const hour = today.getHours();
        let greeting = 'Good morning';
        if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
        if (hour >= 17) greeting = 'Good evening';

        const dateFormatted = today.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        });

        const missingItems = await this.getMissingItems();

        return {
            greeting,
            dateFormatted,
            weatherSummary: 'Offline Mode • Ambient Sensors Ready',
            missingItems,
            scheduledEventsCount: 3,
            tasksCount: 4,
            vaultSummary: '3 shared offline documents indexed in local vault',
        };
    }

    public async getMissingItems(): Promise<MissingItem[]> {
        if (expoDb) {
            try {
                const rows = expoDb.getAllSync(`
                    SELECT * FROM tasks_and_schedules 
                    WHERE is_missing_check = 1 AND status != 'completed'
                    ORDER BY priority DESC
                `);
                if (rows && rows.length > 0) {
                    return rows.map((r: any) => ({
                        id: r.id,
                        title: r.title,
                        description: r.description || '',
                        urgency: r.priority || 'high',
                        category: r.category || 'missing_alert',
                        dueTime: r.due_time,
                    }));
                }
            } catch (err) {
                console.warn('Error fetching missing items from DB:', err);
            }
        }

        return [
            {
                id: 'task-4',
                title: 'Submit Monthly Expense Report',
                description: 'Identified as overdue from your weekly goals checklist. Due before Friday 5:00 PM!',
                urgency: 'critical',
                category: 'Expense & Accounting',
                dueTime: 'Friday 5:00 PM',
            },
        ];
    }
}

export const briefingService = new BriefingService();
export default briefingService;
