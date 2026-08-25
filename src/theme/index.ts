/**
 * Wake Up Nola - Design System & Theme
 * Premium, airy, modern light-canvas aesthetic.
 * Pixel-perfect borders, subtle micro-shadows, and deliberate hierarchy.
 */

export const colors = {
    // Primary Background Canvas
    background: {
        canvas: '#F4F7FB',       // Crisp, airy soft-blue background
        primary: '#F4F7FB',      // Alias
        surface: '#FFFFFF',      // Pure white card surfaces
        card: '#FFFFFF',         // Alias
        surfaceSubtle: '#F8FAFC',// Secondary card / row fill
        surfaceElevated: '#FFFFFF',
        overlay: 'rgba(15, 23, 42, 0.4)',
        input: '#FFFFFF',
    },

    // Brand Colors
    primary: {
        50: '#F0F7FF',
        100: '#E0EFFF',
        200: '#BAE0FF',
        300: '#7CC4FA',
        400: '#38A5F4',
        500: '#0284C7', // Electric Ocean Cyan
        600: '#0369A1',
        700: '#075985',
        800: '#0C4A6E',
        900: '#082F49',
    },

    // Accent Teal & Emerald
    accent: {
        50: '#F0FDFA',
        100: '#CCFBF1',
        200: '#99F6E4',
        300: '#5EEAD4',
        400: '#2DD4BF',
        500: '#0D9488', // Vibrant Mint Teal
        600: '#0F766E',
        700: '#115E59',
    },

    // Standby Amber Glow
    standby: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        200: '#FDE68A',
        300: '#FCD34D',
        400: '#FBBF24',
        500: '#D97706',
        600: '#B45309',
        700: '#92400E',
        800: '#78350F',
    },

    // Typography & Slate Colors
    text: {
        primary: '#0F172A',   // Deep Obsidian Navy
        secondary: '#475569', // Balanced Slate
        muted: '#64748B',     // Soft Description Grey
        subtle: '#94A3B8',    // Micro hints & timestamps
        inverse: '#FFFFFF',
        accent: '#0284C7',
        teal: '#0D9488',
    },

    slate: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0', // Main Card & Divider Border
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A',
        950: '#020617',
    },

    // Colorful Action Chips (Dark background with vibrant white text)
    chips: {
        emerald: { bg: '#064E3B', text: '#FFFFFF', border: '#047857' },
        navy: { bg: '#0C4A6E', text: '#FFFFFF', border: '#0369A1' },
        teal: { bg: '#0F766E', text: '#FFFFFF', border: '#0D9488' },
        amber: { bg: '#78350F', text: '#FFFFFF', border: '#B45309' },
        violet: { bg: '#4C1D95', text: '#FFFFFF', border: '#6D28D9' },
        cyan: { bg: '#006064', text: '#FFFFFF', border: '#00838F' },
    },

    // Semantics
    success: {
        light: '#ECFDF5',
        main: '#059669',
        dark: '#047857',
        border: '#A7F3D0',
    },
    error: {
        light: '#FEF2F2',
        main: '#E11D48',
        dark: '#BE123C',
        border: '#FECDD3',
    },
    warning: {
        light: '#FFFBEB',
        main: '#D97706',
        dark: '#B45309',
        border: '#FDE68A',
    },
    info: {
        light: '#F0F7FF',
        main: '#0284C7',
        dark: '#0369A1',
        border: '#BAE6FD',
    },
    gradients: {
        primary: ['#0284C7', '#0369A1'],
        cyanGlow: ['#06B6D4', '#0284C7'],
        cardSurface: ['#FFFFFF', '#F8FAFC'],
        lightBg: ['#F1F6FB', '#E5EFF9'],
        emeraldTag: ['#064E3B', '#047857'],
        violetTag: ['#4C1D95', '#6D28D9'],
        amberTag: ['#78350F', '#B45309'],
        navyTag: ['#0C4A6E', '#0369A1'],
        orb: ['#1E293B', '#0F172A'],
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
        '2xs': 10,
        xs: 12,
        sm: 13.5,
        base: 15,
        md: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 28,
        '4xl': 34,
    },
    letterSpacing: {
        tight: -0.4,
        normal: 0,
        wide: 0.5,
        wider: 1.0,
    },
};

export const borderRadius = {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 26,
    '3xl': 32,
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
    subtle: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    sm: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    card: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    md: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    lg: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.09,
        shadowRadius: 16,
        elevation: 6,
    },
    float: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.09,
        shadowRadius: 16,
        elevation: 6,
    },
    glowBlue: {
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
        elevation: 5,
    },
    glowAmber: {
        shadowColor: '#D97706',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
        elevation: 5,
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
