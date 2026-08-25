import { View, Text, StyleSheet } from 'react-native';

interface TicketCardProps {
    ticketId: string;
    type: string;
    isScanned: boolean;
}

export const TicketCard = ({ ticketId, type, isScanned }: TicketCardProps) => {
    return (
        <View style={[styles.card, isScanned ? styles.scannedCard : styles.defaultCard]}>
            <View style={styles.content}>
                <View>
                    <Text style={styles.typeText}>{type}</Text>
                    <Text style={styles.idText}>#{ticketId}</Text>
                </View>
                {isScanned && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>SCANNED</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
        marginBottom: 10,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    defaultCard: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
    },
    scannedCard: {
        backgroundColor: '#ECFDF5', // Green-50
        borderColor: '#BBF7D0', // Green-200
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    typeText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    idText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    badge: {
        backgroundColor: '#22C55E', // Green-500
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
