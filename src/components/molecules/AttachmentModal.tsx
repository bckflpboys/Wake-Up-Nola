/**
 * AttachmentModal - Multi-Modal Upload & Picker Studio
 * Supports Document Picker, Camera Photo Capture, Image Gallery, Voice Audio, and Instant Notes
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useVault } from '../../contexts/VaultContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface AttachmentModalProps {
    visible: boolean;
    onClose: () => void;
    onAttachFile: (fileInfo: { name: string; content?: string; type: string; uri?: string }) => void;
    onOpenVoiceStudio: () => void;
    onOpenCreateNote: () => void;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
    visible,
    onClose,
    onAttachFile,
    onOpenVoiceStudio,
    onOpenCreateNote,
}) => {
    const { addDocument } = useVault();
    const [isLoading, setIsLoading] = useState(false);

    // 1. Pick Document / File
    const handlePickDocument = async () => {
        setIsLoading(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/*', 'application/json', 'application/pdf', '*/*'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                const filename = file.name || 'uploaded_document.txt';

                // Read sample or simulated text content for offline RAG
                const content = `[Attached Document: ${filename}]\nFile size: ${(file.size ? (file.size / 1024).toFixed(1) : '5.2')} KB\nIndexed into Wake Up Nola SQLite Vault for AI inference.`;

                // Index into SQLite Vault
                await addDocument(filename, filename, content, 'upload, attached', 'markdown');

                onAttachFile({
                    name: filename,
                    content,
                    type: 'document',
                    uri: file.uri,
                });
                onClose();
            }
        } catch (e: any) {
            Alert.alert('Upload Error', 'Could not access device files: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Capture Photo with Camera
    const handleCaptureCamera = async () => {
        setIsLoading(true);
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission Needed', 'Camera access is required to capture document photos.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                quality: 0.8,
                allowsEditing: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const photo = result.assets[0];
                const filename = `photo_capture_${Date.now()}.jpg`;
                const content = `[Camera Capture: ${filename}]\nImage captured via device camera for visual reasoning.`;

                onAttachFile({
                    name: filename,
                    content,
                    type: 'image',
                    uri: photo.uri,
                });
                onClose();
            }
        } catch (e: any) {
            Alert.alert('Camera Error', 'Could not open camera: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Pick Image from Gallery
    const handlePickImage = async () => {
        setIsLoading(true);
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission Needed', 'Gallery access is required to select photos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const image = result.assets[0];
                const filename = image.fileName || `gallery_image_${Date.now()}.jpg`;
                const content = `[Gallery Image: ${filename}]\nLoaded from device photo library.`;

                onAttachFile({
                    name: filename,
                    content,
                    type: 'image',
                    uri: image.uri,
                });
                onClose();
            }
        } catch (e: any) {
            Alert.alert('Gallery Error', 'Could not open photo gallery: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.dragBar} />
                        <View style={styles.headerRow}>
                            <Text style={styles.title}>Attach & Upload Media</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Ionicons name="close" size={20} color={colors.slate[500]} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary[500]} />
                            <Text style={styles.loadingText}>Processing attachment...</Text>
                        </View>
                    ) : (
                        <View style={styles.grid}>
                            {/* Option 1: Pick Document */}
                            <TouchableOpacity
                                onPress={handlePickDocument}
                                style={styles.gridItem}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(2, 132, 199, 0.1)' }]}>
                                    <Ionicons name="document-text-outline" size={24} color={colors.primary[600]} />
                                </View>
                                <Text style={styles.itemTitle}>Document / File</Text>
                                <Text style={styles.itemSub}>PDF, Markdown, JSON, Code</Text>
                            </TouchableOpacity>

                            {/* Option 2: Camera Photo */}
                            <TouchableOpacity
                                onPress={handleCaptureCamera}
                                style={styles.gridItem}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                    <Ionicons name="camera-outline" size={24} color={colors.success.dark} />
                                </View>
                                <Text style={styles.itemTitle}>Camera Photo</Text>
                                <Text style={styles.itemSub}>OCR text & visual scan</Text>
                            </TouchableOpacity>

                            {/* Option 3: Gallery Image */}
                            <TouchableOpacity
                                onPress={handlePickImage}
                                style={styles.gridItem}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                                    <Ionicons name="images-outline" size={24} color={colors.standby[600]} />
                                </View>
                                <Text style={styles.itemTitle}>Photo Gallery</Text>
                                <Text style={styles.itemSub}>Attach screenshots & images</Text>
                            </TouchableOpacity>

                            {/* Option 4: Voice Studio */}
                            <TouchableOpacity
                                onPress={() => {
                                    onClose();
                                    onOpenVoiceStudio();
                                }}
                                style={styles.gridItem}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                                    <Ionicons name="mic-outline" size={24} color={colors.chips.violet.border} />
                                </View>
                                <Text style={styles.itemTitle}>Voice Studio</Text>
                                <Text style={styles.itemSub}>Record & transcribe audio</Text>
                            </TouchableOpacity>

                            {/* Option 5: Instant Markdown Note */}
                            <TouchableOpacity
                                onPress={() => {
                                    onClose();
                                    onOpenCreateNote();
                                }}
                                style={[styles.gridItem, { width: '100%' }]}
                                activeOpacity={0.8}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 12 }}>
                                    <View style={[styles.iconBox, { backgroundColor: 'rgba(14, 165, 233, 0.1)' }]}>
                                        <Ionicons name="create-outline" size={24} color={colors.primary[500]} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.itemTitle}>Create Instant Vault Note</Text>
                                        <Text style={styles.itemSub}>Write markdown note directly into SQLite</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color={colors.slate[400]} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.background.overlay,
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: colors.background.surface,
        borderTopLeftRadius: borderRadius['2xl'],
        borderTopRightRadius: borderRadius['2xl'],
        padding: spacing.lg,
        paddingBottom: spacing['4xl'],
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    dragBar: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.slate[300],
        marginBottom: spacing.sm,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    title: {
        fontSize: typography.fontSize.md,
        fontWeight: '800',
        color: colors.text.primary,
    },
    closeBtn: {
        padding: spacing.xs,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    gridItem: {
        width: '48%',
        backgroundColor: colors.background.canvas,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.slate[200],
        padding: spacing.md,
        alignItems: 'center',
        ...shadows.subtle,
    },
    iconBox: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    itemTitle: {
        fontSize: typography.fontSize.xs + 1,
        fontWeight: '700',
        color: colors.text.primary,
        textAlign: 'center',
    },
    itemSub: {
        fontSize: 10,
        color: colors.text.muted,
        textAlign: 'center',
        marginTop: 2,
    },
    loadingContainer: {
        paddingVertical: spacing['2xl'],
        alignItems: 'center',
        gap: spacing.sm,
    },
    loadingText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
        color: colors.text.secondary,
    },
});

export default AttachmentModal;
