/**
 * ModelCard - Molecule
 * Card representing an AI Model (On-Device Gemma 4 / Qwen 3.5, LAN Ollama, Cloud)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { AIModel } from '../../services/aiEngine';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface ModelCardProps {
    model: AIModel;
    isActive: boolean;
    onSelect: () => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({
    model,
    isActive,
    onSelect,
}) => {
    const getTypeBadge = () => {
        switch (model.type) {
            case 'on-device':
                return <Badge label="ON-DEVICE SLM" variant="accent" size="sm" />;
            case 'lan-desktop':
                return <Badge label="LOCAL WIFI LAN" variant="info" size="sm" />;
            case 'cloud':
                return <Badge label="CLOUD FALLBACK" variant="default" size="sm" />;
        }
    };

    return (
        <Card
            variant={isActive ? 'glowBlue' : 'default'}
            style={isActive ? StyleSheet.flatten([styles.card, styles.activeCard]) : styles.card}
        >
            <TouchableOpacity onPress={onSelect} activeOpacity={0.7}>
                <View style={styles.headerRow}>
                    <View style={[styles.iconBox, { backgroundColor: isActive ? 'rgba(2, 132, 199, 0.1)' : colors.slate[100] }]}>
                        <Ionicons
                            name={model.type === 'on-device' ? 'hardware-chip' : model.type === 'lan-desktop' ? 'wifi' : 'cloud'}
                            size={20}
                            color={isActive ? colors.primary[600] : colors.slate[500]}
                        />
                    </View>

                    <View style={styles.titleWrap}>
                        <View style={styles.nameRow}>
                            <Text style={styles.name}>{model.name}</Text>
                            {isActive && (
                                <Ionicons name="checkmark-circle" size={18} color={colors.primary[500]} />
                            )}
                        </View>
                        <Text style={styles.modelKey}>{model.modelKey}</Text>
                    </View>
                </View>

                {/* Description */}
                <Text style={styles.description} numberOfLines={2}>
                    {model.description}
                </Text>

                {/* Footer Info */}
                <View style={styles.footerRow}>
                    <View style={styles.metaWrap}>
                        {getTypeBadge()}
                        {model.sizeMb > 0 && (
                            <Text style={styles.sizeText}>{model.sizeMb} MB</Text>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={onSelect}
                        style={[styles.actionBtn, isActive ? styles.activeActionBtn : styles.inactiveActionBtn]}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.actionBtnText, isActive && styles.activeActionBtnText]}>
                            {isActive ? 'ACTIVE' : 'SELECT'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.sm + 4,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(15, 23, 42, 0.08)',
        ...shadows.subtle,
    },
    activeCard: {
        borderColor: colors.primary[500],
        borderWidth: 1.5,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    titleWrap: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    name: {
        fontSize: typography.fontSize.sm + 1,
        fontWeight: '700',
        color: colors.text.primary,
    },
    modelKey: {
        fontSize: 11,
        color: colors.text.muted,
        marginTop: 1,
        fontFamily: 'monospace',
    },
    description: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        lineHeight: 18,
        marginVertical: spacing.xs,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: spacing.xs,
        marginTop: spacing.xs,
        borderTopWidth: 1,
        borderTopColor: colors.slate[100],
    },
    metaWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    sizeText: {
        fontSize: 11,
        color: colors.text.muted,
        fontWeight: '600',
    },
    actionBtn: {
        paddingVertical: 4,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
    },
    inactiveActionBtn: {
        backgroundColor: colors.slate[100],
    },
    activeActionBtn: {
        backgroundColor: colors.primary[500],
    },
    actionBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.text.secondary,
    },
    activeActionBtnText: {
        color: '#FFFFFF',
    },
});

export default ModelCard;
