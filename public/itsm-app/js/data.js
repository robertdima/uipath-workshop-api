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
        { id: 'CAT-001', name: 'New Laptop Request', category: 'Hardware', description: 'Request a new laptop for a new hire or replacement', icon: 'desktop', approvalRequired: true, fulfillmentTime: '5 business days', cost: '$1,200 - $2,500', fields: [
            { name: 'employee_name', label: 'Employee Name', type: 'text', required: true },
            { name: 'department', label: 'Department', type: 'select', options: ['Sales', 'Marketing', 'Finance', 'Engineering', 'HR', 'IT', 'Operations'], required: true },
            { name: 'laptop_type', label: 'Laptop Type', type: 'select', options: ['Standard', 'Developer', 'Executive'], required: true },
            { name: 'justification', label: 'Business Justification', type: 'textarea', required: true }
        ]},
        { id: 'CAT-002', name: 'Software Installation', category: 'Software', description: 'Request installation of approved software', icon: 'download', approvalRequired: false, fulfillmentTime: '1 business day', cost: 'Varies', fields: [
            { name: 'software_name', label: 'Software Name', type: 'text', required: true },
            { name: 'version', label: 'Version (if specific)', type: 'text', required: false },
            { name: 'asset_id', label: 'Target Computer Asset ID', type: 'text', required: true },
            { name: 'reason', label: 'Business Reason', type: 'textarea', required: true }
        ]},
        { id: 'CAT-003', name: 'VPN Access Request', category: 'Access', description: 'Request VPN access for remote work', icon: 'key', approvalRequired: true, fulfillmentTime: '2 business days', cost: 'No cost', fields: [
            { name: 'employee_email', label: 'Employee Email', type: 'email', required: true },
            { name: 'start_date', label: 'Access Start Date', type: 'date', required: true },
            { name: 'end_date', label: 'Access End Date (if temporary)', type: 'date', required: false },
            { name: 'manager_approval', label: 'Manager Email for Approval', type: 'email', required: true }
        ]},
        { id: 'CAT-004', name: 'New User Account', category: 'Access', description: 'Create accounts for a new employee', icon: 'user', approvalRequired: true, fulfillmentTime: '1 business day', cost: 'No cost', fields: [
            { name: 'first_name', label: 'First Name', type: 'text', required: true },
            { name: 'last_name', label: 'Last Name', type: 'text', required: true },
            { name: 'department', label: 'Department', type: 'select', options: ['Sales', 'Marketing', 'Finance', 'Engineering', 'HR', 'IT', 'Operations'], required: true },
            { name: 'manager', label: 'Manager Email', type: 'email', required: true },
            { name: 'start_date', label: 'Start Date', type: 'date', required: true }
        ]},
        { id: 'CAT-005', name: 'Password Reset', category: 'Access', description: 'Reset password for locked account', icon: 'key', approvalRequired: false, fulfillmentTime: '15 minutes', cost: 'No cost', fields: [
            { name: 'username', label: 'Username', type: 'text', required: true },
            { name: 'verification', label: 'Verification Question Answer', type: 'text', required: true }
        ]},
        { id: 'CAT-006', name: 'New Monitor/Peripheral', category: 'Hardware', description: 'Request a new monitor, keyboard, mouse, headset, or docking station', icon: 'desktop', approvalRequired: true, fulfillmentTime: '3 business days', cost: '$100 - $800', fields: [
            { name: 'employee_name', label: 'Employee Name', type: 'text', required: true },
            { name: 'department', label: 'Department', type: 'select', options: ['Sales', 'Marketing', 'Finance', 'Engineering', 'HR', 'IT', 'Operations'], required: true },
            { name: 'device_type', label: 'Device Type', type: 'select', options: ['Monitor', 'Keyboard', 'Mouse', 'Headset', 'Docking Station', 'Webcam'], required: true },
            { name: 'quantity', label: 'Quantity', type: 'text', required: true },
            { name: 'justification', label: 'Justification', type: 'textarea', required: true }
        ]},
        { id: 'CAT-007', name: 'Mobile Device Request', category: 'Hardware', description: 'Request a new mobile phone or tablet', icon: 'phone', approvalRequired: true, fulfillmentTime: '5 business days', cost: '$500 - $1,500', fields: [
            { name: 'employee_name', label: 'Employee Name', type: 'text', required: true },
            { name: 'department', label: 'Department', type: 'select', options: ['Sales', 'Marketing', 'Finance', 'Engineering', 'HR', 'IT', 'Operations'], required: true },
            { name: 'device_type', label: 'Device Type', type: 'select', options: ['iPhone', 'Android Phone', 'iPad', 'Android Tablet'], required: true },
            { name: 'justification', label: 'Business Justification', type: 'textarea', required: true },
            { name: 'manager_approval', label: 'Manager Email', type: 'email', required: true }
        ]},
        { id: 'CAT-008', name: 'Software License Request', category: 'Software', description: 'Request a new software license or subscription', icon: 'scroll', approvalRequired: true, fulfillmentTime: '2 business days', cost: 'Varies', fields: [
            { name: 'employee_name', label: 'Employee Name', type: 'text', required: true },
            { name: 'software_name', label: 'Software Name', type: 'text', required: true },
            { name: 'license_type', label: 'License Type', type: 'select', options: ['Individual', 'Team', 'Enterprise'], required: true },
            { name: 'duration', label: 'Duration', type: 'select', options: ['1 Month', '6 Months', '1 Year', 'Perpetual'], required: true },
            { name: 'justification', label: 'Business Justification', type: 'textarea', required: true }
        ]},
        { id: 'CAT-009', name: 'Shared Mailbox / Distribution List', category: 'Access', description: 'Create a shared mailbox or distribution list', icon: 'email', approvalRequired: true, fulfillmentTime: '1 business day', cost: 'No cost', fields: [
            { name: 'mailbox_name', label: 'Mailbox/List Name', type: 'text', required: true },
            { name: 'type', label: 'Type', type: 'select', options: ['Shared Mailbox', 'Distribution List'], required: true },
            { name: 'owner_email', label: 'Owner Email', type: 'email', required: true },
            { name: 'members', label: 'Members (one email per line)', type: 'textarea', required: true },
            { name: 'justification', label: 'Justification', type: 'textarea', required: true }
        ]},
        { id: 'CAT-010', name: 'Shipping & Delivery Request', category: 'Logistics', description: 'Request shipping of equipment or documents between locations', icon: 'delivery', approvalRequired: false, fulfillmentTime: '3 business days', cost: 'Varies', fields: [
            { name: 'sender_name', label: 'Sender Name', type: 'text', required: true },
            { name: 'sender_location', label: 'Pickup Location', type: 'text', required: true },
            { name: 'recipient_name', label: 'Recipient Name', type: 'text', required: true },
            { name: 'recipient_location', label: 'Delivery Location', type: 'text', required: true },
            { name: 'package_description', label: 'Package Description', type: 'textarea', required: true },
            { name: 'urgency', label: 'Urgency', type: 'select', options: ['Standard', 'Express', 'Next Day'], required: true }
        ]},
        { id: 'CAT-011', name: 'Office Supplies Request', category: 'Facilities', description: 'Request office supplies and consumables', icon: 'edit', approvalRequired: false, fulfillmentTime: '1 business day', cost: '$10 - $200', fields: [
            { name: 'requester_name', label: 'Requester Name', type: 'text', required: true },
            { name: 'department', label: 'Department', type: 'select', options: ['Sales', 'Marketing', 'Finance', 'Engineering', 'HR', 'IT', 'Operations'], required: true },
            { name: 'items_needed', label: 'Items Needed (describe)', type: 'textarea', required: true },
            { name: 'delivery_location', label: 'Delivery Location', type: 'text', required: true }
        ]},
        { id: 'CAT-012', name: 'Meeting Room AV Setup', category: 'Facilities', description: 'Request AV equipment setup for a meeting', icon: 'slideshow', approvalRequired: false, fulfillmentTime: 'Same day', cost: 'No cost', fields: [
            { name: 'meeting_room', label: 'Meeting Room', type: 'select', options: ['Conference Room A', 'Conference Room B', 'Boardroom', 'Training Room 1', 'Training Room 2'], required: true },
            { name: 'date', label: 'Meeting Date', type: 'date', required: true },
            { name: 'time_start', label: 'Start Time', type: 'text', required: true },
            { name: 'time_end', label: 'End Time', type: 'text', required: true },
            { name: 'requirements', label: 'AV Requirements (describe what you need)', type: 'textarea', required: true }
        ]},
        {
            id: 'CAT-013', name: 'Security Question / Breach Report', category: 'Security',
            description: 'Report a security incident, suspicious activity, or ask a security-related question',
            icon: 'alert', approvalRequired: true, fulfillmentTime: '4 hours (Critical) / 24 hours', cost: 'No cost',
            stepLabels: ['Reporter Info', 'Classification', 'Context', 'Evidence & Consent', 'Review & Submit'],
            fields: [
                // Step 1 — Reporter Info
                { name: 'reporter_name', label: 'Your Full Name', type: 'text', required: true, step: 1 },
                { name: 'reporter_email', label: 'Email Address', type: 'email', required: true, step: 1 },
                { name: 'reporter_employee_id', label: 'Employee ID', type: 'text', required: true, step: 1 },
                { name: 'reporter_phone', label: 'Contact Phone', type: 'text', required: false, step: 1 },
                // Step 2 — Classification
                { name: 'report_type', label: 'Report Type', type: 'select', options: ['Question', 'Incident', 'Suspicious Activity'], required: true, step: 2 },
                { name: 'incident_type', label: 'Incident Type', type: 'select', options: ['Phishing', 'Malware', 'Data Breach', 'Unauthorized Access', 'Policy Violation', 'Account Compromise', 'Lost/Stolen Device'], required: true, step: 2, showWhen: { field: 'report_type', equals: 'Incident|Suspicious Activity' } },
                { name: 'summary', label: 'Short Summary', type: 'text', required: true, step: 2 },
                { name: 'description', label: 'Detailed Description', type: 'textarea', required: true, step: 2 },
                // Step 3 — Context
                { name: 'affected_system', label: 'Affected System / Application', type: 'text', required: false, step: 3 },
                { name: 'environment', label: 'Environment', type: 'select', options: ['Production', 'Staging', 'Development', 'Unknown'], required: false, step: 3 },
                { name: 'asset_tag', label: 'Asset Tag (if applicable)', type: 'text', required: false, step: 3 },
                { name: 'owner_team', label: 'System Owner / Team', type: 'text', required: false, step: 3 },
                { name: 'time_detected', label: 'When Was It Detected?', type: 'text', required: false, step: 3 },
                { name: 'duration', label: 'Time Detected', type: 'select', options: ['Less than 1 hour', '1-4 hours', '4-24 hours', 'More than 24 hours', 'Unknown'], required: false, step: 3 },
                // Step 4 — Evidence & Consent
                { name: 'attachments', label: 'Attach Evidence (screenshots, logs)', type: 'file', required: false, step: 4 },
                { name: 'ioc_indicators', label: 'Indicators of Compromise (IPs, URLs, hashes)', type: 'textarea', required: false, step: 4 },
                { name: 'consent', label: 'I confirm that the information provided is accurate to the best of my knowledge and I understand this report may trigger a security investigation.', type: 'checkbox', required: true, step: 4 },
                // Step 5 — Review (severity editable on last step)
                { name: 'severity', label: 'Suggested Severity', type: 'select', options: ['Low', 'Normal', 'High', 'Critical'], required: true, step: 5 }
            ]
        },
        {
            id: 'CAT-014', name: 'Account Issue Report', category: 'Security',
            description: 'Report account lockouts, unauthorized access, MFA failures, or other account-related issues',
            icon: 'key', approvalRequired: false, fulfillmentTime: '2 hours (Critical) / 8 hours', cost: 'No cost',
            stepLabels: ['Reporter Info', 'Classification', 'Account & Environment', 'Evidence', 'Review & Submit'],
            fields: [
                // Step 1 — Reporter Info
                { name: 'reporter_name', label: 'Your Full Name', type: 'text', required: true, step: 1 },
                { name: 'reporter_email', label: 'Email Address', type: 'email', required: true, step: 1 },
                { name: 'reporter_employee_id', label: 'Employee ID', type: 'text', required: true, step: 1 },
                { name: 'reporter_phone', label: 'Contact Phone', type: 'text', required: false, step: 1 },
                // Step 2 — Classification
                { name: 'issue_category', label: 'Issue Category', type: 'select', options: ['Lockout', 'Access Issue', 'MFA Problem', 'Suspicious Activity', 'Password Issue'], required: true, step: 2 },
                { name: 'issue_type', label: 'Issue Type', type: 'select', options: [], required: true, step: 2, dependsOn: 'issue_category', optionsMap: {
                    'Lockout': ['Too Many Failed Attempts', 'Account Disabled by Admin', 'Expired Password', 'Unknown Cause', '_other'],
                    'Access Issue': ['Permission Denied', 'Role Missing', 'Group Membership', 'Application Access', '_other'],
                    'MFA Problem': ['MFA Not Prompting', 'MFA Token Rejected', 'Lost MFA Device', 'MFA Enrollment', '_other'],
                    'Suspicious Activity': ['Unrecognized Login', 'Login from Unknown Location', 'Multiple Failed Attempts', 'Account Used After Hours', '_other'],
                    'Password Issue': ['Cannot Reset', 'Reset Link Expired', 'Complexity Rejection', 'Password Not Syncing', '_other']
                }},
                { name: 'summary', label: 'Short Summary', type: 'text', required: true, step: 2 },
                { name: 'description', label: 'Detailed Description', type: 'textarea', required: true, step: 2 },
                // Step 3 — Account & Environment
                { name: 'affected_username', label: 'Affected Username / UPN', type: 'text', required: true, step: 3 },
                { name: 'affected_app', label: 'Application / Service', type: 'text', required: true, step: 3 },
                { name: 'auth_provider', label: 'Auth Provider', type: 'select', options: ['Active Directory', 'Azure AD / Entra ID', 'Okta', 'LDAP', 'Other / Unknown'], required: false, step: 3 },
                { name: 'environment', label: 'Environment', type: 'select', options: ['Production', 'Staging', 'Development', 'Unknown'], required: false, step: 3 },
                { name: 'last_successful_login', label: 'Last Successful Login (approx.)', type: 'text', required: false, step: 3 },
                { name: 'device', label: 'Device Used', type: 'text', required: false, step: 3 },
                // Step 4 — Evidence
                { name: 'attachments', label: 'Attach Evidence (screenshots, error messages)', type: 'file', required: false, step: 4 },
                { name: 'requested_action', label: 'Requested Action', type: 'select', options: ['Unlock Account', 'Reset Password', 'Investigate Activity', 'Restore Access', 'Disable Account', 'Other'], required: true, step: 4 },
                { name: 'approver_email', label: 'Manager / Approver Email', type: 'email', required: false, step: 4 },
                { name: 'consent', label: 'I confirm the affected account belongs to me or I am authorized to report on behalf of the account holder.', type: 'checkbox', required: true, step: 4 },
                // Step 5 — Review
                { name: 'severity', label: 'Severity', type: 'select', options: ['Low', 'Normal', 'High', 'Critical'], required: true, step: 5 }
            ]
        }
    ],

    // Service Requests (enriched first-class ticket type)
    serviceRequests: [
        {
            id: 'REQ-001', catalogItem: 'CAT-001', catalogItemName: 'New Laptop Request',
            title: 'New Laptop Request - New Hire Employee', description: 'New sales representative starting on Monday needs standard laptop',
            requestedBy: 'jane.doe@acme.com', requestedByName: 'Jane Doe',
            requestedFor: 'new.hire@acme.com', requestedForName: 'New Hire Employee',
            requestedForDepartment: 'Sales', requestedForLocation: 'Building A, Floor 2', requestedForVip: false,
            category: 'Hardware', priority: 'Normal', impact: 2, urgency: 2,
            status: 'Pending Approval',
            formData: { employee_name: 'New Hire Employee', department: 'Sales', laptop_type: 'Standard', justification: 'New sales representative starting on Monday' },
            approvalRequired: true, approver: 'lisa.wong@acme.com', approverName: 'Lisa Wong',
            approvalDate: null, approvalComments: null, rejectionReason: null,
            assignmentGroup: 'Service Desk', assignedTo: null, assigneeName: null,
            slaTarget: '2025-02-18T09:30:00Z', slaMet: null, expectedFulfillment: '5 business days', estimatedCost: '$1,200 - $2,500', actualCost: null, fulfillmentDate: null,
            createdAt: '2025-02-13T09:30:00Z', updatedAt: '2025-02-13T09:30:00Z', submittedAt: '2025-02-13T09:30:00Z', closedAt: null,
            notes: [{ type: 'system', visibility: 'technicians-only', author: 'System', content: 'Request submitted', timestamp: '2025-02-13T09:30:00Z' }, { type: 'customer', visibility: 'customer-visible', author: 'jane.doe@acme.com', content: 'Needs to be ready by Monday morning', timestamp: '2025-02-13T09:35:00Z' }],
            attachments: [], linkedIncidents: [], linkedChanges: [], linkedKB: [], watchList: ['jane.doe@acme.com'], additionalCommentsNotify: ['new.hire@acme.com']
        },
        {
            id: 'REQ-002', catalogItem: 'CAT-003', catalogItemName: 'VPN Access Request',
            title: 'VPN Access Request - David Wilson', description: 'Need VPN access for permanent remote work arrangement',
            requestedBy: 'david.wilson@acme.com', requestedByName: 'David Wilson',
            requestedFor: 'david.wilson@acme.com', requestedForName: 'David Wilson',
            requestedForDepartment: 'Engineering', requestedForLocation: 'Remote', requestedForVip: false,
            category: 'Access', priority: 'Normal', impact: 3, urgency: 2,
            status: 'In Progress',
            formData: { employee_email: 'david.wilson@acme.com', start_date: '2025-02-14', end_date: null, manager_approval: 'tom.baker@acme.com' },
            approvalRequired: true, approver: 'tom.baker@acme.com', approverName: 'Tom Baker',
            approvalDate: '2025-02-13T08:00:00Z', approvalComments: 'Approved for permanent remote', rejectionReason: null,
            assignmentGroup: 'Identity Team', assignedTo: 'USR-006', assigneeName: 'Emily Davis',
            slaTarget: '2025-02-15T14:00:00Z', slaMet: null, expectedFulfillment: '2 business days', estimatedCost: 'No cost', actualCost: null, fulfillmentDate: null,
            createdAt: '2025-02-12T14:00:00Z', updatedAt: '2025-02-13T10:00:00Z', submittedAt: '2025-02-12T14:00:00Z', closedAt: null,
            notes: [{ type: 'system', visibility: 'technicians-only', author: 'System', content: 'Request submitted', timestamp: '2025-02-12T14:00:00Z' }, { type: 'system', visibility: 'customer-visible', author: 'Tom Baker', content: 'Approved for permanent remote', timestamp: '2025-02-13T08:00:00Z' }, { type: 'internal', visibility: 'technicians-only', author: 'emily.davis@acme.com', content: 'Configuring VPN profile in Azure AD', timestamp: '2025-02-13T10:00:00Z' }],
            attachments: [], linkedIncidents: [], linkedChanges: [], linkedKB: ['KB-001'], watchList: [], additionalCommentsNotify: []
        },
        {
            id: 'REQ-003', catalogItem: 'CAT-006', catalogItemName: 'New Monitor/Peripheral',
            title: 'New Monitor/Peripheral - Susan Brown', description: 'Need dual monitor setup for new workstation',
            requestedBy: 'susan.brown@acme.com', requestedByName: 'Susan Brown',
            requestedFor: 'susan.brown@acme.com', requestedForName: 'Susan Brown',
            requestedForDepartment: 'Operations', requestedForLocation: 'Building B, Floor 2', requestedForVip: false,
            category: 'Hardware', priority: 'Low', impact: 3, urgency: 3,
            status: 'Approved',
            formData: { employee_name: 'Susan Brown', department: 'Operations', device_type: 'Monitor', quantity: '2', justification: 'Dual monitor setup for improved productivity' },
            approvalRequired: true, approver: 'tom.baker@acme.com', approverName: 'Tom Baker',
            approvalDate: '2025-02-14T09:00:00Z', approvalComments: 'Approved', rejectionReason: null,
            assignmentGroup: 'Service Desk', assignedTo: null, assigneeName: null,
            slaTarget: '2025-02-17T10:00:00Z', slaMet: null, expectedFulfillment: '3 business days', estimatedCost: '$100 - $800', actualCost: null, fulfillmentDate: null,
            createdAt: '2025-02-14T10:00:00Z', updatedAt: '2025-02-14T09:00:00Z', submittedAt: '2025-02-14T10:00:00Z', closedAt: null,
            notes: [{ type: 'system', visibility: 'technicians-only', author: 'System', content: 'Request submitted', timestamp: '2025-02-14T10:00:00Z' }, { type: 'system', visibility: 'customer-visible', author: 'Tom Baker', content: 'Approved', timestamp: '2025-02-14T09:00:00Z' }],
            attachments: [], linkedIncidents: [], linkedChanges: [], linkedKB: [], watchList: [], additionalCommentsNotify: []
        },
        {
            id: 'REQ-004', catalogItem: 'CAT-010', catalogItemName: 'Shipping & Delivery Request',
            title: 'Shipping & Delivery Request - Michael Taylor', description: 'Ship replacement laptop to remote employee',
            requestedBy: 'michael.taylor@acme.com', requestedByName: 'Michael Taylor',
            requestedFor: 'michael.taylor@acme.com', requestedForName: 'Michael Taylor',
            requestedForDepartment: 'Legal', requestedForLocation: 'Remote', requestedForVip: true,
            category: 'Logistics', priority: 'High', impact: 2, urgency: 1,
            status: 'In Progress',
            formData: { sender_name: 'IT Department', sender_location: 'Building A, IT Storage', recipient_name: 'Michael Taylor', recipient_location: '456 Oak Ave, Chicago IL 60601', package_description: 'Dell Latitude 5540 laptop with accessories', urgency: 'Express' },
            approvalRequired: false, approver: null, approverName: null,
            approvalDate: null, approvalComments: null, rejectionReason: null,
            assignmentGroup: 'Service Desk', assignedTo: 'USR-002', assigneeName: 'Maria Garcia',
            slaTarget: '2025-02-16T11:00:00Z', slaMet: null, expectedFulfillment: '3 business days', estimatedCost: 'Varies', actualCost: null, fulfillmentDate: null,
            createdAt: '2025-02-13T11:00:00Z', updatedAt: '2025-02-13T14:30:00Z', submittedAt: '2025-02-13T11:00:00Z', closedAt: null,
            notes: [{ type: 'system', visibility: 'technicians-only', author: 'System', content: 'Request submitted', timestamp: '2025-02-13T11:00:00Z' }, { type: 'internal', visibility: 'technicians-only', author: 'maria.garcia@acme.com', content: 'Laptop prepared. Shipping label created via FedEx Express.', timestamp: '2025-02-13T14:30:00Z' }],
            attachments: [{ name: 'shipping_label.pdf', type: 'document', size: '85KB' }], linkedIncidents: [], linkedChanges: [], linkedKB: [], watchList: ['michael.taylor@acme.com'], additionalCommentsNotify: []
        },
        {
            id: 'REQ-005', catalogItem: 'CAT-008', catalogItemName: 'Software License Request',
            title: 'Software License Request - Amanda White', description: 'Need Adobe Creative Suite license for marketing materials',
            requestedBy: 'amanda.white@acme.com', requestedByName: 'Amanda White',
            requestedFor: 'amanda.white@acme.com', requestedForName: 'Amanda White',
            requestedForDepartment: 'Sales', requestedForLocation: 'Building A, Floor 2', requestedForVip: false,
            category: 'Software', priority: 'Normal', impact: 3, urgency: 2,
            status: 'Rejected',
            formData: { employee_name: 'Amanda White', software_name: 'Adobe Creative Suite', license_type: 'Individual', duration: '1 Year', justification: 'Need for creating marketing presentations and collateral' },
            approvalRequired: true, approver: 'lisa.wong@acme.com', approverName: 'Lisa Wong',
            approvalDate: null, approvalComments: null, rejectionReason: 'Budget not available this quarter. Please use Canva as alternative or re-submit in Q2.',
            assignmentGroup: 'Application Support', assignedTo: null, assigneeName: null,
            slaTarget: '2025-02-17T09:00:00Z', slaMet: null, expectedFulfillment: '2 business days', estimatedCost: 'Varies', actualCost: null, fulfillmentDate: null,
            createdAt: '2025-02-13T09:00:00Z', updatedAt: '2025-02-14T11:00:00Z', submittedAt: '2025-02-13T09:00:00Z', closedAt: null,
            notes: [{ type: 'system', visibility: 'technicians-only', author: 'System', content: 'Request submitted', timestamp: '2025-02-13T09:00:00Z' }, { type: 'system', visibility: 'customer-visible', author: 'Lisa Wong', content: 'Rejected: Budget not available this quarter. Please use Canva as alternative or re-submit in Q2.', timestamp: '2025-02-14T11:00:00Z' }],
            attachments: [], linkedIncidents: [], linkedChanges: [], linkedKB: [], watchList: [], additionalCommentsNotify: []
        },
        {
            id: 'REQ-006', catalogItem: 'CAT-011', catalogItemName: 'Office Supplies Request',
            title: 'Office Supplies Request - Chris Anderson', description: 'Restock printer paper and toner for IT lab',
            requestedBy: 'chris.anderson@acme.com', requestedByName: 'Chris Anderson',
            requestedFor: 'chris.anderson@acme.com', requestedForName: 'Chris Anderson',
            requestedForDepartment: 'IT', requestedForLocation: 'Building C, Floor 1', requestedForVip: false,
            category: 'Facilities', priority: 'Low', impact: 3, urgency: 3,
            status: 'Fulfilled',
            formData: { requester_name: 'Chris Anderson', department: 'IT', items_needed: '5x A4 Paper Reams\n2x HP 26A Toner Cartridges\n1x Pack of Whiteboard Markers', delivery_location: 'Building C, Floor 1, IT Lab' },
            approvalRequired: false, approver: null, approverName: null,
            approvalDate: null, approvalComments: null, rejectionReason: null,
            assignmentGroup: 'Service Desk', assignedTo: 'USR-007', assigneeName: 'Robert Wilson',
            slaTarget: '2025-02-14T15:00:00Z', slaMet: true, expectedFulfillment: '1 business day', estimatedCost: '$10 - $200', actualCost: '$127', fulfillmentDate: '2025-02-14T10:30:00Z',
            createdAt: '2025-02-13T15:00:00Z', updatedAt: '2025-02-14T10:30:00Z', submittedAt: '2025-02-13T15:00:00Z', closedAt: null,
            notes: [{ type: 'system', visibility: 'technicians-only', author: 'System', content: 'Request submitted', timestamp: '2025-02-13T15:00:00Z' }, { type: 'internal', visibility: 'technicians-only', author: 'robert.wilson@acme.com', content: 'Supplies ordered from vendor. Expected delivery tomorrow morning.', timestamp: '2025-02-13T16:00:00Z' }, { type: 'system', visibility: 'customer-visible', author: 'System', content: 'Request fulfilled. Supplies delivered to IT Lab.', timestamp: '2025-02-14T10:30:00Z' }],
            attachments: [], linkedIncidents: [], linkedChanges: [], linkedKB: [], watchList: [], additionalCommentsNotify: []
        },
        {
            id: 'REQ-007', catalogItem: 'CAT-012', catalogItemName: 'Meeting Room AV Setup',
            title: 'Meeting Room AV Setup - Karen Thomas', description: 'AV setup needed for all-hands meeting',
            requestedBy: 'karen.thomas@acme.com', requestedByName: 'Karen Thomas',
            requestedFor: 'karen.thomas@acme.com', requestedForName: 'Karen Thomas',
            requestedForDepartment: 'Engineering', requestedForLocation: 'Building C, Floor 2', requestedForVip: false,
            category: 'Facilities', priority: 'Normal', impact: 2, urgency: 2,
            status: 'Closed',
            formData: { meeting_room: 'Boardroom', date: '2025-02-12', time_start: '14:00', time_end: '16:00', requirements: 'Video conference setup with Zoom, projector for slides, recording enabled' },
            approvalRequired: false, approver: null, approverName: null,
            approvalDate: null, approvalComments: null, rejectionReason: null,
            assignmentGroup: 'Service Desk', assignedTo: 'USR-001', assigneeName: 'Alex Thompson',
            slaTarget: '2025-02-12T14:00:00Z', slaMet: true, expectedFulfillment: 'Same day', estimatedCost: 'No cost', actualCost: 'No cost', fulfillmentDate: '2025-02-12T13:30:00Z',
            createdAt: '2025-02-12T09:00:00Z', updatedAt: '2025-02-12T16:30:00Z', submittedAt: '2025-02-12T09:00:00Z', closedAt: '2025-02-12T16:30:00Z',
            notes: [{ type: 'system', visibility: 'technicians-only', author: 'System', content: 'Request submitted', timestamp: '2025-02-12T09:00:00Z' }, { type: 'internal', visibility: 'technicians-only', author: 'alex.thompson@acme.com', content: 'AV equipment checked and configured. Zoom room tested.', timestamp: '2025-02-12T13:30:00Z' }, { type: 'system', visibility: 'customer-visible', author: 'System', content: 'Request fulfilled and closed.', timestamp: '2025-02-12T16:30:00Z' }],
            attachments: [], linkedIncidents: [], linkedChanges: [], linkedKB: [], watchList: [], additionalCommentsNotify: []
        },
        {
            id: 'REQ-008', catalogItem: 'CAT-009', catalogItemName: 'Shared Mailbox / Distribution List',
            title: 'Shared Mailbox / Distribution List - Jennifer Lee', description: 'Create new distribution list for HR announcements',
            requestedBy: 'jennifer.lee@acme.com', requestedByName: 'Jennifer Lee',
            requestedFor: 'jennifer.lee@acme.com', requestedForName: 'Jennifer Lee',
            requestedForDepartment: 'HR', requestedForLocation: 'Building A, Floor 1', requestedForVip: false,
            category: 'Access', priority: 'Low', impact: 3, urgency: 3,
            status: 'Draft',
            formData: { mailbox_name: 'hr-announcements@acme.com', type: 'Distribution List', owner_email: 'jennifer.lee@acme.com', members: 'all-employees@acme.com', justification: 'Need dedicated DL for HR policy updates and announcements' },
            approvalRequired: true, approver: null, approverName: null,
            approvalDate: null, approvalComments: null, rejectionReason: null,
            assignmentGroup: 'Identity Team', assignedTo: null, assigneeName: null,
            slaTarget: null, slaMet: null, expectedFulfillment: '1 business day', estimatedCost: 'No cost', actualCost: null, fulfillmentDate: null,
            createdAt: '2025-02-14T16:00:00Z', updatedAt: '2025-02-14T16:00:00Z', submittedAt: null, closedAt: null,
            notes: [{ type: 'system', visibility: 'technicians-only', author: 'System', content: 'Draft created', timestamp: '2025-02-14T16:00:00Z' }],
            attachments: [], linkedIncidents: [], linkedChanges: [], linkedKB: [], watchList: [], additionalCommentsNotify: []
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
        requests: {
            total: 8,
            open: 4,
            pendingApproval: 1,
            inProgress: 2,
            fulfilled: 1,
            closed: 1,
            rejected: 1
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
