/* db.js  ─ Enhanced CommonJS data generator for UiPath workshop scenarios
   -------------------------------------------------------------------------
   Requires:  npm i -D @faker-js/faker
   Usage:     const db = require('./db.js')();
*/

const { faker } = require('@faker-js/faker');

// ── helpers ──────────────────────────────────────────────────────────────
const rand   = faker.helpers.arrayElement;
const uuid   = () => faker.string.uuid();
const amount = () => +faker.finance.amount({ min: 100, max: 5_000, dec: 2 });
const date   = (days = 30) => faker.date.recent({ days }).toISOString().slice(0, 10);
const futureDate = (days = 30) => faker.date.soon({ days }).toISOString().slice(0, 10);

// ── HR ───────────────────────────────────────────────────────────────────
function makeWorkers(count = 25) {
  const departments = ['R&D', 'Sales', 'Marketing', 'Finance', 'Operations', 'HR'];
  
  const mgrs = Array.from({ length: 6 }, (_, i) => ({
    id: uuid(),
    descriptor: faker.person.fullName(),
    primaryWorkEmail: faker.internet.email(),
    isActive: true,
    managerId: null,
    department: departments[i],
    supervisoryOrgId: `org_${departments[i].replace('&', '')}`,
    primaryJob: { 
      title: `${departments[i]} Manager`, 
      department: departments[i],
      level: 'Manager',
      salary: faker.number.int({ min: 80000, max: 120000 })
    },
    startDate: faker.date.past({ years: 3 }).toISOString().slice(0, 10),
    location: rand(['New York', 'San Francisco', 'Austin', 'Remote'])
  }));

  const ics = Array.from({ length: count }, () => {
    const dept = rand(departments);
    const manager = mgrs.find(m => m.department === dept);
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

  return [...mgrs, ...ics];
}

function makeOnboardings(workerIds) {
  return workerIds.slice(0, 8).map(id => ({
    id: uuid(),
    workerId: id,
    status: rand(['in_progress', 'completed', 'pending']),
    startDate: faker.date.recent({ days: 30 }).toISOString().slice(0, 10),
    expectedCompletionDate: futureDate(14),
    completedTasks: faker.number.int({ min: 0, max: 10 }),
    totalTasks: 10,
    assignedBuddy: rand(workerIds),
    equipmentAssigned: faker.datatype.boolean(),
    accessGranted: faker.datatype.boolean()
  }));
}

function makePerformance(workerIds) {
  return workerIds.map(id => ({
    id: uuid(),
    workerId: id,
    period: '2025-Q2',
    rating: rand(['Exceeds', 'Meets', 'Below', 'Outstanding']),
    score: faker.number.float({ min: 2.5, max: 5, precision: 0.1 }),
    goals: faker.number.int({ min: 3, max: 8 }),
    goalsCompleted: faker.number.int({ min: 1, max: 6 }),
    reviewDate: date(60),
    nextReviewDate: futureDate(90)
  }));
}

// ── Finance ──────────────────────────────────────────────────────────────
function makeInvoices(count = 35) {
  return Array.from({ length: count }, () => {
    const amount = faker.number.float({ min: 500, max: 15000, precision: 0.01 });
    const dueDate = faker.date.soon({ days: 60 }).toISOString().slice(0, 10);
    const isOverdue = faker.datatype.boolean({ probability: 0.2 });
    
    return {
      id: `INV-${faker.number.int({ min: 80000, max: 99999 })}`,
      vendorName: faker.company.name(),
      amount: amount,
      currency: 'USD',
      status: rand(['pending', 'approved', 'paid', 'rejected', 'overdue']),
      dueDate: isOverdue ? faker.date.past({ days: 30 }).toISOString().slice(0, 10) : dueDate,
      approvalLimit: amount > 5000 ? 'manager' : 'auto',
      category: rand(['Software', 'Office Supplies', 'Travel', 'Consulting', 'Utilities']),
      submittedDate: faker.date.past({ days: 45 }).toISOString().slice(0, 10)
    };
  });
}

function makeExpenses(count = 40, workerIds) {
  return Array.from({ length: count }, () => ({
    id: `EXP-${faker.number.int({ min: 70000, max: 79999 })}`,
    workerId: rand(workerIds),
    description: rand(['Business Travel', 'Client Dinner', 'Office Supplies', 'Training Course', 'Conference']),
    amount: faker.number.float({ min: 25, max: 2500, precision: 0.01 }),
    currency: 'USD',
    status: rand(['submitted', 'approved', 'reimbursed', 'rejected']),
    submitDate: date(30),
    category: rand(['Travel', 'Meals', 'Supplies', 'Training', 'Other']),
    receipt: faker.datatype.boolean({ probability: 0.8 })
  }));
}

function makeBudgetVariance() {
  const departments = ['R&D', 'Sales', 'Marketing', 'Finance', 'Operations', 'HR'];
  return departments.map(dept => ({
    id: uuid(),
    department: dept,
    budgeted: faker.number.int({ min: 50000, max: 500000 }),
    actual: faker.number.int({ min: 45000, max: 520000 }),
    variance: faker.number.float({ min: -20, max: 15, precision: 0.1 }),
    period: '2025-Q2'
  }));
}

// ── CRM ──────────────────────────────────────────────────────────────────
function makeCustomers(count = 20) {
  return Array.from({ length: count }, () => ({
    id: `CUST-${faker.number.int({ min: 10000, max: 99999 })}`,
    companyName: faker.company.name(),
    status: rand(['active', 'prospect', 'churned', 'at_risk']),
    tier: rand(['Enterprise', 'Mid-Market', 'SMB']),
    industry: rand(['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail']),
    contractValue: faker.number.int({ min: 10000, max: 500000 }),
    renewalDate: futureDate(365),
    lastContact: date(90),
    healthScore: faker.number.int({ min: 1, max: 100 }),
    primaryContact: faker.person.fullName(),
    contactEmail: faker.internet.email()
  }));
}

function makeOpportunities(customers) {
  return customers.slice(0, 12).map(c => ({
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
}

function makeSupportTickets(customers) {
  return customers.slice(0, 15).map(c => ({
    id: `TICK-${faker.number.int({ min: 5000, max: 5999 })}`,
    customerId: c.id,
    subject: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    status: rand(['open', 'pending', 'resolved', 'closed']),
    priority: rand(['low', 'medium', 'high', 'urgent']),
    category: rand(['Technical', 'Billing', 'Feature Request', 'Bug Report']),
    createdDate: date(60),
    resolvedDate: faker.datatype.boolean({ probability: 0.6 }) ? date(30) : null,
    assignedAgent: faker.person.fullName()
  }));
}

function makeRenewals(customers) {
  return customers.filter(c => c.status === 'active').map(c => ({
    id: uuid(),
    customerId: c.id,
    contractType: rand(['Annual', 'Multi-year', 'Month-to-month']),
    currentValue: c.contractValue,
    renewalDate: c.renewalDate,
    renewalRisk: rand(['Low', 'Medium', 'High']),
    contactAttempts: faker.number.int({ min: 0, max: 5 }),
    lastContactDate: date(30)
  }));
}

// ── IoT ──────────────────────────────────────────────────────────────────
function makeDevices(count = 25) {
  return Array.from({ length: count }, () => ({
    id: `DEV-${faker.number.int({ min: 555000, max: 555999 })}`,
    name: faker.commerce.productName(),
    type: rand(['temperatureSensor', 'doorSensor', 'camera', 'motionDetector', 'smokeDetector']),
    status: rand(['online', 'offline', 'maintenance']),
    battery: faker.number.int({ min: 5, max: 100 }),
    location: rand(['Building A', 'Building B', 'Warehouse', 'Parking Lot']),
    assignedTo: faker.person.fullName(),
    lastMaintenance: date(90),
    nextMaintenance: futureDate(30),
    installDate: faker.date.past({ years: 2 }).toISOString().slice(0, 10)
  }));
}

function makeIoTAlerts(devices) {
  return devices.slice(0, 8).map(d => ({
    id: uuid(),
    deviceId: d.id,
    alertType: rand(['battery_low', 'offline', 'anomaly', 'maintenance_due']),
    severity: rand(['low', 'medium', 'high', 'critical']),
    message: faker.lorem.sentence(),
    timestamp: faker.date.recent({ days: 7 }).toISOString(),
    acknowledged: faker.datatype.boolean({ probability: 0.7 }),
    resolvedDate: faker.datatype.boolean({ probability: 0.5 }) ? date(5) : null
  }));
}

function makeMaintenanceSchedule(devices) {
  return devices.map(d => ({
    id: uuid(),
    deviceId: d.id,
    scheduledDate: d.nextMaintenance,
    type: rand(['Routine', 'Repair', 'Calibration', 'Replacement']),
    status: rand(['scheduled', 'in_progress', 'completed', 'overdue']),
    technician: faker.person.fullName(),
    estimatedCost: faker.number.int({ min: 50, max: 500 }),
    notes: faker.lorem.sentence()
  }));
}

function makeTelemetry(devices, samplesEach = 6) {
  return devices.flatMap(d =>
    Array.from({ length: samplesEach }, () => ({
      id: uuid(),
      deviceId: d.id,
      timestamp: faker.date.recent({ days: 7 }).toISOString(),
      data: {
        temperature: faker.number.float({ min: 15, max: 35, precision: 0.1 }),
        humidity: faker.number.int({ min: 20, max: 80 }),
        ...(d.type === 'doorSensor' && { 
          isOpen: faker.datatype.boolean(),
          accessCard: faker.string.alphanumeric(8)
        }),
        ...(d.type === 'camera' && {
          motionDetected: faker.datatype.boolean(),
          recordingActive: faker.datatype.boolean()
        })
      },
      quality: rand(['good', 'fair', 'poor']),
      batteryLevel: faker.number.int({ min: 10, max: 100 })
    }))
  );
}

// ── Projects & Cross-Module ─────────────────────────────────────────────
function makeProjects(customers, workers) {
  return customers.slice(0, 8).map(c => ({
    id: `PROJ-${faker.number.int({ min: 1000, max: 1999 })}`,
    name: `${rand(['Implementation', 'Migration', 'Upgrade', 'Integration'])} - ${c.companyName}`,
    customerId: c.id,
    status: rand(['planning', 'active', 'on_hold', 'completed']),
    startDate: faker.date.past({ years: 1 }).toISOString().slice(0, 10),
    endDate: futureDate(120),
    budget: faker.number.int({ min: 25000, max: 200000 }),
    actualCost: faker.number.int({ min: 20000, max: 180000 }),
    projectManager: rand(workers.filter(w => w.primaryJob.title.includes('Manager'))).id,
    riskLevel: rand(['Low', 'Medium', 'High'])
  }));
}

function makeProjectResources(projects, workers) {
  return projects.flatMap(p => 
    faker.helpers.arrayElements(workers, { min: 2, max: 6 }).map(w => ({
      id: uuid(),
      projectId: p.id,
      workerId: w.id,
      role: rand(['Developer', 'Analyst', 'QA', 'Designer', 'Architect']),
      allocation: faker.number.int({ min: 25, max: 100 }), // percentage
      startDate: p.startDate,
      endDate: p.endDate
    }))
  );
}

// ── Reporting & Analytics ───────────────────────────────────────────────
function makeFinancialSummaries() {
  const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'];
  return months.map(month => ({
    id: uuid(),
    period: month,
    revenue: faker.number.int({ min: 800000, max: 1200000 }),
    expenses: faker.number.int({ min: 600000, max: 900000 }),
    profit: faker.number.int({ min: 100000, max: 400000 }),
    invoicesPaid: faker.number.int({ min: 45, max: 65 }),
    invoicesPending: faker.number.int({ min: 5, max: 15 }),
    expensesApproved: faker.number.int({ min: 150, max: 200 })
  }));
}

function makeSalesPipelineReports() {
  const stages = ['Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  return stages.map(stage => ({
    id: uuid(),
    stage: stage,
    count: faker.number.int({ min: 5, max: 25 }),
    totalValue: faker.number.int({ min: 50000, max: 500000 }),
    avgDealSize: faker.number.int({ min: 15000, max: 75000 }),
    avgTimeInStage: faker.number.int({ min: 10, max: 45 }) // days
  }));
}

function makeEmployeeReports(workers) {
  const departments = ['R&D', 'Sales', 'Marketing', 'Finance', 'Operations', 'HR'];
  return departments.map(dept => {
    const deptWorkers = workers.filter(w => w.department === dept);
    return {
      id: uuid(),
      department: dept,
      headcount: deptWorkers.length,
      activeEmployees: deptWorkers.filter(w => w.isActive).length,
      avgTenure: faker.number.float({ min: 1.2, max: 4.5, precision: 0.1 }),
      avgSalary: faker.number.int({ min: 55000, max: 85000 }),
      turnoverRate: faker.number.float({ min: 5, max: 15, precision: 0.1 })
    };
  });
}

// ── Notifications & Workflows ───────────────────────────────────────────
function makeNotifications(workers) {
  return Array.from({ length: 20 }, () => ({
    id: uuid(),
    recipientId: rand(workers).id,
    type: rand(['approval_required', 'deadline_reminder', 'system_alert', 'task_assigned']),
    title: faker.lorem.words(4),
    message: faker.lorem.sentence(),
    priority: rand(['low', 'medium', 'high']),
    isRead: faker.datatype.boolean({ probability: 0.6 }),
    createdDate: faker.date.recent({ days: 14 }).toISOString(),
    actionRequired: faker.datatype.boolean({ probability: 0.4 })
  }));
}

function makeWorkflowTriggers() {
  return Array.from({ length: 10 }, () => ({
    id: uuid(),
    workflowName: rand(['Invoice Approval', 'Employee Onboarding', 'Expense Processing', 'Customer Renewal']),
    triggerType: rand(['manual', 'scheduled', 'event-driven']),
    status: rand(['active', 'paused', 'error']),
    lastRun: faker.date.recent({ days: 7 }).toISOString(),
    nextRun: futureDate(7),
    successRate: faker.number.float({ min: 85, max: 99, precision: 0.1 }),
    avgExecutionTime: faker.number.int({ min: 30, max: 300 }) // seconds
  }));
}

// ── Vendor Management ───────────────────────────────────────────────────
function makeVendorPerformance(invoices) {
  const vendors = [...new Set(invoices.map(i => i.vendorName))];
  return vendors.map(vendor => {
    const vendorInvoices = invoices.filter(i => i.vendorName === vendor);
    return {
      id: uuid(),
      vendorName: vendor,
      totalInvoices: vendorInvoices.length,
      totalValue: vendorInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      onTimePayments: faker.number.int({ min: 80, max: 100 }),
      qualityRating: faker.number.float({ min: 3.5, max: 5, precision: 0.1 }),
      riskScore: rand(['Low', 'Medium', 'High']),
      contractRenewalDate: futureDate(180),
      lastAuditDate: date(120)
    };
  });
}

// ── MAIN EXPORT ──────────────────────────────────────────────────────────
module.exports = () => {
  /* Core entities */
  const hr_workers = makeWorkers(35);
  const workerIds = hr_workers.map(w => w.id);
  
  const finance_invoices = makeInvoices(50);
  const finance_expenses = makeExpenses(60, workerIds);
  
  const crm_customers = makeCustomers(25);
  const crm_opportunities = makeOpportunities(crm_customers);
  const crm_orders = makeOrders(crm_customers);
  
  const iot_devices = makeDevices(30);
  const iot_telemetry = makeTelemetry(iot_devices);
  
  /* Extended collections */
  const projects = makeProjects(crm_customers, hr_workers);

  return {
    // ═══ HR ═══
    hr_workers,
    hr_orgs: [
      { id: 'org_RD', descriptor: 'R&D Division', headId: hr_workers.find(w => w.department === 'R&D')?.id },
      { id: 'org_Sales', descriptor: 'Sales Division', headId: hr_workers.find(w => w.department === 'Sales')?.id },
      { id: 'org_Marketing', descriptor: 'Marketing Division', headId: hr_workers.find(w => w.department === 'Marketing')?.id },
      { id: 'org_Finance', descriptor: 'Finance Division', headId: hr_workers.find(w => w.department === 'Finance')?.id },
      { id: 'org_Operations', descriptor: 'Operations Division', headId: hr_workers.find(w => w.department === 'Operations')?.id },
      { id: 'org_HR', descriptor: 'HR Division', headId: hr_workers.find(w => w.department === 'HR')?.id }
    ],
    hr_worker_performance: makePerformance(workerIds),
    hr_onboardings: makeOnboardings(workerIds),

    // ═══ Finance ═══
    finance_invoices,
    finance_expenses,
    budget_variance: makeBudgetVariance(),
    financial_summaries: makeFinancialSummaries(),
    vendor_performance: makeVendorPerformance(finance_invoices),

    // ═══ CRM ═══
    crm_customers,
    crm_opportunities,
    crm_orders,
    crm_support_tickets: makeSupportTickets(crm_customers),
    crm_renewals: makeRenewals(crm_customers),
    sales_pipeline_reports: makeSalesPipelineReports(),

    // ═══ IoT ═══
    iot_devices,
    iot_telemetry,
    iot_alerts: makeIoTAlerts(iot_devices),
    iot_maintenance: makeMaintenanceSchedule(iot_devices),

    // ═══ Projects ═══
    projects,
    project_resources: makeProjectResources(projects, hr_workers),

    // ═══ Reporting & Integration ═══
    integration_employee_reports: makeEmployeeReports(hr_workers),
    notifications: makeNotifications(hr_workers),
    workflow_triggers: makeWorkflowTriggers(),

    // ═══ Analytics ═══
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
    }))
  };
};

// Helper function for orders (referenced above)
function makeOrders(customers) {
  return customers.slice(0, 12).map(c => ({
    id: `ORD-${faker.number.int({ min: 5000, max: 5999 })}`,
    customerId: c.id,
    total: faker.number.int({ min: 5000, max: 50000 }),
    currency: 'USD',
    status: rand(['fulfilled', 'processing', 'cancelled', 'shipped']),
    orderDate: faker.date.past({ years: 1 }).toISOString().slice(0, 10),
    deliveryDate: futureDate(14),
    items: faker.number.int({ min: 1, max: 8 })
  }));
}