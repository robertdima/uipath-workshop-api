/**
 * ITSM Console - Mock Data
 * Seeded data for demo scenarios
 */

const ITSMData = {
    // Current user context
    currentUser: {
        id: 'USR-001',
        username: 'tech.support',
        name: 'Alex Thompson',
        role: 'Technician',
        team: 'Service Desk',
        email: 'alex.thompson@acme.com'
    },

    // Teams
    teams: [
        { id: 'TEAM-001', name: 'Service Desk', description: 'First-line support', members: ['USR-001', 'USR-002', 'USR-007'] },
        { id: 'TEAM-002', name: 'Network Team', description: 'Network infrastructure support', members: ['USR-003'] },
        { id: 'TEAM-003', name: 'Application Support', description: 'Application and software support', members: ['USR-004'] },
        { id: 'TEAM-004', name: 'Server Team', description: 'Server and infrastructure', members: ['USR-005'] },
        { id: 'TEAM-005', name: 'Identity Team', description: 'Identity and access management', members: ['USR-006'] },
        { id: 'TEAM-006', name: 'Release Team', description: 'Deployment and release management', members: ['USR-004', 'USR-005'] }
    ],

    // Technicians
    technicians: [
        { id: 'USR-001', name: 'Alex Thompson', email: 'alex.thompson@acme.com', team: 'Service Desk', skills: ['Hardware', 'Email', 'General'], avatar: '👨‍💻', workload: 4 },
        { id: 'USR-002', name: 'Maria Garcia', email: 'maria.garcia@acme.com', team: 'Service Desk', skills: ['Application', 'Email', 'Mobile'], avatar: '👩‍💻', workload: 3 },
        { id: 'USR-003', name: 'James Chen', email: 'james.chen@acme.com', team: 'Network Team', skills: ['Network', 'VPN', 'Firewall'], avatar: '👨‍💻', workload: 2 },
        { id: 'USR-004', name: 'Sarah Miller', email: 'sarah.miller@acme.com', team: 'Application Support', skills: ['CRM', 'ERP', '.NET'], avatar: '👩‍💻', workload: 2 },
        { id: 'USR-005', name: 'Michael Brown', email: 'michael.brown@acme.com', team: 'Server Team', skills: ['Windows Server', 'Linux', 'Virtualization'], avatar: '👨‍💻', workload: 3 },
        { id: 'USR-006', name: 'Emily Davis', email: 'emily.davis@acme.com', team: 'Identity Team', skills: ['Active Directory', 'MFA', 'SSO'], avatar: '👩‍💻', workload: 1 },
        { id: 'USR-007', name: 'Robert Wilson', email: 'robert.wilson@acme.com', team: 'Service Desk', skills: ['Hardware', 'Printer', 'General'], avatar: '👨‍💻', workload: 5 }
    ],

    // Customers / Contacts
    customers: [
        {
            id: 'CUST-001',
            email: 'john.smith@acme.com',
            name: 'John Smith',
            phone: '+1-555-0123',
            department: 'Sales',
            location: 'Building A, Floor 2',
            manager: 'jane.doe@acme.com',
            vip: false,
            preferredContact: 'email',
            recentTickets: ['INC-001']
        },
        {
            id: 'CUST-002',
            email: 'mary.jones@acme.com',
            name: 'Mary Jones',
            phone: '+1-555-0124',
            department: 'Sales',
            location: 'Building A, Floor 2',
            manager: 'jane.doe@acme.com',
            vip: true,
            preferredContact: 'phone',
            recentTickets: ['INC-002']
        },
        {
            id: 'CUST-003',
            email: 'david.wilson@acme.com',
            name: 'David Wilson',
            phone: '+1-555-0125',
            department: 'Marketing',
            location: 'Building B, Floor 1',
            manager: 'tom.baker@acme.com',
            vip: false,
            preferredContact: 'email',
            recentTickets: ['INC-003']
        },
        {
            id: 'CUST-004',
            email: 'sarah.chen@acme.com',
            name: 'Sarah Chen',
            phone: '+1-555-0126',
            department: 'Finance',
            location: 'Building A, Floor 3',
            manager: 'lisa.wong@acme.com',
            vip: true,
            preferredContact: 'phone',
            recentTickets: ['INC-004']
        },
        {
            id: 'CUST-005',
            email: 'jane.doe@acme.com',
            name: 'Jane Doe',
            phone: '+1-555-0127',
            department: 'Sales',
            location: 'Building A, Floor 2',
            manager: 'ceo@acme.com',
            vip: true,
            preferredContact: 'email',
            recentTickets: []
        },
        {
            id: 'CUST-006',
            email: 'tom.baker@acme.com',
            name: 'Tom Baker',
            phone: '+1-555-0128',
            department: 'Marketing',
            location: 'Building B, Floor 1',
            manager: 'ceo@acme.com',
            vip: false,
            preferredContact: 'email',
            recentTickets: []
        },
        {
            id: 'CUST-007',
            email: 'lisa.wong@acme.com',
            name: 'Lisa Wong',
            phone: '+1-555-0129',
            department: 'Finance',
            location: 'Building A, Floor 3',
            manager: 'cfo@acme.com',
            vip: true,
            preferredContact: 'phone',
            recentTickets: []
        }
    ],

    // Notifications
    notifications: [
        {
            id: 'NOTIF-001',
            type: 'sla-warning',
            title: 'SLA Warning',
            message: 'INC-002 is at risk of breaching SLA',
            link: 'INC-002',
            timestamp: '2025-02-13T10:30:00Z',
            read: false
        },
        {
            id: 'NOTIF-002',
            type: 'assignment',
            title: 'New Assignment',
            message: 'INC-001 has been assigned to you',
            link: 'INC-001',
            timestamp: '2025-02-13T08:35:00Z',
            read: true
        },
        {
            id: 'NOTIF-003',
            type: 'cab-approval',
            title: 'CAB Approval Needed',
            message: 'CHG-457 requires CAB approval',
            link: 'CHG-457',
            timestamp: '2025-02-13T09:05:00Z',
            read: false
        },
        {
            id: 'NOTIF-004',
            type: 'change-scheduled',
            title: 'Change Scheduled Today',
            message: 'CHG-458 is scheduled for tonight',
            link: 'CHG-458',
            timestamp: '2025-02-13T08:00:00Z',
            read: false
        }
    ],

    // Problems
    problems: [
        {
            id: 'PRB-001',
            title: 'Recurring VPN disconnections across multiple users',
            description: 'Multiple users reporting VPN drops every 15-20 minutes. Appears to be related to certificate validation or keep-alive settings.',
            status: 'Under Investigation',
            priority: 'P2',
            category: 'Network',
            rootCause: null,
            workaround: 'Increase keep-alive interval to 30 seconds in VPN client settings',
            linkedIncidents: ['INC-001'],
            affectedAssets: ['VPN-SERVER-01'],
            assignedTo: 'Network Team',
            assignee: 'james.chen@acme.com',
            createdAt: '2025-02-13T09:00:00Z',
            updatedAt: '2025-02-13T10:00:00Z'
        },
        {
            id: 'PRB-002',
            title: 'CRM application instability after .NET update',
            description: 'CRM application crashes with ntdll.dll errors following recent Windows updates. Affects multiple users.',
            status: 'Known Error',
            priority: 'P1',
            category: 'Application',
            rootCause: 'Incompatibility between CRM v3.2.0 and .NET Framework 4.8.1 update KB5034123',
            workaround: 'Rollback .NET update KB5034123 or wait for CRM hotfix',
            linkedIncidents: ['INC-002'],
            affectedAssets: ['CRM-SERVER-01', 'CRM-SERVER-02'],
            assignedTo: 'Application Support',
            assignee: 'sarah.miller@acme.com',
            createdAt: '2025-02-13T08:00:00Z',
            updatedAt: '2025-02-13T10:30:00Z'
        }
    ],

    // Service Catalog Items
    catalogItems: [
        {
            id: 'CAT-001',
            name: 'New Laptop Request',
            category: 'Hardware',
            description: 'Request a new laptop for a new hire or replacement',
            icon: '💻',
            approvalRequired: true,
            fulfillmentTime: '5 business days',
            cost: '$1,200 - $2,500',
            fields: [
                { name: 'employee_name', label: 'Employee Name', type: 'text', required: true },
                { name: 'department', label: 'Department', type: 'select', options: ['Sales', 'Marketing', 'Finance', 'Engineering', 'HR'], required: true },
                { name: 'laptop_type', label: 'Laptop Type', type: 'select', options: ['Standard', 'Developer', 'Executive'], required: true },
                { name: 'justification', label: 'Business Justification', type: 'textarea', required: true }
            ]
        },
        {
            id: 'CAT-002',
            name: 'Software Installation',
            category: 'Software',
            description: 'Request installation of approved software',
            icon: '📦',
            approvalRequired: false,
            fulfillmentTime: '1 business day',
            cost: 'Varies',
            fields: [
                { name: 'software_name', label: 'Software Name', type: 'text', required: true },
                { name: 'version', label: 'Version (if specific)', type: 'text', required: false },
                { name: 'asset_id', label: 'Target Computer Asset ID', type: 'text', required: true },
                { name: 'reason', label: 'Business Reason', type: 'textarea', required: true }
            ]
        },
        {
            id: 'CAT-003',
            name: 'VPN Access Request',
            category: 'Access',
            description: 'Request VPN access for remote work',
            icon: '🔐',
            approvalRequired: true,
            fulfillmentTime: '2 business days',
            cost: 'No cost',
            fields: [
                { name: 'employee_email', label: 'Employee Email', type: 'email', required: true },
                { name: 'start_date', label: 'Access Start Date', type: 'date', required: true },
                { name: 'end_date', label: 'Access End Date (if temporary)', type: 'date', required: false },
                { name: 'manager_approval', label: 'Manager Email for Approval', type: 'email', required: true }
            ]
        },
        {
            id: 'CAT-004',
            name: 'New User Account',
            category: 'Access',
            description: 'Create accounts for a new employee',
            icon: '👤',
            approvalRequired: true,
            fulfillmentTime: '1 business day',
            cost: 'No cost',
            fields: [
                { name: 'first_name', label: 'First Name', type: 'text', required: true },
                { name: 'last_name', label: 'Last Name', type: 'text', required: true },
                { name: 'department', label: 'Department', type: 'select', options: ['Sales', 'Marketing', 'Finance', 'Engineering', 'HR'], required: true },
                { name: 'manager', label: 'Manager Email', type: 'email', required: true },
                { name: 'start_date', label: 'Start Date', type: 'date', required: true }
            ]
        },
        {
            id: 'CAT-005',
            name: 'Password Reset',
            category: 'Access',
            description: 'Reset password for locked account',
            icon: '🔑',
            approvalRequired: false,
            fulfillmentTime: '15 minutes',
            cost: 'No cost',
            fields: [
                { name: 'username', label: 'Username', type: 'text', required: true },
                { name: 'verification', label: 'Verification Question Answer', type: 'text', required: true }
            ]
        }
    ],

    // Service Requests
    serviceRequests: [
        {
            id: 'REQ-001',
            catalogItem: 'CAT-001',
            requestedBy: 'jane.doe@acme.com',
            requestedFor: 'new.hire@acme.com',
            status: 'Pending Approval',
            priority: 'Normal',
            formData: {
                employee_name: 'New Hire Employee',
                department: 'Sales',
                laptop_type: 'Standard',
                justification: 'New sales representative starting on Monday'
            },
            approver: 'lisa.wong@acme.com',
            assignedTo: null,
            createdAt: '2025-02-13T09:30:00Z',
            updatedAt: '2025-02-13T09:30:00Z'
        },
        {
            id: 'REQ-002',
            catalogItem: 'CAT-003',
            requestedBy: 'david.wilson@acme.com',
            requestedFor: 'david.wilson@acme.com',
            status: 'Approved',
            priority: 'Normal',
            formData: {
                employee_email: 'david.wilson@acme.com',
                start_date: '2025-02-14',
                end_date: null,
                manager_approval: 'tom.baker@acme.com'
            },
            approver: 'tom.baker@acme.com',
            assignedTo: 'Identity Team',
            createdAt: '2025-02-12T14:00:00Z',
            updatedAt: '2025-02-13T08:00:00Z'
        }
    ],

    // Incidents
    incidents: [
        {
            id: 'INC-001',
            // Short description and details
            summary: 'VPN connection drops frequently',
            description: 'User reports VPN disconnects every 15-20 minutes. Started after recent Windows update. Error log attached.',
            // Caller Information (who the incident is for)
            caller: 'CUST-001',
            callerName: 'John Smith',
            callerEmail: 'john.smith@acme.com',
            callerPhone: '+1-555-0123',
            callerDepartment: 'Sales',
            callerLocation: 'Building A, Floor 2',
            callerVip: false,
            // Opened By (who created the ticket - may differ from caller)
            openedBy: 'tech.support',
            openedByName: 'Alex Thompson',
            // Contact method
            contactType: 'phone',
            // Classification
            category: 'Network',
            subcategory: 'VPN',
            // Impact & Urgency
            impact: 3, // 1=High, 2=Medium, 3=Low
            urgency: 2, // 1=High, 2=Medium, 3=Low
            priority: 'P2',
            // Business Service
            businessService: 'VPN / Remote Access',
            // Status
            status: 'Open',
            // Assignment
            assignmentGroup: 'Network Team',
            assignedTo: 'Network Team',
            assignee: 'tech.support',
            assigneeName: 'Alex Thompson',
            // Configuration Item
            configurationItem: 'LAPTOP-JS-001',
            affectedAsset: 'LAPTOP-JS-001',
            // Reporter (legacy field)
            reporter: 'john.smith@acme.com',
            // Timestamps
            createdAt: '2025-02-13T08:30:00Z',
            updatedAt: '2025-02-13T09:15:00Z',
            slaTarget: '2025-02-13T16:30:00Z',
            // Watch list
            watchList: ['james.chen@acme.com'],
            // Additional comments notify
            additionalCommentsNotify: ['john.smith@acme.com'],
            // Work notes notify
            workNotesNotify: ['james.chen@acme.com', 'network.manager@acme.com'],
            attachments: [
                { name: 'vpn_error.log', type: 'log', size: '24KB' },
                { name: 'event_viewer.png', type: 'screenshot', size: '156KB' }
            ],
            notes: [
                { type: 'customer', visibility: 'customer-visible', author: 'john.smith@acme.com', content: 'This is really affecting my productivity. Need urgent help!', timestamp: '2025-02-13T08:30:00Z' },
                { type: 'system', visibility: 'technicians-only', author: 'System', content: 'Ticket created and assigned to Network Team', timestamp: '2025-02-13T08:30:00Z' },
                { type: 'internal', visibility: 'technicians-only', author: 'tech.support', content: 'Reviewing error log. Looks like certificate validation issue.', timestamp: '2025-02-13T09:15:00Z' }
            ],
            linkedKB: ['KB-101'],
            linkedProblems: ['PRB-001'],
            linkedChanges: []
        },
        {
            id: 'INC-002',
            summary: 'Application crash - ntdll.dll error',
            description: 'CRM application crashes on startup with ntdll.dll access violation. Multiple users affected.',
            // Caller Information
            caller: 'CUST-002',
            callerName: 'Mary Jones',
            callerEmail: 'mary.jones@acme.com',
            callerPhone: '+1-555-0124',
            callerDepartment: 'Sales',
            callerLocation: 'Building A, Floor 2',
            callerVip: true,
            // Opened By
            openedBy: 'app.admin',
            openedByName: 'Sarah Miller',
            contactType: 'phone',
            // Classification
            category: 'Application',
            subcategory: 'CRM',
            impact: 1, // High - multiple users affected
            urgency: 1, // High - business critical
            priority: 'P1',
            businessService: 'CRM Application',
            status: 'In Progress',
            assignmentGroup: 'Application Support',
            assignedTo: 'Application Support',
            assignee: 'app.admin',
            assigneeName: 'Sarah Miller',
            configurationItem: 'CRM-SERVER-01',
            affectedAsset: 'CRM-SERVER-01',
            reporter: 'mary.jones@acme.com',
            createdAt: '2025-02-13T07:45:00Z',
            updatedAt: '2025-02-13T10:30:00Z',
            slaTarget: '2025-02-13T11:45:00Z',
            watchList: ['sales.manager@acme.com', 'it.manager@acme.com'],
            additionalCommentsNotify: ['mary.jones@acme.com'],
            workNotesNotify: ['app.admin@acme.com'],
            attachments: [
                { name: 'crash_dump.dmp', type: 'dump', size: '2.4MB' },
                { name: 'app_crash.log', type: 'log', size: '89KB' }
            ],
            notes: [
                { type: 'customer', visibility: 'customer-visible', author: 'mary.jones@acme.com', content: 'Cannot access CRM at all. This is blocking all sales activities!', timestamp: '2025-02-13T07:45:00Z' },
                { type: 'system', visibility: 'technicians-only', author: 'System', content: 'Priority escalated to P1 due to business impact', timestamp: '2025-02-13T08:00:00Z' },
                { type: 'internal', visibility: 'technicians-only', author: 'app.admin', content: 'Identified issue with recent .NET update. Preparing rollback.', timestamp: '2025-02-13T10:30:00Z' }
            ],
            linkedKB: ['KB-112'],
            linkedProblems: ['PRB-002'],
            linkedChanges: ['CHG-456']
        },
        {
            id: 'INC-003',
            summary: 'Email not syncing on mobile device',
            description: 'Outlook app on iPhone not syncing emails since yesterday. Already tried removing and re-adding account.',
            // Caller Information
            caller: 'CUST-003',
            callerName: 'David Wilson',
            callerEmail: 'david.wilson@acme.com',
            callerPhone: '+1-555-0125',
            callerDepartment: 'Marketing',
            callerLocation: 'Building B, Floor 1',
            callerVip: false,
            openedBy: 'tech.support',
            openedByName: 'Alex Thompson',
            contactType: 'self-service',
            category: 'Email',
            subcategory: 'Mobile',
            impact: 3,
            urgency: 3,
            priority: 'P3',
            businessService: 'Email Services',
            status: 'Pending',
            pendingState: {
                type: 'customer',
                reason: 'Awaiting screenshot of error message from user',
                expectedDate: '2025-02-14',
                reminderEnabled: true,
                reminderSent: false
            },
            assignmentGroup: 'Service Desk',
            assignedTo: 'Service Desk',
            assignee: 'tech.support',
            assigneeName: 'Alex Thompson',
            configurationItem: 'MOBILE-DW-001',
            affectedAsset: 'MOBILE-DW-001',
            reporter: 'david.wilson@acme.com',
            createdAt: '2025-02-12T16:20:00Z',
            updatedAt: '2025-02-13T08:00:00Z',
            slaTarget: '2025-02-14T16:20:00Z',
            watchList: [],
            additionalCommentsNotify: ['david.wilson@acme.com'],
            workNotesNotify: [],
            attachments: [],
            notes: [
                { type: 'customer', visibility: 'customer-visible', author: 'david.wilson@acme.com', content: 'Getting "Cannot connect to server" error', timestamp: '2025-02-12T16:20:00Z' },
                { type: 'internal', visibility: 'technicians-only', author: 'tech.support', content: 'Requested screenshot of error. Awaiting response.', timestamp: '2025-02-12T17:00:00Z' }
            ],
            linkedKB: [],
            linkedProblems: [],
            linkedChanges: []
        },
        {
            id: 'INC-004',
            summary: 'Printer paper jam - 3rd floor',
            description: 'HP LaserJet on 3rd floor showing persistent paper jam error. Already cleared visible paper.',
            // Caller Information
            caller: 'CUST-004',
            callerName: 'Sarah Chen',
            callerEmail: 'sarah.chen@acme.com',
            callerPhone: '+1-555-0126',
            callerDepartment: 'Finance',
            callerLocation: 'Building A, Floor 3',
            callerVip: true,
            openedBy: 'sarah.chen@acme.com',
            openedByName: 'Sarah Chen',
            contactType: 'walk-in',
            category: 'Hardware',
            subcategory: 'Printer',
            impact: 2,
            urgency: 3,
            priority: 'P4',
            businessService: 'Print Services',
            status: 'New',
            assignmentGroup: 'Service Desk',
            assignedTo: 'Service Desk',
            assignee: null,
            assigneeName: null,
            configurationItem: 'PRINTER-3F-001',
            affectedAsset: 'PRINTER-3F-001',
            reporter: 'sarah.chen@acme.com',
            createdAt: '2025-02-13T10:45:00Z',
            updatedAt: '2025-02-13T10:45:00Z',
            slaTarget: '2025-02-15T10:45:00Z',
            watchList: [],
            additionalCommentsNotify: ['sarah.chen@acme.com'],
            workNotesNotify: [],
            attachments: [
                { name: 'printer_display.jpg', type: 'screenshot', size: '340KB' }
            ],
            notes: [],
            linkedKB: ['KB-203'],
            linkedProblems: [],
            linkedChanges: []
        },
        {
            id: 'INC-005',
            summary: 'Server high CPU - WEBSRV-03',
            description: 'Monitoring alert: WEBSRV-03 showing 94% CPU utilization for past 2 hours. Website response times degraded.',
            // Caller Information (auto-generated from monitoring)
            caller: null,
            callerName: 'Monitoring System',
            callerEmail: 'monitoring@acme.com',
            callerPhone: null,
            callerDepartment: 'IT Operations',
            callerLocation: 'Data Center',
            callerVip: false,
            openedBy: 'monitoring',
            openedByName: 'Monitoring System',
            contactType: 'monitoring',
            category: 'Infrastructure',
            subcategory: 'Server',
            impact: 2,
            urgency: 2,
            priority: 'P2',
            businessService: 'Web Applications',
            status: 'Open',
            assignmentGroup: 'Server Team',
            assignedTo: 'Server Team',
            assignee: 'server.admin',
            assigneeName: 'Michael Brown',
            configurationItem: 'WEBSRV-03',
            affectedAsset: 'WEBSRV-03',
            reporter: 'monitoring@acme.com',
            createdAt: '2025-02-13T06:00:00Z',
            updatedAt: '2025-02-13T09:45:00Z',
            slaTarget: '2025-02-13T14:00:00Z',
            watchList: ['it.manager@acme.com'],
            additionalCommentsNotify: [],
            workNotesNotify: ['server.admin@acme.com', 'it.manager@acme.com'],
            attachments: [
                { name: 'cpu_metrics.png', type: 'screenshot', size: '89KB' },
                { name: 'process_list.txt', type: 'log', size: '12KB' }
            ],
            notes: [
                { type: 'system', visibility: 'technicians-only', author: 'Monitoring', content: 'Auto-generated incident from CPU threshold alert', timestamp: '2025-02-13T06:00:00Z' },
                { type: 'internal', visibility: 'technicians-only', author: 'server.admin', content: 'Investigating. Correlated with deployment CHG-456 this morning.', timestamp: '2025-02-13T09:45:00Z' }
            ],
            linkedKB: ['KB-512'],
            linkedProblems: [],
            linkedChanges: ['CHG-456']
        },
        {
            id: 'INC-006',
            summary: 'Password reset not working',
            description: 'Self-service password reset portal shows "service unavailable" error.',
            // Caller Information
            caller: null,
            callerName: 'Multiple Users',
            callerEmail: 'helpdesk@acme.com',
            callerPhone: null,
            callerDepartment: 'Multiple',
            callerLocation: 'Enterprise-wide',
            callerVip: false,
            openedBy: 'id.admin',
            openedByName: 'Emily Davis',
            contactType: 'email',
            category: 'Identity',
            subcategory: 'Password',
            impact: 1, // Enterprise-wide
            urgency: 2,
            priority: 'P2',
            businessService: 'Active Directory',
            status: 'Resolved',
            assignmentGroup: 'Identity Team',
            assignedTo: 'Identity Team',
            assignee: 'id.admin',
            assigneeName: 'Emily Davis',
            configurationItem: 'SSPR-SERVER',
            affectedAsset: 'SSPR-SERVER',
            reporter: 'multiple',
            createdAt: '2025-02-12T14:00:00Z',
            updatedAt: '2025-02-12T15:30:00Z',
            slaTarget: '2025-02-12T22:00:00Z',
            resolvedAt: '2025-02-12T15:30:00Z',
            resolutionCode: 'Fixed',
            resolutionNotes: 'Service was down due to certificate expiration. Renewed cert and restarted service.',
            watchList: [],
            additionalCommentsNotify: [],
            workNotesNotify: ['id.admin@acme.com'],
            attachments: [],
            notes: [
                { type: 'internal', visibility: 'technicians-only', author: 'id.admin', content: 'Service was down due to certificate expiration. Renewed cert and restarted service.', timestamp: '2025-02-12T15:30:00Z' },
                { type: 'system', visibility: 'technicians-only', author: 'System', content: 'Incident resolved. Resolution time: 1h 30m', timestamp: '2025-02-12T15:30:00Z' }
            ],
            linkedKB: [],
            linkedProblems: [],
            linkedChanges: []
        }
    ],

    // Knowledge Base Articles (for Context Grounding)
    knowledgeArticles: [
        {
            id: 'KB-101',
            title: 'VPN Troubleshooting Guide',
            category: 'Network',
            applicability: ['Windows 10', 'Windows 11'],
            status: 'Published',
            author: 'network.admin',
            createdAt: '2024-06-15',
            updatedAt: '2025-01-20',
            views: 1247,
            helpful: 89,
            content: `
# VPN Troubleshooting Guide

## Overview
This guide covers common VPN connectivity issues and their resolutions.

## Common Issues

### Issue 1: Frequent Disconnections
**Symptoms:** VPN drops every 15-20 minutes
**Cause:** Usually related to certificate validation or keep-alive settings

**Resolution Steps:**
1. Open VPN client settings
2. Navigate to Advanced > Connection
3. Increase keep-alive interval to 30 seconds
4. Disable "Disconnect on idle"
5. Restart VPN service

### Issue 2: Certificate Validation Error
**Symptoms:** "Certificate validation failed" error
**Cause:** Expired or untrusted certificate

**Resolution Steps:**
1. Check certificate expiration date
2. If expired, contact IT for certificate renewal
3. Ensure system date/time is correct
4. Clear certificate cache: certutil -urlcache * delete

### Issue 3: DNS Resolution Failure
**Symptoms:** Connected but cannot reach internal resources
**Cause:** DNS settings not applied correctly

**Resolution Steps:**
1. Flush DNS: ipconfig /flushdns
2. Verify DNS servers in VPN adapter
3. Test with nslookup internal.acme.com
            `,
            tags: ['VPN', 'Network', 'Connectivity', 'Certificate'],
            prerequisites: ['VPN Client installed', 'Valid credentials'],
            automationId: 'vpn-troubleshoot-01'
        },
        {
            id: 'KB-112',
            title: 'Application Crash - ntdll.dll Access Violation',
            category: 'Application',
            applicability: ['Windows 10', 'Windows 11', '.NET Applications'],
            status: 'Published',
            author: 'app.admin',
            createdAt: '2024-09-10',
            updatedAt: '2025-02-01',
            views: 523,
            helpful: 67,
            content: `
# Application Crash - ntdll.dll Access Violation

## Overview
ntdll.dll access violations typically indicate memory corruption or compatibility issues.

## Diagnostic Steps

### Step 1: Collect Crash Dump
1. Open Event Viewer
2. Navigate to Windows Logs > Application
3. Find the crash event (Error level)
4. Note the faulting module and offset

### Step 2: Identify Root Cause
Common causes:
- Incompatible .NET Framework update
- Corrupted application files
- Memory issues
- Third-party DLL conflicts

### Step 3: Resolution

#### Option A: .NET Framework Rollback
1. Open Control Panel > Programs
2. View installed updates
3. Uninstall recent .NET updates
4. Restart system

#### Option B: Application Repair
1. Open Settings > Apps
2. Find the affected application
3. Click Modify > Repair
4. Follow repair wizard

#### Option C: Clean Reinstall
1. Backup application data
2. Uninstall application completely
3. Delete remaining folders in Program Files
4. Reinstall from original source
            `,
            tags: ['Crash', 'ntdll', 'Application', '.NET'],
            prerequisites: ['Admin rights', 'Installation media'],
            automationId: 'app-crash-remediation-01'
        },
        {
            id: 'KB-203',
            title: 'Printer Driver Installation and Troubleshooting',
            category: 'Hardware',
            applicability: ['HP LaserJet', 'Windows'],
            status: 'Published',
            author: 'hardware.support',
            createdAt: '2024-03-20',
            updatedAt: '2024-11-15',
            views: 892,
            helpful: 156,
            content: `
# Printer Driver Installation and Troubleshooting

## Paper Jam Resolution

### Step 1: Power Cycle
1. Turn off printer
2. Unplug power cord
3. Wait 30 seconds
4. Reconnect and power on

### Step 2: Clear Paper Path
1. Open all access doors
2. Remove any visible paper
3. Check for small torn pieces
4. Check rollers for debris

### Step 3: Reset Paper Sensors
1. Remove paper tray
2. Clean paper sensors with dry cloth
3. Reinsert tray firmly
4. Run test print
            `,
            tags: ['Printer', 'Hardware', 'Paper Jam', 'Driver'],
            prerequisites: [],
            automationId: null
        },
        {
            id: 'KB-512',
            title: 'High CPU Troubleshooting - Windows Server',
            category: 'Infrastructure',
            applicability: ['Windows Server 2019', 'Windows Server 2022'],
            status: 'Published',
            author: 'server.admin',
            createdAt: '2024-07-01',
            updatedAt: '2025-01-10',
            views: 445,
            helpful: 78,
            content: `
# High CPU Troubleshooting - Windows Server

## Initial Assessment

### Step 1: Identify Top Processes
\`\`\`powershell
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10
\`\`\`

### Step 2: Check Recent Changes
1. Review Change Management for recent deployments
2. Check Windows Update history
3. Review scheduled tasks

### Step 3: Mitigation Options

#### Temporary: Restart Offending Service
\`\`\`powershell
Restart-Service -Name "ServiceName" -Force
\`\`\`

#### If Related to Deployment: Rollback
Contact Change Management for rollback procedure.

#### If Memory Leak: Schedule Restart
Coordinate maintenance window for server restart.
            `,
            tags: ['Server', 'CPU', 'Performance', 'Windows Server'],
            prerequisites: ['Server admin access', 'Change approval if rollback needed'],
            automationId: 'server-cpu-remediation-01'
        }
    ],

    // Change Requests
    changes: [
        {
            id: 'CHG-456',
            title: 'Deploy CRM Update v3.2.1',
            description: 'Deploy latest CRM application update including security patches and performance improvements.',
            type: 'Standard',
            status: 'Implemented',
            risk: 'Medium',
            priority: 'Normal',
            category: 'Application',
            subcategory: 'Deployment',
            // Requester Info
            requestedBy: 'sarah.miller@acme.com',
            requesterName: 'Sarah Miller',
            requesterEmail: 'sarah.miller@acme.com',
            requesterPhone: '+1-555-0130',
            requesterDept: 'Application Support',
            requestedFor: 'sarah.miller@acme.com',
            // Assignment
            assignedTo: 'Release Team',
            assignee: 'sarah.miller@acme.com',
            implementer: 'michael.brown@acme.com',
            // Impact
            impact: 2,
            affectedUsers: 'department',
            affectedServices: ['CRM Application'],
            affectedAssets: ['CRM-SERVER-01', 'CRM-SERVER-02'],
            outageRequired: true,
            outageDuration: 30,
            // Planning
            justification: 'Critical security patches and performance improvements required for CRM stability.',
            implementationPlan: '1. Backup current CRM database and files\n2. Stop CRM services on both servers\n3. Deploy update package to CRM-SERVER-01\n4. Run database migration scripts\n5. Start services and verify\n6. Deploy to CRM-SERVER-02\n7. Verify load balancing',
            testPlan: 'Verify login functionality, test key workflows (create contact, create opportunity, generate report)',
            rollbackPlan: 'Restore from backup taken at 05:45. Contact DBA for database rollback if needed.',
            relatedIncident: 'PRB-002',
            policyReference: null,
            // Schedule
            scheduledStart: '2025-02-13T06:00:00Z',
            scheduledEnd: '2025-02-13T08:00:00Z',
            changeWindow: 'maintenance',
            actualStart: '2025-02-13T06:00:00Z',
            actualEnd: '2025-02-13T07:45:00Z',
            // Approval
            cabRequired: false,
            cabApproval: null,
            // Communication
            notifyRecipients: ['affected-users', 'service-owners'],
            communicationNotes: 'Users notified via email 24 hours prior',
            createdAt: '2025-02-10T14:00:00Z',
            notes: [
                { timestamp: '2025-02-13T07:45:00Z', author: 'michael.brown@acme.com', content: 'Deployment completed successfully. All tests passed.' },
                { timestamp: '2025-02-13T06:00:00Z', author: 'michael.brown@acme.com', content: 'Starting deployment. Backup completed.' }
            ]
        },
        {
            id: 'CHG-457',
            title: 'Restart Payment Gateway Service',
            description: 'Scheduled restart of payment gateway service to apply memory configuration changes.',
            type: 'Normal',
            status: 'Pending Approval',
            risk: 'High',
            priority: 'Normal',
            category: 'Infrastructure',
            subcategory: 'Configuration',
            // Requester Info
            requestedBy: 'lisa.wong@acme.com',
            requesterName: 'Lisa Wong',
            requesterEmail: 'lisa.wong@acme.com',
            requesterPhone: '+1-555-0129',
            requesterDept: 'Finance',
            requestedFor: 'lisa.wong@acme.com',
            // Assignment
            assignedTo: 'Server Team',
            assignee: 'michael.brown@acme.com',
            implementer: 'michael.brown@acme.com',
            // Impact
            impact: 1,
            affectedUsers: 'all',
            affectedServices: ['Payment Gateway'],
            affectedAssets: ['PAYMENT-GW-01'],
            outageRequired: true,
            outageDuration: 15,
            // Planning
            justification: 'Payment gateway experiencing memory issues causing intermittent failures. Memory configuration optimization required.',
            implementationPlan: '1. Notify finance team of upcoming outage\n2. Stop payment gateway service\n3. Apply memory configuration changes\n4. Start service and verify\n5. Run test transactions\n6. Confirm with finance team',
            testPlan: 'Run 5 test transactions of different types. Verify memory utilization is within expected range.',
            rollbackPlan: 'If service fails to start, restore previous configuration from /backup/payment-gw/',
            relatedIncident: null,
            policyReference: 'POL-SEC-201',
            // Schedule
            scheduledStart: '2025-02-14T22:00:00Z',
            scheduledEnd: '2025-02-14T22:30:00Z',
            changeWindow: 'maintenance',
            actualStart: null,
            actualEnd: null,
            // Approval
            cabRequired: true,
            cabApproval: null,
            // Communication
            notifyRecipients: ['affected-users', 'management', 'service-owners'],
            communicationNotes: 'Finance team and executives must be notified due to payment processing impact',
            createdAt: '2025-02-13T09:00:00Z',
            notes: []
        },
        {
            id: 'CHG-458',
            title: 'Network Switch Firmware Update - Building B',
            description: 'Update firmware on Building B network switches to address security vulnerability CVE-2025-1234.',
            type: 'Emergency',
            status: 'Scheduled',
            risk: 'High',
            priority: 'High',
            category: 'Security',
            subcategory: 'Vulnerability Patch',
            // Requester Info
            requestedBy: 'emily.davis@acme.com',
            requesterName: 'Emily Davis',
            requesterEmail: 'emily.davis@acme.com',
            requesterPhone: '+1-555-0131',
            requesterDept: 'Security',
            requestedFor: 'emily.davis@acme.com',
            // Assignment
            assignedTo: 'Network Team',
            assignee: 'james.chen@acme.com',
            implementer: 'james.chen@acme.com',
            // Impact
            impact: 2,
            affectedUsers: 'department',
            affectedServices: ['Network Infrastructure'],
            affectedAssets: ['SW-BLDGB-01', 'SW-BLDGB-02', 'SW-BLDGB-03'],
            outageRequired: true,
            outageDuration: 60,
            // Planning
            justification: 'Critical security vulnerability CVE-2025-1234 discovered in switch firmware. Rated CVSS 9.1. Must patch within 72 hours per security policy.',
            implementationPlan: '1. Download firmware from vendor portal\n2. Backup current switch configurations\n3. Update SW-BLDGB-01 (core switch)\n4. Verify connectivity and routing\n5. Update SW-BLDGB-02 (core switch)\n6. Verify failover functioning\n7. Update SW-BLDGB-03 (access switch)\n8. Final verification and documentation',
            testPlan: 'Verify all VLANs accessible, test inter-VLAN routing, confirm spanning tree convergence, ping tests to critical hosts',
            rollbackPlan: 'Firmware can be rolled back via console connection. Contact vendor support if needed.',
            relatedIncident: null,
            policyReference: 'POL-SEC-305',
            // Schedule
            scheduledStart: '2025-02-13T23:00:00Z',
            scheduledEnd: '2025-02-14T02:00:00Z',
            changeWindow: 'emergency',
            actualStart: null,
            actualEnd: null,
            // Approval
            cabRequired: true,
            cabApproval: '2025-02-13T11:00:00Z',
            // Communication
            notifyRecipients: ['affected-users', 'management', 'helpdesk'],
            communicationNotes: 'Building B users notified of potential brief network interruptions. Helpdesk briefed on possible tickets.',
            createdAt: '2025-02-13T08:00:00Z',
            notes: [
                { timestamp: '2025-02-13T11:00:00Z', author: 'CAB', content: 'Emergency change approved by CAB due to critical security vulnerability.' }
            ]
        }
    ],

    // Assets / CMDB
    assets: [
        { id: 'LAPTOP-JS-001', name: 'John Smith Laptop', type: 'Workstation', status: 'Active', owner: 'john.smith@acme.com', location: 'Building A, Floor 2', os: 'Windows 11', lastSeen: '2025-02-13T10:00:00Z' },
        { id: 'CRM-SERVER-01', name: 'CRM Primary Server', type: 'Server', status: 'Active', owner: 'IT Operations', location: 'Data Center 1', os: 'Windows Server 2022', lastSeen: '2025-02-13T10:00:00Z' },
        { id: 'CRM-SERVER-02', name: 'CRM Secondary Server', type: 'Server', status: 'Active', owner: 'IT Operations', location: 'Data Center 2', os: 'Windows Server 2022', lastSeen: '2025-02-13T10:00:00Z' },
        { id: 'WEBSRV-03', name: 'Web Server 03', type: 'Server', status: 'Warning', owner: 'IT Operations', location: 'Data Center 1', os: 'Windows Server 2022', lastSeen: '2025-02-13T10:00:00Z' },
        { id: 'PAYMENT-GW-01', name: 'Payment Gateway Server', type: 'Server', status: 'Active', owner: 'Finance IT', location: 'Data Center 1 - Secure Zone', os: 'Red Hat Enterprise Linux 8', lastSeen: '2025-02-13T10:00:00Z' },
        { id: 'PRINTER-3F-001', name: 'HP LaserJet 3rd Floor', type: 'Printer', status: 'Error', owner: 'Facilities', location: 'Building A, Floor 3', os: 'N/A', lastSeen: '2025-02-13T10:45:00Z' },
        { id: 'MOBILE-DW-001', name: 'David Wilson iPhone', type: 'Mobile', status: 'Active', owner: 'david.wilson@acme.com', location: 'N/A', os: 'iOS 17', lastSeen: '2025-02-12T16:20:00Z' },
        { id: 'SW-BLDGB-01', name: 'Building B Core Switch 1', type: 'Network', status: 'Active', owner: 'Network Team', location: 'Building B, MDF', os: 'Cisco IOS 15.2', lastSeen: '2025-02-13T10:00:00Z' },
        { id: 'SW-BLDGB-02', name: 'Building B Core Switch 2', type: 'Network', status: 'Active', owner: 'Network Team', location: 'Building B, MDF', os: 'Cisco IOS 15.2', lastSeen: '2025-02-13T10:00:00Z' },
        { id: 'SW-BLDGB-03', name: 'Building B Access Switch', type: 'Network', status: 'Active', owner: 'Network Team', location: 'Building B, IDF-1', os: 'Cisco IOS 15.2', lastSeen: '2025-02-13T10:00:00Z' }
    ],

    // Policies (for Context Grounding by CAS)
    policies: [
        {
            id: 'POL-SEC-201',
            title: 'Change Management Policy',
            category: 'Security',
            effectiveDate: '2024-01-01',
            version: '2.1',
            sections: [
                {
                    number: '3.2',
                    title: 'Core Financial Services',
                    content: 'Any restart, modification, or maintenance activity affecting core financial services (including Payment Gateway, Billing System, and Financial Reporting) during business hours (08:00-18:00 local time) requires Change Advisory Board (CAB) approval. Emergency changes must be documented within 24 hours.'
                },
                {
                    number: '3.3',
                    title: 'Standard Changes',
                    content: 'Pre-approved standard changes may be implemented without CAB approval provided they follow the documented procedure and are logged in the Change Management system.'
                }
            ]
        },
        {
            id: 'POL-SEC-305',
            title: 'Security Incident Response Policy',
            category: 'Security',
            effectiveDate: '2024-03-15',
            version: '1.3',
            sections: [
                {
                    number: '2.1',
                    title: 'Critical Vulnerability Response',
                    content: 'Critical vulnerabilities (CVSS 9.0+) affecting production systems must be remediated within 72 hours. Emergency changes for critical security patches are pre-approved but must be documented.'
                }
            ]
        },
        {
            id: 'POL-OPS-101',
            title: 'Maintenance Windows Policy',
            category: 'Operations',
            effectiveDate: '2024-02-01',
            version: '1.0',
            sections: [
                {
                    number: '1.1',
                    title: 'Scheduled Maintenance Windows',
                    content: 'Standard maintenance windows are: Weekdays 22:00-06:00, Weekends 00:00-08:00. Changes outside these windows require additional approval.'
                }
            ]
        }
    ],

    // Audit Log
    auditLog: [
        { timestamp: '2025-02-13T10:45:00Z', actor: 'sarah.chen@acme.com', action: 'Incident Created', target: 'INC-004', details: 'New incident created via portal' },
        { timestamp: '2025-02-13T10:30:00Z', actor: 'app.admin', action: 'Incident Updated', target: 'INC-002', details: 'Added work note' },
        { timestamp: '2025-02-13T09:45:00Z', actor: 'server.admin', action: 'Incident Updated', target: 'INC-005', details: 'Added correlation with CHG-456' },
        { timestamp: '2025-02-13T09:15:00Z', actor: 'tech.support', action: 'Incident Updated', target: 'INC-001', details: 'Added work note' },
        { timestamp: '2025-02-13T09:00:00Z', actor: 'finance.admin', action: 'Change Created', target: 'CHG-457', details: 'New change request requiring CAB approval' },
        { timestamp: '2025-02-13T08:00:00Z', actor: 'security.team', action: 'Change Created', target: 'CHG-458', details: 'Emergency change for security vulnerability' }
    ],

    // Dashboard Statistics
    dashboardStats: {
        incidents: {
            total: 6,
            open: 3,
            inProgress: 1,
            pending: 1,
            resolved: 1,
            byPriority: { P1: 1, P2: 2, P3: 1, P4: 1 },
            avgResolutionTime: '4.2 hours',
            slaCompliance: 87
        },
        changes: {
            total: 3,
            pending: 1,
            scheduled: 1,
            implemented: 1,
            successRate: 95
        },
        assets: {
            total: 10,
            active: 8,
            warning: 1,
            error: 1
        }
    }
};

// Export for use in app.js
window.ITSMData = ITSMData;
