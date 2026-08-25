// API Configuration
// Change this to your production URL when deploying

// For local development on Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, localhost works fine
// For physical device, use your computer's IP address

export const API_CONFIG = {
    // Base URL for your backend API
    // Development: Use your local IP or ngrok URL
    // Production: Use your Vercel/production URL
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',

    // Alternative for Android emulator: 'http://10.0.2.2:3000/api'
    // Alternative for physical device: 'http://192.168.x.x:3000/api' (use your local IP)

    // Timeout in milliseconds
    TIMEOUT: 30000,

    // API Endpoints
    ENDPOINTS: {
        // Auth
        LOGIN: '/auth/mobile-login',
        SIGNUP: '/auth/signup',
        LOGOUT: '/auth/signout',
        PROFILE: '/profile',

        // Scanner-specific endpoints
        SCANNER_EVENTS: '/scanner/events',
        SCANNER_HISTORY: '/scanner/history',
        SCANNER_STATS: '/scanner/stats',

        // Ticket operations
        SCAN_TICKET: '/tickets/mobile-scan',

        // Organizer endpoints
        ORGANIZER_EVENTS: '/organizer/mobile-events',
        ORGANIZER_SCANNERS: '/organizer/scanners',
        ORGANIZER_ATTENDEES: '/organizer/attendees',
        ORGANIZER_ANALYTICS: '/organizer/analytics',
        ORGANIZER_TICKET_STATS: '/organizer/ticket-stats',

        // Event specific
        EVENT_DETAILS: (id: string) => `/events/${id}`,
        EVENT_ATTENDEES: (id: string) => `/organizer/attendees?eventId=${id}`,
    },
};

// Headers configuration
export const getHeaders = (token?: string) => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};
