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
        const entry = {
            timestamp: new Date().toISOString(),
            actor: ITSMData.currentUser.username,
            action: action,
            target: target,
            details: details
        };
        ITSMData.auditLog.unshift(entry);
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
     * Create New Change - Show full modal form
     */
    createNewChange() {
        const now = new Date();
        const scheduledStart = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
        const scheduledEnd = new Date(scheduledStart.getTime() + 2 * 60 * 60 * 1000); // +2 hours

        showModal(`
            <div class="modal-header">
                <span>+ Create New Change Request</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 600px; max-height: 70vh; overflow-y: auto;">
                <div class="form-group">
                    <label class="form-label required">Title</label>
                    <input type="text" class="form-control" id="chg-title" placeholder="Brief title for the change">
                </div>
                <div class="form-group">
                    <label class="form-label required">Description</label>
                    <textarea class="form-control" id="chg-description" rows="3" placeholder="Detailed description of the change..."></textarea>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <div class="form-group">
                        <label class="form-label">Type</label>
                        <select class="form-control" id="chg-type">
                            <option value="Standard">Standard</option>
                            <option value="Normal">Normal</option>
                            <option value="Emergency">Emergency</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Risk</label>
                        <select class="form-control" id="chg-risk" onchange="ChangesModule.onRiskChange()">
                            <option value="Low">Low</option>
                            <option value="Medium" selected>Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Affected Assets</label>
                    ${this.renderAssetMultiSelect()}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <div class="form-group">
                        <label class="form-label">Scheduled Start</label>
                        <input type="datetime-local" class="form-control" id="chg-scheduled-start"
                            value="${this.formatDateTimeForInput(scheduledStart.toISOString())}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Scheduled End</label>
                        <input type="datetime-local" class="form-control" id="chg-scheduled-end"
                            value="${this.formatDateTimeForInput(scheduledEnd.toISOString())}">
                    </div>
                </div>
                <div class="form-group">
                    <div class="form-check">
                        <input type="checkbox" id="chg-cab-required">
                        <label for="chg-cab-required">CAB Approval Required</label>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Rollback Plan</label>
                    <textarea class="form-control" id="chg-rollback" rows="3" placeholder="Describe how to rollback this change if it fails..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Policy Reference (Optional)</label>
                    <select class="form-control" id="chg-policy">
                        <option value="">-- Select Policy --</option>
                        ${ITSMData.policies.map(policy => `
                            <option value="${policy.id}">${policy.id}: ${policy.title}</option>
                        `).join('')}
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="ChangesModule.submitNewChange()">Create Change Request</button>
            </div>
        `);
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
    submitNewChange() {
        const title = document.getElementById('chg-title').value.trim();
        const description = document.getElementById('chg-description').value.trim();
        const type = document.getElementById('chg-type').value;
        const risk = document.getElementById('chg-risk').value;
        const affectedAssets = this.getSelectedAssets();
        const scheduledStart = document.getElementById('chg-scheduled-start').value;
        const scheduledEnd = document.getElementById('chg-scheduled-end').value;
        const cabRequired = document.getElementById('chg-cab-required').checked;
        const rollbackPlan = document.getElementById('chg-rollback').value.trim();
        const policyReference = document.getElementById('chg-policy').value;

        // Validation
        if (!title) {
            showToast('Title is required', 'error');
            return;
        }
        if (!description) {
            showToast('Description is required', 'error');
            return;
        }

        const newId = this.getNextChangeId();
        const newChange = {
            id: newId,
            title: title,
            description: description,
            type: type,
            status: cabRequired ? 'Pending Approval' : 'Scheduled',
            risk: risk,
            priority: type === 'Emergency' ? 'High' : 'Normal',
            requestedBy: ITSMData.currentUser.username,
            assignedTo: 'Change Team',
            affectedAssets: affectedAssets,
            scheduledStart: scheduledStart ? new Date(scheduledStart).toISOString() : null,
            scheduledEnd: scheduledEnd ? new Date(scheduledEnd).toISOString() : null,
            actualStart: null,
            actualEnd: null,
            cabRequired: cabRequired,
            cabApproval: null,
            rollbackPlan: rollbackPlan,
            policyReference: policyReference || null,
            createdAt: new Date().toISOString(),
            notes: []
        };

        ITSMData.changes.unshift(newChange);

        this.addAuditLog('Change Created', newId, `New ${type} change request created: ${title}`);

        // Update dashboard stats
        if (ITSMData.dashboardStats && ITSMData.dashboardStats.changes) {
            ITSMData.dashboardStats.changes.total++;
            if (cabRequired) {
                ITSMData.dashboardStats.changes.pending++;
            } else {
                ITSMData.dashboardStats.changes.scheduled++;
            }
        }

        closeModal();
        showToast(`Change ${newId} created successfully`, 'success');

        // Refresh the changes view if currently displayed
        if (typeof currentModule !== 'undefined' && currentModule === 'changes') {
            renderModule('changes');
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

        const actionButtons = this.getActionButtons(change);

        showModal(`
            <div class="modal-header">
                <span>${change.id}: ${change.title}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 700px; max-height: 75vh; overflow-y: auto;">
                <!-- Status Bar -->
                <div style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
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
                    <div>
                        <strong>CAB:</strong>
                        ${change.cabRequired
                            ? (change.cabApproval
                                ? '<span style="color: var(--accent-green);">Approved ' + this.formatDateTime(change.cabApproval) + '</span>'
                                : '<span style="color: var(--accent-orange);">Pending Approval</span>')
                            : '<span style="color: var(--text-muted);">Not Required</span>'}
                    </div>
                </div>

                <!-- Details Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <div class="form-group">
                        <label class="form-label">Requested By</label>
                        <input type="text" class="form-control" value="${change.requestedBy}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Assigned To</label>
                        <input type="text" class="form-control" value="${change.assignedTo}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Scheduled Start</label>
                        <input type="text" class="form-control" value="${this.formatDateTime(change.scheduledStart)}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Scheduled End</label>
                        <input type="text" class="form-control" value="${this.formatDateTime(change.scheduledEnd)}" readonly>
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
                    ${change.policyReference ? `
                    <div class="form-group">
                        <label class="form-label">Policy Reference</label>
                        <input type="text" class="form-control" value="${change.policyReference}" readonly>
                    </div>
                    ` : ''}
                </div>

                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" rows="3" readonly>${change.description}</textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Affected Assets</label>
                    <div style="padding: var(--spacing-sm); background: var(--bg-secondary); border-radius: 4px;">
                        ${affectedAssetsList}
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Rollback Plan</label>
                    <textarea class="form-control" rows="3" readonly>${change.rollbackPlan || 'No rollback plan specified'}</textarea>
                </div>

                <!-- Notes/History Section -->
                <div class="form-group">
                    <label class="form-label">Notes / History</label>
                    <div style="max-height: 150px; overflow-y: auto; border: 1px solid var(--border-color); padding: var(--spacing-sm); background: var(--bg-secondary);">
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
    confirmApproval(changeId) {
        const change = ITSMData.changes.find(c => c.id === changeId);
        if (!change) {
            showToast('Change not found', 'error');
            return;
        }

        const notes = document.getElementById('approve-notes').value.trim();
        const now = new Date().toISOString();

        change.cabApproval = now;
        change.status = 'Scheduled';

        // Add note
        if (!change.notes) change.notes = [];
        change.notes.unshift({
            timestamp: now,
            author: ITSMData.currentUser.username,
            content: `Change approved by CAB.${notes ? ' Notes: ' + notes : ''}`
        });

        this.addAuditLog('Change Approved', changeId, `Change approved by ${ITSMData.currentUser.username}`);

        // Update dashboard stats
        if (ITSMData.dashboardStats && ITSMData.dashboardStats.changes) {
            if (ITSMData.dashboardStats.changes.pending > 0) {
                ITSMData.dashboardStats.changes.pending--;
            }
            ITSMData.dashboardStats.changes.scheduled++;
        }

        closeModal();
        showToast(`Change ${changeId} has been approved`, 'success');

        if (typeof currentModule !== 'undefined' && currentModule === 'changes') {
            renderModule('changes');
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
    confirmRejection(changeId) {
        const change = ITSMData.changes.find(c => c.id === changeId);
        if (!change) {
            showToast('Change not found', 'error');
            return;
        }

        const reason = document.getElementById('reject-reason').value.trim();
        if (!reason) {
            showToast('Rejection reason is required', 'error');
            return;
        }

        const now = new Date().toISOString();
        change.status = 'Rejected';

        // Add note
        if (!change.notes) change.notes = [];
        change.notes.unshift({
            timestamp: now,
            author: ITSMData.currentUser.username,
            content: `Change rejected. Reason: ${reason}`
        });

        this.addAuditLog('Change Rejected', changeId, `Change rejected: ${reason}`);

        // Update dashboard stats
        if (ITSMData.dashboardStats && ITSMData.dashboardStats.changes) {
            if (ITSMData.dashboardStats.changes.pending > 0) {
                ITSMData.dashboardStats.changes.pending--;
            }
        }

        closeModal();
        showToast(`Change ${changeId} has been rejected`, 'warning');

        if (typeof currentModule !== 'undefined' && currentModule === 'changes') {
            renderModule('changes');
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
    startImplementation(changeId) {
        const change = ITSMData.changes.find(c => c.id === changeId);
        if (!change) {
            showToast('Change not found', 'error');
            return;
        }

        const actualStart = document.getElementById('impl-start').value;
        const notes = document.getElementById('impl-notes').value.trim();
        const now = new Date().toISOString();

        change.actualStart = actualStart ? new Date(actualStart).toISOString() : now;
        change.status = 'Implementing';

        // Add note
        if (!change.notes) change.notes = [];
        change.notes.unshift({
            timestamp: now,
            author: ITSMData.currentUser.username,
            content: `Implementation started.${notes ? ' Notes: ' + notes : ''}`
        });

        this.addAuditLog('Change Implementation Started', changeId, `Implementation started by ${ITSMData.currentUser.username}`);

        closeModal();
        showToast(`Implementation of ${changeId} has started`, 'success');

        if (typeof currentModule !== 'undefined' && currentModule === 'changes') {
            renderModule('changes');
        }
    },

    /**
     * Complete implementation
     */
    completeImplementation(changeId) {
        const change = ITSMData.changes.find(c => c.id === changeId);
        if (!change) {
            showToast('Change not found', 'error');
            return;
        }

        const now = new Date().toISOString();
        change.actualEnd = now;
        change.status = 'Implemented';

        // Add note
        if (!change.notes) change.notes = [];
        change.notes.unshift({
            timestamp: now,
            author: ITSMData.currentUser.username,
            content: 'Implementation completed successfully.'
        });

        this.addAuditLog('Change Implemented', changeId, `Change implemented successfully by ${ITSMData.currentUser.username}`);

        // Update dashboard stats
        if (ITSMData.dashboardStats && ITSMData.dashboardStats.changes) {
            if (ITSMData.dashboardStats.changes.scheduled > 0) {
                ITSMData.dashboardStats.changes.scheduled--;
            }
            ITSMData.dashboardStats.changes.implemented++;
        }

        closeModal();
        showToast(`Change ${changeId} has been implemented successfully`, 'success');

        if (typeof currentModule !== 'undefined' && currentModule === 'changes') {
            renderModule('changes');
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
    confirmFailure(changeId) {
        const change = ITSMData.changes.find(c => c.id === changeId);
        if (!change) {
            showToast('Change not found', 'error');
            return;
        }

        const reason = document.getElementById('fail-reason').value.trim();
        const rollbackPerformed = document.getElementById('fail-rollback').checked;

        if (!reason) {
            showToast('Failure reason is required', 'error');
            return;
        }

        const now = new Date().toISOString();
        change.actualEnd = now;
        change.status = 'Failed';

        // Add note
        if (!change.notes) change.notes = [];
        change.notes.unshift({
            timestamp: now,
            author: ITSMData.currentUser.username,
            content: `Implementation failed. Reason: ${reason}. Rollback ${rollbackPerformed ? 'was' : 'was NOT'} performed.`
        });

        this.addAuditLog('Change Failed', changeId, `Implementation failed: ${reason}`);

        closeModal();
        showToast(`Change ${changeId} marked as failed`, 'error');

        if (typeof currentModule !== 'undefined' && currentModule === 'changes') {
            renderModule('changes');
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
    confirmCancellation(changeId) {
        const change = ITSMData.changes.find(c => c.id === changeId);
        if (!change) {
            showToast('Change not found', 'error');
            return;
        }

        const reason = document.getElementById('cancel-reason').value.trim();
        if (!reason) {
            showToast('Cancellation reason is required', 'error');
            return;
        }

        const previousStatus = change.status;
        const now = new Date().toISOString();
        change.status = 'Cancelled';

        // Add note
        if (!change.notes) change.notes = [];
        change.notes.unshift({
            timestamp: now,
            author: ITSMData.currentUser.username,
            content: `Change cancelled from status "${previousStatus}". Reason: ${reason}`
        });

        this.addAuditLog('Change Cancelled', changeId, `Change cancelled: ${reason}`);

        // Update dashboard stats
        if (ITSMData.dashboardStats && ITSMData.dashboardStats.changes) {
            if (previousStatus === 'Pending Approval' && ITSMData.dashboardStats.changes.pending > 0) {
                ITSMData.dashboardStats.changes.pending--;
            } else if ((previousStatus === 'Scheduled' || previousStatus === 'Approved') && ITSMData.dashboardStats.changes.scheduled > 0) {
                ITSMData.dashboardStats.changes.scheduled--;
            }
        }

        closeModal();
        showToast(`Change ${changeId} has been cancelled`, 'warning');

        if (typeof currentModule !== 'undefined' && currentModule === 'changes') {
            renderModule('changes');
        }
    },

    /**
     * Submit for approval (from Draft status)
     */
    submitForApproval(changeId) {
        const change = ITSMData.changes.find(c => c.id === changeId);
        if (!change) {
            showToast('Change not found', 'error');
            return;
        }

        const now = new Date().toISOString();
        change.status = 'Pending Approval';

        if (!change.notes) change.notes = [];
        change.notes.unshift({
            timestamp: now,
            author: ITSMData.currentUser.username,
            content: 'Change submitted for CAB approval.'
        });

        this.addAuditLog('Change Submitted', changeId, 'Change submitted for approval');

        if (ITSMData.dashboardStats && ITSMData.dashboardStats.changes) {
            ITSMData.dashboardStats.changes.pending++;
        }

        closeModal();
        showToast(`Change ${changeId} submitted for approval`, 'success');

        if (typeof currentModule !== 'undefined' && currentModule === 'changes') {
            renderModule('changes');
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
            <div class="page-title">🔄 Change Requests</div>
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
