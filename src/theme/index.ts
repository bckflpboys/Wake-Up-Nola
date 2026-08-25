/**
 * Wake Up Nola - Design System & Theme
 * Modern, airy light-blueish aesthetic with crisp white cards, deep navy text,
 * and vibrant dark-colorful accent pills (inspired by VoxCode UI).
 */

export const colors = {
    // Primary Backgrounds (Airy White-Light Blueish)
    background: {
        primary: '#EEF4FA', // Soft Light-Blue Background
        secondary: '#E2ECF7', // Slightly Deeper Surface
        tertiary: '#D7E4F2', // Elevated Borders
        card: '#FFFFFF', // Crisp Clean White Card
        cardSubtle: 'rgba(255, 255, 255, 0.75)',
        cardHover: '#F8FAFC',
        overlay: 'rgba(15, 23, 42, 0.45)',
        input: '#FFFFFF',
    },

    // Brand Colors (Cyber Cyan & Electric Blue)
    primary: {
        50: '#F0F7FF',
        100: '#E0EFFF',
        200: '#BAE0FF',
        300: '#7CC4FA',
        400: '#38A5F4',
        500: '#0284C7', // Electric Deep Cyan
        600: '#0369A1',
        700: '#075985',
        800: '#0C4A6E',
        900: '#082F49',
    },

    // Accent Colors
    accent: {
        50: '#F0FDFA',
        100: '#CCFBF1',
        200: '#99F6E4',
        300: '#5EEAD4',
        400: '#2DD4BF',
        500: '#0D9488', // Vibrant Teal
        600: '#0F766E',
        700: '#115E59',
        800: '#134E4A',
        900: '#042F2E',
    },

    // Standby & Solar Glow
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

    // Text & Neutral Hierarchy (Deep Navy / Slate)
    text: {
        primary: '#090D16', // Bold Deep Navy
        secondary: '#334155', // Slate Grey
        muted: '#64748B', // Soft Muted Blue-Grey
        light: '#94A3B8',
        inverse: '#FFFFFF',
        accent: '#0284C7',
        teal: '#0D9488',
        violet: '#6D28D9',
    },

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
        900: '#0F172A',
        950: '#020617',
    },

    // Vibrant Colorful Accent Pills (For quick action tags)
    tags: {
        emeraldBg: '#064E3B',
        emeraldText: '#FFFFFF',
        navyBg: '#0C4A6E',
        navyText: '#FFFFFF',
        tealBg: '#0F766E',
        tealText: '#FFFFFF',
        amberBg: '#78350F',
        amberText: '#FFFFFF',
        violetBg: '#4C1D95',
        violetText: '#FFFFFF',
        cyanBg: '#00838F',
        cyanText: '#FFFFFF',
    },

    // Semantic Colors
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
        light: '#EFF6FF',
        main: '#0284C7',
        dark: '#0369A1',
        border: '#BAE6FD',
    },

    // Gradients
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
    '2xl': 22,
    '3xl': 28,
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
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    sm: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.09,
        shadowRadius: 10,
        elevation: 4,
    },
    lg: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 8,
    },
    glowBlue: {
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 6,
    },
    glowAmber: {
        shadowColor: '#D97706',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 6,
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
