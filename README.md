# UiPath Workshop API

> **Modern API platform for UiPath automation workshops**
> Built with real-world enterprise integration patterns and business scenarios

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Available-FA4616?style=for-the-badge)](https://uipath-workshop-api-production.up.railway.app/)
[![API Endpoints](https://img.shields.io/badge/📡_API_Endpoints-87-0ba2b3?style=for-the-badge)](https://uipath-workshop-api-production.up.railway.app/api-documentation.html)
[![Collections](https://img.shields.io/badge/📊_Data_Collections-26-172125?style=for-the-badge)](#features)
[![Deploy on Railway](https://img.shields.io/badge/🚀_Deploy-Railway-8B5CF6?style=for-the-badge)](https://railway.app/template/ZweBXA)

---

## Features

### Core Capabilities

- **87 Production-Ready Endpoints** across 5 business modules (HR, Finance, CRM, IoT, Analytics)
- **26 Data Collections** with 700+ realistic business records
- **Dynamic Data Generation** for real-time scenarios and testing
- **Zero Authentication** required for simplified workshop experience
- **Interactive UI** with modern Origin design patterns
- **Live Data Viewer** for exploring API responses
- **Real-time HR Onboarding Tracker** demonstrating practical use cases

### Business Modules

| Module | Endpoints | Description | Key Use Cases |
|--------|-----------|-------------|---------------|
| **👥 HR Management** | 23 | Employee records, performance, onboarding | Employee directory, performance tracking, onboarding automation |
| **💰 Finance** | 19 | Invoices, expenses, budget tracking | Invoice approval workflows, expense automation, budget variance alerts |
| **🤝 CRM** | 20 | Customer management, sales pipeline | Customer health scoring, churn prevention, opportunity tracking |
| **🔌 IoT** | 18 | Device management, telemetry, alerts | Predictive maintenance, device monitoring, alert automation |
| **📊 Analytics** | 7 | Reports, KPIs, workflow monitoring | Executive dashboards, workforce analytics, automation health |

---

## Quick Start

### Option 1: Use Our Live Instance

The fastest way to start building automations:

```
https://uipath-workshop-api-production.up.railway.app/
```

**Base API URL:**
```
https://uipath-workshop-api-production.up.railway.app/api
```

### Option 2: Deploy Your Own Instance

#### Deploy on Railway (Recommended)

1. Click the **Deploy on Railway** badge above
2. Your API will be live in ~2 minutes
3. Access at `https://your-app-name.railway.app`

#### Local Development

```bash
# Clone the repository
git clone https://github.com/robertdima/uipath-workshop-api.git
cd uipath-workshop-api

# Install dependencies
npm install

# Start the development server
npm start

# Access at http://localhost:4000
```

#### Deploy on Render

1. Fork this repository to your GitHub account
2. Go to [Render Dashboard](https://render.com)
3. Click **New** > **Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Click **Deploy**

---

## API Documentation

### Base URLs

| Environment | URL |
|-------------|-----|
| **Production** | `https://uipath-workshop-api-production.up.railway.app/api` |
| **Local** | `http://localhost:4000/api` |
| **Documentation** | `/api-documentation.html` |

### HR Management Module

#### Core Endpoints

| Endpoint | Method | Description | Workshop Use Case |
|----------|---------|-------------|-------------------|
| `/hr/workers` | `GET` | All employees | Build an employee directory bot |
| `/hr/workers/:id` | `GET` | Employee details | Retrieve specific employee info |
| `/hr/workers/active` | `GET` | Active employees* | Practice UiPath filtering |
| `/hr/workers/:id/directReports` | `GET` | Direct reports* | Build org chart automation |
| `/hr/performance` | `GET` | Performance reviews | Create performance dashboard |
| `/hr/performance/:id` | `GET` | Individual review | Get employee performance data |
| `/hr/onboarding` | `GET` | Onboarding records | Track new employee progress |
| `/hr/onboarding/pending` | `GET` | Pending onboardings* | Identify bottlenecks |

**\* Requires UiPath filtering** - These endpoints return all data; filter in your workflow using DataTable activities or LINQ

#### Example: Get All Employees

```http
GET /api/hr/workers
```

**Response:**
```json
[
  {
    "id": "b5f3d421-8c9a-4e2b-a1d3-7f8e9c4b2a6d",
    "descriptor": "Sarah Johnson",
    "primaryWorkEmail": "sarah.johnson@company.com",
    "isActive": true,
    "department": "R&D",
    "primaryJob": {
      "title": "Senior Engineer",
      "level": "Senior",
      "salary": 95000
    },
    "managerId": "a2c4e6f8-1b3d-5a7c-9e2f-4d6b8c1a3e5f",
    "location": "San Francisco"
  }
]
```

### Finance Module

| Endpoint | Method | Description | Workshop Use Case |
|----------|---------|-------------|-------------------|
| `/finance/invoices` | `GET` | All invoices | Invoice processing automation |
| `/finance/invoices/:id` | `GET` | Invoice details | Retrieve specific invoice |
| `/finance/invoices/pending` | `GET` | Pending approval* | Build approval queue |
| `/finance/invoices/:id/approve` | `PATCH` | Approve invoice | Implement approval workflow |
| `/finance/expenses` | `GET` | Expense reports | Expense automation |
| `/finance/expenses/pending` | `GET` | Pending expenses* | Approval routing |
| `/finance/budget/variance` | `GET` | Budget analysis | Financial alerts |
| `/finance/vendors/performance` | `GET` | Vendor metrics | Risk assessment |

#### Example: Approve Invoice

```http
PATCH /api/finance/invoices/INV-84521/approve
Content-Type: application/json

{
  "status": "approved",
  "approvedBy": "manager-id",
  "approvalNotes": "Verified against PO-12345"
}
```

### CRM Module

| Endpoint | Method | Description | Workshop Use Case |
|----------|---------|-------------|-------------------|
| `/crm/customers` | `GET` | All customers | Customer 360 view |
| `/crm/customers/:id` | `GET` | Customer details | Account information |
| `/crm/customers/atrisk` | `GET` | At-risk accounts* | Churn prevention workflow |
| `/crm/opportunities` | `GET` | Sales pipeline | Deal prioritization |
| `/crm/opportunities/closing` | `GET` | Deals closing soon* | Sales acceleration |
| `/crm/support/tickets` | `GET` | Support tickets | Ticket routing automation |
| `/crm/support/tickets/critical` | `GET` | Critical tickets* | Escalation workflow |
| `/crm/renewals/upcoming` | `GET` | Renewal alerts* | Contract renewal automation |

### IoT Module

| Endpoint | Method | Description | Workshop Use Case |
|----------|---------|-------------|-------------------|
| `/iot/devices` | `GET` | All devices | Device inventory management |
| `/iot/devices/:id` | `GET` | Device details | Specific device info |
| `/iot/devices/offline` | `GET` | Offline devices* | Alert generation |
| `/iot/devices/:id/telemetry` | `GET` | Real-time data | Monitor device health |
| `/iot/alerts` | `GET` | All alerts | Alert management |
| `/iot/alerts/critical` | `GET` | Critical alerts* | Incident response |
| `/iot/maintenance/overdue` | `GET` | Overdue maintenance* | Preventive maintenance |
| `/iot/maintenance/:id/complete` | `PATCH` | Complete maintenance | Update maintenance status |

### Analytics Module

| Endpoint | Method | Description | Workshop Use Case |
|----------|---------|-------------|-------------------|
| `/reports/financial/monthly` | `GET` | Financial summary | Executive dashboard |
| `/reports/employee/summary` | `GET` | HR analytics | Workforce planning |
| `/analytics/customer/relationships` | `GET` | Customer metrics | Success scoring |
| `/analytics/sales/pipeline` | `GET` | Pipeline analysis | Sales forecasting |
| `/workflows/triggers` | `GET` | Automation health | Process monitoring |

---

## Workshop Scenarios

### Scenario 1: Employee Onboarding Dashboard

**Objective:** Build an intelligent onboarding tracker that identifies at-risk new hires

**Endpoints:**
1. `/hr/onboarding` - Get onboarding records
2. `/hr/workers/:id` - Enrich with employee details
3. `/hr/performance` - Add performance context

**UiPath Implementation:**
```
1. Create API Workflow in Studio Web
2. GET /hr/onboarding to retrieve all records
3. For Each onboarding record:
   - GET /hr/workers/:id for employee details
   - Calculate progress percentage (completedTasks / totalTasks)
   - Identify risk factors:
     - Progress < 50% after 7+ days
     - Equipment not assigned
     - Access not granted
4. Generate dashboard with recommendations
5. Send alerts for at-risk employees
```

**Expected Outcome:**
- List of at-risk onboardings with specific action items
- Progress metrics showing completion percentages
- Bottleneck identification (equipment, access, tasks)
- Automated alerts sent to HR managers

---

### Scenario 2: Invoice Approval Automation

**Objective:** Implement intelligent invoice routing based on amount and vendor risk

**Endpoints:**
1. `/finance/invoices` - Get pending invoices
2. `/finance/vendors/performance` - Check vendor risk score
3. `/finance/invoices/:id/approve` - Approve invoices

**Business Rules:**
```javascript
IF amount < $5,000 AND vendorRisk === 'low':
    Auto-approve
ELSE IF amount >= $5,000 AND amount < $25,000:
    Route to manager
ELSE IF amount >= $25,000:
    Route to C-level
IF vendorRisk === 'high':
    Always require manual review
```

**UiPath Implementation:**
```
1. GET /finance/invoices (filter status = 'pending')
2. For Each invoice:
   - GET vendor performance data
   - Calculate vendor risk score
   - Apply business rules
   - If auto-approve:
     - PATCH /finance/invoices/:id/approve
     - Send confirmation email
   - If manual review:
     - Send to approval queue
     - Notify approver
3. Log all approvals
4. Generate approval summary report
```

---

### Scenario 3: Customer Health Monitoring

**Objective:** Calculate customer health scores and prevent churn

**Endpoints:**
1. `/crm/customers` - Get customer base
2. `/crm/support/tickets` - Check support issues
3. `/analytics/customer/relationships` - Get engagement metrics
4. `/crm/renewals` - Check renewal risk

**Health Score Formula:**
```javascript
baseScore = 75
healthScore = baseScore
  - (openTickets * 8)
  - (criticalTickets * 15)
  - (daysSinceLastContact / 2)
  - (renewalRisk === 'High' ? 25 : 0)
  + (engagementScore * 5)
  + (npsScore * 2)

IF healthScore < 40:
    status = 'critical'
ELSE IF healthScore < 60:
    status = 'at_risk'
ELSE IF healthScore < 80:
    status = 'healthy'
ELSE:
    status = 'excellent'
```

**UiPath Implementation:**
```
1. GET /crm/customers
2. For Each customer:
   - GET support tickets
   - GET engagement metrics
   - GET renewal information
   - Calculate health score
   - Determine risk level
3. Filter customers with score < 60
4. Create intervention tasks:
   - Critical (<40): Executive outreach
   - At-risk (40-60): CSM engagement
5. Send daily health report to leadership
```

---

## Integration Patterns

### Pattern 1: Data Enrichment

Combine multiple endpoints to create comprehensive views:

```
GET /hr/workers           → Basic employee data
↓
GET /hr/performance       → Add performance metrics
↓
GET /hr/onboarding        → Add onboarding progress
↓
Result: Complete employee profile with performance and onboarding status
```

### Pattern 2: Client-Side Filtering

For endpoints marked **"Requires UiPath Filtering"**:

**In UiPath Studio:**
```vb
' Filter Data Table Activity
DataTable.Select("[status] = 'pending' AND [amount] > 5000")

' Or use LINQ
From row In DataTable
Where row("status").ToString = "pending"
  And CDbl(row("amount")) > 5000
Select row
```

### Pattern 3: Approval Workflows

```
1. GET /finance/invoices (status = 'pending')
2. Apply business rules (amount, vendor risk, category)
3. Route based on rules:
   - Auto-approve: PATCH /invoices/:id/approve
   - Manual review: Send to approval queue
4. Send notifications (email, Teams, Slack)
5. Log all actions for audit trail
```

### Pattern 4: Real-Time Monitoring

```
1. Schedule workflow to run every 15 minutes
2. GET /iot/devices
3. Filter devices with:
   - Battery < 20%
   - Status = 'offline'
   - Next maintenance overdue
4. For critical issues:
   - Create maintenance tickets
   - Send alerts
   - Update device status
5. Generate health dashboard
```

---

## Workshop Success Metrics

Track your automation performance:

| Metric | Target | Description |
|--------|--------|-------------|
| **Response Time** | < 500ms | Average API response time per endpoint |
| **Error Rate** | < 1% | Percentage of failed requests |
| **Data Quality** | 100% | All records have complete, realistic data |
| **Uptime** | 99.9% | API availability percentage |
| **Throughput** | 1000+ req/min | Concurrent request handling capacity |

---

## Technical Details

### Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** JSON Server (lowdb)
- **Data Generation:** Faker.js
- **CORS:** Enabled for all origins
- **Response Format:** JSON

### Data Structure Examples

#### Employee Object
```json
{
  "id": "uuid-here",
  "descriptor": "John Smith",
  "primaryWorkEmail": "john.smith@company.com",
  "isActive": true,
  "department": "R&D",
  "primaryJob": {
    "title": "Senior Engineer",
    "level": "Senior",
    "salary": 95000
  },
  "managerId": "manager-uuid",
  "location": "San Francisco",
  "startDate": "2023-03-15"
}
```

#### Invoice Object
```json
{
  "id": "INV-84521",
  "vendorName": "Tech Solutions Inc",
  "amount": 12500.00,
  "status": "pending",
  "dueDate": "2025-09-15",
  "category": "Software",
  "submittedBy": "employee-id",
  "submittedDate": "2025-08-15"
}
```

#### Customer Object
```json
{
  "id": "CUST-12345",
  "companyName": "Acme Corporation",
  "status": "active",
  "tier": "Enterprise",
  "healthScore": 85,
  "contractValue": 250000,
  "renewalDate": "2025-12-31",
  "accountManager": "employee-id"
}
```

#### IoT Device Object
```json
{
  "id": "DEV-789456",
  "type": "Temperature Sensor",
  "status": "online",
  "battery": 78,
  "location": "Building A - Floor 3",
  "assignedTo": "employee-id",
  "nextMaintenance": "2025-10-15",
  "lastTelemetry": "2025-08-15T14:30:00Z"
}
```

---

## Support & Resources

### During the Workshop

- **Live API:** https://uipath-workshop-api-production.up.railway.app/
- **Interactive UI:** Available at root URL
- **API Documentation:** `/api-documentation.html`
- **Health Check:** `/health` endpoint
- **Data Viewer:** `/data-viewer` endpoint

### Additional Resources

- [UiPath API Activities Documentation](https://docs.uipath.com/activities/other/latest/workflow/http-request)
- [Studio Web Guide](https://docs.uipath.com/studio-web)
- [API Workflows Best Practices](https://docs.uipath.com/platform)
- [JSON Server Documentation](https://github.com/typicode/json-server)

---

## Troubleshooting

### Common Issues

**CORS Errors**
- The API has CORS enabled for all origins
- If issues persist, check your UiPath proxy settings
- Verify you're using the correct base URL with `/api` prefix

**Empty Responses**
- Verify the endpoint URL includes the `/api` prefix
- Check if the endpoint requires filtering (marked with *)
- Ensure you're using the correct HTTP method (GET, POST, PATCH)

**Connection Timeouts**
- Default timeout is 30 seconds
- For local development, ensure port 4000 is available
- Check firewall settings if running locally

**Invalid JSON Responses**
- Ensure Content-Type header is `application/json`
- Verify request body is valid JSON format
- Check for trailing commas in JSON

### Debug Tips

1. **Check API Health:**
   ```bash
   curl https://your-api-url.railway.app/health
   ```

2. **Test Endpoint:**
   ```bash
   curl https://your-api-url.railway.app/api/hr/workers
   ```

3. **View Logs:**
   - Railway: Check deployment logs in dashboard
   - Local: Check terminal/console output

---

## Project Structure

```
uipath-workshop-api/
├── server.js                 # Main Express server
├── db.json                   # JSON database
├── routes.json               # API route definitions
├── public/
│   ├── index.html           # Interactive UI
│   ├── api-documentation.html  # API documentation
│   ├── workshop-guide.html  # Workshop scenarios
│   └── data-viewer.html     # Data exploration tool
├── package.json             # Dependencies
└── README.md               # This file
```

---

## Contributing

Contributions are welcome! This project is designed for educational purposes.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Maintain realistic business data
- Follow existing API patterns
- Add documentation for new endpoints
- Test all changes locally before submitting
- Keep workshop scenarios practical and achievable

---

## License

MIT License - Feel free to use for workshops, training, and educational purposes.

---

## Credits

- **Workshop Design:** UiPath Training Team
- **API Development:** Robert Dima
- **Documentation:** Workshop Contributors
- **Data Generation:** Faker.js Community

---

## Next Steps

### Getting Started

1. **Access the API:** https://uipath-workshop-api-production.up.railway.app/
2. **Open UiPath Studio Web:** https://studio.uipath.com
3. **Create Your First Workflow:** Start with Scenario 1 (Employee Onboarding)
4. **Build an Agent:** Add your workflow as a tool

### Learning Path

1. **Beginner:** Start with simple GET requests to explore data
2. **Intermediate:** Implement filtering and data enrichment
3. **Advanced:** Build complete workflows with PATCH operations
4. **Expert:** Create end-to-end automation solutions

---

## Frequently Asked Questions

**Q: Do I need authentication?**
A: No, the API is open for workshop use with no authentication required.

**Q: Can I modify the data?**
A: Yes! Use PATCH/POST endpoints to update data. The database resets periodically.

**Q: Is this production-ready?**
A: This is designed for workshops and training. For production use, implement proper authentication, validation, and persistence.

**Q: Can I deploy my own instance?**
A: Absolutely! Use Railway, Render, or run locally. See deployment instructions above.

**Q: How often does data refresh?**
A: The database contains static seed data. Dynamic endpoints (like telemetry) generate data on each request.

**Q: Can I use this for UiPath certifications?**
A: This is designed for practice and workshops. Check UiPath certification requirements for approved resources.

---

<div align="center">

**Happy Automating!**

Built with ❤️ for the UiPath Community

[Live Demo](https://uipath-workshop-api-production.up.railway.app/) • [Documentation](https://uipath-workshop-api-production.up.railway.app/api-documentation.html) • [Report Issue](https://github.com/robertdima/uipath-workshop-api/issues)

</div>
