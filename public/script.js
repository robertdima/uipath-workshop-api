/* ═══════════════════════════════════════════════════════════════
   UiPath Workshop API - Modern Interactive Logic
   Pure JavaScript with smooth animations and enterprise UX
   ═══════════════════════════════════════════════════════════════ */

// ═══ GLOBAL STATE ═══
const state = {
  apiBase: window.location.origin + '/api',
  currentModule: 'welcome',
  sampleIds: {
    worker: null,
    invoice: null,
    customer: null,
    device: null,
    opportunity: null,
    onboarding: null,
    legacy_submission: null,
    itsm_incident: null,
    itsm_change: null,
    itsm_request: null,
    itsm_problem: null,
    itsm_asset: null,
    itsm_knowledge: null,
    itsm_runbook: null,
    itsm_catalog: null,
    itsm_notification: null
  },
  apiHealth: {
    isOnline: false,
    responseTime: 0,
    lastCheck: null
  },
  testResults: {
    passed: 0,
    failed: 0,
    total: 0
  }
};

// ═══ MODULE DEFINITIONS ═══
const modules = {
  welcome: {
    title: 'Welcome to UiPath Workshop API',
    icon: '🚀',
    description: 'Enterprise-grade API testing environment',
    content: generateWelcomeContent
  },
  stats: {
    title: 'Live API Statistics',
    icon: '📊',
    description: 'Real-time metrics and performance monitoring',
    content: generateStatsContent
  },
  'hr-workers': {
    title: 'HR Workers Management',
    icon: '👥',
    description: 'Employee records, departments, and organizational hierarchy',
    endpoints: [
      { method: 'GET', path: '/hr/workers', description: 'Get all workers in the system' },
      { method: 'GET', path: '/hr/workers/active', description: 'Get active employees (filtered in UiPath workflows)' },
      { method: 'GET', path: '/hr/workers/search', description: 'Search employees with flexible criteria' },
      { method: 'GET', path: '/hr/workers/:id', description: 'Get specific employee details', needsId: 'worker' },
      { method: 'GET', path: '/hr/workers/:id/directReports', description: 'Get employee direct reports', needsId: 'worker' },
      { method: 'GET', path: '/hr/workers/:id/performance', description: 'Get employee performance data', needsId: 'worker' }
    ]
  },
  'hr-performance': {
    title: 'HR Performance & Reviews',
    icon: '📈',
    description: 'Performance reviews, ratings, and goal tracking',
    endpoints: [
      { method: 'GET', path: '/hr/performance', description: 'Get all performance review records' },
      { method: 'GET', path: '/hr/performance/lowPerformers', description: 'Get underperforming employees (filtered in UiPath)' },
      { method: 'GET', path: '/hr/supervisoryOrganizations', description: 'Get organizational structure and hierarchy' }
    ]
  },
  'hr-onboarding': {
    title: 'HR Onboarding Management',
    icon: '🎯',
    description: 'New employee onboarding process and progress tracking',
    endpoints: [
      { method: 'GET', path: '/hr/onboarding', description: 'Get all employee onboarding records' },
      { method: 'GET', path: '/hr/onboarding/inProgress', description: 'Get active onboarding processes (filtered in UiPath)' },
      { method: 'GET', path: '/hr/onboarding/enriched', description: 'Get enriched onboarding data with worker details' },
      { method: 'PATCH', path: '/hr/onboarding/:id/status', description: 'Update onboarding status', needsId: 'onboarding',
        body: { status: 'In Progress' } },
      { method: 'POST', path: '/hr/onboarding/:id/equipment', description: 'Add equipment to onboarding', needsId: 'onboarding',
        body: { item: 'Laptop', status: 'Ordered' } },
      { method: 'POST', path: '/hr/onboarding/:id/access', description: 'Add system access to onboarding', needsId: 'onboarding',
        body: { system: 'Email', status: 'Provisioned' } },
      { method: 'DELETE', path: '/hr/onboarding/:id', description: 'Delete onboarding record', needsId: 'onboarding' },
      { method: 'POST', path: '/hr/onboarding/generate', description: 'Generate onboarding records for workers' },
      { method: 'POST', path: '/hr/onboarding/reset', description: 'Reset all onboarding data' },
      { method: 'GET', path: '/hr/org/headcount', description: 'Get departmental headcount analytics' },
      { method: 'POST', path: '/hr/legacy-portal/submit', description: 'Submit legacy HR form',
        body: { employeeName: 'John Doe', requestType: 'Leave Request', details: 'Annual leave 5 days' } },
      { method: 'GET', path: '/hr/legacy-portal/submissions', description: 'Get all legacy form submissions' },
      { method: 'GET', path: '/hr/legacy-portal/verify/:id', description: 'Verify legacy form submission', needsId: 'legacy_submission' }
    ]
  },
  'finance-invoices': {
    title: 'Finance Invoice Management',
    icon: '📄',
    description: 'Invoice processing, approval workflows, and vendor management',
    endpoints: [
      { method: 'GET', path: '/finance/invoices', description: 'Get all invoices in the system' },
      { method: 'GET', path: '/finance/invoices/pending', description: 'Get pending invoice approvals (filtered in UiPath)' },
      { method: 'GET', path: '/finance/invoices/:id', description: 'Get specific invoice details', needsId: 'invoice' },
      { method: 'PATCH', path: '/finance/invoices/:id/approve', description: 'Approve invoice for payment', needsId: 'invoice', body: {status: 'approved'} },
      { method: 'GET', path: '/finance/vendors/performance', description: 'Get vendor performance metrics and risk scores' }
    ]
  },
  'finance-expenses': {
    title: 'Finance Expense Management', 
    icon: '💳',
    description: 'Employee expense reports and reimbursement tracking',
    endpoints: [
      { method: 'GET', path: '/finance/expenses', description: 'Get all employee expense reports' },
      { method: 'GET', path: '/finance/expenses/pending', description: 'Get pending expense approvals (filtered in UiPath)' },
      { method: 'POST', path: '/finance/expenses', description: 'Create new expense report', 
        body: {workerId: '', description: 'Conference attendance', amount: 450.00, currency: 'USD', category: 'Travel'} }
    ]
  },
  'finance-analytics': {
    title: 'Finance Analytics & Reporting',
    icon: '📊',
    description: 'Financial summaries, budget variance, and cash flow analysis',
    endpoints: [
      { method: 'GET', path: '/finance/budget/variance', description: 'Get budget vs actual spending by department' },
      { method: 'GET', path: '/finance/summaries', description: 'Get monthly financial summary reports' },
      { method: 'GET', path: '/reports/financial/monthly', description: 'Get detailed monthly financial analytics' }
    ]
  },
  'crm-customers': {
    title: 'CRM Customer Management',
    icon: '🏢',
    description: 'Customer records, relationship management, and account health',
    endpoints: [
      { method: 'GET', path: '/crm/customers', description: 'Get all customer records' },
      { method: 'GET', path: '/crm/customers/enterprise', description: 'Get enterprise-tier customers (filtered in UiPath)' },
      { method: 'GET', path: '/crm/customers/:id', description: 'Get specific customer details', needsId: 'customer' },
      { method: 'GET', path: '/crm/customers/:id/360', description: 'Get customer 360-degree view', needsId: 'customer' },
      { method: 'GET', path: '/analytics/customer/relationships', description: 'Get customer relationship analytics' }
    ]
  },
  'crm-sales': {
    title: 'CRM Sales & Opportunities',
    icon: '💼',
    description: 'Sales pipeline, opportunities, and revenue forecasting',
    endpoints: [
      { method: 'GET', path: '/crm/opportunities', description: 'Get all sales opportunities' },
      { method: 'GET', path: '/crm/opportunities/highValue', description: 'Get high-value opportunities (filtered in UiPath)' },
      { method: 'PATCH', path: '/crm/opportunities/:id/score', description: 'Update opportunity score', needsId: 'opportunity', body: {score: 85} },
      { method: 'GET', path: '/crm/pipeline/forecast', description: 'Get sales pipeline forecast data' },
      { method: 'GET', path: '/reports/sales/pipeline', description: 'Get detailed sales pipeline reports' }
    ]
  },
  'crm-support': {
    title: 'CRM Support & Service',
    icon: '🎧',
    description: 'Support tickets, customer service, and issue tracking',
    endpoints: [
      { method: 'GET', path: '/crm/support/tickets', description: 'Get all customer support tickets' },
      { method: 'GET', path: '/crm/support/tickets/open', description: 'Get open support tickets (filtered in UiPath)' },
      { method: 'GET', path: '/crm/renewals', description: 'Get contract renewal information' }
    ]
  },
  'iot-devices': {
    title: 'IoT Device Management',
    icon: '📱',
    description: 'Device inventory, status monitoring, and assignments',
    endpoints: [
      { method: 'GET', path: '/iot/devices', description: 'Get all IoT devices in the system' },
      { method: 'GET', path: '/iot/devices/online', description: 'Get online devices (filtered in UiPath)' },
      { method: 'GET', path: '/iot/devices/:id', description: 'Get specific device details', needsId: 'device' },
      { method: 'PATCH', path: '/iot/devices/:id/assign', description: 'Assign device to technician', needsId: 'device', body: {assignedTo: ''} }
    ]
  },
  'iot-monitoring': {
    title: 'IoT Monitoring & Telemetry',
    icon: '📡',
    description: 'Real-time data, telemetry, and device performance monitoring',
    endpoints: [
      { method: 'GET', path: '/iot/telemetry', description: 'Get all telemetry data from devices' },
      { method: 'GET', path: '/iot/devices/:id/telemetry', description: 'Get real-time device telemetry', needsId: 'device' }
    ]
  },
  'iot-maintenance': {
    title: 'IoT Maintenance & Alerts',
    icon: '🔧',
    description: 'Maintenance scheduling, alerts, and predictive analytics',
    endpoints: [
      { method: 'GET', path: '/iot/alerts', description: 'Get all IoT device alerts' },
      { method: 'GET', path: '/iot/alerts/critical', description: 'Get critical alerts (filtered in UiPath)' },
      { method: 'GET', path: '/iot/maintenance', description: 'Get device maintenance schedule' },
      { method: 'GET', path: '/iot/maintenance/due', description: 'Get due maintenance tasks (filtered in UiPath)' }
    ]
  },
  'reports': {
    title: 'Reports & Analytics',
    icon: '📈',
    description: 'Business intelligence, KPIs, and executive dashboards',
    endpoints: [
      { method: 'GET', path: '/reports/employee/summary', description: 'Get employee analytics by department' },
      { method: 'GET', path: '/analytics/employee/profiles', description: 'Get detailed employee profiles' },
      { method: 'GET', path: '/notifications', description: 'Get system notifications' },
      { method: 'GET', path: '/notifications/unread', description: 'Get unread notifications (filtered in UiPath)' }
    ]
  },
  'projects': {
    title: 'Project Management',
    icon: '📋',
    description: 'Project tracking, resource allocation, and deliverables',
    endpoints: [
      { method: 'GET', path: '/projects', description: 'Get all projects in the system' },
      { method: 'GET', path: '/projects/active', description: 'Get active projects (filtered in UiPath)' },
      { method: 'GET', path: '/projects/atrisk', description: 'Get at-risk projects (filtered in UiPath)' }
    ]
  },
  'workflows': {
    title: 'Workflow Management',
    icon: '⚙️',
    description: 'Automation workflows, triggers, and process monitoring',
    endpoints: [
      { method: 'GET', path: '/workflows/triggers', description: 'Get workflow automation triggers' },
      { method: 'GET', path: '/workflows/triggers/active', description: 'Get active workflow triggers (filtered in UiPath)' }
    ]
  },

  // ═══ ITSM MODULES ═══
  'itsm-incidents': {
    title: 'ITSM Incident Management',
    icon: '🎫',
    description: 'IT incident tracking, assignment, resolution, and SLA management',
    endpoints: [
      { method: 'GET', path: '/itsm/incidents', description: 'Get all incidents in the system' },
      { method: 'GET', path: '/itsm/incidents/:id', description: 'Get specific incident details', needsId: 'itsm_incident' },
      { method: 'POST', path: '/itsm/incidents', description: 'Create a new incident',
        body: { title: 'Email service unavailable', description: 'Users unable to access email since 9:00 AM', category: 'Software', impact: 'High', urgency: 'High' } },
      { method: 'PATCH', path: '/itsm/incidents/:id', description: 'Update any incident fields (general-purpose)', needsId: 'itsm_incident',
        body: { impact: 'High', urgency: 'High', assignmentGroup: 'Escalation Team', status: 'In Progress' } },
      { method: 'PATCH', path: '/itsm/incidents/:id/status', description: 'Update incident status', needsId: 'itsm_incident',
        body: { status: 'Open' } },
      { method: 'POST', path: '/itsm/incidents/:id/notes', description: 'Add work note to incident', needsId: 'itsm_incident',
        body: { content: 'Investigating root cause', type: 'comment', visibility: 'technicians-only' } },
      { method: 'POST', path: '/itsm/incidents/:id/assign', description: 'Assign incident to team/tech', needsId: 'itsm_incident',
        body: { assignmentGroup: 'Network Team', assignee: 'tech001', assigneeName: 'John Smith' } },
      { method: 'POST', path: '/itsm/incidents/:id/escalate', description: 'Escalate incident priority (P4→P3→P2→P1)', needsId: 'itsm_incident' },
      { method: 'POST', path: '/itsm/incidents/:id/resolve', description: 'Resolve an incident', needsId: 'itsm_incident',
        body: { resolutionCode: 'Fixed', resolutionNotes: 'Issue resolved by restarting mail service' } },
      { method: 'POST', path: '/itsm/incidents/:id/link', description: 'Link incident to problem/change/KB', needsId: 'itsm_incident',
        body: { targetId: 'PRB-001', linkType: 'problem' } },
      { method: 'DELETE', path: '/itsm/incidents/:id', description: 'Delete an incident permanently', needsId: 'itsm_incident' },
      { method: 'GET', path: '/itsm/incidents/stats', description: 'Get incident statistics and metrics' }
    ]
  },
  'itsm-changes': {
    title: 'ITSM Change Management',
    icon: '🔄',
    description: 'Change requests, approvals, CAB calendar, and risk assessment',
    endpoints: [
      { method: 'GET', path: '/itsm/changes', description: 'Get all change requests' },
      { method: 'GET', path: '/itsm/changes/:id', description: 'Get specific change request', needsId: 'itsm_change' },
      { method: 'POST', path: '/itsm/changes', description: 'Create a new change request',
        body: { title: 'Upgrade firewall firmware', type: 'Normal', risk: 'Medium', description: 'Upgrade perimeter firewall to latest firmware version' } },
      { method: 'PATCH', path: '/itsm/changes/:id/status', description: 'Update change request status', needsId: 'itsm_change',
        body: { status: 'Approved' } },
      { method: 'POST', path: '/itsm/changes/:id/approve', description: 'Approve a change request', needsId: 'itsm_change',
        body: { approver: 'CAB Board', comments: 'Approved - low risk window' } },
      { method: 'POST', path: '/itsm/changes/:id/reject', description: 'Reject a change request', needsId: 'itsm_change',
        body: { rejectedBy: 'CAB Board', reason: 'Insufficient testing evidence' } },
      { method: 'POST', path: '/itsm/changes/:id/implement', description: 'Start change implementation', needsId: 'itsm_change' },
      { method: 'POST', path: '/itsm/changes/:id/complete', description: 'Complete/close a change', needsId: 'itsm_change',
        body: { outcome: 'Successful', notes: 'Firmware updated successfully' } },
      { method: 'DELETE', path: '/itsm/changes/:id', description: 'Delete a change request permanently', needsId: 'itsm_change' },
      { method: 'GET', path: '/itsm/changes/stats', description: 'Get change management statistics' },
      { method: 'GET', path: '/itsm/changes/calendar', description: 'Get change calendar / freeze windows' }
    ]
  },
  'itsm-requests': {
    title: 'ITSM Service Requests',
    icon: '📝',
    description: 'Service catalog requests, approvals, fulfillment, and tracking',
    endpoints: [
      { method: 'GET', path: '/itsm/requests', description: 'Get all service requests' },
      { method: 'GET', path: '/itsm/requests/:id', description: 'Get specific service request', needsId: 'itsm_request' },
      { method: 'POST', path: '/itsm/requests', description: 'Create a new service request',
        body: { catalogItem: 'CAT-002', title: 'Software Installation - Visual Studio', requestedBy: 'user@acme.com', requestedFor: 'user@acme.com', priority: 'Normal' } },
      { method: 'PATCH', path: '/itsm/requests/:id/status', description: 'Update service request status', needsId: 'itsm_request',
        body: { status: 'In Progress' } },
      { method: 'POST', path: '/itsm/requests/:id/approve', description: 'Approve a service request', needsId: 'itsm_request',
        body: { approver: 'manager@acme.com', comments: 'Approved' } },
      { method: 'POST', path: '/itsm/requests/:id/reject', description: 'Reject a service request', needsId: 'itsm_request',
        body: { rejectedBy: 'manager@acme.com', reason: 'Budget not approved' } },
      { method: 'POST', path: '/itsm/requests/:id/fulfill', description: 'Mark request as fulfilled', needsId: 'itsm_request',
        body: { notes: 'Software installed and configured' } },
      { method: 'POST', path: '/itsm/requests/:id/assign', description: 'Assign request to team', needsId: 'itsm_request',
        body: { team: 'Service Desk' } },
      { method: 'POST', path: '/itsm/requests/:id/notes', description: 'Add note to service request', needsId: 'itsm_request',
        body: { content: 'Waiting for license key', type: 'comment', visibility: 'customer-visible' } },
      { method: 'DELETE', path: '/itsm/requests/:id', description: 'Delete a service request permanently', needsId: 'itsm_request' },
      { method: 'GET', path: '/itsm/requests/stats', description: 'Get service request statistics' },
      { method: 'GET', path: '/itsm/requests/pending-approval', description: 'Get requests pending approval' }
    ]
  },
  'itsm-problems': {
    title: 'ITSM Problem Management',
    icon: '🔍',
    description: 'Problem investigation, root cause analysis, and known errors',
    endpoints: [
      { method: 'GET', path: '/itsm/problems', description: 'Get all problem records' },
      { method: 'GET', path: '/itsm/problems/:id', description: 'Get specific problem details', needsId: 'itsm_problem' },
      { method: 'POST', path: '/itsm/problems', description: 'Create a new problem record',
        body: { title: 'Recurring VPN disconnections', description: 'Multiple users reporting VPN drops during peak hours', category: 'Network', priority: 'P2' } },
      { method: 'PATCH', path: '/itsm/problems/:id/status', description: 'Update problem status', needsId: 'itsm_problem',
        body: { status: 'Under Investigation' } },
      { method: 'PATCH', path: '/itsm/problems/:id/root-cause', description: 'Update root cause analysis', needsId: 'itsm_problem',
        body: { rootCause: 'VPN concentrator memory leak', workaround: 'Restart VPN service during off-hours', convertToKnownError: true } },
      { method: 'POST', path: '/itsm/problems/:id/link-incident', description: 'Link incident(s) to problem (single or multiple)', needsId: 'itsm_problem',
        body: { incidentIds: ['INC-001', 'INC-002', 'INC-003'] } },
      { method: 'POST', path: '/itsm/problems/:id/unlink-incident', description: 'Unlink an incident from a problem', needsId: 'itsm_problem',
        body: { incidentId: 'INC-001' } },
      { method: 'DELETE', path: '/itsm/problems/:id', description: 'Delete a problem record permanently', needsId: 'itsm_problem' },
      { method: 'GET', path: '/itsm/problems/known-errors', description: 'Get known error database' }
    ]
  },
  'itsm-assets': {
    title: 'ITSM Assets / CMDB',
    icon: '🖥️',
    description: 'IT asset inventory, lifecycle management, and configuration items',
    endpoints: [
      { method: 'GET', path: '/itsm/assets', description: 'Get all IT assets' },
      { method: 'GET', path: '/itsm/assets/:id', description: 'Get specific asset details', needsId: 'itsm_asset' },
      { method: 'POST', path: '/itsm/assets', description: 'Register a new IT asset',
        body: { name: 'LAPTOP-NEW-001', type: 'Workstation', status: 'Active', owner: 'john.doe@acme.com', location: 'Building A - Floor 3' } },
      { method: 'PATCH', path: '/itsm/assets/:id/status', description: 'Update asset status', needsId: 'itsm_asset',
        body: { status: 'Maintenance' } },
      { method: 'GET', path: '/itsm/assets/by-type/:type', description: 'Get assets filtered by type (Server, Workstation, Network, etc.)' },
      { method: 'DELETE', path: '/itsm/assets/:id', description: 'Delete an asset permanently', needsId: 'itsm_asset' },
      { method: 'GET', path: '/itsm/assets/stats', description: 'Get asset inventory statistics' },
      { method: 'GET', path: '/itsm/assets/:id/history', description: 'Get asset change history', needsId: 'itsm_asset' }
    ]
  },
  'itsm-knowledge': {
    title: 'ITSM Knowledge Base',
    icon: '📚',
    description: 'Knowledge articles, runbooks, and self-service documentation',
    endpoints: [
      { method: 'GET', path: '/itsm/knowledge', description: 'Get all knowledge articles' },
      { method: 'GET', path: '/itsm/knowledge/:id', description: 'Get specific knowledge article', needsId: 'itsm_knowledge' },
      { method: 'POST', path: '/itsm/knowledge', description: 'Create a new knowledge article',
        body: { title: 'How to reset MFA token', category: 'Security', content: 'Step 1: Navigate to security settings...', tags: ['mfa', 'security', 'authentication'] } },
      { method: 'PATCH', path: '/itsm/knowledge/:id/publish', description: 'Publish a draft article', needsId: 'itsm_knowledge' },
      { method: 'PATCH', path: '/itsm/knowledge/:id/archive', description: 'Archive a knowledge article', needsId: 'itsm_knowledge' },
      { method: 'POST', path: '/itsm/knowledge/:id/helpful', description: 'Mark article as helpful', needsId: 'itsm_knowledge' },
      { method: 'POST', path: '/itsm/knowledge/:id/view', description: 'Track article view count', needsId: 'itsm_knowledge' },
      { method: 'GET', path: '/itsm/knowledge/search', description: 'Search knowledge base (append ?q=keyword)' },
      { method: 'GET', path: '/itsm/runbooks', description: 'Get all operational runbooks' },
      { method: 'POST', path: '/itsm/runbooks', description: 'Create a new runbook',
        body: { title: 'Server Restart Procedure', category: 'Infrastructure', steps: ['Check dependencies', 'Notify users', 'Restart service'] } },
      { method: 'POST', path: '/itsm/runbooks/:id/execute', description: 'Execute a runbook', needsId: 'itsm_runbook' },
      { method: 'DELETE', path: '/itsm/knowledge/:id', description: 'Delete a knowledge article permanently', needsId: 'itsm_knowledge' }
    ]
  },
  'itsm-reports': {
    title: 'ITSM Reports & Dashboard',
    icon: '📊',
    description: 'ITSM analytics, SLA compliance, and operational dashboards',
    endpoints: [
      { method: 'GET', path: '/itsm/dashboard/stats', description: 'Get dashboard aggregate statistics' },
      { method: 'GET', path: '/itsm/reports/incident-summary', description: 'Get incident summary report' },
      { method: 'GET', path: '/itsm/reports/sla-compliance', description: 'Get SLA compliance report' },
      { method: 'GET', path: '/itsm/reports/team-performance', description: 'Get team performance metrics' },
      { method: 'GET', path: '/itsm/reports/change-success-rate', description: 'Get change success rate report' },
      { method: 'GET', path: '/itsm/reports/request-fulfillment', description: 'Get request fulfillment report' },
      { method: 'GET', path: '/itsm/audit-log/recent', description: 'Get recent audit log entries' },
      { method: 'GET', path: '/itsm/audit-log/by-target/:targetId', description: 'Get audit log entries for a specific entity (e.g. INC-001)' },
      { method: 'GET', path: '/itsm/audit-log/by-actor/:actor', description: 'Get audit log entries by actor' }
    ]
  },
  'itsm-config': {
    title: 'ITSM Configuration & Admin',
    icon: '⚙️',
    description: 'Teams, technicians, SLA policies, catalog, and email templates',
    endpoints: [
      { method: 'GET', path: '/itsm/teams', description: 'Get all support teams' },
      { method: 'GET', path: '/itsm/technicians', description: 'Get all technicians' },
      { method: 'GET', path: '/itsm/catalog', description: 'Get service catalog items' },
      { method: 'GET', path: '/itsm/catalog/:id', description: 'Get specific catalog item', needsId: 'itsm_catalog' },
      { method: 'GET', path: '/itsm/customers', description: 'Get ITSM customer records' },
      { method: 'GET', path: '/itsm/policies', description: 'Get IT policies' },
      { method: 'GET', path: '/itsm/policies/by-category/:category', description: 'Get policies by category (Security, Access, etc.)' },
      { method: 'GET', path: '/itsm/policies/search', description: 'Search policies (append ?q=keyword)' },
      { method: 'GET', path: '/itsm/sla/configs', description: 'Get SLA configuration rules' },
      { method: 'GET', path: '/itsm/email-templates', description: 'Get email notification templates' },
      { method: 'GET', path: '/itsm/notifications', description: 'Get ITSM notifications' },
      { method: 'PATCH', path: '/itsm/notifications/:id/read', description: 'Mark notification as read', needsId: 'itsm_notification' },
      { method: 'POST', path: '/itsm/notifications/mark-all-read', description: 'Mark all notifications as read' },
      { method: 'POST', path: '/itsm/bulk-delete', description: 'Bulk delete multiple items from any collection',
        body: { collection: 'incidents', ids: ['INC-001', 'INC-002'] } },
      { method: 'POST', path: '/itsm/reset', description: 'Reset all ITSM data to defaults (admin)' }
    ]
  }
};

