// Layout Manager - Flexible and Responsive Layout Control

class LayoutManager {
  constructor() {
    this.currentLayout = 'default';
    this.sidebarCollapsed = false;
    this.learningPanelHidden = false;
    this.focusMode = false;

    // Load saved preferences
    this.loadPreferences();

    // Initialize layout
    this.init();
  }

  init() {
    // Add layout controls to the page
    this.addLayoutControls();

    // Add toggle buttons to sidebar and learning panel
    this.addToggleButtons();

    // Setup event listeners
    this.setupEventListeners();

    // Apply initial layout
    this.applyLayout();

    // Handle responsive behavior
    this.handleResponsive();
  }

  addLayoutControls() {
    const controlsHTML = `
      <div class="layout-controls">
        <button class="layout-btn" data-layout="default" title="Default Layout">
          <span>⊞</span>
          <span class="layout-btn-text">Default</span>
        </button>
        <button class="layout-btn" data-layout="focused" title="Hide Learning Panel">
          <span>⊡</span>
          <span class="layout-btn-text">Focused</span>
        </button>
        <button class="layout-btn" data-layout="fullscreen" title="Fullscreen Content">
          <span>⊠</span>
          <span class="layout-btn-text">Full</span>
        </button>
        <button class="layout-btn" id="focus-mode-btn" title="Focus Mode">
          <span>👁</span>
        </button>
      </div>
    `;

    // Only add if not on mobile
    if (window.innerWidth > 767) {
      document.body.insertAdjacentHTML('beforeend', controlsHTML);
    }

    // Add mobile menu button
    if (window.innerWidth <= 1023) {
      const mobileMenuHTML = `
        <button class="mobile-menu-btn" id="mobile-menu-btn">
          <span style="font-size: 1.5rem;">☰</span>
        </button>
        <div class="mobile-overlay" id="mobile-overlay"></div>
      `;
      document.body.insertAdjacentHTML('beforeend', mobileMenuHTML);
    }
  }

  addToggleButtons() {
    // Add sidebar toggle
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && window.innerWidth > 1023) {
      const toggleBtn = document.createElement('div');
      toggleBtn.className = 'sidebar-toggle';
      toggleBtn.innerHTML = '<span class="sidebar-toggle-icon">◀</span>';
      toggleBtn.addEventListener('click', () => this.toggleSidebar());
      sidebar.appendChild(toggleBtn);
    }

    // Add learning panel toggle
    const learningPanel = document.querySelector('.learning-panel');
    if (learningPanel && window.innerWidth > 1023) {
      const toggleBtn = document.createElement('div');
      toggleBtn.className = 'learning-panel-toggle';
      toggleBtn.innerHTML = '<span>💡</span>';
      toggleBtn.addEventListener('click', () => this.toggleLearningPanel());
      learningPanel.appendChild(toggleBtn);
    }

