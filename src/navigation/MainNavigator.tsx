/**
 * Main Navigator - Wake Up Nola
 * 5-tab based navigation
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { BottomNav, TabName } from '../components/molecules/BottomNav';
import { WakeUpScreen } from '../screens/WakeUpScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { VaultScreen } from '../screens/VaultScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { ModelManagerScreen } from '../screens/ModelManagerScreen';
import { useNola } from '../contexts/NolaContext';
import { colors } from '../theme';

export const MainNavigator: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabName>('wakeup');
    const { sendMessage } = useNola();

    const handleAskNolaFromVault = async (prompt: string) => {
        setActiveTab('chat');
        try {
            await sendMessage(prompt);
        } catch (e) {
            console.warn('Ask Nola error:', e);
        }
    };

    const renderScreen = () => {
        switch (activeTab) {
            case 'chat':
                return <ChatScreen onNavigateTab={(tab) => setActiveTab(tab)} />;
            case 'vault':
                return <VaultScreen onAskNolaAboutDoc={handleAskNolaFromVault} />;
            case 'tasks':
                return <TasksScreen onAskNolaAboutSchedule={handleAskNolaFromVault} />;
            case 'models':
                return <ModelManagerScreen />;
            case 'wakeup':
            default:
                return <WakeUpScreen onNavigateTab={(tab) => setActiveTab(tab)} />;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor={colors.background.primary} />

            <View style={styles.screenContainer}>
                {renderScreen()}
            </View>

            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    screenContainer: {
        flex: 1,
    },
});

export default MainNavigator;
