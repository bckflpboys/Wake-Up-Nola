/**
 * API Service Layer
 * Handles all HTTP requests to the backend
 */

import { API_CONFIG, getHeaders } from '../config/api';

// Types for API responses
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    status: number;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: any;
}

export interface EventData {
    _id: string;
    title: string;
    description: string;
    date: string;
    endTime: string;
    location: string;
    images: string[];
    organizer: string;
    category: string;
    status: string;
    ticketTypes: Array<{
        name: string;
        price: number;
        quantity: number;
        quantitySold: number;
        link?: string;
    }>;
    scanners: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ScanResult {
    success: boolean;
    message: string;
    ticketType?: string; // Backend might return this at root level
    error?: string; // Backend might return error message
    ticketDetails?: {
        eventId: string;
        ticketType: string;
        scannedAt: string;
        scannedBy: string;
    };
    orderDetails?: {
        _id: string;
        userId: string;
        tickets: Array<{
            ticketType: string;
            quantity: number;
            isScanned: boolean;
            ticketId: string;
        }>;
        metadata?: {
            email?: string;
            name?: string;
        };
    };
}

export interface ScanHistoryItem {
    _id: string;
    ticketId: string;
    ticketType: string;
    quantity: number;
    price: number;
    scannedAt: string;
    scannedBy: string;
    eventId: string;
    eventTitle: string;
    scannerEmail: string;
    attendantEmail: string;
    orderNumber: string;
}

export interface AttendeeData {
    _id: string;
    userId: string;
    email: string;
    name: string;
    tickets: Array<{
        ticketType: string;
        quantity: number;
        isScanned: boolean;
    }>;
    paymentStatus: string;
    total: number;
    createdAt: string;
}

export interface ScannerData {
    email: string;
    addedAt: string;
    scansCount?: number;
}

class ApiService {
    private token: string | null = null;

    setToken(token: string | null) {
        this.token = token;
    }

    getToken() {
        return this.token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        console.log(`[API REQUEST] ${options.method || 'GET'} ${url}`);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

            const response = await fetch(url, {
                ...options,
                headers: getHeaders(this.token || undefined),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || data.message || 'Request failed',
                    status: response.status,
                };
            }

            return {
                success: true,
                data,
                status: response.status,
            };
        } catch (error: any) {
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Request timed out',
                    status: 408,
                };
            }

            return {
                success: false,
                error: error.message || 'Network error',
                status: 0,
            };
        }
    }

    // =========================================================================
    // AUTHENTICATION
    // =========================================================================

    async login(credentials: LoginCredentials): Promise<ApiResponse<UserProfile>> {
        const response = await this.request<UserProfile>(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        return response;
    }

    async googleLogin(idToken: string): Promise<ApiResponse<UserProfile>> {
        // Use a new endpoint for mobile google login
        const response = await this.request<UserProfile>('/auth/google-mobile', {
            method: 'POST',
            body: JSON.stringify({ idToken }),
        });

        return response;
    }

    async getProfile(): Promise<ApiResponse<UserProfile>> {
        return this.request<UserProfile>(API_CONFIG.ENDPOINTS.PROFILE);
    }

    async logout(): Promise<ApiResponse<void>> {
        const response = await this.request<void>(API_CONFIG.ENDPOINTS.LOGOUT, {
            method: 'POST',
        });
        this.token = null;
        return response;
    }

    // =========================================================================
    // EVENTS
    // =========================================================================

    async getScannerEvents(): Promise<ApiResponse<EventData[]>> {
        return this.request<EventData[]>(API_CONFIG.ENDPOINTS.SCANNER_EVENTS);
    }

    async getOrganizerEvents(): Promise<ApiResponse<EventData[]>> {
        return this.request<EventData[]>(API_CONFIG.ENDPOINTS.ORGANIZER_EVENTS);
    }

    async getEventDetails(eventId: string): Promise<ApiResponse<EventData>> {
        return this.request<EventData>(API_CONFIG.ENDPOINTS.EVENT_DETAILS(eventId));
    }

    // =========================================================================
    // TICKET SCANNING
    // =========================================================================

    async scanTicket(ticketId: string, eventId: string): Promise<ApiResponse<ScanResult>> {
        console.log('[API] Scanning ticket:', { ticketId, eventId });
        const response = await this.request<ScanResult>(API_CONFIG.ENDPOINTS.SCAN_TICKET, {
            method: 'POST',
            body: JSON.stringify({ ticketId, eventId }),
        });
        console.log('[API] Scan response:', JSON.stringify(response, null, 2));
        return response;
    }

    // =========================================================================
    // SCAN HISTORY
    // =========================================================================

    async getScanHistory(): Promise<ApiResponse<ScanHistoryItem[]>> {
        return this.request<ScanHistoryItem[]>(API_CONFIG.ENDPOINTS.SCANNER_HISTORY);
    }

    async getScannerStats(): Promise<ApiResponse<any>> {
        return this.request<any>(API_CONFIG.ENDPOINTS.SCANNER_STATS);
    }

    // =========================================================================
    // ATTENDEES
    // =========================================================================

    async getAttendees(eventId: string): Promise<ApiResponse<AttendeeData[]>> {
        return this.request<AttendeeData[]>(API_CONFIG.ENDPOINTS.EVENT_ATTENDEES(eventId));
    }

    // =========================================================================
    // SCANNERS MANAGEMENT
    // =========================================================================

    async getScannersForEvent(eventId: string): Promise<ApiResponse<ScannerData[]>> {
        return this.request<ScannerData[]>(`${API_CONFIG.ENDPOINTS.ORGANIZER_SCANNERS}?eventId=${eventId}`);
    }

    async addScanner(eventId: string, email: string): Promise<ApiResponse<any>> {
        return this.request<any>(API_CONFIG.ENDPOINTS.ORGANIZER_SCANNERS, {
            method: 'POST',
            body: JSON.stringify({ eventId, email }),
        });
    }

    async removeScanner(eventId: string, email: string): Promise<ApiResponse<any>> {
        return this.request<any>(API_CONFIG.ENDPOINTS.ORGANIZER_SCANNERS, {
            method: 'DELETE',
            body: JSON.stringify({ eventId, email }),
        });
    }

    // =========================================================================
    // ANALYTICS
    // =========================================================================

    async getAnalytics(eventId?: string): Promise<ApiResponse<any>> {
        const query = eventId ? `?eventId=${eventId}` : '';
        return this.request<any>(`${API_CONFIG.ENDPOINTS.ORGANIZER_ANALYTICS}${query}`);
    }

    async getTicketStats(eventId: string): Promise<ApiResponse<any>> {
        return this.request<any>(`${API_CONFIG.ENDPOINTS.ORGANIZER_TICKET_STATS}?eventId=${eventId}`);
    }

    // =========================================================================
    // OFFLINE PREPARATION
    // =========================================================================

    async getEventTickets(eventId: string): Promise<ApiResponse<any>> {
        return this.request<any>(`/organizer/events/${eventId}/tickets`);
    }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
