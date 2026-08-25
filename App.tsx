/**
 * Wake Up Nola
 * Offline-First Personal AI Assistant
 * Main Application Entry Point
 */

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { initializeDatabase } from './src/db/client';
import { NolaProvider } from './src/contexts/NolaContext';
import { VaultProvider } from './src/contexts/VaultContext';
import { TaskProvider } from './src/contexts/TaskContext';
import { MainNavigator } from './src/navigation/MainNavigator';
import { colors, typography, spacing, borderRadius, shadows } from './src/theme';

// Loading / Standby Initializer Component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <LinearGradient
      colors={['#090D16', '#131C31', '#172033']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.loadingGradient}
    >
      <View style={styles.logoIcon}>
        <Ionicons name="sparkles" size={44} color={colors.standby[400]} />
      </View>
      <Text style={styles.loadingTitle}>Wake Up Nola</Text>
      <Text style={styles.loadingSubtitle}>Offline-First Personal AI</Text>
      
      <View style={styles.spinnerRow}>
        <ActivityIndicator
          color={colors.accent[400]}
          size="small"
        />
        <Text style={styles.initializingText}>Initializing on-device vault & models...</Text>
      </View>
    </LinearGradient>
  </View>
);

// Error Screen Component
const ErrorScreen = ({ error }: { error: string }) => (
  <View style={styles.errorContainer}>
    <Ionicons name="alert-circle" size={64} color={colors.error.main} />
    <Text style={styles.errorTitle}>Initialization Error</Text>
    <Text style={styles.errorText}>{error}</Text>
    <Text style={styles.errorHint}>Please restart the application</Text>
  </View>
);

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function prepareApp() {
      try {
        await initializeDatabase();
        // Give smooth entry transition
        await new Promise(r => setTimeout(r, 400));
        setIsReady(true);
      } catch (err: any) {
        console.error('Database initialization error:', err);
        setError(err?.message || 'Failed to initialize offline database');
      }
    }

    prepareApp();
  }, []);

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.background.primary} />
      <NolaProvider>
        <VaultProvider>
          <TaskProvider>
            <MainNavigator />
          </TaskProvider>
        </VaultProvider>
      </NolaProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logoIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 2,
    borderColor: colors.standby[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.glowAmber,
  },
  loadingTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  loadingSubtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    color: colors.slate[400],
    marginTop: spacing.xs,
  },
  spinnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing['3xl'],
    backgroundColor: colors.background.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  initializingText: {
    fontSize: typography.fontSize.xs,
    color: colors.slate[300],
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
    backgroundColor: colors.background.primary,
  },
  errorTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.slate[400],
    marginTop: spacing.md,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: typography.fontSize.sm,
    color: colors.slate[500],
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
