/**
 * BottomNav - Molecule
 * Modern, crisp 5-tab navigation bar for Wake Up Nola
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, shadows } from '../../theme';

export type TabName = 'chat' | 'connectors' | 'vault' | 'tasks' | 'models';

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
            id: 'chat',
            label: 'Assistant',
            icon: 'chatbubble-ellipses-outline',
            activeIcon: 'chatbubble-ellipses',
        },
        {
            id: 'connectors',
            label: 'Connectors',
            icon: 'extension-puzzle-outline',
            activeIcon: 'extension-puzzle',
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

                return (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => onTabChange(tab.id)}
                        style={styles.tabButton}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                            <Ionicons
                                name={isActive ? tab.activeIcon : tab.icon}
                                size={20}
                                color={isActive ? colors.primary[600] : colors.slate[400]}
                            />
                        </View>
                        <Text
                            style={[
                                styles.tabLabel,
                                isActive && styles.activeTabLabel,
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
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: 'rgba(15, 23, 42, 0.08)',
        paddingVertical: spacing.xs,
        paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.xs + 2,
        paddingHorizontal: spacing.sm,
        justifyContent: 'space-around',
        alignItems: 'center',
        ...shadows.subtle,
    },
    tabButton: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 2,
    },
    iconContainer: {
        width: 32,
        height: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeIconContainer: {},
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.slate[400],
        marginTop: 1,
    },
    activeTabLabel: {
        color: colors.primary[600],
        fontWeight: '800',
    },
});

export default BottomNav;
