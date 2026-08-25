/**
 * BottomNav - Molecule
 * 5-tab navigation bar for Wake Up Nola
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

export type TabName = 'wakeup' | 'chat' | 'vault' | 'tasks' | 'models';

interface BottomNavProps {
    activeTab: TabName;
    onTabChange: (tab: TabName) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
    activeTab,
    onTabChange,
}) => {
    const tabs: Array<{
        id: TabName;
        label: string;
        icon: keyof typeof Ionicons.glyphMap;
        activeIcon: keyof typeof Ionicons.glyphMap;
    }> = [
        {
            id: 'wakeup',
            label: 'Wake Up',
            icon: 'radio-outline',
            activeIcon: 'radio',
        },
        {
            id: 'chat',
            label: 'Assistant',
            icon: 'chatbubble-ellipses-outline',
            activeIcon: 'chatbubble-ellipses',
        },
        {
            id: 'vault',
            label: 'Vault',
            icon: 'folder-outline',
            activeIcon: 'folder',
        },
        {
            id: 'tasks',
            label: 'Agenda',
            icon: 'checkbox-outline',
            activeIcon: 'checkbox',
        },
        {
            id: 'models',
            label: 'Models',
            icon: 'hardware-chip-outline',
            activeIcon: 'hardware-chip',
        },
    ];

    return (
        <View style={styles.container}>
            {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                const isWakeUp = tab.id === 'wakeup';

                return (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => onTabChange(tab.id)}
                        style={[styles.tabButton, isWakeUp && styles.wakeTabButton]}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                            <Ionicons
                                name={isActive ? tab.activeIcon : tab.icon}
                                size={isWakeUp ? 24 : 22}
                                color={
                                    isActive
                                        ? isWakeUp
                                            ? colors.standby[400]
                                            : colors.accent[400]
                                        : colors.slate[500]
                                }
                            />
                        </View>
                        <Text
                            style={[
                                styles.tabLabel,
                                isActive && styles.activeTabLabel,
                                isWakeUp && isActive && styles.activeWakeLabel,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.background.secondary,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
        paddingVertical: spacing.xs + 2,
        paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.sm,
        paddingHorizontal: spacing.sm,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    tabButton: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 2,
    },
    wakeTabButton: {
        // Subtle prominence for Wake Up standby tab
    },
    iconContainer: {
        width: 36,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeIconContainer: {},
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.slate[500],
        marginTop: 2,
    },
    activeTabLabel: {
        color: colors.accent[400],
        fontWeight: '700',
    },
    activeWakeLabel: {
        color: colors.standby[400],
    },
});

export default BottomNav;