    // Add expand handle for mobile learning panel
    if (window.innerWidth <= 1023) {
      const learningPanel = document.querySelector('.learning-panel');
      if (learningPanel) {
        const expandHandle = document.createElement('div');
        expandHandle.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        expandHandle.innerHTML = '<div style="width: 40px; height: 4px; background: var(--border-default); border-radius: 2px;"></div>';
        expandHandle.addEventListener('click', () => {
          learningPanel.classList.toggle('expanded');
        });
        learningPanel.insertBefore(expandHandle, learningPanel.firstChild);
      }
    }
  }

  setupEventListeners() {
    // Layout button clicks
    document.querySelectorAll('.layout-btn[data-layout]').forEach(btn => {
      btn.addEventListener('click', () => {
        const layout = btn.getAttribute('data-layout');
        this.setLayout(layout);
      });
    });

    // Focus mode toggle
    const focusModeBtn = document.getElementById('focus-mode-btn');
    if (focusModeBtn) {
      focusModeBtn.addEventListener('click', () => this.toggleFocusMode());
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Mobile overlay click
    const mobileOverlay = document.getElementById('mobile-overlay');
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', () => this.closeMobileMenu());
    }

    // Window resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.handleResponsive(), 250);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Alt + 1/2/3 for layout switching
      if (e.altKey) {
        switch(e.key) {
          case '1':
            this.setLayout('default');
            break;
          case '2':
            this.setLayout('focused');
            break;
          case '3':
            this.setLayout('fullscreen');
            break;
          case 's':
            this.toggleSidebar();
            break;
          case 'l':
            this.toggleLearningPanel();
            break;
          case 'f':
            this.toggleFocusMode();
            break;
        }
      }
    });
  }

  setLayout(layout) {
    this.currentLayout = layout;
    this.applyLayout();
    this.savePreferences();

    // Update active button
    document.querySelectorAll('.layout-btn[data-layout]').forEach(btn => {
      if (btn.getAttribute('data-layout') === layout) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  applyLayout() {
    const mainGrid = document.querySelector('.main-grid');
    if (!mainGrid) return;

    // Remove all layout classes
    mainGrid.classList.remove('layout-default', 'layout-focused', 'layout-fullscreen', 'sidebar-collapsed');

    // Apply current layout
    mainGrid.classList.add(`layout-${this.currentLayout}`);

    // Apply sidebar state
    if (this.sidebarCollapsed) {
      mainGrid.classList.add('sidebar-collapsed');
      document.querySelector('.sidebar')?.classList.add('collapsed');
    } else {
      document.querySelector('.sidebar')?.classList.remove('collapsed');
    }

    // Apply learning panel state
    const learningPanel = document.querySelector('.learning-panel');
    if (learningPanel) {
      if (this.currentLayout === 'fullscreen' || this.learningPanelHidden) {
        learningPanel.classList.add('hidden');
      } else {
        learningPanel.classList.remove('hidden');
      }
    }

    // Apply focus mode
    if (this.focusMode) {
      document.body.classList.add('focus-mode');
    } else {
      document.body.classList.remove('focus-mode');
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.applyLayout();
    this.savePreferences();
  }

  toggleLearningPanel() {
    this.learningPanelHidden = !this.learningPanelHidden;
    this.applyLayout();
    this.savePreferences();
  }

  toggleFocusMode() {
    this.focusMode = !this.focusMode;
    this.applyLayout();

    const focusModeBtn = document.getElementById('focus-mode-btn');
    if (focusModeBtn) {
      if (this.focusMode) {
        focusModeBtn.classList.add('active');
        this.showNotification('Focus Mode Activated', 'Distractions minimized');
      } else {
        focusModeBtn.classList.remove('active');
        this.showNotification('Focus Mode Deactivated', 'Normal view restored');
      }
    }

    this.savePreferences();
  }

  toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobile-overlay');

    if (sidebar.classList.contains('open')) {
      this.closeMobileMenu();
    } else {
      sidebar.classList.add('open');
      overlay.classList.add('active');
    }
  }

  closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobile-overlay');

    sidebar?.classList.remove('open');
    overlay?.classList.remove('active');
  }

  handleResponsive() {
    const width = window.innerWidth;
    const mainGrid = document.querySelector('.main-grid');

    if (!mainGrid) return;

    // Add responsive classes
    mainGrid.classList.add('layout-transition');

    if (width <= 767) {
      // Mobile
      this.setLayout('fullscreen');
      this.hideDekstopControls();
    } else if (width <= 1023) {
      // Tablet
      if (this.currentLayout === 'default') {
        this.setLayout('focused');
      }
      this.hideDekstopControls();
    } else {
      // Desktop
      this.showDesktopControls();
    }

    // Remove transition class after animation
    setTimeout(() => {
      mainGrid.classList.remove('layout-transition');
    }, 300);
  }

  hideDekstopControls() {
    const controls = document.querySelector('.layout-controls');
    if (controls) controls.style.display = 'none';
  }

  showDesktopControls() {
    const controls = document.querySelector('.layout-controls');
    if (controls) controls.style.display = 'flex';
  }

  savePreferences() {
    const prefs = {
      layout: this.currentLayout,
      sidebarCollapsed: this.sidebarCollapsed,
      learningPanelHidden: this.learningPanelHidden,
      focusMode: this.focusMode
    };
    localStorage.setItem('layoutPreferences', JSON.stringify(prefs));
  }

  loadPreferences() {
    const saved = localStorage.getItem('layoutPreferences');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        this.currentLayout = prefs.layout || 'default';
        this.sidebarCollapsed = prefs.sidebarCollapsed || false;
        this.learningPanelHidden = prefs.learningPanelHidden || false;
        this.focusMode = prefs.focusMode || false;
      } catch (e) {
        console.error('Failed to load layout preferences:', e);
      }
    }
  }

  showNotification(title, message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: var(--bg-card);
      border: 2px solid var(--uipath-orange);
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      z-index: 10000;
      animation: slideDown 0.3s ease;
    `;
    notification.innerHTML = `
      <strong style="color: var(--uipath-orange);">${title}</strong><br>
      <span style="font-size: 0.9rem; color: var(--text-secondary);">${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

// Initialize layout manager when DOM is ready
let layoutManager;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    layoutManager = new LayoutManager();
  });
} else {
  // DOM is already loaded
  layoutManager = new LayoutManager();
}

// Export for global use
window.layoutManager = layoutManager;