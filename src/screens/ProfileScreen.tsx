/**
 * Profile Screen
 * User profile, settings, and app info
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Platform,
    Alert,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '../components/atoms/Avatar';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { useAuth } from '../contexts/AuthContext';
import { useSync } from '../contexts/SyncContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    badge?: string;
    badgeVariant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
    onPress?: () => void;
    danger?: boolean;
}

const MenuItem = ({ icon, label, value, badge, badgeVariant, onPress, danger }: MenuItemProps) => (
    <TouchableOpacity
        style={styles.menuItem}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.7}
    >
        <View style={[styles.menuIconContainer, danger && styles.menuIconDanger]}>
            <Ionicons
                name={icon}
                size={20}
                color={danger ? colors.error.main : colors.slate[600]}
            />
        </View>
        <View style={styles.menuContent}>
            <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>
                {label}
            </Text>
            {value && <Text style={styles.menuValue}>{value}</Text>}
        </View>
        {badge && (
            <Badge label={badge} variant={badgeVariant || 'default'} size="sm" />
        )}
        {onPress && !badge && (
            <Ionicons name="chevron-forward" size={20} color={colors.slate[300]} />
        )}
    </TouchableOpacity>
);

export const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const { lastSyncAt, pendingOperations, isOnline, triggerSync } = useSync();

    const handleLogout = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: logout },
            ]
        );
    };

    const handleClearCache = () => {
        Alert.alert(
            'Clear Cache',
            'This will clear all cached data. You will need to sync again.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await triggerSync();
                        Alert.alert('Done', 'Cache cleared and data refreshed');
                    },
                },
            ]
        );
    };

    const formatLastSync = () => {
        if (!lastSyncAt) return 'Never';
        const now = new Date();
        const syncDate = new Date(lastSyncAt);
        const diffMs = now.getTime() - syncDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return syncDate.toLocaleDateString();
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header */}
                <LinearGradient
                    colors={colors.gradients.primary as [string, string, ...string[]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.profileHeader}
                >
                    <Avatar
                        name={user?.name || user?.email || 'U'}
                        source={user?.avatar}
                        size="xl"
                        showBorder
                    />
                    <Text style={styles.profileName}>{user?.name || 'Organizer'}</Text>
                    <Text style={styles.profileEmail}>{user?.email}</Text>
                    <Badge
                        label={user?.role === 'admin' ? 'Admin' : user?.role === 'organizer' ? 'Organizer' : 'Scanner'}
                        variant="default"
                        style={styles.roleBadge}
                    />
                </LinearGradient>

                {/* Sync Status Card */}
                <Card variant="elevated" style={styles.syncCard}>
                    <View style={styles.syncHeader}>
                        <Ionicons
                            name={isOnline ? 'cloud-done' : 'cloud-offline'}
                            size={24}
                            color={isOnline ? colors.success.main : colors.warning.main}
                        />
                        <View style={styles.syncInfo}>
                            <Text style={styles.syncTitle}>
                                {isOnline ? 'Connected' : 'Offline Mode'}
                            </Text>
                            <Text style={styles.syncSubtitle}>
                                Last sync: {formatLastSync()}
                            </Text>
                        </View>
                        {pendingOperations > 0 && (
                            <Badge
                                label={`${pendingOperations} pending`}
                                variant="warning"
                                size="sm"
                            />
                        )}
                    </View>
                    <Button
                        label="Sync Now"
                        variant="outline"
                        size="sm"
                        onPress={triggerSync}
                        icon={<Ionicons name="refresh" size={16} color={colors.primary[500]} />}
                        style={{ marginTop: spacing.md }}
                    />
                </Card>

                {/* Account Section */}
                <Text style={styles.sectionTitle}>Account</Text>
                <Card variant="default" padding="none" style={styles.menuCard}>
                    <MenuItem
                        icon="person-outline"
                        label="Edit Profile"
                        onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon')}
                    />
                    <View style={styles.menuDivider} />
                    <MenuItem
                        icon="notifications-outline"
                        label="Notifications"
                        badge="On"
                        badgeVariant="success"
                        onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon')}
                    />
                    <View style={styles.menuDivider} />
                    <MenuItem
                        icon="shield-checkmark-outline"
                        label="Security"
                        onPress={() => Alert.alert('Coming Soon', 'Security settings will be available soon')}
                    />
                </Card>

                {/* App Management */}
                <Text style={styles.sectionTitle}>App Settings</Text>
                <Card variant="default" padding="none" style={styles.menuCard}>
                    <MenuItem
                        icon="information-circle-outline"
                        label="App Version"
                        value="1.0.0"
                    />
                    <View style={styles.menuDivider} />
                    <MenuItem
                        icon="trash-outline"
                        label="Clear Cache"
                        onPress={handleClearCache}
                    />
                </Card>

                {/* Quick Links */}
                <Text style={styles.sectionTitle}>Quick Links</Text>
                <Card variant="default" padding="none" style={styles.menuCard}>
                    <MenuItem
                        icon="calendar-outline"
                        label="Events"
                        onPress={() => Linking.openURL('https://www.ticketafrica.shop/events')}
                    />
                    <View style={styles.menuDivider} />
                    <MenuItem
                        icon="add-circle-outline"
                        label="Create Event"
                        onPress={() => Linking.openURL('https://www.ticketafrica.shop/events/create')}
                    />
                    <View style={styles.menuDivider} />
                    <MenuItem
                        icon="megaphone-outline"
                        label="Promote Event"
                        onPress={() => Linking.openURL('https://www.ticketafrica.shop/promote')}
                    />
                    <View style={styles.menuDivider} />
                    <MenuItem
                        icon="business-outline"
                        label="About Us"
                        onPress={() => Linking.openURL('https://www.ticketafrica.shop/about')}
                    />
                    <View style={styles.menuDivider} />
                    <MenuItem
                        icon="mail-outline"
                        label="Contact"
                        onPress={() => Linking.openURL('https://www.ticketafrica.shop/contact')}
                    />
                    <View style={styles.menuDivider} />
                    <MenuItem
                        icon="help-circle-outline"
                        label="FAQ"
                        onPress={() => Linking.openURL('https://www.ticketafrica.shop/faq')}
                    />
                </Card>

                {/* Legal */}
                <Text style={styles.sectionTitle}>Legal</Text>
                <Card variant="default" padding="none" style={styles.menuCard}>
                    <MenuItem
                        icon="shield-checkmark-outline"
                        label="Privacy Policy"
                        onPress={() => Linking.openURL('https://www.ticketafrica.shop/privacy-policy')}
                    />
                    <View style={styles.menuDivider} />
                    <MenuItem
                        icon="document-text-outline"
                        label="Terms of Service"
                        onPress={() => Linking.openURL('https://www.ticketafrica.shop/terms-of-service')}
                    />
                    <View style={styles.menuDivider} />
                    <MenuItem
                        icon="file-tray-full-outline"
                        label="Cookie Policy"
                        onPress={() => Linking.openURL('https://www.ticketafrica.shop/cookie-policy')}
                    />
                    <View style={styles.menuDivider} />
                    <MenuItem
                        icon="alert-circle-outline"
                        label="Acceptable Use"
                        onPress={() => Linking.openURL('https://www.ticketafrica.shop/acceptable-use')}
                    />
                    <View style={styles.menuDivider} />
                    <MenuItem
                        icon="card-outline"
                        label="Refund Policy"
                        onPress={() => Linking.openURL('https://www.ticketafrica.shop/refund-policy')}
                    />
                </Card>

                {/* Sign Out */}
                <Card variant="default" padding="none" style={styles.menuCard}>
                    <MenuItem
                        icon="log-out-outline"
                        label="Sign Out"
                        onPress={handleLogout}
                        danger
                    />
                </Card>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Made with ❤️ by Ticket Africa</Text>
                    <Text style={styles.footerVersion}>v1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
        paddingTop: Platform.OS === 'android' ? 40 : 0,
    },
    content: {
        paddingBottom: 100,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: spacing['3xl'],
        paddingHorizontal: spacing.xl,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    profileName: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: spacing.md,
    },
    profileEmail: {
        fontSize: typography.fontSize.base,
        color: 'rgba(255,255,255,0.9)',
        marginTop: spacing.xs,
    },
    roleBadge: {
        marginTop: spacing.md,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    syncCard: {
        marginHorizontal: spacing.xl,
        marginTop: -spacing.xl,
    },
    syncHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    syncInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    syncTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.slate[900],
    },
    syncSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.slate[500],
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.slate[500],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: spacing.xl,
        marginBottom: spacing.sm,
        marginHorizontal: spacing.xl,
    },
    menuCard: {
        marginHorizontal: spacing.xl,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.md,
        backgroundColor: colors.slate[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuIconDanger: {
        backgroundColor: colors.error.light,
    },
    menuContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    menuLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: '500',
        color: colors.slate[900],
    },
    menuLabelDanger: {
        color: colors.error.main,
    },
    menuValue: {
        fontSize: typography.fontSize.sm,
        color: colors.slate[500],
        marginTop: 2,
    },
    menuDivider: {
        height: 1,
        backgroundColor: colors.slate[100],
        marginLeft: spacing.lg + 36 + spacing.md,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
    },
    footerText: {
        fontSize: typography.fontSize.sm,
        color: colors.slate[400],
    },
    footerVersion: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[300],
        marginTop: spacing.xs,
    },
});

export default ProfileScreen;
