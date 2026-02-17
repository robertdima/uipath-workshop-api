/**
 * ITSM Console - Changes Module
 * Handles all change request operations
 */

const ChangesModule = {
    // Current filter state
    currentFilters: {
        status: '',
        type: ''
    },

    /**
     * Generate the next change ID
     */
    getNextChangeId() {
        const existingIds = ITSMData.changes.map(c => parseInt(c.id.replace('CHG-', '')));
        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        return `CHG-${String(maxId + 1).padStart(3, '0')}`;
    },

    /**
     * Add an audit log entry
     */
    addAuditLog(action, target, details) {
        // No-op: audit logging is now handled server-side by the API
    },

    /**
     * Format datetime for display
     */
    formatDateTime(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    },

    /**
     * Format datetime for input fields
     */
    formatDateTimeForInput(dateStr) {
        if (!dateStr) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            return now.toISOString().slice(0, 16);
        }
        const date = new Date(dateStr);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    },

    /**
     * Get status badge class
     */
    getStatusBadgeClass(status) {
        const statusClasses = {
            'Draft': 'badge-new',
            'Pending Approval': 'badge-pending',
            'Approved': 'badge-open',
            'Scheduled': 'badge-in-progress',
            'Implementing': 'badge-in-progress',
            'Implemented': 'badge-resolved',
            'Cancelled': 'badge-closed',
            'Rejected': 'badge-critical',
            'Failed': 'badge-critical'
        };
        return statusClasses[status] || 'badge-new';
    },

    /**
     * Get risk badge class
     */
    getRiskBadgeClass(risk) {
        const riskClasses = {
            'Low': 'badge-resolved',
            'Medium': 'badge-open',
            'High': 'badge-critical'
        };
        return riskClasses[risk] || 'badge-new';
    },

    /**
     * Get type badge class
     */
    getTypeBadgeClass(type) {
        const typeClasses = {
            'Standard': 'badge-new',
            'Normal': 'badge-open',
            'Emergency': 'badge-critical'
        };
        return typeClasses[type] || 'badge-new';
    },

    /**
     * Render multi-select for assets
     */
    renderAssetMultiSelect(selectedAssets = []) {
        return `
            <div class="asset-multiselect" style="max-height: 150px; overflow-y: auto; border: 1px solid var(--border-color); padding: 8px; background: var(--bg-secondary);">
                ${ITSMData.assets.map(asset => `
                    <div class="form-check" style="margin-bottom: 4px;">
                        <input type="checkbox" id="asset-${asset.id}" value="${asset.id}"
                            class="asset-checkbox" ${selectedAssets.includes(asset.id) ? 'checked' : ''}>
                        <label for="asset-${asset.id}" style="cursor: pointer;">
                            ${asset.id} - ${asset.name} <span style="color: var(--text-muted);">(${asset.type})</span>
                        </label>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Get selected assets from checkboxes
     */
    getSelectedAssets() {
        const checkboxes = document.querySelectorAll('.asset-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    },

    /**
     * Render services dropdown for affected services
     */
    getServicesOptions() {
        const services = [
            'Email Services',
            'CRM Application',
            'ERP System',
            'VPN / Remote Access',
            'Active Directory',
            'File Services',
            'Print Services',
            'Web Applications',
            'Database Services',
            'Network Infrastructure',
            'Payment Gateway',
            'Customer Portal',
            'Internal Portal',
            'Backup Services',
            'Monitoring Systems'
        ];
        return services.map(s => `<option value="${s}">${s}</option>`).join('');
    },

    /**
     * Render category/subcategory options
     */
    getCategoryOptions() {
        return `
            <option value="">-- Select Category --</option>
            <option value="Application">Application</option>
            <option value="Hardware">Hardware</option>
            <option value="Network">Network</option>
            <option value="Security">Security</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Database">Database</option>
            <option value="Cloud">Cloud Services</option>
        `;
    },

    /**
     * Update subcategory options based on category
     */
    updateSubcategoryOptions() {
        const category = document.getElementById('chg-category')?.value;
        const subcategorySelect = document.getElementById('chg-subcategory');
        if (!subcategorySelect) return;

        const subcategories = {
            'Application': ['Deployment', 'Configuration', 'Upgrade', 'Patch', 'Integration'],
            'Hardware': ['Server', 'Workstation', 'Network Device', 'Storage', 'Peripheral'],
            'Network': ['Routing', 'Switching', 'Firewall', 'DNS', 'Load Balancer', 'VPN'],
            'Security': ['Access Control', 'Certificate', 'Encryption', 'Policy', 'Vulnerability Patch'],
            'Infrastructure': ['Virtual Machine', 'Container', 'Backup', 'Monitoring', 'Automation'],
            'Database': ['Schema Change', 'Migration', 'Optimization', 'Backup/Restore', 'Replication'],
            'Cloud': ['AWS', 'Azure', 'GCP', 'SaaS Configuration', 'Hybrid']
        };

        const options = subcategories[category] || [];
        subcategorySelect.innerHTML = '<option value="">-- Select Subcategory --</option>' +
            options.map(s => `<option value="${s}">${s}</option>`).join('');
    },

    /**
     * Populate requester details when customer is selected
     */
    populateRequesterDetails() {
        const requesterSelect = document.getElementById('chg-requested-by');
        if (!requesterSelect) return;

        const selectedOption = requesterSelect.options[requesterSelect.selectedIndex];
        const customerId = selectedOption.getAttribute('data-customer-id');
        const customer = ITSMData.customers.find(c => c.id === customerId);

        // Update detail fields
        const nameEl = document.getElementById('chg-requester-name');
        const emailEl = document.getElementById('chg-requester-email');
        const phoneEl = document.getElementById('chg-requester-phone');
        const deptEl = document.getElementById('chg-requester-dept');
        const vipBadge = document.getElementById('chg-vip-badge');

        if (customer) {
            if (nameEl) nameEl.value = customer.name;
            if (emailEl) emailEl.value = customer.email;
            if (phoneEl) phoneEl.value = customer.phone;
            if (deptEl) deptEl.value = customer.department;
            if (vipBadge) vipBadge.style.display = customer.vip ? 'inline-block' : 'none';
        } else {
            if (nameEl) nameEl.value = '';
            if (emailEl) emailEl.value = '';
            if (phoneEl) phoneEl.value = '';
            if (deptEl) deptEl.value = '';
            if (vipBadge) vipBadge.style.display = 'none';
        }
    },

    /**
     * Toggle outage duration field visibility
     */
    toggleOutageDuration() {
        const outageRequired = document.getElementById('chg-outage-required')?.checked;
        const durationField = document.getElementById('chg-outage-duration-group');
        if (durationField) {
            durationField.style.display = outageRequired ? 'block' : 'none';
        }
    },

    /**
     * Update assignee options based on selected team
     */
    updateAssigneeOptions() {
        const team = document.getElementById('chg-assignment-group')?.value;
        const assigneeSelect = document.getElementById('chg-assignee');
        if (!assigneeSelect) return;

        const teamData = ITSMData.teams.find(t => t.name === team);
        const technicians = teamData
            ? ITSMData.technicians.filter(t => teamData.members.includes(t.id))
            : [];

        assigneeSelect.innerHTML = '<option value="">-- Auto Assign --</option>' +
            technicians.map(t => `<option value="${t.email}">${t.name} (${t.workload} tickets)</option>`).join('');
    },

    /**
     * Create New Change - Show full modal form with comprehensive fields
     */
    createNewChange() {
        const now = new Date();
        const scheduledStart = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
        const scheduledEnd = new Date(scheduledStart.getTime() + 2 * 60 * 60 * 1000); // +2 hours

        showModal(`
            <div class="modal-header">
                <span><img class="modal-icon" src="icons/refresh.png" alt=""> Create New Change Request</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 750px; max-height: 75vh; overflow-y: auto;">

                <!-- Section 1: Requester Information -->
                <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div style="font-weight: 600; margin-bottom: var(--spacing-md); color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                        Requester Information
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                        <div class="form-group">
                            <label class="form-label required">Requested By</label>
                            <select class="form-control" id="chg-requested-by" onchange="ChangesModule.populateRequesterDetails()">
                                <option value="">-- Select Requester --</option>
                                ${ITSMData.customers.map(c => `
                                    <option value="${c.email}" data-customer-id="${c.id}">${c.name} (${c.department})</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Requester Name</label>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <input type="text" class="form-control" id="chg-requester-name" readonly placeholder="Auto-filled">
                                <span id="chg-vip-badge" class="badge badge-critical" style="display: none;">VIP</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" id="chg-requester-email" readonly placeholder="Auto-filled">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Phone</label>
                            <input type="text" class="form-control" id="chg-requester-phone" readonly placeholder="Auto-filled">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Department</label>
                            <input type="text" class="form-control" id="chg-requester-dept" readonly placeholder="Auto-filled">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Requested For</label>
                            <select class="form-control" id="chg-requested-for">
                                <option value="">-- Same as Requester --</option>
                                ${ITSMData.customers.map(c => `
                                    <option value="${c.email}">${c.name} (${c.department})</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Section 2: Change Details -->
                <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div style="font-weight: 600; margin-bottom: var(--spacing-md); color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                        Change Details
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Short Description</label>
                        <input type="text" class="form-control" id="chg-title" placeholder="Brief title for the change (max 100 chars)" maxlength="100">
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Description</label>
                        <textarea class="form-control" id="chg-description" rows="3" placeholder="Detailed description of what this change entails..."></textarea>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                        <div class="form-group">
                            <label class="form-label">Category</label>
                            <select class="form-control" id="chg-category" onchange="ChangesModule.updateSubcategoryOptions()">
                                ${this.getCategoryOptions()}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Subcategory</label>
                            <select class="form-control" id="chg-subcategory">
                                <option value="">-- Select Category First --</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Change Type</label>
                            <select class="form-control" id="chg-type" onchange="ChangesModule.onTypeChange()">
                                <option value="Standard">Standard (Pre-approved)</option>
                                <option value="Normal" selected>Normal (Requires CAB)</option>
                                <option value="Emergency">Emergency (Expedited)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Risk Level</label>
                            <select class="form-control" id="chg-risk" onchange="ChangesModule.onRiskChange()">
                                <option value="Low">Low</option>
                                <option value="Medium" selected>Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Section 3: Business Justification -->
                <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div style="font-weight: 600; margin-bottom: var(--spacing-md); color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                        Business Justification
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Business Justification</label>
                        <textarea class="form-control" id="chg-justification" rows="3" placeholder="Why is this change needed? What business problem does it solve?"></textarea>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                        <div class="form-group">
                            <label class="form-label">Related Incident/Problem</label>
                            <select class="form-control" id="chg-related-incident">
                                <option value="">-- None --</option>
                                ${ITSMData.incidents.map(inc => `
                                    <option value="${inc.id}">${inc.id}: ${inc.summary.substring(0, 50)}...</option>
                                `).join('')}
                                ${ITSMData.problems.map(prb => `
                                    <option value="${prb.id}">${prb.id}: ${prb.title.substring(0, 50)}...</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Policy Reference</label>
                            <select class="form-control" id="chg-policy">
                                <option value="">-- Select Policy --</option>
                                ${ITSMData.policies.map(policy => `
                                    <option value="${policy.id}">${policy.id}: ${policy.title}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Section 4: Impact Assessment -->
                <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div style="font-weight: 600; margin-bottom: var(--spacing-md); color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                        Impact Assessment
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                        <div class="form-group">
                            <label class="form-label">Impact</label>
                            <select class="form-control" id="chg-impact">
                                <option value="1">1 - High (Enterprise-wide)</option>
                                <option value="2" selected>2 - Medium (Department/Service)</option>
                                <option value="3">3 - Low (Individual/Limited)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Affected Users</label>
                            <select class="form-control" id="chg-affected-users">
                                <option value="all">All Users</option>
                                <option value="department">Specific Department</option>
                                <option value="team">Specific Team</option>
                                <option value="individual">Individual Users</option>
                                <option value="none" selected>No Direct User Impact</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Affected Services</label>
                        <select class="form-control" id="chg-affected-services" multiple size="4" style="height: auto;">
                            ${this.getServicesOptions()}
                        </select>
                        <small style="color: var(--text-muted);">Hold Ctrl/Cmd to select multiple services</small>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Affected Configuration Items</label>
                        ${this.renderAssetMultiSelect()}
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                        <div class="form-group">
                            <div class="form-check">
                                <input type="checkbox" id="chg-outage-required" onchange="ChangesModule.toggleOutageDuration()">
                                <label for="chg-outage-required">Service Outage Required</label>
                            </div>
                        </div>
                        <div class="form-group" id="chg-outage-duration-group" style="display: none;">
                            <label class="form-label">Estimated Outage Duration</label>
                            <select class="form-control" id="chg-outage-duration">
                                <option value="5">5 minutes</option>
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="60" selected>1 hour</option>
                                <option value="120">2 hours</option>
                                <option value="240">4 hours</option>
                                <option value="480">8 hours</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Section 5: Planning -->
                <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div style="font-weight: 600; margin-bottom: var(--spacing-md); color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                        Planning
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Implementation Plan</label>
                        <textarea class="form-control" id="chg-implementation-plan" rows="4" placeholder="Step-by-step implementation procedure...
1.
2.
3. "></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Test Plan</label>
                        <textarea class="form-control" id="chg-test-plan" rows="3" placeholder="How will you verify the change was successful?"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Backout/Rollback Plan</label>
                        <textarea class="form-control" id="chg-rollback" rows="3" placeholder="How to rollback this change if it fails..."></textarea>
                    </div>
                </div>

                <!-- Section 6: Schedule -->
                <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div style="font-weight: 600; margin-bottom: var(--spacing-md); color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                        Schedule
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--spacing-md);">
                        <div class="form-group">
                            <label class="form-label">Planned Start Date/Time</label>
                            <input type="datetime-local" class="form-control" id="chg-scheduled-start"
                                value="${this.formatDateTimeForInput(scheduledStart.toISOString())}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Planned End Date/Time</label>
                            <input type="datetime-local" class="form-control" id="chg-scheduled-end"
                                value="${this.formatDateTimeForInput(scheduledEnd.toISOString())}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Change Window</label>
                            <select class="form-control" id="chg-window">
                                <option value="maintenance">Maintenance Window (22:00-06:00)</option>
                                <option value="weekend">Weekend Window</option>
                                <option value="business">Business Hours (with approval)</option>
                                <option value="emergency">Emergency (Immediate)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Section 7: Assignment & Approval -->
                <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div style="font-weight: 600; margin-bottom: var(--spacing-md); color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                        Assignment & Approval
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                        <div class="form-group">
                            <label class="form-label">Assignment Group</label>
                            <select class="form-control" id="chg-assignment-group" onchange="ChangesModule.updateAssigneeOptions()">
                                <option value="">-- Select Team --</option>
                                ${ITSMData.teams.map(t => `<option value="${t.name}">${t.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Assigned To</label>
                            <select class="form-control" id="chg-assignee">
                                <option value="">-- Select Team First --</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Implementer</label>
                            <select class="form-control" id="chg-implementer">
                                <option value="">-- Same as Assigned To --</option>
                                ${ITSMData.technicians.map(t => `<option value="${t.email}">${t.name} (${t.team})</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <div class="form-check" style="margin-top: 28px;">
                                <input type="checkbox" id="chg-cab-required" checked>
                                <label for="chg-cab-required">CAB Approval Required</label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section 8: Communication -->
                <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div style="font-weight: 600; margin-bottom: var(--spacing-md); color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                        Communication Plan
                    </div>
                    <div class="form-group">
                        <label class="form-label">Notification Recipients</label>
                        <select class="form-control" id="chg-notify" multiple size="3" style="height: auto;">
                            <option value="affected-users">Affected Users</option>
                            <option value="service-owners">Service Owners</option>
                            <option value="management">Management</option>
                            <option value="helpdesk">Help Desk</option>
                            <option value="vendors">Vendors</option>
                        </select>
                        <small style="color: var(--text-muted);">Hold Ctrl/Cmd to select multiple groups</small>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Communication Notes</label>
                        <textarea class="form-control" id="chg-communication-notes" rows="2" placeholder="Special communication requirements or messages..."></textarea>
                    </div>
                </div>

            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="ChangesModule.submitNewChange()">Create Change Request</button>
            </div>
        `);
    },

    /**
     * Handle type change - auto-check CAB based on type
     */
    onTypeChange() {
        const type = document.getElementById('chg-type').value;
        const cabCheckbox = document.getElementById('chg-cab-required');

        if (type === 'Standard') {
            cabCheckbox.checked = false;
        } else {
            cabCheckbox.checked = true;
        }
    },

    /**
     * Handle risk dropdown change - auto-check CAB for High risk
     */
    onRiskChange() {
        const risk = document.getElementById('chg-risk').value;
        const cabCheckbox = document.getElementById('chg-cab-required');
        if (risk === 'High') {
            cabCheckbox.checked = true;
        }
    },

    /**
     * Submit new change request
     */
    async submitNewChange() {
        // Requester Information
        const requestedBy = document.getElementById('chg-requested-by').value;
        const requesterName = document.getElementById('chg-requester-name').value;
        const requesterEmail = document.getElementById('chg-requester-email').value;
        const requesterPhone = document.getElementById('chg-requester-phone').value;
        const requesterDept = document.getElementById('chg-requester-dept').value;
        const requestedFor = document.getElementById('chg-requested-for').value || requestedBy;

        // Change Details
        const title = document.getElementById('chg-title').value.trim();
        const description = document.getElementById('chg-description').value.trim();
        const category = document.getElementById('chg-category').value;
        const subcategory = document.getElementById('chg-subcategory').value;
        const type = document.getElementById('chg-type').value;
        const risk = document.getElementById('chg-risk').value;

        // Business Justification
        const justification = document.getElementById('chg-justification').value.trim();
        const relatedIncident = document.getElementById('chg-related-incident').value;
        const policyReference = document.getElementById('chg-policy').value;

        // Impact Assessment
        const impact = document.getElementById('chg-impact').value;
        const affectedUsers = document.getElementById('chg-affected-users').value;
        const affectedServicesEl = document.getElementById('chg-affected-services');
        const affectedServices = affectedServicesEl ? Array.from(affectedServicesEl.selectedOptions).map(o => o.value) : [];
        const affectedAssets = this.getSelectedAssets();
        const outageRequired = document.getElementById('chg-outage-required').checked;
        const outageDuration = outageRequired ? document.getElementById('chg-outage-duration').value : null;

        // Planning
        const implementationPlan = document.getElementById('chg-implementation-plan').value.trim();
        const testPlan = document.getElementById('chg-test-plan').value.trim();
        const rollbackPlan = document.getElementById('chg-rollback').value.trim();

        // Schedule
        const scheduledStart = document.getElementById('chg-scheduled-start').value;
        const scheduledEnd = document.getElementById('chg-scheduled-end').value;
        const changeWindow = document.getElementById('chg-window').value;

        // Assignment & Approval
        const assignmentGroup = document.getElementById('chg-assignment-group').value;
        const assignee = document.getElementById('chg-assignee').value;
        const implementer = document.getElementById('chg-implementer').value || assignee;
        const cabRequired = document.getElementById('chg-cab-required').checked;

        // Communication
        const notifyEl = document.getElementById('chg-notify');
        const notifyRecipients = notifyEl ? Array.from(notifyEl.selectedOptions).map(o => o.value) : [];
        const communicationNotes = document.getElementById('chg-communication-notes').value.trim();

        // Validation
        if (!requestedBy) {
            showToast('Requester is required', 'error');
            return;
        }
        if (!title) {
            showToast('Short Description is required', 'error');
            return;
        }
        if (!description) {
            showToast('Description is required', 'error');
            return;
        }
        if (!justification) {
            showToast('Business Justification is required', 'error');
            return;
        }
        if (!implementationPlan) {
            showToast('Implementation Plan is required', 'error');
            return;
        }
        if (!rollbackPlan) {
            showToast('Rollback Plan is required', 'error');
            return;
        }

        try {
            const result = await ITSMApi.createChange({
                title, description, type, risk,
                priority: type === 'Emergency' ? 'High' : 'Normal',
                category, subcategory,
                requestedBy, requesterName: requesterName, requesterEmail,
                requesterDept,
                requestedFor,
                assignedTo: assignmentGroup || 'Change Team',
                assignee: assignee || null,
                implementer: implementer || null,
                impact: parseInt(impact),
                affectedUsers, affectedServices, affectedAssets,
                outageRequired,
                outageDuration: outageDuration ? parseInt(outageDuration) : null,
                justification, implementationPlan, testPlan, rollbackPlan,
                relatedIncident: relatedIncident || null,
                scheduledStart: scheduledStart ? new Date(scheduledStart).toISOString() : null,
                scheduledEnd: scheduledEnd ? new Date(scheduledEnd).toISOString() : null,
                changeWindow,
                notifyRecipients, communicationNotes
            });

            if (result.success) {
                closeModal();
                showToast(`Change ${result.data.id} created successfully`, 'success');
                ITSMApi.computeDashboardStats();
                if (typeof currentModule !== 'undefined' && currentModule === 'changes') {
                    renderModule('changes');
                }
            } else {
                showToast(result.error || 'Failed to create change', 'error');
            }
        } catch (err) {
            showToast('Failed to create change: ' + err.message, 'error');
        }
    },

    /**
     * View Change - Show detailed modal with all information
     */
    viewChange(changeId) {
        const change = ITSMData.changes.find(c => c.id === changeId);
        if (!change) {
            showToast('Change not found', 'error');
            return;
        }

        const affectedAssetsList = change.affectedAssets && change.affectedAssets.length > 0
            ? change.affectedAssets.map(assetId => {
                const asset = ITSMData.assets.find(a => a.id === assetId);
                return asset ? `<span class="badge badge-new" style="margin-right: 4px;">${asset.id}</span>` : assetId;
            }).join('')
            : '<span style="color: var(--text-muted);">None specified</span>';

        const affectedServicesList = change.affectedServices && change.affectedServices.length > 0
            ? change.affectedServices.map(s => `<span class="badge badge-open" style="margin-right: 4px;">${s}</span>`).join('')
            : '<span style="color: var(--text-muted);">None specified</span>';

        // Find requester customer info if available
        const requester = ITSMData.customers.find(c => c.email === change.requestedBy);
        const isVip = requester?.vip || false;

        const actionButtons = this.getActionButtons(change);

        showModal(`
            <div class="modal-header">
                <span>${change.id}: ${change.title}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 750px; max-height: 75vh; overflow-y: auto;">
                <!-- Status Bar -->
                <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-md); margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div>
                        <strong>Status:</strong>
                        <span class="badge ${this.getStatusBadgeClass(change.status)}">${change.status}</span>
                    </div>
                    <div>
                        <strong>Type:</strong>
                        <span class="badge ${this.getTypeBadgeClass(change.type)}">${change.type}</span>
                    </div>
                    <div>
                        <strong>Risk:</strong>
                        <span class="badge ${this.getRiskBadgeClass(change.risk)}">${change.risk}</span>
                    </div>
                    ${change.category ? `<div><strong>Category:</strong> ${change.category}${change.subcategory ? ' / ' + change.subcategory : ''}</div>` : ''}
                    <div>
                        <strong>CAB:</strong>
                        ${change.cabRequired
                            ? (change.cabApproval
                                ? '<span style="color: var(--accent-green);">Approved ' + this.formatDateTime(change.cabApproval) + '</span>'
                                : '<span style="color: var(--accent-orange);">Pending Approval</span>')
                            : '<span style="color: var(--text-muted);">Not Required</span>'}
                    </div>
                </div>

                <!-- Requester Information -->
                <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div style="font-weight: 600; margin-bottom: var(--spacing-md); color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                        Requester Information ${isVip ? '<span class="badge badge-critical">VIP</span>' : ''}
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--spacing-md);">
                        <div class="form-group">
                            <label class="form-label">Requested By</label>
                            <input type="text" class="form-control" value="${change.requesterName || change.requestedBy}" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="text" class="form-control" value="${change.requesterEmail || change.requestedBy}" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Department</label>
                            <input type="text" class="form-control" value="${change.requesterDept || 'N/A'}" readonly>
                        </div>
                    </div>
                </div>

                <!-- Change Details -->
                <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div style="font-weight: 600; margin-bottom: var(--spacing-md); color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                        Change Details
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" rows="3" readonly>${change.description}</textarea>
                    </div>
                    ${change.justification ? `
                    <div class="form-group">
                        <label class="form-label">Business Justification</label>
                        <textarea class="form-control" rows="2" readonly>${change.justification}</textarea>
                    </div>
                    ` : ''}
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                        ${change.relatedIncident ? `
                        <div class="form-group">
                            <label class="form-label">Related Incident/Problem</label>
                            <input type="text" class="form-control" value="${change.relatedIncident}" readonly>
                        </div>
                        ` : ''}
                        ${change.policyReference ? `
                        <div class="form-group">
                            <label class="form-label">Policy Reference</label>
                            <input type="text" class="form-control" value="${change.policyReference}" readonly>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Impact Assessment -->
                <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div style="font-weight: 600; margin-bottom: var(--spacing-md); color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                        Impact Assessment
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                        <div class="form-group">
                            <label class="form-label">Impact Level</label>
                            <input type="text" class="form-control" value="${change.impact === 1 ? 'High (Enterprise-wide)' : change.impact === 2 ? 'Medium (Department/Service)' : change.impact === 3 ? 'Low (Individual/Limited)' : 'N/A'}" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Outage Required</label>
                            <input type="text" class="form-control" value="${change.outageRequired ? 'Yes - ' + (change.outageDuration || 0) + ' minutes' : 'No'}" readonly>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Affected Services</label>
                        <div style="padding: var(--spacing-sm); background: var(--bg-primary); border-radius: 4px;">
                            ${affectedServicesList}
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Affected Configuration Items</label>
                        <div style="padding: var(--spacing-sm); background: var(--bg-primary); border-radius: 4px;">
                            ${affectedAssetsList}
                        </div>
                    </div>
                </div>

                <!-- Planning -->
                <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div style="font-weight: 600; margin-bottom: var(--spacing-md); color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                        Planning
                    </div>
                    ${change.implementationPlan ? `
                    <div class="form-group">
                        <label class="form-label">Implementation Plan</label>
                        <textarea class="form-control" rows="3" readonly>${change.implementationPlan}</textarea>
                    </div>
                    ` : ''}
                    ${change.testPlan ? `
                    <div class="form-group">
                        <label class="form-label">Test Plan</label>
                        <textarea class="form-control" rows="2" readonly>${change.testPlan}</textarea>
                    </div>
                    ` : ''}
                    <div class="form-group">
                        <label class="form-label">Rollback Plan</label>
                        <textarea class="form-control" rows="2" readonly>${change.rollbackPlan || 'No rollback plan specified'}</textarea>
                    </div>
                </div>

                <!-- Schedule -->
                <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div style="font-weight: 600; margin-bottom: var(--spacing-md); color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                        Schedule
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--spacing-md);">
                        <div class="form-group">
                            <label class="form-label">Scheduled Start</label>
                            <input type="text" class="form-control" value="${this.formatDateTime(change.scheduledStart)}" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Scheduled End</label>
                            <input type="text" class="form-control" value="${this.formatDateTime(change.scheduledEnd)}" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Change Window</label>
                            <input type="text" class="form-control" value="${change.changeWindow || 'Standard'}" readonly>
                        </div>
                        ${change.actualStart ? `
                        <div class="form-group">
                            <label class="form-label">Actual Start</label>
                            <input type="text" class="form-control" value="${this.formatDateTime(change.actualStart)}" readonly>
                        </div>
                        ` : ''}
                        ${change.actualEnd ? `
                        <div class="form-group">
                            <label class="form-label">Actual End</label>
                            <input type="text" class="form-control" value="${this.formatDateTime(change.actualEnd)}" readonly>
                        </div>
                        ` : ''}
                        <div class="form-group">
                            <label class="form-label">Created</label>
                            <input type="text" class="form-control" value="${this.formatDateTime(change.createdAt)}" readonly>
                        </div>
                    </div>
                </div>

                <!-- Assignment -->
                <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div style="font-weight: 600; margin-bottom: var(--spacing-md); color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                        Assignment
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--spacing-md);">
                        <div class="form-group">
                            <label class="form-label">Assignment Group</label>
                            <input type="text" class="form-control" value="${change.assignedTo}" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Assigned To</label>
                            <input type="text" class="form-control" value="${change.assignee || 'Unassigned'}" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Implementer</label>
                            <input type="text" class="form-control" value="${change.implementer || change.assignee || 'TBD'}" readonly>
                        </div>
                    </div>
                </div>

                <!-- Notes/History Section -->
                <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div style="font-weight: 600; margin-bottom: var(--spacing-md); color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                        Notes / History
                    </div>
                    <div style="max-height: 150px; overflow-y: auto; border: 1px solid var(--border-color); padding: var(--spacing-sm); background: var(--bg-primary);">
                        ${change.notes && change.notes.length > 0
                            ? change.notes.map(note => `
                                <div class="activity-item" style="padding: 6px; margin-bottom: 6px; border-bottom: 1px solid var(--border-light);">
                                    <div style="font-size: 11px; color: var(--text-muted);">
                                        ${this.formatDateTime(note.timestamp)} - ${note.author}
                                    </div>
                                    <div>${note.content}</div>
                                </div>
                            `).join('')
                            : '<div style="color: var(--text-muted);">No notes recorded</div>'}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                ${actionButtons}
            </div>
        `);
    },

    /**
     * Get action buttons based on change status
     */
    getActionButtons(change) {
        const buttons = [];

        switch (change.status) {
            case 'Pending Approval':
                buttons.push(`<button class="btn btn-success" onclick="ChangesModule.approveChange('${change.id}')">Approve</button>`);
                buttons.push(`<button class="btn btn-danger" onclick="ChangesModule.rejectChange('${change.id}')">Reject</button>`);
                break;
            case 'Approved':
            case 'Scheduled':
                buttons.push(`<button class="btn btn-primary" onclick="ChangesModule.implementChange('${change.id}')">Implement</button>`);
                buttons.push(`<button class="btn btn-warning" onclick="ChangesModule.cancelChange('${change.id}')">Cancel</button>`);
                break;
            case 'Implementing':
                buttons.push(`<button class="btn btn-success" onclick="ChangesModule.completeImplementation('${change.id}')">Complete</button>`);
                buttons.push(`<button class="btn btn-danger" onclick="ChangesModule.failImplementation('${change.id}')">Mark Failed</button>`);
                break;
            case 'Draft':
                buttons.push(`<button class="btn btn-primary" onclick="ChangesModule.submitForApproval('${change.id}')">Submit for Approval</button>`);
                buttons.push(`<button class="btn btn-warning" onclick="ChangesModule.cancelChange('${change.id}')">Cancel</button>`);
                break;
        }

        return buttons.join(' ');
    },

    /**
     * Approve Change - Show confirmation modal with approver notes
     */
    approveChange(changeId) {
        const change = ITSMData.changes.find(c => c.id === changeId);
        if (!change) {
            showToast('Change not found', 'error');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>Approve Change: ${changeId}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 450px;">
                <div style="padding: var(--spacing-md); background: var(--bg-secondary); margin-bottom: var(--spacing-md); border-radius: 4px;">
                    <strong>${change.title}</strong>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                        Type: ${change.type} | Risk: ${change.risk}
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Approver Notes (Optional)</label>
                    <textarea class="form-control" id="approve-notes" rows="3" placeholder="Add any notes or conditions for this approval..."></textarea>
                </div>
                <div style="padding: var(--spacing-sm); background: rgba(var(--green-rgb), 0.1); border: 1px solid var(--accent-green); border-radius: 4px;">
                    <strong style="color: var(--accent-green);">Approval Confirmation</strong>
                    <p style="margin: 4px 0 0 0; font-size: 12px;">
                        By approving this change, you confirm that it has been reviewed and meets all necessary requirements.
                    </p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="ChangesModule.viewChange('${changeId}')">Back</button>
                <button class="btn btn-success" onclick="ChangesModule.confirmApproval('${changeId}')">Confirm Approval</button>
            </div>
        `);
    },

    /**
     * Confirm approval
     */
    async confirmApproval(changeId) {
        const notes = document.getElementById('approve-notes').value.trim();
        try {
            const result = await ITSMApi.approveChange(changeId, ITSMData.currentUser.name, notes);
            if (result.success) {
                closeModal();
                showToast(`Change ${changeId} has been approved`, 'success');
                ITSMApi.computeDashboardStats();
                if (typeof currentModule !== 'undefined' && currentModule === 'changes') {
                    renderModule('changes');
                }
            } else {
                showToast(result.error || 'Failed to approve change', 'error');
            }
        } catch (err) {
            showToast('Failed to approve change: ' + err.message, 'error');
        }
    },

    /**
     * Reject Change - Show modal for rejection reason
     */
    rejectChange(changeId) {
        const change = ITSMData.changes.find(c => c.id === changeId);
        if (!change) {
            showToast('Change not found', 'error');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>Reject Change: ${changeId}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 450px;">
                <div style="padding: var(--spacing-md); background: var(--bg-secondary); margin-bottom: var(--spacing-md); border-radius: 4px;">
                    <strong>${change.title}</strong>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                        Type: ${change.type} | Risk: ${change.risk}
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label required">Rejection Reason</label>
                    <textarea class="form-control" id="reject-reason" rows="4" placeholder="Please provide the reason for rejecting this change..."></textarea>
                </div>
                <div style="padding: var(--spacing-sm); background: rgba(var(--red-rgb), 0.1); border: 1px solid var(--accent-red); border-radius: 4px;">
                    <strong style="color: var(--accent-red);">Warning</strong>
                    <p style="margin: 4px 0 0 0; font-size: 12px;">
                        Rejecting this change will notify the requestor and close the change request.
                    </p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="ChangesModule.viewChange('${changeId}')">Back</button>
                <button class="btn btn-danger" onclick="ChangesModule.confirmRejection('${changeId}')">Confirm Rejection</button>
            </div>
        `);
    },

    /**
     * Confirm rejection
     */
    async confirmRejection(changeId) {
        const reason = document.getElementById('reject-reason').value.trim();
        if (!reason) {
            showToast('Rejection reason is required', 'error');
            return;
        }
        try {
            const result = await ITSMApi.rejectChange(changeId, reason, ITSMData.currentUser.name);
            if (result.success) {
                closeModal();
                showToast(`Change ${changeId} has been rejected`, 'warning');
                ITSMApi.computeDashboardStats();
                if (typeof currentModule !== 'undefined' && currentModule === 'changes') {
                    renderModule('changes');
                }
            } else {
                showToast(result.error || 'Failed to reject change', 'error');
            }
        } catch (err) {
            showToast('Failed to reject change: ' + err.message, 'error');
        }
    },

    /**
     * Implement Change - Show implementation confirmation
     */
    implementChange(changeId) {
        const change = ITSMData.changes.find(c => c.id === changeId);
        if (!change) {
            showToast('Change not found', 'error');
            return;
        }

        const now = new Date();

        showModal(`
            <div class="modal-header">
                <span>Implement Change: ${changeId}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 500px;">
                <div style="padding: var(--spacing-md); background: var(--bg-secondary); margin-bottom: var(--spacing-md); border-radius: 4px;">
                    <strong>${change.title}</strong>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                        Scheduled: ${this.formatDateTime(change.scheduledStart)} - ${this.formatDateTime(change.scheduledEnd)}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <div class="form-group">
                        <label class="form-label">Actual Start Time</label>
                        <input type="datetime-local" class="form-control" id="impl-start"
                            value="${this.formatDateTimeForInput(now.toISOString())}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Expected End Time</label>
                        <input type="datetime-local" class="form-control" id="impl-end"
                            value="${this.formatDateTimeForInput(new Date(now.getTime() + 60 * 60 * 1000).toISOString())}">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Implementation Notes</label>
                    <textarea class="form-control" id="impl-notes" rows="3" placeholder="Add any notes about starting the implementation..."></textarea>
                </div>

                <div style="padding: var(--spacing-sm); background: rgba(var(--blue-rgb), 0.1); border: 1px solid var(--accent-blue); border-radius: 4px;">
                    <strong style="color: var(--accent-blue);">Implementation Checklist</strong>
                    <div style="margin-top: 8px; font-size: 12px;">
                        <div class="form-check"><input type="checkbox" id="check-backup"> <label for="check-backup">Backup completed</label></div>
                        <div class="form-check"><input type="checkbox" id="check-rollback"> <label for="check-rollback">Rollback plan ready</label></div>
                        <div class="form-check"><input type="checkbox" id="check-notify"> <label for="check-notify">Stakeholders notified</label></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="ChangesModule.viewChange('${changeId}')">Back</button>
                <button class="btn btn-primary" onclick="ChangesModule.startImplementation('${changeId}')">Start Implementation</button>
            </div>
        `);
    },

    /**
     * Start implementation
     */
    async startImplementation(changeId) {
        try {
            // First need to transition to Scheduled if currently Approved
            const change = ITSMData.changes.find(c => c.id === changeId);
            if (change && change.status === 'Approved') {
                await ITSMApi.updateChangeStatus(changeId, 'Scheduled');
            }
            const result = await ITSMApi.implementChange(changeId);
            if (result.success) {
                closeModal();
                showToast(`Implementation of ${changeId} has started`, 'success');
                if (typeof currentModule !== 'undefined' && currentModule === 'changes') {
                    renderModule('changes');
                }
            } else {
                showToast(result.error || 'Failed to start implementation', 'error');
            }
        } catch (err) {
            showToast('Failed to start implementation: ' + err.message, 'error');
        }
    },

    /**
     * Complete implementation
     */
    async completeImplementation(changeId) {
        try {
            const result = await ITSMApi.completeChange(changeId, true);
            if (result.success) {
                closeModal();
                showToast(`Change ${changeId} has been implemented successfully`, 'success');
                if (typeof currentModule !== 'undefined' && currentModule === 'changes') {
                    renderModule('changes');
                }
            } else {
                showToast(result.error || 'Failed to complete implementation', 'error');
            }
        } catch (err) {
            showToast('Failed to complete implementation: ' + err.message, 'error');
        }
    },

    /**
     * Mark implementation as failed
     */
    failImplementation(changeId) {
        const change = ITSMData.changes.find(c => c.id === changeId);
        if (!change) {
            showToast('Change not found', 'error');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>Mark Implementation Failed: ${changeId}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 450px;">
                <div class="form-group">
                    <label class="form-label required">Failure Reason</label>
                    <textarea class="form-control" id="fail-reason" rows="4" placeholder="Describe what went wrong during implementation..."></textarea>
                </div>
                <div class="form-group">
                    <div class="form-check">
                        <input type="checkbox" id="fail-rollback" checked>
                        <label for="fail-rollback">Rollback was performed</label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="ChangesModule.viewChange('${changeId}')">Back</button>
                <button class="btn btn-danger" onclick="ChangesModule.confirmFailure('${changeId}')">Confirm Failure</button>
            </div>
        `);
    },

    /**
     * Confirm implementation failure
     */
    async confirmFailure(changeId) {
        const reason = document.getElementById('fail-reason').value.trim();
        const rollbackPerformed = document.getElementById('fail-rollback').checked;

        if (!reason) {
            showToast('Failure reason is required', 'error');
            return;
        }

        try {
            const fullReason = `${reason}. Rollback ${rollbackPerformed ? 'was' : 'was NOT'} performed.`;
            const result = await ITSMApi.completeChange(changeId, false, fullReason);
            if (result.success) {
                closeModal();
                showToast(`Change ${changeId} marked as failed`, 'error');
                if (typeof currentModule !== 'undefined' && currentModule === 'changes') {
                    renderModule('changes');
                }
            } else {
                showToast(result.error || 'Failed to mark as failed', 'error');
            }
        } catch (err) {
            showToast('Failed to mark as failed: ' + err.message, 'error');
        }
    },

    /**
     * Cancel Change - Show cancellation reason modal
     */
    cancelChange(changeId) {
        const change = ITSMData.changes.find(c => c.id === changeId);
        if (!change) {
            showToast('Change not found', 'error');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>Cancel Change: ${changeId}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 450px;">
                <div style="padding: var(--spacing-md); background: var(--bg-secondary); margin-bottom: var(--spacing-md); border-radius: 4px;">
                    <strong>${change.title}</strong>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                        Current Status: ${change.status}
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label required">Cancellation Reason</label>
                    <textarea class="form-control" id="cancel-reason" rows="4" placeholder="Please provide the reason for cancelling this change..."></textarea>
                </div>
                <div style="padding: var(--spacing-sm); background: rgba(var(--orange-rgb), 0.1); border: 1px solid var(--accent-orange); border-radius: 4px;">
                    <strong style="color: var(--accent-orange);">Note</strong>
                    <p style="margin: 4px 0 0 0; font-size: 12px;">
                        Cancelling this change will notify all stakeholders and update the change calendar.
                    </p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="ChangesModule.viewChange('${changeId}')">Back</button>
                <button class="btn btn-warning" onclick="ChangesModule.confirmCancellation('${changeId}')">Confirm Cancellation</button>
            </div>
        `);
    },

    /**
     * Confirm cancellation
     */
    async confirmCancellation(changeId) {
        const reason = document.getElementById('cancel-reason').value.trim();
        if (!reason) {
            showToast('Cancellation reason is required', 'error');
            return;
        }

        try {
            const result = await ITSMApi.updateChangeStatus(changeId, 'Cancelled');
            if (result.success) {
                closeModal();
                showToast(`Change ${changeId} has been cancelled`, 'warning');
                if (typeof currentModule !== 'undefined' && currentModule === 'changes') {
                    renderModule('changes');
                }
            } else {
                showToast(result.error || 'Failed to cancel change', 'error');
            }
        } catch (err) {
            showToast('Failed to cancel change: ' + err.message, 'error');
        }
    },

    /**
     * Submit for approval (from Draft status)
     */
    async submitForApproval(changeId) {
        try {
            const result = await ITSMApi.updateChangeStatus(changeId, 'Pending Approval');
            if (result.success) {
                closeModal();
                showToast(`Change ${changeId} submitted for approval`, 'success');
                if (typeof currentModule !== 'undefined' && currentModule === 'changes') {
                    renderModule('changes');
                }
            } else {
                showToast(result.error || 'Failed to submit for approval', 'error');
            }
        } catch (err) {
            showToast('Failed to submit for approval: ' + err.message, 'error');
        }
    },

    /**
     * Render Changes Table - Return HTML for the changes table
     */
    renderChangesTable() {
        const filteredChanges = this.getFilteredChanges();

        if (filteredChanges.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">🔄</div>
                    <div class="empty-state-title">No Changes Found</div>
                    <div class="empty-state-text">No changes match the current filter criteria</div>
                </div>
            `;
        }

        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Risk</th>
                        <th>Status</th>
                        <th>Scheduled</th>
                        <th>CAB Required</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredChanges.map(chg => `
                        <tr>
                            <td class="cell-id">${chg.id}</td>
                            <td>${chg.title}</td>
                            <td><span class="badge ${this.getTypeBadgeClass(chg.type)}">${chg.type}</span></td>
                            <td><span class="badge ${this.getRiskBadgeClass(chg.risk)}">${chg.risk}</span></td>
                            <td><span class="badge ${this.getStatusBadgeClass(chg.status)}">${chg.status}</span></td>
                            <td class="cell-date">${this.formatDateTime(chg.scheduledStart)}</td>
                            <td>${chg.cabRequired ? (chg.cabApproval ? '<span style="color: var(--accent-green);">Approved</span>' : '<span style="color: var(--accent-orange);">Pending</span>') : 'No'}</td>
                            <td class="cell-actions">
                                <button class="btn btn-sm btn-secondary" onclick="ChangesModule.viewChange('${chg.id}')">View</button>
                                ${chg.status === 'Pending Approval' ? `<button class="btn btn-sm btn-success" onclick="ChangesModule.approveChange('${chg.id}')">Approve</button>` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    /**
     * Get filtered changes based on current filters
     */
    getFilteredChanges() {
        return ITSMData.changes.filter(chg => {
            const matchStatus = !this.currentFilters.status || chg.status === this.currentFilters.status;
            const matchType = !this.currentFilters.type || chg.type === this.currentFilters.type;
            return matchStatus && matchType;
        });
    },

    /**
     * Filter Changes - Filter changes list by status and type
     */
    filterChanges(status, type) {
        this.currentFilters.status = status || '';
        this.currentFilters.type = type || '';

        const tableContainer = document.getElementById('changes-table-container');
        if (tableContainer) {
            tableContainer.innerHTML = this.renderChangesTable();
        }
    },

    /**
     * Setup filter event listeners
     */
    setupFilterListeners() {
        const statusFilter = document.getElementById('filter-change-status');
        const typeFilter = document.getElementById('filter-change-type');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filterChanges(statusFilter.value, typeFilter?.value || '');
            });
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', () => {
                this.filterChanges(statusFilter?.value || '', typeFilter.value);
            });
        }
    }
};

// Make module available globally
window.ChangesModule = ChangesModule;

// Override the existing createNewChange and viewChange functions in app.js
window.createNewChange = function() {
    ChangesModule.createNewChange();
};

window.viewChange = function(changeId) {
    ChangesModule.viewChange(changeId);
};

// Override renderChanges to use the module
window.renderChangesWithModule = function() {
    return `
        <div class="page-header">
            <div class="page-title"><img class="page-icon" src="icons/refresh.png" alt=""> Change Requests</div>
            <div class="page-subtitle">Manage change requests and approvals</div>
        </div>
        <div class="toolbar">
            <button class="btn btn-primary btn-sm" onclick="ChangesModule.createNewChange()">+ New Change Request</button>
            <div class="toolbar-separator"></div>
            <div class="toolbar-group">
                <select class="form-control" style="width: 150px; padding: 4px;" id="filter-change-status">
                    <option value="">All Status</option>
                    <option value="Draft">Draft</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Implementing">Implementing</option>
                    <option value="Implemented">Implemented</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Failed">Failed</option>
                </select>
                <select class="form-control" style="width: 120px; padding: 4px;" id="filter-change-type">
                    <option value="">All Types</option>
                    <option value="Standard">Standard</option>
                    <option value="Normal">Normal</option>
                    <option value="Emergency">Emergency</option>
                </select>
            </div>
        </div>
        <div class="page-content">
            <div class="table-container" id="changes-table-container">
                ${ChangesModule.renderChangesTable()}
            </div>
        </div>
    `;
};
