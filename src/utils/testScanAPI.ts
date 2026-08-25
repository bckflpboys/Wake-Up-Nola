/**
 * Test Scan API Utility
 * Use this to test different API formats and find the correct one
 */

import apiService from '../services/api';

export interface TestResult {
    success: boolean;
    format: string;
    response: any;
    error?: string;
}

/**
 * Test the scan API with different formats to find which one works
 */
export async function testScanFormats(
    qrCode: string,
    eventId: string,
    token: string
): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    // Set the token
    apiService.setToken(token);
    
    console.log('=== TESTING SCAN API FORMATS ===');
    console.log('QR Code:', qrCode);
    console.log('Event ID:', eventId);
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('================================\n');
    
    // Format 1: Standard format (current)
    try {
        console.log('Testing Format 1: { ticketId, eventId }');
        const response = await apiService.scanTicket(qrCode, eventId);
        results.push({
            success: response.success,
            format: 'Format 1: { ticketId, eventId }',
            response: response,
        });
        console.log('Format 1 Result:', response.success ? 'SUCCESS' : 'FAILED');
        console.log('Response:', JSON.stringify(response, null, 2));
    } catch (error: any) {
        results.push({
            success: false,
            format: 'Format 1: { ticketId, eventId }',
            response: null,
            error: error.message,
        });
        console.log('Format 1 Error:', error.message);
    }
    
    console.log('\n================================\n');
    
    // Format 2: Split orderId and paymentRef
    if (qrCode.includes('-')) {
        try {
            console.log('Testing Format 2: { orderId, paymentRef, eventId }');
            const [orderId, paymentRef] = qrCode.split('-');
            
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tickets/mobile-scan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ orderId, paymentRef, eventId }),
            });
            
            const data = await response.json();
            results.push({
                success: response.ok,
                format: 'Format 2: { orderId, paymentRef, eventId }',
                response: data,
            });
            console.log('Format 2 Result:', response.ok ? 'SUCCESS' : 'FAILED');
            console.log('Response:', JSON.stringify(data, null, 2));
        } catch (error: any) {
            results.push({
                success: false,
                format: 'Format 2: { orderId, paymentRef, eventId }',
                response: null,
                error: error.message,
            });
            console.log('Format 2 Error:', error.message);
        }
        
        console.log('\n================================\n');
    }
    
    // Format 3: qrCode instead of ticketId
    try {
        console.log('Testing Format 3: { qrCode, eventId }');
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tickets/mobile-scan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ qrCode, eventId }),
        });
        
        const data = await response.json();
        results.push({
            success: response.ok,
            format: 'Format 3: { qrCode, eventId }',
            response: data,
        });
        console.log('Format 3 Result:', response.ok ? 'SUCCESS' : 'FAILED');
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error: any) {
        results.push({
            success: false,
            format: 'Format 3: { qrCode, eventId }',
            response: null,
            error: error.message,
        });
        console.log('Format 3 Error:', error.message);
    }
    
    console.log('\n================================\n');
    
    // Format 4: Alternative endpoint /scanner/scan
    try {
        console.log('Testing Format 4: /scanner/scan endpoint');
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/scanner/scan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ ticketId: qrCode, eventId }),
        });
        
        const data = await response.json();
        results.push({
            success: response.ok,
            format: 'Format 4: /scanner/scan endpoint',
            response: data,
        });
        console.log('Format 4 Result:', response.ok ? 'SUCCESS' : 'FAILED');
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error: any) {
        results.push({
            success: false,
            format: 'Format 4: /scanner/scan endpoint',
            response: null,
            error: error.message,
        });
        console.log('Format 4 Error:', error.message);
    }
    
    console.log('\n=== TEST COMPLETE ===');
    console.log('Successful formats:');
    results.forEach(r => {
        if (r.success) {
            console.log('✓', r.format);
        }
    });
    
    return results;
}

/**
 * Quick test function you can call from the app
 * Usage: import { quickScanTest } from './utils/testScanAPI';
 *        await quickScanTest('TICKET123-PAY456', 'event_id', 'your_token');
 */
export async function quickScanTest(
    qrCode: string,
    eventId: string,
    token: string
): Promise<void> {
    const results = await testScanFormats(qrCode, eventId, token);
    
    const successfulFormat = results.find(r => r.success);
    if (successfulFormat) {
        console.log('\n✅ WORKING FORMAT FOUND:');
        console.log(successfulFormat.format);
        console.log('\nResponse structure:');
        console.log(JSON.stringify(successfulFormat.response, null, 2));
    } else {
        console.log('\n❌ NO WORKING FORMAT FOUND');
        console.log('All formats failed. Check:');
        console.log('1. Is the backend running?');
        console.log('2. Is the API URL correct?');
        console.log('3. Is the token valid?');
        console.log('4. Does the ticket exist in the backend?');
    }
}