// ═══ INITIALIZATION ═══
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

async function initializeApp() {
  showLoadingOverlay('Initializing UiPath Workshop API...');
  
  try {
    // Update API URL display
    document.getElementById('api-url-display').textContent = state.apiBase;
    
    // Setup navigation
    setupNavigation();
    
    // Setup floating action button
    setupFloatingActionButton();
    
    // Check API health
    await checkApiHealth();
    
    // Pre-load sample IDs
    await loadSampleIds();
    
    // Render initial module
    await renderModule('welcome');
    
    // Start monitoring
    startHealthMonitoring();
    
    hideLoadingOverlay();
    showToast('API interface loaded successfully!', 'success');
    
  } catch (error) {
    hideLoadingOverlay();
    showToast('Failed to initialize API interface', 'error');
    console.error('Initialization error:', error);
  }
}

// ═══ NAVIGATION ═══
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const moduleKey = this.getAttribute('data-module');
      if (moduleKey) {
        setActiveModule(moduleKey);
      }
    });
  });
}

function setActiveModule(moduleKey) {
  // Update navigation state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const activeItem = document.querySelector(`[data-module="${moduleKey}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }

  // Update current module
  state.currentModule = moduleKey;
  
  // Render module with animation
  renderModule(moduleKey);
}

// ═══ MODULE RENDERING ═══
async function renderModule(moduleKey) {
  const module = modules[moduleKey];
  const contentArea = document.getElementById('content-area');
  
  if (!module) {
    showToast(`Module '${moduleKey}' not found`, 'error');
    return;
  }

  // Fade out current content
  contentArea.style.opacity = '0';
  contentArea.style.transform = 'translateY(10px)';
  
  setTimeout(async () => {
    let content = '';
    
    if (typeof module.content === 'function') {
      content = await module.content();
    } else if (module.endpoints) {
      content = renderEndpointsModule(module);
    }
    
    contentArea.innerHTML = content;
    
    // Fade in new content
    requestAnimationFrame(() => {
      contentArea.style.opacity = '1';
      contentArea.style.transform = 'translateY(0)';
    });
    
  }, 150);
}

