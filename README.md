# 🚀 UiPath Workshop API - Enterprise Integration Platform

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/ZweBXA)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-success)](https://uipath-workshop-api-production.up.railway.app/)
[![Endpoints](https://img.shields.io/badge/API%20Endpoints-87-blue)](https://uipath-workshop-api-production.up.railway.app/)
[![Documentation](https://img.shields.io/badge/Documentation-Complete-green)](#api-documentation)

A comprehensive enterprise API platform designed for UiPath automation workshops, featuring 87 real-world business endpoints across HR, Finance, CRM, and IoT domains.

## 🎯 Workshop Objectives

This API platform enables workshop attendees to:
- Build real-world API Workflows in UiPath Studio Web
- Create intelligent agents with tool integration
- Implement enterprise automation patterns
- Practice data orchestration across business systems

## 🌟 Features

- **87 Production-Ready Endpoints** across 5 business modules
- **26 Data Collections** with 700+ records
- **Dynamic Data Generation** for realistic scenarios
- **Zero Authentication** for workshop simplicity
- **Interactive UI** for testing and exploration
- **Business Context** for each endpoint
- **Workshop Scenarios** with step-by-step guides

## 🚀 Quick Start

### Option 1: Use Our Live Instance
```
https://uipath-workshop-api-production.up.railway.app/
```

### Option 2: Deploy Your Own Instance

#### Deploy on Railway (Recommended)
1. Click the "Deploy on Railway" button above
2. Your API will be live in ~2 minutes
3. Access at `https://your-app-name.railway.app`

#### Local Development
```bash
# Clone the repository
git clone https://github.com/robertdima/uipath-workshop-api.git
cd uipath-workshop-api

# Install dependencies
npm install

# Start the server
npm start

# Access at http://localhost:4000
```

#### Deploy on Render
```bash
# Fork this repo, then in Render:
1. New > Web Service
2. Connect your GitHub repo
3. Build Command: npm install
4. Start Command: npm start
5. Deploy!
```

## 📚 API Documentation

### Base URL
```
Production: https://uipath-workshop-api-production.up.railway.app/api
Local: http://localhost:4000/api
```

### Available Modules

#### 👥 HR Management (23 endpoints)
Manage employees, performance reviews, and onboarding processes

| Endpoint | Method | Description | UiPath Use Case |
|----------|---------|-------------|-----------------|
| `/hr/workers` | GET | All employees | Employee directory bot |
| `/hr/workers/:id` | GET | Employee details | Get specific employee info |
| `/hr/workers/active` | GET | Active employees* | Filter with DataTable activity |
| `/hr/performance` | GET | Performance reviews | Performance dashboard |
| `/hr/onboarding` | GET | Onboarding status | Track new employee progress |
| `/hr/onboarding/pending` | GET | Pending onboardings* | Identify bottlenecks |

*Returns all data - requires filtering in UiPath

#### 💰 Finance (19 endpoints)
Invoice processing, expense management, and budget tracking

| Endpoint | Method | Description | UiPath Use Case |
|----------|---------|-------------|-----------------|
| `/finance/invoices` | GET | All invoices | Invoice processing queue |
| `/finance/invoices/:id` | GET | Invoice details | Get specific invoice |
| `/finance/invoices/pending` | GET | Pending approval* | Approval workflow automation |
| `/finance/invoices/:id/approve` | PATCH | Approve invoice | Update invoice status |
| `/finance/expenses` | GET | Expense reports | Expense automation |
| `/finance/budget/variance` | GET | Budget analysis | Financial alerts |

#### 🤝 CRM (20 endpoints)
Customer management, sales pipeline, and support tickets

| Endpoint | Method | Description | UiPath Use Case |
|----------|---------|-------------|-----------------|
| `/crm/customers` | GET | All customers | Customer 360 view |
| `/crm/customers/atrisk` | GET | At-risk accounts* | Churn prevention workflow |
| `/crm/opportunities` | GET | Sales pipeline | Deal prioritization |
| `/crm/support/tickets` | GET | Support tickets | Ticket routing automation |
| `/crm/renewals/upcoming` | GET | Renewal alerts* | Contract renewal automation |

#### 🔌 IoT (18 endpoints)
Device management, telemetry, and predictive maintenance

| Endpoint | Method | Description | UiPath Use Case |
|----------|---------|-------------|-----------------|
| `/iot/devices` | GET | All devices | Device inventory |
| `/iot/devices/offline` | GET | Offline devices* | Alert generation |
| `/iot/devices/:id/telemetry` | GET | Real-time data | Monitor device health |
| `/iot/alerts/critical` | GET | Critical alerts* | Incident management |
| `/iot/maintenance/overdue` | GET | Overdue maintenance* | Preventive maintenance |

#### 📊 Analytics & Reporting (7 endpoints)
Business intelligence and KPI dashboards

| Endpoint | Method | Description | UiPath Use Case |
|----------|---------|-------------|-----------------|
| `/reports/financial/monthly` | GET | Financial summary | Executive dashboard |
| `/reports/employee/summary` | GET | HR analytics | Workforce planning |
| `/analytics/customer/relationships` | GET | Customer metrics | Success scoring |
| `/workflows/triggers` | GET | Automation health | Process monitoring |

## 🎓 Workshop Scenarios

### Scenario 1: Employee Onboarding Dashboard
**Objective:** Build an intelligent onboarding tracker that identifies at-risk new hires

**Endpoints to Use:**
1. `/hr/onboarding` - Get onboarding records
2. `/hr/workers/:id` - Enrich with employee details
3. `/hr/workers/:id/performance` - Add performance context

**UiPath Implementation:**
```
1. Create API Workflow in Studio Web
2. GET onboarding records
3. For Each onboarding record:
   - GET employee details
   - Calculate progress percentage
   - Identify risks (low completion, delayed tasks)
4. Generate dashboard with recommendations
```

**Expected Outcome:**
- List of at-risk onboardings with specific action items
- Progress metrics and bottleneck identification
- Automated alerts for HR managers

### Scenario 2: Invoice Approval Automation
**Objective:** Implement intelligent invoice routing based on amount and vendor risk

**Endpoints to Use:**
1. `/finance/invoices` - Get pending invoices
2. `/finance/vendors/performance` - Check vendor risk
3. `/finance/invoices/:id/approve` - Approve invoices

**Business Rules:**
- < $5,000: Auto-approve if vendor risk is low
- $5,000 - $25,000: Route to manager
- > $25,000: Route to C-level
- High-risk vendor: Always manual review

### Scenario 3: Customer Health Monitoring
**Objective:** Calculate customer health scores and prevent churn

**Endpoints to Use:**
1. `/crm/customers` - Get customer base
2. `/crm/support/tickets` - Check support issues
3. `/analytics/customer/relationships` - Get engagement metrics
4. `/crm/renewals` - Check renewal risk

**Health Score Calculation:**
```javascript
baseScore = 75
- (openTickets * 8)
- (daysSinceContact / 2)
- (renewalRisk === 'High' ? 25 : 0)
+ (engagementScore * 5)
```

## 🛠️ Technical Details

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
  "location": "San Francisco"
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
  "category": "Software"
}
```

## 🔄 Integration Patterns

### Pattern 1: Data Enrichment
Combine multiple endpoints to create comprehensive views:
```
GET /hr/workers → GET /hr/performance → GET /hr/onboarding
Result: Complete employee profile with performance and onboarding status
```

### Pattern 2: Filtering Pattern
For endpoints marked "Requires UiPath Filtering":
```vb
' In UiPath Studio
DataTable.Select("[status] = 'pending' AND [amount] > 5000")
```

### Pattern 3: Approval Workflows
```
1. GET /finance/invoices (status = 'pending')
2. Apply business rules
3. PATCH /finance/invoices/:id/approve
4. Send notifications
```

## 📈 Workshop Success Metrics

Track your automation success:
- **Response Time**: Target < 500ms per endpoint
- **Error Rate**: Should be < 1%
- **Data Quality**: 700+ realistic records
- **Uptime**: 99.9% availability

## 🤝 Support & Resources

### During the Workshop
- **Live API**: https://uipath-workshop-api-production.up.railway.app/
- **Interactive UI**: Available at root URL
- **Health Check**: `/health` endpoint

### Additional Resources
- [UiPath API Activities Documentation](https://docs.uipath.com/activities/other/latest/workflow/http-request)
- [Studio Web Guide](https://docs.uipath.com/studio-web)
- [API Workflows Best Practices](https://docs.uipath.com/platform)

## 🐛 Troubleshooting

### Common Issues

**CORS Errors**
- The API has CORS enabled for all origins
- If issues persist, check your UiPath proxy settings

**Empty Responses**
- Verify the endpoint URL includes `/api` prefix
- Check if filtering is required (see endpoint table)

**Connection Timeouts**
- Default timeout is 30 seconds
- For local development, ensure port 4000 is available

## 📝 License

MIT License - Feel free to use for workshops and training

## 👨‍💻 Contributors

- Workshop Design: UiPath Training Team
- API Development: Robert Dima
- Documentation: Workshop Contributors

## 🚀 Next Steps

1. **Access the API**: https://uipath-workshop-api-production.up.railway.app/
2. **Open UiPath Studio Web**: studio.uipath.com
3. **Create your first API Workflow**: Start with Scenario 1
4. **Build an Agent**: Add your workflow as a tool
5. **Share your success**: Tag us with #UiPathWorkshop

---

**Happy Automating! 🤖**

For questions during the workshop, use the chat or raise your hand for assistance.