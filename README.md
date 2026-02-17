# UiPath Workshop API

> **Modern API platform for UiPath automation workshops**
> Built with real-world enterprise integration patterns and business scenarios

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Available-FA4616?style=for-the-badge)](https://uipath-workshop-api-production.up.railway.app/)
[![API Endpoints](https://img.shields.io/badge/📡_API_Endpoints-145+-0ba2b3?style=for-the-badge)](https://uipath-workshop-api-production.up.railway.app/api-documentation.html)
[![Collections](https://img.shields.io/badge/📊_Data_Collections-42-172125?style=for-the-badge)](#features)
[![Deploy on Railway](https://img.shields.io/badge/🚀_Deploy-Railway-8B5CF6?style=for-the-badge)](https://railway.app/template/ZweBXA)

---

## Features

### Core Capabilities

- **145+ Production-Ready Endpoints** across 7 business modules (HR, Finance, CRM, IoT, Analytics, ITSM, Projects)
- **42 Data Collections** with 900+ realistic business records
- **Dynamic Data Generation** for real-time scenarios and testing
- **Zero Authentication** required for simplified workshop experience
- **Interactive UI** with modern Origin design patterns
- **ITSM Console** - Full IT Service Management application fully integrated with the API — incidents, changes, service requests, problems, knowledge base, and CMDB
- **Legacy HR Portal** - Simulated legacy web application for onboarding automation
- **Real-time HR Onboarding Tracker** demonstrating practical use cases

### Business Modules

| Module | Endpoints | Description | Key Use Cases |
|--------|-----------|-------------|---------------|
| **👥 HR Management** | 20 | Employee records, performance, onboarding | Employee directory, performance tracking, onboarding automation |
| **💰 Finance** | 13 | Invoices, expenses, budget tracking | Invoice approval workflows, expense automation, budget variance alerts |
| **🤝 CRM** | 17 | Customer management, sales pipeline | Customer health scoring, churn prevention, opportunity tracking |
| **🔌 IoT** | 16 | Device management, telemetry, alerts | Predictive maintenance, device monitoring, alert automation |
| **🎫 ITSM** | 65+ | IT Service Management (Incidents, Changes, Requests, Problems, Assets, Knowledge, Reports, Audit) | Incident automation, change approval workflows, service catalog, asset management, SLA reporting |
| **📊 Analytics** | 7 | Reports, KPIs, workflow monitoring | Executive dashboards, workforce analytics, automation health |
| **📋 Projects** | 5 | Project tracking and workflows | Project monitoring, resource allocation |

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

### ITSM Module (IT Service Management)

#### Incident Management

| Endpoint | Method | Description | Workshop Use Case |
|----------|---------|-------------|-------------------|
| `/itsm/incidents` | `GET` | All incidents | Incident dashboard automation |
| `/itsm/incidents/:id` | `GET` | Incident details | Retrieve specific incident info |
| `/itsm/incidents` | `POST` | Create incident | Automated incident creation from monitoring |
| `/itsm/incidents/:id/status` | `PATCH` | Update status | Workflow-based status transitions |
| `/itsm/incidents/:id/notes` | `POST` | Add work note | Automated documentation |
| `/itsm/incidents/:id/assign` | `POST` | Assign to team | Intelligent routing automation |
| `/itsm/incidents/:id/escalate` | `POST` | Escalate incident | Priority escalation workflows |
| `/itsm/incidents/:id/resolve` | `POST` | Resolve incident | Auto-resolution workflows |
| `/itsm/incidents/:id/link` | `POST` | Link to other records | Cross-module correlation |
| `/itsm/incidents/stats` | `GET` | Incident statistics | SLA compliance dashboard |

#### Change Management

| Endpoint | Method | Description | Workshop Use Case |
|----------|---------|-------------|-------------------|
| `/itsm/changes` | `GET` | All change requests | Change calendar automation |
| `/itsm/changes/:id` | `GET` | Change details | Retrieve specific change info |
| `/itsm/changes` | `POST` | Create change request | Automated change creation |
| `/itsm/changes/:id/status` | `PATCH` | Update status | Change workflow automation |
| `/itsm/changes/:id/approve` | `POST` | CAB approval | Approval workflow automation |
| `/itsm/changes/:id/reject` | `POST` | Reject change | Rejection with reason |
| `/itsm/changes/:id/implement` | `POST` | Start implementation | Implementation tracking |
| `/itsm/changes/:id/complete` | `POST` | Complete change | Success/failure recording |
| `/itsm/changes/stats` | `GET` | Change statistics | Success rate monitoring |
| `/itsm/changes/calendar` | `GET` | Change calendar | Schedule visibility |

#### Service Requests

| Endpoint | Method | Description | Workshop Use Case |
|----------|---------|-------------|-------------------|
| `/itsm/requests` | `GET` | All service requests | Request fulfillment tracking |
| `/itsm/requests/:id` | `GET` | Request details | Retrieve specific request |
| `/itsm/requests` | `POST` | Submit request | Self-service automation |
| `/itsm/requests/:id/status` | `PATCH` | Update status | Fulfillment workflow |
| `/itsm/requests/:id/approve` | `POST` | Approve request | Approval routing |
| `/itsm/requests/:id/reject` | `POST` | Reject request | Rejection with reason |
| `/itsm/requests/:id/fulfill` | `POST` | Fulfill request | Auto-fulfillment |
| `/itsm/requests/:id/assign` | `POST` | Assign request | Assignment routing |
| `/itsm/requests/:id/notes` | `POST` | Add note | Automated documentation |
| `/itsm/requests/stats` | `GET` | Request statistics | Fulfillment metrics |
| `/itsm/requests/pending-approval` | `GET` | Pending approvals | Approval queue |

#### Problem Management

| Endpoint | Method | Description | Workshop Use Case |
|----------|---------|-------------|-------------------|
| `/itsm/problems` | `GET` | All problems | Root cause tracking |
| `/itsm/problems` | `POST` | Create problem | Problem creation from incidents |
| `/itsm/problems/:id/status` | `PATCH` | Update status | Investigation workflow |
| `/itsm/problems/:id/root-cause` | `PATCH` | Update root cause | RCA automation |
| `/itsm/problems/:id/link-incident` | `POST` | Link incident | Correlation automation |
| `/itsm/problems/known-errors` | `GET` | Known errors | Self-healing automation |

#### Assets, Knowledge & Configuration

| Endpoint | Method | Description | Workshop Use Case |
|----------|---------|-------------|-------------------|
| `/itsm/assets` | `GET` | All CMDB assets | Asset inventory |
| `/itsm/assets` | `POST` | Create asset | Asset onboarding |
| `/itsm/assets/:id/status` | `PATCH` | Update asset status | Lifecycle management |
| `/itsm/assets/stats` | `GET` | Asset statistics | CMDB dashboard |
| `/itsm/knowledge` | `GET` | All KB articles | Knowledge search |
| `/itsm/knowledge` | `POST` | Create KB article | Knowledge creation |
| `/itsm/knowledge/:id/publish` | `PATCH` | Publish article | Publishing workflow |
| `/itsm/knowledge/search` | `GET` | Search KB | Context grounding for agents |
| `/itsm/catalog` | `GET` | Service catalog | Self-service portal |
| `/itsm/dashboard/stats` | `GET` | ITSM dashboard | Executive ITSM overview |
| `/itsm/audit-log/recent` | `GET` | Recent audit entries | Compliance reporting |
| `/itsm/reports/sla-compliance` | `GET` | SLA compliance report | SLA monitoring |
| `/itsm/reports/team-performance` | `GET` | Team performance | Capacity planning |
| `/itsm/reset` | `POST` | Reset demo data | Environment reset |

#### Example: Create Incident

```http
POST /api/itsm/incidents
Content-Type: application/json

{
  "summary": "Email service unavailable",
  "description": "Users reporting inability to send/receive emails since 9am",
  "impact": 2,
  "urgency": 1,
  "category": "Email",
  "callerName": "John Smith",
  "callerEmail": "john.smith@acme.com"
}
```

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

### Scenario 4: IT Incident Automation

**Objective:** Automate incident triage, assignment, and resolution workflows

**Endpoints:**
1. `/itsm/incidents` - Get all incidents or create new ones
2. `/itsm/incidents/:id/assign` - Auto-assign based on category/skills
3. `/itsm/knowledge/search` - Find relevant KB articles
4. `/itsm/incidents/:id/resolve` - Auto-resolve with KB solutions

**UiPath Implementation:**
```
1. GET /itsm/incidents (filter status = 'New')
2. For Each new incident:
   - Analyze category and subcategory
   - GET /itsm/knowledge/search?q={category}
   - If matching KB article found:
     - POST /itsm/incidents/:id/notes (attach KB solution)
     - POST /itsm/incidents/:id/resolve (auto-resolve)
   - If no KB match:
     - Match category to team skills
     - POST /itsm/incidents/:id/assign (route to team)
3. GET /itsm/incidents/stats (generate SLA report)
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

- **Runtime:** Node.js 14+
- **Framework:** JSON Server 0.17.4 (Express-based)
- **Data Generation:** @faker-js/faker 8.0
- **Testing:** Playwright 1.58
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
- **Interactive UI:** Available at root URL (test all 145+ endpoints)
- **API Documentation:** `/api-documentation.html`
- **ITSM Console:** `/itsm-app/` (full IT Service Management application)
- **Health Check:** `/health` endpoint

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
├── server.js                          # Main Express server (data generation + API routes)
├── enhanced_routes_complete.json      # API route mappings (116 routes)
├── public/
│   ├── index.html                     # Interactive API testing UI
│   ├── api-documentation.html         # Complete API documentation
│   ├── script.js                      # Frontend scripts
│   ├── styles/                        # CSS stylesheets
│   ├── js/                            # JavaScript modules
│   └── itsm-app/                      # ITSM Console Application
│       ├── index.html                 # ITSM Console UI
│       ├── icons/                     # Line icon set (28 icons)
│       ├── styles/                    # CSS (retro theme, components)
│       └── js/
│           ├── app.js                 # Console app logic
│           ├── api.js                 # API service layer (all HTTP calls)
│           ├── data.js                # ITSM seed/fallback data
│           └── modules/               # Feature modules (incidents, changes, requests, etc.)
├── src/                               # Source modules
├── package.json                       # Dependencies
└── README.md                          # This file
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
2. **Explore the ITSM Console:** https://uipath-workshop-api-production.up.railway.app/itsm-app/
3. **Open UiPath Studio Web:** https://studio.uipath.com
4. **Create Your First Workflow:** Start with Scenario 1 (Employee Onboarding) or Scenario 4 (IT Incident Automation)
5. **Build an Agent:** Add your workflow as a tool

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
A: The database is regenerated on each server restart. Dynamic endpoints (like telemetry) generate data on each request. ITSM data uses curated realistic scenarios.

**Q: Does the ITSM Console connect to the API?**
A: Yes! The ITSM Console at `/itsm-app/` is fully integrated with the API. All CRUD operations (creating incidents, approving changes, fulfilling requests, etc.) go through the API endpoints. Changes made in the UI are visible via the API and vice versa. It also falls back to local demo data if the API is unavailable.

**Q: Can I use this for UiPath certifications?**
A: This is designed for practice and workshops. Check UiPath certification requirements for approved resources.

---

<div align="center">

**Happy Automating!**

Built with ❤️ for the UiPath Community

[Live Demo](https://uipath-workshop-api-production.up.railway.app/) • [Documentation](https://uipath-workshop-api-production.up.railway.app/api-documentation.html) • [Report Issue](https://github.com/robertdima/uipath-workshop-api/issues)

</div>
