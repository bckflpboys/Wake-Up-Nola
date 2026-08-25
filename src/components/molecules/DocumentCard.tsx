/**
 * DocumentCard - Molecule
 * Card representing a document or file inside the local shared vault
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { VaultDocument } from '../../db/schema';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface DocumentCardProps {
    document: VaultDocument;
    onPress: () => void;
    onAskNolaAboutDoc?: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
    document,
    onPress,
    onAskNolaAboutDoc,
}) => {
    const getFileIcon = (type: string | null) => {
        switch (type) {
            case 'json':
                return { name: 'code-slash' as const, color: colors.standby[600] };
            case 'markdown':
                return { name: 'document-text' as const, color: colors.primary[600] };
            case 'pdf':
                return { name: 'reader' as const, color: colors.error.main };
            default:
                return { name: 'document-outline' as const, color: colors.accent[600] };
        }
    };

    const fileIcon = getFileIcon(document.fileType);

    return (
        <Card variant="default" style={styles.card}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                <View style={styles.headerRow}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(2, 132, 199, 0.08)' }]}>
                        <Ionicons name={fileIcon.name} size={20} color={fileIcon.color} />
                    </View>
                    <View style={styles.titleWrap}>
                        <Text style={styles.title} numberOfLines={1}>{document.title}</Text>
                        <Text style={styles.filename} numberOfLines={1}>{document.filename}</Text>
                    </View>
                    <Badge
                        label={document.fileType?.toUpperCase() || 'DOC'}
                        variant="info"
                        size="sm"
                    />
                </View>

                {/* Content Preview */}
                <Text style={styles.preview} numberOfLines={2}>
                    {document.content}
                </Text>

                {/* Footer Info & Actions */}
                <View style={styles.footerRow}>
                    <View style={styles.metaWrap}>
                        <Text style={styles.metaText}>{document.wordCount || 0} words</Text>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.metaText}>Offline Synced</Text>
                    </View>

                    {onAskNolaAboutDoc && (
                        <TouchableOpacity
                            onPress={onAskNolaAboutDoc}
                            style={styles.askButton}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="chatbubble-ellipses-outline" size={13} color={colors.primary[600]} />
                            <Text style={styles.askButtonText}>Ask Nola</Text>
                        </TouchableOpacity>
                    )}
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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    titleWrap: {
        flex: 1,
    },
    title: {
        fontSize: typography.fontSize.sm + 1,
        fontWeight: '700',
        color: colors.text.primary,
    },
    filename: {
        fontSize: 11,
        color: colors.text.muted,
        marginTop: 1,
    },
    preview: {
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
        borderTopWidth: 1,
        borderTopColor: colors.slate[100],
    },
    metaWrap: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 11,
        color: colors.text.muted,
    },
    metaDot: {
        fontSize: 11,
        color: colors.slate[300],
        marginHorizontal: spacing.xs,
    },
    askButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        paddingVertical: 3,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(2, 132, 199, 0.2)',
    },
    askButtonText: {
        fontSize: 11,
        color: colors.primary[600],
        fontWeight: '700',
        marginLeft: 4,
    },
});

export default DocumentCard;
