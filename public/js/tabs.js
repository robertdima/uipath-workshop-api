// Tabbed Interface Management

class TabManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.tabs = [];
    this.activeTab = null;
  }

  // Initialize tabs for a module
  init(tabs) {
    this.tabs = tabs;
    this.render();
    this.attachEventListeners();

    // Activate first tab by default
    if (tabs.length > 0) {
      this.activateTab(tabs[0].id);
    }
  }

  // Render the tab structure
  render() {
    if (!this.container) return;

    const tabsHTML = `
      <div class="tabs-container">
        <div class="tabs-header">
          ${this.tabs.map(tab => `
            <button class="tab-button" data-tab="${tab.id}">
              <span class="tab-icon">${tab.icon || ''}</span>
              ${tab.label}
              ${tab.badge ? `<span class="tab-badge">${tab.badge}</span>` : ''}
            </button>
          `).join('')}
        </div>
        <div class="tabs-content">
          ${this.tabs.map(tab => `
            <div class="tab-panel" data-panel="${tab.id}">
              ${tab.content || '<div class="loading">Loading...</div>'}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.container.innerHTML = tabsHTML;
  }

  // Attach event listeners to tab buttons
  attachEventListeners() {
    const buttons = this.container.querySelectorAll('.tab-button');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        this.activateTab(tabId);
      });
    });
  }

  // Activate a specific tab
  activateTab(tabId) {
    // Update buttons
    const buttons = this.container.querySelectorAll('.tab-button');
    buttons.forEach(button => {
      if (button.getAttribute('data-tab') === tabId) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });

    // Update panels
    const panels = this.container.querySelectorAll('.tab-panel');
    panels.forEach(panel => {
      if (panel.getAttribute('data-panel') === tabId) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    this.activeTab = tabId;

    // Trigger custom event
    this.container.dispatchEvent(new CustomEvent('tabChange', {
      detail: { tabId }
    }));
  }

  // Update tab content dynamically
  updateTabContent(tabId, content) {
    const panel = this.container.querySelector(`[data-panel="${tabId}"]`);
    if (panel) {
      panel.innerHTML = content;
    }
  }

  // Update tab badge
  updateTabBadge(tabId, badge) {
    const button = this.container.querySelector(`[data-tab="${tabId}"] .tab-badge`);
    if (button) {
      button.textContent = badge;
    }
  }
}

// Create tab sets for different modules
const moduleTabConfigs = {
  'learning-dashboard': [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      content: `
        <div class="tab-card">
          <h3>Welcome to Your Learning Dashboard</h3>
          <p>Track your progress across all learning scenarios and see your achievements.</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 2rem;">
            <div style="text-align: center; padding: 1rem; background: var(--bg-tertiary); border-radius: 8px;">
              <div style="font-size: 2rem; font-weight: bold; color: var(--uipath-orange);">0</div>
              <div style="font-size: 0.9rem; color: var(--text-secondary);">Scenarios Completed</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: var(--bg-tertiary); border-radius: 8px;">
              <div style="font-size: 2rem; font-weight: bold; color: var(--uipath-blue);">0</div>
              <div style="font-size: 0.9rem; color: var(--text-secondary);">API Calls Made</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: var(--bg-tertiary); border-radius: 8px;">
              <div style="font-size: 2rem; font-weight: bold; color: var(--success);">0</div>
              <div style="font-size: 0.9rem; color: var(--text-secondary);">Achievements</div>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'scenarios',
      label: 'Active Scenarios',
      icon: '📚',
      badge: '3',
      content: `
        <div class="tab-list">
          <div class="tab-card">
            <h4 style="color: var(--success);">🎯 HR Onboarding (Basic)</h4>
            <p>Learn API fundamentals with employee onboarding workflows.</p>
            <div style="margin-top: 1rem;">
              <button class="btn btn-primary" onclick="selectScenario('hr-onboarding-basic')">Start Scenario</button>
            </div>
          </div>
          <div class="tab-card">
            <h4 style="color: var(--warning);">💰 Invoice Approval (Intermediate)</h4>
            <p>Master business rules and conditional logic with financial workflows.</p>
            <div style="margin-top: 1rem;">
              <button class="btn btn-primary" onclick="selectScenario('invoice-approval-intermediate')">Start Scenario</button>
            </div>
          </div>
          <div class="tab-card">
            <h4 style="color: var(--danger);">📊 IoT Monitoring (Advanced)</h4>
            <p>Build enterprise-grade monitoring solutions with real-time data.</p>
            <div style="margin-top: 1rem;">
              <button class="btn btn-primary" onclick="selectScenario('iot-monitoring-advanced')">Start Scenario</button>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: '🏆',
      content: `
        <div class="tab-empty-state">
          <div class="tab-empty-state-icon">🏆</div>
          <h3 class="tab-empty-state-title">No Achievements Yet</h3>
          <p class="tab-empty-state-description">Complete scenarios to unlock achievements and track your progress.</p>
          <button class="btn btn-primary" onclick="navigateToModule('scenarios')">Start Learning</button>
        </div>
      `
    }
  ],
  'hr-workers': [
    {
      id: 'api-test',
      label: 'API Testing',
      icon: '🧪',
      content: null // Will be populated with API endpoints
    },
    {
      id: 'documentation',
      label: 'Documentation',
      icon: '📖',
      content: `
        <div class="tab-card">
          <h3>HR Workers API Documentation</h3>
          <p>The HR Workers API provides endpoints for managing employee data, including:</p>
          <ul style="margin: 1rem 0; line-height: 1.8;">
            <li><code>GET /api/hr/workers</code> - List all workers</li>
            <li><code>GET /api/hr/workers/:id</code> - Get specific worker details</li>
            <li><code>POST /api/hr/workers</code> - Create new worker</li>
            <li><code>PUT /api/hr/workers/:id</code> - Update worker information</li>
            <li><code>DELETE /api/hr/workers/:id</code> - Remove worker</li>
          </ul>
          <h4 style="margin-top: 2rem;">Response Format</h4>
          <pre style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; overflow-x: auto;">
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "department": "Engineering",
  "position": "Senior Developer",
  "status": "active",
  "startDate": "2024-01-15"
}</pre>
        </div>
      `
    },
    {
      id: 'examples',
      label: 'Code Examples',
      icon: '💻',
      content: `
        <div class="tab-card">
          <h3>UiPath Studio Web Examples</h3>
          <h4 style="margin-top: 1.5rem;">Example 1: Get All Active Workers</h4>
          <pre style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; overflow-x: auto;">
// HTTP Request Activity
Method: GET
URL: ${window.location.origin}/api/hr/workers
Headers: { "Content-Type": "application/json" }

// JavaScript Activity to filter active workers
const workers = JSON.parse(httpResponse);
const activeWorkers = workers.filter(w => w.status === 'active');
console.log(\`Found \${activeWorkers.length} active workers\`);</pre>

          <h4 style="margin-top: 1.5rem;">Example 2: Update Worker Department</h4>
          <pre style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; overflow-x: auto;">
// HTTP Request Activity
Method: PUT
URL: ${window.location.origin}/api/hr/workers/{workerId}
Body: {
  "department": "Product Management",
  "position": "Senior Product Manager"
}</pre>
        </div>
      `
    }
  ],
  'finance-invoices': [
    {
      id: 'api-test',
      label: 'API Testing',
      icon: '🧪',
      content: null // Will be populated with API endpoints
    },
    {
      id: 'business-logic',
      label: 'Business Logic',
      icon: '📊',
      content: `
        <div class="tab-card">
          <h3>Invoice Approval Business Rules</h3>
          <div style="background: rgba(250, 70, 22, 0.1); border: 2px solid var(--uipath-orange); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <h4 style="color: var(--uipath-orange);">Approval Thresholds</h4>
            <ul style="margin: 0.5rem 0 0 1.5rem;">
              <li>< $1,000: Auto-approve</li>
              <li>$1,000 - $5,000: Manager approval</li>
              <li>$5,000 - $25,000: Director approval</li>
              <li>> $25,000: CFO approval</li>
            </ul>
          </div>
          <div style="background: rgba(0, 103, 223, 0.1); border: 2px solid var(--uipath-blue); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <h4 style="color: var(--uipath-blue);">Vendor Risk Assessment</h4>
            <ul style="margin: 0.5rem 0 0 1.5rem;">
              <li>Low Risk: Standard processing</li>
              <li>Medium Risk: Additional verification required</li>
              <li>High Risk: Manual review mandatory</li>
            </ul>
          </div>
        </div>
      `
    },
    {
      id: 'workflow-guide',
      label: 'Workflow Guide',
      icon: '🤖',
      content: `
        <div class="tab-card">
          <h3>Building Invoice Approval Workflows</h3>
          <ol style="line-height: 1.8; margin: 1rem 0;">
            <li><strong>Fetch Pending Invoices:</strong> Use GET /api/finance/invoices with status filter</li>
            <li><strong>Analyze Vendor Risk:</strong> Cross-reference with GET /api/finance/vendors/performance</li>
            <li><strong>Apply Business Rules:</strong> Use JavaScript activity for threshold logic</li>
            <li><strong>Route for Approval:</strong> Based on amount and risk level</li>
            <li><strong>Update Invoice Status:</strong> Use PUT endpoint to mark as approved/rejected</li>
          </ol>
          <div style="margin-top: 2rem;">
            <button class="btn btn-primary" onclick="generateAutopilotPrompt('/api/finance/invoices')">
              🤖 Generate Autopilot Prompt
            </button>
          </div>
        </div>
      `
    }
  ]
};

