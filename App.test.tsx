/**
 * Simple Test App to Debug White Screen
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
    console.log('Test App Rendering');

    return (
        <SafeAreaProvider>
            <View style={styles.container}>
                <Text style={styles.text}>✅ App is Working!</Text>
                <Text style={styles.subtext}>If you see this, React Native is rendering correctly</Text>
            </View>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        padding: 20,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 10,
    },
    subtext: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
    },
});
