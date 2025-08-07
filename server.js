/* server.js  – CommonJS, Node ≥ 14 */

const jsonServer = require('json-server');
const { faker }  = require('@faker-js/faker');
const fs         = require('fs');
const generateDb = require('./enhanced_db_generator.js'); // Use the enhanced generator directly

/* ---------- load core data & rewrites ---------- */
const db       = generateDb(); // Generate fresh enhanced data
const rewrites = JSON.parse(fs.readFileSync('./enhanced_routes_complete.json', 'utf-8'));

console.log('Generated data collections:');
console.log('- HR Workers:', db.hr_workers?.length || 0);
console.log('- Finance Invoices:', db.finance_invoices?.length || 0);
console.log('- CRM Customers:', db.crm_customers?.length || 0);
console.log('- IoT Devices:', db.iot_devices?.length || 0);
console.log('- Projects:', db.projects?.length || 0);
console.log('- IoT Alerts:', db.iot_alerts?.length || 0);

/* ---------- json-server plumbing ---------- */
const server = jsonServer.create();
const router = jsonServer.router(db);
const middle = jsonServer.defaults();

server.use(middle);
server.use(jsonServer.rewriter(rewrites));

/* ---------- dynamic endpoint (random telemetry every call) ---------- */
server.get('/api/iot/devices/:id/telemetry', (req, res) => {
  res.json({
    id:        faker.string.uuid(),
    deviceId:  req.params.id,
    timestamp: new Date().toISOString(),
    data: {
      temperature: faker.number.float({ min: 15, max: 35, precision: 0.1 }),
      humidity:    faker.number.int({ min: 20, max: 80 })
    }
  });
});

/* ---------- everything else (CRUD) ---------- */
server.use(router);

server.listen(4000, () =>
  console.log('Mock API running on http://localhost:4000 with enhanced faker data')
);