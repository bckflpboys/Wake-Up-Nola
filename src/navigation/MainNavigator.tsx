/**
 * Main Navigator - Wake Up Nola
 * Manages screen back-stack and dynamic BottomNav visibility
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
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
    const [history, setHistory] = useState<TabName[]>(['chat']);
    const [isChatComposing, setIsChatComposing] = useState(false);
    const { sendMessage } = useNola();

    const activeTab = history[history.length - 1] || 'chat';

    const navigateTo = useCallback((tab: TabName) => {
        setIsChatComposing(false);
        setHistory(prev => {
            if (prev[prev.length - 1] === tab) return prev;
            return [...prev, tab];
        });
    }, []);

    const navigateBack = useCallback(() => {
        setIsChatComposing(false);
        setHistory(prev => {
            if (prev.length > 1) {
                return prev.slice(0, -1);
            }
            return prev;
        });
    }, []);

    // Handle Android hardware back button and swipe-back behavior
    useEffect(() => {
        const onBackPress = () => {
            if (isChatComposing) {
                setIsChatComposing(false);
                return true; // Collapse composer first
            }
            if (history.length > 1) {
                navigateBack();
                return true; // Prevent default app exit
            }
            return false; // Exit app if already at root
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
    }, [history, isChatComposing, navigateBack]);

    const handleAskNolaFromVault = async (prompt: string) => {
        navigateTo('chat');
        setIsChatComposing(true);
        try {
            await sendMessage(prompt);
        } catch (e) {
            console.warn('Ask Nola error:', e);
        }
    };

    const renderScreen = () => {
        switch (activeTab) {
            case 'connectors':
                return (
                    <ConnectorsScreen
                        onNavigateBack={navigateBack}
                        onNavigateChat={() => navigateTo('chat')}
                    />
                );
            case 'vault':
                return (
                    <VaultScreen
                        onNavigateBack={navigateBack}
                        onAskNolaAboutDoc={handleAskNolaFromVault}
                    />
                );
            case 'tasks':
                return (
                    <TasksScreen
                        onNavigateBack={navigateBack}
                        onAskNolaAboutSchedule={handleAskNolaFromVault}
                    />
                );
            case 'models':
                return (
                    <ModelManagerScreen
                        onNavigateBack={navigateBack}
                    />
                );
            case 'chat':
            default:
                return (
                    <ChatScreen
                        isComposing={isChatComposing}
                        onToggleCompose={setIsChatComposing}
                        onNavigateTab={(tab) => navigateTo(tab)}
                    />
                );
        }
    };

    const shouldShowBottomNav = !isChatComposing || activeTab !== 'chat';

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.screenContainer}>
                {renderScreen()}
            </View>

            {shouldShowBottomNav && (
                <BottomNav
                    activeTab={activeTab}
                    onTabChange={navigateTo}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.canvas,
    },
    screenContainer: {
        flex: 1,
    },
});

export default MainNavigator;
