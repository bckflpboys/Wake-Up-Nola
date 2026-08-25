import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AttendeeRow } from '../molecules/AttendeeRow';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { db } from '../../db/client';
import { attendees, type Attendee } from '../../db/schema';
import { eq, like, or } from 'drizzle-orm';
import { colors, spacing, typography } from '../../theme';

interface AttendeeListProps {
    eventId: string;
    onClose: () => void;
}

export const AttendeeList = ({ eventId, onClose }: AttendeeListProps) => {
    const [attendeeList, setAttendeeList] = useState<Attendee[]>([]);
    const [filteredList, setFilteredList] = useState<Attendee[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAttendees();
    }, [eventId]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredList(attendeeList);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = attendeeList.filter(
                (a) =>
                (a.name?.toLowerCase().includes(query) ||
                    a.email?.toLowerCase().includes(query) ||
                    a.id.toLowerCase().includes(query))
            );
            setFilteredList(filtered);
        }
    }, [searchQuery, attendeeList]);

    const loadAttendees = async () => {
        setLoading(true);
        try {
            const list = await db.select().from(attendees).where(eq(attendees.eventId, eventId));
            setAttendeeList(list);
            setFilteredList(list);
        } catch (error) {
            console.error('Failed to load attendees:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Attendee }) => (
        <AttendeeRow
            id={item.id}
            name={item.name || 'Unknown'}
            email={item.email || ''}
            ticketCount={item.ticketCount || 1}
            ticketsScanned={item.ticketsScanned || 0}
            ticketType={item.ticketCount && item.ticketCount > 1 ? 'Multiple' : 'Standard'}
            checkInStatus={(item.checkInStatus as 'pending' | 'partial' | 'complete') || 'pending'}
            onPress={() => {
                // Future: Open detail modal
            }}
        />
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Button
                    label=""
                    variant="ghost"
                    icon={<Ionicons name="arrow-back" size={24} color={colors.slate[900]} />}
                    onPress={onClose}
                    fullWidth={false}
                    style={styles.backButton}
                />
                <Text style={styles.title}>Attendee List</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Input
                    label=""
                    placeholder="Search by name, email, or ticket ID"
                    leftIcon="search-outline"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                </View>
            ) : (
                <FlatList
                    data={filteredList}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No attendees found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.background.primary,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate[100],
    },
    backButton: {
        padding: 0,
        height: 40,
        width: 40,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
        color: colors.slate[900],
    },
    searchContainer: {
        padding: spacing.md,
        backgroundColor: colors.background.primary,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyText: {
        color: colors.slate[500],
        fontSize: typography.fontSize.base,
    },
});
