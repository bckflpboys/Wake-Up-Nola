/**
 * Authentication Service
 * Handles login, logout, session management, and token storage
 */

import * as SecureStore from 'expo-secure-store';
import { db, clearDatabase } from '../db/client';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import apiService, { UserProfile } from './api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: UserProfile | null;
    error: string | null;
}

class AuthService {
    private currentUser: UserProfile | null = null;

    /**
     * Login with an existing token (e.g., from deep link)
     */
    /**
     * Login with an existing token and user profile (e.g., from deep link)
     */
    async loginWithToken(userData: any): Promise<AuthState> {
        try {
            const token = userData.token || userData.id; // Fallback to ID if token is missing

            // Set token
            apiService.setToken(token);

            // TRUST the data from the deep link since it came from our verified backend
            const user: UserProfile = {
                id: userData.id,
                email: userData.email,
                name: userData.name || '',
                role: userData.role || 'organizer',
                avatar: userData.avatar || '',
            };

            this.currentUser = user;

            // Store credentials securely
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

            // Update local DB
            try {
                await db.insert(users).values({
                    id: user.id,
                    email: user.email,
                    name: user.name || '',
                    role: user.role || 'organizer',
                    avatar: user.avatar || '',
                    token: token,
                    isLoggedIn: true,
                    lastSyncAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }).onConflictDoUpdate({
                    target: users.id,
                    set: {
                        email: user.email,
                        name: user.name || '',
                        role: user.role || 'organizer',
                        avatar: user.avatar || '',
                        token: token,
                        isLoggedIn: true,
                        lastSyncAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                });
            } catch (dbError) {
                console.warn('Failed to store user in local DB:', dbError);
            }

            return {
                isAuthenticated: true,
                isLoading: false,
                user,
                error: null,
            };
        } catch (error: any) {
            console.error('Token login error:', error);
            apiService.setToken(null);
            return {
                isAuthenticated: false,
                isLoading: false,
                user: null,
                error: error.message || 'Failed to login with token',
            };
        }
    }

    /**
     * Initialize auth state from stored token
     */
    async initialize(): Promise<AuthState> {
        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            const userJson = await SecureStore.getItemAsync(USER_KEY);

            if (token && userJson) {
                const user = JSON.parse(userJson) as UserProfile;
                apiService.setToken(token);
                this.currentUser = user;

                // TRUST LOCAL DATA FOR DEMO (Bypassing session check)
                return {
                    isAuthenticated: true,
                    isLoading: false,
                    user: this.currentUser,
                    error: null,
                };
            }

            return {
                isAuthenticated: false,
                isLoading: false,
                user: null,
                error: null,
            };
        } catch (error) {
            console.error('Auth initialization error:', error);
            return {
                isAuthenticated: false,
                isLoading: false,
                user: null,
                error: 'Failed to initialize authentication',
            };
        }
    }

