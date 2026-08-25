import React from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Event } from '../../db/schema';

interface EventSelectorModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (event: Event) => void;
    events: Event[];
    title?: string;
}

export const EventSelectorModal: React.FC<EventSelectorModalProps> = ({
    visible,
    onClose,
    onSelect,
    events,
    title = 'Select an Event'
}) => {
    const renderEventItem = ({ item }: { item: Event }) => {
        let imageUrl: string | undefined;
        try {
            const images = JSON.parse(item.images || '[]');
            imageUrl = images[0];
        } catch {
            imageUrl = undefined;
        }

        return (
            <TouchableOpacity
                style={styles.eventItem}
                onPress={() => onSelect(item)}
            >
                <View style={styles.imageContainer}>
                    {imageUrl ? (
                        <Image source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl} style={styles.eventImage} />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Ionicons name="calendar" size={24} color={colors.primary[500]} />
                        </View>
                    )}
                </View>
                <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.eventDate}>
                        {new Date(item.date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </Text>

                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.slate[400]} />
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.slate[900]} />
                        </TouchableOpacity>
                    </View>

                    {events.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={48} color={colors.slate[300]} />
                            <Text style={styles.emptyText}>No events available.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={events}
                            renderItem={renderEventItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.listContent}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: colors.background.primary,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate[200],
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.slate[900],
    },
    closeButton: {
        padding: 4,
    },
    listContent: {
        padding: spacing.lg,
    },
    eventItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    imageContainer: {
        width: 50,
        height: 50,
        borderRadius: borderRadius.md,
        backgroundColor: colors.slate[100],
        overflow: 'hidden',
        marginRight: spacing.md,
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
        marginRight: spacing.sm,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.slate[900],
        marginBottom: 2,
    },
    eventDate: {
        fontSize: 14,
        color: colors.primary[600],
        marginBottom: 2,
    },

    separator: {
        height: 1,
        backgroundColor: colors.slate[100],
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: spacing.md,
        fontSize: 16,
        color: colors.slate[500],
    },
});
