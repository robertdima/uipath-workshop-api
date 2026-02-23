/* server.js - Self-Contained UiPath Workshop API */
const jsonServer = require('json-server');
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

// Use dynamic port for deployment platforms
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`🌍 Starting UiPath Workshop API in ${NODE_ENV} mode`);
console.log(`🚀 Port: ${PORT}`);

// ═══════════════════════════════════════════════════════════════════════════
// BUILT-IN DATA GENERATOR (No external db.js file needed)
// ═══════════════════════════════════════════════════════════════════════════

function generateDatabase() {
  console.log('🔄 Generating database with built-in generator...');
  
  const rand = faker.helpers.arrayElement;
  const uuid = () => faker.string.uuid();
  const amount = () => faker.number.float({ min: 100, max: 5000, precision: 0.01 });
  const date = (days = 30) => faker.date.recent({ days }).toISOString().slice(0, 10);
  const futureDate = (days = 30) => faker.date.soon({ days }).toISOString().slice(0, 10);

  // ── HR Data ──
  // Departments aligned with Legacy Portal dropdown options
  const departments = ['Engineering', 'Marketing', 'Sales', 'Finance', 'Human Resources', 'Operations', 'Legal', 'IT', 'Customer Support', 'Product', 'Research', 'Quality Assurance'];
  
  const managers = Array.from({ length: departments.length }, (_, i) => ({
    id: uuid(),
    descriptor: faker.person.fullName(),
    primaryWorkEmail: faker.internet.email(),
    isActive: true,
    managerId: null,
    department: departments[i],
    supervisoryOrgId: `org_${departments[i].replace(/\s+/g, '_').toLowerCase()}`,
    primaryJob: {
      title: `${departments[i]} Manager`,
      department: departments[i],
      level: 'Manager',
      salary: faker.number.int({ min: 80000, max: 120000 })
    },
    startDate: faker.date.past({ years: 3 }).toISOString().slice(0, 10),
    location: rand(['New York', 'San Francisco', 'Austin', 'Remote'])
  }));

  const employees = Array.from({ length: 35 }, () => {
    const dept = rand(departments);
    const manager = managers.find(m => m.department === dept);
    return {
      id: uuid(),
      descriptor: faker.person.fullName(),
      primaryWorkEmail: faker.internet.email(),
      isActive: faker.datatype.boolean({ probability: 0.9 }),
      managerId: manager?.id,
      department: dept,
      supervisoryOrgId: manager?.supervisoryOrgId,
      primaryJob: {
        title: rand(['Senior Engineer', 'Engineer', 'Analyst', 'Specialist', 'Coordinator']),
        department: dept,
        level: rand(['Senior', 'Mid', 'Junior']),
        salary: faker.number.int({ min: 45000, max: 95000 })
      },
      startDate: faker.date.past({ years: 2 }).toISOString().slice(0, 10),
      location: rand(['New York', 'San Francisco', 'Austin', 'Remote'])
    };
  });

  const hr_workers = [...managers, ...employees];
  const workerIds = hr_workers.map(w => w.id);

  // ── Finance Data ──
  const finance_invoices = Array.from({ length: 50 }, () => ({
    id: `INV-${faker.number.int({ min: 80000, max: 99999 })}`,
    vendorName: faker.company.name(),
    amount: amount(),
    currency: 'USD',
    status: rand(['pending', 'approved', 'paid', 'rejected', 'overdue']),
    dueDate: faker.date.soon({ days: 60 }).toISOString().slice(0, 10),
    category: rand(['Software', 'Office Supplies', 'Travel', 'Consulting', 'Utilities']),
    submittedDate: faker.date.past({ days: 45 }).toISOString().slice(0, 10)
  }));

  const finance_expenses = Array.from({ length: 60 }, () => ({
    id: `EXP-${faker.number.int({ min: 70000, max: 79999 })}`,
    workerId: rand(workerIds),
    description: rand(['Business Travel', 'Client Dinner', 'Office Supplies', 'Training Course']),
    amount: faker.number.float({ min: 25, max: 2500, precision: 0.01 }),
    currency: 'USD',
    status: rand(['submitted', 'approved', 'reimbursed', 'rejected']),
    submitDate: date(30),
    category: rand(['Travel', 'Meals', 'Supplies', 'Training', 'Other'])
  }));

  // ── CRM Data ──
  const crm_customers = Array.from({ length: 25 }, () => ({
    id: `CUST-${faker.number.int({ min: 10000, max: 99999 })}`,
    companyName: faker.company.name(),
    status: rand(['active', 'prospect', 'churned', 'at_risk']),
    tier: rand(['Enterprise', 'Mid-Market', 'SMB']),
    industry: rand(['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail']),
    contractValue: faker.number.int({ min: 10000, max: 500000 }),
    renewalDate: futureDate(365),
    healthScore: faker.number.int({ min: 1, max: 100 }),
    primaryContact: faker.person.fullName(),
    contactEmail: faker.internet.email()
  }));

  const crm_opportunities = crm_customers.slice(0, 15).map(c => ({
    id: `OPP-${faker.number.int({ min: 3000, max: 3999 })}`,
    customerId: c.id,
    title: `${rand(['Software License', 'Consulting Services', 'Support Contract'])} - ${c.companyName}`,
    stage: rand(['Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']),
    amount: faker.number.int({ min: 10000, max: 150000 }),
    currency: 'USD',
    probability: faker.number.int({ min: 10, max: 95 }),
    score: faker.number.int({ min: 1, max: 100 }),
    expectedCloseDate: futureDate(90),
    assignedTo: faker.person.fullName()
  }));

  // ── IoT Data ──
  const iot_devices = Array.from({ length: 30 }, () => ({
    id: `DEV-${faker.number.int({ min: 555000, max: 555999 })}`,
    name: faker.commerce.productName(),
    type: rand(['temperatureSensor', 'doorSensor', 'camera', 'motionDetector', 'smokeDetector']),
    status: rand(['online', 'offline', 'maintenance']),
    battery: faker.number.int({ min: 5, max: 100 }),
    location: rand(['Building A', 'Building B', 'Warehouse', 'Parking Lot']),
    assignedTo: faker.person.fullName(),
    lastMaintenance: date(90),
    nextMaintenance: futureDate(30)
  }));

  // ── Extended Collections ──
  const projects = crm_customers.slice(0, 8).map(c => ({
    id: `PROJ-${faker.number.int({ min: 1000, max: 1999 })}`,
    name: `${rand(['Implementation', 'Migration', 'Upgrade'])} - ${c.companyName}`,
    customerId: c.id,
    status: rand(['planning', 'active', 'on_hold', 'completed']),
    budget: faker.number.int({ min: 25000, max: 200000 }),
    riskLevel: rand(['Low', 'Medium', 'High'])
  }));

  return {
    // ═══ HR ═══
    hr_workers,
    hr_orgs: departments.map((dept, i) => ({
      id: `org_${dept.replace(/\s+/g, '_').toLowerCase()}`,
      descriptor: `${dept} Division`,
      headId: managers[i]?.id
    })),
    hr_worker_performance: workerIds.map(id => ({
      id: uuid(),
      workerId: id,
      period: '2025-Q2',
      rating: rand(['Exceeds', 'Meets', 'Below', 'Outstanding']),
      score: faker.number.float({ min: 2.5, max: 5, precision: 0.1 }),
      goals: faker.number.int({ min: 3, max: 8 }),
      goalsCompleted: faker.number.int({ min: 1, max: 6 }),
      reviewDate: date(60),
      nextReviewDate: futureDate(90)
    })),
    hr_onboardings: (() => {
      // Create 6 default onboarding records with realistic data
      const defaultOnboardings = [];
      // Select from employees only (not managers) so they have valid manager assignments
      const selectedWorkers = employees.slice(0, 6);
      const statuses = [
        'pending', 'pending',
        'in-progress', 'in-progress',
        'completed', 'completed'
      ];

      selectedWorkers.forEach((worker, index) => {
        const nameParts = worker.descriptor.split(' ');
        const status = statuses[index];

        // Remove common titles and clean up name
        let firstName, lastName;
        if (nameParts[0].match(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Miss)$/)) {
          // Title is first word, skip it
          firstName = nameParts[1] || 'Unknown';
          lastName = nameParts.slice(2).join(' ') || 'Worker';
        } else {
          // No title
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ') || 'Worker';
        }

        // Generate matching email based on cleaned name
        const cleanLastName = lastName.split(' ')[0]; // Take first word of last name
        const email = `${firstName.toLowerCase()}.${cleanLastName.toLowerCase()}@company.com`;

        defaultOnboardings.push({
          id: uuid(),
          workerId: worker.id,
          employeeId: `WRK-${String(index + 1).padStart(3, '0')}`,
          firstName: firstName,
          lastName: lastName,
          workerName: worker.descriptor,
          email: email,
          department: worker.department,
          position: worker.primaryJob.title,
          jobTitle: worker.primaryJob.title,
          manager: managers.find(m => m.id === worker.managerId)?.descriptor || 'Not Assigned',
          status: status,
          startDate: status === 'completed'
            ? faker.date.recent({ days: 45 }).toISOString().slice(0, 10)
            : status === 'in-progress'
            ? faker.date.recent({ days: 15 }).toISOString().slice(0, 10)
            : futureDate(30),
          expectedCompletionDate: futureDate(14),
          completedTasks: status === 'completed' ? 10 : status === 'in-progress' ? faker.number.int({ min: 3, max: 7 }) : 0,
          totalTasks: 10,
          assignedBuddy: rand(workerIds),
          equipmentAssigned: status !== 'pending',
          accessGranted: status === 'completed',
          // Stagger timestamps so records sort properly (higher index = older record)
          lastUpdated: new Date(Date.now() - (index * 60000)).toISOString(),
          updatedBy: status === 'completed' ? 'System' : status === 'in-progress' ? 'HR Team' : 'Automated',
          notes: status === 'pending' ? 'Awaiting start date' : status === 'in-progress' ? 'Equipment setup in progress' : 'Onboarding completed successfully',
          source: 'Dashboard'
        });
      });

      return defaultOnboardings;
    })(),

    // ═══ Finance ═══
    finance_invoices,
    finance_expenses,
    budget_variance: departments.map(dept => ({
      id: uuid(),
      department: dept,
      budgeted: faker.number.int({ min: 50000, max: 500000 }),
      actual: faker.number.int({ min: 45000, max: 520000 }),
      variance: faker.number.float({ min: -20, max: 15, precision: 0.1 }),
      period: '2025-Q2'
    })),
    financial_summaries: ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'].map(month => ({
      id: uuid(),
      period: month,
      revenue: faker.number.int({ min: 800000, max: 1200000 }),
      expenses: faker.number.int({ min: 600000, max: 900000 }),
      profit: faker.number.int({ min: 100000, max: 400000 }),
      invoicesPaid: faker.number.int({ min: 45, max: 65 }),
      invoicesPending: faker.number.int({ min: 5, max: 15 })
    })),
    vendor_performance: [...new Set(finance_invoices.map(i => i.vendorName))].map(vendor => ({
      id: uuid(),
      vendorName: vendor,
      totalInvoices: faker.number.int({ min: 5, max: 25 }),
      totalValue: faker.number.int({ min: 50000, max: 300000 }),
      onTimePayments: faker.number.int({ min: 80, max: 100 }),
      qualityRating: faker.number.float({ min: 3.5, max: 5, precision: 0.1 }),
      riskScore: rand(['Low', 'Medium', 'High'])
    })),

    // ═══ CRM ═══
    crm_customers,
    crm_opportunities,
    crm_orders: crm_customers.slice(0, 12).map(c => ({
      id: `ORD-${faker.number.int({ min: 5000, max: 5999 })}`,
      customerId: c.id,
      total: faker.number.int({ min: 5000, max: 50000 }),
      currency: 'USD',
      status: rand(['fulfilled', 'processing', 'cancelled', 'shipped']),
      orderDate: faker.date.past({ years: 1 }).toISOString().slice(0, 10)
    })),
    crm_support_tickets: crm_customers.slice(0, 18).map(c => ({
      id: `TICK-${faker.number.int({ min: 5000, max: 5999 })}`,
      customerId: c.id,
      subject: faker.lorem.sentence(),
      status: rand(['open', 'pending', 'resolved', 'closed']),
      priority: rand(['low', 'medium', 'high', 'urgent']),
      category: rand(['Technical', 'Billing', 'Feature Request', 'Bug Report']),
      createdDate: date(60),
      assignedAgent: faker.person.fullName()
    })),
    crm_renewals: crm_customers.filter(c => c.status === 'active').map(c => ({
      id: uuid(),
      customerId: c.id,
      contractType: rand(['Annual', 'Multi-year', 'Month-to-month']),
      currentValue: c.contractValue,
      renewalDate: c.renewalDate,
      renewalRisk: rand(['Low', 'Medium', 'High']),
      contactAttempts: faker.number.int({ min: 0, max: 5 })
    })),
    sales_pipeline_reports: ['Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'].map(stage => ({
      id: uuid(),
      stage: stage,
      count: faker.number.int({ min: 5, max: 25 }),
      totalValue: faker.number.int({ min: 50000, max: 500000 }),
      avgDealSize: faker.number.int({ min: 15000, max: 75000 }),
      avgTimeInStage: faker.number.int({ min: 10, max: 45 })
    })),

    // ═══ IoT ═══
    iot_devices,
    iot_telemetry: iot_devices.flatMap(d =>
      Array.from({ length: 6 }, () => ({
        id: uuid(),
        deviceId: d.id,
        timestamp: faker.date.recent({ days: 7 }).toISOString(),
        data: {
          temperature: faker.number.float({ min: 15, max: 35, precision: 0.1 }),
          humidity: faker.number.int({ min: 20, max: 80 })
        },
        quality: rand(['good', 'fair', 'poor']),
        batteryLevel: faker.number.int({ min: 10, max: 100 })
      }))
    ),
    iot_alerts: iot_devices.slice(0, 12).map(d => ({
      id: uuid(),
      deviceId: d.id,
      alertType: rand(['battery_low', 'offline', 'anomaly', 'maintenance_due']),
      severity: rand(['low', 'medium', 'high', 'critical']),
      message: faker.lorem.sentence(),
      timestamp: faker.date.recent({ days: 7 }).toISOString(),
      acknowledged: faker.datatype.boolean({ probability: 0.7 })
    })),
    iot_maintenance: iot_devices.map(d => ({
      id: uuid(),
      deviceId: d.id,
      scheduledDate: d.nextMaintenance,
      type: rand(['Routine', 'Repair', 'Calibration', 'Replacement']),
      status: rand(['scheduled', 'in_progress', 'completed', 'overdue']),
      technician: faker.person.fullName(),
      estimatedCost: faker.number.int({ min: 50, max: 500 })
    })),

    // ═══ Projects ═══
    projects,
    project_resources: projects.flatMap(p => 
      faker.helpers.arrayElements(hr_workers, { min: 2, max: 5 }).map(w => ({
        id: uuid(),
        projectId: p.id,
        workerId: w.id,
        role: rand(['Developer', 'Analyst', 'QA', 'Designer']),
        allocation: faker.number.int({ min: 25, max: 100 })
      }))
    ),

    // ═══ Analytics & Reporting ═══
    integration_employee_reports: departments.map(dept => {
      const deptWorkers = hr_workers.filter(w => w.department === dept);
      return {
        id: uuid(),
        department: dept,
        headcount: deptWorkers.length,
        activeEmployees: deptWorkers.filter(w => w.isActive).length,
        avgTenure: faker.number.float({ min: 1.2, max: 4.5, precision: 0.1 }),
        avgSalary: faker.number.int({ min: 55000, max: 85000 }),
        turnoverRate: faker.number.float({ min: 5, max: 15, precision: 0.1 })
      };
    }),
    notifications: Array.from({ length: 25 }, () => ({
      id: uuid(),
      recipientId: rand(workerIds),
      type: rand(['approval_required', 'deadline_reminder', 'system_alert', 'task_assigned']),
      title: faker.lorem.words(4),
      message: faker.lorem.sentence(),
      priority: rand(['low', 'medium', 'high']),
      isRead: faker.datatype.boolean({ probability: 0.6 }),
      createdDate: faker.date.recent({ days: 14 }).toISOString(),
      actionRequired: faker.datatype.boolean({ probability: 0.4 })
    })),
    workflow_triggers: Array.from({ length: 10 }, () => ({
      id: uuid(),
      workflowName: rand(['Invoice Approval', 'Employee Onboarding', 'Expense Processing', 'Customer Renewal']),
      triggerType: rand(['manual', 'scheduled', 'event-driven']),
      status: rand(['active', 'paused', 'error']),
      lastRun: faker.date.recent({ days: 7 }).toISOString(),
      nextRun: futureDate(7),
      successRate: faker.number.float({ min: 85, max: 99, precision: 0.1 }),
      avgExecutionTime: faker.number.int({ min: 30, max: 300 })
    })),
    employee_profiles: hr_workers.map(w => ({
      id: uuid(),
      workerId: w.id,
      totalProjects: faker.number.int({ min: 1, max: 8 }),
      skillsCount: faker.number.int({ min: 3, max: 12 }),
      certificationsCount: faker.number.int({ min: 0, max: 5 }),
      performanceScore: faker.number.float({ min: 3, max: 5, precision: 0.1 })
    })),
    customer_relationships: crm_customers.map(c => ({
      id: uuid(),
      customerId: c.id,
      relationshipManager: rand(hr_workers.filter(w => w.department === 'Sales')).id,
      engagementScore: faker.number.int({ min: 1, max: 10 }),
      satisfactionScore: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
      lastInteraction: date(30),
      totalInteractions: faker.number.int({ min: 5, max: 50 })
    })),

    // ═══ ITSM ═══

    // ITSM Teams (aligned with ITSM Console app)
    itsm_teams: [
      { id: 'TEAM-001', name: 'Service Desk', description: 'First-line support and triage', lead: 'USR-001', email: 'servicedesk@acme.com', oncallPhone: '+1-555-0100', members: ['USR-001', 'USR-002', 'USR-007'] },
      { id: 'TEAM-002', name: 'Network Team', description: 'Network infrastructure and connectivity', lead: 'USR-003', email: 'network@acme.com', oncallPhone: '+1-555-0200', members: ['USR-003'] },
      { id: 'TEAM-003', name: 'Application Support', description: 'Business application support and maintenance', lead: 'USR-004', email: 'appsupport@acme.com', oncallPhone: '+1-555-0300', members: ['USR-004'] },
      { id: 'TEAM-004', name: 'Server Team', description: 'Server infrastructure and administration', lead: 'USR-005', email: 'servers@acme.com', oncallPhone: '+1-555-0400', members: ['USR-005'] },
      { id: 'TEAM-005', name: 'Identity Team', description: 'Identity and access management', lead: 'USR-006', email: 'identity@acme.com', oncallPhone: '+1-555-0500', members: ['USR-006'] },
      { id: 'TEAM-006', name: 'Release Team', description: 'Deployment and release management', lead: 'USR-004', email: 'releases@acme.com', oncallPhone: '+1-555-0600', members: ['USR-004', 'USR-005'] }
    ],

    // ITSM Technicians (aligned with ITSM Console app)
    itsm_technicians: [
      { id: 'USR-001', name: 'Alex Thompson', email: 'alex.thompson@acme.com', team: 'Service Desk', skills: ['Hardware', 'Email', 'General'], workload: 4, maxWorkload: 8, available: true, phone: '+1-555-1001' },
      { id: 'USR-002', name: 'Maria Garcia', email: 'maria.garcia@acme.com', team: 'Service Desk', skills: ['Application', 'Email', 'Mobile'], workload: 3, maxWorkload: 8, available: true, phone: '+1-555-1002' },
      { id: 'USR-003', name: 'James Chen', email: 'james.chen@acme.com', team: 'Network Team', skills: ['Network', 'VPN', 'Firewall'], workload: 2, maxWorkload: 6, available: true, phone: '+1-555-1003' },
      { id: 'USR-004', name: 'Sarah Miller', email: 'sarah.miller@acme.com', team: 'Application Support', skills: ['CRM', 'ERP', '.NET'], workload: 2, maxWorkload: 6, available: true, phone: '+1-555-1004' },
      { id: 'USR-005', name: 'Michael Brown', email: 'michael.brown@acme.com', team: 'Server Team', skills: ['Windows Server', 'Linux', 'Virtualization'], workload: 3, maxWorkload: 6, available: true, phone: '+1-555-1005' },
      { id: 'USR-006', name: 'Emily Davis', email: 'emily.davis@acme.com', team: 'Identity Team', skills: ['Active Directory', 'MFA', 'SSO'], workload: 1, maxWorkload: 6, available: true, phone: '+1-555-1006' },
      { id: 'USR-007', name: 'Robert Wilson', email: 'robert.wilson@acme.com', team: 'Service Desk', skills: ['Hardware', 'Printer', 'General'], workload: 5, maxWorkload: 8, available: true, phone: '+1-555-1007' }
    ],

    // ITSM Customers (aligned with ITSM Console app)
    itsm_customers: [
      { id: 'CUST-001', name: 'John Smith', email: 'john.smith@acme.com', phone: '+1-555-0123', department: 'Sales', location: 'Building A, Floor 2', manager: 'jane.doe@acme.com', vip: false, preferredContact: 'email', recentTickets: ['INC-001'] },
      { id: 'CUST-002', name: 'Mary Jones', email: 'mary.jones@acme.com', phone: '+1-555-0124', department: 'Sales', location: 'Building A, Floor 2', manager: 'jane.doe@acme.com', vip: true, preferredContact: 'phone', recentTickets: ['INC-002'] },
      { id: 'CUST-003', name: 'David Wilson', email: 'david.wilson@acme.com', phone: '+1-555-0125', department: 'Marketing', location: 'Building B, Floor 1', manager: 'tom.baker@acme.com', vip: false, preferredContact: 'email', recentTickets: ['INC-003'] },
      { id: 'CUST-004', name: 'Sarah Chen', email: 'sarah.chen@acme.com', phone: '+1-555-0126', department: 'Finance', location: 'Building A, Floor 3', manager: 'lisa.wong@acme.com', vip: true, preferredContact: 'phone', recentTickets: ['INC-004'] },
      { id: 'CUST-005', name: 'Jane Doe', email: 'jane.doe@acme.com', phone: '+1-555-0127', department: 'Sales', location: 'Building A, Floor 2', manager: 'ceo@acme.com', vip: true, preferredContact: 'email', recentTickets: [] },
      { id: 'CUST-006', name: 'Tom Baker', email: 'tom.baker@acme.com', phone: '+1-555-0128', department: 'Marketing', location: 'Building B, Floor 1', manager: 'ceo@acme.com', vip: false, preferredContact: 'email', recentTickets: [] },
      { id: 'CUST-007', name: 'Lisa Wong', email: 'lisa.wong@acme.com', phone: '+1-555-0129', department: 'Finance', location: 'Building A, Floor 3', manager: 'cfo@acme.com', vip: true, preferredContact: 'phone', recentTickets: [] }
    ],

    // ITSM SLA Configs
    itsm_sla_configs: [
      { id: uuid(), priority: 'P1', responseTimeMinutes: 15, resolutionTimeMinutes: 60, businessHoursOnly: false, escalationPolicy: 'auto-escalate' },
      { id: uuid(), priority: 'P2', responseTimeMinutes: 60, resolutionTimeMinutes: 240, businessHoursOnly: false, escalationPolicy: 'notify-manager' },
      { id: uuid(), priority: 'P3', responseTimeMinutes: 240, resolutionTimeMinutes: 480, businessHoursOnly: true, escalationPolicy: 'notify-manager' },
      { id: uuid(), priority: 'P4', responseTimeMinutes: 480, resolutionTimeMinutes: 1440, businessHoursOnly: true, escalationPolicy: 'none' }
    ],

    // ITSM Email Templates
    itsm_email_templates: [
      { id: uuid(), name: 'Incident Created', subject: 'Incident {{ticket_id}} has been created', body: 'Dear {{caller_name}},\n\nYour incident {{ticket_id}} regarding "{{title}}" has been received and assigned to {{assigned_to}}.\n\nWe will update you on progress.\n\nBest regards,\nIT Service Desk', placeholders: ['{{ticket_id}}', '{{caller_name}}', '{{title}}', '{{assigned_to}}'], active: true, lastUsed: date(3) },
      { id: uuid(), name: 'Incident Resolved', subject: 'Incident {{ticket_id}} has been resolved', body: 'Dear {{caller_name}},\n\nYour incident {{ticket_id}} has been resolved.\n\nResolution: {{resolution}}\n\nIf the issue persists, please reply to this email.\n\nBest regards,\nIT Service Desk', placeholders: ['{{ticket_id}}', '{{caller_name}}', '{{resolution}}'], active: true, lastUsed: date(5) },
      { id: uuid(), name: 'Change Scheduled', subject: 'Change {{ticket_id}} is scheduled', body: 'Dear team,\n\nChange {{ticket_id}} "{{title}}" has been scheduled.\n\nWindow: {{scheduled_start}} - {{scheduled_end}}\n\nPlease ensure all preparations are complete.\n\nBest regards,\nChange Management', placeholders: ['{{ticket_id}}', '{{title}}', '{{scheduled_start}}', '{{scheduled_end}}'], active: true, lastUsed: date(7) },
      { id: uuid(), name: 'Request Approved', subject: 'Service Request {{ticket_id}} has been approved', body: 'Dear {{caller_name}},\n\nYour service request {{ticket_id}} has been approved and is now being processed.\n\nExpected fulfillment: {{fulfillment_time}}\n\nBest regards,\nIT Service Desk', placeholders: ['{{ticket_id}}', '{{caller_name}}', '{{fulfillment_time}}'], active: true, lastUsed: date(2) },
      { id: uuid(), name: 'SLA Warning', subject: 'SLA Warning for {{ticket_id}}', body: 'ALERT: Incident {{ticket_id}} is approaching its SLA target.\n\nPriority: {{priority}}\nSLA Target: {{sla_target}}\nAssigned to: {{assigned_to}}\n\nPlease take immediate action.', placeholders: ['{{ticket_id}}', '{{priority}}', '{{sla_target}}', '{{assigned_to}}'], active: true, lastUsed: date(1) }
    ],

    // ITSM Incidents (curated data aligned with ITSM Console app)
    itsm_incidents: [
      {
        id: 'INC-001', title: 'VPN connection drops frequently',
        description: 'User reports VPN disconnects every 15-20 minutes. Started after recent Windows update. Error log attached.',
        callerName: 'John Smith', callerEmail: 'john.smith@acme.com', callerPhone: '+1-555-0123',
        callerDepartment: 'Sales', callerLocation: 'Building A, Floor 2', callerVip: false,
        openedBy: 'tech.support', openedByName: 'Alex Thompson', contactType: 'phone',
        category: 'Network', subcategory: 'VPN', impact: 3, urgency: 2, priority: 'P2',
        businessService: 'VPN / Remote Access', status: 'Open',
        assignmentGroup: 'Network Team', assignedTo: 'Network Team', assignee: 'USR-001', assigneeName: 'Alex Thompson',
        configurationItem: 'LAPTOP-JS-001',
        slaTarget: '2025-02-13T16:30:00Z', createdAt: '2025-02-13T08:30:00Z', updatedAt: '2025-02-13T09:15:00Z', resolvedAt: null,
        notes: [
          { type: 'customer', visibility: 'customer-visible', author: 'john.smith@acme.com', content: 'This is really affecting my productivity. Need urgent help!', timestamp: '2025-02-13T08:30:00Z' },
          { type: 'system', visibility: 'technicians-only', author: 'System', content: 'Ticket created and assigned to Network Team', timestamp: '2025-02-13T08:30:00Z' },
          { type: 'internal', visibility: 'technicians-only', author: 'tech.support', content: 'Reviewing error log. Looks like certificate validation issue.', timestamp: '2025-02-13T09:15:00Z' }
        ],
        attachments: [{ name: 'vpn_error.log', type: 'log', size: '24KB' }, { name: 'event_viewer.png', type: 'screenshot', size: '156KB' }],
        linkedKB: ['KB-101'], linkedProblems: ['PRB-001'], linkedChanges: [],
        watchList: ['james.chen@acme.com'], additionalCommentsNotify: ['john.smith@acme.com'], workNotesNotify: ['james.chen@acme.com']
      },
      {
        id: 'INC-002', title: 'Application crash - ntdll.dll error',
        description: 'CRM application crashes on startup with ntdll.dll access violation. Multiple users affected.',
        callerName: 'Mary Jones', callerEmail: 'mary.jones@acme.com', callerPhone: '+1-555-0124',
        callerDepartment: 'Sales', callerLocation: 'Building A, Floor 2', callerVip: true,
        openedBy: 'app.admin', openedByName: 'Sarah Miller', contactType: 'phone',
        category: 'Application', subcategory: 'CRM', impact: 1, urgency: 1, priority: 'P1',
        businessService: 'CRM Application', status: 'In Progress',
        assignmentGroup: 'Application Support', assignedTo: 'Application Support', assignee: 'USR-004', assigneeName: 'Sarah Miller',
        configurationItem: 'CRM-SERVER-01',
        slaTarget: '2025-02-13T11:45:00Z', createdAt: '2025-02-13T07:45:00Z', updatedAt: '2025-02-13T10:30:00Z', resolvedAt: null,
        notes: [
          { type: 'customer', visibility: 'customer-visible', author: 'mary.jones@acme.com', content: 'Cannot access CRM at all. This is blocking all sales activities!', timestamp: '2025-02-13T07:45:00Z' },
          { type: 'system', visibility: 'technicians-only', author: 'System', content: 'Priority escalated to P1 due to business impact', timestamp: '2025-02-13T08:00:00Z' },
          { type: 'internal', visibility: 'technicians-only', author: 'app.admin', content: 'Identified issue with recent .NET update. Preparing rollback.', timestamp: '2025-02-13T10:30:00Z' }
        ],
        attachments: [{ name: 'crash_dump.dmp', type: 'dump', size: '2.4MB' }, { name: 'app_crash.log', type: 'log', size: '89KB' }],
        linkedKB: ['KB-112'], linkedProblems: ['PRB-002'], linkedChanges: ['CHG-456'],
        watchList: ['sales.manager@acme.com', 'it.manager@acme.com'], additionalCommentsNotify: ['mary.jones@acme.com'], workNotesNotify: ['app.admin@acme.com']
      },
      {
        id: 'INC-003', title: 'Email not syncing on mobile device',
        description: 'Outlook app on iPhone not syncing emails since yesterday. Already tried removing and re-adding account.',
        callerName: 'David Wilson', callerEmail: 'david.wilson@acme.com', callerPhone: '+1-555-0125',
        callerDepartment: 'Marketing', callerLocation: 'Building B, Floor 1', callerVip: false,
        openedBy: 'tech.support', openedByName: 'Alex Thompson', contactType: 'self-service',
        category: 'Email', subcategory: 'Mobile', impact: 3, urgency: 3, priority: 'P3',
        businessService: 'Email Services', status: 'Pending',
        assignmentGroup: 'Service Desk', assignedTo: 'Service Desk', assignee: 'USR-001', assigneeName: 'Alex Thompson',
        configurationItem: 'MOBILE-DW-001',
        slaTarget: '2025-02-14T16:20:00Z', createdAt: '2025-02-12T16:20:00Z', updatedAt: '2025-02-13T08:00:00Z', resolvedAt: null,
        notes: [
          { type: 'customer', visibility: 'customer-visible', author: 'david.wilson@acme.com', content: 'Getting "Cannot connect to server" error', timestamp: '2025-02-12T16:20:00Z' },
          { type: 'internal', visibility: 'technicians-only', author: 'tech.support', content: 'Requested screenshot of error. Awaiting response.', timestamp: '2025-02-12T17:00:00Z' }
        ],
        attachments: [], linkedKB: [], linkedProblems: [], linkedChanges: [],
        watchList: [], additionalCommentsNotify: ['david.wilson@acme.com'], workNotesNotify: []
      },
      {
        id: 'INC-004', title: 'Printer paper jam - 3rd floor',
        description: 'HP LaserJet on 3rd floor showing persistent paper jam error. Already cleared visible paper.',
        callerName: 'Sarah Chen', callerEmail: 'sarah.chen@acme.com', callerPhone: '+1-555-0126',
        callerDepartment: 'Finance', callerLocation: 'Building A, Floor 3', callerVip: true,
        openedBy: 'sarah.chen@acme.com', openedByName: 'Sarah Chen', contactType: 'walk-in',
        category: 'Hardware', subcategory: 'Printer', impact: 2, urgency: 3, priority: 'P4',
        businessService: 'Print Services', status: 'New',
        assignmentGroup: 'Service Desk', assignedTo: 'Service Desk', assignee: null, assigneeName: null,
        configurationItem: 'PRINTER-3F-001',
        slaTarget: '2025-02-15T10:45:00Z', createdAt: '2025-02-13T10:45:00Z', updatedAt: '2025-02-13T10:45:00Z', resolvedAt: null,
        notes: [],
        attachments: [{ name: 'printer_display.jpg', type: 'screenshot', size: '340KB' }],
        linkedKB: ['KB-203'], linkedProblems: [], linkedChanges: [],
        watchList: [], additionalCommentsNotify: ['sarah.chen@acme.com'], workNotesNotify: []
      },
      {
        id: 'INC-005', title: 'Server high CPU - WEBSRV-03',
        description: 'Monitoring alert: WEBSRV-03 showing 94% CPU utilization for past 2 hours. Website response times degraded.',
        callerName: 'Monitoring System', callerEmail: 'monitoring@acme.com', callerPhone: null,
        callerDepartment: 'IT Operations', callerLocation: 'Data Center', callerVip: false,
        openedBy: 'monitoring', openedByName: 'Monitoring System', contactType: 'monitoring',
        category: 'Infrastructure', subcategory: 'Server', impact: 2, urgency: 2, priority: 'P2',
        businessService: 'Web Applications', status: 'Open',
        assignmentGroup: 'Server Team', assignedTo: 'Server Team', assignee: 'USR-005', assigneeName: 'Michael Brown',
        configurationItem: 'WEBSRV-03',
        slaTarget: '2025-02-13T14:00:00Z', createdAt: '2025-02-13T06:00:00Z', updatedAt: '2025-02-13T09:45:00Z', resolvedAt: null,
        notes: [
          { type: 'system', visibility: 'technicians-only', author: 'Monitoring', content: 'Auto-generated incident from CPU threshold alert', timestamp: '2025-02-13T06:00:00Z' },
          { type: 'internal', visibility: 'technicians-only', author: 'server.admin', content: 'Investigating. Correlated with deployment CHG-456 this morning.', timestamp: '2025-02-13T09:45:00Z' }
        ],
        attachments: [{ name: 'cpu_metrics.png', type: 'screenshot', size: '89KB' }, { name: 'process_list.txt', type: 'log', size: '12KB' }],
        linkedKB: ['KB-512'], linkedProblems: [], linkedChanges: ['CHG-456'],
        watchList: ['it.manager@acme.com'], additionalCommentsNotify: [], workNotesNotify: ['server.admin@acme.com', 'it.manager@acme.com']
      },
      {
        id: 'INC-006', title: 'Password reset not working',
        description: 'Self-service password reset portal shows "service unavailable" error.',
        callerName: 'Multiple Users', callerEmail: 'helpdesk@acme.com', callerPhone: null,
        callerDepartment: 'Multiple', callerLocation: 'Enterprise-wide', callerVip: false,
        openedBy: 'id.admin', openedByName: 'Emily Davis', contactType: 'email',
        category: 'Identity', subcategory: 'Password', impact: 1, urgency: 2, priority: 'P2',
        businessService: 'Active Directory', status: 'Resolved',
        assignmentGroup: 'Identity Team', assignedTo: 'Identity Team', assignee: 'USR-006', assigneeName: 'Emily Davis',
        configurationItem: 'SSPR-SERVER',
        slaTarget: '2025-02-12T22:00:00Z', createdAt: '2025-02-12T14:00:00Z', updatedAt: '2025-02-12T15:30:00Z',
        resolvedAt: '2025-02-12T15:30:00Z', resolutionCode: 'Fixed', resolutionNotes: 'Service was down due to certificate expiration. Renewed cert and restarted service.',
        notes: [
          { type: 'internal', visibility: 'technicians-only', author: 'id.admin', content: 'Service was down due to certificate expiration. Renewed cert and restarted service.', timestamp: '2025-02-12T15:30:00Z' },
          { type: 'system', visibility: 'technicians-only', author: 'System', content: 'Incident resolved. Resolution time: 1h 30m', timestamp: '2025-02-12T15:30:00Z' }
        ],
        attachments: [], linkedKB: [], linkedProblems: [], linkedChanges: [],
        watchList: [], additionalCommentsNotify: [], workNotesNotify: ['id.admin@acme.com']
      }
    ],

    // ITSM Changes (curated data aligned with ITSM Console app)
    itsm_changes: [
      {
        id: 'CHG-456', title: 'Deploy CRM Update v3.2.1',
        description: 'Deploy latest CRM application update including security patches and performance improvements.',
        type: 'Standard', status: 'Implemented', risk: 'Medium', priority: 'Normal',
        category: 'Application', subcategory: 'Deployment',
        requestedBy: 'sarah.miller@acme.com', requesterName: 'Sarah Miller', requesterEmail: 'sarah.miller@acme.com',
        requesterPhone: '+1-555-0130', requesterDept: 'Application Support', requestedFor: 'sarah.miller@acme.com',
        assignedTo: 'Release Team', assignee: 'USR-004', implementer: 'michael.brown@acme.com',
        impact: 2, affectedUsers: 'department', affectedServices: ['CRM Application'],
        affectedAssets: ['CRM-SERVER-01', 'CRM-SERVER-02'], outageRequired: true, outageDuration: 30,
        justification: 'Critical security patches and performance improvements required for CRM stability.',
        implementationPlan: '1. Backup current CRM database and files\n2. Stop CRM services on both servers\n3. Deploy update package to CRM-SERVER-01\n4. Run database migration scripts\n5. Start services and verify\n6. Deploy to CRM-SERVER-02\n7. Verify load balancing',
        testPlan: 'Verify login functionality, test key workflows (create contact, create opportunity, generate report)',
        rollbackPlan: 'Restore from backup taken at 05:45. Contact DBA for database rollback if needed.',
        relatedIncident: 'PRB-002',
        scheduledStart: '2025-02-13T06:00:00Z', scheduledEnd: '2025-02-13T08:00:00Z', changeWindow: 'maintenance',
        actualStart: '2025-02-13T06:00:00Z', actualEnd: '2025-02-13T07:45:00Z',
        cabRequired: false, cabApproval: null,
        notifyRecipients: ['affected-users', 'service-owners'], communicationNotes: 'Users notified via email 24 hours prior',
        createdAt: '2025-02-10T14:00:00Z',
        notes: [
          { timestamp: '2025-02-13T07:45:00Z', author: 'michael.brown@acme.com', content: 'Deployment completed successfully. All tests passed.' },
          { timestamp: '2025-02-13T06:00:00Z', author: 'michael.brown@acme.com', content: 'Starting deployment. Backup completed.' }
        ]
      },
      {
        id: 'CHG-457', title: 'Restart Payment Gateway Service',
        description: 'Scheduled restart of payment gateway service to apply memory configuration changes.',
        type: 'Normal', status: 'Pending Approval', risk: 'High', priority: 'Normal',
        category: 'Infrastructure', subcategory: 'Configuration',
        requestedBy: 'lisa.wong@acme.com', requesterName: 'Lisa Wong', requesterEmail: 'lisa.wong@acme.com',
        requesterPhone: '+1-555-0129', requesterDept: 'Finance', requestedFor: 'lisa.wong@acme.com',
        assignedTo: 'Server Team', assignee: 'USR-005', implementer: 'michael.brown@acme.com',
        impact: 1, affectedUsers: 'all', affectedServices: ['Payment Gateway'],
        affectedAssets: ['PAYMENT-GW-01'], outageRequired: true, outageDuration: 15,
        justification: 'Payment gateway experiencing memory issues causing intermittent failures. Memory configuration optimization required.',
        implementationPlan: '1. Notify finance team of upcoming outage\n2. Stop payment gateway service\n3. Apply memory configuration changes\n4. Start service and verify\n5. Run test transactions\n6. Confirm with finance team',
        testPlan: 'Run 5 test transactions of different types. Verify memory utilization is within expected range.',
        rollbackPlan: 'If service fails to start, restore previous configuration from /backup/payment-gw/',
        relatedIncident: null, policyReference: 'POL-SEC-201',
        scheduledStart: '2025-02-14T22:00:00Z', scheduledEnd: '2025-02-14T22:30:00Z', changeWindow: 'maintenance',
        actualStart: null, actualEnd: null,
        cabRequired: true, cabApproval: null,
        notifyRecipients: ['affected-users', 'management', 'service-owners'],
        communicationNotes: 'Finance team and executives must be notified due to payment processing impact',
        createdAt: '2025-02-13T09:00:00Z', notes: []
      },
      {
        id: 'CHG-458', title: 'Network Switch Firmware Update - Building B',
        description: 'Update firmware on Building B network switches to address security vulnerability CVE-2025-1234.',
        type: 'Emergency', status: 'Scheduled', risk: 'High', priority: 'High',
        category: 'Security', subcategory: 'Vulnerability Patch',
        requestedBy: 'emily.davis@acme.com', requesterName: 'Emily Davis', requesterEmail: 'emily.davis@acme.com',
        requesterPhone: '+1-555-0131', requesterDept: 'Security', requestedFor: 'emily.davis@acme.com',
        assignedTo: 'Network Team', assignee: 'USR-003', implementer: 'james.chen@acme.com',
        impact: 2, affectedUsers: 'department', affectedServices: ['Network Infrastructure'],
        affectedAssets: ['SW-BLDGB-01', 'SW-BLDGB-02', 'SW-BLDGB-03'], outageRequired: true, outageDuration: 60,
        justification: 'Critical security vulnerability CVE-2025-1234 discovered in switch firmware. Rated CVSS 9.1. Must patch within 72 hours per security policy.',
        implementationPlan: '1. Download firmware from vendor portal\n2. Backup current switch configurations\n3. Update SW-BLDGB-01 (core switch)\n4. Verify connectivity and routing\n5. Update SW-BLDGB-02\n6. Verify failover\n7. Update SW-BLDGB-03\n8. Final verification',
        testPlan: 'Verify all VLANs accessible, test inter-VLAN routing, confirm spanning tree convergence',
        rollbackPlan: 'Firmware can be rolled back via console connection. Contact vendor support if needed.',
        relatedIncident: null, policyReference: 'POL-SEC-305',
        scheduledStart: '2025-02-13T23:00:00Z', scheduledEnd: '2025-02-14T02:00:00Z', changeWindow: 'emergency',
        actualStart: null, actualEnd: null,
        cabRequired: true, cabApproval: '2025-02-13T11:00:00Z',
        notifyRecipients: ['affected-users', 'management', 'helpdesk'],
        communicationNotes: 'Building B users notified of potential brief network interruptions.',
        createdAt: '2025-02-13T08:00:00Z',
        notes: [{ timestamp: '2025-02-13T11:00:00Z', author: 'CAB', content: 'Emergency change approved by CAB due to critical security vulnerability.' }]
      }
    ],

    // ITSM Service Requests
    itsm_requests: [
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

    // ITSM Problems
    itsm_problems: [
      {
        id: 'PRB-001',
        title: 'Recurring VPN disconnections across multiple users',
        description: 'Multiple users reporting VPN drops every 15-20 minutes. Appears to be related to certificate validation or keep-alive settings.',
        status: 'Under Investigation',
        priority: 'P2',
        category: 'Network',
        rootCause: null,
        workaround: 'Increase keep-alive interval to 30 seconds in VPN client settings',
        resolutionCode: null,
        resolutionNotes: null,
        linkedIncidents: ['INC-001'],
        affectedAssets: ['VPN-SERVER-01'],
        assignedTo: 'Network Team',
        assignee: 'USR-003',
        assigneeName: 'James Chen',
        createdAt: '2025-02-13T09:00:00Z',
        updatedAt: '2025-02-13T10:00:00Z',
        resolvedAt: null
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
        resolutionCode: null,
        resolutionNotes: null,
        linkedIncidents: ['INC-002'],
        affectedAssets: ['CRM-SERVER-01', 'CRM-SERVER-02'],
        assignedTo: 'Application Support',
        assignee: 'USR-004',
        assigneeName: 'Sarah Miller',
        createdAt: '2025-02-13T08:00:00Z',
        updatedAt: '2025-02-13T10:30:00Z',
        resolvedAt: null
      }
    ],

    // ITSM Assets / CMDB
    itsm_assets: [
      { id: 'LAPTOP-JS-001', name: 'John Smith Laptop', type: 'Workstation', status: 'Active', owner: 'john.smith@acme.com', ownerName: 'John Smith', location: 'Building A, Floor 2', os: 'Windows 11', manufacturer: 'Dell', model: 'Latitude 5540', serialNumber: 'DL5540JS001', purchaseDate: '2024-03-15', warrantyExpiry: '2027-03-15', lastSeen: '2025-02-13T10:00:00Z', ipAddress: '10.1.2.101', linkedIncidents: ['INC-001'], linkedChanges: [] },
      { id: 'CRM-SERVER-01', name: 'CRM Primary Server', type: 'Server', status: 'Active', owner: 'IT Operations', ownerName: 'IT Operations', location: 'Data Center 1', os: 'Windows Server 2022', manufacturer: 'Dell', model: 'PowerEdge R750', serialNumber: 'DLPE750CRM01', purchaseDate: '2023-06-01', warrantyExpiry: '2026-06-01', lastSeen: '2025-02-13T10:00:00Z', ipAddress: '10.10.1.50', linkedIncidents: ['INC-002'], linkedChanges: ['CHG-456'] },
      { id: 'CRM-SERVER-02', name: 'CRM Secondary Server', type: 'Server', status: 'Active', owner: 'IT Operations', ownerName: 'IT Operations', location: 'Data Center 2', os: 'Windows Server 2022', manufacturer: 'Dell', model: 'PowerEdge R750', serialNumber: 'DLPE750CRM02', purchaseDate: '2023-06-01', warrantyExpiry: '2026-06-01', lastSeen: '2025-02-13T10:00:00Z', ipAddress: '10.10.2.50', linkedIncidents: [], linkedChanges: ['CHG-456'] },
      { id: 'WEBSRV-03', name: 'Web Server 03', type: 'Server', status: 'Warning', owner: 'IT Operations', ownerName: 'IT Operations', location: 'Data Center 1', os: 'Windows Server 2022', manufacturer: 'HP', model: 'ProLiant DL380', serialNumber: 'HPDL380WS03', purchaseDate: '2023-09-15', warrantyExpiry: '2026-09-15', lastSeen: '2025-02-13T10:00:00Z', ipAddress: '10.10.1.53', linkedIncidents: ['INC-005'], linkedChanges: ['CHG-456'] },
      { id: 'PAYMENT-GW-01', name: 'Payment Gateway Server', type: 'Server', status: 'Active', owner: 'Finance IT', ownerName: 'Finance IT', location: 'Data Center 1 - Secure Zone', os: 'Red Hat Enterprise Linux 8', manufacturer: 'Dell', model: 'PowerEdge R650', serialNumber: 'DLPE650PG01', purchaseDate: '2023-01-10', warrantyExpiry: '2026-01-10', lastSeen: '2025-02-13T10:00:00Z', ipAddress: '10.10.1.100', linkedIncidents: [], linkedChanges: ['CHG-457'] },
      { id: 'PRINTER-3F-001', name: 'HP LaserJet 3rd Floor', type: 'Printer', status: 'Error', owner: 'Facilities', ownerName: 'Facilities', location: 'Building A, Floor 3', os: 'N/A', manufacturer: 'HP', model: 'LaserJet Enterprise M507', serialNumber: 'HPLJ507PF001', purchaseDate: '2024-01-20', warrantyExpiry: '2027-01-20', lastSeen: '2025-02-13T10:45:00Z', ipAddress: '10.1.3.200', linkedIncidents: ['INC-004'], linkedChanges: [] },
      { id: 'MOBILE-DW-001', name: 'David Wilson iPhone', type: 'Mobile', status: 'Active', owner: 'david.wilson@acme.com', ownerName: 'David Wilson', location: 'N/A', os: 'iOS 17', manufacturer: 'Apple', model: 'iPhone 15 Pro', serialNumber: 'APIP15DW001', purchaseDate: '2024-09-20', warrantyExpiry: '2025-09-20', lastSeen: '2025-02-12T16:20:00Z', ipAddress: 'N/A', linkedIncidents: ['INC-003'], linkedChanges: [] },
      { id: 'SW-BLDGB-01', name: 'Building B Core Switch 1', type: 'Network', status: 'Active', owner: 'Network Team', ownerName: 'Network Team', location: 'Building B, MDF', os: 'Cisco IOS 15.2', manufacturer: 'Cisco', model: 'Catalyst 9300', serialNumber: 'CSC9300BB01', purchaseDate: '2023-04-01', warrantyExpiry: '2028-04-01', lastSeen: '2025-02-13T10:00:00Z', ipAddress: '10.2.0.1', linkedIncidents: [], linkedChanges: ['CHG-458'] },
      { id: 'SW-BLDGB-02', name: 'Building B Core Switch 2', type: 'Network', status: 'Active', owner: 'Network Team', ownerName: 'Network Team', location: 'Building B, MDF', os: 'Cisco IOS 15.2', manufacturer: 'Cisco', model: 'Catalyst 9300', serialNumber: 'CSC9300BB02', purchaseDate: '2023-04-01', warrantyExpiry: '2028-04-01', lastSeen: '2025-02-13T10:00:00Z', ipAddress: '10.2.0.2', linkedIncidents: [], linkedChanges: ['CHG-458'] },
      { id: 'SW-BLDGB-03', name: 'Building B Access Switch', type: 'Network', status: 'Active', owner: 'Network Team', ownerName: 'Network Team', location: 'Building B, IDF-1', os: 'Cisco IOS 15.2', manufacturer: 'Cisco', model: 'Catalyst 9200', serialNumber: 'CSC9200BB03', purchaseDate: '2023-04-01', warrantyExpiry: '2028-04-01', lastSeen: '2025-02-13T10:00:00Z', ipAddress: '10.2.0.3', linkedIncidents: [], linkedChanges: ['CHG-458'] }
    ],

    // ITSM Knowledge Base
    itsm_knowledge: [
      {
        id: 'KB-101',
        title: 'VPN Troubleshooting Guide',
        category: 'Network',
        status: 'Published',
        author: 'james.chen@acme.com',
        authorName: 'James Chen',
        content: '## Overview\nThis guide covers common VPN connectivity issues and their resolutions.\n\n## Common Issues\n\n### Issue 1: Frequent Disconnections\n**Symptoms:** VPN drops every 15-20 minutes\n**Cause:** Usually related to certificate validation or keep-alive settings\n\n**Resolution Steps:**\n1. Open VPN client settings\n2. Navigate to Advanced > Connection\n3. Increase keep-alive interval to 30 seconds\n4. Disable \"Disconnect on idle\"\n5. Restart VPN service\n\n### Issue 2: Certificate Validation Error\n**Symptoms:** \"Certificate validation failed\" error\n**Cause:** Expired or untrusted certificate\n\n**Resolution Steps:**\n1. Check certificate expiration date\n2. If expired, contact IT for certificate renewal\n3. Ensure system date/time is correct\n4. Clear certificate cache: certutil -urlcache * delete\n\n### Issue 3: DNS Resolution Failure\n**Symptoms:** Connected but cannot reach internal resources\n**Cause:** DNS settings not applied correctly\n\n**Resolution Steps:**\n1. Flush DNS: ipconfig /flushdns\n2. Verify DNS servers in VPN adapter\n3. Test with nslookup internal.acme.com',
        tags: ['VPN', 'Network', 'Connectivity', 'Certificate'],
        applicability: ['Windows 10', 'Windows 11'],
        views: 1247,
        helpful: 89,
        createdAt: '2024-06-15',
        updatedAt: '2025-01-20',
        automationId: 'vpn-troubleshoot-01'
      },
      {
        id: 'KB-112',
        title: 'Application Crash - ntdll.dll Access Violation',
        category: 'Application',
        status: 'Published',
        author: 'sarah.miller@acme.com',
        authorName: 'Sarah Miller',
        content: '## Overview\nntdll.dll access violations typically indicate memory corruption or compatibility issues.\n\n## Diagnostic Steps\n\n### Step 1: Collect Crash Dump\n1. Open Event Viewer\n2. Navigate to Windows Logs > Application\n3. Find the crash event (Error level)\n4. Note the faulting module and offset\n\n### Step 2: Identify Root Cause\nCommon causes:\n- Incompatible .NET Framework update\n- Corrupted application files\n- Memory issues\n- Third-party DLL conflicts\n\n### Step 3: Resolution\n\n#### Option A: .NET Framework Rollback\n1. Open Control Panel > Programs\n2. View installed updates\n3. Uninstall recent .NET updates\n4. Restart system\n\n#### Option B: Application Repair\n1. Open Settings > Apps\n2. Find the affected application\n3. Click Modify > Repair\n4. Follow repair wizard\n\n#### Option C: Clean Reinstall\n1. Backup application data\n2. Uninstall application completely\n3. Delete remaining folders in Program Files\n4. Reinstall from original source',
        tags: ['Crash', 'ntdll', 'Application', '.NET'],
        applicability: ['Windows 10', 'Windows 11', '.NET Applications'],
        views: 523,
        helpful: 67,
        createdAt: '2024-09-10',
        updatedAt: '2025-02-01',
        automationId: 'app-crash-remediation-01'
      },
      {
        id: 'KB-203',
        title: 'Printer Driver Installation and Troubleshooting',
        category: 'Hardware',
        status: 'Published',
        author: 'robert.wilson@acme.com',
        authorName: 'Robert Wilson',
        content: '## Paper Jam Resolution\n\n### Step 1: Power Cycle\n1. Turn off printer\n2. Unplug power cord\n3. Wait 30 seconds\n4. Reconnect and power on\n\n### Step 2: Clear Paper Path\n1. Open all access doors\n2. Remove any visible paper\n3. Check for small torn pieces\n4. Check rollers for debris\n\n### Step 3: Reset Paper Sensors\n1. Remove paper tray\n2. Clean paper sensors with dry cloth\n3. Reinsert tray firmly\n4. Run test print',
        tags: ['Printer', 'Hardware', 'Paper Jam', 'Driver'],
        applicability: ['HP LaserJet', 'Windows'],
        views: 892,
        helpful: 156,
        createdAt: '2024-03-20',
        updatedAt: '2024-11-15',
        automationId: null
      },
      {
        id: 'KB-512',
        title: 'High CPU Troubleshooting - Windows Server',
        category: 'Infrastructure',
        status: 'Published',
        author: 'michael.brown@acme.com',
        authorName: 'Michael Brown',
        content: '## Initial Assessment\n\n### Step 1: Identify Top Processes\n```powershell\nGet-Process | Sort-Object CPU -Descending | Select-Object -First 10\n```\n\n### Step 2: Check Recent Changes\n1. Review Change Management for recent deployments\n2. Check Windows Update history\n3. Review scheduled tasks\n\n### Step 3: Mitigation Options\n\n#### Temporary: Restart Offending Service\n```powershell\nRestart-Service -Name \"ServiceName\" -Force\n```\n\n#### If Related to Deployment: Rollback\nContact Change Management for rollback procedure.\n\n#### If Memory Leak: Schedule Restart\nCoordinate maintenance window for server restart.',
        tags: ['Server', 'CPU', 'Performance', 'Windows Server'],
        applicability: ['Windows Server 2019', 'Windows Server 2022'],
        views: 445,
        helpful: 78,
        createdAt: '2024-07-01',
        updatedAt: '2025-01-10',
        automationId: 'server-cpu-remediation-01'
      }
    ],

    // ITSM Runbooks
    itsm_runbooks: [
      { id: 'RB-001', title: 'VPN Connectivity Troubleshooting', category: 'Network', description: 'Step-by-step guide to diagnose and resolve VPN connectivity issues for end users.', author: 'james.chen@acme.com', authorName: 'James Chen', lastUpdated: '2025-02-10', estimatedTime: '15-30 min', steps: [
        { id: 1, title: 'Verify network connectivity', description: 'Confirm the user has a working internet connection by pinging an external address.', automatable: true },
        { id: 2, title: 'Check VPN client version', description: 'Ensure the VPN client is updated to the latest approved version.', automatable: true },
        { id: 3, title: 'Validate certificate status', description: 'Check that the user\'s VPN certificate has not expired or been revoked.', automatable: true },
        { id: 4, title: 'Review firewall rules', description: 'Verify that local firewall is not blocking VPN traffic on ports 443 and 1194.', automatable: false },
        { id: 5, title: 'Restart VPN service', description: 'Stop and restart the VPN client service, then attempt reconnection.', automatable: true }
      ]},
      { id: 'RB-002', title: 'Active Directory Account Unlock', category: 'Identity', description: 'Procedure to unlock a locked Active Directory account and reset credentials if needed.', author: 'emily.davis@acme.com', authorName: 'Emily Davis', lastUpdated: '2025-01-28', estimatedTime: '5-10 min', steps: [
        { id: 1, title: 'Verify caller identity', description: 'Confirm the user\'s identity using security questions or manager verification.', automatable: false },
        { id: 2, title: 'Check account lockout status', description: 'Use AD tools to check the lockout status and lockout timestamp.', automatable: true },
        { id: 3, title: 'Identify lockout source', description: 'Review security logs to determine which device or service caused the lockout.', automatable: true },
        { id: 4, title: 'Unlock the account', description: 'Unlock the account in Active Directory Users and Computers.', automatable: true },
        { id: 5, title: 'Reset password if needed', description: 'If the user has forgotten their password, perform a password reset and enforce change at next logon.', automatable: true },
        { id: 6, title: 'Verify access restored', description: 'Have the user attempt login to confirm the account is working.', automatable: false }
      ]},
      { id: 'RB-003', title: 'Server High CPU Remediation', category: 'Infrastructure', description: 'Runbook for investigating and resolving high CPU utilization alerts on Windows servers.', author: 'michael.brown@acme.com', authorName: 'Michael Brown', lastUpdated: '2025-02-05', estimatedTime: '20-45 min', steps: [
        { id: 1, title: 'Acknowledge monitoring alert', description: 'Acknowledge the alert in the monitoring system to prevent escalation.', automatable: true },
        { id: 2, title: 'Connect to affected server', description: 'Remote into the server via RDP or PowerShell remoting.', automatable: false },
        { id: 3, title: 'Identify top CPU consumers', description: 'Use Task Manager or Get-Process to identify processes consuming the most CPU.', automatable: true },
        { id: 4, title: 'Check for recent changes', description: 'Review recent deployments or changes that may correlate with the CPU spike.', automatable: false },
        { id: 5, title: 'Apply remediation', description: 'Restart the offending service, roll back a recent change, or scale resources as needed.', automatable: false },
        { id: 6, title: 'Verify CPU levels normalized', description: 'Monitor CPU for 15 minutes to confirm levels have returned to normal.', automatable: true }
      ]},
      { id: 'RB-004', title: 'Printer Jam Resolution', category: 'Hardware', description: 'Guide for resolving persistent paper jam errors on networked HP LaserJet printers.', author: 'alex.thompson@acme.com', authorName: 'Alex Thompson', lastUpdated: '2025-01-15', estimatedTime: '15-30 min', steps: [
        { id: 1, title: 'Power cycle the printer', description: 'Turn off the printer, unplug for 30 seconds, then power back on.', automatable: false },
        { id: 2, title: 'Clear paper path', description: 'Open all access doors and remove any jammed or torn paper from the path.', automatable: false },
        { id: 3, title: 'Inspect and clean rollers', description: 'Check pickup and feed rollers for debris or wear. Clean with a lint-free cloth.', automatable: false },
        { id: 4, title: 'Reset paper tray sensors', description: 'Remove and reinsert the paper tray, ensuring paper guides are properly adjusted.', automatable: false },
        { id: 5, title: 'Run test print', description: 'Print a test page from the printer menu to confirm the jam is cleared.', automatable: true }
      ]},
      { id: 'RB-005', title: 'Application Crash Diagnostics', category: 'Application', description: 'Standard procedure for collecting crash diagnostics and performing initial triage for application failures.', author: 'sarah.miller@acme.com', authorName: 'Sarah Miller', lastUpdated: '2025-02-01', estimatedTime: '20-45 min', steps: [
        { id: 1, title: 'Collect crash details from user', description: 'Document the error message, application name, version, and steps to reproduce.', automatable: false },
        { id: 2, title: 'Gather event logs', description: 'Export Application and System event logs from the affected machine.', automatable: true },
        { id: 3, title: 'Capture crash dump', description: 'If reproducible, configure Windows Error Reporting to capture a full crash dump.', automatable: true },
        { id: 4, title: 'Check for known issues', description: 'Search the knowledge base and vendor release notes for matching crash signatures.', automatable: true },
        { id: 5, title: 'Attempt standard remediation', description: 'Try application repair, clearing cache, or reinstalling the affected component.', automatable: false },
        { id: 6, title: 'Escalate if unresolved', description: 'If the issue persists, escalate to the Application Support team with collected diagnostics.', automatable: false }
      ]},
      { id: 'RB-006', title: 'Email Service Health Check', category: 'Infrastructure', description: 'Routine health check procedure for Exchange Online and email delivery services.', author: 'james.chen@acme.com', authorName: 'James Chen', lastUpdated: '2025-02-08', estimatedTime: '15-30 min', steps: [
        { id: 1, title: 'Check Microsoft 365 service health', description: 'Review the Microsoft 365 admin center for any active service advisories or incidents.', automatable: true },
        { id: 2, title: 'Test mail flow', description: 'Send test emails between internal and external addresses to verify delivery.', automatable: true },
        { id: 3, title: 'Review mail queues', description: 'Check for any messages stuck in transport queues using Exchange admin center.', automatable: true },
        { id: 4, title: 'Verify DNS and MX records', description: 'Confirm MX, SPF, DKIM, and DMARC records are correctly configured.', automatable: true },
        { id: 5, title: 'Check mailbox storage quotas', description: 'Identify any mailboxes approaching or exceeding their storage quota.', automatable: true }
      ]}
    ],

    // ITSM Catalog Items
    itsm_catalog: [
      { id: 'CAT-001', name: 'New Laptop Request', category: 'Hardware', description: 'Request a new laptop for a new hire or replacement', icon: 'desktop', approvalRequired: true, fulfillmentTime: '5 business days', cost: '$1,200 - $2,500', fields: [{ name: 'employee_name', label: 'Employee Name', type: 'text', required: true }, { name: 'department', label: 'Department', type: 'select', options: ['Sales', 'Marketing', 'Finance', 'Engineering', 'HR'], required: true }, { name: 'laptop_type', label: 'Laptop Type', type: 'select', options: ['Standard', 'Developer', 'Executive'], required: true }, { name: 'justification', label: 'Business Justification', type: 'textarea', required: true }] },
      { id: 'CAT-002', name: 'Software Installation', category: 'Software', description: 'Request installation of approved software', icon: 'download', approvalRequired: false, fulfillmentTime: '1 business day', cost: 'Varies', fields: [{ name: 'software_name', label: 'Software Name', type: 'text', required: true }, { name: 'version', label: 'Version', type: 'text', required: false }, { name: 'asset_id', label: 'Target Computer Asset ID', type: 'text', required: true }, { name: 'reason', label: 'Business Reason', type: 'textarea', required: true }] },
      { id: 'CAT-003', name: 'VPN Access Request', category: 'Access', description: 'Request VPN access for remote work', icon: 'key', approvalRequired: true, fulfillmentTime: '2 business days', cost: 'No cost', fields: [{ name: 'employee_email', label: 'Employee Email', type: 'email', required: true }, { name: 'start_date', label: 'Access Start Date', type: 'date', required: true }, { name: 'end_date', label: 'Access End Date (if temporary)', type: 'date', required: false }, { name: 'manager_approval', label: 'Manager Email for Approval', type: 'email', required: true }] },
      { id: 'CAT-004', name: 'New User Account', category: 'Access', description: 'Create accounts for a new employee', icon: 'user', approvalRequired: true, fulfillmentTime: '1 business day', cost: 'No cost', fields: [{ name: 'first_name', label: 'First Name', type: 'text', required: true }, { name: 'last_name', label: 'Last Name', type: 'text', required: true }, { name: 'department', label: 'Department', type: 'select', options: ['Sales', 'Marketing', 'Finance', 'Engineering', 'HR'], required: true }, { name: 'manager', label: 'Manager Email', type: 'email', required: true }, { name: 'start_date', label: 'Start Date', type: 'date', required: true }] },
      { id: 'CAT-005', name: 'Password Reset', category: 'Access', description: 'Reset password for locked account', icon: 'key', approvalRequired: false, fulfillmentTime: '15 minutes', cost: 'No cost', fields: [{ name: 'username', label: 'Username', type: 'text', required: true }, { name: 'verification', label: 'Verification Question Answer', type: 'text', required: true }] },
      { id: 'CAT-006', name: 'New Monitor/Peripheral', category: 'Hardware', description: 'Request a new monitor, keyboard, mouse, headset, or docking station', icon: 'desktop', approvalRequired: true, fulfillmentTime: '3 business days', cost: '$100 - $800', fields: [{ name: 'employee_name', label: 'Employee Name', type: 'text', required: true }, { name: 'department', label: 'Department', type: 'select', options: ['Sales', 'Marketing', 'Finance', 'Engineering', 'HR', 'IT', 'Operations'], required: true }, { name: 'device_type', label: 'Device Type', type: 'select', options: ['Monitor', 'Keyboard', 'Mouse', 'Headset', 'Docking Station', 'Webcam'], required: true }, { name: 'quantity', label: 'Quantity', type: 'number', required: true }, { name: 'justification', label: 'Justification', type: 'textarea', required: true }] },
      { id: 'CAT-007', name: 'Mobile Device Request', category: 'Hardware', description: 'Request a new mobile phone or tablet', icon: 'phone', approvalRequired: true, fulfillmentTime: '5 business days', cost: '$500 - $1,500', fields: [{ name: 'employee_name', label: 'Employee Name', type: 'text', required: true }, { name: 'department', label: 'Department', type: 'select', options: ['Sales', 'Marketing', 'Finance', 'Engineering', 'HR', 'IT', 'Operations'], required: true }, { name: 'device_type', label: 'Device Type', type: 'select', options: ['iPhone', 'Android Phone', 'iPad', 'Android Tablet'], required: true }, { name: 'justification', label: 'Business Justification', type: 'textarea', required: true }, { name: 'manager_approval', label: 'Manager Email', type: 'email', required: true }] },
      { id: 'CAT-008', name: 'Software License Request', category: 'Software', description: 'Request a new software license or subscription', icon: 'scroll', approvalRequired: true, fulfillmentTime: '2 business days', cost: 'Varies', fields: [{ name: 'employee_name', label: 'Employee Name', type: 'text', required: true }, { name: 'software_name', label: 'Software Name', type: 'text', required: true }, { name: 'license_type', label: 'License Type', type: 'select', options: ['Individual', 'Team', 'Enterprise'], required: true }, { name: 'duration', label: 'Duration', type: 'select', options: ['1 Month', '6 Months', '1 Year', 'Perpetual'], required: true }, { name: 'justification', label: 'Business Justification', type: 'textarea', required: true }] },
      { id: 'CAT-009', name: 'Shared Mailbox / Distribution List', category: 'Access', description: 'Create a shared mailbox or distribution list', icon: 'email', approvalRequired: true, fulfillmentTime: '1 business day', cost: 'No cost', fields: [{ name: 'mailbox_name', label: 'Mailbox/List Name', type: 'text', required: true }, { name: 'type', label: 'Type', type: 'select', options: ['Shared Mailbox', 'Distribution List'], required: true }, { name: 'owner_email', label: 'Owner Email', type: 'email', required: true }, { name: 'members', label: 'Members (one email per line)', type: 'textarea', required: true }, { name: 'justification', label: 'Justification', type: 'textarea', required: true }] },
      { id: 'CAT-010', name: 'Shipping & Delivery Request', category: 'Logistics', description: 'Request shipping of equipment or documents', icon: 'delivery', approvalRequired: false, fulfillmentTime: '3 business days', cost: 'Varies', fields: [{ name: 'sender_name', label: 'Sender Name', type: 'text', required: true }, { name: 'sender_location', label: 'Pickup Location', type: 'text', required: true }, { name: 'recipient_name', label: 'Recipient Name', type: 'text', required: true }, { name: 'recipient_location', label: 'Delivery Location', type: 'text', required: true }, { name: 'package_description', label: 'Package Description', type: 'textarea', required: true }, { name: 'urgency', label: 'Urgency', type: 'select', options: ['Standard', 'Express', 'Next Day'], required: true }] },
      { id: 'CAT-011', name: 'Office Supplies Request', category: 'Facilities', description: 'Request office supplies and consumables', icon: 'edit', approvalRequired: false, fulfillmentTime: '1 business day', cost: '$10 - $200', fields: [{ name: 'requester_name', label: 'Requester Name', type: 'text', required: true }, { name: 'department', label: 'Department', type: 'select', options: ['Sales', 'Marketing', 'Finance', 'Engineering', 'HR', 'IT', 'Operations'], required: true }, { name: 'items_needed', label: 'Items Needed (describe)', type: 'textarea', required: true }, { name: 'delivery_location', label: 'Delivery Location', type: 'text', required: true }] },
      { id: 'CAT-012', name: 'Meeting Room AV Setup', category: 'Facilities', description: 'Request AV equipment setup for a meeting', icon: 'slideshow', approvalRequired: false, fulfillmentTime: 'Same day', cost: 'No cost', fields: [{ name: 'meeting_room', label: 'Meeting Room', type: 'select', options: ['Conference Room A', 'Conference Room B', 'Boardroom', 'Training Room 1', 'Training Room 2'], required: true }, { name: 'date', label: 'Meeting Date', type: 'date', required: true }, { name: 'time_start', label: 'Start Time', type: 'text', required: true }, { name: 'time_end', label: 'End Time', type: 'text', required: true }, { name: 'requirements', label: 'AV Requirements', type: 'textarea', required: true }] },
      { id: 'CAT-013', name: 'Security Question / Breach Report', category: 'Security', description: 'Report a security incident, suspicious activity, or ask a security-related question', icon: 'alert', approvalRequired: true, fulfillmentTime: '4 hours (Critical) / 24 hours', cost: 'No cost', stepLabels: ['Reporter Info', 'Classification', 'Context', 'Evidence & Consent', 'Review & Submit'], fields: [
        { name: 'reporter_name', label: 'Your Full Name', type: 'text', required: true, step: 1 },
        { name: 'reporter_email', label: 'Email Address', type: 'email', required: true, step: 1 },
        { name: 'reporter_employee_id', label: 'Employee ID', type: 'text', required: true, step: 1 },
        { name: 'reporter_phone', label: 'Contact Phone', type: 'text', required: false, step: 1 },
        { name: 'report_type', label: 'Report Type', type: 'select', options: ['Question', 'Incident', 'Suspicious Activity'], required: true, step: 2 },
        { name: 'incident_type', label: 'Incident Type', type: 'select', options: ['Phishing', 'Malware', 'Data Breach', 'Unauthorized Access', 'Policy Violation', 'Account Compromise', 'Lost/Stolen Device'], required: true, step: 2, showWhen: { field: 'report_type', equals: 'Incident|Suspicious Activity' } },
        { name: 'summary', label: 'Short Summary', type: 'text', required: true, step: 2 },
        { name: 'description', label: 'Detailed Description', type: 'textarea', required: true, step: 2 },
        { name: 'affected_system', label: 'Affected System / Application', type: 'text', required: false, step: 3 },
        { name: 'environment', label: 'Environment', type: 'select', options: ['Production', 'Staging', 'Development', 'Unknown'], required: false, step: 3 },
        { name: 'asset_tag', label: 'Asset Tag (if applicable)', type: 'text', required: false, step: 3 },
        { name: 'owner_team', label: 'System Owner / Team', type: 'text', required: false, step: 3 },
        { name: 'time_detected', label: 'When Was It Detected?', type: 'text', required: false, step: 3 },
        { name: 'duration', label: 'Time Detected', type: 'select', options: ['Less than 1 hour', '1-4 hours', '4-24 hours', 'More than 24 hours', 'Unknown'], required: false, step: 3 },
        { name: 'attachments', label: 'Attach Evidence (screenshots, logs)', type: 'file', required: false, step: 4 },
        { name: 'ioc_indicators', label: 'Indicators of Compromise (IPs, URLs, hashes)', type: 'textarea', required: false, step: 4 },
        { name: 'consent', label: 'I confirm that the information provided is accurate to the best of my knowledge and I understand this report may trigger a security investigation.', type: 'checkbox', required: true, step: 4 },
        { name: 'severity', label: 'Suggested Severity', type: 'select', options: ['Low', 'Normal', 'High', 'Critical'], required: true, step: 5 }
      ]},
      { id: 'CAT-014', name: 'Account Issue Report', category: 'Security', description: 'Report account lockouts, unauthorized access, MFA failures, or other account-related issues', icon: 'key', approvalRequired: false, fulfillmentTime: '2 hours (Critical) / 8 hours', cost: 'No cost', stepLabels: ['Reporter Info', 'Classification', 'Account & Environment', 'Evidence', 'Review & Submit'], fields: [
        { name: 'reporter_name', label: 'Your Full Name', type: 'text', required: true, step: 1 },
        { name: 'reporter_email', label: 'Email Address', type: 'email', required: true, step: 1 },
        { name: 'reporter_employee_id', label: 'Employee ID', type: 'text', required: true, step: 1 },
        { name: 'reporter_phone', label: 'Contact Phone', type: 'text', required: false, step: 1 },
        { name: 'issue_category', label: 'Issue Category', type: 'select', options: ['Lockout', 'Access Issue', 'MFA Problem', 'Suspicious Activity', 'Password Issue'], required: true, step: 2 },
        { name: 'issue_type', label: 'Issue Type', type: 'select', options: [], required: true, step: 2, dependsOn: 'issue_category', optionsMap: { 'Lockout': ['Too Many Failed Attempts', 'Account Disabled by Admin', 'Expired Password', 'Unknown Cause', '_other'], 'Access Issue': ['Permission Denied', 'Role Missing', 'Group Membership', 'Application Access', '_other'], 'MFA Problem': ['MFA Not Prompting', 'MFA Token Rejected', 'Lost MFA Device', 'MFA Enrollment', '_other'], 'Suspicious Activity': ['Unrecognized Login', 'Login from Unknown Location', 'Multiple Failed Attempts', 'Account Used After Hours', '_other'], 'Password Issue': ['Cannot Reset', 'Reset Link Expired', 'Complexity Rejection', 'Password Not Syncing', '_other'] } },
        { name: 'summary', label: 'Short Summary', type: 'text', required: true, step: 2 },
        { name: 'description', label: 'Detailed Description', type: 'textarea', required: true, step: 2 },
        { name: 'affected_username', label: 'Affected Username / UPN', type: 'text', required: true, step: 3 },
        { name: 'affected_app', label: 'Application / Service', type: 'text', required: true, step: 3 },
        { name: 'auth_provider', label: 'Auth Provider', type: 'select', options: ['Active Directory', 'Azure AD / Entra ID', 'Okta', 'LDAP', 'Other / Unknown'], required: false, step: 3 },
        { name: 'environment', label: 'Environment', type: 'select', options: ['Production', 'Staging', 'Development', 'Unknown'], required: false, step: 3 },
        { name: 'last_successful_login', label: 'Last Successful Login (approx.)', type: 'text', required: false, step: 3 },
        { name: 'device', label: 'Device Used', type: 'text', required: false, step: 3 },
        { name: 'attachments', label: 'Attach Evidence (screenshots, error messages)', type: 'file', required: false, step: 4 },
        { name: 'requested_action', label: 'Requested Action', type: 'select', options: ['Unlock Account', 'Reset Password', 'Investigate Activity', 'Restore Access', 'Disable Account', 'Other'], required: true, step: 4 },
        { name: 'approver_email', label: 'Manager / Approver Email', type: 'email', required: false, step: 4 },
        { name: 'consent', label: 'I confirm the affected account belongs to me or I am authorized to report on behalf of the account holder.', type: 'checkbox', required: true, step: 4 },
        { name: 'severity', label: 'Severity', type: 'select', options: ['Low', 'Normal', 'High', 'Critical'], required: true, step: 5 }
      ]}
    ],

    // ITSM Policies
    itsm_policies: [
      { id: 'POL-SEC-201', title: 'Change Management Policy', category: 'Change Management', effectiveDate: '2024-01-15', version: '2.1', status: 'Active', sections: [{ number: '1.1', title: 'Scope', content: 'This policy applies to all changes to IT infrastructure, applications, and services.' }, { number: '1.2', title: 'Change Types', content: 'Changes are classified as Standard, Normal, or Emergency based on risk and impact.' }, { number: '1.3', title: 'Approval Requirements', content: 'Normal and Emergency changes require CAB approval. Standard changes follow pre-approved procedures.' }] },
      { id: 'POL-SEC-305', title: 'Security Incident Response', category: 'Security', effectiveDate: '2024-03-01', version: '3.0', status: 'Active', sections: [{ number: '1.1', title: 'Incident Classification', content: 'Security incidents are classified by severity: Critical, High, Medium, Low.' }, { number: '1.2', title: 'Response Procedures', content: 'All security incidents must be reported within 1 hour of detection. Critical incidents trigger immediate escalation.' }, { number: '1.3', title: 'Evidence Preservation', content: 'All affected systems must be preserved for forensic analysis. Do not modify or delete any logs.' }] },
      { id: 'POL-OPS-101', title: 'Maintenance Windows Policy', category: 'Operations', effectiveDate: '2024-02-01', version: '1.5', status: 'Active', sections: [{ number: '1.1', title: 'Standard Maintenance Windows', content: 'Standard maintenance: Saturdays 02:00-06:00 UTC. Emergency maintenance: As approved by Change Management.' }, { number: '1.2', title: 'Notification Requirements', content: 'Planned maintenance requires 5 business days advance notice. Emergency maintenance requires immediate notification.' }] },
      { id: 'POL-ACC-150', title: 'Access Control Policy', category: 'Security', effectiveDate: '2024-04-01', version: '2.0', status: 'Active', sections: [{ number: '1.1', title: 'Account Provisioning', content: 'All accounts must be provisioned through the service request process with manager approval.' }, { number: '1.2', title: 'Password Policy', content: 'Minimum 12 characters, including uppercase, lowercase, numbers, and special characters. Passwords expire every 90 days.' }, { number: '1.3', title: 'Access Reviews', content: 'Quarterly access reviews are mandatory for all systems. Unused accounts are disabled after 30 days of inactivity.' }] },
      { id: 'POL-SLA-200', title: 'SLA Policy', category: 'Operations', effectiveDate: '2024-01-01', version: '1.0', status: 'Active', sections: [{ number: '1.1', title: 'Response Times', content: 'P1: 15 min response, 1 hour resolution. P2: 1 hour response, 4 hour resolution. P3: 4 hour response, 8 hour resolution. P4: 8 hour response, 24 hour resolution.' }, { number: '1.2', title: 'Escalation', content: 'P1 incidents auto-escalate after 30 minutes without response. P2 incidents escalate after 2 hours.' }] }
    ],

    // ITSM Notifications
    itsm_notifications: [
      { id: 'NOTIF-001', type: 'sla-warning', title: 'SLA Warning', message: 'INC-002 is at risk of breaching SLA', link: 'INC-002', timestamp: '2025-02-13T10:30:00Z', read: false, recipientId: 'USR-001' },
      { id: 'NOTIF-002', type: 'assignment', title: 'New Assignment', message: 'INC-001 has been assigned to you', link: 'INC-001', timestamp: '2025-02-13T08:35:00Z', read: true, recipientId: 'USR-001' },
      { id: 'NOTIF-003', type: 'cab-approval', title: 'CAB Approval Needed', message: 'CHG-457 requires CAB approval', link: 'CHG-457', timestamp: '2025-02-13T09:05:00Z', read: false, recipientId: 'USR-005' },
      { id: 'NOTIF-004', type: 'change-scheduled', title: 'Change Scheduled Today', message: 'CHG-458 is scheduled for tonight', link: 'CHG-458', timestamp: '2025-02-13T08:00:00Z', read: false, recipientId: 'USR-003' }
    ],

    // ITSM Audit Log
    itsm_audit_log: [
      { id: uuid(), timestamp: '2025-02-13T10:45:00Z', actor: 'sarah.chen@acme.com', action: 'Incident Created', target: 'INC-004', targetType: 'incident', details: 'New incident created via portal', ipAddress: '10.1.3.45' },
      { id: uuid(), timestamp: '2025-02-13T10:30:00Z', actor: 'sarah.miller@acme.com', action: 'Incident Updated', target: 'INC-002', targetType: 'incident', details: 'Added work note about .NET rollback', ipAddress: '10.10.1.50' },
      { id: uuid(), timestamp: '2025-02-13T09:45:00Z', actor: 'michael.brown@acme.com', action: 'Incident Updated', target: 'INC-005', targetType: 'incident', details: 'Added correlation with CHG-456', ipAddress: '10.10.1.53' },
      { id: uuid(), timestamp: '2025-02-13T09:15:00Z', actor: 'alex.thompson@acme.com', action: 'Incident Updated', target: 'INC-001', targetType: 'incident', details: 'Added work note about certificate validation', ipAddress: '10.1.2.10' },
      { id: uuid(), timestamp: '2025-02-13T09:00:00Z', actor: 'lisa.wong@acme.com', action: 'Change Created', target: 'CHG-457', targetType: 'change', details: 'New change request requiring CAB approval', ipAddress: '10.1.3.60' },
      { id: uuid(), timestamp: '2025-02-13T08:00:00Z', actor: 'emily.davis@acme.com', action: 'Change Created', target: 'CHG-458', targetType: 'change', details: 'Emergency change for security vulnerability CVE-2025-1234', ipAddress: '10.1.1.25' }
    ]
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVER SETUP
// ═══════════════════════════════════════════════════════════════════════════

/* ---------- Generate Data ---------- */
const db = generateDatabase();

// Preserve full catalog before json-server/lowdb processes it
// (lowdb may drop items with complex nested objects like optionsMap/showWhen)
const _fullItsmCatalog = JSON.parse(JSON.stringify(db.itsm_catalog));

console.log('📊 Database generated successfully:');
Object.keys(db).forEach(key => {
  const count = Array.isArray(db[key]) ? db[key].length : 1;
  console.log(`   - ${key}: ${count} records`);
});

/* ---------- Load Routes ---------- */
let rewrites = {};
try {
  const routesPath = path.join(__dirname, 'enhanced_routes_complete.json');
  rewrites = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));
  console.log(`✅ Routes loaded: ${Object.keys(rewrites).length} endpoints`);
} catch (error) {
  console.warn('⚠️ Could not load routes.json, using fallback routes');
  // Fallback routes
  rewrites = {
    "/api/hr/workers": "/hr_workers",
    "/api/hr/workers/:id": "/hr_workers/:id",
    "/api/hr/workers/active": "/hr_workers",
    "/api/hr/performance": "/hr_worker_performance",
    "/api/hr/onboarding": "/hr_onboardings",
    "/api/hr/onboarding/inProgress": "/hr_onboardings",
    "/api/hr/supervisoryOrganizations": "/hr_orgs",
    "/api/hr/org/headcount": "/integration_employee_reports",
    "/api/finance/invoices": "/finance_invoices",
    "/api/finance/invoices/:id": "/finance_invoices/:id",
    "/api/finance/invoices/pending": "/finance_invoices",
    "/api/finance/expenses": "/finance_expenses",
    "/api/finance/budget/variance": "/budget_variance",
    "/api/finance/summaries": "/financial_summaries",
    "/api/finance/vendors/performance": "/vendor_performance",
    "/api/crm/customers": "/crm_customers",
    "/api/crm/customers/:id": "/crm_customers/:id",
    "/api/crm/customers/enterprise": "/crm_customers",
    "/api/crm/opportunities": "/crm_opportunities",
    "/api/crm/opportunities/:id/score": "/crm_opportunities/:id",
    "/api/crm/pipeline/forecast": "/sales_pipeline_reports",
    "/api/crm/renewals": "/crm_renewals",
    "/api/crm/support/tickets": "/crm_support_tickets",
    "/api/iot/devices": "/iot_devices",
    "/api/iot/devices/:id": "/iot_devices/:id",
    "/api/iot/devices/online": "/iot_devices",
    "/api/iot/telemetry": "/iot_telemetry",
    "/api/iot/alerts": "/iot_alerts",
    "/api/iot/maintenance": "/iot_maintenance",
    "/api/projects": "/projects",
    "/api/reports/financial/monthly": "/financial_summaries",
    "/api/reports/sales/pipeline": "/sales_pipeline_reports",
    "/api/reports/employee/summary": "/integration_employee_reports",
    "/api/analytics/employee/profiles": "/employee_profiles",
    "/api/analytics/customer/relationships": "/customer_relationships",
    "/api/notifications": "/notifications",
    "/api/workflows/triggers": "/workflow_triggers"
  };
}