function renderEndpointsModule(module) {
  return `
    <div class="module-header">
      <div class="module-icon">${module.icon}</div>
      <div class="module-title">
        <h2>${module.title}</h2>
        <div class="module-description">${module.description}</div>
      </div>
    </div>
    
    <div class="endpoints-grid">
      ${module.endpoints.map((endpoint, index) => 
        renderEndpointCard(endpoint, `${state.currentModule}-${index}`)
      ).join('')}
    </div>
  `;
}

function renderEndpointCard(endpoint, cardId) {
  const methodClass = `method-${endpoint.method.toLowerCase()}`;
  const hasBody = endpoint.body || endpoint.method === 'POST' || endpoint.method === 'PATCH';
  const needsParam = endpoint.needsId;

  return `
    <div class="endpoint-card" id="card-${cardId}">
      <div class="endpoint-header">
        <span class="method-badge ${methodClass}">${endpoint.method}</span>
        <span class="endpoint-path">${endpoint.path}</span>
      </div>
      <div class="endpoint-description">${endpoint.description}</div>
      
      ${needsParam ? `
        <div class="input-group">
          <label>${endpoint.needsId.toUpperCase()} ID:</label>
          <input type="text" id="param-${cardId}" placeholder="Auto-filled from API data">
        </div>
      ` : ''}
      
      ${hasBody ? `
        <div class="input-group">
          <label>Request Body (JSON):</label>
          <textarea id="body-${cardId}" placeholder="JSON request payload">${JSON.stringify(endpoint.body || {}, null, 2)}</textarea>
        </div>
      ` : ''}
      
      <button class="test-button" onclick="testEndpoint('${cardId}', '${endpoint.method}', '${endpoint.path}', ${!!needsParam}, ${!!hasBody})">
        <span class="button-text">Test Endpoint</span>
        <span class="button-icon">🚀</span>
      </button>
      
      <div class="response-area" id="response-${cardId}">
        <div class="response-content" id="response-content-${cardId}"></div>
      </div>
    </div>
  `;
}

