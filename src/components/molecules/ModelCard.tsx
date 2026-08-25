/**
 * ModelCard - Molecule
 * Displays on-device / hybrid AI model configuration, memory usage, and download triggers
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { AIModel } from '../../services/aiEngine';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface ModelCardProps {
    model: AIModel;
    isActive: boolean;
    onSelect: () => void;
    onDownloadGuide?: () => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({
    model,
    isActive,
    onSelect,
    onDownloadGuide,
}) => {
    const isOnline = model.type === 'cloud';
    const isLan = model.type === 'lan-desktop';

    const getBadge = () => {
        if (isOnline) return { label: 'ONLINE CLOUD', variant: 'info' as const };
        if (isLan) return { label: 'DESKTOP LAN', variant: 'accent' as const };
        return { label: 'ON-DEVICE SLM', variant: 'primary' as const };
    };

    const badgeInfo = getBadge();

    const handleOpenLink = () => {
        if (model.downloadUrl) {
            Linking.openURL(model.downloadUrl).catch(err =>
                console.warn('Cannot open download URL:', err)
            );
        }
    };

    return (
        <Card
            variant={isActive ? 'glowViolet' : 'default'}
            style={[styles.card, isActive && styles.activeCard]}
        >
            <TouchableOpacity onPress={onSelect} activeOpacity={0.8}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <View style={styles.titleWrap}>
                        <Text style={styles.title}>{model.name}</Text>
                        <Text style={styles.modelKey}>{model.modelKey}</Text>
                    </View>
                    <Badge label={badgeInfo.label} variant={badgeInfo.variant} size="sm" />
                </View>

                {/* Description */}
                <Text style={styles.description}>{model.description}</Text>

                {/* Specs / Meta */}
                <View style={styles.specsRow}>
                    {!isOnline && !isLan && (
                        <View style={styles.specItem}>
                            <Ionicons name="hardware-chip-outline" size={14} color={colors.primary[400]} />
                            <Text style={styles.specText}>{model.sizeMb} MB Model</Text>
                        </View>
                    )}

                    <View style={styles.specItem}>
                        <Ionicons name="layers-outline" size={14} color={colors.accent[400]} />
                        <Text style={styles.specText}>{model.contextLength} Context</Text>
                    </View>

                    {model.localPath && (
                        <View style={styles.specItem}>
                            <Ionicons name="folder-outline" size={14} color={colors.standby[400]} />
                            <Text style={styles.specText}>assets/models/</Text>
                        </View>
                    )}
                </View>

                {/* Actions & Active Selector */}
                <View style={styles.actionsRow}>
                    {model.downloadUrl && (
                        <TouchableOpacity
                            onPress={handleOpenLink}
                            style={styles.downloadLink}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="cloud-download-outline" size={14} color={colors.accent[400]} />
                            <Text style={styles.downloadText}>Download GGUF</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={onSelect}
                        style={[styles.selectButton, isActive && styles.activeSelectButton]}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={isActive ? 'checkmark-circle' : 'ellipse-outline'}
                            size={16}
                            color={isActive ? '#FFFFFF' : colors.slate[400]}
                        />
                        <Text style={[styles.selectText, isActive && styles.activeSelectText]}>
                            {isActive ? 'ACTIVE ENGINE' : 'SELECT'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.md,
    },
    activeCard: {
        borderColor: colors.primary[500],
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    titleWrap: {
        flex: 1,
        marginRight: spacing.sm,
    },
    title: {
        fontSize: typography.fontSize.base,
        fontWeight: '700',
        color: colors.text.primary,
    },
    modelKey: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[400],
        marginTop: 1,
    },
    description: {
        fontSize: typography.fontSize.sm,
        color: colors.slate[300],
        lineHeight: 20,
        marginVertical: spacing.sm,
    },
    specsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginVertical: spacing.xs,
        paddingTop: spacing.xs,
    },
    specItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    specText: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[400],
        marginLeft: 4,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.md,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    downloadLink: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: spacing.sm,
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: 'rgba(6, 182, 212, 0.25)',
    },
    downloadText: {
        fontSize: typography.fontSize.xs,
        color: colors.accent[300],
        fontWeight: '600',
        marginLeft: 4,
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.slate[800],
        marginLeft: 'auto',
    },
    activeSelectButton: {
        backgroundColor: colors.primary[600],
    },
    selectText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.slate[300],
        marginLeft: 6,
    },
    activeSelectText: {
        color: '#FFFFFF',
    },
});

export default ModelCard;
