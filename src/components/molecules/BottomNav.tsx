/**
 * BottomNav - Molecule
 * Minimalist, modern navigation bar with active cyan pill indicators
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

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
        <View style={styles.containerWrapper}>
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
                            <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
                                <Ionicons
                                    name={isActive ? tab.activeIcon : tab.icon}
                                    size={18}
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
        </View>
    );
};

const styles = StyleSheet.create({
    containerWrapper: {
        backgroundColor: colors.background.canvas,
        paddingHorizontal: spacing.md,
        paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.xs + 4,
        paddingTop: 2,
    },
    container: {
        flexDirection: 'row',
        backgroundColor: colors.background.surface,
        borderRadius: borderRadius['2xl'],
        borderWidth: 1,
        borderColor: colors.slate[200],
        paddingVertical: 6,
        paddingHorizontal: spacing.xs,
        justifyContent: 'space-around',
        alignItems: 'center',
        ...shadows.card,
    },
    tabButton: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 2,
    },
    iconBox: {
        width: 32,
        height: 26,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
    },
    iconBoxActive: {
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.slate[400],
        marginTop: 2,
    },
    activeTabLabel: {
        color: colors.primary[600],
        fontWeight: '800',
    },
});

export default BottomNav;