// ═══ CONTENT GENERATORS ═══
async function generateWelcomeContent() {
  return `
    <div class="welcome-screen">
      <div class="welcome-icon">🚀</div>
      <h2>Welcome to UiPath Workshop API</h2>
      <p>This enterprise-grade API is deployed globally and ready for UiPath workflow demonstrations!</p>
      <p style="margin-top: 15px;"><strong>Live API:</strong> <code>${state.apiBase}</code></p>
      
      <div class="scenario-cards">
        <div class="scenario-card" onclick="loadScenarioEndpoints('employee-onboarding')">
          <h4>👥 Employee Onboarding</h4>
          <p>Track new employee progress, identify bottlenecks, and ensure smooth onboarding experiences</p>
        </div>
        <div class="scenario-card" onclick="loadScenarioEndpoints('invoice-approval')">
          <h4>💰 Invoice Approval</h4>
          <p>Automate invoice routing with vendor risk assessment and approval workflows</p>
        </div>
        <div class="scenario-card" onclick="loadScenarioEndpoints('customer-health')">
          <h4>🎯 Customer Health</h4>
          <p>Analyze customer risk factors and relationship metrics for retention strategies</p>
        </div>
        <div class="scenario-card" onclick="loadScenarioEndpoints('iot-maintenance')">
          <h4>🔧 IoT Maintenance</h4>
          <p>Optimize device maintenance schedules and prevent equipment failures</p>
        </div>
        <div class="scenario-card" onclick="loadScenarioEndpoints('sales-intelligence')">
          <h4>📊 Sales Intelligence</h4>
          <p>Forecast pipeline performance and prioritize high-value deals</p>
        </div>
      </div>
    </div>
  `;
}

