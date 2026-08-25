import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Image } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import Button from '../atoms/Button';
import syncService from '../../services/sync';
import { Event } from '../../db/schema';

interface PrepareEventModalProps {
    visible: boolean;
    onClose: () => void;
    events: Event[];
    onSuccess?: () => void;
}

const PrepareEventModal: React.FC<PrepareEventModalProps> = ({
    visible,
    onClose,
    events,
    onSuccess
}) => {
    const [step, setStep] = useState<'intro' | 'selection' | 'downloading' | 'result'>('intro');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'success' | 'error'>('success');
    const [resultMessage, setResultMessage] = useState('');

    const resetState = () => {
        setStep('intro');
        setSelectedEvent(null);
        setLoading(false);
        setStatus('success');
        setResultMessage('');
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
            // Reset state after transition for next open
            setTimeout(resetState, 300);
        }
    };

    const handleStart = () => {
        setStep('selection');
    };

    const handleSelectEvent = (event: Event) => {
        setSelectedEvent(event);
        handlePrepare(event);
    };

    const handlePrepare = async (event: Event) => {
        setStep('downloading');
        setLoading(true);
        setResultMessage('');

        try {
            // Check online status first
            const isOnline = await syncService.isOnline();
            if (!isOnline) {
                setStep('result');
                setStatus('error');
                setResultMessage('You need an internet connection to download tickets.');
                setLoading(false);
                return;
            }

            const result = await syncService.prepareEvent(event.id);

            setStep('result');
            if (result.success) {
                setStatus('success');
                setResultMessage(`Successfully downloaded ${result.count} tickets for ${event.title}.`);
                if (onSuccess) onSuccess();
            } else {
                setStatus('error');
                setResultMessage(result.error || 'Failed to download tickets.');
            }
        } catch (error) {
            setStep('result');
            setStatus('error');
            setResultMessage('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const renderIntro = () => (
        <View style={styles.content}>
            <View style={styles.iconContainer}>
                <Ionicons name="cloud-download-outline" size={64} color={colors.primary[500]} />
            </View>
            <Text style={styles.eventName}>Prepare Event</Text>
            <Text style={styles.description}>
                Downloading tickets allows you to scan guests quickly even without an internet connection.
                {'\n\n'}
                We recommend doing this before the event starts while you have a strong connection.
            </Text>
            <View style={styles.footer}>
                <Button
                    label="Choose Event to Download"
                    onPress={handleStart}
                    icon={<Ionicons name="list" size={20} color="#FFFFFF" />}
                    style={styles.button}
                />
            </View>
        </View>
    );

    const renderSelection = () => (
        <View style={[styles.content, { padding: 0, flex: 1, alignItems: 'stretch' }]}>
            <View style={styles.selectionHeader}>
                <Text style={styles.selectionTitle}>Select Event</Text>
                <Text style={styles.selectionSubtitle}>Tap an event to start downloading</Text>
            </View>
            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                style={{ width: '100%' }}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    let imageUrl = undefined;
                    try {
                        // Handle potential double stringifying or empty checks
                        if (item.images && item.images !== 'null') {
                            const parsed = JSON.parse(item.images);
                            if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
                        }
                    } catch { imageUrl = undefined; }

                    return (
                        <TouchableOpacity
                            style={styles.eventItem}
                            onPress={() => handleSelectEvent(item)}
                        >
                            <View style={styles.imageContainer}>
                                {imageUrl ? (
                                    <Image
                                        source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl}
                                        style={styles.eventImage}
                                    />
                                ) : (
                                    <View style={styles.placeholderImage}>
                                        <Ionicons name="calendar" size={24} color={colors.primary[500]} />
                                    </View>
                                )}
                            </View>
                            <View style={styles.eventInfo}>
                                <Text style={styles.eventTitle} numberOfLines={1}>{item.title || 'Untitled Event'}</Text>
                                <Text style={styles.eventDate}>
                                    {item.date ? new Date(item.date).toLocaleDateString(undefined, {
                                        weekday: 'short', month: 'short', day: 'numeric'
                                    }) : 'No date'}
                                </Text>
                            </View>
                            <Ionicons name="download-outline" size={24} color={colors.primary[500]} />
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );

    const renderDownloading = () => (
        <View style={styles.content}>
            <View style={styles.iconContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
            <Text style={styles.eventName}>Downloading...</Text>
            <Text style={styles.description}>
                Fetching tickets for {selectedEvent?.title}...
            </Text>
        </View>
    );

    const renderResult = () => (
        <View style={styles.content}>
            <View style={styles.iconContainer}>
                <Ionicons
                    name={status === 'success' ? "checkmark-circle" : "alert-circle"}
                    size={64}
                    color={status === 'success' ? colors.success.main : colors.error.main}
                />
            </View>
            <Text style={styles.eventName}>{status === 'success' ? 'Ready!' : 'Failed'}</Text>

            <View style={[
                styles.messageContainer,
                status === 'error' ? styles.errorContainer : styles.successContainer
            ]}>
                <Text style={[
                    styles.messageText,
                    status === 'error' ? styles.errorText : styles.successText
                ]}>{resultMessage}</Text>
            </View>

            <View style={styles.footer}>
                <Button
                    label="Done"
                    onPress={handleClose}
                    variant={status === 'success' ? "outline" : "primary"}
                    style={styles.button}
                />
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, step === 'selection' && { height: '80%' }]}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {step === 'intro' ? 'Prepare Event' :
                                step === 'selection' ? 'Select Event' :
                                    step === 'downloading' ? 'Downloading' : 'Result'}
                        </Text>
                        <TouchableOpacity onPress={handleClose} disabled={loading}>
                            <Ionicons name="close" size={24} color={colors.slate[900]} />
                        </TouchableOpacity>
                    </View>

                    {step === 'intro' && renderIntro()}
                    {step === 'selection' && renderSelection()}
                    {step === 'downloading' && renderDownloading()}
                    {step === 'result' && renderResult()}
                </View>
            </View>
        </Modal>
    );
};

import { ActivityIndicator } from 'react-native';

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: colors.background.primary,
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.slate[200],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate[200],
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.slate[900],
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 16,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.slate[900],
        textAlign: 'center',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: colors.slate[500],
        textAlign: 'center',
        lineHeight: 20,
    },
    messageContainer: {
        marginTop: 20,
        padding: 12,
        borderRadius: 8,
        width: '100%',
    },
    successContainer: {
        backgroundColor: colors.success.light,
    },
    errorContainer: {
        backgroundColor: colors.error.light,
    },
    messageText: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },
    successText: {
        color: colors.success.main,
    },
    errorText: {
        color: colors.error.main,
    },
    footer: {
        marginTop: 24,
        width: '100%',
    },
    button: {
        width: '100%',
    },
    // Selection Styles
    selectionHeader: {
        padding: 16,
        width: '100%',
        backgroundColor: colors.slate[50],
        borderBottomWidth: 1,
        borderBottomColor: colors.slate[100],
    },
    selectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.slate[900],
    },
    selectionSubtitle: {
        fontSize: 12,
        color: colors.slate[500],
    },
    listContent: {
        padding: 16,
        width: '100%',
    },
    eventItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate[100],
        width: '100%',
    },
    imageContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: colors.slate[100],
        marginRight: 12,
        overflow: 'hidden',
    },
    eventImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.slate[900],
    },
    eventDate: {
        fontSize: 12,
        color: colors.slate[500],
    },
});

export default PrepareEventModal;
