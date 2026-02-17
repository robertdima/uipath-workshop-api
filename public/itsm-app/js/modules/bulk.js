/**
 * ITSM Console - Bulk Operations Module
 * Handles bulk selection and mass actions on incidents
 */

const BulkModule = {
    // Selected incident IDs
    selectedIds: new Set(),

    // Bulk operation state
    operationInProgress: false,

    // Resolution codes for bulk close
    resolutionCodes: [
        'Fixed',
        'Workaround Applied',
        'User Education',
        'No Action Required',
        'Duplicate',
        'Cannot Reproduce'
    ],

    // Priority levels
    priorityLevels: [
        { value: 'P1', label: 'P1 - Critical' },
        { value: 'P2', label: 'P2 - High' },
        { value: 'P3', label: 'P3 - Medium' },
        { value: 'P4', label: 'P4 - Low' }
    ],

    /**
     * Render checkbox HTML for incident row
     * @param {string} incidentId - The incident ID
     * @returns {string} HTML string for checkbox
     */
    renderCheckbox: function(incidentId) {
        const isSelected = this.selectedIds.has(incidentId);
        return `
            <div class="bulk-checkbox" onclick="event.stopPropagation(); BulkModule.toggleSelection('${incidentId}')">
                <input type="checkbox"
                       id="bulk-check-${incidentId}"
                       ${isSelected ? 'checked' : ''}
                       onchange="event.stopPropagation(); BulkModule.toggleSelection('${incidentId}')"
                       style="cursor: pointer; width: 16px; height: 16px;">
            </div>
        `;
    },

    /**
     * Toggle selection of a single incident
     * @param {string} incidentId - The incident ID to toggle
     */
    toggleSelection: function(incidentId) {
        if (this.selectedIds.has(incidentId)) {
            this.selectedIds.delete(incidentId);
        } else {
            this.selectedIds.add(incidentId);
        }

        // Update checkbox state
        const checkbox = document.getElementById(`bulk-check-${incidentId}`);
        if (checkbox) {
            checkbox.checked = this.selectedIds.has(incidentId);
        }

        // Update select all checkbox
        this.updateSelectAllCheckbox();

        // Update bulk action bar
        this.updateBulkActionBar();
    },

    /**
     * Select all visible incidents
     */
    selectAll: function() {
        const visibleIncidents = this.getVisibleIncidentIds();
        visibleIncidents.forEach(id => this.selectedIds.add(id));

        // Update all checkboxes
        this.updateAllCheckboxes();
        this.updateSelectAllCheckbox();
        this.updateBulkActionBar();
    },

    /**
     * Deselect all incidents
     */
    deselectAll: function() {
        this.selectedIds.clear();

        // Update all checkboxes
        this.updateAllCheckboxes();
        this.updateSelectAllCheckbox();
        this.updateBulkActionBar();
    },

    /**
     * Toggle select all
     */
    toggleSelectAll: function() {
        const visibleIncidents = this.getVisibleIncidentIds();
        const allSelected = visibleIncidents.every(id => this.selectedIds.has(id));

        if (allSelected) {
            this.deselectAll();
        } else {
            this.selectAll();
        }
    },

    /**
     * Get array of selected incident IDs
     * @returns {string[]} Array of selected IDs
     */
    getSelectedIds: function() {
        return Array.from(this.selectedIds);
    },

    /**
     * Get IDs of currently visible (filtered) incidents
     * @returns {string[]} Array of visible incident IDs
     */
    getVisibleIncidentIds: function() {
        const rows = document.querySelectorAll('.ticket-row[data-incident-id]');
        return Array.from(rows).map(row => row.getAttribute('data-incident-id'));
    },

    /**
     * Update all checkbox states to match selection
     */
    updateAllCheckboxes: function() {
        document.querySelectorAll('.bulk-checkbox input[type="checkbox"]').forEach(checkbox => {
            const incidentId = checkbox.id.replace('bulk-check-', '');
            checkbox.checked = this.selectedIds.has(incidentId);
        });
    },

    /**
     * Update select all checkbox state
     */
    updateSelectAllCheckbox: function() {
        const selectAllCheckbox = document.getElementById('bulk-select-all');
        if (!selectAllCheckbox) return;

        const visibleIncidents = this.getVisibleIncidentIds();
        const selectedVisible = visibleIncidents.filter(id => this.selectedIds.has(id));

        if (selectedVisible.length === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (selectedVisible.length === visibleIncidents.length) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    },

    /**
     * Render the bulk action bar
     * @returns {string} HTML string for action bar
     */
    renderBulkActionBar: function() {
        const count = this.selectedIds.size;
        const isVisible = count > 0;

        return `
            <div id="bulk-action-bar" class="bulk-action-bar ${isVisible ? 'visible' : ''}" style="display: ${isVisible ? 'flex' : 'none'};">
                <div class="bulk-selection-info">
                    <span class="bulk-count">${count}</span> incident${count !== 1 ? 's' : ''} selected
                </div>
                <div class="bulk-actions">
                    <button class="btn btn-sm btn-secondary" onclick="BulkModule.showBulkAssignModal()" title="Assign selected incidents">
                        Assign
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="BulkModule.showBulkPriorityModal()" title="Update priority">
                        Priority
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="BulkModule.showBulkNoteModal()" title="Add note to selected">
                        Add Note
                    </button>
                    <button class="btn btn-sm btn-success" onclick="BulkModule.showBulkCloseModal()" title="Close selected incidents">
                        Close
                    </button>
                </div>
                <div class="bulk-clear">
                    <button class="btn btn-sm btn-secondary" onclick="BulkModule.deselectAll()" title="Clear selection">
                        Clear
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Update bulk action bar visibility and count
     */
    updateBulkActionBar: function() {
        const bar = document.getElementById('bulk-action-bar');
        if (!bar) return;

        const count = this.selectedIds.size;
        const isVisible = count > 0;

        bar.style.display = isVisible ? 'flex' : 'none';
        bar.classList.toggle('visible', isVisible);

        const countSpan = bar.querySelector('.bulk-count');
        if (countSpan) {
            countSpan.textContent = count;
        }

        const infoSpan = bar.querySelector('.bulk-selection-info');
        if (infoSpan) {
            infoSpan.innerHTML = `<span class="bulk-count">${count}</span> incident${count !== 1 ? 's' : ''} selected`;
        }
    },

    /**
     * Show bulk assign modal
     */
    showBulkAssignModal: function() {
        const count = this.selectedIds.size;
        if (count === 0) {
            showToast('No incidents selected', 'warning');
            return;
        }

        const teams = ITSMData.teams;
        const technicians = ITSMData.technicians;

        showModal(`
            <div class="modal-header">
                <span>Bulk Assign - ${count} Incident${count !== 1 ? 's' : ''}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 500px;">
                <div class="form-group">
                    <label class="form-label">Assign to Team</label>
                    <select class="form-control" id="bulk-assign-team" onchange="BulkModule.onBulkTeamChange()">
                        <option value="">-- Select Team --</option>
                        ${teams.map(team => `
                            <option value="${team.name}">${team.name}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Assign to Technician (optional)</label>
                    <select class="form-control" id="bulk-assign-technician" disabled>
                        <option value="">-- Select Technician --</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Assignment Note (optional)</label>
                    <textarea class="form-control" id="bulk-assign-note" rows="2" placeholder="Reason for assignment..."></textarea>
                </div>
                <div class="bulk-affected-list">
                    <label class="form-label">Affected Incidents:</label>
                    <div class="affected-ids">${this.getSelectedIds().join(', ')}</div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="BulkModule.confirmBulkAssign()">Assign ${count} Incident${count !== 1 ? 's' : ''}</button>
            </div>
        `);
    },

    /**
     * Handle team change in bulk assign modal
     */
    onBulkTeamChange: function() {
        const teamSelect = document.getElementById('bulk-assign-team');
        const techSelect = document.getElementById('bulk-assign-technician');

        if (!teamSelect || !techSelect) return;

        const selectedTeam = teamSelect.value;

        if (selectedTeam) {
            techSelect.disabled = false;
            const teamTechnicians = ITSMData.technicians.filter(t => t.team === selectedTeam);
            techSelect.innerHTML = `
                <option value="">-- Select Technician --</option>
                ${teamTechnicians.map(tech => `
                    <option value="${tech.email}">${tech.avatar} ${tech.name}</option>
                `).join('')}
            `;
        } else {
            techSelect.disabled = true;
            techSelect.innerHTML = '<option value="">-- Select Technician --</option>';
        }
    },

    /**
     * Confirm and execute bulk assign
     */
    confirmBulkAssign: function() {
        const team = document.getElementById('bulk-assign-team')?.value;
        const technician = document.getElementById('bulk-assign-technician')?.value;
        const note = document.getElementById('bulk-assign-note')?.value?.trim();

        if (!team) {
            showToast('Please select a team', 'error');
            return;
        }

        this.showConfirmationModal(
            'Confirm Bulk Assignment',
            `Are you sure you want to assign ${this.selectedIds.size} incident(s) to ${team}${technician ? '' : ' (no specific technician)'}?`,
            () => {
                this.executeBulkAction('assign', { team, technician, note });
            }
        );
    },

    /**
     * Show bulk close modal
     */
    showBulkCloseModal: function() {
        const count = this.selectedIds.size;
        if (count === 0) {
            showToast('No incidents selected', 'warning');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>Bulk Close - ${count} Incident${count !== 1 ? 's' : ''}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 500px;">
                <div class="form-group">
                    <label class="form-label required">Resolution Code</label>
                    <select class="form-control" id="bulk-close-code">
                        ${this.resolutionCodes.map(code => `
                            <option value="${code}">${code}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label required">Resolution Notes</label>
                    <textarea class="form-control" id="bulk-close-notes" rows="4" placeholder="Enter resolution notes that will be applied to all selected incidents..."></textarea>
                </div>
                <div class="bulk-affected-list">
                    <label class="form-label">Incidents to Close:</label>
                    <div class="affected-ids">${this.getSelectedIds().join(', ')}</div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-success" onclick="BulkModule.confirmBulkClose()">Close ${count} Incident${count !== 1 ? 's' : ''}</button>
            </div>
        `);
    },

    /**
     * Confirm and execute bulk close
     */
    confirmBulkClose: function() {
        const resolutionCode = document.getElementById('bulk-close-code')?.value;
        const resolutionNotes = document.getElementById('bulk-close-notes')?.value?.trim();

        if (!resolutionNotes) {
            showToast('Please enter resolution notes', 'error');
            return;
        }

        this.showConfirmationModal(
            'Confirm Bulk Close',
            `Are you sure you want to close ${this.selectedIds.size} incident(s) with resolution code "${resolutionCode}"?`,
            () => {
                this.executeBulkAction('close', { resolutionCode, resolutionNotes });
            }
        );
    },

    /**
     * Show bulk priority modal
     */
    showBulkPriorityModal: function() {
        const count = this.selectedIds.size;
        if (count === 0) {
            showToast('No incidents selected', 'warning');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>Bulk Update Priority - ${count} Incident${count !== 1 ? 's' : ''}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 450px;">
                <div class="form-group">
                    <label class="form-label required">New Priority</label>
                    <select class="form-control" id="bulk-priority">
                        ${this.priorityLevels.map(p => `
                            <option value="${p.value}">${p.label}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Reason for Priority Change (optional)</label>
                    <textarea class="form-control" id="bulk-priority-reason" rows="2" placeholder="Explain the reason for this priority change..."></textarea>
                </div>
                <div class="bulk-affected-list">
                    <label class="form-label">Affected Incidents:</label>
                    <div class="affected-ids">${this.getSelectedIds().join(', ')}</div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="BulkModule.confirmBulkPriority()">Update Priority</button>
            </div>
        `);
    },

    /**
     * Confirm and execute bulk priority update
     */
    confirmBulkPriority: function() {
        const priority = document.getElementById('bulk-priority')?.value;
        const reason = document.getElementById('bulk-priority-reason')?.value?.trim();

        if (!priority) {
            showToast('Please select a priority', 'error');
            return;
        }

        const priorityLabel = this.priorityLevels.find(p => p.value === priority)?.label || priority;

        this.showConfirmationModal(
            'Confirm Bulk Priority Update',
            `Are you sure you want to update ${this.selectedIds.size} incident(s) to ${priorityLabel}?`,
            () => {
                this.executeBulkAction('priority', { priority, reason });
            }
        );
    },

    /**
     * Show bulk note modal
     */
    showBulkNoteModal: function() {
        const count = this.selectedIds.size;
        if (count === 0) {
            showToast('No incidents selected', 'warning');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>Bulk Add Note - ${count} Incident${count !== 1 ? 's' : ''}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 500px;">
                <div class="form-group">
                    <label class="form-label required">Note Content</label>
                    <textarea class="form-control" id="bulk-note-content" rows="5" placeholder="Enter the note to add to all selected incidents..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-check">
                        <input type="checkbox" id="bulk-note-internal">
                        Mark as internal note (not visible to customers)
                    </label>
                </div>
                <div class="bulk-affected-list">
                    <label class="form-label">Incidents to Update:</label>
                    <div class="affected-ids">${this.getSelectedIds().join(', ')}</div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="BulkModule.confirmBulkNote()">Add Note to ${count} Incident${count !== 1 ? 's' : ''}</button>
            </div>
        `);
    },

    /**
     * Confirm and execute bulk note
     */
    confirmBulkNote: function() {
        const noteContent = document.getElementById('bulk-note-content')?.value?.trim();
        const isInternal = document.getElementById('bulk-note-internal')?.checked || false;

        if (!noteContent) {
            showToast('Please enter note content', 'error');
            return;
        }

        this.showConfirmationModal(
            'Confirm Bulk Note',
            `Are you sure you want to add this note to ${this.selectedIds.size} incident(s)?`,
            () => {
                this.executeBulkAction('note', { noteContent, isInternal });
            }
        );
    },

    /**
     * Show confirmation modal before executing bulk operation
     * @param {string} title - Modal title
     * @param {string} message - Confirmation message
     * @param {Function} onConfirm - Callback to execute on confirm
     */
    showConfirmationModal: function(title, message, onConfirm) {
        closeModal();

        setTimeout(() => {
            showModal(`
                <div class="modal-header">
                    <span>${title}</span>
                    <button class="panel-close" onclick="closeModal()">x</button>
                </div>
                <div class="modal-body" style="width: 400px;">
                    <div style="text-align: center; padding: var(--spacing-md);">
                        <div style="font-size: 48px; margin-bottom: var(--spacing-md);">&#9888;</div>
                        <p style="margin-bottom: var(--spacing-md);">${message}</p>
                        <p style="color: var(--text-muted); font-size: 12px;">This action cannot be undone.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button class="btn btn-primary" id="bulk-confirm-btn">Confirm</button>
                </div>
            `);

            // Attach event handler to confirm button
            document.getElementById('bulk-confirm-btn').onclick = () => {
                closeModal();
                onConfirm();
            };
        }, 100);
    },

    /**
     * Execute bulk operation with progress indicator
     * @param {string} action - The action type (assign, close, priority, note)
     * @param {object} params - Action parameters
     */
    executeBulkAction: function(action, params) {
        if (this.operationInProgress) {
            showToast('A bulk operation is already in progress', 'warning');
            return;
        }

        this.operationInProgress = true;
        const selectedIds = this.getSelectedIds();
        const total = selectedIds.length;
        let processed = 0;
        let succeeded = 0;
        let failed = 0;

        // Show progress modal
        this.showProgressModal(action, total);

        // Process each incident
        const processNext = () => {
            if (processed >= total) {
                // Operation complete
                this.operationInProgress = false;
                this.showResultsModal(action, total, succeeded, failed);
                this.deselectAll();

                // Refresh the incident list
                if (typeof IncidentsModule !== 'undefined' && IncidentsModule.refreshIncidentList) {
                    IncidentsModule.refreshIncidentList();
                }
                if (typeof updateSidebarBadges === 'function') {
                    updateSidebarBadges();
                }

                return;
            }

            const incidentId = selectedIds[processed];

            // Simulate async operation with small delay for visual feedback
            setTimeout(() => {
                const result = this.processIncident(incidentId, action, params);

                if (result.success) {
                    succeeded++;
                } else {
                    failed++;
                }

                processed++;
                this.updateProgressModal(processed, total);

                // Process next incident
                processNext();
            }, 50); // Small delay for visual feedback
        };

        // Start processing
        processNext();
    },

    /**
     * Process a single incident for the bulk operation
     * @param {string} incidentId - The incident ID
     * @param {string} action - The action type
     * @param {object} params - Action parameters
     * @returns {object} Result with success flag and message
     */
    processIncident: function(incidentId, action, params) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            return { success: false, message: 'Incident not found' };
        }

        const timestamp = new Date().toISOString();
        const actor = ITSMData.currentUser.username;

        try {
            switch (action) {
                case 'assign':
                    return this.processAssign(incident, params, timestamp, actor);
                case 'close':
                    return this.processClose(incident, params, timestamp, actor);
                case 'priority':
                    return this.processPriority(incident, params, timestamp, actor);
                case 'note':
                    return this.processNote(incident, params, timestamp, actor);
                default:
                    return { success: false, message: 'Unknown action' };
            }
        } catch (error) {
            console.error(`Error processing ${incidentId}:`, error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Process bulk assign for a single incident
     */
    processAssign: function(incident, params, timestamp, actor) {
        const oldTeam = incident.assignedTo;
        const oldAssignee = incident.assignee;

        incident.assignedTo = params.team;
        incident.assignee = params.technician || null;
        incident.updatedAt = timestamp;

        // Add note if provided
        if (params.note) {
            incident.notes.push({
                type: 'system',
                author: actor,
                content: `[BULK ASSIGNMENT] ${params.note}`,
                timestamp: timestamp
            });
        }

        // Audit logging handled server-side

        return { success: true };
    },

    /**
     * Process bulk close for a single incident
     */
    processClose: function(incident, params, timestamp, actor) {
        const oldStatus = incident.status;

        incident.status = 'Closed';
        incident.resolvedAt = timestamp;
        incident.updatedAt = timestamp;
        incident.resolutionCode = params.resolutionCode;

        // Add resolution note
        incident.notes.push({
            type: 'note',
            author: actor,
            content: `[BULK CLOSE - ${params.resolutionCode}] ${params.resolutionNotes}`,
            timestamp: timestamp
        });

        // Add system note
        incident.notes.push({
            type: 'system',
            author: 'System',
            content: `Incident closed via bulk operation. Resolution code: ${params.resolutionCode}`,
            timestamp: timestamp
        });

        // Audit logging handled server-side

        return { success: true };
    },

    /**
     * Process bulk priority update for a single incident
     */
    processPriority: function(incident, params, timestamp, actor) {
        const oldPriority = incident.priority;

        if (oldPriority === params.priority) {
            return { success: true }; // No change needed
        }

        incident.priority = params.priority;
        incident.updatedAt = timestamp;

        // Add note if reason provided
        if (params.reason) {
            incident.notes.push({
                type: 'note',
                author: actor,
                content: `[BULK PRIORITY UPDATE] ${oldPriority} -> ${params.priority}. Reason: ${params.reason}`,
                timestamp: timestamp
            });
        }

        // Audit logging handled server-side

        return { success: true };
    },

    /**
     * Process bulk note for a single incident
     */
    processNote: function(incident, params, timestamp, actor) {
        const noteType = params.isInternal ? 'internal' : 'note';
        const notePrefix = params.isInternal ? '[INTERNAL - BULK NOTE] ' : '[BULK NOTE] ';

        incident.notes.push({
            type: noteType,
            author: actor,
            content: notePrefix + params.noteContent,
            timestamp: timestamp
        });

        incident.updatedAt = timestamp;

        // Audit logging handled server-side

        return { success: true };
    },

    /**
     * Show progress modal during bulk operation
     * @param {string} action - The action being performed
     * @param {number} total - Total number of incidents
     */
    showProgressModal: function(action, total) {
        const actionLabel = {
            'assign': 'Assigning',
            'close': 'Closing',
            'priority': 'Updating Priority',
            'note': 'Adding Notes'
        }[action] || 'Processing';

        showModal(`
            <div class="modal-header">
                <span>Bulk Operation in Progress</span>
            </div>
            <div class="modal-body" style="width: 400px;">
                <div style="text-align: center; padding: var(--spacing-lg);">
                    <div class="bulk-progress-spinner"></div>
                    <p style="margin: var(--spacing-md) 0;"><strong>${actionLabel} Incidents...</strong></p>
                    <div class="bulk-progress-bar">
                        <div class="bulk-progress-fill" id="bulk-progress-fill" style="width: 0%;"></div>
                    </div>
                    <p id="bulk-progress-text" style="color: var(--text-muted); font-size: 12px; margin-top: var(--spacing-sm);">
                        0 / ${total} completed
                    </p>
                </div>
            </div>
        `);
    },

    /**
     * Update progress modal
     * @param {number} processed - Number processed so far
     * @param {number} total - Total number
     */
    updateProgressModal: function(processed, total) {
        const percent = Math.round((processed / total) * 100);

        const progressFill = document.getElementById('bulk-progress-fill');
        const progressText = document.getElementById('bulk-progress-text');

        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }

        if (progressText) {
            progressText.textContent = `${processed} / ${total} completed`;
        }
    },

    /**
     * Show results modal after bulk operation
     * @param {string} action - The action performed
     * @param {number} total - Total attempted
     * @param {number} succeeded - Number succeeded
     * @param {number} failed - Number failed
     */
    showResultsModal: function(action, total, succeeded, failed) {
        const actionLabel = {
            'assign': 'Assignment',
            'close': 'Close',
            'priority': 'Priority Update',
            'note': 'Note Addition'
        }[action] || 'Operation';

        const allSuccess = failed === 0;
        const icon = allSuccess ? '&#10003;' : '&#9888;';
        const iconColor = allSuccess ? 'var(--accent-green)' : 'var(--accent-orange)';

        showModal(`
            <div class="modal-header">
                <span>Bulk ${actionLabel} Complete</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 400px;">
                <div style="text-align: center; padding: var(--spacing-lg);">
                    <div style="font-size: 48px; color: ${iconColor}; margin-bottom: var(--spacing-md);">${icon}</div>
                    <h3>Operation Complete</h3>
                    <div style="margin: var(--spacing-md) 0; padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                        <div style="display: flex; justify-content: space-around;">
                            <div>
                                <div style="font-size: 24px; font-weight: 600; color: var(--accent-green);">${succeeded}</div>
                                <div style="font-size: 11px; color: var(--text-muted);">Succeeded</div>
                            </div>
                            <div>
                                <div style="font-size: 24px; font-weight: 600; color: var(--accent-red);">${failed}</div>
                                <div style="font-size: 11px; color: var(--text-muted);">Failed</div>
                            </div>
                            <div>
                                <div style="font-size: 24px; font-weight: 600;">${total}</div>
                                <div style="font-size: 11px; color: var(--text-muted);">Total</div>
                            </div>
                        </div>
                    </div>
                    ${failed > 0 ? `
                        <p style="color: var(--accent-orange); font-size: 12px;">
                            Some operations failed. Please check the affected incidents.
                        </p>
                    ` : ''}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="closeModal()">Close</button>
            </div>
        `);
    },

    /**
     * Render select all header checkbox
     * @returns {string} HTML string for header checkbox
     */
    renderSelectAllCheckbox: function() {
        return `
            <div class="bulk-checkbox-header" onclick="event.stopPropagation();">
                <input type="checkbox"
                       id="bulk-select-all"
                       onchange="BulkModule.toggleSelectAll()"
                       style="cursor: pointer; width: 16px; height: 16px;"
                       title="Select all visible incidents">
            </div>
        `;
    },

    /**
     * Initialize bulk operations for the incident list
     * Called when incident list is rendered
     */
    initialize: function() {
        // Clear selections when initializing
        this.selectedIds.clear();

        // Add CSS styles if not already added
        if (!document.getElementById('bulk-module-styles')) {
            const styles = document.createElement('style');
            styles.id = 'bulk-module-styles';
            styles.textContent = `
                .bulk-checkbox,
                .bulk-checkbox-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 var(--spacing-sm);
                }

                .bulk-checkbox input,
                .bulk-checkbox-header input {
                    cursor: pointer;
                }

                .bulk-action-bar {
                    display: none;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--spacing-sm) var(--spacing-md);
                    background: linear-gradient(135deg, var(--accent-blue) 0%, #005a9e 100%);
                    color: white;
                    border-radius: 4px;
                    margin-bottom: var(--spacing-sm);
                    gap: var(--spacing-md);
                }

                .bulk-action-bar.visible {
                    display: flex;
                }

                .bulk-selection-info {
                    font-size: 13px;
                    font-weight: 500;
                }

                .bulk-count {
                    font-weight: 700;
                    font-size: 15px;
                }

                .bulk-actions {
                    display: flex;
                    gap: var(--spacing-xs);
                }

                .bulk-actions .btn {
                    background: rgba(255, 255, 255, 0.15);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                }

                .bulk-actions .btn:hover {
                    background: rgba(255, 255, 255, 0.25);
                }

                .bulk-actions .btn-success {
                    background: var(--accent-green);
                    border-color: var(--accent-green);
                }

                .bulk-clear .btn {
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                }

                .bulk-clear .btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .bulk-affected-list {
                    margin-top: var(--spacing-md);
                    padding: var(--spacing-sm);
                    background: var(--bg-secondary);
                    border-radius: 4px;
                }

                .bulk-affected-list .form-label {
                    margin-bottom: var(--spacing-xs);
                    font-weight: 600;
                }

                .affected-ids {
                    font-size: 11px;
                    color: var(--text-muted);
                    word-break: break-all;
                }

                .bulk-progress-spinner {
                    width: 48px;
                    height: 48px;
                    border: 4px solid var(--bg-tertiary);
                    border-top: 4px solid var(--accent-blue);
                    border-radius: 50%;
                    animation: bulk-spin 1s linear infinite;
                    margin: 0 auto var(--spacing-md);
                }

                @keyframes bulk-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .bulk-progress-bar {
                    height: 8px;
                    background: var(--bg-tertiary);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .bulk-progress-fill {
                    height: 100%;
                    background: var(--accent-blue);
                    transition: width 0.2s ease;
                    border-radius: 4px;
                }

                /* Ticket row with checkbox */
                .ticket-row-with-bulk {
                    display: flex;
                    align-items: center;
                }

                .ticket-row-content {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(styles);
        }
    },

    /**
     * Clean up and reset module state
     */
    reset: function() {
        this.selectedIds.clear();
        this.operationInProgress = false;
    }
};

// Export to window
window.BulkModule = BulkModule;

// Global helper functions
window.toggleBulkSelection = function(incidentId) {
    BulkModule.toggleSelection(incidentId);
};

window.selectAllIncidents = function() {
    BulkModule.selectAll();
};

window.deselectAllIncidents = function() {
    BulkModule.deselectAll();
};

window.showBulkAssignModal = function() {
    BulkModule.showBulkAssignModal();
};

window.showBulkCloseModal = function() {
    BulkModule.showBulkCloseModal();
};

window.showBulkPriorityModal = function() {
    BulkModule.showBulkPriorityModal();
};

window.showBulkNoteModal = function() {
    BulkModule.showBulkNoteModal();
};
