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
          lastUpdated: new Date().toISOString(),
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
      lastUpdated: new Date().toISOString(),
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

    // Generate employee ID based on current count
    const newEmployeeId = `WRK-${String(db.hr_onboardings.length + index + 1).padStart(3, '0')}`;

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