/* ---------- Setup Server ---------- */
const server = jsonServer.create();
const router = jsonServer.router(db);
const middlewares = jsonServer.defaults({
  static: path.join(__dirname, 'public'),
  noCors: false
});

// Enable CORS for UiPath
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

server.use(middlewares);
server.use(jsonServer.bodyParser);

/* ---------- Custom Endpoints ---------- */

// Health check
server.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '1.0.0',
    api: {
      endpoints: Object.keys(rewrites).length,
      collections: Object.keys(db).length,
      totalRecords: Object.values(db).reduce((total, collection) =>
        total + (Array.isArray(collection) ? collection.length : 1), 0)
    }
  });
});

// Dynamic telemetry
server.get('/api/iot/devices/:id/telemetry', (req, res) => {
  res.json({
    id: faker.string.uuid(),
    deviceId: req.params.id,
    timestamp: new Date().toISOString(),
    data: {
      temperature: faker.number.float({ min: 15, max: 35, precision: 0.1 }),
      humidity: faker.number.int({ min: 20, max: 80 })
    }
  });
});

// HR Onboarding - Update Status
server.patch('/api/hr/onboarding/:workerId/status', (req, res) => {
  const { workerId } = req.params;
  const { status, updatedBy } = req.body;

  const worker = db.hr_onboardings.find(w => w.workerId === workerId);

  if (!worker) {
    return res.status(404).json({
      success: false,
      error: `Worker with ID ${workerId} not found`
    });
  }

  const previousStatus = worker.status;
  worker.status = status || worker.status;
  worker.lastUpdated = new Date().toISOString();
  worker.updatedBy = updatedBy || 'automation';

  res.json({
    success: true,
    workerId: worker.workerId,
    workerName: worker.workerName,
    previousStatus,
    newStatus: worker.status,
    completedTasks: worker.completedTasks || 10,
    totalTasks: worker.totalTasks || 10,
    updatedBy: worker.updatedBy,
    updatedAt: worker.lastUpdated
  });
});

