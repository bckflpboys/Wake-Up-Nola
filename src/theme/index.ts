/**
 * Wake Up Nola - Design System & Theme
 * Sleek, high-contrast dark & ambient theme with glowing accents
 */

export const colors = {
    // Brand Colors (Cyber Violet & Electric Iris)
    primary: {
        50: '#F5F3FF',
        100: '#EDE9FE',
        200: '#DDD6FE',
        300: '#C4B5FD',
        400: '#A78BFA',
        500: '#8B5CF6', // Main Vibrant Violet
        600: '#7C3AED',
        700: '#6D28D9',
        800: '#5B21B6',
        900: '#4C1D95',
        950: '#2E1065',
    },

    // Standby & Action Accent (Cyber Cyan & Teal)
    accent: {
        50: '#ECFEFF',
        100: '#CFFAFE',
        200: '#A5F3FC',
        300: '#67E8F9',
        400: '#22D3EE',
        500: '#06B6D4', // Vibrant Neon Cyan
        600: '#0891B2',
        700: '#0E7490',
        800: '#155E75',
        900: '#164E63',
    },

    // Standby Pulse Glow (Warm Amber / Solar)
    standby: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        200: '#FDE68A',
        300: '#FCD34D',
        400: '#FBBF24',
        500: '#F59E0B', // Glowing Standby Amber
        600: '#D97706',
        700: '#B45309',
        800: '#92400E',
        900: '#78350F',
    },

    // Neutral Colors (Deep Obsidian & Slate)
    slate: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        850: '#172033',
        900: '#0F172A',
        950: '#090D16', // Deep Space Background
    },

    // Semantic Colors
    success: {
        light: '#ECFDF5',
        main: '#10B981',
        dark: '#059669',
        glow: 'rgba(16, 185, 129, 0.25)',
    },
    error: {
        light: '#FEF2F2',
        main: '#F43F5E',
        dark: '#E11D48',
        glow: 'rgba(244, 63, 94, 0.25)',
    },
    warning: {
        light: '#FFFBEB',
        main: '#F59E0B',
        dark: '#D97706',
        glow: 'rgba(245, 158, 11, 0.25)',
    },
    info: {
        light: '#EFF6FF',
        main: '#38BDF8',
        dark: '#0284C7',
        glow: 'rgba(56, 189, 248, 0.25)',
    },

    // Backgrounds
    background: {
        primary: '#090D16', // Deepest Obsidian
        secondary: '#0F172A', // Card & Surface
        tertiary: '#1E293B', // Border / Elevated
        overlay: 'rgba(9, 13, 22, 0.85)',
        card: '#131C31',
        cardHover: '#1A2542',
    },

    // Text Colors
    text: {
        primary: '#F8FAFC',
        secondary: '#94A3B8',
        muted: '#64748B',
        inverse: '#090D16',
        accent: '#22D3EE',
        violet: '#A78BFA',
    },

    // Gradients
    gradients: {
        primary: ['#7C3AED', '#4F46E5'],
        cyanGlow: ['#06B6D4', '#3B82F6'],
        standby: ['#F59E0B', '#EC4899'],
        darkSurface: ['#131C31', '#0F172A'],
        subtleCard: ['#172033', '#0E1524'],
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
};

export const typography = {
    fontFamily: {
        regular: 'System',
        medium: 'System',
        semibold: 'System',
        bold: 'System',
    },
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
    },
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export const borderRadius = {
    none: 0,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    '2xl': 24,
    '3xl': 30,
    full: 9999,
};

export const shadows = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
        elevation: 8,
    },
    glowViolet: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 10,
    },
    glowCyan: {
        shadowColor: '#06B6D4',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 10,
    },
    glowAmber: {
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 20,
        elevation: 12,
    },
};

export const theme = {
    colors,
    spacing,
    typography,
    borderRadius,
    shadows,
};

export default theme;
