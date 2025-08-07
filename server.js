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
  const departments = ['R&D', 'Sales', 'Marketing', 'Finance', 'Operations', 'HR'];
  
  const managers = Array.from({ length: 6 }, (_, i) => ({
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
    hr_orgs: [
      { id: 'org_RD', descriptor: 'R&D Division', headId: managers[0]?.id },
      { id: 'org_Sales', descriptor: 'Sales Division', headId: managers[1]?.id },
      { id: 'org_Marketing', descriptor: 'Marketing Division', headId: managers[2]?.id },
      { id: 'org_Finance', descriptor: 'Finance Division', headId: managers[3]?.id },
      { id: 'org_Operations', descriptor: 'Operations Division', headId: managers[4]?.id },
      { id: 'org_HR', descriptor: 'HR Division', headId: managers[5]?.id }
    ],
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
    hr_onboardings: workerIds.slice(0, 12).map(id => ({
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
    })),

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
    }))
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVER SETUP
// ═══════════════════════════════════════════════════════════════════════════

/* ---------- Generate Data ---------- */
const db = generateDatabase();

console.log('📊 Database generated successfully:');
Object.keys(db).forEach(key => {
  const count = Array.isArray(db[key]) ? db[key].length : 1;
  console.log(`   - ${key}: ${count} records`);
});

/* ---------- Load Routes ---------- */
let rewrites = {};
try {
  const routesPath = path.join(__dirname, 'routes.json');
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
server.use(jsonServer.rewriter(rewrites));

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