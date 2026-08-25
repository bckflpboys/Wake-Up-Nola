/**
 * Vault Screen - Shared Folder & Offline Knowledge Base
 * Indexes local files, notes, schedules, and documents for private offline RAG
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Modal,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVault } from '../contexts/VaultContext';
import { DocumentCard } from '../components/molecules/DocumentCard';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { Badge } from '../components/atoms/Badge';
import { VaultDocument } from '../db/schema';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

interface VaultScreenProps {
    onAskNolaAboutDoc?: (prompt: string) => void;
}

export const VaultScreen: React.FC<VaultScreenProps> = ({ onAskNolaAboutDoc }) => {
    const {
        documents,
        folders,
        searchQuery,
        searchResults,
        setSearchQuery,
        addDocument,
        refreshVault,
        isLoading,
    } = useVault();

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<VaultDocument | null>(null);

    // Form fields for new doc
    const [newTitle, setNewTitle] = useState('');
    const [newFilename, setNewFilename] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newTags, setNewTags] = useState('');

    const handleCreateDoc = async () => {
        if (!newTitle.trim() || !newContent.trim()) {
            Alert.alert('Missing Info', 'Please enter a title and content for your note.');
            return;
        }

        const fname = newFilename.trim() || `${newTitle.toLowerCase().replace(/\s+/g, '_')}.md`;
        await addDocument(newTitle.trim(), fname, newContent.trim(), newTags.trim(), 'markdown');

        setNewTitle('');
        setNewFilename('');
        setNewContent('');
        setNewTags('');
        setIsAddModalVisible(false);
    };

    const handleAskAboutDoc = (doc: VaultDocument) => {
        if (onAskNolaAboutDoc) {
            onAskNolaAboutDoc(`What key insights are inside the "${doc.title}" document?`);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Shared Vault</Text>
                        <Text style={styles.headerSubtitle}>
                            {documents.length} offline documents indexed on this device
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setIsAddModalVisible(true)}
                        style={styles.addBtn}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={18} color="#FFFFFF" />
                        <Text style={styles.addBtnText}>Add Note</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Input
                        placeholder="Search local notes, schedules & files..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        leftIcon="search-outline"
                        rightIcon={searchQuery ? 'close-circle-outline' : undefined}
                        onRightIconPress={() => setSearchQuery('')}
                        containerStyle={styles.searchInput}
                    />
                </View>

                {/* Shared Folder Paths Bar */}
                <View style={styles.foldersBar}>
                    {folders.map(folder => (
                        <View key={folder.id} style={styles.folderChip}>
                            <Ionicons name="folder" size={13} color={colors.primary[600]} />
                            <Text style={styles.folderChipText}>{folder.path}</Text>
                            <Badge label={`${folder.documentCount} files`} variant="default" size="sm" />
                        </View>
                    ))}
                </View>

                {/* Documents List */}
                <ScrollView
                    style={styles.scrollList}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {searchResults.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="folder-open-outline" size={44} color={colors.slate[400]} />
                            <Text style={styles.emptyTitle}>No matching documents found</Text>
                            <Text style={styles.emptyDesc}>
                                Try searching for "schedule", "alpha", "contacts" or add a new offline note.
                            </Text>
                        </View>
                    ) : (
                        searchResults.map(doc => (
                            <DocumentCard
                                key={doc.id}
                                document={doc}
                                onPress={() => setSelectedDoc(doc)}
                                onAskNolaAboutDoc={() => handleAskAboutDoc(doc)}
                            />
                        ))
                    )}
                </ScrollView>

                {/* View Document Modal */}
                {selectedDoc && (
                    <Modal
                        visible={!!selectedDoc}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setSelectedDoc(null)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <View style={styles.modalTitleWrap}>
                                        <Text style={styles.modalTitle}>{selectedDoc.title}</Text>
                                        <Text style={styles.modalSub}>{selectedDoc.filepath}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setSelectedDoc(null)}
                                        style={styles.closeBtn}
                                    >
                                        <Ionicons name="close" size={24} color={colors.slate[600]} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.modalBody}>
                                    <Text style={styles.docContentText}>{selectedDoc.content}</Text>
                                </ScrollView>

                                <View style={styles.modalFooter}>
                                    <Button
                                        label="Ask Nola about this Document"
                                        variant="primary"
                                        icon={<Ionicons name="chatbubble-outline" size={16} color="#FFFFFF" />}
                                        onPress={() => {
                                            const doc = selectedDoc;
                                            setSelectedDoc(null);
                                            handleAskAboutDoc(doc);
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    </Modal>
                )}

                {/* Add New Document Modal */}
                <Modal
                    visible={isAddModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsAddModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Add Offline Document to Vault</Text>
                                <TouchableOpacity
                                    onPress={() => setIsAddModalVisible(false)}
                                    style={styles.closeBtn}
                                >
                                    <Ionicons name="close" size={24} color={colors.slate[600]} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                <Input
                                    label="Document Title"
                                    placeholder="e.g. Weekly Meeting Notes"
                                    value={newTitle}
                                    onChangeText={setNewTitle}
                                />
                                <Input
                                    label="Filename (Optional)"
                                    placeholder="e.g. weekly_meeting.md"
                                    value={newFilename}
                                    onChangeText={setNewFilename}
                                />
                                <Input
                                    label="Tags (Comma-separated)"
                                    placeholder="e.g. meeting, engineering, sprint"
                                    value={newTags}
                                    onChangeText={setNewTags}
                                />
                                <Input
                                    label="Content / Text"
                                    placeholder="Enter your private offline notes or paste document text..."
                                    value={newContent}
                                    onChangeText={setNewContent}
                                    multiline
                                    numberOfLines={6}
                                />
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <Button
                                    label="Save to Shared Vault"
                                    variant="primary"
                                    onPress={handleCreateDoc}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background.primary,
        paddingTop: Platform.OS === 'android' ? 30 : 0,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.text.muted,
        marginTop: 2,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.text.primary,
        paddingVertical: 7,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        ...shadows.sm,
    },
    addBtnText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 4,
    },
    searchContainer: {
        paddingHorizontal: spacing.lg,
    },
    searchInput: {
        marginBottom: spacing.xs,
    },
    foldersBar: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs,
        gap: spacing.sm,
    },
    folderChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 4,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: 'rgba(15, 23, 42, 0.08)',
        gap: 6,
        ...shadows.subtle,
    },
    folderChipText: {
        fontSize: typography.fontSize.xs,
        color: colors.text.primary,
        fontFamily: 'monospace',
    },
    scrollList: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing['3xl'],
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing['3xl'],
    },
    emptyTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '700',
        color: colors.text.secondary,
        marginTop: spacing.md,
    },
    emptyDesc: {
        fontSize: typography.fontSize.xs,
        color: colors.text.muted,
        textAlign: 'center',
        marginTop: spacing.xs,
        paddingHorizontal: spacing.xl,
        lineHeight: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.background.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: borderRadius['2xl'],
        borderTopRightRadius: borderRadius['2xl'],
        maxHeight: '85%',
        padding: spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate[100],
    },
    modalTitleWrap: {
        flex: 1,
        marginRight: spacing.sm,
    },
    modalTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
        color: colors.text.primary,
    },
    modalSub: {
        fontSize: typography.fontSize.xs,
        color: colors.primary[600],
        fontFamily: 'monospace',
        marginTop: 2,
    },
    closeBtn: {
        padding: spacing.xs,
    },
    modalBody: {
        maxHeight: 340,
        marginVertical: spacing.sm,
    },
    docContentText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.primary,
        lineHeight: 22,
    },
    modalFooter: {
        marginTop: spacing.md,
    },
});

export default VaultScreen;