async function generateStatsContent() {
  let healthData = { api: { endpoints: 87, collections: 26, totalRecords: 728 } };
  
  try {
    const response = await axios.get(`${state.apiBase.replace('/api', '')}/health`);
    healthData = response.data;
  } catch (error) {
    console.warn('Could not fetch health data:', error);
  }

  return `
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-number">${healthData.api?.endpoints || '87'}</span>
        <span class="stat-label">API Endpoints</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">${healthData.api?.collections || '26'}</span>
        <span class="stat-label">Data Collections</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">${healthData.api?.totalRecords || '728'}</span>
        <span class="stat-label">Total Records</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">${state.apiHealth.isOnline ? '🟢' : '🔴'}</span>
        <span class="stat-label">API Status</span>
      </div>
    </div>
    
    <div style="text-align: center; color: white; margin-top: 30px;">
      <h3>🌐 Production API Status</h3>
      <p style="margin-top: 15px;">Your UiPath Workshop API is running in ${healthData.environment || 'production'} mode with enterprise capabilities.</p>
      <p style="margin-top: 15px;"><strong>Average Response Time:</strong> ${state.apiHealth.responseTime}ms</p>
      
      <div style="margin-top: 30px; text-align: left; max-width: 700px; margin-left: auto; margin-right: auto;">
        <h4>🎯 Enterprise Features:</h4>
        <ul style="margin-top: 15px; line-height: 2;">
          <li><strong>Global Deployment:</strong> Available 24/7 from anywhere in the world</li>
          <li><strong>HTTPS Security:</strong> Encrypted connections for enterprise compliance</li>
          <li><strong>CORS Enabled:</strong> Compatible with all UiPath environments</li>
          <li><strong>Auto-Scaling:</strong> Handles multiple concurrent workshop participants</li>
          <li><strong>Real-time Data:</strong> Fresh data generated on every request</li>
          <li><strong>Health Monitoring:</strong> Built-in status and performance tracking</li>
        </ul>
        
        <h4 style="margin-top: 25px;">📊 Data Richness:</h4>
        <ul style="margin-top: 15px; line-height: 2;">
          <li><strong>HR Module:</strong> 41+ employees across 6 departments with performance data</li>
          <li><strong>Finance Module:</strong> 50+ invoices, expense reports, and vendor analytics</li>
          <li><strong>CRM Module:</strong> 25+ customers with relationship metrics and support history</li>
          <li><strong>IoT Module:</strong> 30+ devices with real-time telemetry and maintenance data</li>
          <li><strong>Cross-Module:</strong> Projects, analytics, and workflow integrations</li>
        </ul>
      </div>
    </div>
  `;
}

