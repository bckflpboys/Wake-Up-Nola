/**
 * Model Manager Screen
 * On-device SLM catalogue, download links, assets/models/ guide, and LAN/Cloud endpoints
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNola } from '../contexts/NolaContext';
import { ModelCard } from '../components/molecules/ModelCard';
import { Card } from '../components/atoms/Card';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { Badge } from '../components/atoms/Badge';
import { aiEngine } from '../services/aiEngine';
import { colors, spacing, typography, borderRadius } from '../theme';

export const ModelManagerScreen: React.FC = () => {
    const {
        activeModel,
        availableModels,
        setActiveModel,
    } = useNola();

    const [ollamaUrl, setOllamaUrl] = useState('http://192.168.1.100:11434');
    const [cloudKey, setCloudKey] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    const handleSaveEndpoints = () => {
        aiEngine.setDesktopLanUrl(ollamaUrl);
        aiEngine.setCloudApiKey(cloudKey);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
        Alert.alert('Settings Saved', 'Inference endpoints and API keys updated.');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>AI Model Hub</Text>
                        <Text style={styles.headerSubtitle}>
                            Manage on-device models & local desktop endpoints
                        </Text>
                    </View>
                    <Badge label="100% PRIVATE" variant="success" size="sm" />
                </View>

                <ScrollView
                    style={styles.scrollList}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Folder Guide Banner (Where to drop model files) */}
                    <Card variant="glowCyan" style={styles.guideCard}>
                        <View style={styles.guideHeader}>
                            <View style={styles.guideIconWrap}>
                                <Ionicons name="folder" size={20} color={colors.accent[400]} />
                            </View>
                            <Text style={styles.guideTitle}>Where to Put Model Files</Text>
                        </View>
                        <Text style={styles.guideText}>
                            Drop your downloaded <Text style={styles.codeText}>.gguf</Text> or <Text style={styles.codeText}>.task</Text> model files directly into:
                        </Text>
                        <View style={styles.pathBox}>
                            <Text style={styles.pathText}>assets/models/</Text>
                        </View>
                        <Text style={styles.guideSub}>
                            Nola automatically scans this directory to run models offline without internet or cloud subscriptions.
                        </Text>
                    </Card>

                    {/* Active Model Status Summary */}
                    <View style={styles.sectionHeaderRow}>
                        <Ionicons name="hardware-chip" size={18} color={colors.primary[400]} />
                        <Text style={styles.sectionTitle}>On-Device Models</Text>
                    </View>

                    {/* Model Cards List */}
                    {availableModels.map(model => (
                        <ModelCard
                            key={model.id}
                            model={model}
                            isActive={model.modelKey === activeModel.modelKey}
                            onSelect={() => setActiveModel(model.modelKey)}
                        />
                    ))}

                    {/* Local Desktop WiFi Endpoint (Ollama) */}
                    <View style={styles.sectionHeaderRow}>
                        <Ionicons name="wifi" size={18} color={colors.accent[400]} />
                        <Text style={styles.sectionTitle}>Desktop Ollama LAN (Optional)</Text>
                    </View>

                    <Card variant="default" style={styles.endpointCard}>
                        <Text style={styles.endpointDesc}>
                            Run heavy models on your PC/Mac while controlling them from your mobile device over local WiFi:
                        </Text>
                        <Input
                            label="Desktop Ollama URL (LAN IP)"
                            placeholder="http://192.168.1.X:11434"
                            value={ollamaUrl}
                            onChangeText={setOllamaUrl}
                        />
                    </Card>

                    {/* Cloud Fallback API Key */}
                    <View style={styles.sectionHeaderRow}>
                        <Ionicons name="cloud-outline" size={18} color={colors.info.main} />
                        <Text style={styles.sectionTitle}>Cloud Fallback (Optional)</Text>
                    </View>

                    <Card variant="default" style={styles.endpointCard}>
                        <Text style={styles.endpointDesc}>
                            Used only if you explicitly choose the online Gemini fallback model:
                        </Text>
                        <Input
                            label="Gemini API Key"
                            placeholder="AIzaSy..."
                            value={cloudKey}
                            onChangeText={setCloudKey}
                            secureTextEntry
                        />
                        <Button
                            label={isSaved ? 'Saved!' : 'Save Endpoint Configuration'}
                            variant="secondary"
                            onPress={handleSaveEndpoints}
                        />
                    </Card>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background.primary,
        paddingTop: Platform.OS === 'android' ? 30 : 0,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        marginTop: 2,
    },
    scrollList: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing['4xl'],
    },
    guideCard: {
        marginBottom: spacing.xl,
        backgroundColor: 'rgba(6, 182, 212, 0.06)',
    },
    guideHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    guideIconWrap: {
        marginRight: spacing.xs,
    },
    guideTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.accent[300],
    },
    guideText: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[300],
        marginTop: 2,
        lineHeight: 18,
    },
    codeText: {
        color: colors.accent[400],
        fontWeight: '700',
        fontFamily: 'monospace',
    },
    pathBox: {
        backgroundColor: colors.background.secondary,
        paddingVertical: 6,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        marginVertical: spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(6, 182, 212, 0.3)',
    },
    pathText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.accent[400],
        fontFamily: 'monospace',
    },
    guideSub: {
        fontSize: 11,
        color: colors.slate[400],
        lineHeight: 16,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '700',
        color: colors.text.primary,
        marginLeft: spacing.xs,
    },
    endpointCard: {
        marginBottom: spacing.lg,
    },
    endpointDesc: {
        fontSize: typography.fontSize.xs,
        color: colors.slate[400],
        marginBottom: spacing.md,
        lineHeight: 18,
    },
});

export default ModelManagerScreen;
