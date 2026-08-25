import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Linking,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as LinkingExpo from 'expo-linking';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../theme';

const { height } = Dimensions.get('window');

export const LoginScreen = () => {
    const { login, loginWithToken, isLoading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');

    // Handle Deep Linking for Google Auth
    const url = LinkingExpo.useURL();

    useEffect(() => {
        if (url) {
            handleDeepLink(url);
        }
    }, [url]);

    const handleDeepLink = async (deepLinkUrl: string) => {
        try {
            const { queryParams } = LinkingExpo.parse(deepLinkUrl);

            if (queryParams?.token) {
                const user = {
                    id: queryParams.id as string,
                    email: queryParams.email as string,
                    name: queryParams.name as string,
                    role: queryParams.role as string,
                    avatar: queryParams.avatar as string,
                    token: queryParams.token as string
                };

                const success = await loginWithToken(user);
                if (!success) {
                    setFormError('Failed to verify Google login');
                }
            } else if (queryParams?.error) {
                setFormError(queryParams.error as string || 'Google login failed');
            }
        } catch (e) {
            console.error('Deep link error:', e);
        }
    };

    const handleLogin = async () => {
        setFormError('');

        if (!email.trim()) {
            setFormError('Please enter your email');
            return;
        }

        if (!password.trim()) {
            setFormError('Please enter your password');
            return;
        }

        const success = await login(email.trim(), password);

        if (!success) {
            setFormError('Invalid email or password');
        }
    };

    const handleGoogleLogin = async () => {
        // Construct the redirect URL for the app
        // In Expo Go: exp://192.168.x.x:8081/--/auth-callback
        // In Prod: ticketafricascanner://auth-callback
        const redirectUrl = LinkingExpo.createURL('auth-callback');

        // Open the backend page that initiates Google Auth
        const authUrl = `https://www.ticketafrica.shop/auth/mobile-google-signin?redirect_uri=${encodeURIComponent(redirectUrl)}`;

        await Linking.openURL(authUrl);
    };

    const handleSignUp = async () => {
        // Redirect to web signup with ref=scanner_app
        await Linking.openURL('https://www.ticketafrica.shop/auth/signup?ref=scanner_app');
    };

    const handleForgotPassword = async () => {
        await Linking.openURL('https://www.ticketafrica.shop/auth/forgot-password');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header with gradient background */}
                    <LinearGradient
                        colors={colors.gradients.primary as [string, string, ...string[]]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.header}
                    >
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/pulse-logo.jpeg')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                            <Text style={styles.logoText}>Ticket Africa</Text>
                            <Text style={styles.logoSubtext}>Scanner</Text>
                        </View>

                        <View style={styles.headerDecoration}>
                            <View style={styles.circle1} />
                            <View style={styles.circle2} />
                        </View>
                    </LinearGradient>

                    {/* Login Form */}
                    <View style={styles.formContainer}>
                        <View style={styles.formHeader}>
                            <Text style={styles.welcomeText}>Welcome Back</Text>
                            <Text style={styles.subtitleText}>
                                Sign in to scan tickets and manage your events
                            </Text>
                        </View>

                        {(formError || error) && (
                            <View style={styles.errorBanner}>
                                <Ionicons name="alert-circle" size={20} color={colors.error.main} />
                                <Text style={styles.errorBannerText}>{formError || error}</Text>
                            </View>
                        )}

                        <Input
                            label="Email Address"
                            placeholder="organizer@example.com"
                            leftIcon="mail-outline"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={email}
                            onChangeText={setEmail}
                        />

                        <Input
                            label="Password"
                            placeholder="Enter your password"
                            leftIcon="lock-closed-outline"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <Button
                            label={isLoading ? 'Signing in...' : 'Sign In'}
                            onPress={handleLogin}
                            loading={isLoading}
                            disabled={isLoading}
                        />

                        {/* <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <Button
                            label="Continue with Google"
                            variant="outline"
                            icon={
                                <Ionicons name="logo-google" size={20} color={colors.primary[500]} />
                            }
                            onPress={handleGoogleLogin}
                        /> */}

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={handleSignUp}>
                                <Text style={styles.signUpText}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Test App Section */}
                        <View style={styles.testAppContainer}>
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>DEMO ACCESS</Text>
                                <View style={styles.dividerLine} />
                            </View>
                            <Button
                                label="Try Demo Account"
                                variant="secondary"
                                icon={<Ionicons name="flask-outline" size={20} color={colors.primary[600]} />}
                                onPress={() => {
                                    // Auto-fill demo credentials
                                    setEmail('demo@ticketafrica.shop');
                                    setPassword('demo123');
                                    // Optional: Auto-submit after a short delay or let user click sign in
                                    // handleLogin();
                                }}
                            />
                            <Text style={styles.testAppHint}>
                                Tap to autofill demo credentials
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        height: height * 0.35,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: 'hidden',
    },
    logoContainer: {
        alignItems: 'center',
        zIndex: 1,
    },
    logoImage: {
        width: 100,
        height: 100,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        marginBottom: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    logoText: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    logoSubtext: {
        fontSize: typography.fontSize.lg,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.9)',
        marginTop: spacing.xs,
    },
    headerDecoration: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    circle1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    circle2: {
        position: 'absolute',
        bottom: -80,
        left: -40,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    formContainer: {
        flex: 1,
        padding: spacing['2xl'],
        marginTop: -spacing['2xl'],
    },
    formHeader: {
        marginBottom: spacing['2xl'],
    },
    welcomeText: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: '700',
        color: colors.slate[900],
        marginBottom: spacing.xs,
    },
    subtitleText: {
        fontSize: typography.fontSize.base,
        color: colors.slate[500],
        lineHeight: 22,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.error.light,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
    },
    errorBannerText: {
        color: colors.error.dark,
        fontSize: typography.fontSize.sm,
        marginLeft: spacing.sm,
        flex: 1,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: spacing.lg,
        marginTop: -spacing.sm,
    },
    forgotPasswordText: {
        color: colors.primary[500],
        fontSize: typography.fontSize.sm,
        fontWeight: '500',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.slate[200],
    },
    dividerText: {
        color: colors.slate[400],
        fontSize: typography.fontSize.sm,
        marginHorizontal: spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing['2xl'],
    },
    footerText: {
        color: colors.slate[500],
        fontSize: typography.fontSize.base,
    },
    signUpText: {
        color: colors.primary[500],
        fontSize: typography.fontSize.base,
        fontWeight: '600',
    },
    testAppContainer: {
        marginTop: spacing.xl,
    },
    testAppHint: {
        textAlign: 'center',
        marginTop: spacing.xs,
        fontSize: typography.fontSize.xs,
        color: colors.slate[400],
    },
});

export default LoginScreen;
