/**
 * ITSM Console - Settings Module
 */

const SettingsModule = {
    // Default settings
    defaults: {
        defaultView: 'dashboard',
        emailNotifications: true,
        browserNotifications: true,
        autoRefresh: true,
        refreshInterval: 60,
        theme: 'classic'
    },

    // Load settings from localStorage
    load() {
        const saved = localStorage.getItem('itsm_settings');
        return saved ? JSON.parse(saved) : { ...this.defaults };
    },

    // Save settings to localStorage
    save(settings) {
        localStorage.setItem('itsm_settings', JSON.stringify(settings));
        Toast.success('Settings saved successfully');
    },

    // Render settings page
    render() {
        const settings = this.load();

        return `
            <div class="page-header">
                <div class="page-title">⚙️ Settings</div>
                <div class="page-subtitle">System Configuration</div>
            </div>
            <div class="page-content">
                <!-- User Preferences -->
                <div class="card">
                    <div class="card-header">User Preferences</div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">Default View</label>
                            <select class="form-control" style="width: 200px;" id="setting-default-view">
                                <option value="dashboard" ${settings.defaultView === 'dashboard' ? 'selected' : ''}>Dashboard</option>
                                <option value="my-tickets" ${settings.defaultView === 'my-tickets' ? 'selected' : ''}>My Tickets</option>
                                <option value="incidents" ${settings.defaultView === 'incidents' ? 'selected' : ''}>Incidents</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notifications</label>
                            <div class="form-check">
                                <input type="checkbox" id="setting-email-notif" ${settings.emailNotifications ? 'checked' : ''}>
                                <label for="setting-email-notif">Email notifications</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" id="setting-browser-notif" ${settings.browserNotifications ? 'checked' : ''}>
                                <label for="setting-browser-notif">Browser notifications</label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Auto Refresh</label>
                            <div class="form-check">
                                <input type="checkbox" id="setting-auto-refresh" ${settings.autoRefresh ? 'checked' : ''}>
                                <label for="setting-auto-refresh">Enable auto-refresh</label>
                            </div>
                            <div style="margin-top: var(--spacing-sm);">
                                <label class="form-label" style="display: inline;">Refresh interval:</label>
                                <select class="form-control" style="width: 120px; display: inline-block; margin-left: 8px;" id="setting-refresh-interval">
                                    <option value="30" ${settings.refreshInterval === 30 ? 'selected' : ''}>30 seconds</option>
                                    <option value="60" ${settings.refreshInterval === 60 ? 'selected' : ''}>1 minute</option>
                                    <option value="300" ${settings.refreshInterval === 300 ? 'selected' : ''}>5 minutes</option>
                                </select>
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="SettingsModule.saveUserPreferences()">💾 Save Preferences</button>
                    </div>
                </div>

                <!-- Category Management -->
                <div class="card">
                    <div class="card-header">
                        <span>Incident Categories</span>
                        <button class="btn btn-sm btn-secondary" onclick="SettingsModule.addCategory()">+ Add Category</button>
                    </div>
                    <div class="card-body">
                        <div id="categories-list">
                            ${this.renderCategories()}
                        </div>
                    </div>
                </div>

                <!-- SLA Configuration -->
                <div class="card">
                    <div class="card-header">SLA Configuration</div>
                    <div class="card-body">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Priority</th>
                                    <th>Response Time</th>
                                    <th>Resolution Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><span class="badge priority-p1">P1 - Critical</span></td>
                                    <td>15 minutes</td>
                                    <td>4 hours</td>
                                </tr>
                                <tr>
                                    <td><span class="badge priority-p2">P2 - High</span></td>
                                    <td>30 minutes</td>
                                    <td>8 hours</td>
                                </tr>
                                <tr>
                                    <td><span class="badge priority-p3">P3 - Medium</span></td>
                                    <td>2 hours</td>
                                    <td>24 hours</td>
                                </tr>
                                <tr>
                                    <td><span class="badge priority-p4">P4 - Low</span></td>
                                    <td>4 hours</td>
                                    <td>48 hours</td>
                                </tr>
                            </tbody>
                        </table>
                        <p style="font-size: 11px; color: var(--text-muted); margin-top: var(--spacing-sm);">
                            SLA configuration is managed by IT Service Management team.
                        </p>
                    </div>
                </div>

                <!-- Assignment Groups -->
                <div class="card">
                    <div class="card-header">Assignment Groups</div>
                    <div class="card-body">
                        <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-sm);">
                            ${['Service Desk', 'Network Team', 'Application Support', 'Server Team', 'Identity Team', 'Security Team', 'Database Team'].map(team => `
                                <span class="badge badge-new" style="padding: 6px 12px;">${team}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Demo Management -->
                <div class="card">
                    <div class="card-header">Demo Management</div>
                    <div class="card-body">
                        <p style="margin-bottom: var(--spacing-md);">
                            Reset the demo environment to its initial state. This will restore all incidents, changes, and other data.
                        </p>
                        <button class="btn btn-danger" onclick="SettingsModule.resetDemo()">🔄 Reset Demo Data</button>
                    </div>
                </div>
            </div>
        `;
    },

    // Categories data
    categories: {
        'Network': ['VPN', 'Firewall', 'DNS', 'Connectivity', 'Wireless'],
        'Application': ['CRM', 'ERP', 'Email Client', 'Browser', 'Office Suite'],
        'Hardware': ['Printer', 'Laptop', 'Desktop', 'Monitor', 'Peripheral'],
        'Email': ['Sync', 'Delivery', 'Calendar', 'Contacts', 'Spam'],
        'Infrastructure': ['Server', 'Storage', 'Database', 'Backup', 'Virtualization'],
        'Identity': ['Password', 'MFA', 'Account', 'Access', 'SSO']
    },

    renderCategories() {
        return Object.entries(this.categories).map(([cat, subs]) => `
            <div style="margin-bottom: var(--spacing-md); padding: var(--spacing-sm); background: var(--bg-secondary); border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-xs);">
                    <strong>${cat}</strong>
                    <button class="btn btn-sm btn-secondary" onclick="SettingsModule.editCategory('${cat}')">Edit</button>
                </div>
                <div style="font-size: 11px; color: var(--text-muted);">
                    ${subs.join(', ')}
                </div>
            </div>
        `).join('');
    },

    saveUserPreferences() {
        const settings = {
            defaultView: document.getElementById('setting-default-view').value,
            emailNotifications: document.getElementById('setting-email-notif').checked,
            browserNotifications: document.getElementById('setting-browser-notif').checked,
            autoRefresh: document.getElementById('setting-auto-refresh').checked,
            refreshInterval: parseInt(document.getElementById('setting-refresh-interval').value)
        };
        this.save(settings);
    },

    addCategory() {
        Modals.prompt(
            'Add Category',
            'Category Name',
            'Enter category name...',
            (name) => {
                if (name && !this.categories[name]) {
                    this.categories[name] = [];
                    document.getElementById('categories-list').innerHTML = this.renderCategories();
                    Toast.success(`Category "${name}" added`);
                }
            }
        );
    },

    editCategory(category) {
        const subs = this.categories[category] || [];
        Modals.show(`
            <div class="modal-header">
                <span>Edit Category: ${category}</span>
                <button class="panel-close" onclick="Modals.close()">×</button>
            </div>
            <div class="modal-body" style="width: 400px;">
                <div class="form-group">
                    <label class="form-label">Subcategories (one per line)</label>
                    <textarea class="form-control" id="edit-subcategories" rows="6">${subs.join('\n')}</textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="Modals.close()">Cancel</button>
                <button class="btn btn-primary" onclick="SettingsModule.saveCategory('${category}')">Save</button>
            </div>
        `);
    },

    saveCategory(category) {
        const textarea = document.getElementById('edit-subcategories');
        const subs = textarea.value.split('\n').map(s => s.trim()).filter(s => s);
        this.categories[category] = subs;
        document.getElementById('categories-list').innerHTML = this.renderCategories();
        Modals.close();
        Toast.success(`Category "${category}" updated`);
    },

    resetDemo() {
        Modals.confirm(
            'Reset Demo Data',
            'Are you sure you want to reset all demo data? This cannot be undone.',
            () => {
                Toast.info('Resetting demo data...');
                setTimeout(() => {
                    location.reload();
                }, 1000);
            },
            'Reset',
            'btn-danger'
        );
    },

    // Get subcategories for a category
    getSubcategories(category) {
        return this.categories[category] || [];
    }
};

window.SettingsModule = SettingsModule;
