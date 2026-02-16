/**
 * ITSM Console - Assignment Module
 * Handles incident assignment, reassignment, and workload management
 */

const AssignmentModule = {
    /**
     * Calculate workload for a specific technician
     * @param {string} technicianId - The technician's ID
     * @returns {number} Number of open tickets assigned to the technician
     */
    calculateWorkload: function(technicianId) {
        const technician = ITSMData.technicians.find(t => t.id === technicianId);
        if (!technician) return 0;

        // Count open incidents assigned to this technician
        const openStatuses = ['New', 'Open', 'In Progress', 'Pending'];
        const assignedIncidents = ITSMData.incidents.filter(inc =>
            (inc.assignee === technician.email ||
             inc.assignee === technician.name ||
             inc.assignee === technicianId) &&
            openStatuses.includes(inc.status)
        );

        return assignedIncidents.length;
    },

    /**
     * Get workload indicator class based on ticket count
     * @param {number} count - Number of tickets
     * @returns {string} CSS class for the indicator
     */
    getWorkloadClass: function(count) {
        if (count <= 2) return 'workload-low';
        if (count <= 4) return 'workload-medium';
        return 'workload-high';
    },

    /**
     * Get workload indicator color
     * @param {number} count - Number of tickets
     * @returns {string} Color code
     */
    getWorkloadColor: function(count) {
        if (count <= 2) return '#28a745'; // Green
        if (count <= 4) return '#ffc107'; // Yellow
        return '#dc3545'; // Red
    },

    /**
     * Get technicians for a specific team
     * @param {string} teamName - The team name
     * @returns {Array} Array of technicians in the team
     */
    getTechniciansByTeam: function(teamName) {
        return ITSMData.technicians.filter(t => t.team === teamName);
    },

    /**
     * Render assignment dropdown with teams and technicians
     * @param {string} incidentId - The incident ID
     * @param {string} currentAssignee - Current assignee email/name
     * @param {string} currentTeam - Current assigned team
     * @returns {string} HTML string for the assignment dropdown
     */
    renderAssignmentDropdown: function(incidentId, currentAssignee, currentTeam) {
        const teams = ITSMData.teams;
        const currentUser = ITSMData.currentUser;

        let html = `
            <div class="assignment-container">
                <div class="assignment-header">
                    <label class="form-label">Assignment</label>
                    <button class="btn btn-sm btn-secondary" onclick="AssignmentModule.assignToMe('${incidentId}')" title="Assign to yourself">
                        Assign to Me
                    </button>
                </div>

                <div class="form-group">
                    <label class="form-label">Team</label>
                    <select class="form-control" id="assign-team-${incidentId}" onchange="AssignmentModule.onTeamChange('${incidentId}')">
                        <option value="">-- Select Team --</option>
                        ${teams.map(team => `
                            <option value="${team.name}" ${currentTeam === team.name ? 'selected' : ''}>
                                ${team.name}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Technician</label>
                    <select class="form-control" id="assign-technician-${incidentId}">
                        <option value="">-- Select Technician --</option>
                        ${this.renderTechnicianOptions(currentTeam, currentAssignee)}
                    </select>
                </div>

                <div id="workload-display-${incidentId}" class="workload-display">
                    ${currentAssignee ? this.renderWorkloadIndicator(currentAssignee) : ''}
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render technician options with workload indicators
     * @param {string} teamName - Filter by team name
     * @param {string} currentAssignee - Current assignee to mark as selected
     * @returns {string} HTML string for options
     */
    renderTechnicianOptions: function(teamName, currentAssignee) {
        let technicians = ITSMData.technicians;

        if (teamName) {
            technicians = this.getTechniciansByTeam(teamName);
        }

        return technicians.map(tech => {
            const workload = this.calculateWorkload(tech.id);
            const workloadColor = this.getWorkloadColor(workload);
            const isSelected = currentAssignee === tech.email ||
                              currentAssignee === tech.name ||
                              currentAssignee === tech.id;

            return `
                <option value="${tech.email}" ${isSelected ? 'selected' : ''}
                        data-workload="${workload}"
                        data-tech-id="${tech.id}">
                    ${tech.avatar} ${tech.name} (${workload} tickets)
                </option>
            `;
        }).join('');
    },

    /**
     * Render workload indicator for a technician
     * @param {string} assignee - The assignee email/name/id
     * @returns {string} HTML string for workload indicator
     */
    renderWorkloadIndicator: function(assignee) {
        const technician = ITSMData.technicians.find(t =>
            t.email === assignee || t.name === assignee || t.id === assignee
        );

        if (!technician) {
            return '<div class="workload-info">Workload: Unknown</div>';
        }

        const workload = this.calculateWorkload(technician.id);
        const workloadClass = this.getWorkloadClass(workload);
        const workloadColor = this.getWorkloadColor(workload);

        return `
            <div class="workload-info">
                <span class="workload-label">Current Workload:</span>
                <span class="workload-badge ${workloadClass}" style="background-color: ${workloadColor};">
                    ${workload} open ticket${workload !== 1 ? 's' : ''}
                </span>
                <div class="workload-bar">
                    <div class="workload-fill" style="width: ${Math.min(workload * 15, 100)}%; background-color: ${workloadColor};"></div>
                </div>
            </div>
        `;
    },

    /**
     * Handle team change in dropdown
     * @param {string} incidentId - The incident ID
     */
    onTeamChange: function(incidentId) {
        const teamSelect = document.getElementById(`assign-team-${incidentId}`);
        const techSelect = document.getElementById(`assign-technician-${incidentId}`);
        const workloadDisplay = document.getElementById(`workload-display-${incidentId}`);

        if (!teamSelect || !techSelect) return;

        const selectedTeam = teamSelect.value;

        // Update technician dropdown
        techSelect.innerHTML = `
            <option value="">-- Select Technician --</option>
            ${this.renderTechnicianOptions(selectedTeam, '')}
        `;

        // Clear workload display
        if (workloadDisplay) {
            workloadDisplay.innerHTML = '';
        }

        // Add change listener to technician dropdown
        techSelect.onchange = () => this.onTechnicianChange(incidentId);
    },

    /**
     * Handle technician change in dropdown
     * @param {string} incidentId - The incident ID
     */
    onTechnicianChange: function(incidentId) {
        const techSelect = document.getElementById(`assign-technician-${incidentId}`);
        const workloadDisplay = document.getElementById(`workload-display-${incidentId}`);

        if (!techSelect || !workloadDisplay) return;

        const selectedOption = techSelect.options[techSelect.selectedIndex];
        const techEmail = techSelect.value;

        if (techEmail) {
            workloadDisplay.innerHTML = this.renderWorkloadIndicator(techEmail);
        } else {
            workloadDisplay.innerHTML = '';
        }
    },

    /**
     * Assign incident to current user
     * @param {string} incidentId - The incident ID
     */
    assignToMe: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return;
        }

        const currentUser = ITSMData.currentUser;
        const oldAssignee = incident.assignee;
        const oldTeam = incident.assignedTo;

        // Update incident
        incident.assignee = currentUser.email;
        incident.assignedTo = currentUser.team;
        incident.updatedAt = new Date().toISOString();

        // Add audit log entry
        this.addAuditEntry(incidentId, 'Assigned',
            `Self-assigned by ${currentUser.name}. Previous: ${oldAssignee || 'Unassigned'} (${oldTeam})`);

        // Add notification
        this.addAssignmentNotification(incidentId, currentUser.name, 'self-assigned');

        // Refresh UI
        this.refreshAssignmentUI(incidentId);

        showToast(`${incidentId} assigned to you`, 'success');
    },

    /**
     * Show reassignment modal with reason
     * @param {string} incidentId - The incident ID
     */
    showReassignModal: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return;
        }

        const teams = ITSMData.teams;
        const currentTeam = incident.assignedTo || '';

        showModal(`
            <div class="modal-header">
                <span>Reassign Incident ${incidentId}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 550px;">
                <div class="form-group">
                    <label class="form-label">Current Assignment</label>
                    <div class="current-assignment-info" style="padding: 8px; background: var(--bg-secondary); border-radius: 4px;">
                        <strong>Team:</strong> ${incident.assignedTo || 'Unassigned'}<br>
                        <strong>Assignee:</strong> ${incident.assignee || 'Unassigned'}
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label required">New Team</label>
                    <select class="form-control" id="reassign-team" onchange="AssignmentModule.onReassignTeamChange()">
                        <option value="">-- Select Team --</option>
                        ${teams.map(team => `
                            <option value="${team.name}">${team.name}</option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">New Assignee</label>
                    <select class="form-control" id="reassign-technician">
                        <option value="">-- Select Technician (Optional) --</option>
                    </select>
                </div>

                <div id="reassign-workload-display" class="workload-display"></div>

                <div class="form-group">
                    <label class="form-label required">Reason for Reassignment</label>
                    <select class="form-control" id="reassign-reason">
                        <option value="">-- Select Reason --</option>
                        <option value="Expertise Required">Expertise Required</option>
                        <option value="Workload Balancing">Workload Balancing</option>
                        <option value="Escalation">Escalation</option>
                        <option value="Team Transfer">Team Transfer</option>
                        <option value="Resource Unavailable">Resource Unavailable</option>
                        <option value="Customer Request">Customer Request</option>
                        <option value="Incorrect Initial Assignment">Incorrect Initial Assignment</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Additional Notes</label>
                    <textarea class="form-control" id="reassign-notes" rows="3"
                              placeholder="Provide additional context for the reassignment..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="AssignmentModule.confirmReassignment('${incidentId}')">Reassign</button>
            </div>
        `);
    },

    /**
     * Handle team change in reassignment modal
     */
    onReassignTeamChange: function() {
        const teamSelect = document.getElementById('reassign-team');
        const techSelect = document.getElementById('reassign-technician');
        const workloadDisplay = document.getElementById('reassign-workload-display');

        if (!teamSelect || !techSelect) return;

        const selectedTeam = teamSelect.value;

        // Update technician dropdown
        techSelect.innerHTML = `
            <option value="">-- Select Technician (Optional) --</option>
            ${this.renderTechnicianOptions(selectedTeam, '')}
        `;

        // Clear workload display
        if (workloadDisplay) {
            workloadDisplay.innerHTML = '';
        }

        // Add change listener to technician dropdown
        techSelect.onchange = () => {
            const techEmail = techSelect.value;
            if (techEmail && workloadDisplay) {
                workloadDisplay.innerHTML = this.renderWorkloadIndicator(techEmail);
            } else if (workloadDisplay) {
                workloadDisplay.innerHTML = '';
            }
        };
    },

    /**
     * Confirm and process reassignment
     * @param {string} incidentId - The incident ID
     */
    confirmReassignment: function(incidentId) {
        const teamSelect = document.getElementById('reassign-team');
        const techSelect = document.getElementById('reassign-technician');
        const reasonSelect = document.getElementById('reassign-reason');
        const notesInput = document.getElementById('reassign-notes');

        const newTeam = teamSelect ? teamSelect.value : '';
        const newAssignee = techSelect ? techSelect.value : '';
        const reason = reasonSelect ? reasonSelect.value : '';
        const notes = notesInput ? notesInput.value.trim() : '';

        // Validation
        if (!newTeam) {
            showToast('Please select a team', 'error');
            return;
        }

        if (!reason) {
            showToast('Please select a reason for reassignment', 'error');
            return;
        }

        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return;
        }

        const oldTeam = incident.assignedTo;
        const oldAssignee = incident.assignee;

        // Update incident
        incident.assignedTo = newTeam;
        incident.assignee = newAssignee || null;
        incident.updatedAt = new Date().toISOString();

        // Build audit details
        let auditDetails = `Reassigned from ${oldTeam || 'Unassigned'}`;
        if (oldAssignee) {
            auditDetails += ` (${oldAssignee})`;
        }
        auditDetails += ` to ${newTeam}`;
        if (newAssignee) {
            const tech = ITSMData.technicians.find(t => t.email === newAssignee);
            auditDetails += ` (${tech ? tech.name : newAssignee})`;
        }
        auditDetails += `. Reason: ${reason}`;
        if (notes) {
            auditDetails += `. Notes: ${notes}`;
        }

        // Add audit log entry
        this.addAuditEntry(incidentId, 'Reassigned', auditDetails);

        // Add work note to incident
        const noteContent = `[REASSIGNMENT] Reason: ${reason}. Transferred from ${oldTeam || 'Unassigned'} to ${newTeam}.${notes ? ` Notes: ${notes}` : ''}`;
        incident.notes.push({
            type: 'system',
            author: ITSMData.currentUser.username,
            content: noteContent,
            timestamp: new Date().toISOString()
        });

        // Add notification
        if (newAssignee) {
            const tech = ITSMData.technicians.find(t => t.email === newAssignee);
            this.addAssignmentNotification(incidentId, tech ? tech.name : newAssignee, 'reassigned');
        }

        closeModal();

        // Refresh UI
        this.refreshAssignmentUI(incidentId);

        showToast(`${incidentId} reassigned to ${newTeam}`, 'success');
    },

    /**
     * Update incident assignment (for use from incident detail form)
     * @param {string} incidentId - The incident ID
     * @param {string} newTeam - New team name
     * @param {string} newAssignee - New assignee email
     */
    updateAssignment: function(incidentId, newTeam, newAssignee) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return false;
        }

        const oldTeam = incident.assignedTo;
        const oldAssignee = incident.assignee;

        // Check if anything changed
        if (oldTeam === newTeam && oldAssignee === newAssignee) {
            return false;
        }

        // Update incident
        incident.assignedTo = newTeam;
        incident.assignee = newAssignee || null;
        incident.updatedAt = new Date().toISOString();

        // Build audit details
        let auditDetails = '';
        if (oldTeam !== newTeam) {
            auditDetails += `Team: ${oldTeam || 'Unassigned'} -> ${newTeam}`;
        }
        if (oldAssignee !== newAssignee) {
            if (auditDetails) auditDetails += ', ';
            auditDetails += `Assignee: ${oldAssignee || 'Unassigned'} -> ${newAssignee || 'Unassigned'}`;
        }

        // Add audit log entry
        this.addAuditEntry(incidentId, 'Assignment Updated', auditDetails);

        // Add notification if assignee changed
        if (newAssignee && oldAssignee !== newAssignee) {
            const tech = ITSMData.technicians.find(t => t.email === newAssignee);
            this.addAssignmentNotification(incidentId, tech ? tech.name : newAssignee, 'assigned');
        }

        return true;
    },

    /**
     * Add audit log entry for assignment changes
     * @param {string} incidentId - The incident ID
     * @param {string} action - The action type
     * @param {string} details - The action details
     */
    addAuditEntry: function(incidentId, action, details) {
        const auditEntry = {
            timestamp: new Date().toISOString(),
            actor: ITSMData.currentUser.username,
            action: `Incident ${action}`,
            target: incidentId,
            details: details
        };
        ITSMData.auditLog.unshift(auditEntry);
    },

    /**
     * Add notification for assignment changes
     * @param {string} incidentId - The incident ID
     * @param {string} assigneeName - The assignee's name
     * @param {string} assignmentType - Type of assignment (assigned, reassigned, self-assigned)
     */
    addAssignmentNotification: function(incidentId, assigneeName, assignmentType) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) return;

        let title, message;

        switch (assignmentType) {
            case 'self-assigned':
                title = 'Incident Self-Assigned';
                message = `${incidentId}: ${incident.summary} - You have assigned this incident to yourself`;
                break;
            case 'reassigned':
                title = 'Incident Reassigned';
                message = `${incidentId}: ${incident.summary} has been reassigned to ${assigneeName}`;
                break;
            case 'assigned':
            default:
                title = 'New Incident Assigned';
                message = `${incidentId}: ${incident.summary} has been assigned to ${assigneeName}`;
                break;
        }

        // Add to NotificationsModule if available
        if (typeof NotificationsModule !== 'undefined' && NotificationsModule.add) {
            NotificationsModule.add('incident', title, message, incidentId);
        }

        // Also add to ITSMData.notifications for persistence
        const notification = {
            id: `NOTIF-${Date.now()}`,
            type: 'assignment',
            title: title,
            message: message,
            link: incidentId,
            timestamp: new Date().toISOString(),
            read: false
        };
        ITSMData.notifications.unshift(notification);
    },

    /**
     * Refresh assignment UI elements
     * @param {string} incidentId - The incident ID
     */
    refreshAssignmentUI: function(incidentId) {
        // Refresh incident detail if IncidentsModule is available
        if (typeof IncidentsModule !== 'undefined' && IncidentsModule.refreshIncidentDetail) {
            IncidentsModule.refreshIncidentDetail(incidentId);
        }

        // Refresh incident list
        if (typeof IncidentsModule !== 'undefined' && IncidentsModule.refreshIncidentList) {
            IncidentsModule.refreshIncidentList();
        }

        // Update sidebar badges if function exists
        if (typeof updateSidebarBadges === 'function') {
            updateSidebarBadges();
        }
    },

    /**
     * Get assignment summary for an incident
     * @param {string} incidentId - The incident ID
     * @returns {object} Assignment summary object
     */
    getAssignmentSummary: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) return null;

        const technician = ITSMData.technicians.find(t =>
            t.email === incident.assignee ||
            t.name === incident.assignee ||
            t.id === incident.assignee
        );

        return {
            team: incident.assignedTo || 'Unassigned',
            assignee: incident.assignee || 'Unassigned',
            technicianName: technician ? technician.name : incident.assignee,
            technicianAvatar: technician ? technician.avatar : null,
            workload: technician ? this.calculateWorkload(technician.id) : 0
        };
    },

    /**
     * Render assignment summary badge
     * @param {string} incidentId - The incident ID
     * @returns {string} HTML string for assignment badge
     */
    renderAssignmentBadge: function(incidentId) {
        const summary = this.getAssignmentSummary(incidentId);
        if (!summary) return '';

        const workloadColor = this.getWorkloadColor(summary.workload);

        return `
            <div class="assignment-badge" onclick="AssignmentModule.showReassignModal('${incidentId}')"
                 style="cursor: pointer;" title="Click to reassign">
                <span class="assignment-team">${summary.team}</span>
                ${summary.technicianAvatar ? `<span class="assignment-avatar">${summary.technicianAvatar}</span>` : ''}
                <span class="assignment-name">${summary.technicianName || 'Unassigned'}</span>
                ${summary.workload > 0 ? `
                    <span class="assignment-workload" style="background-color: ${workloadColor};">
                        ${summary.workload}
                    </span>
                ` : ''}
            </div>
        `;
    },

    /**
     * Render workload overview for all technicians
     * @returns {string} HTML string for workload overview
     */
    renderWorkloadOverview: function() {
        const technicians = ITSMData.technicians.map(tech => ({
            ...tech,
            currentWorkload: this.calculateWorkload(tech.id)
        })).sort((a, b) => b.currentWorkload - a.currentWorkload);

        return `
            <div class="workload-overview">
                <h4>Team Workload</h4>
                <div class="workload-list">
                    ${technicians.map(tech => {
                        const workloadColor = this.getWorkloadColor(tech.currentWorkload);
                        const percentage = Math.min(tech.currentWorkload * 15, 100);

                        return `
                            <div class="workload-item">
                                <div class="workload-item-header">
                                    <span>${tech.avatar} ${tech.name}</span>
                                    <span class="workload-count" style="color: ${workloadColor};">
                                        ${tech.currentWorkload} tickets
                                    </span>
                                </div>
                                <div class="workload-bar">
                                    <div class="workload-fill" style="width: ${percentage}%; background-color: ${workloadColor};"></div>
                                </div>
                                <div class="workload-team">${tech.team}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
};

// Add CSS styles for assignment module
const assignmentStyles = document.createElement('style');
assignmentStyles.textContent = `
    .assignment-container {
        padding: var(--spacing-sm);
    }

    .assignment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-sm);
    }

    .workload-display {
        margin-top: var(--spacing-sm);
    }

    .workload-info {
        padding: var(--spacing-sm);
        background: var(--bg-secondary);
        border-radius: 4px;
        font-size: 12px;
    }

    .workload-label {
        color: var(--text-muted);
        margin-right: var(--spacing-sm);
    }

    .workload-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 12px;
        color: white;
        font-size: 11px;
        font-weight: 600;
    }

    .workload-bar {
        height: 6px;
        background: var(--bg-tertiary);
        border-radius: 3px;
        margin-top: var(--spacing-xs);
        overflow: hidden;
    }

    .workload-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.3s ease;
    }

    .workload-low { background-color: #28a745; }
    .workload-medium { background-color: #ffc107; }
    .workload-high { background-color: #dc3545; }

    .assignment-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        background: var(--bg-secondary);
        border-radius: 4px;
        font-size: 11px;
    }

    .assignment-badge:hover {
        background: var(--bg-tertiary);
    }

    .assignment-team {
        color: var(--text-muted);
    }

    .assignment-avatar {
        font-size: 14px;
    }

    .assignment-name {
        font-weight: 500;
    }

    .assignment-workload {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        color: white;
        font-size: 10px;
        font-weight: 600;
    }

    .workload-overview {
        padding: var(--spacing-md);
    }

    .workload-overview h4 {
        margin-bottom: var(--spacing-md);
    }

    .workload-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .workload-item {
        padding: var(--spacing-sm);
        background: var(--bg-secondary);
        border-radius: 4px;
    }

    .workload-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
    }

    .workload-count {
        font-weight: 600;
    }

    .workload-team {
        font-size: 10px;
        color: var(--text-muted);
        margin-top: 4px;
    }

    .current-assignment-info {
        font-size: 12px;
        line-height: 1.6;
    }
`;
document.head.appendChild(assignmentStyles);

// Export to window
window.AssignmentModule = AssignmentModule;

// Helper functions for global access
window.assignToMe = function(incidentId) {
    AssignmentModule.assignToMe(incidentId);
};

window.showReassignModal = function(incidentId) {
    AssignmentModule.showReassignModal(incidentId);
};
