/**
 * Wake Up Nola - Global Assistant Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { aiEngine, AIModel, AVAILABLE_MODELS, InferenceStep } from '../services/aiEngine';
import { taskDecomposer, DecomposedTask } from '../services/taskDecomposer';
import { briefingService, DailyBriefing } from '../services/briefingService';
import { expoDb } from '../db/client';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    steps?: InferenceStep[];
    latencyMs?: number;
    modelUsed?: string;
    createdAt: string;
}

interface NolaContextType {
    activeModel: AIModel;
    availableModels: AIModel[];
    isStandby: boolean;
    isListening: boolean;
    isProcessing: boolean;
    activeSteps: InferenceStep[];
    dailyBriefing: DailyBriefing | null;
    messages: ChatMessage[];
    setActiveModel: (modelKey: string) => void;
    toggleStandby: () => void;
    startVoiceTrigger: () => void;
    stopVoiceTrigger: () => void;
    sendMessage: (text: string) => Promise<DecomposedTask>;
    refreshBriefing: () => Promise<void>;
    clearChatHistory: () => void;
}

const NolaContext = createContext<NolaContextType | undefined>(undefined);

export const NolaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeModel, setActiveModelState] = useState<AIModel>(AVAILABLE_MODELS[0]);
    const [availableModels] = useState<AIModel[]>(AVAILABLE_MODELS);
    const [isStandby, setIsStandby] = useState<boolean>(true);
    const [isListening, setIsListening] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [activeSteps, setActiveSteps] = useState<InferenceStep[]>([]);
    const [dailyBriefing, setDailyBriefing] = useState<DailyBriefing | null>(null);

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome-1',
            role: 'assistant',
            content: '👋 **Wake Up Nola is ready.**\n\nI am your offline-first personal AI assistant, running small models on-device.\n\nTry asking me:\n• *"What am I missing today?"*\n• *"Summarize Project Alpha notes from my shared folder"*\n• *"Who is the lead engineer in my contacts?"*',
            modelUsed: 'Google Gemma 2 (2B)',
            createdAt: new Date().toISOString(),
        },
    ]);

    useEffect(() => {
        refreshBriefing();
    }, []);

    const refreshBriefing = async () => {
        const briefing = await briefingService.getDailyBriefing();
        setDailyBriefing(briefing);
    };

    const setActiveModel = (modelKey: string) => {
        aiEngine.setActiveModel(modelKey);
        const updated = aiEngine.getActiveModel();
        setActiveModelState({ ...updated });
    };

    const toggleStandby = () => {
        setIsStandby(prev => !prev);
    };

    const startVoiceTrigger = () => {
        setIsListening(true);
        // Simulate speech recognition trigger
        setTimeout(() => {
            setIsListening(false);
            sendMessage('What am I missing today?');
        }, 2200);
    };

    const stopVoiceTrigger = () => {
        setIsListening(false);
    };

    const sendMessage = async (text: string): Promise<DecomposedTask> => {
        if (!text.trim()) {
            throw new Error('Empty message');
        }

        const userMsgId = `usr-${Date.now()}`;
        const userMsg: ChatMessage = {
            id: userMsgId,
            role: 'user',
            content: text,
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMsg]);
        setIsProcessing(true);
        setActiveSteps([]);

        try {
            const result = await taskDecomposer.decomposeAndExecute(text, (steps) => {
                setActiveSteps([...steps]);
            });

            const assistantMsg: ChatMessage = {
                id: `ast-${Date.now()}`,
                role: 'assistant',
                content: result.finalAnswer,
                steps: result.steps,
                latencyMs: result.latencyMs,
                modelUsed: activeModel.name,
                createdAt: new Date().toISOString(),
            };

            setMessages(prev => [...prev, assistantMsg]);
            setIsProcessing(false);
            return result;
        } catch (error: any) {
            setIsProcessing(false);
            const errorMsg: ChatMessage = {
                id: `ast-err-${Date.now()}`,
                role: 'assistant',
                content: `⚠️ Failed to execute task: ${error?.message || 'Unknown error'}. Switched back to offline standby.`,
                createdAt: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMsg]);
            throw error;
        }
    };

    const clearChatHistory = () => {
        setMessages([
            {
                id: `welcome-${Date.now()}`,
                role: 'assistant',
                content: 'Chat cleared. Nola is on standby.',
                modelUsed: activeModel.name,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    return (
        <NolaContext.Provider
            value={{
                activeModel,
                availableModels,
                isStandby,
                isListening,
                isProcessing,
                activeSteps,
                dailyBriefing,
                messages,
                setActiveModel,
                toggleStandby,
                startVoiceTrigger,
                stopVoiceTrigger,
                sendMessage,
                refreshBriefing,
                clearChatHistory,
            }}
        >
            {children}
        </NolaContext.Provider>
    );
};

export const useNola = () => {
    const context = useContext(NolaContext);
    if (!context) {
        throw new Error('useNola must be used within a NolaProvider');
    }
    return context;
};
