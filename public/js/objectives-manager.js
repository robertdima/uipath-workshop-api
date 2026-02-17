// Objectives Manager - Prominent Learning Objectives Display

class ObjectivesManager {
  constructor() {
    this.currentObjectives = [];
    this.completedObjectives = new Set();
    this.activeObjective = null;
  }

  // Load objectives for a scenario
  loadScenarioObjectives(scenarioId) {
    const objectives = this.getObjectivesData(scenarioId);
    this.currentObjectives = objectives;
    this.renderObjectivesBanner();
    this.updateLearningPanel();
  }

  // Get objectives data for different scenarios
  getObjectivesData(scenarioId) {
    const objectivesMap = {
      'hr-onboarding-basic': [
        {
          id: 'obj-1',
          label: 'Connect to the API',
          description: 'Successfully establish connection to the Workshop API server',
          difficulty: 'basic',
          points: 10,
          required: true
        },
        {
          id: 'obj-2',
          label: 'Fetch Employee Data',
          description: 'Use GET request to retrieve all HR workers from the API',
          difficulty: 'basic',
          points: 15,
          required: true
        },
        {
          id: 'obj-3',
          label: 'Filter Active Employees',
          description: 'Apply JavaScript logic to filter employees by status',
          difficulty: 'basic',
          points: 20,
          required: true
        },
        {
          id: 'obj-4',
          label: 'Create Onboarding Report',
          description: 'Generate a structured report showing onboarding progress',
          difficulty: 'basic',
          points: 25,
          required: false
        },
        {
          id: 'obj-5',
          label: 'Handle Errors Gracefully',
          description: 'Implement proper error handling for API failures',
          difficulty: 'basic',
          points: 30,
          required: false
        }
      ],
      'invoice-approval-intermediate': [
        {
          id: 'obj-1',
          label: 'Fetch Pending Invoices',
          description: 'Retrieve all invoices with pending status from Finance API',
          difficulty: 'intermediate',
          points: 15,
          required: true
        },
        {
          id: 'obj-2',
          label: 'Analyze Vendor Risk',
          description: 'Cross-reference vendors with performance metrics',
          difficulty: 'intermediate',
          points: 25,
          required: true
        },
        {
          id: 'obj-3',
          label: 'Apply Business Rules',
          description: 'Implement approval thresholds based on invoice amount',
          difficulty: 'intermediate',
          points: 30,
          required: true
        },
        {
          id: 'obj-4',
          label: 'Route for Approval',
          description: 'Create intelligent routing logic based on risk and amount',
          difficulty: 'intermediate',
          points: 35,
          required: true
        },
        {
          id: 'obj-5',
          label: 'Update Invoice Status',
          description: 'Use PUT requests to update invoice approval status',
          difficulty: 'intermediate',
          points: 20,
          required: false
        }
      ],
      'iot-monitoring-advanced': [
        {
          id: 'obj-1',
          label: 'Real-time Data Collection',
          description: 'Fetch live sensor data from IoT endpoints',
          difficulty: 'advanced',
          points: 20,
          required: true
        },
        {
          id: 'obj-2',
          label: 'Implement Anomaly Detection',
          description: 'Build logic to detect unusual sensor readings',
          difficulty: 'advanced',
          points: 40,
          required: true
        },
        {
          id: 'obj-3',
          label: 'Predictive Maintenance',
          description: 'Create algorithms to predict device failures',
          difficulty: 'advanced',
          points: 45,
          required: true
        },
        {
          id: 'obj-4',
          label: 'Multi-source Aggregation',
          description: 'Combine data from multiple IoT sources',
          difficulty: 'advanced',
          points: 35,
          required: false
        },
        {
          id: 'obj-5',
          label: 'Generate Alerts',
          description: 'Create automated alert system for critical conditions',
          difficulty: 'advanced',
          points: 40,
          required: true
        }
      ]
    };

    return objectivesMap[scenarioId] || [];
  }