// HR Onboarding - Assign Equipment
server.post('/api/hr/onboarding/:workerId/equipment', (req, res) => {
  const { workerId } = req.params;
  const { equipmentType, assignedBy } = req.body;

  const worker = db.hr_onboardings.find(w => w.workerId === workerId);

  if (!worker) {
    return res.status(404).json({
      success: false,
      error: `Worker with ID ${workerId} not found`
    });
  }

  const equipmentList = ['Laptop', 'Monitor', 'Keyboard', 'Mouse', 'Headset'];
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  worker.equipmentAssigned = true;
  worker.lastUpdated = new Date().toISOString();
  worker.updatedBy = assignedBy || 'automation';

  res.json({
    success: true,
    workerId: worker.workerId,
    workerName: worker.workerName,
    equipmentAssigned: true,
    assignedItems: equipmentList,
    assignedBy: worker.updatedBy,
    assignedAt: worker.lastUpdated,
    deliveryExpected: deliveryDate.toISOString()
  });
});

// HR Onboarding - Grant System Access
server.post('/api/hr/onboarding/:workerId/access', (req, res) => {
  const { workerId } = req.params;
  const { systems, grantedBy } = req.body;

  const worker = db.hr_onboardings.find(w => w.workerId === workerId);

  if (!worker) {
    return res.status(404).json({
      success: false,
      error: `Worker with ID ${workerId} not found`
    });
  }

  worker.accessGranted = true;
  worker.lastUpdated = new Date().toISOString();
  worker.updatedBy = grantedBy || 'automation';

  res.json({
    success: true,
    workerId: worker.workerId,
    workerName: worker.workerName,
    workerEmail: worker.email,
    accessGranted: true,
    systems: systems || ['email', 'intranet', 'hr_portal'],
    grantedBy: worker.updatedBy,
    grantedAt: worker.lastUpdated,
    activationDate: worker.lastUpdated
  });
});