    /**
     * Login with email and password
     */
    async login(email: string, password: string): Promise<AuthState> {
        try {
            // Check for Demo Account
            if (email === 'demo@ticketafrica.shop' && password === 'demo123') {
                const demoUser: UserProfile = {
                    id: 'demo-user-id',
                    email: 'demo@ticketafrica.shop',
                    name: 'Demo Organizer',
                    role: 'organizer',
                    avatar: require('../../assets/acedemo.jpeg'), // Local asset for demo
                };
                const demoToken = 'demo-token-12345';

                // Store credentials securely
                await SecureStore.setItemAsync(TOKEN_KEY, demoToken);
                await SecureStore.setItemAsync(USER_KEY, JSON.stringify(demoUser));

                // Set token in API service
                apiService.setToken(demoToken);
                this.currentUser = demoUser;

                // Store user in local database
                try {
                    await db.insert(users).values({
                        id: demoUser.id,
                        email: demoUser.email,
                        name: demoUser.name || '',
                        role: demoUser.role || 'organizer',
                        avatar: demoUser.avatar || '',
                        token: demoToken,
                        isLoggedIn: true,
                        lastSyncAt: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }).onConflictDoUpdate({
                        target: users.id,
                        set: {
                            email: demoUser.email,
                            name: demoUser.name || '',
                            role: demoUser.role || 'organizer',
                            avatar: demoUser.avatar || '',
                            token: demoToken,
                            isLoggedIn: true,
                            lastSyncAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        },
                    });
                } catch (dbError) {
                    console.warn('Failed to store demo user in local DB:', dbError);
                }

                return {
                    isAuthenticated: true,
                    isLoading: false,
                    user: demoUser,
                    error: null,
                };
            }

            const response = await apiService.login({ email, password });


            if (!response.success || !response.data) {
                return {
                    isAuthenticated: false,
                    isLoading: false,
                    user: null,
                    error: response.error || 'Login failed',
                };
            }

            const user = response.data;
            const token = (response.data as any).token || '';

            // Store credentials securely
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

            // Set token in API service
            apiService.setToken(token);
            this.currentUser = user;

            // Store user in local database
            try {
                await db.insert(users).values({
                    id: user.id,
                    email: user.email,
                    name: user.name || '',
                    role: user.role || 'organizer',
                    avatar: user.avatar || '',
                    token: token,
                    isLoggedIn: true,
                    lastSyncAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }).onConflictDoUpdate({
                    target: users.id,
                    set: {
                        email: user.email,
                        name: user.name || '',
                        role: user.role || 'organizer',
                        avatar: user.avatar || '',
                        token: token,
                        isLoggedIn: true,
                        lastSyncAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                });
            } catch (dbError) {
                console.warn('Failed to store user in local DB:', dbError);
            }

            return {
                isAuthenticated: true,
                isLoading: false,
                user,
                error: null,
            };
        } catch (error: any) {
            console.error('Login error:', error);
            return {
                isAuthenticated: false,
                isLoading: false,
                user: null,
                error: error.message || 'An error occurred during login',
            };
        }
    }

    /**
     * Login with Google
     */
    async loginWithGoogle(idToken: string): Promise<AuthState> {
        try {
            const response = await apiService.googleLogin(idToken);

            if (!response.success || !response.data) {
                return {
                    isAuthenticated: false,
                    isLoading: false,
                    user: null,
                    error: response.error || 'Google login failed',
                };
            }

            const user = response.data;
            const token = (response.data as any).token || '';

            // Store credentials securely
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

            // Set token in API service
            apiService.setToken(token);
            this.currentUser = user;

            // Store user in local database
            try {
                await db.insert(users).values({
                    id: user.id,
                    email: user.email,
                    name: user.name || '',
                    role: user.role || 'organizer',
                    avatar: user.avatar || '',
                    token: token,
                    isLoggedIn: true,
                    lastSyncAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }).onConflictDoUpdate({
                    target: users.id,
                    set: {
                        email: user.email,
                        name: user.name || '',
                        role: user.role || 'organizer',
                        avatar: user.avatar || '',
                        token: token,
                        isLoggedIn: true,
                        lastSyncAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                });
            } catch (dbError) {
                console.warn('Failed to store user in local DB:', dbError);
            }

            return {
                isAuthenticated: true,
                isLoading: false,
                user,
                error: null,
            };
        } catch (error: any) {
            console.error('Google login error:', error);
            return {
                isAuthenticated: false,
                isLoading: false,
                user: null,
                error: error.message || 'An error occurred during Google login',
            };
        }
    }

    /**
     * Logout and clear all stored data
     */
    async logout(): Promise<void> {
        try {
            // Call logout API
            await apiService.logout();
        } catch (error) {
            console.warn('Logout API call failed:', error);
        }

        // Clear secure storage
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);

        // Clear API token
        apiService.setToken(null);
        this.currentUser = null;

        // Clear local database
        await clearDatabase();
    }

    /**
     * Get current user
     */
    getCurrentUser(): UserProfile | null {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return this.currentUser !== null;
    }

    /**
     * Get stored token
     */
    async getToken(): Promise<string | null> {
        return SecureStore.getItemAsync(TOKEN_KEY);
    }

    /**
     * Check if user has organizer role
     */
    isOrganizer(): boolean {
        return this.currentUser?.role === 'organizer' || this.currentUser?.role === 'admin';
    }

    /**
     * Check if user can scan tickets
     */
    canScan(): boolean {
        const role = this.currentUser?.role;
        return role === 'organizer' || role === 'scanner' || role === 'admin';
    }
}

export const authService = new AuthService();
export default authService;
