

export const MOCK_EVENTS = [
    {
        id: 'mock-event-1',
        title: 'Summer Music Festival 2026',
        description: 'The biggest music festival of the summer featuring top artists from around the globe.',
        date: new Date('2026-12-15').toISOString(),
        location: 'Cape Town Stadium, South Africa',
        images: JSON.stringify(['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80']),
        organizerId: 'demo-organizer',
        status: 'active',
        totalTickets: 5000,
        ticketsSold: 4500,
        ticketsScanned: 1250,
        revenue: 2500000,
        ticketTypes: JSON.stringify([
            { id: 't1', name: 'General Access', price: 500, quantity: 4000, quantitySold: 3800 },
            { id: 't2', name: 'VIP', price: 1500, quantity: 1000, quantitySold: 700 }
        ])
    },
    {
        id: 'mock-event-2',
        title: 'Tech Startup Summit',
        description: 'Networking and workshops for the next generation of African tech unicorns.',
        date: new Date('2026-03-20').toISOString(),
        location: 'Sandton Convention Centre, JHB',
        images: JSON.stringify(['https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop']),
        organizerId: 'demo-organizer',
        status: 'active',
        totalTickets: 800,
        ticketsSold: 650,
        ticketsScanned: 0,
        revenue: 325000,
        ticketTypes: JSON.stringify([
            { id: 't3', name: 'Early Bird', price: 400, quantity: 200, quantitySold: 200 },
            { id: 't4', name: 'Standard', price: 600, quantity: 600, quantitySold: 450 }
        ])
    },
    {
        id: 'mock-event-3',
        title: 'Jazz & Wine Evening',
        description: 'A relaxed evening of smooth jazz and fine wines.',
        date: new Date('2025-11-05').toISOString(),
        location: 'Kimberley Vineyards',
        images: JSON.stringify(['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1000&auto=format&fit=crop']),
        organizerId: 'demo-organizer',
        status: 'completed',
        totalTickets: 200,
        ticketsSold: 200,
        ticketsScanned: 198,
        revenue: 100000,
        ticketTypes: JSON.stringify([
            { id: 't5', name: 'Entry', price: 500, quantity: 200, quantitySold: 200 }
        ])
    }
];

export const MOCK_TICKETS = [
    {
        ticketId: 'DEMO-TICKET-001',
        eventId: 'mock-event-1',
        orderId: 'DEMO-ORDER-001',
        ticketType: 'General Access',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        status: 'valid',
        price: 500
    },
    {
        ticketId: 'DEMO-TICKET-002',
        eventId: 'mock-event-1',
        orderId: 'DEMO-ORDER-002',
        ticketType: 'VIP',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        status: 'valid',
        price: 1500
    },
    {
        ticketId: 'DEMO-TICKET-USED',
        eventId: 'mock-event-1',
        orderId: 'DEMO-ORDER-003',
        ticketType: 'General Access',
        customerName: 'Used Ticket User',
        customerEmail: 'used@example.com',
        status: 'scanned',
        scannedAt: new Date().toISOString(),
        price: 500
    }
];