// Initialize tab manager for modules
function initializeModuleTabs(moduleId) {
  const contentArea = document.getElementById('content-area');
  if (!contentArea) return;

  // Check if module has tab configuration
  const tabConfig = moduleTabConfigs[moduleId];
  if (!tabConfig) return null;

  // Create a container for tabs
  const tabContainer = document.createElement('div');
  tabContainer.id = 'module-tabs';

  // Initialize tab manager
  const tabManager = new TabManager('module-tabs');

  // Return the manager for further use
  return { tabManager, tabConfig };
}

// Enhanced render function for modules with tabs
function renderModuleWithTabs(moduleId, moduleContent) {
  const tabSetup = initializeModuleTabs(moduleId);

  if (tabSetup) {
    const { tabManager, tabConfig } = tabSetup;
    const contentArea = document.getElementById('content-area');

    // If this module should use tabs, wrap the content
    if (['hr-workers', 'finance-invoices', 'crm-customers', 'iot-devices'].includes(moduleId)) {
      // For API modules, modify the first tab to include the API testing content
      tabConfig[0].content = moduleContent;
    }

    // Add the tab container to content area
    contentArea.innerHTML = '<div id="module-tabs"></div>';

    // Initialize tabs
    tabManager.init(tabConfig);

    // Add listener for tab changes
    document.getElementById('module-tabs').addEventListener('tabChange', (e) => {
      console.log('Tab changed to:', e.detail.tabId);

      // Load specific content based on tab
      if (e.detail.tabId === 'api-test' && !tabConfig[0].content) {
        // Load API endpoints for this module
        tabManager.updateTabContent('api-test', moduleContent);
      }
    });
  } else {
    // Module doesn't use tabs, render normally
    document.getElementById('content-area').innerHTML = moduleContent;
  }
}

// Export for global use
window.TabManager = TabManager;
window.renderModuleWithTabs = renderModuleWithTabs;