  // Render objectives banner at the top of content
  renderObjectivesBanner() {
    const contentArea = document.getElementById('content-area');
    if (!contentArea || this.currentObjectives.length === 0) return;

    // Check if banner already exists
    let banner = document.querySelector('.objectives-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'objectives-banner';

      // Insert at the beginning of content area
      const firstChild = contentArea.firstChild;
      if (firstChild) {
        contentArea.insertBefore(banner, firstChild);
      } else {
        contentArea.appendChild(banner);
      }
    }

    const completedCount = this.currentObjectives.filter(obj =>
      this.completedObjectives.has(obj.id)
    ).length;

    const totalPoints = this.currentObjectives.reduce((sum, obj) => sum + obj.points, 0);
    const earnedPoints = this.currentObjectives
      .filter(obj => this.completedObjectives.has(obj.id))
      .reduce((sum, obj) => sum + obj.points, 0);

    banner.innerHTML = `
      <div class="objectives-header">
        <span class="objectives-icon">🎯</span>
        <h2 class="objectives-title">Learning Objectives</h2>
      </div>
      <p class="objectives-subtitle">
        Complete these objectives to master this scenario.
        Progress: ${completedCount}/${this.currentObjectives.length} objectives • ${earnedPoints}/${totalPoints} points
      </p>

      <div class="objectives-list">
        ${this.currentObjectives.map(obj => this.renderObjectiveItem(obj)).join('')}
      </div>

      <div class="objectives-progress">
        <div class="objectives-progress-header">
          <span class="objectives-progress-label">Overall Progress</span>
          <span class="objectives-progress-value">${Math.round((earnedPoints / totalPoints) * 100)}%</span>
        </div>
        <div class="objectives-progress-bar">
          <div class="objectives-progress-fill" style="width: ${(earnedPoints / totalPoints) * 100}%"></div>
        </div>
      </div>
    `;

    // Add click handlers
    this.attachObjectiveHandlers();
  }

  // Render individual objective item
  renderObjectiveItem(objective) {
    const isCompleted = this.completedObjectives.has(objective.id);
    const isActive = this.activeObjective === objective.id;

    return `
      <div class="objective-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}"
           data-objective-id="${objective.id}">
        <div class="objective-checkbox" data-objective-id="${objective.id}">
          <span class="objective-checkbox-icon">✓</span>
        </div>
        <div class="objective-content">
          <div class="objective-label">${objective.label}</div>
          <div class="objective-description">${objective.description}</div>
          <div class="objective-meta">
            <span class="objective-tag difficulty-${objective.difficulty}">
              ${objective.difficulty}
            </span>
            <span class="objective-tag">
              🏆 ${objective.points} points
            </span>
            ${objective.required ? '<span class="objective-tag">⚠️ Required</span>' : ''}
          </div>
        </div>
      </div>
    `;
  }