// ═══ API TESTING ═══
async function testEndpoint(cardId, method, path, needsParam, hasBody) {
  const button = document.querySelector(`#card-${cardId} .test-button`);
  const responseArea = document.getElementById(`response-${cardId}`);
  const responseContent = document.getElementById(`response-content-${cardId}`);
  
  // Start loading state
  setButtonLoading(button, true);
  showResponseArea(responseArea);
  responseContent.textContent = 'Executing API request...';

  let finalPath = path;
  let requestBody = null;
  const startTime = performance.now();

  try {
    // Handle ID parameter
    if (needsParam) {
      finalPath = await handleIdParameter(cardId, path, needsParam);
      if (!finalPath) {
        throw new Error(`${needsParam.toUpperCase()} ID is required`);
      }
    }

    // Handle request body
    if (hasBody) {
      requestBody = await handleRequestBody(cardId);
    }

    // Make API request
    const config = {
      method: method,
      url: `${state.apiBase}${finalPath}`,
      headers: { 'Content-Type': 'application/json' }
    };

    if (requestBody) {
      config.data = requestBody;
    }

    const response = await axios(config);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    // Update global stats
    state.testResults.passed++;
    state.testResults.total++;

    // Display success response
    displaySuccessResponse(responseContent, response, responseTime);
    showToast(`${method} ${path} - Success (${responseTime}ms)`, 'success');

  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    // Update global stats
    state.testResults.failed++;
    state.testResults.total++;

    // Display error response
    displayErrorResponse(responseContent, error, responseTime);
    showToast(`${method} ${path} - Failed`, 'error');
  }

  setButtonLoading(button, false);
}

async function handleIdParameter(cardId, path, needsParam) {
  const paramInput = document.getElementById(`param-${cardId}`);
  let paramValue = paramInput.value.trim();
  
  if (!paramValue) {
    paramValue = await getSampleId(needsParam);
    if (paramValue) {
      paramInput.value = paramValue;
      animateInput(paramInput);
    }
  }

  return paramValue ? path.replace(':id', paramValue) : null;
}

async function handleRequestBody(cardId) {
  const bodyInput = document.getElementById(`body-${cardId}`);
  let requestBody = null;
  
  if (bodyInput.value.trim()) {
    requestBody = JSON.parse(bodyInput.value);
    
    // Auto-fill worker IDs
    if (requestBody.workerId === '' && state.sampleIds.worker) {
      requestBody.workerId = state.sampleIds.worker;
      bodyInput.value = JSON.stringify(requestBody, null, 2);
      animateInput(bodyInput);
    }
    
    if (requestBody.assignedTo === '' && state.sampleIds.worker) {
      requestBody.assignedTo = state.sampleIds.worker;
      bodyInput.value = JSON.stringify(requestBody, null, 2);
      animateInput(bodyInput);
    }
  }
  
  return requestBody;
}

