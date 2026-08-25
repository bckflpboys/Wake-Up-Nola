/**
 * Main Navigator - Wake Up Nola
 * 5-tab based navigation: Chat (Main Space), Connectors, Vault, Tasks, Models
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { BottomNav, TabName } from '../components/molecules/BottomNav';
import { ChatScreen } from '../screens/ChatScreen';
import { ConnectorsScreen } from '../screens/ConnectorsScreen';
import { VaultScreen } from '../screens/VaultScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { ModelManagerScreen } from '../screens/ModelManagerScreen';
import { useNola } from '../contexts/NolaContext';
import { colors } from '../theme';

export const MainNavigator: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabName>('chat');
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
            case 'connectors':
                return <ConnectorsScreen onNavigateChat={() => setActiveTab('chat')} />;
            case 'vault':
                return <VaultScreen onAskNolaAboutDoc={handleAskNolaFromVault} />;
            case 'tasks':
                return <TasksScreen onAskNolaAboutSchedule={handleAskNolaFromVault} />;
            case 'models':
                return <ModelManagerScreen />;
            case 'chat':
            default:
                return <ChatScreen onNavigateTab={(tab) => setActiveTab(tab)} />;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

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