  // Update learning panel with quick objectives
  updateLearningPanel() {
    const learningPanel = document.getElementById('learning-panel');
    if (!learningPanel) return;

    // Check if quick objectives already exists
    let quickObjectives = learningPanel.querySelector('.quick-objectives');
    if (!quickObjectives) {
      quickObjectives = document.createElement('div');
      quickObjectives.className = 'quick-objectives';

      // Insert after the title
      const title = learningPanel.querySelector('h3');
      if (title && title.nextSibling) {
        learningPanel.insertBefore(quickObjectives, title.nextSibling);
      } else {
        learningPanel.appendChild(quickObjectives);
      }
    }

    const requiredObjectives = this.currentObjectives.filter(obj => obj.required);

    quickObjectives.innerHTML = `
      <div class="quick-objectives-header">
        <span>🎯</span>
        <span class="quick-objectives-title">Current Objectives</span>
      </div>
      <div class="quick-objectives-list">
        ${requiredObjectives.map(obj => `
          <div class="quick-objective ${this.completedObjectives.has(obj.id) ? 'completed' : ''}"
               data-objective-id="${obj.id}">
            <span>${this.completedObjectives.has(obj.id) ? '✅' : '⭕'}</span>
            <span>${obj.label}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Show objectives spotlight for new scenario
  showObjectivesSpotlight(scenario) {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    const spotlight = document.createElement('div');
    spotlight.className = 'objectives-spotlight';
    spotlight.innerHTML = `
      <span class="objectives-spotlight-icon">🎯</span>
      <h2 class="objectives-spotlight-title">Your Mission</h2>
      <p class="objectives-spotlight-description">
        ${scenario.description || 'Complete the objectives below to master this scenario and earn achievements.'}
      </p>
      <button class="btn btn-primary" onclick="objectivesManager.dismissSpotlight()">
        Start Learning →
      </button>
    `;

    // Replace content temporarily with spotlight
    const originalContent = contentArea.innerHTML;
    contentArea.innerHTML = '';
    contentArea.appendChild(spotlight);

    // Restore content after delay
    setTimeout(() => {
      spotlight.style.animation = 'fadeOut 0.5s ease';
      setTimeout(() => {
        contentArea.innerHTML = originalContent;
        this.renderObjectivesBanner();
      }, 500);
    }, 3000);
  }

  // Mark objective as completed
  completeObjective(objectiveId) {
    if (!this.completedObjectives.has(objectiveId)) {
      this.completedObjectives.add(objectiveId);
      this.saveProgress();
      this.renderObjectivesBanner();
      this.updateLearningPanel();
      this.showCompletionNotification(objectiveId);
    }
  }

  // Toggle objective completion (for demo)
  toggleObjective(objectiveId) {
    if (this.completedObjectives.has(objectiveId)) {
      this.completedObjectives.delete(objectiveId);
    } else {
      this.completedObjectives.add(objectiveId);
      this.showCompletionNotification(objectiveId);
    }
    this.saveProgress();
    this.renderObjectivesBanner();
    this.updateLearningPanel();
  }

  // Set active objective
  setActiveObjective(objectiveId) {
    this.activeObjective = objectiveId;
    this.renderObjectivesBanner();
  }

  // Attach event handlers to objectives
  attachObjectiveHandlers() {
    // Click handlers for checkboxes
    document.querySelectorAll('.objective-checkbox').forEach(checkbox => {
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        const objectiveId = checkbox.getAttribute('data-objective-id');
        this.toggleObjective(objectiveId);
      });
    });

    // Click handlers for objective items
    document.querySelectorAll('.objective-item').forEach(item => {
      item.addEventListener('click', () => {
        const objectiveId = item.getAttribute('data-objective-id');
        this.setActiveObjective(objectiveId);
      });
    });
  }

  // Show completion notification
  showCompletionNotification(objectiveId) {
    const objective = this.currentObjectives.find(obj => obj.id === objectiveId);
    if (!objective) return;

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: linear-gradient(135deg, var(--success), #2ecc71);
      color: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(82, 196, 26, 0.3);
      z-index: 10000;
      animation: slideInRight 0.5s ease;
      max-width: 400px;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <span style="font-size: 2rem;">✅</span>
        <div>
          <strong style="font-size: 1.1rem;">Objective Complete!</strong><br>
          <span style="opacity: 0.9;">${objective.label}</span><br>
          <span style="font-size: 0.9rem; opacity: 0.8;">+${objective.points} points earned</span>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.5s ease';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  // Save progress to localStorage
  saveProgress() {
    const progress = {
      completed: Array.from(this.completedObjectives),
      active: this.activeObjective
    };
    localStorage.setItem('objectivesProgress', JSON.stringify(progress));
  }

  // Load progress from localStorage
  loadProgress() {
    const saved = localStorage.getItem('objectivesProgress');
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        this.completedObjectives = new Set(progress.completed || []);
        this.activeObjective = progress.active || null;
      } catch (e) {
        console.error('Failed to load objectives progress:', e);
      }
    }
  }

  // Dismiss spotlight
  dismissSpotlight() {
    const spotlight = document.querySelector('.objectives-spotlight');
    if (spotlight) {
      spotlight.style.animation = 'fadeOut 0.5s ease';
      setTimeout(() => spotlight.remove(), 500);
    }
  }

  // Reset all objectives
  resetObjectives() {
    this.completedObjectives.clear();
    this.activeObjective = null;
    this.saveProgress();
    this.renderObjectivesBanner();
    this.updateLearningPanel();
  }
}

// Initialize objectives manager
const objectivesManager = new ObjectivesManager();
objectivesManager.loadProgress();

// Make globally available
window.objectivesManager = objectivesManager;