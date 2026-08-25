import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';

interface Event {
    id: string;
    title: string;
    date: string;
    location: string;
}

interface EventSelectorProps {
    selectedEvent: Event | null;
    events: Event[];
    onSelect: (event: Event) => void;
}

export const EventSelector = ({ selectedEvent, events, onSelect }: EventSelectorProps) => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Select Event</Text>

            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.selector}
            >
                <Text style={selectedEvent ? styles.selectedText : styles.placeholderText}>
                    {selectedEvent ? selectedEvent.title : "Choose an event"}
                </Text>
                <Text style={styles.arrow}>▼</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Event</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.doneBtn}>
                                <Text style={styles.doneText}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            {events.map((event) => (
                                <TouchableOpacity
                                    key={event.id}
                                    onPress={() => {
                                        onSelect(event);
                                        setModalVisible(false);
                                    }}
                                    style={[
                                        styles.option,
                                        selectedEvent?.id === event.id ? styles.selectedOption : styles.defaultOption
                                    ]}
                                >
                                    <Text style={styles.optionTitle}>{event.title}</Text>
                                    <Text style={styles.optionDate}>{event.date}</Text>
                                    <Text style={styles.optionLocation}>{event.location}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    selector: {
        width: '100%',
        padding: 16,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedText: {
        color: '#111827',
        fontSize: 16,
        fontWeight: '500',
    },
    placeholderText: {
        color: '#9CA3AF',
        fontSize: 16,
    },
    arrow: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        height: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    doneBtn: {
        padding: 8,
    },
    doneText: {
        color: '#f83b3b',
        fontWeight: 'bold',
        fontSize: 16,
    },
    option: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    defaultOption: {
        backgroundColor: '#F9FAFB',
        borderColor: '#E5E7EB',
    },
    selectedOption: {
        backgroundColor: '#fff1f1',
        borderColor: '#f83b3b',
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    optionDate: {
        color: '#6B7280',
        marginTop: 4,
    },
    optionLocation: {
        color: '#9CA3AF',
        fontSize: 12,
        marginTop: 2,
    },
});
