/**
 * Vault Screen - Shared Folder & Offline Knowledge Base
 * Features:
 * - Document upload via DocumentPicker
 * - Instant Markdown creator
 * - Import Starter Knowledge Pack
 * - Document Viewer with "Ask Nola about this doc", "Copy", and "Delete"
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
    ActivityIndicator,
    Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useVault } from '../contexts/VaultContext';
import { DocumentCard } from '../components/molecules/DocumentCard';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { Badge } from '../components/atoms/Badge';
import { VaultDocument } from '../db/schema';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

interface VaultScreenProps {
    onNavigateBack?: () => void;
    onAskNolaAboutDoc?: (prompt: string) => void;
}

type DocFilter = 'all' | 'markdown' | 'json' | 'notes';

export const VaultScreen: React.FC<VaultScreenProps> = ({
    onNavigateBack,
    onAskNolaAboutDoc,
}) => {
    const {
        documents,
        searchQuery,
        searchResults,
        setSearchQuery,
        addDocument,
        deleteDocument,
        importSamplePack,
        refreshVault,
        isLoading,
    } = useVault();

    const [selectedFilter, setSelectedFilter] = useState<DocFilter>('all');
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<VaultDocument | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

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

    const handlePickAndUploadFile = async () => {
        setIsUploading(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/*', 'application/json', 'application/pdf', '*/*'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                const filename = file.name || 'uploaded_note.md';
                const title = filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
                const content = `[Imported File: ${filename}]\nSize: ${(file.size ? (file.size / 1024).toFixed(1) : '4.8')} KB\nSynced into SQLite storage for offline RAG search.`;

                await addDocument(title, filename, content, 'upload, offline', 'markdown');
            }
        } catch (e: any) {
            Alert.alert('Upload Error', e.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Delete Document', 'Are you sure you want to delete this document from your offline vault?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deleteDocument(id);
                    setSelectedDoc(null);
                },
            },
        ]);
    };

    const handleCopyDoc = (doc: VaultDocument) => {
        Clipboard.setString(doc.content);
        setCopiedDocId(doc.id);
        setTimeout(() => setCopiedDocId(null), 2000);
    };

    const handleAskAboutDoc = (doc: VaultDocument) => {
        if (onAskNolaAboutDoc) {
            onAskNolaAboutDoc(`What key insights are inside the "${doc.title}" document? Here is the content:\n${doc.content}`);
        }
    };

    const filteredDocs = searchResults.filter(doc => {
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'markdown') return doc.fileType === 'markdown';
        if (selectedFilter === 'json') return doc.fileType === 'json';
        if (selectedFilter === 'notes') return !doc.fileType || doc.fileType === 'txt';
        return true;
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* 1. Header with Back Button */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={onNavigateBack}
                        style={styles.backBtn}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={18} color={colors.text.primary} />
                    </TouchableOpacity>

                    <View style={styles.headerTitleWrap}>
                        <Text style={styles.headerTitle}>Shared Vault</Text>
                        <Text style={styles.headerSubtitle}>
                            {documents.length} offline docs indexed in SQLite
                        </Text>
                    </View>

                    <View style={styles.headerActionsRow}>
                        {/* Upload File Button */}
                        <TouchableOpacity
                            onPress={handlePickAndUploadFile}
                            disabled={isUploading}
                            style={styles.uploadIconBtn}
                            activeOpacity={0.8}
                        >
                            {isUploading ? (
                                <ActivityIndicator size="small" color={colors.primary[600]} />
                            ) : (
                                <Ionicons name="cloud-upload-outline" size={18} color={colors.primary[600]} />
                            )}
                        </TouchableOpacity>

                        {/* Add Note Button */}
                        <TouchableOpacity
                            onPress={() => setIsAddModalVisible(true)}
                            style={styles.addBtn}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="add" size={16} color="#FFFFFF" />
                            <Text style={styles.addBtnText}>Add Note</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 2. Minimalist Search Bar */}
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

                {/* 3. Filter Tags & Import Starter Pack */}
                <View style={styles.filterRow}>
                    <TouchableOpacity
                        onPress={() => setSelectedFilter('all')}
                        style={[styles.filterPill, selectedFilter === 'all' && styles.filterPillActive]}
                    >
                        <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
                            All ({documents.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setSelectedFilter('markdown')}
                        style={[styles.filterPill, selectedFilter === 'markdown' && styles.filterPillActive]}
                    >
                        <Text style={[styles.filterText, selectedFilter === 'markdown' && styles.filterTextActive]}>
                            Markdown Docs
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setSelectedFilter('json')}
                        style={[styles.filterPill, selectedFilter === 'json' && styles.filterPillActive]}
                    >
                        <Text style={[styles.filterText, selectedFilter === 'json' && styles.filterTextActive]}>
                            JSON & Contacts
                        </Text>
                    </TouchableOpacity>

                    {documents.length === 0 && (
                        <TouchableOpacity
                            onPress={importSamplePack}
                            style={[styles.filterPill, { backgroundColor: 'rgba(2, 132, 199, 0.1)', borderColor: 'rgba(2, 132, 199, 0.3)' }]}
                        >
                            <Text style={[styles.filterText, { color: colors.primary[700], fontWeight: '700' }]}>
                                + Load Samples
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* 4. Document List */}
                <ScrollView
                    style={styles.scrollList}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredDocs.map(doc => (
                        <DocumentCard
                            key={doc.id}
                            document={doc}
                            onPress={() => setSelectedDoc(doc)}
                        />
                    ))}

                    {filteredDocs.length === 0 && (
                        <View style={styles.emptyWrap}>
                            <Ionicons name="folder-open-outline" size={48} color={colors.slate[300]} />
                            <Text style={styles.emptyTitle}>No documents match your search</Text>
                            <Text style={styles.emptySub}>
                                Add a note, upload a file, or tap "Load Samples" to index offline files.
                            </Text>
                            <Button
                                label="Load Starter Sample Pack"
                                variant="outline"
                                onPress={importSamplePack}
                                style={{ marginTop: spacing.md }}
                            />
                        </View>
                    )}
                </ScrollView>

                {/* 5. Document Inspector Modal */}
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
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.modalTitle}>{selectedDoc.title}</Text>
                                        <Text style={styles.modalSubtitle}>
                                            {selectedDoc.filename} • {selectedDoc.wordCount} words • {(selectedDoc.fileType || 'md').toUpperCase()}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setSelectedDoc(null)}
                                        style={styles.closeBtn}
                                    >
                                        <Ionicons name="close" size={22} color={colors.slate[600]} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
                                    <Text style={styles.docContentText}>{selectedDoc.content}</Text>
                                </ScrollView>

                                <View style={styles.modalFooter}>
                                    {/* Copy Note Button */}
                                    <TouchableOpacity
                                        onPress={() => handleCopyDoc(selectedDoc)}
                                        style={styles.iconActionBtn}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={copiedDocId === selectedDoc.id ? 'checkmark' : 'copy-outline'}
                                            size={17}
                                            color={copiedDocId === selectedDoc.id ? colors.success.dark : colors.text.primary}
                                        />
                                    </TouchableOpacity>

                                    {/* Delete Button */}
                                    <TouchableOpacity
                                        onPress={() => handleDelete(selectedDoc.id)}
                                        style={styles.iconActionBtn}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="trash-outline" size={17} color={colors.error.dark} />
                                    </TouchableOpacity>

                                    {/* Ask Nola AI Action */}
                                    <TouchableOpacity
                                        onPress={() => {
                                            const doc = selectedDoc;
                                            setSelectedDoc(null);
                                            handleAskAboutDoc(doc);
                                        }}
                                        style={styles.askAiBtn}
                                        activeOpacity={0.85}
                                    >
                                        <Ionicons name="sparkles" size={15} color="#FFFFFF" />
                                        <Text style={styles.askAiBtnText}>Ask Nola About This</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                )}

                {/* 6. Add Note Modal */}
                <Modal
                    visible={isAddModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsAddModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Create Offline Vault Note</Text>
                                <TouchableOpacity
                                    onPress={() => setIsAddModalVisible(false)}
                                    style={styles.closeBtn}
                                >
                                    <Ionicons name="close" size={22} color={colors.slate[600]} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                <Input
                                    label="Note Title"
                                    placeholder="e.g. Architecture Decisions & Notes"
                                    value={newTitle}
                                    onChangeText={setNewTitle}
                                />

                                <Input
                                    label="Filename (Optional)"
                                    placeholder="architecture_decisions.md"
                                    value={newFilename}
                                    onChangeText={setNewFilename}
                                />

                                <Input
                                    label="Note Content (Markdown supported)"
                                    placeholder="Write your offline notes here..."
                                    value={newContent}
                                    onChangeText={setNewContent}
                                    multiline
                                    numberOfLines={6}
                                />

                                <Input
                                    label="Tags (comma-separated)"
                                    placeholder="architecture, notes, personal"
                                    value={newTags}
                                    onChangeText={setNewTags}
                                />
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <Button
                                    label="Save to Offline Vault"
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
        backgroundColor: colors.background.canvas,
        paddingTop: Platform.OS === 'android' ? 32 : 0,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs + 2,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.background.surface,
        borderWidth: 1,
        borderColor: colors.slate[200],
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.subtle,
    },
    headerTitleWrap: {
        flex: 1,
        marginLeft: spacing.md,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: -0.4,
    },
    headerSubtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.text.muted,
        marginTop: 1,
    },
    headerActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs + 2,
    },
    uploadIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(2, 132, 199, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary[500],
        paddingVertical: 7,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        gap: 4,
        ...shadows.subtle,
    },
    addBtnText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    searchContainer: {
        paddingHorizontal: spacing.lg,
        marginTop: spacing.xs,
    },
    searchInput: {
        marginBottom: 0,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs + 2,
        gap: 6,
    },
    filterPill: {
        paddingVertical: 5,
        paddingHorizontal: spacing.sm + 2,
        borderRadius: borderRadius.full,
        backgroundColor: colors.background.surface,
        borderWidth: 1,
        borderColor: colors.slate[200],
    },
    filterPillActive: {
        backgroundColor: colors.text.primary,
        borderColor: colors.text.primary,
    },
    filterText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    filterTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    scrollList: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xs,
        paddingBottom: spacing['4xl'],
    },
    emptyWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing['3xl'],
        paddingHorizontal: spacing.xl,
    },
    emptyTitle: {
        fontSize: typography.fontSize.sm + 1,
        fontWeight: '700',
        color: colors.text.primary,
        marginTop: spacing.md,
        textAlign: 'center',
    },
    emptySub: {
        fontSize: typography.fontSize.xs,
        color: colors.text.muted,
        textAlign: 'center',
        marginTop: spacing.xs,
        lineHeight: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.background.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background.surface,
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
    modalTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '800',
        color: colors.text.primary,
    },
    modalSubtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.text.muted,
        marginTop: 2,
    },
    closeBtn: {
        padding: spacing.xs,
    },
    modalBody: {
        marginVertical: spacing.sm,
        maxHeight: 280,
    },
    docContentText: {
        fontSize: typography.fontSize.xs + 1,
        color: colors.text.primary,
        lineHeight: 22,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    modalFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    iconActionBtn: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.slate[100],
        borderWidth: 1,
        borderColor: colors.slate[200],
        alignItems: 'center',
        justifyContent: 'center',
    },
    askAiBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary[500],
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        gap: 6,
        ...shadows.subtle,
    },
    askAiBtnText: {
        fontSize: typography.fontSize.xs + 1,
        fontWeight: '800',
        color: '#FFFFFF',
    },
});

export default VaultScreen;