// ═══ RESPONSE DISPLAY ═══
function displaySuccessResponse(container, response, responseTime) {
  const dataLength = Array.isArray(response.data) ? response.data.length : 'Object';
  const statusClass = `status-${response.status}`;
  
  container.innerHTML = `
    <div style="color: #00ff88; margin-bottom: 10px; font-weight: 600;">
      ✅ <strong>${response.status} ${response.statusText}</strong> 
      <span class="${statusClass}">${response.status}</span>
    </div>
    <div style="color: #74b9ff; margin-bottom: 15px;">
      📊 Records: <strong>${dataLength}</strong> | 
      ⚡ Response: <strong>${responseTime}ms</strong> | 
      🕐 ${new Date().toLocaleTimeString()}
    </div>
    <div style="color: #fdcb6e; margin-bottom: 10px; font-weight: 600;">📋 Response Data:</div>
    <pre><code class="language-json">${typeof escapeHtml === 'function' ? escapeHtml(JSON.stringify(response.data, null, 2)) : JSON.stringify(response.data, null, 2)}</code></pre>
  `;

  // Apply syntax highlighting if Prism is available
  if (window.Prism) {
    window.Prism.highlightAllUnder(container);
  }
}

function displayErrorResponse(container, error, responseTime) {
  const status = error.response?.status || 'Network Error';
  const statusClass = error.response ? `status-${error.response.status}` : 'status-500';
  
  container.innerHTML = `
    <div style="color: #ff6b6b; margin-bottom: 10px; font-weight: 600;">
      ❌ <strong>Error: ${status}</strong> 
      <span class="${statusClass}">${status}</span>
    </div>
    <div style="color: #74b9ff; margin-bottom: 15px;">
      ⚡ Response: <strong>${responseTime}ms</strong> | 
      🕐 ${new Date().toLocaleTimeString()}
    </div>
    <div style="color: #fdcb6e; margin-bottom: 10px; font-weight: 600;">🔍 Error Details:</div>
    <pre><code class="language-json">${(function() {
      const raw = error.response ?
        JSON.stringify(error.response.data, null, 2) :
        JSON.stringify({message: error.message, type: 'Network Error'}, null, 2);
      return typeof escapeHtml === 'function' ? escapeHtml(raw) : raw;
    })()}</code></pre>
  `;
  
  if (window.Prism) {
    window.Prism.highlightAllUnder(container);
  }
}

// ═══ SAMPLE ID MANAGEMENT ═══
async function getSampleId(type) {
  if (state.sampleIds[type]) {
    return state.sampleIds[type];
  }

  const endpoints = {
    worker: '/hr/workers',
    invoice: '/finance/invoices',
    customer: '/crm/customers',
    device: '/iot/devices',
    opportunity: '/crm/opportunities',
    onboarding: '/hr/onboarding',
    legacy_submission: '/hr/legacy-portal/submissions',
    itsm_incident: '/itsm/incidents',
    itsm_change: '/itsm/changes',
    itsm_request: '/itsm/requests',
    itsm_problem: '/itsm/problems',
    itsm_asset: '/itsm/assets',
    itsm_knowledge: '/itsm/knowledge',
    itsm_runbook: '/itsm/runbooks',
    itsm_catalog: '/itsm/catalog',
    itsm_notification: '/itsm/notifications'
  };

  try {
    const response = await axios.get(`${state.apiBase}${endpoints[type]}`);
    if (response.data && response.data.length > 0) {
      state.sampleIds[type] = response.data[0].id;
      return state.sampleIds[type];
    }
  } catch (error) {
    console.warn(`Could not fetch sample ${type} ID:`, error);
  }

  return null;
}

async function loadSampleIds() {
  const promises = Object.keys(state.sampleIds).map(type => getSampleId(type));
  await Promise.all(promises);
}

// ═══ SCENARIO NAVIGATION ═══
function loadScenarioEndpoints(scenario) {
  const scenarioMappings = {
    'employee-onboarding': 'hr-onboarding',
    'invoice-approval': 'finance-invoices', 
    'customer-health': 'crm-customers',
    'iot-maintenance': 'iot-maintenance',
    'sales-intelligence': 'crm-sales'
  };

  const module = scenarioMappings[scenario];
  if (module) {
    setActiveModule(module);
    showToast(`Loaded ${scenario.replace('-', ' ')} scenario`, 'success');
  }
}

// ═══ API HEALTH MONITORING ═══
async function checkApiHealth() {
  const startTime = performance.now();
  
  try {
    const response = await axios.get(`${state.apiBase.replace('/api', '')}/health`);
    const endTime = performance.now();
    
    state.apiHealth = {
      isOnline: true,
      responseTime: Math.round(endTime - startTime),
      lastCheck: new Date(),
      data: response.data
    };
    
    updateConnectionStatus(true);
    updateResponseTime(state.apiHealth.responseTime);
    
  } catch (error) {
    state.apiHealth.isOnline = false;
    updateConnectionStatus(false);
    console.warn('API health check failed:', error);
  }
}

function updateConnectionStatus(isOnline) {
  const statusEl = document.getElementById('connection-status');
  if (statusEl) {
    statusEl.textContent = isOnline ? '⚡' : '❌';
    statusEl.style.color = isOnline ? '#00b894' : '#e17055';
  }
}

function updateResponseTime(time) {
  const timeEl = document.getElementById('response-time');
  if (timeEl) {
    timeEl.textContent = `${time}ms`;
    timeEl.style.color = time < 100 ? '#00b894' : time < 500 ? '#fdcb6e' : '#e17055';
  }
}

// ═══ FLOATING ACTION BUTTON ═══
function setupFloatingActionButton() {
  const fab = document.getElementById('fab');
  const quickActions = document.getElementById('quick-actions');
  let isOpen = false;

  fab.addEventListener('click', () => {
    isOpen = !isOpen;
    quickActions.classList.toggle('show', isOpen);
    fab.style.transform = isOpen ? 'rotate(45deg) scale(1.1)' : 'rotate(0deg) scale(1)';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!fab.contains(e.target) && !quickActions.contains(e.target) && isOpen) {
      isOpen = false;
      quickActions.classList.remove('show');
      fab.style.transform = 'rotate(0deg) scale(1)';
    }
  });
}

