/**
 * Wake Up Nola - App Entry Point
 * Modern, light-blueish ambient AI assistant layout
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { initDatabase } from './src/db/client';
import { NolaProvider, VaultProvider, TaskProvider } from './src/contexts';
import { MainNavigator } from './src/navigation';
import { colors, typography, spacing, borderRadius, shadows } from './src/theme';

// Loading Screen while SQLite & Services initialize
const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <View style={styles.loadingInner}>
      <View style={styles.logoIcon}>
        <Ionicons name="planet-outline" size={48} color={colors.primary[600]} />
      </View>
      <Text style={styles.loadingTitle}>Wake Up Nola</Text>
      <Text style={styles.loadingSubtitle}>Offline-First Intelligence Engine</Text>

      <View style={styles.spinnerRow}>
        <ActivityIndicator size="small" color={colors.primary[600]} />
        <Text style={styles.spinnerText}>Initializing Vault & SQLite...</Text>
      </View>
    </View>
  </View>
);

// Error fallback screen
const ErrorScreen: React.FC<{ error: string }> = ({ error }) => (
  <View style={styles.loadingContainer}>
    <View style={styles.loadingInner}>
      <Ionicons name="alert-circle" size={48} color={colors.error.main} />
      <Text style={styles.errorTitle}>Initialization Error</Text>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  </View>
);

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('⚡ Initializing Wake Up Nola SQLite database...');
        await initDatabase();
        console.log('✅ SQLite ready.');
        setIsReady(true);
      } catch (err: any) {
        console.error('❌ Database initialization failed:', err);
        // Still allow app to boot with memory fallback
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
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
  loadingInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logoIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(2, 132, 199, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.glowBlue,
  },
  loadingTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  loadingSubtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  spinnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing['3xl'],
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    ...shadows.subtle,
  },
  spinnerText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.error.main,
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
});