// HR Onboarding - Create New Onboarding Record
server.post('/api/hr/onboarding', (req, res) => {
  const { workerId, workerName, department, status, createdBy } = req.body;

  if (!workerId || !workerName) {
    return res.status(400).json({
      success: false,
      error: 'workerId and workerName are required'
    });
  }

  // Check if worker already has onboarding record
  const existingWorker = db.hr_onboardings.find(w => w.workerId === workerId);
  if (existingWorker) {
    return res.status(409).json({
      success: false,
      error: `Worker with ID ${workerId} already has an onboarding record`
    });
  }

  const newOnboarding = {
    id: `onb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    workerId,
    workerName,
    department: department || 'Not Assigned',
    status: status || 'pending',
    startDate: new Date().toISOString().split('T')[0],
    expectedCompletionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completedTasks: 0,
    totalTasks: 10,
    equipmentAssigned: false,
    accessGranted: false,
    lastUpdated: new Date().toISOString(),
    updatedBy: createdBy || 'automation'
  };

  db.hr_onboardings.push(newOnboarding);

  res.status(201).json({
    success: true,
    message: 'Onboarding record created successfully',
    onboarding: newOnboarding
  });
});

// HR Onboarding - Reset to Defaults
server.post('/api/hr/onboarding/reset', (req, res) => {
  // Helper functions
  const rand = faker.helpers.arrayElement;
  const uuid = () => faker.string.uuid();
  const futureDate = (days = 30) => faker.date.soon({ days }).toISOString().slice(0, 10);

  // Get employees (workers with managerId set - not managers themselves)
  const employees = db.hr_workers.filter(w => w.managerId !== null);
  const managers = db.hr_workers.filter(w => w.managerId === null);
  const workerIds = db.hr_workers.map(w => w.id);

  // Clear existing onboarding records
  db.hr_onboardings.length = 0;

  // Generate 6 default records
  const selectedWorkers = employees.slice(0, 6);
  const statuses = [
    'pending', 'pending',
    'in-progress', 'in-progress',
    'completed', 'completed'
  ];

  selectedWorkers.forEach((worker, index) => {
    const nameParts = worker.descriptor.split(' ');
    const status = statuses[index];

    let firstName, lastName;
    if (nameParts[0].match(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Miss)$/)) {
      firstName = nameParts[1] || 'Unknown';
      lastName = nameParts.slice(2).join(' ') || 'Worker';
    } else {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ') || 'Worker';
    }

    const cleanLastName = lastName.split(' ')[0];
    const email = `${firstName.toLowerCase()}.${cleanLastName.toLowerCase()}@company.com`;

    db.hr_onboardings.push({
      id: uuid(),
      workerId: worker.id,
      employeeId: `WRK-${String(index + 1).padStart(3, '0')}`,
      firstName: firstName,
      lastName: lastName,
      workerName: worker.descriptor,
      email: email,
      department: worker.department,
      position: worker.primaryJob.title,
      jobTitle: worker.primaryJob.title,
      manager: managers.find(m => m.id === worker.managerId)?.descriptor || 'Not Assigned',
      status: status,
      startDate: status === 'completed'
        ? faker.date.recent({ days: 45 }).toISOString().slice(0, 10)
        : status === 'in-progress'
        ? faker.date.recent({ days: 15 }).toISOString().slice(0, 10)
        : futureDate(30),
      expectedCompletionDate: futureDate(14),
      completedTasks: status === 'completed' ? 10 : status === 'in-progress' ? faker.number.int({ min: 3, max: 7 }) : 0,
      totalTasks: 10,
      assignedBuddy: rand(workerIds),
      equipmentAssigned: status !== 'pending',
      accessGranted: status === 'completed',
      // Stagger timestamps so records sort properly (higher index = older record)
      lastUpdated: new Date(Date.now() - (index * 60000)).toISOString(),
      updatedBy: status === 'completed' ? 'System' : status === 'in-progress' ? 'HR Team' : 'Automated',
      notes: status === 'pending' ? 'Awaiting start date' : status === 'in-progress' ? 'Equipment setup in progress' : 'Onboarding completed successfully',
      source: 'Dashboard'
    });
  });

  res.json({
    success: true,
    message: 'Onboarding records reset to defaults',
    count: db.hr_onboardings.length,
    records: db.hr_onboardings
  });
});

// HR Onboarding - Generate Sample Records
server.post('/api/hr/onboarding/generate', (req, res) => {
  const { count = 5, status = 'pending' } = req.body;

  // Validate inputs
  const validStatuses = ['pending', 'in-progress', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  const recordCount = Math.min(Math.max(1, parseInt(count) || 5), 20); // Limit 1-20

  // Helper functions
  const rand = faker.helpers.arrayElement;
  const uuid = () => faker.string.uuid();
  const futureDate = (days = 30) => faker.date.soon({ days }).toISOString().slice(0, 10);

  // Get employees and managers
  const employees = db.hr_workers.filter(w => w.managerId !== null);
  const managers = db.hr_workers.filter(w => w.managerId === null);
  const workerIds = db.hr_workers.map(w => w.id);

  // Get existing worker IDs in onboarding to avoid duplicates
  const existingWorkerIds = new Set(db.hr_onboardings.map(o => o.workerId));

  // Find available workers (not already in onboarding)
  const availableWorkers = employees.filter(w => !existingWorkerIds.has(w.id));

  if (availableWorkers.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No available workers to add. All employees already have onboarding records.'
    });
  }

  const workersToAdd = availableWorkers.slice(0, recordCount);
  const newRecords = [];

  // Find the highest existing employee ID number to avoid duplicates
  const existingIds = db.hr_onboardings
    .map(r => r.employeeId)
    .filter(id => id && id.startsWith('WRK-'))
    .map(id => parseInt(id.replace('WRK-', ''), 10))
    .filter(n => !isNaN(n));
  let nextIdNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

  workersToAdd.forEach((worker, index) => {
    const nameParts = worker.descriptor.split(' ');

    let firstName, lastName;
    if (nameParts[0].match(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Miss)$/)) {
      firstName = nameParts[1] || 'Unknown';
      lastName = nameParts.slice(2).join(' ') || 'Worker';
    } else {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ') || 'Worker';
    }

    const cleanLastName = lastName.split(' ')[0];
    const email = `${firstName.toLowerCase()}.${cleanLastName.toLowerCase()}@company.com`;

    // Generate unique employee ID
    const newEmployeeId = `WRK-${String(nextIdNumber + index).padStart(3, '0')}`;

    const newRecord = {
      id: uuid(),
      workerId: worker.id,
      employeeId: newEmployeeId,
      firstName: firstName,
      lastName: lastName,
      workerName: worker.descriptor,
      email: email,
      department: worker.department,
      position: worker.primaryJob.title,
      jobTitle: worker.primaryJob.title,
      manager: managers.find(m => m.id === worker.managerId)?.descriptor || 'Not Assigned',
      status: status,
      startDate: status === 'completed'
        ? faker.date.recent({ days: 45 }).toISOString().slice(0, 10)
        : status === 'in-progress'
        ? faker.date.recent({ days: 15 }).toISOString().slice(0, 10)
        : futureDate(30),
      expectedCompletionDate: futureDate(14),
      completedTasks: status === 'completed' ? 10 : status === 'in-progress' ? faker.number.int({ min: 3, max: 7 }) : 0,
      totalTasks: 10,
      assignedBuddy: rand(workerIds),
      equipmentAssigned: status !== 'pending',
      accessGranted: status === 'completed',
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Sample Generator',
      notes: `Generated sample record with status: ${status}`,
      source: 'Dashboard'
    };

    db.hr_onboardings.push(newRecord);
    newRecords.push(newRecord);
  });

  res.status(201).json({
    success: true,
    message: `Generated ${newRecords.length} new onboarding record(s)`,
    requested: recordCount,
    generated: newRecords.length,
    status: status,
    records: newRecords
  });
});

// Root endpoint
server.get('/', (req, res) => {
  res.json({
    message: 'UiPath Workshop API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      workers: '/api/hr/workers',
      invoices: '/api/finance/invoices',
      customers: '/api/crm/customers',
      devices: '/api/iot/devices'
    },
    documentation: 'Enterprise API for UiPath workshop demonstrations'
  });
});

/* ---------- Legacy Portal Routes ---------- */

// Serve legacy portal main page
server.get('/legacy-portal', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'legacy-portal', 'index.html'));
});

// Legacy Portal - Submit Registration (upsert - creates new or updates existing)
server.post('/api/hr/legacy-portal/submit', (req, res) => {
  const {
    employeeId,
    firstName,
    lastName,
    email,
    department,
    jobTitle,
    manager,
    startDate,
    employmentType,
    location,
    notes
  } = req.body;

  // Validation
  if (!employeeId || !firstName || !lastName || !email || !department) {
    return res.status(400).json({
      success: false,
      error: 'Required fields missing: employeeId, firstName, lastName, email, department'
    });
  }

  // Check if record already exists
  const existingRecord = db.hr_onboardings.find(r => r.employeeId === employeeId);

  if (existingRecord) {
    // UPDATE existing record
    existingRecord.firstName = firstName;
    existingRecord.lastName = lastName;
    existingRecord.workerName = `${firstName} ${lastName}`;
    existingRecord.email = email;
    existingRecord.department = department;
    existingRecord.jobTitle = jobTitle || existingRecord.jobTitle || 'Not Specified';
    existingRecord.position = jobTitle || existingRecord.position || 'Not Specified';
    existingRecord.manager = manager || existingRecord.manager || 'Not Assigned';
    existingRecord.startDate = startDate || existingRecord.startDate;
    existingRecord.employmentType = employmentType || existingRecord.employmentType || 'Full-time';
    existingRecord.location = location || existingRecord.location || 'Not Specified';
    existingRecord.notes = notes || existingRecord.notes || '';
    existingRecord.source = 'Legacy Portal';
    existingRecord.updatedBy = 'Legacy Portal';
    existingRecord.lastUpdated = new Date().toISOString();
    existingRecord.updatedAt = new Date().toISOString();

    return res.status(200).json({
      success: true,
      message: 'Registration updated successfully',
      action: 'updated',
      registrationId: `REG-${String(existingRecord.id).padStart(5, '0')}`,
      record: existingRecord
    });
  }

  // CREATE new record
  const newId = db.hr_onboardings.length > 0
    ? Math.max(...db.hr_onboardings.map(r => typeof r.id === 'number' ? r.id : parseInt(r.id) || 0)) + 1
    : 1;

  const newRecord = {
    id: newId,
    employeeId,
    workerId: employeeId,
    workerName: `${firstName} ${lastName}`,
    firstName,
    lastName,
    email,
    department,
    jobTitle: jobTitle || 'Not Specified',
    position: jobTitle || 'Not Specified',
    manager: manager || 'Not Assigned',
    startDate: startDate || new Date().toISOString().split('T')[0],
    employmentType: employmentType || 'Full-time',
    location: location || 'Not Specified',
    notes: notes || '',
    status: 'pending',
    completedTasks: 0,
    totalTasks: 10,
    equipmentAssigned: false,
    accessGranted: false,
    source: 'Legacy Portal',
    updatedBy: 'Legacy Portal',
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.hr_onboardings.push(newRecord);

  res.status(201).json({
    success: true,
    message: 'Registration submitted successfully',
    action: 'created',
    registrationId: `REG-${String(newId).padStart(5, '0')}`,
    record: newRecord
  });
});

// Legacy Portal - Get All Submissions
server.get('/api/hr/legacy-portal/submissions', (req, res) => {
  // Filter only legacy portal submissions
  const legacySubmissions = db.hr_onboardings.filter(r => r.source === 'Legacy Portal');

  res.json({
    success: true,
    count: legacySubmissions.length,
    submissions: legacySubmissions
  });
});

// Legacy Portal - Verify Registration
server.get('/api/hr/legacy-portal/verify/:id', (req, res) => {
  const { id } = req.params;

  // Try to find by numeric ID or registration ID
  let record = db.hr_onboardings.find(r =>
    r.id === parseInt(id) ||
    r.id === id ||
    r.employeeId === id
  );

  if (!record) {
    return res.status(404).json({
      success: false,
      verified: false,
      error: `Registration with ID ${id} not found`
    });
  }

  res.json({
    success: true,
    verified: true,
    registrationId: `REG-${String(record.id).padStart(5, '0')}`,
    employeeId: record.employeeId,
    workerName: record.workerName,
    department: record.department,
    status: record.status,
    source: record.source || 'Dashboard',
    createdAt: record.createdAt,
    message: record.source === 'Legacy Portal'
      ? 'Registration verified - submitted via Legacy Portal'
      : 'Registration verified - submitted via Dashboard'
  });
});

// Get pending onboarding records with enriched worker data
server.get('/api/hr/onboarding/pending', (req, res) => {
  // Get all pending onboarding records
  const pendingRecords = db.hr_onboardings.filter(r => r.status === 'pending');

  // Enrich each record with worker details
  const enrichedRecords = pendingRecords.map(record => {
    // Check if record already has enriched fields (from default onboarding data or Legacy Portal)
    if (record.firstName && record.lastName && record.email && record.position) {
      return {
        ...record,
        // Ensure position field exists (map jobTitle to position if needed)
        position: record.position || record.jobTitle || 'Not Specified'
      };
    }

    // Base records need worker data lookup
    const worker = db.hr_workers.find(w => w.id === record.workerId);

    if (!worker) {
      // If worker not found, return record with defaults
      return {
        ...record,
        employeeId: record.employeeId || record.workerId,
        firstName: 'Unknown',
        lastName: 'Worker',
        workerName: 'Unknown Worker',
        email: 'unknown@company.com',
        department: 'Not Assigned',
        position: 'Not Specified',
        jobTitle: 'Not Specified',
        manager: 'Not Assigned',
        notes: '',
        source: 'Dashboard'
      };
    }

    // Merge onboarding record with worker details (map from worker object structure)
    const firstName = worker.descriptor ? worker.descriptor.split(' ')[0] : 'Unknown';
    const lastName = worker.descriptor ? worker.descriptor.split(' ').slice(1).join(' ') : 'Worker';
    const managerWorker = db.hr_workers.find(w => w.id === worker.managerId);

    return {
      ...record,
      employeeId: record.employeeId || worker.id,
      firstName: firstName,
      lastName: lastName,
      workerName: worker.descriptor,
      email: worker.primaryWorkEmail,
      department: worker.department,
      position: worker.primaryJob?.title || 'Not Specified',
      jobTitle: worker.primaryJob?.title || 'Not Specified',
      manager: managerWorker?.descriptor || 'Not Assigned',
      notes: record.notes || '',
      source: record.source || 'Dashboard'
    };
  });

  res.json(enrichedRecords);
});

// Get in-progress onboarding records with enriched worker data
server.get('/api/hr/onboarding/inProgress', (req, res) => {
  // Get all in-progress onboarding records
  const inProgressRecords = db.hr_onboardings.filter(r => r.status === 'in-progress');

  // Enrich each record with worker details
  const enrichedRecords = inProgressRecords.map(record => {
    // Check if record already has enriched fields (from default onboarding data or Legacy Portal)
    if (record.firstName && record.lastName && record.email && record.position) {
      return {
        ...record,
        // Ensure position field exists (map jobTitle to position if needed)
        position: record.position || record.jobTitle || 'Not Specified'
      };
    }

    // Base records need worker data lookup
    const worker = db.hr_workers.find(w => w.id === record.workerId);

    if (!worker) {
      // If worker not found, return record with defaults
      return {
        ...record,
        employeeId: record.employeeId || record.workerId,
        firstName: 'Unknown',
        lastName: 'Worker',
        workerName: 'Unknown Worker',
        email: 'unknown@company.com',
        department: 'Not Assigned',
        position: 'Not Specified',
        jobTitle: 'Not Specified',
        manager: 'Not Assigned',
        notes: '',
        source: 'Dashboard'
      };
    }

    // Merge onboarding record with worker details (map from worker object structure)
    const firstName = worker.descriptor ? worker.descriptor.split(' ')[0] : 'Unknown';
    const lastName = worker.descriptor ? worker.descriptor.split(' ').slice(1).join(' ') : 'Worker';
    const managerWorker = db.hr_workers.find(w => w.id === worker.managerId);

    return {
      ...record,
      employeeId: record.employeeId || worker.id,
      firstName: firstName,
      lastName: lastName,
      workerName: worker.descriptor,
      email: worker.primaryWorkEmail,
      department: worker.department,
      position: worker.primaryJob?.title || 'Not Specified',
      jobTitle: worker.primaryJob?.title || 'Not Specified',
      manager: managerWorker?.descriptor || 'Not Assigned',
      notes: record.notes || '',
      source: record.source || 'Dashboard'
    };
  });

  res.json(enrichedRecords);
});

// Get ALL onboarding records with enriched worker data (for dashboard display)
server.get('/api/hr/onboarding/enriched', (req, res) => {
  // Get ALL onboarding records (not filtered by status)
  const allRecords = db.hr_onboardings;

  // Use the same enrichment logic as the pending endpoint
  const enrichedRecords = allRecords.map(record => {
    // Check if record already has enriched fields (from default onboarding data or Legacy Portal)
    if (record.firstName && record.lastName && record.email && record.position) {
      return {
        ...record,
        position: record.position || record.jobTitle || 'Not Specified'
      };
    }

    // Base records need worker data lookup
    const worker = db.hr_workers.find(w => w.id === record.workerId);

    if (!worker) {
      return {
        ...record,
        employeeId: record.employeeId || record.workerId,
        firstName: 'Unknown',
        lastName: 'Worker',
        workerName: 'Unknown Worker',
        email: 'unknown@company.com',
        department: 'Not Assigned',
        position: 'Not Specified',
        jobTitle: 'Not Specified',
        manager: 'Not Assigned',
        notes: '',
        source: 'Dashboard'
      };
    }

    // Merge onboarding record with worker details
    const firstName = worker.descriptor ? worker.descriptor.split(' ')[0] : 'Unknown';
    const lastName = worker.descriptor ? worker.descriptor.split(' ').slice(1).join(' ') : 'Worker';
    const managerWorker = db.hr_workers.find(w => w.id === worker.managerId);

    return {
      ...record,
      employeeId: record.employeeId || worker.id,
      firstName: firstName,
      lastName: lastName,
      workerName: worker.descriptor,
      email: worker.primaryWorkEmail,
      department: worker.department,
      position: worker.primaryJob?.title || 'Not Specified',
      jobTitle: worker.primaryJob?.title || 'Not Specified',
      manager: managerWorker?.descriptor || 'Not Assigned',
      notes: record.notes || '',
      source: record.source || 'Dashboard'
    };
  });

  res.json(enrichedRecords);
});

// Legacy Portal - Get single onboarding record by ID
server.get('/api/hr/onboarding/:id', (req, res) => {
  const { id } = req.params;

  const record = db.hr_onboardings.find(r =>
    r.id === parseInt(id) ||
    r.id === id
  );

  if (!record) {
    return res.status(404).json({
      error: `Record with ID ${id} not found`
    });
  }

  res.json(record);
});

// Legacy Portal - Delete onboarding record
server.delete('/api/hr/onboarding/:id', (req, res) => {
  const { id } = req.params;

  const index = db.hr_onboardings.findIndex(r =>
    r.id === parseInt(id) ||
    r.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      error: `Record with ID ${id} not found`
    });
  }

  const deleted = db.hr_onboardings.splice(index, 1)[0];

  res.json({
    success: true,
    message: 'Record deleted successfully',
    deletedRecord: deleted
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ITSM CUSTOM ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// Helper: generate next ITSM ID for a collection
function nextItsmId(collection, prefix) {
  const ids = collection.map(r => parseInt(r.id.replace(`${prefix}-`, '')));
  const max = ids.length > 0 ? Math.max(...ids) : 0;
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

// Helper: add audit log entry
function addItsmAudit(actor, action, target, targetType, details) {
  db.itsm_audit_log.unshift({
    id: faker.string.uuid(),
    timestamp: new Date().toISOString(),
    actor: actor || 'api',
    action,
    target,
    targetType,
    details,
    ipAddress: '127.0.0.1'
  });
}

// Helper: priority from impact+urgency
function normalizeImpactUrgency(val) {
  if (typeof val === 'number') return Math.max(1, Math.min(4, val));
  if (typeof val === 'string') {
    const num = parseInt(val, 10);
    if (!isNaN(num)) return Math.max(1, Math.min(4, num));
    const map = { 'critical': 1, 'high': 1, 'medium': 2, 'low': 3, 'very low': 4, 'none': 4 };
    return map[val.toLowerCase()] || 2;
  }
  return 2;
}

function calcPriority(impact, urgency) {
  const s = normalizeImpactUrgency(impact) + normalizeImpactUrgency(urgency);
  return s <= 2 ? 'P1' : s <= 3 ? 'P2' : s <= 5 ? 'P3' : 'P4';
}

// ── Incidents ──

server.post('/api/itsm/incidents', (req, res) => {
  const { title, description, callerEmail, callerName, category, impact, urgency, assignmentGroup } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, error: 'title and description are required' });
  }
  const priority = calcPriority(impact, urgency);
  const slaHours = { P1: 1, P2: 4, P3: 8, P4: 24 };
  const id = nextItsmId(db.itsm_incidents, 'INC');
  const now = new Date().toISOString();
  const incident = {
    id, title, description,
    callerName: callerName || 'Unknown', callerEmail: callerEmail || null,
    callerPhone: req.body.callerPhone || null, callerDepartment: req.body.callerDepartment || null,
    callerLocation: req.body.callerLocation || null, callerVip: req.body.callerVip || false,
    openedBy: req.body.openedBy || 'api', openedByName: req.body.openedByName || 'API',
    contactType: req.body.contactType || 'self-service',
    category: category || 'General', subcategory: req.body.subcategory || null,
    impact: impact || 2, urgency: urgency || 2, priority,
    businessService: req.body.businessService || null,
    status: 'New',
    assignmentGroup: assignmentGroup || 'Service Desk', assignedTo: assignmentGroup || 'Service Desk',
    assignee: req.body.assignee || null, assigneeName: req.body.assigneeName || null,
    configurationItem: req.body.configurationItem || null,
    slaTarget: new Date(Date.now() + slaHours[priority] * 3600000).toISOString(),
    createdAt: now, updatedAt: now, resolvedAt: null,
    notes: [{ type: 'system', visibility: 'technicians-only', author: 'System', content: `Incident created via API`, timestamp: now }],
    attachments: [], linkedKB: [], linkedProblems: [], linkedChanges: [],
    watchList: [], additionalCommentsNotify: [], workNotesNotify: []
  };
  db.itsm_incidents.push(incident);
  addItsmAudit('api', 'Incident Created', id, 'incident', `Created ${priority} incident: ${title}`);
  res.status(201).json({ success: true, message: `Incident ${id} created successfully`, data: incident });
});

server.patch('/api/itsm/incidents/:id/status', (req, res) => {
  const inc = db.itsm_incidents.find(i => i.id === req.params.id);
  if (!inc) return res.status(404).json({ success: false, error: 'Incident not found' });
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, error: 'status is required' });
  const valid = { 'New': ['Open', 'In Progress', 'Cancelled'], 'Open': ['In Progress', 'Pending', 'Resolved'], 'In Progress': ['Pending', 'Resolved'], 'Pending': ['Open', 'In Progress', 'Resolved'], 'Resolved': ['Closed', 'Open'], 'Closed': [] };
  if (valid[inc.status] && !valid[inc.status].includes(status)) {
    return res.status(400).json({ success: false, error: `Cannot transition from ${inc.status} to ${status}` });
  }
  const oldStatus = inc.status;
  inc.status = status;
  inc.updatedAt = new Date().toISOString();
  if (status === 'Resolved') inc.resolvedAt = inc.updatedAt;
  inc.notes.push({ type: 'system', visibility: 'technicians-only', author: 'System', content: `Status changed from ${oldStatus} to ${status}`, timestamp: inc.updatedAt });
  addItsmAudit('api', 'Incident Updated', inc.id, 'incident', `Status: ${oldStatus} → ${status}`);
  res.json({ success: true, message: `Incident ${inc.id} status updated to ${status}`, data: inc });
});

server.post('/api/itsm/incidents/:id/notes', (req, res) => {
  const inc = db.itsm_incidents.find(i => i.id === req.params.id);
  if (!inc) return res.status(404).json({ success: false, error: 'Incident not found' });
  const { content, type, author } = req.body;
  if (!content) return res.status(400).json({ success: false, error: 'content is required' });
  const note = { type: type || 'internal', visibility: type === 'customer' ? 'customer-visible' : 'technicians-only', author: author || 'api', content, timestamp: new Date().toISOString() };
  inc.notes.push(note);
  inc.updatedAt = note.timestamp;
  res.status(201).json({ success: true, message: 'Note added', data: note });
});

server.post('/api/itsm/incidents/:id/assign', (req, res) => {
  const inc = db.itsm_incidents.find(i => i.id === req.params.id);
  if (!inc) return res.status(404).json({ success: false, error: 'Incident not found' });
  const { assignmentGroup, assignee, assigneeName } = req.body;
  if (assignmentGroup) { inc.assignmentGroup = assignmentGroup; inc.assignedTo = assignmentGroup; }
  if (assignee) { inc.assignee = assignee; inc.assigneeName = assigneeName || assignee; }
  inc.updatedAt = new Date().toISOString();
  inc.notes.push({ type: 'system', visibility: 'technicians-only', author: 'System', content: `Assigned to ${assigneeName || assignee || assignmentGroup}`, timestamp: inc.updatedAt });
  addItsmAudit('api', 'Assignment Changed', inc.id, 'incident', `Assigned to ${assigneeName || assignee || assignmentGroup}`);
  res.json({ success: true, message: 'Assignment updated', data: inc });
});

server.post('/api/itsm/incidents/:id/escalate', (req, res) => {
  const inc = db.itsm_incidents.find(i => i.id === req.params.id);
  if (!inc) return res.status(404).json({ success: false, error: 'Incident not found' });
  const order = ['P4', 'P3', 'P2', 'P1'];
  const idx = order.indexOf(inc.priority);
  if (idx >= order.length - 1) return res.status(400).json({ success: false, error: 'Already at highest priority' });
  const oldPriority = inc.priority;
  inc.priority = order[idx + 1];
  inc.updatedAt = new Date().toISOString();
  inc.notes.push({ type: 'system', visibility: 'technicians-only', author: 'System', content: `Escalated from ${oldPriority} to ${inc.priority}`, timestamp: inc.updatedAt });
  addItsmAudit('api', 'Incident Updated', inc.id, 'incident', `Priority escalated: ${oldPriority} → ${inc.priority}`);
  res.json({ success: true, message: `Escalated to ${inc.priority}`, data: inc });
});

server.patch('/api/itsm/incidents/:id', (req, res) => {
  const inc = db.itsm_incidents.find(i => i.id === req.params.id);
  if (!inc) return res.status(404).json({ success: false, error: 'Incident not found' });
  const body = req.body;
  if (!body || Object.keys(body).length === 0) {
    return res.status(400).json({ success: false, error: 'Request body cannot be empty' });
  }
  const readOnly = ['id', 'createdAt', 'notes', 'attachments', 'linkedKB', 'linkedProblems', 'linkedChanges', 'watchList', 'additionalCommentsNotify', 'workNotesNotify'];
  const changes = [];
  for (const [key, value] of Object.entries(body)) {
    if (readOnly.includes(key)) continue;
    if (inc[key] !== value) {
      changes.push(`${key}: ${inc[key]} → ${value}`);
      inc[key] = value;
    }
  }
  if (body.impact !== undefined || body.urgency !== undefined) {
    const oldPriority = inc.priority;
    inc.priority = calcPriority(inc.impact, inc.urgency);
    if (oldPriority !== inc.priority) changes.push(`priority: ${oldPriority} → ${inc.priority} (auto-calculated)`);
  }
  if (changes.length === 0) {
    return res.json({ success: true, message: 'No changes detected', data: inc });
  }
  inc.updatedAt = new Date().toISOString();
  inc.notes.push({ type: 'system', visibility: 'technicians-only', author: 'System', content: `Fields updated: ${changes.join(', ')}`, timestamp: inc.updatedAt });
  addItsmAudit('api', 'Incident Updated', inc.id, 'incident', changes.join('; '));
  res.json({ success: true, message: `Incident ${inc.id} updated`, changes, data: inc });
});

server.post('/api/itsm/incidents/:id/resolve', (req, res) => {
  const inc = db.itsm_incidents.find(i => i.id === req.params.id);
  if (!inc) return res.status(404).json({ success: false, error: 'Incident not found' });
  const { resolutionCode, resolutionNotes } = req.body;
  if (!resolutionCode || !resolutionNotes) return res.status(400).json({ success: false, error: 'resolutionCode and resolutionNotes are required' });
  inc.status = 'Resolved';
  inc.resolvedAt = new Date().toISOString();
  inc.updatedAt = inc.resolvedAt;
  inc.resolutionCode = resolutionCode;
  inc.resolutionNotes = resolutionNotes;
  inc.slaMet = new Date(inc.resolvedAt) <= new Date(inc.slaTarget);
  inc.notes.push({ type: 'system', visibility: 'customer-visible', author: 'System', content: `Resolved: ${resolutionCode} - ${resolutionNotes}`, timestamp: inc.updatedAt });
  addItsmAudit('api', 'Incident Resolved', inc.id, 'incident', `Resolution: ${resolutionCode}`);
  res.json({ success: true, message: `Incident ${inc.id} resolved`, data: inc });
});

server.post('/api/itsm/incidents/:id/link', (req, res) => {
  const inc = db.itsm_incidents.find(i => i.id === req.params.id);
  if (!inc) return res.status(404).json({ success: false, error: 'Incident not found' });
  const { targetId, linkType } = req.body;
  if (!targetId || !linkType) return res.status(400).json({ success: false, error: 'targetId and linkType are required' });
  if (linkType === 'change') { if (!inc.linkedChanges.includes(targetId)) inc.linkedChanges.push(targetId); }
  else if (linkType === 'problem') { if (!inc.linkedProblems.includes(targetId)) inc.linkedProblems.push(targetId); }
  else if (linkType === 'kb') { if (!inc.linkedKB.includes(targetId)) inc.linkedKB.push(targetId); }
  inc.updatedAt = new Date().toISOString();
  res.json({ success: true, message: `Linked ${linkType} ${targetId} to ${inc.id}`, data: inc });
});

// Custom catalog routes — bypass json-server/lowdb which drops complex nested items
server.get('/api/itsm/catalog', (req, res) => {
  const category = req.query.category;
  let items = _fullItsmCatalog;
  if (category) items = items.filter(i => i.category === category);
  res.json(items);
});

server.get('/api/itsm/catalog/:id', (req, res) => {
  const item = _fullItsmCatalog.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Catalog item not found' });
  res.json(item);
});

server.get('/itsm_catalog', (req, res) => {
  res.json(_fullItsmCatalog);
});

server.get('/itsm_catalog/:id', (req, res) => {
  const item = _fullItsmCatalog.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Catalog item not found' });
  res.json(item);
});

server.get('/api/itsm/incidents/stats', (req, res) => {
  const incs = db.itsm_incidents;
  const byStatus = {};
  const byPriority = {};
  incs.forEach(i => { byStatus[i.status] = (byStatus[i.status] || 0) + 1; byPriority[i.priority] = (byPriority[i.priority] || 0) + 1; });
  const resolved = incs.filter(i => i.resolvedAt);
  const slaMetCount = resolved.filter(i => i.slaMet === true).length;
  res.json({
    success: true,
    data: {
      total: incs.length,
      open: incs.filter(i => !['Resolved', 'Closed'].includes(i.status)).length,
      byStatus, byPriority,
      slaCompliance: resolved.length > 0 ? Math.round((slaMetCount / resolved.length) * 100) : 100,
      resolved: resolved.length
    }
  });
});

// ── Changes ──

server.post('/api/itsm/changes', (req, res) => {
  const { title, type } = req.body;
  if (!title) return res.status(400).json({ success: false, error: 'title is required' });
  const id = nextItsmId(db.itsm_changes, 'CHG');
  const now = new Date().toISOString();
  const change = {
    id, title, description: req.body.description || '',
    type: type || 'Normal', status: 'Draft',
    risk: req.body.risk || 'Medium', priority: req.body.priority || 'Normal',
    category: req.body.category || 'Application', subcategory: req.body.subcategory || null,
    requestedBy: req.body.requestedBy || 'api', requesterName: req.body.requesterName || 'API User',
    requesterEmail: req.body.requesterEmail || null, requesterPhone: req.body.requesterPhone || null,
    requesterDept: req.body.requesterDept || null, requestedFor: req.body.requestedFor || null,
    assignedTo: req.body.assignedTo || 'Release Team', assignee: req.body.assignee || null,
    implementer: req.body.implementer || null,
    impact: req.body.impact || 2, affectedUsers: req.body.affectedUsers || 'single',
    affectedServices: req.body.affectedServices || [], affectedAssets: req.body.affectedAssets || [],
    outageRequired: req.body.outageRequired || false, outageDuration: req.body.outageDuration || 0,
    justification: req.body.justification || '', implementationPlan: req.body.implementationPlan || '',
    testPlan: req.body.testPlan || '', rollbackPlan: req.body.rollbackPlan || '',
    relatedIncident: req.body.relatedIncident || null,
    scheduledStart: req.body.scheduledStart || null, scheduledEnd: req.body.scheduledEnd || null,
    changeWindow: req.body.changeWindow || 'normal',
    actualStart: null, actualEnd: null,
    cabRequired: type === 'Normal' || type === 'Emergency',
    cabApproval: null,
    notifyRecipients: req.body.notifyRecipients || [], communicationNotes: req.body.communicationNotes || '',
    createdAt: now,
    notes: [{ timestamp: now, author: 'System', content: 'Change request created via API' }]
  };
  db.itsm_changes.push(change);
  addItsmAudit('api', 'Change Created', id, 'change', `Created change: ${title}`);
  res.status(201).json({ success: true, message: `Change ${id} created`, data: change });
});

server.patch('/api/itsm/changes/:id/status', (req, res) => {
  const chg = db.itsm_changes.find(c => c.id === req.params.id);
  if (!chg) return res.status(404).json({ success: false, error: 'Change not found' });
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, error: 'status is required' });
  const valid = { 'Draft': ['Pending Approval', 'Cancelled'], 'Pending Approval': ['Approved', 'Rejected'], 'Approved': ['Scheduled', 'Cancelled'], 'Rejected': ['Draft'], 'Scheduled': ['Implementing', 'Cancelled'], 'Implementing': ['Implemented', 'Failed'], 'Implemented': [], 'Failed': ['Draft'], 'Cancelled': ['Draft'] };
  if (valid[chg.status] && !valid[chg.status].includes(status)) {
    return res.status(400).json({ success: false, error: `Cannot transition from ${chg.status} to ${status}` });
  }
  const oldStatus = chg.status;
  chg.status = status;
  chg.notes.push({ timestamp: new Date().toISOString(), author: 'System', content: `Status changed from ${oldStatus} to ${status}` });
  addItsmAudit('api', 'Change Updated', chg.id, 'change', `Status: ${oldStatus} → ${status}`);
  res.json({ success: true, message: `Change ${chg.id} status updated to ${status}`, data: chg });
});

server.post('/api/itsm/changes/:id/approve', (req, res) => {
  const chg = db.itsm_changes.find(c => c.id === req.params.id);
  if (!chg) return res.status(404).json({ success: false, error: 'Change not found' });
  if (chg.status !== 'Pending Approval') return res.status(400).json({ success: false, error: 'Change must be in Pending Approval status' });
  chg.status = 'Approved';
  chg.cabApproval = new Date().toISOString();
  chg.notes.push({ timestamp: chg.cabApproval, author: req.body.approver || 'CAB', content: `Change approved${req.body.comments ? ': ' + req.body.comments : ''}` });
  addItsmAudit(req.body.approver || 'CAB', 'Change Approved', chg.id, 'change', 'CAB approval granted');
  res.json({ success: true, message: `Change ${chg.id} approved`, data: chg });
});

server.post('/api/itsm/changes/:id/reject', (req, res) => {
  const chg = db.itsm_changes.find(c => c.id === req.params.id);
  if (!chg) return res.status(404).json({ success: false, error: 'Change not found' });
  if (chg.status !== 'Pending Approval') return res.status(400).json({ success: false, error: 'Change must be in Pending Approval status' });
  if (!req.body.reason) return res.status(400).json({ success: false, error: 'reason is required' });
  chg.status = 'Rejected';
  chg.rejectionReason = req.body.reason;
  chg.notes.push({ timestamp: new Date().toISOString(), author: req.body.approver || 'CAB', content: `Change rejected: ${req.body.reason}` });
  addItsmAudit(req.body.approver || 'CAB', 'Change Rejected', chg.id, 'change', `Rejected: ${req.body.reason}`);
  res.json({ success: true, message: `Change ${chg.id} rejected`, data: chg });
});

server.post('/api/itsm/changes/:id/implement', (req, res) => {
  const chg = db.itsm_changes.find(c => c.id === req.params.id);
  if (!chg) return res.status(404).json({ success: false, error: 'Change not found' });
  if (chg.status !== 'Scheduled') return res.status(400).json({ success: false, error: 'Change must be in Scheduled status' });
  chg.status = 'Implementing';
  chg.actualStart = new Date().toISOString();
  chg.notes.push({ timestamp: chg.actualStart, author: 'System', content: 'Implementation started' });
  addItsmAudit('api', 'Change Implementation Started', chg.id, 'change', 'Implementation started');
  res.json({ success: true, message: `Change ${chg.id} implementation started`, data: chg });
});

server.post('/api/itsm/changes/:id/complete', (req, res) => {
  const chg = db.itsm_changes.find(c => c.id === req.params.id);
  if (!chg) return res.status(404).json({ success: false, error: 'Change not found' });
  if (chg.status !== 'Implementing') return res.status(400).json({ success: false, error: 'Change must be in Implementing status' });
  const success = req.body.success !== false;
  chg.status = success ? 'Implemented' : 'Failed';
  chg.actualEnd = new Date().toISOString();
  chg.notes.push({ timestamp: chg.actualEnd, author: 'System', content: success ? 'Implementation completed successfully' : `Implementation failed: ${req.body.failureReason || 'Unknown'}` });
  addItsmAudit('api', success ? 'Change Implemented' : 'Change Failed', chg.id, 'change', success ? 'Completed' : req.body.failureReason || 'Failed');
  res.json({ success: true, message: `Change ${chg.id} ${chg.status.toLowerCase()}`, data: chg });
});

server.get('/api/itsm/changes/calendar', (req, res) => {
  const { month, year } = req.query;
  let changes = db.itsm_changes.filter(c => c.scheduledStart);
  if (month && year) {
    changes = changes.filter(c => { const d = new Date(c.scheduledStart); return d.getMonth() + 1 === parseInt(month) && d.getFullYear() === parseInt(year); });
  }
  const grouped = {};
  changes.forEach(c => { const day = c.scheduledStart.slice(0, 10); if (!grouped[day]) grouped[day] = []; grouped[day].push(c); });
  res.json({ success: true, data: grouped });
});

server.get('/api/itsm/changes/stats', (req, res) => {
  const chgs = db.itsm_changes;
  const byStatus = {};
  const byType = {};
  const byRisk = {};
  chgs.forEach(c => { byStatus[c.status] = (byStatus[c.status] || 0) + 1; byType[c.type] = (byType[c.type] || 0) + 1; byRisk[c.risk] = (byRisk[c.risk] || 0) + 1; });
  const completed = chgs.filter(c => c.status === 'Implemented' || c.status === 'Failed');
  const successRate = completed.length > 0 ? Math.round((completed.filter(c => c.status === 'Implemented').length / completed.length) * 100) : 100;
  res.json({ success: true, data: { total: chgs.length, pending: chgs.filter(c => c.status === 'Pending Approval').length, byStatus, byType, byRisk, successRate } });
});

// ── Service Requests ──

server.post('/api/itsm/requests', (req, res) => {
  const { catalogItem, requestedBy, requestedByName } = req.body;
  if (!catalogItem) return res.status(400).json({ success: false, error: 'catalogItem is required' });
  const catItem = _fullItsmCatalog.find(c => c.id === catalogItem);
  if (!catItem) return res.status(400).json({ success: false, error: `Catalog item ${catalogItem} not found` });
  const id = nextItsmId(db.itsm_requests, 'REQ');
  const now = new Date().toISOString();
  const request = {
    id, catalogItem, catalogItemName: catItem.name,
    title: `${catItem.name} - ${requestedByName || 'User'}`,
    description: req.body.description || catItem.description,
    requestedBy: requestedBy || 'api', requestedByName: requestedByName || 'API User',
    requestedFor: req.body.requestedFor || requestedBy || 'api',
    requestedForName: req.body.requestedForName || requestedByName || 'API User',
    requestedForDepartment: req.body.requestedForDepartment || null,
    requestedForLocation: req.body.requestedForLocation || null,
    requestedForVip: req.body.requestedForVip || false,
    category: catItem.category, priority: req.body.priority || 'Normal',
    impact: req.body.impact || 2, urgency: req.body.urgency || 2,
    status: catItem.approvalRequired ? 'Pending Approval' : 'Submitted',
    formData: req.body.formData || {},
    approvalRequired: catItem.approvalRequired,
    approver: req.body.approver || null, approverName: req.body.approverName || null,
    approvalDate: null, approvalComments: null, rejectionReason: null,
    assignmentGroup: req.body.assignmentGroup || 'Service Desk',
    assignedTo: null, assigneeName: null,
    slaTarget: new Date(Date.now() + 5 * 24 * 3600000).toISOString(),
    slaMet: null, expectedFulfillment: catItem.fulfillmentTime,
    estimatedCost: catItem.cost, actualCost: null, fulfillmentDate: null,
    createdAt: now, updatedAt: now, submittedAt: now, closedAt: null,
    notes: [{ type: 'system', visibility: 'technicians-only', author: 'System', content: 'Service request created via API', timestamp: now }],
    attachments: [], linkedIncidents: [], linkedChanges: [], linkedKB: [],
    watchList: [], additionalCommentsNotify: []
  };
  db.itsm_requests.push(request);
  addItsmAudit(requestedBy || 'api', 'Request Submitted', id, 'request', `Created: ${catItem.name}`);
  res.status(201).json({ success: true, message: `Request ${id} created`, data: request });
});

server.patch('/api/itsm/requests/:id/status', (req, res) => {
  const r = db.itsm_requests.find(r => r.id === req.params.id);
  if (!r) return res.status(404).json({ success: false, error: 'Request not found' });
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, error: 'status is required' });
  const valid = { 'Draft': ['Submitted'], 'Submitted': ['Pending Approval', 'In Progress', 'Cancelled'], 'Pending Approval': ['Approved', 'Rejected'], 'Approved': ['In Progress', 'Cancelled'], 'Rejected': ['Draft', 'Cancelled'], 'In Progress': ['Fulfilled', 'Cancelled'], 'Fulfilled': ['Closed'], 'Closed': [], 'Cancelled': [] };
  if (valid[r.status] && !valid[r.status].includes(status)) {
    return res.status(400).json({ success: false, error: `Cannot transition from ${r.status} to ${status}` });
  }
  const oldStatus = r.status;
  r.status = status;
  r.updatedAt = new Date().toISOString();
  if (status === 'Fulfilled') r.fulfillmentDate = r.updatedAt;
  if (status === 'Closed') r.closedAt = r.updatedAt;
  r.notes.push({ type: 'system', visibility: 'technicians-only', author: 'System', content: `Status changed from ${oldStatus} to ${status}`, timestamp: r.updatedAt });
  addItsmAudit('api', 'Request Updated', r.id, 'request', `Status: ${oldStatus} → ${status}`);
  res.json({ success: true, message: `Request ${r.id} status updated to ${status}`, data: r });
});

server.post('/api/itsm/requests/:id/approve', (req, res) => {
  const r = db.itsm_requests.find(r => r.id === req.params.id);
  if (!r) return res.status(404).json({ success: false, error: 'Request not found' });
  if (r.status !== 'Pending Approval') return res.status(400).json({ success: false, error: 'Request must be in Pending Approval status' });
  r.status = 'Approved';
  r.approvalDate = new Date().toISOString();
  r.approvalComments = req.body.comments || 'Approved';
  r.updatedAt = r.approvalDate;
  r.notes.push({ type: 'system', visibility: 'customer-visible', author: req.body.approver || 'Approver', content: `Request approved${req.body.comments ? ': ' + req.body.comments : ''}`, timestamp: r.updatedAt });
  addItsmAudit(req.body.approver || 'Approver', 'Request Approved', r.id, 'request', 'Approved');
  res.json({ success: true, message: `Request ${r.id} approved`, data: r });
});

server.post('/api/itsm/requests/:id/reject', (req, res) => {
  const r = db.itsm_requests.find(r => r.id === req.params.id);
  if (!r) return res.status(404).json({ success: false, error: 'Request not found' });
  if (r.status !== 'Pending Approval') return res.status(400).json({ success: false, error: 'Request must be in Pending Approval status' });
  if (!req.body.reason) return res.status(400).json({ success: false, error: 'reason is required' });
  r.status = 'Rejected';
  r.rejectionReason = req.body.reason;
  r.updatedAt = new Date().toISOString();
  r.notes.push({ type: 'system', visibility: 'customer-visible', author: req.body.approver || 'Approver', content: `Request rejected: ${req.body.reason}`, timestamp: r.updatedAt });
  addItsmAudit(req.body.approver || 'Approver', 'Request Rejected', r.id, 'request', `Rejected: ${req.body.reason}`);
  res.json({ success: true, message: `Request ${r.id} rejected`, data: r });
});

server.post('/api/itsm/requests/:id/fulfill', (req, res) => {
  const r = db.itsm_requests.find(r => r.id === req.params.id);
  if (!r) return res.status(404).json({ success: false, error: 'Request not found' });
  if (r.status !== 'In Progress') return res.status(400).json({ success: false, error: 'Request must be In Progress' });
  r.status = 'Fulfilled';
  r.fulfillmentDate = new Date().toISOString();
  r.updatedAt = r.fulfillmentDate;
  r.actualCost = req.body.actualCost || null;
  r.slaMet = new Date(r.fulfillmentDate) <= new Date(r.slaTarget);
  r.notes.push({ type: 'system', visibility: 'customer-visible', author: 'System', content: `Request fulfilled${req.body.notes ? ': ' + req.body.notes : ''}`, timestamp: r.updatedAt });
  addItsmAudit('api', 'Request Fulfilled', r.id, 'request', 'Fulfilled');
  res.json({ success: true, message: `Request ${r.id} fulfilled`, data: r });
});

server.post('/api/itsm/requests/:id/assign', (req, res) => {
  const r = db.itsm_requests.find(r => r.id === req.params.id);
  if (!r) return res.status(404).json({ success: false, error: 'Request not found' });
  if (req.body.assignmentGroup) r.assignmentGroup = req.body.assignmentGroup;
  if (req.body.assignee) { r.assignedTo = req.body.assignee; r.assigneeName = req.body.assigneeName || req.body.assignee; }
  r.updatedAt = new Date().toISOString();
  r.notes.push({ type: 'system', visibility: 'technicians-only', author: 'System', content: `Assigned to ${req.body.assigneeName || req.body.assignee || req.body.assignmentGroup}`, timestamp: r.updatedAt });
  res.json({ success: true, message: 'Assignment updated', data: r });
});

server.post('/api/itsm/requests/:id/notes', (req, res) => {
  const r = db.itsm_requests.find(r => r.id === req.params.id);
  if (!r) return res.status(404).json({ success: false, error: 'Request not found' });
  const { content, type, author } = req.body;
  if (!content) return res.status(400).json({ success: false, error: 'content is required' });
  const note = { type: type || 'internal', visibility: type === 'customer' ? 'customer-visible' : 'technicians-only', author: author || 'api', content, timestamp: new Date().toISOString() };
  r.notes.push(note);
  r.updatedAt = note.timestamp;
  res.status(201).json({ success: true, message: 'Note added', data: note });
});

server.get('/api/itsm/requests/stats', (req, res) => {
  const reqs = db.itsm_requests;
  const byStatus = {};
  const byCategory = {};
  reqs.forEach(r => { byStatus[r.status] = (byStatus[r.status] || 0) + 1; byCategory[r.category] = (byCategory[r.category] || 0) + 1; });
  res.json({
    success: true,
    data: {
      total: reqs.length,
      open: reqs.filter(r => !['Fulfilled', 'Closed', 'Cancelled', 'Rejected'].includes(r.status)).length,
      pendingApproval: reqs.filter(r => r.status === 'Pending Approval').length,
      byStatus, byCategory
    }
  });
});

server.get('/api/itsm/requests/pending-approval', (req, res) => {
  res.json({ success: true, data: db.itsm_requests.filter(r => r.status === 'Pending Approval') });
});

// ── Problems ──

server.post('/api/itsm/problems', (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ success: false, error: 'title is required' });
  const id = nextItsmId(db.itsm_problems, 'PRB');
  const now = new Date().toISOString();
  const problem = {
    id, title, description: description || '',
    status: 'Open', priority: req.body.priority || 'P3',
    category: req.body.category || 'General',
    rootCause: null, workaround: null,
    resolutionCode: null, resolutionNotes: null,
    linkedIncidents: req.body.linkedIncidents || [],
    affectedAssets: req.body.affectedAssets || [],
    assignedTo: req.body.assignedTo || 'Service Desk',
    assignee: req.body.assignee || null, assigneeName: req.body.assigneeName || null,
    createdAt: now, updatedAt: now, resolvedAt: null
  };
  db.itsm_problems.push(problem);
  // Back-link: add this problem to each linked incident's linkedProblems
  for (const incId of problem.linkedIncidents) {
    const inc = db.itsm_incidents.find(i => i.id === incId);
    if (inc && !inc.linkedProblems.includes(id)) inc.linkedProblems.push(id);
  }
  addItsmAudit('api', 'Problem Created', id, 'problem', `Created: ${title}`);
  res.status(201).json({ success: true, message: `Problem ${id} created`, data: problem });
});

server.patch('/api/itsm/problems/:id/status', (req, res) => {
  const p = db.itsm_problems.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ success: false, error: 'Problem not found' });
  const { status } = req.body;
  const valid = { 'Open': ['Under Investigation'], 'Under Investigation': ['Known Error', 'Resolved'], 'Known Error': ['Resolved'], 'Resolved': [] };
  if (valid[p.status] && !valid[p.status].includes(status)) {
    return res.status(400).json({ success: false, error: `Cannot transition from ${p.status} to ${status}` });
  }
  p.status = status;
  p.updatedAt = new Date().toISOString();
  if (status === 'Resolved') p.resolvedAt = p.updatedAt;
  addItsmAudit('api', 'Problem Updated', p.id, 'problem', `Status → ${status}`);
  res.json({ success: true, message: `Problem ${p.id} status updated`, data: p });
});

server.patch('/api/itsm/problems/:id/root-cause', (req, res) => {
  const p = db.itsm_problems.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ success: false, error: 'Problem not found' });
  if (!req.body.rootCause) return res.status(400).json({ success: false, error: 'rootCause is required' });
  p.rootCause = req.body.rootCause;
  if (req.body.workaround) p.workaround = req.body.workaround;
  p.updatedAt = new Date().toISOString();
  if (req.body.convertToKnownError && p.status === 'Under Investigation') p.status = 'Known Error';
  addItsmAudit('api', 'Root Cause Identified', p.id, 'problem', p.rootCause);
  res.json({ success: true, message: 'Root cause updated', data: p });
});

server.post('/api/itsm/problems/:id/link-incident', (req, res) => {
  const p = db.itsm_problems.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ success: false, error: 'Problem not found' });
  let ids = [];
  if (req.body.incidentIds) {
    if (Array.isArray(req.body.incidentIds)) {
      ids = req.body.incidentIds;
    } else if (typeof req.body.incidentIds === 'string') {
      ids = req.body.incidentIds.split(/[;,]\s*/).map(s => s.trim()).filter(Boolean);
    }
  } else if (req.body.incidentId) {
    if (typeof req.body.incidentId === 'string' && /[;,]/.test(req.body.incidentId)) {
      ids = req.body.incidentId.split(/[;,]\s*/).map(s => s.trim()).filter(Boolean);
    } else {
      ids = [req.body.incidentId];
    }
  }
  if (ids.length === 0) return res.status(400).json({ success: false, error: 'incidentId or incidentIds is required' });
  const linked = [];
  const notFound = [];
  for (const incId of ids) {
    if (!p.linkedIncidents.includes(incId)) p.linkedIncidents.push(incId);
    const inc = db.itsm_incidents.find(i => i.id === incId);
    if (inc) {
      if (!inc.linkedProblems.includes(p.id)) inc.linkedProblems.push(p.id);
      linked.push(incId);
    } else {
      linked.push(incId);
      notFound.push(incId);
    }
  }
  p.updatedAt = new Date().toISOString();
  addItsmAudit('api', 'Incidents Linked', p.id, 'problem', `Linked incidents: ${linked.join(', ')}`);
  const msg = notFound.length > 0
    ? `${linked.length} incident(s) linked to problem ${p.id}. Warning: ${notFound.join(', ')} not found in incidents database`
    : `${linked.length} incident(s) linked to problem ${p.id}`;
  res.json({ success: true, message: msg, linkedCount: linked.length, linked, notFound, data: p });
});

server.get('/api/itsm/problems/known-errors', (req, res) => {
  res.json({ success: true, data: db.itsm_problems.filter(p => p.status === 'Known Error') });
});

// ── Assets / CMDB ──

server.post('/api/itsm/assets', (req, res) => {
  const { name, type } = req.body;
  if (!name || !type) return res.status(400).json({ success: false, error: 'name and type are required' });
  const prefixes = { 'Server': 'SRV', 'Workstation': 'LAPTOP', 'Network': 'SW', 'Printer': 'PRNT', 'Mobile': 'MOB' };
  const prefix = prefixes[type] || 'ASSET';
  const id = nextItsmId(db.itsm_assets, prefix);
  const asset = {
    id, name, type, status: 'Active',
    owner: req.body.owner || null, ownerName: req.body.ownerName || null,
    location: req.body.location || null, os: req.body.os || null,
    manufacturer: req.body.manufacturer || null, model: req.body.model || null,
    serialNumber: req.body.serialNumber || null,
    purchaseDate: req.body.purchaseDate || new Date().toISOString().slice(0, 10),
    warrantyExpiry: req.body.warrantyExpiry || null,
    lastSeen: new Date().toISOString(), ipAddress: req.body.ipAddress || null,
    linkedIncidents: [], linkedChanges: []
  };
  db.itsm_assets.push(asset);
  addItsmAudit('api', 'Asset Created', id, 'asset', `Created: ${name} (${type})`);
  res.status(201).json({ success: true, message: `Asset ${id} created`, data: asset });
});

server.patch('/api/itsm/assets/:id/status', (req, res) => {
  const a = db.itsm_assets.find(a => a.id === req.params.id);
  if (!a) return res.status(404).json({ success: false, error: 'Asset not found' });
  const { status } = req.body;
  const validStatuses = ['Active', 'Warning', 'Error', 'Maintenance', 'Retired'];
  if (!validStatuses.includes(status)) return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  a.status = status;
  a.lastSeen = new Date().toISOString();
  addItsmAudit('api', 'Asset Updated', a.id, 'asset', `Status → ${status}`);
  res.json({ success: true, message: `Asset ${a.id} status updated`, data: a });
});

server.get('/api/itsm/assets/by-type/:type', (req, res) => {
  res.json({ success: true, data: db.itsm_assets.filter(a => a.type === req.params.type) });
});

server.get('/api/itsm/assets/:id/history', (req, res) => {
  res.json({ success: true, data: db.itsm_audit_log.filter(l => l.target === req.params.id) });
});

server.get('/api/itsm/assets/stats', (req, res) => {
  const assets = db.itsm_assets;
  const byType = {};
  const byStatus = {};
  assets.forEach(a => { byType[a.type] = (byType[a.type] || 0) + 1; byStatus[a.status] = (byStatus[a.status] || 0) + 1; });
  res.json({ success: true, data: { total: assets.length, byType, byStatus } });
});

// ── Knowledge Base ──

server.post('/api/itsm/knowledge', (req, res) => {
  const { title, content, category } = req.body;
  if (!title || !content) return res.status(400).json({ success: false, error: 'title and content are required' });
  const id = nextItsmId(db.itsm_knowledge, 'KB');
  const now = new Date().toISOString().slice(0, 10);
  const article = {
    id, title, content, category: category || 'General',
    status: 'Draft', author: req.body.author || 'api', authorName: req.body.authorName || 'API User',
    tags: req.body.tags || [], applicability: req.body.applicability || [],
    views: 0, helpful: 0, createdAt: now, updatedAt: now
  };
  db.itsm_knowledge.push(article);
  addItsmAudit('api', 'KB Article Created', id, 'kb', `Created: ${title}`);
  res.status(201).json({ success: true, message: `Article ${id} created`, data: article });
});

server.patch('/api/itsm/knowledge/:id/publish', (req, res) => {
  const kb = db.itsm_knowledge.find(k => k.id === req.params.id);
  if (!kb) return res.status(404).json({ success: false, error: 'Article not found' });
  kb.status = 'Published';
  kb.updatedAt = new Date().toISOString().slice(0, 10);
  addItsmAudit('api', 'KB Article Published', kb.id, 'kb', `Published: ${kb.title}`);
  res.json({ success: true, message: `Article ${kb.id} published`, data: kb });
});

server.patch('/api/itsm/knowledge/:id/archive', (req, res) => {
  const kb = db.itsm_knowledge.find(k => k.id === req.params.id);
  if (!kb) return res.status(404).json({ success: false, error: 'Article not found' });
  kb.status = 'Archived';
  kb.updatedAt = new Date().toISOString().slice(0, 10);
  res.json({ success: true, message: `Article ${kb.id} archived`, data: kb });
});

server.post('/api/itsm/knowledge/:id/helpful', (req, res) => {
  const kb = db.itsm_knowledge.find(k => k.id === req.params.id);
  if (!kb) return res.status(404).json({ success: false, error: 'Article not found' });
  kb.helpful = Math.min(100, (kb.helpful || 0) + 1);
  res.json({ success: true, data: { helpful: kb.helpful } });
});

server.post('/api/itsm/knowledge/:id/view', (req, res) => {
  const kb = db.itsm_knowledge.find(k => k.id === req.params.id);
  if (!kb) return res.status(404).json({ success: false, error: 'Article not found' });
  kb.views = (kb.views || 0) + 1;
  res.json({ success: true, data: { views: kb.views } });
});

server.get('/api/itsm/knowledge/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  if (!q) return res.json({ success: true, data: db.itsm_knowledge.filter(k => k.status === 'Published') });
  const results = db.itsm_knowledge.filter(k => k.status === 'Published' && (k.title.toLowerCase().includes(q) || k.content.toLowerCase().includes(q) || (k.tags || []).some(t => t.toLowerCase().includes(q))));
  res.json({ success: true, data: results });
});

// ── Runbooks ──

server.post('/api/itsm/runbooks', (req, res) => {
  const { title, steps } = req.body;
  if (!title || !steps || !Array.isArray(steps)) return res.status(400).json({ success: false, error: 'title and steps array are required' });
  const id = nextItsmId(db.itsm_runbooks, 'RB');
  const runbook = {
    id, title, description: req.body.description || '',
    category: req.body.category || 'General',
    author: req.body.author || 'api', authorName: req.body.authorName || 'API User',
    lastUpdated: new Date().toISOString().slice(0, 10),
    estimatedTime: req.body.estimatedTime || '15-30 min',
    steps: steps.map((s, i) => ({ id: i + 1, title: s.title || `Step ${i + 1}`, description: s.description || '', automatable: s.automatable || false }))
  };
  db.itsm_runbooks.push(runbook);
  addItsmAudit('api', 'Runbook Created', id, 'runbook', `Created: ${title}`);
  res.status(201).json({ success: true, message: `Runbook ${id} created`, data: runbook });
});

server.post('/api/itsm/runbooks/:id/execute', (req, res) => {
  const rb = db.itsm_runbooks.find(r => r.id === req.params.id);
  if (!rb) return res.status(404).json({ success: false, error: 'Runbook not found' });
  const execution = {
    id: faker.string.uuid(),
    runbookId: rb.id,
    startedAt: new Date().toISOString(),
    startedBy: req.body.startedBy || 'api',
    status: 'in_progress',
    completedSteps: [],
    totalSteps: rb.steps.length
  };
  addItsmAudit(req.body.startedBy || 'api', 'Runbook Executed', rb.id, 'runbook', `Started: ${rb.title}`);
  res.status(201).json({ success: true, message: `Runbook ${rb.id} execution started`, data: execution });
});

// ── Policies ──

server.get('/api/itsm/policies/by-category/:category', (req, res) => {
  res.json({ success: true, data: db.itsm_policies.filter(p => p.category === req.params.category) });
});

server.get('/api/itsm/policies/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  if (!q) return res.json({ success: true, data: db.itsm_policies });
  const results = db.itsm_policies.filter(p => p.title.toLowerCase().includes(q) || p.sections.some(s => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)));
  res.json({ success: true, data: results });
});

// ── Reports & Dashboard ──

server.get('/api/itsm/reports/incident-summary', (req, res) => {
  const incs = db.itsm_incidents;
  const byPriority = {};
  const byCategory = {};
  incs.forEach(i => { byPriority[i.priority] = (byPriority[i.priority] || 0) + 1; byCategory[i.category] = (byCategory[i.category] || 0) + 1; });
  res.json({
    success: true,
    data: {
      total: incs.length, open: incs.filter(i => !['Resolved', 'Closed'].includes(i.status)).length,
      resolved: incs.filter(i => i.status === 'Resolved' || i.status === 'Closed').length,
      byPriority, byCategory
    }
  });
});

server.get('/api/itsm/reports/sla-compliance', (req, res) => {
  const resolved = db.itsm_incidents.filter(i => i.resolvedAt);
  const met = resolved.filter(i => i.slaMet === true);
  const breached = resolved.filter(i => i.slaMet === false);
  res.json({
    success: true,
    data: {
      total: resolved.length, met: met.length, breached: breached.length,
      compliance: resolved.length > 0 ? Math.round((met.length / resolved.length) * 100) : 100,
      breachedTickets: breached.map(i => ({ id: i.id, title: i.title, priority: i.priority }))
    }
  });
});

server.get('/api/itsm/reports/team-performance', (req, res) => {
  const teams = {};
  db.itsm_incidents.forEach(i => {
    if (!teams[i.assignmentGroup]) teams[i.assignmentGroup] = { total: 0, open: 0, resolved: 0, p1: 0 };
    teams[i.assignmentGroup].total++;
    if (['Resolved', 'Closed'].includes(i.status)) teams[i.assignmentGroup].resolved++;
    else teams[i.assignmentGroup].open++;
    if (i.priority === 'P1') teams[i.assignmentGroup].p1++;
  });
  Object.keys(teams).forEach(t => { teams[t].resolutionRate = teams[t].total > 0 ? Math.round((teams[t].resolved / teams[t].total) * 100) : 0; });
  res.json({ success: true, data: teams });
});

server.get('/api/itsm/reports/change-success-rate', (req, res) => {
  const completed = db.itsm_changes.filter(c => c.status === 'Implemented' || c.status === 'Failed');
  const byType = {};
  db.itsm_changes.forEach(c => { byType[c.type] = (byType[c.type] || 0) + 1; });
  res.json({
    success: true,
    data: {
      total: db.itsm_changes.length, completed: completed.length,
      implemented: completed.filter(c => c.status === 'Implemented').length,
      failed: completed.filter(c => c.status === 'Failed').length,
      successRate: completed.length > 0 ? Math.round((completed.filter(c => c.status === 'Implemented').length / completed.length) * 100) : 100,
      byType
    }
  });
});

server.get('/api/itsm/reports/request-fulfillment', (req, res) => {
  const reqs = db.itsm_requests;
  const byCategory = {};
  reqs.forEach(r => { byCategory[r.category] = (byCategory[r.category] || 0) + 1; });
  res.json({
    success: true,
    data: {
      total: reqs.length,
      fulfilled: reqs.filter(r => r.status === 'Fulfilled' || r.status === 'Closed').length,
      pending: reqs.filter(r => r.status === 'Pending Approval').length,
      inProgress: reqs.filter(r => r.status === 'In Progress').length,
      byCategory
    }
  });
});

server.get('/api/itsm/dashboard/stats', (req, res) => {
  const incs = db.itsm_incidents;
  const chgs = db.itsm_changes;
  const reqs = db.itsm_requests;
  const prbs = db.itsm_problems;
  const assets = db.itsm_assets;

  // Compute per-priority breakdown
  const byPriority = {};
  incs.forEach(i => { byPriority[i.priority] = (byPriority[i.priority] || 0) + 1; });

  // Compute SLA compliance (% of resolved incidents that met SLA)
  const resolved = incs.filter(i => i.status === 'Resolved' || i.status === 'Closed');
  const slaMet = resolved.filter(i => i.slaTarget && i.resolvedAt && new Date(i.resolvedAt) <= new Date(i.slaTarget)).length;
  const slaCompliance = resolved.length > 0 ? Math.round((slaMet / resolved.length) * 100) : 100;

  // Compute average resolution time in hours
  const resolutionTimes = resolved.filter(i => i.createdAt && i.resolvedAt).map(i => (new Date(i.resolvedAt) - new Date(i.createdAt)) / 3600000);
  const avgResolutionTime = resolutionTimes.length > 0 ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length * 10) / 10 : 0;

  // Change success rate
  const implementedChanges = chgs.filter(c => c.status === 'Implemented' || c.status === 'Failed');
  const successfulChanges = chgs.filter(c => c.status === 'Implemented').length;
  const successRate = implementedChanges.length > 0 ? Math.round((successfulChanges / implementedChanges.length) * 100) : 100;

  res.json({
    success: true,
    data: {
      incidents: {
        open: incs.filter(i => !['Resolved', 'Closed'].includes(i.status)).length,
        p1: incs.filter(i => i.priority === 'P1' && !['Resolved', 'Closed'].includes(i.status)).length,
        total: incs.length,
        byPriority,
        slaCompliance,
        avgResolutionTime
      },
      changes: {
        pending: chgs.filter(c => c.status === 'Pending Approval').length,
        scheduled: chgs.filter(c => c.status === 'Scheduled').length,
        total: chgs.length,
        successRate
      },
      requests: {
        open: reqs.filter(r => !['Fulfilled', 'Closed', 'Cancelled', 'Rejected'].includes(r.status)).length,
        pendingApproval: reqs.filter(r => r.status === 'Pending Approval').length,
        total: reqs.length
      },
      problems: {
        open: prbs.filter(p => p.status !== 'Resolved').length,
        knownErrors: prbs.filter(p => p.status === 'Known Error').length,
        total: prbs.length
      },
      assets: {
        total: assets.length,
        active: assets.filter(a => a.status === 'Active').length,
        warning: assets.filter(a => a.status === 'Warning').length,
        error: assets.filter(a => a.status === 'Error').length
      }
    }
  });
});

// ── Audit Log ──

server.get('/api/itsm/audit-log/by-target/:targetId', (req, res) => {
  res.json({ success: true, data: db.itsm_audit_log.filter(l => l.target === req.params.targetId) });
});

server.get('/api/itsm/audit-log/by-actor/:actor', (req, res) => {
  res.json({ success: true, data: db.itsm_audit_log.filter(l => l.actor === req.params.actor) });
});

server.get('/api/itsm/audit-log/recent', (req, res) => {
  const sorted = [...db.itsm_audit_log].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json({ success: true, data: sorted.slice(0, 50) });
});

// ── Notifications ──

server.patch('/api/itsm/notifications/:id/read', (req, res) => {
  const n = db.itsm_notifications.find(n => n.id === req.params.id);
  if (!n) return res.status(404).json({ success: false, error: 'Notification not found' });
  n.read = true;
  res.json({ success: true, data: n });
});

server.post('/api/itsm/notifications/mark-all-read', (req, res) => {
  const recipient = req.body.recipientId;
  let count = 0;
  db.itsm_notifications.forEach(n => { if ((!recipient || n.recipientId === recipient) && !n.read) { n.read = true; count++; } });
  res.json({ success: true, message: `${count} notifications marked as read` });
});

server.get('/api/itsm/notifications/unread', (req, res) => {
  const unread = db.itsm_notifications.filter(n => !n.read);
  res.json({ success: true, data: unread, count: unread.length });
});

// ── ITSM Delete Operations ──

const itsmDeleteConfigs = [
  { path: 'incidents', key: 'itsm_incidents', type: 'incident', label: 'Incident' },
  { path: 'problems', key: 'itsm_problems', type: 'problem', label: 'Problem' },
  { path: 'changes', key: 'itsm_changes', type: 'change', label: 'Change' },
  { path: 'requests', key: 'itsm_requests', type: 'request', label: 'Request' },
  { path: 'assets', key: 'itsm_assets', type: 'asset', label: 'Asset' },
  { path: 'knowledge', key: 'itsm_knowledge', type: 'kb', label: 'KB Article' }
];

itsmDeleteConfigs.forEach(cfg => {
  server.delete(`/api/itsm/${cfg.path}/:id`, (req, res) => {
    const idx = db[cfg.key].findIndex(item => item.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, error: `${cfg.label} not found` });
    const removed = db[cfg.key].splice(idx, 1)[0];
    addItsmAudit('api', `${cfg.label} Deleted`, removed.id, cfg.type, `Deleted: ${removed.title || removed.name || removed.id}`);
    res.json({ success: true, message: `${cfg.label} ${removed.id} deleted`, data: removed });
  });
});

server.post('/api/itsm/bulk-delete', (req, res) => {
  const { collection, ids } = req.body;
  const cfgMap = {};
  itsmDeleteConfigs.forEach(c => { cfgMap[c.path] = c; });
  const cfg = cfgMap[collection];
  if (!cfg) return res.status(400).json({ success: false, error: `Invalid collection: ${collection}` });
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ success: false, error: 'ids must be a non-empty array' });

  const deleted = [];
  const notFound = [];
  ids.forEach(id => {
    const idx = db[cfg.key].findIndex(item => item.id === id);
    if (idx === -1) { notFound.push(id); return; }
    const removed = db[cfg.key].splice(idx, 1)[0];
    deleted.push(removed.id);
    addItsmAudit('api', `${cfg.label} Deleted`, removed.id, cfg.type, `Bulk deleted: ${removed.title || removed.name || removed.id}`);
  });

  res.json({ success: true, message: `Deleted ${deleted.length} ${collection}`, deleted, notFound });
});

// ── ITSM Data Reset ──

server.post('/api/itsm/reset', (req, res) => {
  const freshDb = generateDatabase();
  const itsmKeys = Object.keys(freshDb).filter(k => k.startsWith('itsm_'));
  itsmKeys.forEach(key => { db[key] = freshDb[key]; });
  // Refresh preserved catalog copy
  _fullItsmCatalog.length = 0;
  freshDb.itsm_catalog.forEach(item => _fullItsmCatalog.push(item));
  res.json({ success: true, message: `ITSM data reset. Regenerated ${itsmKeys.length} collections.`, collections: itsmKeys });
});

server.use(jsonServer.rewriter(rewrites));

server.use(router);

/* ---------- Start Server ---------- */
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎉 UiPath Workshop API is live!`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`📊 Collections: ${Object.keys(db).length}`);
  console.log(`🛣️  Routes: ${Object.keys(rewrites).length}`);
  console.log(`💾 Total Records: ${Object.values(db).reduce((total, collection) => 
    total + (Array.isArray(collection) ? collection.length : 1), 0)}`);
  console.log(`\n🚀 Ready for UiPath workshops!`);
});