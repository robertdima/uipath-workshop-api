// Welcome Screen and Onboarding Functions

// Check if user has seen welcome screen before
function shouldShowWelcome() {
  const dontShow = localStorage.getItem('dontShowWelcome');
  return !dontShow;
}

// Initialize welcome screen on page load
function initWelcomeScreen() {
  const welcomeOverlay = document.getElementById('welcome-overlay');

  if (!welcomeOverlay) return;

  if (shouldShowWelcome()) {
    welcomeOverlay.classList.remove('hidden');
  } else {
    welcomeOverlay.classList.add('hidden');
    // Show floating quick start button instead
    showQuickStartButton();
  }
}

// Start the learning journey
function startLearningJourney() {
  // Close welcome screen
  closeWelcome();

  // Navigate to learning dashboard
  const learningDashboard = document.querySelector('[data-module="learning-dashboard"]');
  if (learningDashboard) {
    learningDashboard.click();
  }

  // Start guided tour after a short delay
  setTimeout(() => {
    startGuidedTour();
  }, 500);
}

// Close welcome screen
function closeWelcome() {
  const welcomeOverlay = document.getElementById('welcome-overlay');
  const dontShowCheckbox = document.getElementById('dont-show-again');

  if (dontShowCheckbox && dontShowCheckbox.checked) {
    localStorage.setItem('dontShowWelcome', 'true');
  }

  if (welcomeOverlay) {
    welcomeOverlay.classList.add('hidden');
  }

  // Show quick start button for easy access
  showQuickStartButton();
}

// Show floating quick start button
function showQuickStartButton() {
  // Check if button already exists
  let quickStartBtn = document.getElementById('quick-start-btn');

  if (!quickStartBtn) {
    quickStartBtn = document.createElement('button');
    quickStartBtn.id = 'quick-start-btn';
    quickStartBtn.className = 'quick-start-btn';
    quickStartBtn.innerHTML = '🚀 Quick Start';
    quickStartBtn.onclick = showQuickStartMenu;
    document.body.appendChild(quickStartBtn);
  }

  quickStartBtn.classList.remove('hidden');
}

// Show quick start menu
function showQuickStartMenu() {
  // Create a quick menu with common actions
  const menu = document.createElement('div');
  menu.className = 'quick-start-menu';
  menu.innerHTML = `
    <div style="position: fixed; bottom: 5rem; right: 2rem; background: var(--bg-card); border: 1px solid var(--border-default); border-radius: 12px; padding: 1rem; box-shadow: var(--shadow-lg); z-index: 999;">
      <h4 style="margin-bottom: 1rem; color: var(--uipath-orange);">Quick Actions</h4>
      <button onclick="startScenario('hr-onboarding-basic')" style="display: block; width: 100%; text-align: left; padding: 0.5rem; margin-bottom: 0.5rem; background: transparent; border: none; cursor: pointer; border-radius: 6px; transition: background 0.2s;">
        📚 Start HR Onboarding Scenario
      </button>
      <button onclick="navigateToModule('learning-api')" style="display: block; width: 100%; text-align: left; padding: 0.5rem; margin-bottom: 0.5rem; background: transparent; border: none; cursor: pointer; border-radius: 6px; transition: background 0.2s;">
        ⚙️ Explore Learning APIs
      </button>
      <button onclick="startGuidedTour()" style="display: block; width: 100%; text-align: left; padding: 0.5rem; margin-bottom: 0.5rem; background: transparent; border: none; cursor: pointer; border-radius: 6px; transition: background 0.2s;">
        🎯 Take Guided Tour
      </button>
      <button onclick="this.parentElement.remove()" style="display: block; width: 100%; text-align: left; padding: 0.5rem; background: transparent; border: none; cursor: pointer; border-radius: 6px; transition: background 0.2s; color: var(--text-secondary);">
        ❌ Close
      </button>
    </div>
  `;

  // Remove any existing menu
  const existingMenu = document.querySelector('.quick-start-menu');
  if (existingMenu) {
    existingMenu.remove();
  }

  document.body.appendChild(menu);

  // Close menu when clicking outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target) && e.target.id !== 'quick-start-btn') {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 100);
}

// Start a specific scenario
function startScenario(scenarioId) {
  // Navigate to scenarios module
  const scenariosNav = document.querySelector('[data-module="scenarios"]');
  if (scenariosNav) {
    scenariosNav.click();
  }

  // After a short delay, select the scenario
  setTimeout(() => {
    const scenarioCard = document.querySelector(`[data-scenario-id="${scenarioId}"]`);
    if (scenarioCard) {
      const startButton = scenarioCard.querySelector('button');
      if (startButton) {
        startButton.click();
      }
    }
  }, 500);

  // Close any open menus
  const menu = document.querySelector('.quick-start-menu');
  if (menu) {
    menu.remove();
  }
}

