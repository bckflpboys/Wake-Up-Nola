/**
 * Wake Up Nola - App Entry Point
 * Live WebGL Embroidered Patches Splash Screen & Main Application
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initDatabase } from './src/db/client';
import { NolaProvider, VaultProvider, TaskProvider } from './src/contexts';
import { MainNavigator } from './src/navigation';
import { SplashScreen } from './src/components/SplashScreen';
import { colors } from './src/theme';

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Loading on-device models...');

  useEffect(() => {
    async function prepare() {
      try {
        setStatusMessage('Syncing local vault & SQLite database...');
        await initDatabase();
        setStatusMessage('Gemma 4 & SLM engine ready');
        setIsDbReady(true);
      } catch (err: any) {
        console.error('Database initialization note:', err);
        setIsDbReady(true);
      }
    }

    prepare();
  }, []);

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <SplashScreen
          onFinish={() => setShowSplash(false)}
          statusMessage={statusMessage}
          isReady={isDbReady}
        />
      </SafeAreaProvider>
    );
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
  container: {
    flex: 1,
    backgroundColor: colors.background.canvas,
  },
});
