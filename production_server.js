/* server.js - Production Ready for Railway/Vercel/Render */
const jsonServer = require('json-server');
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

// Use dynamic port for deployment platforms
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`🌍 Starting UiPath Workshop API in ${NODE_ENV} mode`);
console.log(`🚀 Port: ${PORT}`);

// Import data generator
let generateDb;
try {
  generateDb = require('./db.js');
  console.log('✅ Database generator loaded');
} catch (error) {
  console.error('❌ Failed to load database generator:', error.message);
  process.exit(1);
}

/* ---------- Generate Data ---------- */
console.log('🔄 Generating database...');
const db = generateDb();

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
  console.warn('⚠️ Could not load routes.json:', error.message);
}

/* ---------- Setup Server ---------- */
const server = jsonServer.create();
const router = jsonServer.router(db);

// Middleware configuration
const middlewares = jsonServer.defaults({
  static: path.join(__dirname, 'public'),
  noCors: false
});

// Enable CORS for all origins (essential for UiPath and web access)
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Request logging for debugging
server.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${req.method} ${req.url}`);
  next();
});

server.use(middlewares);

// Apply custom routes
if (Object.keys(rewrites).length > 0) {
  server.use(jsonServer.rewriter(rewrites));
}

/* ---------- Custom Endpoints ---------- */

// Health check endpoint
server.get('/health', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '1.0.0',
    api: {
      endpoints: Object.keys(rewrites).length,
      collections: Object.keys(db).length,
      totalRecords: Object.values(db).reduce((total, collection) => 
        total + (Array.isArray(collection) ? collection.length : 1), 0)
    },
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };
  
  res.json(healthStatus);
});

// API info endpoint
server.get('/api/info', (req, res) => {
  res.json({
    name: 'UiPath Workshop API',
    version: '1.0.0',
    description: 'Enterprise demo API for UiPath workshops',
    endpoints: Object.keys(rewrites).length,
    collections: Object.keys(db).map(key => ({
      name: key,
      count: Array.isArray(db[key]) ? db[key].length : 1
    })),
    scenarios: [
      'Employee Onboarding Dashboard',
      'Invoice Approval Automation', 
      'Customer Health Score Analysis',
      'IoT Maintenance Optimizer',
      'Sales Pipeline Intelligence'
    ],
    documentation: '/api/docs'
  });
});

// Dynamic telemetry endpoint for IoT devices
server.get('/api/iot/devices/:id/telemetry', (req, res) => {
  console.log(`📡 Generating telemetry for device: ${req.params.id}`);
  
  res.json({
    id: faker.string.uuid(),
    deviceId: req.params.id,
    timestamp: new Date().toISOString(),
    data: {
      temperature: faker.number.float({ min: 15, max: 35, precision: 0.1 }),
      humidity: faker.number.int({ min: 20, max: 80 }),
      pressure: faker.number.float({ min: 980, max: 1020, precision: 0.1 }),
      voltage: faker.number.float({ min: 3.1, max: 3.7, precision: 0.1 })
    },
    quality: faker.helpers.arrayElement(['excellent', 'good', 'fair']),
    batteryLevel: faker.number.int({ min: 10, max: 100 }),
    signalStrength: faker.number.int({ min: -90, max: -30 })
  });
});

// Root endpoint redirect
server.get('/', (req, res) => {
  if (fs.existsSync(path.join(__dirname, 'public', 'index.html'))) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.json({
      message: 'UiPath Workshop API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/health',
        api_info: '/api/info',
        workers: '/api/hr/workers',
        invoices: '/api/finance/invoices',
        customers: '/api/crm/customers',
        devices: '/api/iot/devices'
      },
      documentation: 'https://github.com/your-username/uipath-workshop-api'
    });
  }
});

/* ---------- Main Router ---------- */
server.use(router);

/* ---------- Error Handling ---------- */
server.use((error, req, res, next) => {
  console.error('💥 Server error:', error.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

/* ---------- Start Server ---------- */
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎉 UiPath Workshop API is live!`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 Collections: ${Object.keys(db).length}`);
  console.log(`🛣️  Routes: ${Object.keys(rewrites).length}`);
  console.log(`💾 Total Records: ${Object.values(db).reduce((total, collection) => 
    total + (Array.isArray(collection) ? collection.length : 1), 0)}`);
  console.log(`\n📋 Key Endpoints:`);
  console.log(`   Health: /health`);
  console.log(`   API Info: /api/info`);
  console.log(`   Workers: /api/hr/workers`);
  console.log(`   Invoices: /api/finance/invoices`);
  console.log(`   Customers: /api/crm/customers`);
  console.log(`   Devices: /api/iot/devices`);
  console.log(`\n🚀 Ready for UiPath workshops!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Server closed');
    process.exit(0);
  });
});