// Navigate to a specific module
function navigateToModule(moduleName) {
  const moduleNav = document.querySelector(`[data-module="${moduleName}"]`);
  if (moduleNav) {
    moduleNav.click();
  }

  // Close any open menus
  const menu = document.querySelector('.quick-start-menu');
  if (menu) {
    menu.remove();
  }
}

// Guided tour functionality
let tourStep = 0;
const tourSteps = [
  {
    element: '.nav-section:first-child',
    title: 'Learning Section',
    description: 'Start here! This section contains all learning scenarios and progress tracking.',
    position: 'right'
  },
  {
    element: '[data-module="scenarios"]',
    title: 'Scenarios',
    description: 'Click here to browse and start learning scenarios.',
    position: 'right'
  },
  {
    element: '.content-area',
    title: 'Main Content',
    description: 'This is where you\'ll interact with APIs and complete tasks.',
    position: 'top'
  },
  {
    element: '.learning-panel',
    title: 'Learning Assistant',
    description: 'Your AI assistant provides hints, tracks progress, and validates your work.',
    position: 'left'
  },
  {
    element: '.api-status',
    title: 'API Status',
    description: 'Monitor your connection to the workshop API server.',
    position: 'bottom'
  }
];

function startGuidedTour() {
  tourStep = 0;
  showTourStep();
}

function showTourStep() {
  // Remove any existing tooltips
  const existingTooltip = document.querySelector('.tour-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }

  if (tourStep >= tourSteps.length) {
    // Tour complete
    alert('🎉 Tour Complete! You\'re ready to start learning. Click on "Scenarios" in the sidebar to begin.');
    return;
  }

  const step = tourSteps[tourStep];
  const element = document.querySelector(step.element);

  if (!element) {
    // Skip to next step if element not found
    tourStep++;
    showTourStep();
    return;
  }

  // Highlight the element
  element.style.position = 'relative';
  element.style.zIndex = '9998';
  element.style.boxShadow = '0 0 0 4px rgba(250, 70, 22, 0.3)';

  // Create tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'tour-tooltip';
  tooltip.innerHTML = `
    <h4>Step ${tourStep + 1} of ${tourSteps.length}: ${step.title}</h4>
    <p>${step.description}</p>
    <div class="tour-tooltip-actions">
      <button onclick="skipTour()">Skip Tour</button>
      <button onclick="nextTourStep()">Next →</button>
    </div>
  `;

  // Position tooltip
  const rect = element.getBoundingClientRect();
  tooltip.style.position = 'fixed';

  switch (step.position) {
    case 'right':
      tooltip.style.left = `${rect.right + 20}px`;
      tooltip.style.top = `${rect.top}px`;
      break;
    case 'left':
      tooltip.style.right = `${window.innerWidth - rect.left + 20}px`;
      tooltip.style.top = `${rect.top}px`;
      break;
    case 'top':
      tooltip.style.left = `${rect.left}px`;
      tooltip.style.bottom = `${window.innerHeight - rect.top + 20}px`;
      break;
    case 'bottom':
      tooltip.style.left = `${rect.left}px`;
      tooltip.style.top = `${rect.bottom + 20}px`;
      break;
  }

  document.body.appendChild(tooltip);
}

function nextTourStep() {
  // Clean up current step
  const step = tourSteps[tourStep];
  const element = document.querySelector(step.element);
  if (element) {
    element.style.boxShadow = '';
    element.style.zIndex = '';
  }

  // Move to next step
  tourStep++;
  showTourStep();
}

function skipTour() {
  // Clean up
  const existingTooltip = document.querySelector('.tour-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }

  // Remove highlights
  tourSteps.forEach(step => {
    const element = document.querySelector(step.element);
    if (element) {
      element.style.boxShadow = '';
      element.style.zIndex = '';
    }
  });
}

// Export functions for global use
window.startLearningJourney = startLearningJourney;
window.closeWelcome = closeWelcome;
window.startGuidedTour = startGuidedTour;
window.nextTourStep = nextTourStep;
window.skipTour = skipTour;
window.showQuickStartMenu = showQuickStartMenu;
window.startScenario = startScenario;
window.navigateToModule = navigateToModule;