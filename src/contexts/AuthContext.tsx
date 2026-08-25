/**
 * Auth Context
 * Global authentication state management
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import authService, { AuthState } from '../services/auth';
import { UserProfile } from '../services/api';
import { initializeDatabase } from '../db/client';

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<boolean>;
    loginWithGoogle: (idToken: string) => Promise<boolean>;
    loginWithToken: (userData: any) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        error: null,
    });

    useEffect(() => {
        initAuth();
    }, []);

    const initAuth = async () => {
        try {
            // Initialize database first
            await initializeDatabase();

            // Then check auth state
            const authState = await authService.initialize();
            setState(authState);
        } catch (error) {
            console.error('Auth init error:', error);
            setState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                error: 'Failed to initialize',
            });
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const result = await authService.login(email, password);
        setState(result);

        return result.isAuthenticated;
    };

    const loginWithGoogle = async (idToken: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const result = await authService.loginWithGoogle(idToken);
        setState(result);

        return result.isAuthenticated;
    };

    const loginWithToken = async (userData: any): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const result = await authService.loginWithToken(userData);
        setState(result);

        return result.isAuthenticated;
    };

    const logout = async () => {
        setState(prev => ({ ...prev, isLoading: true }));
        await authService.logout();
        setState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            error: null,
        });
    };

    const refreshAuth = async () => {
        const authState = await authService.initialize();
        setState(authState);
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                loginWithGoogle,
                loginWithToken,
                logout,
                refreshAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