// ═══ QUICK ACTIONS ═══
async function testAllEndpoints() {
  showLoadingOverlay('Testing all available endpoints...');
  
  const testEndpoints = [
    '/hr/workers',
    '/finance/invoices',
    '/crm/customers', 
    '/iot/devices',
    '/hr/onboarding',
    '/finance/summaries',
    '/crm/pipeline/forecast',
    '/iot/alerts',
    '/projects',
    '/notifications'
  ];

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const endpoint of testEndpoints) {
    try {
      const startTime = performance.now();
      const response = await axios.get(`${state.apiBase}${endpoint}`);
      const responseTime = Math.round(performance.now() - startTime);
      
      passed++;
      results.push({ endpoint, status: 'success', responseTime, records: response.data?.length || 'N/A' });
    } catch (error) {
      failed++;
      results.push({ endpoint, status: 'error', error: error.message });
    }
  }

  hideLoadingOverlay();
  
  console.table(results);
  showToast(`Bulk test complete: ${passed} passed, ${failed} failed`, passed > failed ? 'success' : 'warning');
  
  // Update global stats
  state.testResults.passed += passed;
  state.testResults.failed += failed;
  state.testResults.total += testEndpoints.length;
}

async function refreshData() {
  showLoadingOverlay('Refreshing API data and interface...');
  
  try {
    await checkApiHealth();
    await loadSampleIds();
    await renderModule(state.currentModule);
    
    hideLoadingOverlay();
    showToast('Interface refreshed successfully!', 'success');
  } catch (error) {
    hideLoadingOverlay();
    showToast('Failed to refresh interface', 'error');
    console.error('Refresh error:', error);
  }
}

function exportResults() {
  const results = {
    timestamp: new Date().toISOString(),
    apiBase: state.apiBase,
    health: state.apiHealth,
    testResults: state.testResults,
    sampleIds: state.sampleIds,
    sessionInfo: {
      currentModule: state.currentModule,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    }
  };

  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `uipath-api-session-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('Session data exported successfully!', 'success');
}

// ═══ UI HELPERS ═══
function setButtonLoading(button, loading) {
  if (loading) {
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span> Testing...';
  } else {
    button.disabled = false;
    button.innerHTML = '<span class="button-text">Test Endpoint</span><span class="button-icon">🚀</span>';
  }
}

function showResponseArea(area) {
  area.style.display = 'block';
  setTimeout(() => area.classList.add('show'), 10);
}

function animateInput(input) {
  input.style.background = 'rgba(255, 105, 0, 0.2)';
  input.style.transform = 'scale(1.02)';
  setTimeout(() => {
    input.style.background = 'rgba(255, 255, 255, 0.05)';
    input.style.transform = 'scale(1)';
  }, 1000);
}

function showLoadingOverlay(message) {
  const overlay = document.getElementById('loading-overlay');
  const text = overlay.querySelector('.spinner-text');
  text.textContent = message;
  overlay.classList.add('show');
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.remove('show');
}

// ═══ TOAST NOTIFICATIONS ═══
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✅',
    error: '❌', 
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 1.2rem;">${icons[type]}</span>
      <span style="font-weight: 500;">${message}</span>
    </div>
  `;
  
  container.appendChild(toast);
  
  // Show toast with animation
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 300);
  }, 4000);
}

// ═══ PERIODIC HEALTH CHECKS ═══
function startHealthMonitoring() {
  // Check health every 30 seconds
  setInterval(checkApiHealth, 30000);
  
  // Initial health check
  setTimeout(checkApiHealth, 2000);
}

// ═══ KEYBOARD SHORTCUTS ═══
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + R: Refresh data
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault();
    refreshData();
  }
  
  // Escape: Close quick actions
  if (e.key === 'Escape') {
    const quickActions = document.getElementById('quick-actions');
    const fab = document.getElementById('fab');
    quickActions.classList.remove('show');
    fab.style.transform = 'rotate(0deg) scale(1)';
  }
  
  // Ctrl/Cmd + E: Export results
  if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
    e.preventDefault();
    exportResults();
  }
});

// ═══ PERFORMANCE TRACKING ═══
function trackPerformance() {
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`🚀 Interface loaded in ${Math.round(loadTime)}ms`);
    
    if (loadTime > 2000) {
      showToast('Interface loaded (slow connection detected)', 'warning');
    }
  });
}

// ═══ ERROR HANDLING ═══
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  showToast('An unexpected error occurred', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  showToast('API request failed unexpectedly', 'error');
});

// ═══ STARTUP ═══
document.addEventListener('DOMContentLoaded', () => {
  trackPerformance();
});

// ═══ CONSOLE BRANDING ═══
console.log(`
%c🚀 UiPath Workshop API Interface
%cEnterprise-grade testing environment
%cAPI: ${state.apiBase}
%cKeyboard shortcuts: Ctrl+R (refresh), Ctrl+E (export), Esc (close menus)
`, 
'color: #ff6900; font-size: 16px; font-weight: bold;',
'color: #667eea; font-size: 12px;',
'color: #636e72; font-size: 11px; font-family: monospace;',
'color: #74b9ff; font-size: 10px;'
);

// ═══ UTILITY FUNCTIONS ═══
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// ═══ ACCESSIBILITY ENHANCEMENTS ═══
function enhanceAccessibility() {
  // Add focus management for better keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
  });

  // Announce page changes to screen readers
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  document.body.appendChild(announcer);

  // Update announcer when module changes
  const originalSetActiveModule = setActiveModule;
  setActiveModule = function(moduleKey) {
    originalSetActiveModule(moduleKey);
    const module = modules[moduleKey];
    if (module) {
      announcer.textContent = `Loaded ${module.title} module`;
    }
  };
}

// Initialize accessibility enhancements
document.addEventListener('DOMContentLoaded', enhanceAccessibility);

// ═══ DEVELOPMENT HELPERS ═══
if (window.location.hostname === 'localhost') {
  // Development mode helpers
  window.uipathAPI = {
    state,
    modules,
    testEndpoint,
    checkApiHealth,
    exportResults
  };
  
  console.log('🛠️ Development mode: uipathAPI object available in console');
}