/**
 * ITSM Console - Incidents Module
 * Complete incident management functionality
 */

const IncidentsModule = {
    // Category/Subcategory mappings
    categorySubcategories: {
        'Network': ['VPN', 'Firewall', 'DNS', 'Connectivity'],
        'Application': ['CRM', 'ERP', 'Email Client', 'Browser'],
        'Hardware': ['Printer', 'Laptop', 'Desktop', 'Monitor'],
        'Email': ['Sync', 'Delivery', 'Calendar', 'Contacts'],
        'Infrastructure': ['Server', 'Storage', 'Database', 'Backup'],
        'Identity': ['Password', 'MFA', 'Account', 'Access']
    },

    // Team options for assignment
    teams: [
        'Service Desk',
        'Network Team',
        'Application Support',
        'Server Team',
        'Identity Team',
        'Database Team',
        'Security Team',
        'Infrastructure Team'
    ],

    // Priority escalation mapping
    priorityLevels: ['P4', 'P3', 'P2', 'P1'],

    // Pending state types
    pendingTypes: [
        { value: 'customer', label: 'Pending Customer', description: 'Awaiting response from customer' },
        { value: 'vendor', label: 'Pending Vendor', description: 'Awaiting response from vendor/supplier' },
        { value: 'change', label: 'Pending Change', description: 'Awaiting scheduled change implementation' },
        { value: 'approval', label: 'Pending Approval', description: 'Awaiting management approval' },
        { value: 'parts', label: 'Pending Parts', description: 'Awaiting hardware/parts delivery' },
        { value: 'other', label: 'Pending Other', description: 'Other pending reason' }
    ],

    // Note visibility options
    noteVisibility: {
        'internal': { label: 'Internal Note', icon: '🔒', class: 'note-internal', description: 'Visible only to technicians' },
        'customer': { label: 'Customer Update', icon: '📧', class: 'note-customer', description: 'Visible to customer and sent via email' }
    },

    /**
     * Get subcategories for a given category
     * @param {string} category - The category name
     * @returns {string[]} Array of subcategories
     */
    getSubcategories: function(category) {
        return this.categorySubcategories[category] || [];
    },

    /**
     * Save incident changes from the form
     * @param {string} incidentId - The incident ID to save
     */
    saveIncident: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return;
        }

        // Get form values
        const statusSelect = document.getElementById('inc-status');
        const priorityInput = document.getElementById('inc-priority');
        const impactSelect = document.getElementById('inc-impact');
        const urgencySelect = document.getElementById('inc-urgency');
        const assignedToSelect = document.getElementById('inc-assigned-to');
        const assigneeSelect = document.getElementById('inc-assignee');
        const categorySelect = document.getElementById('inc-category');
        const subcategorySelect = document.getElementById('inc-subcategory');
        const businessServiceSelect = document.getElementById('inc-business-service');
        const assetSelect = document.getElementById('inc-asset');
        const summaryInput = document.getElementById('inc-summary');
        const descriptionInput = document.getElementById('inc-description');
        const watchListInput = document.getElementById('inc-watch-list');
        const workNotesNotifyInput = document.getElementById('inc-work-notes-notify');

        // Store old values for audit
        const oldValues = {
            status: incident.status,
            priority: incident.priority,
            impact: incident.impact,
            urgency: incident.urgency,
            assignedTo: incident.assignedTo,
            assignee: incident.assignee,
            category: incident.category,
            subcategory: incident.subcategory,
            businessService: incident.businessService
        };

        // Update incident with form values
        if (statusSelect) incident.status = statusSelect.value;
        if (priorityInput) incident.priority = priorityInput.value;
        if (impactSelect) incident.impact = parseInt(impactSelect.value);
        if (urgencySelect) incident.urgency = parseInt(urgencySelect.value);
        if (assignedToSelect) {
            incident.assignedTo = assignedToSelect.value;
            incident.assignmentGroup = assignedToSelect.value;
        }
        if (assigneeSelect) {
            incident.assignee = assigneeSelect.value || null;
            const tech = ITSMData.technicians?.find(t => t.id === assigneeSelect.value);
            incident.assigneeName = tech ? tech.name : null;
        }
        if (categorySelect) incident.category = categorySelect.value;
        if (subcategorySelect) incident.subcategory = subcategorySelect.value;
        if (businessServiceSelect) incident.businessService = businessServiceSelect.value || null;
        if (assetSelect) {
            incident.affectedAsset = assetSelect.value || null;
            incident.configurationItem = assetSelect.value || null;
        }
        if (summaryInput) incident.summary = summaryInput.value;
        if (descriptionInput) incident.description = descriptionInput.value;
        if (watchListInput) {
            incident.watchList = watchListInput.value.split(',').map(e => e.trim()).filter(e => e);
        }
        if (workNotesNotifyInput) {
            incident.workNotesNotify = workNotesNotifyInput.value.split(',').map(e => e.trim()).filter(e => e);
        }

        // Update timestamp
        incident.updatedAt = new Date().toISOString();

        // Build audit details
        const changes = [];
        if (oldValues.status !== incident.status) {
            changes.push(`Status: ${oldValues.status} -> ${incident.status}`);
        }
        if (oldValues.priority !== incident.priority) {
            changes.push(`Priority: ${oldValues.priority} -> ${incident.priority}`);
        }
        if (oldValues.impact !== incident.impact) {
            changes.push(`Impact: ${oldValues.impact} -> ${incident.impact}`);
        }
        if (oldValues.urgency !== incident.urgency) {
            changes.push(`Urgency: ${oldValues.urgency} -> ${incident.urgency}`);
        }
        if (oldValues.assignedTo !== incident.assignedTo) {
            changes.push(`Assignment Group: ${oldValues.assignedTo} -> ${incident.assignedTo}`);
        }
        if (oldValues.assignee !== incident.assignee) {
            changes.push(`Assigned To: ${oldValues.assignee || 'Unassigned'} -> ${incident.assigneeName || 'Unassigned'}`);
        }
        if (oldValues.category !== incident.category) {
            changes.push(`Category: ${oldValues.category} -> ${incident.category}`);
        }

        // Add audit log entry
        const auditEntry = {
            timestamp: new Date().toISOString(),
            actor: ITSMData.currentUser.username,
            action: 'Incident Updated',
            target: incidentId,
            details: changes.length > 0 ? changes.join(', ') : 'Incident details updated'
        };
        ITSMData.auditLog.unshift(auditEntry);

        // Refresh UI
        this.refreshIncidentDetail(incidentId);
        this.refreshIncidentList();
        if (typeof updateSidebarBadges === 'function') updateSidebarBadges();

        showToast(`Incident ${incidentId} saved successfully`, 'success');
    },

    /**
     * Resolve an incident with resolution notes
     * @param {string} incidentId - The incident ID to resolve
     */
    resolveIncident: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>Resolve Incident ${incidentId}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 500px;">
                <div class="form-group">
                    <label class="form-label required">Resolution Notes</label>
                    <textarea class="form-control" id="resolution-notes" rows="5" placeholder="Describe how the incident was resolved..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Resolution Code</label>
                    <select class="form-control" id="resolution-code">
                        <option value="Fixed">Fixed</option>
                        <option value="Workaround">Workaround Applied</option>
                        <option value="User Education">User Education</option>
                        <option value="No Action Required">No Action Required</option>
                        <option value="Duplicate">Duplicate</option>
                        <option value="Cannot Reproduce">Cannot Reproduce</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-success" onclick="IncidentsModule.confirmResolve('${incidentId}')">Resolve Incident</button>
            </div>
        `);
    },

    /**
     * Confirm and process incident resolution
     * @param {string} incidentId - The incident ID to resolve
     */
    confirmResolve: function(incidentId) {
        const resolutionNotes = document.getElementById('resolution-notes').value;
        const resolutionCode = document.getElementById('resolution-code').value;

        if (!resolutionNotes.trim()) {
            showToast('Please provide resolution notes', 'error');
            return;
        }

        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return;
        }

        const oldStatus = incident.status;

        // Update incident
        incident.status = 'Resolved';
        incident.resolvedAt = new Date().toISOString();
        incident.updatedAt = new Date().toISOString();
        incident.resolutionCode = resolutionCode;

        // Add resolution note
        const noteEntry = {
            type: 'note',
            author: ITSMData.currentUser.username,
            content: `[Resolution - ${resolutionCode}] ${resolutionNotes}`,
            timestamp: new Date().toISOString()
        };
        incident.notes.push(noteEntry);

        // Add system note
        const systemNote = {
            type: 'system',
            author: 'System',
            content: `Incident resolved. Resolution time: ${this.calculateResolutionTime(incident.createdAt)}`,
            timestamp: new Date().toISOString()
        };
        incident.notes.push(systemNote);

        // Add audit log entry
        const auditEntry = {
            timestamp: new Date().toISOString(),
            actor: ITSMData.currentUser.username,
            action: 'Incident Resolved',
            target: incidentId,
            details: `Status changed from ${oldStatus} to Resolved. Code: ${resolutionCode}`
        };
        ITSMData.auditLog.unshift(auditEntry);

        closeModal();

        // Refresh UI
        this.refreshIncidentDetail(incidentId);
        this.refreshIncidentList();
        if (typeof updateSidebarBadges === 'function') updateSidebarBadges();

        showToast(`Incident ${incidentId} has been resolved`, 'success');
    },

    /**
     * Calculate resolution time from created date
     * @param {string} createdAt - ISO date string
     * @returns {string} Human readable duration
     */
    calculateResolutionTime: function(createdAt) {
        const created = new Date(createdAt);
        const now = new Date();
        const diff = now - created;

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }
        return `${hours}h ${minutes}m`;
    },

    /**
     * Escalate an incident
     * @param {string} incidentId - The incident ID to escalate
     */
    escalateIncident: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return;
        }

        const currentPriorityIndex = this.priorityLevels.indexOf(incident.priority);
        const canEscalatePriority = currentPriorityIndex > 0;

        showModal(`
            <div class="modal-header">
                <span>Escalate Incident ${incidentId}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 500px;">
                <div class="form-group">
                    <label class="form-label required">Escalation Team</label>
                    <select class="form-control" id="escalation-team">
                        ${this.teams.filter(t => t !== incident.assignedTo).map(team =>
                            `<option value="${team}">${team}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label required">Escalation Reason</label>
                    <select class="form-control" id="escalation-reason">
                        <option value="Technical Expertise Required">Technical Expertise Required</option>
                        <option value="SLA At Risk">SLA At Risk</option>
                        <option value="Customer Request">Customer Request</option>
                        <option value="Management Directive">Management Directive</option>
                        <option value="Resource Unavailable">Resource Unavailable</option>
                        <option value="Access Required">Access Required</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Additional Notes</label>
                    <textarea class="form-control" id="escalation-notes" rows="3" placeholder="Additional context for the escalation..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-check">
                        <input type="checkbox" id="increase-priority" ${canEscalatePriority ? '' : 'disabled'}>
                        Increase Priority ${canEscalatePriority ? `(${incident.priority} -> ${this.priorityLevels[currentPriorityIndex - 1]})` : '(Already at highest)'}
                    </label>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-warning" onclick="IncidentsModule.confirmEscalate('${incidentId}')">Escalate</button>
            </div>
        `);
    },

    /**
     * Confirm and process incident escalation
     * @param {string} incidentId - The incident ID to escalate
     */
    confirmEscalate: function(incidentId) {
        const escalationTeam = document.getElementById('escalation-team').value;
        const escalationReason = document.getElementById('escalation-reason').value;
        const escalationNotes = document.getElementById('escalation-notes').value;
        const increasePriority = document.getElementById('increase-priority').checked;

        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return;
        }

        const oldAssignedTo = incident.assignedTo;
        const oldPriority = incident.priority;

        // Update assignment
        incident.assignedTo = escalationTeam;
        incident.assignee = null; // Unassign specific person
        incident.updatedAt = new Date().toISOString();

        // Increase priority if requested
        if (increasePriority) {
            const currentIndex = this.priorityLevels.indexOf(incident.priority);
            if (currentIndex > 0) {
                incident.priority = this.priorityLevels[currentIndex - 1];
            }
        }

        // Add escalation note
        let noteContent = `[ESCALATED] Reason: ${escalationReason}. Transferred from ${oldAssignedTo} to ${escalationTeam}.`;
        if (increasePriority && oldPriority !== incident.priority) {
            noteContent += ` Priority increased from ${oldPriority} to ${incident.priority}.`;
        }
        if (escalationNotes.trim()) {
            noteContent += ` Notes: ${escalationNotes}`;
        }

        const noteEntry = {
            type: 'note',
            author: ITSMData.currentUser.username,
            content: noteContent,
            timestamp: new Date().toISOString()
        };
        incident.notes.push(noteEntry);

        // Add audit log entry
        const auditEntry = {
            timestamp: new Date().toISOString(),
            actor: ITSMData.currentUser.username,
            action: 'Incident Escalated',
            target: incidentId,
            details: `Escalated to ${escalationTeam}. Reason: ${escalationReason}${increasePriority ? `. Priority: ${oldPriority} -> ${incident.priority}` : ''}`
        };
        ITSMData.auditLog.unshift(auditEntry);

        closeModal();

        // Refresh UI
        this.refreshIncidentDetail(incidentId);
        this.refreshIncidentList();

        showToast(`Incident ${incidentId} escalated to ${escalationTeam}`, 'warning');
    },

    /**
     * Add a note to an incident
     * @param {string} incidentId - The incident ID
     * @param {string} noteType - 'internal' or 'customer'
     */
    addNote: function(incidentId, noteType = 'internal') {
        const noteTextarea = document.getElementById('new-note');
        const noteContent = noteTextarea ? noteTextarea.value.trim() : '';

        if (!noteContent) {
            showToast('Please enter a note', 'error');
            return;
        }

        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return;
        }

        // Handle legacy boolean parameter
        if (typeof noteType === 'boolean') {
            noteType = noteType ? 'internal' : 'note';
        }

        // Add note to incident
        const noteEntry = {
            type: noteType,
            visibility: noteType === 'customer' ? 'customer-visible' : 'technicians-only',
            author: ITSMData.currentUser.username,
            content: noteContent,
            timestamp: new Date().toISOString()
        };
        incident.notes.push(noteEntry);
        incident.updatedAt = new Date().toISOString();

        // If customer note, simulate sending email
        if (noteType === 'customer') {
            const customer = ITSMData.customers?.find(c => c.email === incident.reporter);
            if (customer) {
                showToast(`Update sent to ${customer.name}`, 'info');
            }
        }

        // Add audit log entry
        const auditEntry = {
            timestamp: new Date().toISOString(),
            actor: ITSMData.currentUser.username,
            action: noteType === 'customer' ? 'Customer Update Sent' : 'Internal Note Added',
            target: incidentId,
            details: noteType === 'customer' ? 'Customer update sent via email' : 'Added internal work note'
        };
        ITSMData.auditLog.unshift(auditEntry);

        // Clear the textarea
        if (noteTextarea) {
            noteTextarea.value = '';
        }

        // Refresh notes display
        this.refreshNotesDisplay(incidentId);

        showToast(noteType === 'customer' ? `Customer update sent for ${incidentId}` : `Note added to ${incidentId}`, 'success');
    },

    /**
     * Show pending state dialog
     * @param {string} incidentId - The incident ID
     */
    showPendingStateDialog: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return;
        }

        const pendingState = incident.pendingState || {};

        showModal(`
            <div class="modal-header">
                <span>Set Pending State - ${incidentId}</span>
                <button class="panel-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body" style="width: 500px;">
                <div class="form-group">
                    <label class="form-label required">Pending Type</label>
                    <select class="form-control" id="pending-type">
                        ${this.pendingTypes.map(pt => `
                            <option value="${pt.value}" ${pendingState.type === pt.value ? 'selected' : ''}>${pt.label}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label required">Reason</label>
                    <textarea class="form-control" id="pending-reason" rows="3" placeholder="Why is this incident pending?">${pendingState.reason || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Expected Response Date</label>
                    <input type="date" class="form-control" id="pending-expected-date" value="${pendingState.expectedDate || ''}">
                </div>
                <div class="form-group">
                    <label class="form-check">
                        <input type="checkbox" id="pending-send-reminder" ${pendingState.reminderEnabled ? 'checked' : ''}>
                        <span>Send reminder if no response by expected date</span>
                    </label>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                ${incident.status === 'Pending' ? `<button class="btn btn-warning" onclick="IncidentsModule.clearPendingState('${incidentId}')">Clear Pending</button>` : ''}
                <button class="btn btn-primary" onclick="IncidentsModule.savePendingState('${incidentId}')">Set Pending</button>
            </div>
        `);
    },

    /**
     * Save pending state for an incident
     * @param {string} incidentId - The incident ID
     */
    savePendingState: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return;
        }

        const pendingType = document.getElementById('pending-type').value;
        const pendingReason = document.getElementById('pending-reason').value.trim();
        const expectedDate = document.getElementById('pending-expected-date').value;
        const sendReminder = document.getElementById('pending-send-reminder').checked;

        if (!pendingReason) {
            showToast('Please provide a reason for the pending state', 'error');
            return;
        }

        const oldStatus = incident.status;

        // Update incident
        incident.status = 'Pending';
        incident.pendingState = {
            type: pendingType,
            reason: pendingReason,
            expectedDate: expectedDate || null,
            reminderEnabled: sendReminder,
            reminderSent: false,
            setAt: new Date().toISOString(),
            setBy: ITSMData.currentUser.username
        };
        incident.updatedAt = new Date().toISOString();

        // Add note
        const pendingTypeLabel = this.pendingTypes.find(pt => pt.value === pendingType)?.label || pendingType;
        incident.notes.push({
            type: 'system',
            author: 'System',
            content: `Status changed to ${pendingTypeLabel}. Reason: ${pendingReason}${expectedDate ? `. Expected response: ${expectedDate}` : ''}`,
            timestamp: new Date().toISOString()
        });

        // Add audit log
        ITSMData.auditLog.unshift({
            timestamp: new Date().toISOString(),
            actor: ITSMData.currentUser.username,
            action: 'Incident Set to Pending',
            target: incidentId,
            details: `${pendingTypeLabel}: ${pendingReason}`
        });

        closeModal();
        this.refreshIncidentDetail(incidentId);
        this.refreshIncidentList();

        showToast(`${incidentId} set to ${pendingTypeLabel}`, 'info');
    },

    /**
     * Clear pending state and reopen incident
     * @param {string} incidentId - The incident ID
     */
    clearPendingState: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) return;

        incident.status = 'Open';
        incident.pendingState = null;
        incident.updatedAt = new Date().toISOString();

        incident.notes.push({
            type: 'system',
            author: 'System',
            content: 'Pending state cleared. Incident reopened.',
            timestamp: new Date().toISOString()
        });

        ITSMData.auditLog.unshift({
            timestamp: new Date().toISOString(),
            actor: ITSMData.currentUser.username,
            action: 'Pending State Cleared',
            target: incidentId,
            details: 'Incident reopened'
        });

        closeModal();
        this.refreshIncidentDetail(incidentId);
        this.refreshIncidentList();

        showToast(`${incidentId} reopened`, 'success');
    },

    /**
     * Send reminder for pending incident
     * @param {string} incidentId - The incident ID
     */
    sendPendingReminder: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident || !incident.pendingState) return;

        const customer = ITSMData.customers?.find(c => c.email === incident.reporter);
        const recipientName = customer ? customer.name : incident.reporter;

        incident.pendingState.reminderSent = true;
        incident.pendingState.lastReminderAt = new Date().toISOString();

        incident.notes.push({
            type: 'system',
            author: 'System',
            content: `Reminder sent to ${recipientName} regarding pending response.`,
            timestamp: new Date().toISOString()
        });

        ITSMData.auditLog.unshift({
            timestamp: new Date().toISOString(),
            actor: ITSMData.currentUser.username,
            action: 'Pending Reminder Sent',
            target: incidentId,
            details: `Reminder sent to ${recipientName}`
        });

        this.refreshIncidentDetail(incidentId);
        showToast(`Reminder sent to ${recipientName}`, 'success');
    },

    /**
     * Get overdue pending incidents
     * @returns {Array} Incidents with overdue pending states
     */
    getOverduePendingIncidents: function() {
        const today = new Date().toISOString().split('T')[0];
        return ITSMData.incidents.filter(inc =>
            inc.status === 'Pending' &&
            inc.pendingState?.expectedDate &&
            inc.pendingState.expectedDate < today
        );
    },

    /**
     * Render pending state badge
     * @param {Object} incident - The incident object
     * @returns {string} HTML for pending state badge
     */
    renderPendingBadge: function(incident) {
        if (incident.status !== 'Pending' || !incident.pendingState) {
            return '';
        }

        const pendingType = this.pendingTypes.find(pt => pt.value === incident.pendingState.type);
        const isOverdue = incident.pendingState.expectedDate &&
            new Date(incident.pendingState.expectedDate) < new Date();

        return `<span class="pending-badge ${isOverdue ? 'pending-overdue' : ''}" title="${incident.pendingState.reason}">
            ${pendingType?.label || 'Pending'}
            ${isOverdue ? ' (Overdue)' : ''}
        </span>`;
    },

    /**
     * Refresh the notes display section
     * @param {string} incidentId - The incident ID
     */
    refreshNotesDisplay: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) return;

        const notesContainer = document.querySelector('#tab-notes > div:last-child');
        if (notesContainer) {
            notesContainer.innerHTML = incident.notes.map(note => `
                <div class="activity-item ${note.type}">
                    <div class="activity-header">
                        <span><strong>${note.author}</strong></span>
                        <span>${formatDateTime(note.timestamp)}</span>
                    </div>
                    <div class="activity-content">${note.content}</div>
                </div>
            `).join('');
        }

        // Update notes count in tab
        const notesTab = document.querySelector('.tab-item:nth-child(2)');
        if (notesTab) {
            notesTab.textContent = `Notes (${incident.notes.length})`;
        }
    },

    /**
     * Show upload attachment modal
     * @param {string} incidentId - The incident ID
     */
    uploadAttachment: function(incidentId) {
        showModal(`
            <div class="modal-header">
                <span>Upload Attachment</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 450px;">
                <div class="form-group">
                    <label class="form-label">Select File</label>
                    <input type="file" class="form-control" id="attachment-file" accept=".pdf,.doc,.docx,.txt,.log,.png,.jpg,.jpeg,.gif,.zip,.csv,.xml,.json">
                </div>
                <div id="attachment-preview" style="display: none; margin: var(--spacing-md) 0; padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px; text-align: center;">
                </div>
                <div class="form-group">
                    <label class="form-label">Description (optional)</label>
                    <input type="text" class="form-control" id="attachment-description" placeholder="Brief description of the file">
                </div>
                <div style="background: var(--bg-secondary); padding: var(--spacing-sm); border-radius: 4px; font-size: 11px; color: var(--text-muted);">
                    Supported formats: Images (PNG, JPG, GIF), Documents (PDF, DOC), Text (TXT, LOG, CSV, JSON, XML), Archives (ZIP)<br>
                    Maximum file size: 5MB for full preview support
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="IncidentsModule.processAttachment('${incidentId}')">Upload</button>
            </div>
        `);

        // Add file change listener for preview
        setTimeout(() => {
            const fileInput = document.getElementById('attachment-file');
            if (fileInput) {
                fileInput.addEventListener('change', function() {
                    IncidentsModule.previewSelectedFile(this);
                });
            }
        }, 100);
    },

    /**
     * Preview selected file before upload
     * @param {HTMLInputElement} input - File input element
     */
    previewSelectedFile: function(input) {
        const previewDiv = document.getElementById('attachment-preview');
        if (!previewDiv || !input.files || !input.files[0]) {
            if (previewDiv) previewDiv.style.display = 'none';
            return;
        }

        const file = input.files[0];
        const extension = file.name.split('.').pop().toLowerCase();

        // Check file size (warn if > 5MB)
        if (file.size > 5 * 1024 * 1024) {
            previewDiv.innerHTML = `
                <div style="color: var(--accent-orange);">
                    <div style="font-size: 32px;">⚠️</div>
                    <div>Large file (${(file.size / (1024 * 1024)).toFixed(1)}MB)</div>
                    <div style="font-size: 11px;">Preview may be slow. Consider compressing the file.</div>
                </div>
            `;
            previewDiv.style.display = 'block';
        }

        // Preview images
        if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(extension)) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewDiv.innerHTML = `
                    <img src="${e.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="margin-top: 8px; font-size: 11px; color: var(--text-muted);">${file.name}</div>
                `;
                previewDiv.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
        // Preview text files
        else if (['txt', 'log', 'csv', 'json', 'xml', 'md', 'yml', 'yaml'].includes(extension)) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result.substring(0, 1000); // First 1000 chars
                const truncated = e.target.result.length > 1000;
                previewDiv.innerHTML = `
                    <div style="text-align: left; background: #1e1e1e; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 11px; color: #d4d4d4; max-height: 150px; overflow: auto; white-space: pre-wrap; word-break: break-all;">
${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}${truncated ? '\n\n... (truncated)' : ''}
                    </div>
                    <div style="margin-top: 8px; font-size: 11px; color: var(--text-muted);">${file.name}</div>
                `;
                previewDiv.style.display = 'block';
            };
            reader.readAsText(file);
        }
        // Other files - just show icon
        else {
            const icon = this.getFileIcon(this.getFileTypeFromExtension(extension));
            previewDiv.innerHTML = `
                <div style="font-size: 48px;">${icon}</div>
                <div style="margin-top: 8px;">${file.name}</div>
                <div style="font-size: 11px; color: var(--text-muted);">${(file.size / 1024).toFixed(1)} KB</div>
            `;
            previewDiv.style.display = 'block';
        }
    },

    /**
     * Get file type from extension
     * @param {string} extension - File extension
     * @returns {string} File type
     */
    getFileTypeFromExtension: function(extension) {
        const typeMap = {
            'pdf': 'document', 'doc': 'document', 'docx': 'document',
            'txt': 'text', 'log': 'log', 'csv': 'text', 'json': 'text', 'xml': 'text',
            'png': 'screenshot', 'jpg': 'screenshot', 'jpeg': 'screenshot', 'gif': 'screenshot', 'bmp': 'screenshot', 'webp': 'screenshot',
            'zip': 'archive', 'rar': 'archive', '7z': 'archive',
            'dmp': 'dump', 'mdmp': 'dump'
        };
        return typeMap[extension] || 'file';
    },

    /**
     * Process the attachment upload with actual file content
     * @param {string} incidentId - The incident ID
     */
    processAttachment: function(incidentId) {
        const fileInput = document.getElementById('attachment-file');
        const descriptionInput = document.getElementById('attachment-description');

        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            showToast('Please select a file to upload', 'error');
            return;
        }

        const file = fileInput.files[0];
        const description = descriptionInput ? descriptionInput.value : '';

        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return;
        }

        // Show loading state
        showToast('Uploading file...', 'info');

        // Determine file type
        const extension = file.name.split('.').pop().toLowerCase();
        const fileType = this.getFileTypeFromExtension(extension);

        // Format file size
        const formatSize = (bytes) => {
            if (bytes < 1024) return bytes + 'B';
            if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + 'KB';
            return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
        };

        // Read file as Base64 for storage
        const reader = new FileReader();
        reader.onload = (e) => {
            const attachment = {
                name: file.name,
                type: fileType,
                mimeType: file.type || 'application/octet-stream',
                size: formatSize(file.size),
                sizeBytes: file.size,
                description: description,
                uploadedBy: ITSMData.currentUser.username,
                uploadedAt: new Date().toISOString(),
                // Store actual file content as Base64
                data: e.target.result
            };
            incident.attachments.push(attachment);
            incident.updatedAt = new Date().toISOString();

            // Add audit log entry
            ITSMData.auditLog.unshift({
                timestamp: new Date().toISOString(),
                actor: ITSMData.currentUser.username,
                action: 'Attachment Added',
                target: incidentId,
                details: `Uploaded file: ${file.name} (${formatSize(file.size)})`
            });

            closeModal();

            // Refresh attachments display
            this.refreshAttachmentsDisplay(incidentId);

            showToast(`File "${file.name}" uploaded successfully`, 'success');
        };

        reader.onerror = () => {
            showToast('Error reading file', 'error');
        };

        reader.readAsDataURL(file);
    },

    /**
     * Refresh the attachments display section
     * @param {string} incidentId - The incident ID
     */
    refreshAttachmentsDisplay: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) return;

        const attachmentsContainer = document.getElementById('tab-attachments');
        if (attachmentsContainer) {
            attachmentsContainer.innerHTML = `
                <div style="margin-bottom: var(--spacing-md);">
                    <button class="btn btn-primary btn-sm" onclick="IncidentsModule.uploadAttachment('${incidentId}')">Upload File</button>
                </div>
                ${incident.attachments.length > 0 ? `
                    <div class="attachment-list">
                        ${incident.attachments.map((att, index) => {
                            const icon = IncidentsModule.getFileIcon(att.type);
                            return `
                            <div class="attachment-item" style="cursor: pointer; display: flex; align-items: center; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 4px; background: var(--bg-secondary);"
                                 onclick="IncidentsModule.viewAttachment('${incidentId}', ${index})"
                                 onmouseover="this.style.background='var(--bg-hover)'"
                                 onmouseout="this.style.background='var(--bg-secondary)'">
                                <span class="attachment-icon" style="font-size: 24px; margin-right: 12px;">${icon}</span>
                                <div style="flex: 1;">
                                    <div style="font-weight: 500;">${att.name}</div>
                                    <div style="font-size: 11px; color: var(--text-muted);">${att.type} - ${att.size}</div>
                                </div>
                                <span style="color: var(--accent-blue); font-size: 12px;">View</span>
                            </div>
                        `}).join('')}
                    </div>
                ` : '<div class="empty-state"><div class="empty-state-text">No attachments</div></div>'}
            `;
        }

        // Update attachments count in tab
        const attachmentsTab = document.querySelector('.tab-item:nth-child(3)');
        if (attachmentsTab) {
            attachmentsTab.textContent = `Attachments (${incident.attachments.length})`;
        }
    },

    /**
     * Get file icon based on type
     * @param {string} type - File type
     * @returns {string} Emoji icon
     */
    getFileIcon: function(type) {
        const icons = {
            'log': '📄',
            'screenshot': '🖼️',
            'dump': '💾',
            'document': '📕',
            'text': '📝',
            'archive': '📦',
            'default': '📎'
        };
        return icons[type] || icons.default;
    },

    /**
     * View an attachment
     * @param {string} incidentId - The incident ID
     * @param {number} attachmentIndex - Index of the attachment in the array
     */
    viewAttachment: function(incidentId, attachmentIndex) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident || !incident.attachments[attachmentIndex]) {
            showToast('Attachment not found', 'error');
            return;
        }

        const attachment = incident.attachments[attachmentIndex];
        const icon = this.getFileIcon(attachment.type);

        // Generate preview content based on file type and whether we have actual data
        let previewContent = '';
        let hasRealData = !!attachment.data;

        // Check if we have actual file content (Base64 data)
        if (attachment.data) {
            const mimeType = attachment.mimeType || '';

            if (mimeType.startsWith('image/') || attachment.type === 'screenshot') {
                // Display actual image
                previewContent = `
                    <div style="padding: var(--spacing-md); text-align: center; border-radius: 4px; margin-top: var(--spacing-md); background: #f8f9fa; border: 1px solid #dee2e6;">
                        <img src="${attachment.data}" alt="${attachment.name}" style="max-width: 100%; max-height: 300px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                    </div>
                `;
            } else if (mimeType.startsWith('text/') || attachment.type === 'log' || attachment.type === 'text' ||
                       mimeType === 'application/json' || mimeType === 'application/xml' ||
                       attachment.name.endsWith('.txt') || attachment.name.endsWith('.log') ||
                       attachment.name.endsWith('.json') || attachment.name.endsWith('.csv')) {
                // Display text content - decode from Base64 Data URL
                try {
                    const base64Content = attachment.data.split(',')[1];
                    const textContent = atob(base64Content);
                    const escapedContent = textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    previewContent = `
                        <div style="background: #1e1e1e; padding: var(--spacing-md); border-radius: 4px; margin-top: var(--spacing-md); font-family: monospace; font-size: 11px; color: #d4d4d4; max-height: 250px; overflow-y: auto; white-space: pre-wrap; word-break: break-word;">${escapedContent}</div>
                    `;
                } catch (e) {
                    previewContent = `
                        <div style="background: #f8d7da; padding: var(--spacing-md); border-radius: 4px; margin-top: var(--spacing-md); color: #721c24; text-align: center;">
                            Unable to decode text content for preview
                        </div>
                    `;
                }
            } else if (mimeType === 'application/pdf') {
                // PDF - show embed
                previewContent = `
                    <div style="padding: var(--spacing-md); text-align: center; border-radius: 4px; margin-top: var(--spacing-md); background: #f8f9fa; border: 1px solid #dee2e6;">
                        <iframe src="${attachment.data}" style="width: 100%; height: 300px; border: none; border-radius: 4px;"></iframe>
                    </div>
                `;
            } else {
                // Other binary files - show download prompt
                previewContent = `
                    <div style="background: #f8f9fa; padding: var(--spacing-lg); border-radius: 4px; margin-top: var(--spacing-md); text-align: center; border: 1px solid #dee2e6;">
                        <div style="font-size: 48px; margin-bottom: 8px;">${icon}</div>
                        <div style="color: #333; font-size: 12px;">File ready for download</div>
                        <div style="color: #28a745; font-size: 11px; margin-top: 4px;">Full file content available</div>
                    </div>
                `;
            }
        } else {
            // No actual data - show demo placeholders
            if (attachment.type === 'screenshot') {
                previewContent = `
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: var(--spacing-lg); text-align: center; border-radius: 4px; margin-top: var(--spacing-md);">
                        <div style="background: white; padding: 20px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <div style="font-size: 64px; margin-bottom: 8px;">🖼️</div>
                            <div style="color: #666; font-size: 12px;">Image Preview</div>
                            <div style="color: #999; font-size: 11px; margin-top: 4px;">(Demo attachment - no file data)</div>
                        </div>
                    </div>
                `;
            } else if (attachment.type === 'log' || attachment.type === 'text') {
                previewContent = `
                    <div style="background: #1e1e1e; padding: var(--spacing-md); border-radius: 4px; margin-top: var(--spacing-md); font-family: monospace; font-size: 11px; color: #d4d4d4; max-height: 200px; overflow-y: auto;">
                        <div style="color: #6a9955;">// Log file preview (Demo mode)</div>
                        <div style="color: #569cd6;">[2025-02-13 08:30:15]</div> <span style="color: #ce9178;">INFO</span> - Application started<br>
                        <div style="color: #569cd6;">[2025-02-13 08:30:16]</div> <span style="color: #ce9178;">INFO</span> - Connecting to server...<br>
                        <div style="color: #569cd6;">[2025-02-13 08:30:17]</div> <span style="color: #f44747;">ERROR</span> - Connection failed: timeout<br>
                        <div style="color: #569cd6;">[2025-02-13 08:30:18]</div> <span style="color: #dcdcaa;">WARN</span> - Retrying connection...<br>
                        <div style="color: #808080;">... (content truncated for preview)</div>
                    </div>
                `;
            } else if (attachment.type === 'dump') {
                previewContent = `
                    <div style="background: #2d2d2d; padding: var(--spacing-md); border-radius: 4px; margin-top: var(--spacing-md); text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 8px;">💾</div>
                        <div style="color: #f0f0f0; font-size: 12px;">Memory Dump File</div>
                        <div style="color: #888; font-size: 11px; margin-top: 4px;">Demo attachment - download to analyze</div>
                    </div>
                `;
            } else if (attachment.type === 'document') {
                previewContent = `
                    <div style="background: #f8f9fa; padding: var(--spacing-md); border-radius: 4px; margin-top: var(--spacing-md); text-align: center; border: 1px solid #dee2e6;">
                        <div style="font-size: 48px; margin-bottom: 8px;">📄</div>
                        <div style="color: #333; font-size: 12px;">Document File</div>
                        <div style="color: #666; font-size: 11px; margin-top: 4px;">Demo attachment - no file data</div>
                    </div>
                `;
            }
        }

        showModal(`
            <div class="modal-header">
                <span>📎 Attachment: ${attachment.name}</span>
                <button class="panel-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body" style="width: 500px;">
                <div style="text-align: center; padding: var(--spacing-lg); background: var(--bg-secondary); border-radius: 8px;">
                    <div style="font-size: 64px; margin-bottom: var(--spacing-sm);">${icon}</div>
                    <div style="font-size: 18px; font-weight: 600;">${attachment.name}</div>
                    <div style="color: var(--text-muted); margin-top: 4px;">${attachment.size}</div>
                </div>

                ${previewContent}

                <div style="margin-top: var(--spacing-md);">
                    <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 8px 0; color: var(--text-muted); width: 120px;">File Type</td>
                            <td style="padding: 8px 0;">${attachment.type}${attachment.mimeType ? ` (${attachment.mimeType})` : ''}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 8px 0; color: var(--text-muted);">File Size</td>
                            <td style="padding: 8px 0;">${attachment.size}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 8px 0; color: var(--text-muted);">Content Status</td>
                            <td style="padding: 8px 0;">${hasRealData ? '<span style="color: #28a745;">Full content available</span>' : '<span style="color: #6c757d;">Demo attachment (no file data)</span>'}</td>
                        </tr>
                        ${attachment.uploadedBy ? `
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 8px 0; color: var(--text-muted);">Uploaded By</td>
                            <td style="padding: 8px 0;">${attachment.uploadedBy}</td>
                        </tr>
                        ` : ''}
                        ${attachment.uploadedAt ? `
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 8px 0; color: var(--text-muted);">Uploaded At</td>
                            <td style="padding: 8px 0;">${formatDateTime(attachment.uploadedAt)}</td>
                        </tr>
                        ` : ''}
                        ${attachment.description ? `
                        <tr>
                            <td style="padding: 8px 0; color: var(--text-muted);">Description</td>
                            <td style="padding: 8px 0;">${attachment.description}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                <button class="btn btn-primary" onclick="IncidentsModule.downloadAttachment('${incidentId}', ${attachmentIndex})"${hasRealData ? '' : ' disabled title="Demo attachment - no file data"'}>Download</button>
            </div>
        `);
    },

    /**
     * Download attachment - actually downloads if real data exists
     * @param {string} incidentId - The incident ID
     * @param {number} attachmentIndex - Index of the attachment
     */
    downloadAttachment: function(incidentId, attachmentIndex) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident || !incident.attachments[attachmentIndex]) {
            showToast('Attachment not found', 'error');
            return;
        }

        const attachment = incident.attachments[attachmentIndex];

        // Check if we have actual file content
        if (attachment.data) {
            // Create a download link with the actual file data
            const link = document.createElement('a');
            link.href = attachment.data;
            link.download = attachment.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showToast(`Downloaded: "${attachment.name}"`, 'success');
        } else {
            // Demo attachment - simulate download
            showToast(`Demo attachment - no file data to download`, 'warning');
        }

        closeModal();
    },

    /**
     * Link a KB article to an incident
     * @param {string} incidentId - The incident ID
     * @param {string} kbId - The KB article ID
     */
    linkKBToIncident: function(incidentId, kbId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return;
        }

        const kb = ITSMData.knowledgeArticles.find(k => k.id === kbId);
        if (!kb) {
            showToast('Knowledge article not found', 'error');
            return;
        }

        // Check if already linked
        if (incident.linkedKB.includes(kbId)) {
            showToast(`${kbId} is already linked to this incident`, 'warning');
            return;
        }

        // Add link
        incident.linkedKB.push(kbId);
        incident.updatedAt = new Date().toISOString();

        // Add note about linking
        const noteEntry = {
            type: 'system',
            author: 'System',
            content: `Knowledge article ${kbId} (${kb.title}) linked to incident`,
            timestamp: new Date().toISOString()
        };
        incident.notes.push(noteEntry);

        // Add audit log entry
        const auditEntry = {
            timestamp: new Date().toISOString(),
            actor: ITSMData.currentUser.username,
            action: 'KB Article Linked',
            target: incidentId,
            details: `Linked ${kbId}: ${kb.title}`
        };
        ITSMData.auditLog.unshift(auditEntry);

        // Refresh related tab if visible
        this.refreshRelatedDisplay(incidentId);

        showToast(`${kbId} linked to ${incidentId}`, 'success');
    },

    /**
     * Refresh the related items display section
     * @param {string} incidentId - The incident ID
     */
    refreshRelatedDisplay: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) return;

        const relatedContainer = document.getElementById('tab-related');
        if (relatedContainer) {
            relatedContainer.innerHTML = `
                <h4 style="margin-bottom: var(--spacing-md);">Linked Knowledge Articles</h4>
                <button class="btn btn-sm btn-secondary" style="margin-bottom: var(--spacing-md);" onclick="IncidentsModule.searchKBForIncident('${incidentId}')">Search KB</button>
                ${incident.linkedKB.length > 0 ? incident.linkedKB.map(kbId => {
                    const kb = ITSMData.knowledgeArticles.find(k => k.id === kbId);
                    return kb ? `
                        <div class="card" style="margin-bottom: var(--spacing-sm);">
                            <div class="card-body" style="padding: var(--spacing-sm); display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${kb.id}</strong>: ${kb.title}
                                </div>
                                <div>
                                    <button class="btn btn-sm btn-secondary" onclick="viewKBArticle('${kb.id}')">View</button>
                                    <button class="btn btn-sm btn-danger" onclick="IncidentsModule.unlinkKB('${incidentId}', '${kb.id}')">Unlink</button>
                                </div>
                            </div>
                        </div>
                    ` : '';
                }).join('') : '<div class="empty-state"><div class="empty-state-text">No linked articles</div></div>'}
            `;
        }
    },

    /**
     * Unlink a KB article from an incident
     * @param {string} incidentId - The incident ID
     * @param {string} kbId - The KB article ID
     */
    unlinkKB: function(incidentId, kbId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) return;

        const index = incident.linkedKB.indexOf(kbId);
        if (index > -1) {
            incident.linkedKB.splice(index, 1);
            incident.updatedAt = new Date().toISOString();

            // Add audit log entry
            const auditEntry = {
                timestamp: new Date().toISOString(),
                actor: ITSMData.currentUser.username,
                action: 'KB Article Unlinked',
                target: incidentId,
                details: `Unlinked ${kbId}`
            };
            ITSMData.auditLog.unshift(auditEntry);

            this.refreshRelatedDisplay(incidentId);
            showToast(`${kbId} unlinked from incident`, 'success');
        }
    },

    /**
     * Search KB articles for an incident
     * @param {string} incidentId - The incident ID
     */
    searchKBForIncident: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>Search Knowledge Base</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 600px; max-height: 500px; overflow-y: auto;">
                <div class="form-group">
                    <div style="display: flex; gap: var(--spacing-sm);">
                        <input type="text" class="form-control" id="kb-search-input" placeholder="Search by keyword, category, or article ID..." style="flex: 1;">
                        <button class="btn btn-primary" onclick="IncidentsModule.performKBSearch('${incidentId}')">Search</button>
                    </div>
                </div>
                <div style="margin-bottom: var(--spacing-md);">
                    <strong>Suggested articles</strong> (based on incident category: ${incident.category})
                </div>
                <div id="kb-search-results">
                    ${this.renderKBSearchResults(incidentId, incident.category)}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
            </div>
        `);
    },

    /**
     * Perform KB search
     * @param {string} incidentId - The incident ID
     */
    performKBSearch: function(incidentId) {
        const searchInput = document.getElementById('kb-search-input');
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

        const resultsContainer = document.getElementById('kb-search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = this.renderKBSearchResults(incidentId, null, searchTerm);
        }
    },

    /**
     * Render KB search results
     * @param {string} incidentId - The incident ID
     * @param {string} category - Filter by category
     * @param {string} searchTerm - Search term
     * @returns {string} HTML string
     */
    renderKBSearchResults: function(incidentId, category, searchTerm = '') {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) return '';

        let articles = ITSMData.knowledgeArticles;

        if (searchTerm) {
            articles = articles.filter(kb =>
                kb.id.toLowerCase().includes(searchTerm) ||
                kb.title.toLowerCase().includes(searchTerm) ||
                kb.category.toLowerCase().includes(searchTerm) ||
                kb.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        } else if (category) {
            articles = articles.filter(kb => kb.category === category);
        }

        if (articles.length === 0) {
            return '<div class="empty-state"><div class="empty-state-text">No articles found</div></div>';
        }

        return articles.map(kb => {
            const isLinked = incident.linkedKB.includes(kb.id);
            return `
                <div class="card" style="margin-bottom: var(--spacing-sm);">
                    <div class="card-body" style="padding: var(--spacing-sm);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="flex: 1;">
                                <div><strong>${kb.id}</strong>: ${kb.title}</div>
                                <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                                    ${kb.category} | ${kb.views} views | ${kb.helpful}% helpful
                                </div>
                                <div style="margin-top: 4px;">
                                    ${kb.tags.slice(0, 4).map(tag => `<span class="badge badge-new" style="margin-right: 4px; font-size: 10px;">${tag}</span>`).join('')}
                                </div>
                            </div>
                            <div>
                                ${isLinked
                                    ? '<span class="badge badge-resolved">Linked</span>'
                                    : `<button class="btn btn-sm btn-primary" onclick="IncidentsModule.linkKBToIncident('${incidentId}', '${kb.id}'); IncidentsModule.performKBSearch('${incidentId}');">Link</button>`
                                }
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Get impact label
     */
    getImpactLabel: function(impact) {
        const labels = { 1: '1 - High', 2: '2 - Medium', 3: '3 - Low' };
        return labels[impact] || impact;
    },

    /**
     * Get urgency label
     */
    getUrgencyLabel: function(urgency) {
        const labels = { 1: '1 - High', 2: '2 - Medium', 3: '3 - Low' };
        return labels[urgency] || urgency;
    },

    /**
     * Get contact type label
     */
    getContactTypeLabel: function(type) {
        const labels = {
            'phone': 'Phone',
            'email': 'Email',
            'walk-in': 'Walk-in',
            'self-service': 'Self-Service',
            'chat': 'Chat',
            'monitoring': 'Monitoring Alert'
        };
        return labels[type] || type || 'Not specified';
    },

    /**
     * Render editable incident form
     * @param {object} incident - The incident object
     * @returns {string} HTML string for the form
     */
    renderIncidentForm: function(incident) {
        const categories = Object.keys(this.categorySubcategories);
        const subcategories = this.getSubcategories(incident.category);

        // Get customer info if available
        const customer = incident.caller ? ITSMData.customers?.find(c => c.id === incident.caller) : null;

        // Business services list
        const businessServices = [
            'Email Services', 'CRM Application', 'ERP System', 'VPN / Remote Access',
            'Active Directory', 'File Services', 'Print Services', 'Web Applications',
            'Database Services', 'Network Infrastructure', 'Payment Gateway',
            'Customer Portal', 'Internal Portal', 'Backup Services', 'Monitoring Systems'
        ];

        return `
            <div style="padding: var(--spacing-md);">
                <!-- Tabs -->
                <div class="tabs">
                    <div class="tab-item active" onclick="showTab('details')">Details</div>
                    <div class="tab-item" onclick="showTab('notes')">Notes (${incident.notes.length})</div>
                    <div class="tab-item" onclick="showTab('attachments')">Attachments (${incident.attachments.length})</div>
                    <div class="tab-item" onclick="showTab('related')">Related</div>
                </div>

                <!-- Details Tab -->
                <div class="tab-content active" id="tab-details">

                    <!-- Caller Information Section -->
                    <div style="background: var(--bg-secondary); padding: var(--spacing-md); margin-bottom: var(--spacing-md); border-radius: 4px; border-left: 3px solid var(--accent-blue);">
                        <div style="font-weight: 600; margin-bottom: var(--spacing-sm); color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                            CALLER INFORMATION
                            ${incident.callerVip ? '<span class="badge badge-critical">VIP</span>' : ''}
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--spacing-md);">
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Caller</label>
                                <input type="text" class="form-control" value="${incident.callerName || incident.reporter || 'Unknown'}" readonly style="font-weight: 500;">
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Email</label>
                                <input type="text" class="form-control" value="${incident.callerEmail || ''}" readonly>
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Phone</label>
                                <input type="text" class="form-control" value="${incident.callerPhone || ''}" readonly>
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Department</label>
                                <input type="text" class="form-control" value="${incident.callerDepartment || ''}" readonly>
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Location</label>
                                <input type="text" class="form-control" value="${incident.callerLocation || ''}" readonly>
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Contact Type</label>
                                <input type="text" class="form-control" value="${this.getContactTypeLabel(incident.contactType)}" readonly>
                            </div>
                        </div>
                    </div>

                    <!-- Opened By Section -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Opened By</label>
                            <input type="text" class="form-control" value="${incident.openedByName || incident.openedBy || 'System'}" readonly>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Opened</label>
                            <input type="text" class="form-control" value="${formatDateTime(incident.createdAt)}" readonly>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Updated</label>
                            <input type="text" class="form-control" value="${formatDateTime(incident.updatedAt)}" readonly>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Number</label>
                            <input type="text" class="form-control" value="${incident.id}" readonly style="font-weight: 600;">
                        </div>
                    </div>

                    <!-- Short Description -->
                    <div class="form-group">
                        <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Short Description</label>
                        <input type="text" class="form-control" id="inc-summary" value="${incident.summary}" style="font-weight: 500;">
                    </div>

                    <!-- Status & Classification Section -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" style="font-size: 11px; color: var(--text-muted);">State</label>
                            <select class="form-control" id="inc-status">
                                <option value="New" ${incident.status === 'New' ? 'selected' : ''}>New</option>
                                <option value="Open" ${incident.status === 'Open' ? 'selected' : ''}>Open</option>
                                <option value="In Progress" ${incident.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                <option value="Pending" ${incident.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Resolved" ${incident.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                                <option value="Closed" ${incident.status === 'Closed' ? 'selected' : ''}>Closed</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Impact</label>
                            <select class="form-control" id="inc-impact" onchange="IncidentsModule.recalculatePriority('${incident.id}')">
                                <option value="1" ${incident.impact === 1 ? 'selected' : ''}>1 - High</option>
                                <option value="2" ${incident.impact === 2 ? 'selected' : ''}>2 - Medium</option>
                                <option value="3" ${incident.impact === 3 ? 'selected' : ''}>3 - Low</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Urgency</label>
                            <select class="form-control" id="inc-urgency" onchange="IncidentsModule.recalculatePriority('${incident.id}')">
                                <option value="1" ${incident.urgency === 1 ? 'selected' : ''}>1 - High</option>
                                <option value="2" ${incident.urgency === 2 ? 'selected' : ''}>2 - Medium</option>
                                <option value="3" ${incident.urgency === 3 ? 'selected' : ''}>3 - Low</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Priority</label>
                            <input type="text" class="form-control" id="inc-priority-display" value="${incident.priority}" readonly style="font-weight: 600; background: ${incident.priority === 'P1' ? 'var(--accent-red)' : incident.priority === 'P2' ? 'var(--accent-orange)' : incident.priority === 'P3' ? 'var(--accent-yellow)' : 'var(--accent-green)'}; color: white;">
                            <input type="hidden" id="inc-priority" value="${incident.priority}">
                        </div>
                    </div>

                    <!-- Category & Service Section -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Category</label>
                            <select class="form-control" id="inc-category" onchange="IncidentsModule.updateSubcategoryDropdown('${incident.id}')">
                                ${categories.map(cat => `
                                    <option value="${cat}" ${incident.category === cat ? 'selected' : ''}>${cat}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Subcategory</label>
                            <select class="form-control" id="inc-subcategory">
                                ${subcategories.map(sub => `
                                    <option value="${sub}" ${incident.subcategory === sub ? 'selected' : ''}>${sub}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Business Service</label>
                            <select class="form-control" id="inc-business-service">
                                <option value="">-- None --</option>
                                ${businessServices.map(svc => `
                                    <option value="${svc}" ${incident.businessService === svc ? 'selected' : ''}>${svc}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Configuration Item</label>
                            <select class="form-control" id="inc-asset">
                                <option value="">-- Select CI --</option>
                                ${ITSMData.assets.map(asset => `
                                    <option value="${asset.id}" ${(incident.configurationItem === asset.id || incident.affectedAsset === asset.id) ? 'selected' : ''}>${asset.id} - ${asset.name}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- Assignment Section -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Assignment Group</label>
                            <select class="form-control" id="inc-assigned-to" onchange="IncidentsModule.updateAssigneeDropdown('${incident.id}')">
                                ${this.teams.map(team => `
                                    <option value="${team}" ${incident.assignedTo === team ? 'selected' : ''}>${team}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Assigned To</label>
                            <select class="form-control" id="inc-assignee">
                                <option value="">-- Unassigned --</option>
                                ${ITSMData.technicians.map(tech => `
                                    <option value="${tech.id}" ${incident.assignee === tech.id || incident.assignee === tech.email ? 'selected' : ''}>${tech.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" style="font-size: 11px; color: var(--text-muted);">SLA Due</label>
                            <input type="text" class="form-control" value="${formatDateTime(incident.slaTarget)}" readonly style="color: ${new Date(incident.slaTarget) < new Date() ? 'var(--accent-red)' : 'inherit'};">
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" style="font-size: 11px; color: var(--text-muted);">SLA Status</label>
                            ${typeof SLAModule !== 'undefined' ? SLAModule.renderSLABadge(incident) : `<span class="badge ${new Date(incident.slaTarget) < new Date() ? 'badge-critical' : 'badge-resolved'}">
                                ${new Date(incident.slaTarget) < new Date() ? 'Breached' : 'On Track'}
                            </span>`}
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="form-group">
                        <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Description</label>
                        <textarea class="form-control" rows="4" id="inc-description">${incident.description}</textarea>
                    </div>

                    <!-- Watch List & Notifications -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Watch List</label>
                            <input type="text" class="form-control" id="inc-watch-list" value="${(incident.watchList || []).join(', ')}" placeholder="Enter emails separated by commas">
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Work Notes Notify</label>
                            <input type="text" class="form-control" id="inc-work-notes-notify" value="${(incident.workNotesNotify || []).join(', ')}" placeholder="Enter emails separated by commas">
                        </div>
                    </div>

                    <!-- Resolution Info (if resolved) -->
                    ${incident.status === 'Resolved' || incident.status === 'Closed' ? `
                        <div style="background: rgba(var(--green-rgb), 0.1); padding: var(--spacing-md); margin-bottom: var(--spacing-md); border-radius: 4px; border-left: 3px solid var(--accent-green);">
                            <div style="font-weight: 600; margin-bottom: var(--spacing-sm); color: var(--accent-green);">RESOLUTION INFORMATION</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Resolved At</label>
                                    <input type="text" class="form-control" value="${formatDateTime(incident.resolvedAt)}" readonly>
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Resolution Code</label>
                                    <input type="text" class="form-control" value="${incident.resolutionCode || 'N/A'}" readonly>
                                </div>
                            </div>
                            ${incident.resolutionNotes ? `
                                <div class="form-group" style="margin-bottom: 0; margin-top: var(--spacing-sm);">
                                    <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Resolution Notes</label>
                                    <textarea class="form-control" rows="2" readonly>${incident.resolutionNotes}</textarea>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    <!-- Pending State Info (if pending) -->
                    ${incident.status === 'Pending' && incident.pendingState ? `
                        <div style="background: rgba(var(--orange-rgb), 0.1); padding: var(--spacing-md); margin-bottom: var(--spacing-md); border-radius: 4px; border-left: 3px solid var(--accent-orange);">
                            <div style="font-weight: 600; margin-bottom: var(--spacing-sm); color: var(--accent-orange);">PENDING STATE</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--spacing-md);">
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Pending Type</label>
                                    <input type="text" class="form-control" value="${this.pendingTypes.find(p => p.value === incident.pendingState.type)?.label || incident.pendingState.type}" readonly>
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Expected Response</label>
                                    <input type="text" class="form-control" value="${incident.pendingState.expectedDate || 'Not set'}" readonly>
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Actions</label>
                                    <button class="btn btn-sm btn-warning" onclick="IncidentsModule.sendPendingReminder('${incident.id}')">Send Reminder</button>
                                </div>
                            </div>
                            <div class="form-group" style="margin-bottom: 0; margin-top: var(--spacing-sm);">
                                <label class="form-label" style="font-size: 11px; color: var(--text-muted);">Reason</label>
                                <input type="text" class="form-control" value="${incident.pendingState.reason}" readonly>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Action Buttons -->
                    <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-md); padding-top: var(--spacing-md); border-top: 1px solid var(--border-color);">
                        <button class="btn btn-primary" onclick="IncidentsModule.saveIncident('${incident.id}')">Save</button>
                        ${incident.status !== 'Resolved' && incident.status !== 'Closed' ? `
                            <button class="btn btn-success" onclick="IncidentsModule.resolveIncident('${incident.id}')">Resolve</button>
                            <button class="btn btn-warning" onclick="IncidentsModule.escalateIncident('${incident.id}')">Escalate</button>
                            <button class="btn btn-secondary" onclick="IncidentsModule.showPendingStateDialog('${incident.id}')">Set Pending</button>
                        ` : ''}
                        ${incident.status === 'Resolved' ? `
                            <button class="btn btn-secondary" onclick="IncidentsModule.closeIncident('${incident.id}')">Close</button>
                        ` : ''}
                    </div>
                </div>

                <!-- Notes Tab -->
                <div class="tab-content" id="tab-notes">
                    <div style="margin-bottom: var(--spacing-md);">
                        <textarea class="form-control" placeholder="Add a note..." rows="3" id="new-note"></textarea>
                        <div style="margin-top: var(--spacing-sm);">
                            <button class="btn btn-primary btn-sm" onclick="IncidentsModule.addNote('${incident.id}', false)">Add Note</button>
                            <button class="btn btn-secondary btn-sm" onclick="IncidentsModule.addNote('${incident.id}', true)">Add Internal Note</button>
                        </div>
                    </div>
                    <div style="border-top: 1px solid var(--border-light); padding-top: var(--spacing-md);">
                        ${incident.notes.map(note => `
                            <div class="activity-item ${note.type}">
                                <div class="activity-header">
                                    <span><strong>${note.author}</strong></span>
                                    <span>${formatDateTime(note.timestamp)}</span>
                                </div>
                                <div class="activity-content">${note.content}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Attachments Tab -->
                <div class="tab-content" id="tab-attachments">
                    <div style="margin-bottom: var(--spacing-md);">
                        <button class="btn btn-primary btn-sm" onclick="IncidentsModule.uploadAttachment('${incident.id}')">Upload File</button>
                    </div>
                    ${incident.attachments.length > 0 ? `
                        <div class="attachment-list">
                            ${incident.attachments.map((att, index) => {
                                const icon = IncidentsModule.getFileIcon(att.type);
                                return `
                                <div class="attachment-item" style="cursor: pointer; display: flex; align-items: center; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 4px; background: var(--bg-secondary);"
                                     onclick="IncidentsModule.viewAttachment('${incident.id}', ${index})"
                                     onmouseover="this.style.background='var(--bg-hover)'"
                                     onmouseout="this.style.background='var(--bg-secondary)'">
                                    <span class="attachment-icon" style="font-size: 24px; margin-right: 12px;">${icon}</span>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 500;">${att.name}</div>
                                        <div style="font-size: 11px; color: var(--text-muted);">${att.type} - ${att.size}</div>
                                    </div>
                                    <span style="color: var(--accent-blue); font-size: 12px;">View</span>
                                </div>
                            `}).join('')}
                        </div>
                    ` : '<div class="empty-state"><div class="empty-state-text">No attachments</div></div>'}
                </div>

                <!-- Related Tab -->
                <div class="tab-content" id="tab-related">
                    <h4 style="margin-bottom: var(--spacing-md);">Linked Knowledge Articles</h4>
                    <button class="btn btn-sm btn-secondary" style="margin-bottom: var(--spacing-md);" onclick="IncidentsModule.searchKBForIncident('${incident.id}')">Search KB</button>
                    ${incident.linkedKB.length > 0 ? incident.linkedKB.map(kbId => {
                        const kb = ITSMData.knowledgeArticles.find(k => k.id === kbId);
                        return kb ? `
                            <div class="card" style="margin-bottom: var(--spacing-sm);">
                                <div class="card-body" style="padding: var(--spacing-sm); display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <strong>${kb.id}</strong>: ${kb.title}
                                    </div>
                                    <div>
                                        <button class="btn btn-sm btn-secondary" onclick="viewKBArticle('${kb.id}')">View</button>
                                        <button class="btn btn-sm btn-danger" onclick="IncidentsModule.unlinkKB('${incident.id}', '${kb.id}')">Unlink</button>
                                    </div>
                                </div>
                            </div>
                        ` : '';
                    }).join('') : '<div class="empty-state"><div class="empty-state-text">No linked articles</div></div>'}
                </div>
            </div>
        `;
    },

    /**
     * Update subcategory dropdown when category changes
     * @param {string} incidentId - The incident ID
     */
    updateSubcategoryDropdown: function(incidentId) {
        const categorySelect = document.getElementById('inc-category');
        const subcategorySelect = document.getElementById('inc-subcategory');

        if (!categorySelect || !subcategorySelect) return;

        const selectedCategory = categorySelect.value;
        const subcategories = this.getSubcategories(selectedCategory);

        subcategorySelect.innerHTML = subcategories.map(sub =>
            `<option value="${sub}">${sub}</option>`
        ).join('');
    },

    /**
     * Recalculate priority based on impact and urgency
     * @param {string} incidentId - The incident ID
     */
    recalculatePriority: function(incidentId) {
        const impactSelect = document.getElementById('inc-impact');
        const urgencySelect = document.getElementById('inc-urgency');
        const priorityDisplay = document.getElementById('inc-priority-display');
        const priorityInput = document.getElementById('inc-priority');

        if (!impactSelect || !urgencySelect || !priorityDisplay) return;

        const impact = parseInt(impactSelect.value);
        const urgency = parseInt(urgencySelect.value);
        const score = impact + urgency;

        let priority;
        if (score <= 2) priority = 'P1';
        else if (score <= 3) priority = 'P2';
        else if (score <= 4) priority = 'P3';
        else priority = 'P4';

        priorityDisplay.value = priority;
        if (priorityInput) priorityInput.value = priority;

        // Update color
        const colors = {
            'P1': 'var(--accent-red)',
            'P2': 'var(--accent-orange)',
            'P3': 'var(--accent-yellow)',
            'P4': 'var(--accent-green)'
        };
        priorityDisplay.style.background = colors[priority];
        priorityDisplay.style.color = 'white';
    },

    /**
     * Update assignee dropdown when assignment group changes
     * @param {string} incidentId - The incident ID
     */
    updateAssigneeDropdown: function(incidentId) {
        const groupSelect = document.getElementById('inc-assigned-to');
        const assigneeSelect = document.getElementById('inc-assignee');

        if (!groupSelect || !assigneeSelect) return;

        const selectedGroup = groupSelect.value;
        const team = ITSMData.teams?.find(t => t.name === selectedGroup);
        const technicians = team
            ? ITSMData.technicians.filter(t => team.members.includes(t.id))
            : ITSMData.technicians;

        assigneeSelect.innerHTML = '<option value="">-- Unassigned --</option>' +
            technicians.map(tech =>
                `<option value="${tech.id}">${tech.name} (${tech.workload} tickets)</option>`
            ).join('');
    },

    /**
     * Close a resolved incident
     * @param {string} incidentId - The incident ID
     */
    closeIncident: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return;
        }

        if (incident.status !== 'Resolved') {
            showToast('Only resolved incidents can be closed', 'error');
            return;
        }

        incident.status = 'Closed';
        incident.closedAt = new Date().toISOString();
        incident.updatedAt = new Date().toISOString();

        // Add system note
        incident.notes.push({
            type: 'system',
            visibility: 'technicians-only',
            author: 'System',
            content: `Incident closed by ${ITSMData.currentUser.name || ITSMData.currentUser.username}`,
            timestamp: new Date().toISOString()
        });

        // Add audit log
        ITSMData.auditLog.unshift({
            timestamp: new Date().toISOString(),
            actor: ITSMData.currentUser.username,
            action: 'Incident Closed',
            target: incidentId,
            details: 'Incident closed after resolution'
        });

        this.refreshIncidentDetail(incidentId);
        this.refreshIncidentList();
        if (typeof updateSidebarBadges === 'function') updateSidebarBadges();

        showToast(`Incident ${incidentId} has been closed`, 'success');
    },

    /**
     * Refresh the incident detail panel
     * @param {string} incidentId - The incident ID
     */
    refreshIncidentDetail: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) return;

        const detailContainer = document.getElementById('incident-detail');
        if (detailContainer) {
            detailContainer.innerHTML = this.renderIncidentForm(incident);
        }

        const detailHeader = document.getElementById('detail-header');
        if (detailHeader) {
            detailHeader.textContent = `${incident.id} - ${incident.summary}`;
        }
    },

    /**
     * Refresh the incident list
     */
    refreshIncidentList: function() {
        const listContainer = document.getElementById('incident-list');
        if (!listContainer) return;

        // Preserve filters
        const statusFilter = document.getElementById('filter-status')?.value || '';
        const priorityFilter = document.getElementById('filter-priority')?.value || '';
        const searchFilter = document.getElementById('incident-search')?.value?.toLowerCase() || '';

        let filtered = ITSMData.incidents;

        if (statusFilter || priorityFilter || searchFilter) {
            filtered = ITSMData.incidents.filter(inc => {
                const matchStatus = !statusFilter || inc.status === statusFilter;
                const matchPriority = !priorityFilter || inc.priority === priorityFilter;
                const matchSearch = !searchFilter ||
                    inc.summary.toLowerCase().includes(searchFilter) ||
                    inc.id.toLowerCase().includes(searchFilter);
                return matchStatus && matchPriority && matchSearch;
            });
        }

        listContainer.innerHTML = filtered.length > 0
            ? filtered.map(inc => `
                <div class="ticket-row ${selectedIncident === inc.id ? 'selected' : ''}" data-incident-id="${inc.id}" onclick="selectIncident('${inc.id}')">
                    <div class="ticket-priority ${inc.priority.toLowerCase()}"></div>
                    <div class="ticket-id">${inc.id}</div>
                    <div style="flex: 1;">
                        <div class="ticket-summary">${inc.summary}</div>
                        <div class="ticket-meta">
                            <span><span class="badge badge-${inc.status.toLowerCase().replace(' ', '-')}">${inc.status}</span></span>
                            <span>${inc.category}</span>
                            <span>${formatDate(inc.createdAt)}</span>
                        </div>
                    </div>
                    ${renderSLABadge(inc)}
                </div>
            `).join('')
            : '<div class="empty-state"><div class="empty-state-text">No incidents match your filters</div></div>';
    }
};

// Export to window
window.IncidentsModule = IncidentsModule;

// Override the existing functions in app.js to use the module
window.saveIncident = function(incidentId) {
    IncidentsModule.saveIncident(incidentId);
};

window.resolveIncident = function(incidentId) {
    IncidentsModule.resolveIncident(incidentId);
};

window.escalateIncident = function(incidentId) {
    IncidentsModule.escalateIncident(incidentId);
};

window.addNote = function(incidentId, isInternal) {
    IncidentsModule.addNote(incidentId, isInternal);
};

window.uploadAttachment = function(incidentId) {
    IncidentsModule.uploadAttachment(incidentId);
};

// Override renderIncidentDetail to use the module's form
const originalSelectIncident = window.selectIncident;
window.selectIncident = function(incidentId) {
    selectedIncident = incidentId;

    // Update list selection
    document.querySelectorAll('.ticket-row').forEach(row => {
        row.classList.remove('selected');
    });
    document.querySelector(`[data-incident-id="${incidentId}"]`)?.classList.add('selected');

    // Render detail using module's form
    const incident = ITSMData.incidents.find(i => i.id === incidentId);
    if (incident) {
        document.getElementById('detail-header').textContent = `${incident.id} - ${incident.summary}`;
        document.getElementById('incident-detail').innerHTML = IncidentsModule.renderIncidentForm(incident);
    }
};
