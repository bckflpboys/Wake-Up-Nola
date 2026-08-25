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
import { colors, spacing, typography, borderRadius } from '../../theme';

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
                return { name: 'code-slash' as const, color: colors.standby[400] };
            case 'markdown':
                return { name: 'document-text' as const, color: colors.accent[400] };
            case 'pdf':
                return { name: 'reader' as const, color: colors.error.main };
            default:
                return { name: 'document-outline' as const, color: colors.primary[400] };
        }
    };

    const fileIcon = getFileIcon(document.fileType);

    return (
        <Card variant="default" style={styles.card}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                <View style={styles.headerRow}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                        <Ionicons name={fileIcon.name} size={22} color={fileIcon.color} />
                    </View>
                    <View style={styles.titleWrap}>
                        <Text style={styles.title} numberOfLines={1}>{document.title}</Text>
                        <Text style={styles.filename} numberOfLines={1}>{document.filename}</Text>
                    </View>
                    <Badge
                        label={document.fileType?.toUpperCase() || 'DOC'}
                        variant="accent"
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
                        <Text style={styles.metaText}>Offline Indexed</Text>
                    </View>

                    {onAskNolaAboutDoc && (
                        <TouchableOpacity
                            onPress={onAskNolaAboutDoc}
                            style={styles.askButton}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.accent[400]} />
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
        marginBottom: spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    titleWrap: {
        flex: 1,
    },
    title: {
        fontSize: typography.fontSize.base,
        fontWeight: '700',
        color: colors.text.primary,
    },
    filename: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[400],
        marginTop: 2,
    },
    preview: {
        fontSize: typography.fontSize.sm,
        color: colors.slate[300],
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    metaWrap: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[500],
    },
    metaDot: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[500],
        marginHorizontal: spacing.xs,
    },
    askButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        paddingVertical: 4,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(6, 182, 212, 0.3)',
    },
    askButtonText: {
        fontSize: typography.fontSize.xs,
        color: colors.accent[300],
        fontWeight: '600',
        marginLeft: 4,
    },
});

export default DocumentCard;
