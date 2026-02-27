/**
 * ITSM Console - Problems Module
 * Handles problem management including root cause analysis, known errors, and incident linking
 */

const ProblemsModule = {
    // Selection state
    selectedIds: new Set(),

    // Current filter state
    currentFilters: {
        status: '',
        priority: ''
    },

    // Problem statuses
    statuses: ['Open', 'Under Investigation', 'Known Error', 'Resolved'],

    // Priority levels
    priorities: ['P1', 'P2', 'P3', 'P4'],

    // Categories
    categories: ['Network', 'Application', 'Hardware', 'Email', 'Infrastructure', 'Identity'],

    // Teams for assignment
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

    /**
     * Generate the next problem ID
     */
    getNextProblemId() {
        const existingIds = ITSMData.problems.map(p => parseInt(p.id.replace('PRB-', '')));
        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        return `PRB-${String(maxId + 1).padStart(3, '0')}`;
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
     * Get status badge class
     */
    getStatusBadgeClass(status) {
        const statusClasses = {
            'Open': 'badge-open',
            'Under Investigation': 'badge-in-progress',
            'Known Error': 'badge-pending',
            'Resolved': 'badge-resolved'
        };
        return statusClasses[status] || 'badge-new';
    },

    /**
     * Get priority badge class
     */
    getPriorityBadgeClass(priority) {
        return `priority-${priority.toLowerCase()}`;
    },

    /**
     * Render the main problems page
     */
    renderProblems() {
        return `
            <div class="page-header">
                <div class="page-title">Problem Management</div>
                <div class="page-subtitle">Identify root causes and manage known errors</div>
            </div>
            <div class="toolbar">
                <button class="btn btn-primary btn-sm" onclick="ProblemsModule.createNewProblem()">+ New Problem</button>
                <button class="btn btn-secondary btn-sm btn-refresh" onclick="ProblemsModule.refreshData()" title="Refresh data from server"><img src="icons/refresh-alt.png" alt=""> Refresh</button>
                <span id="problems-bulk-actions"></span>
                <div class="toolbar-separator"></div>
                <div class="toolbar-group">
                    <select class="form-control" style="width: 150px; padding: 4px;" id="filter-problem-status" onchange="ProblemsModule.filterProblems()">
                        <option value="">All Status</option>
                        ${this.statuses.map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>
                    <select class="form-control" style="width: 120px; padding: 4px;" id="filter-problem-priority" onchange="ProblemsModule.filterProblems()">
                        <option value="">All Priority</option>
                        ${this.priorities.map(p => `<option value="${p}">${p}</option>`).join('')}
                    </select>
                </div>
                <div class="toolbar-search" style="margin-left: auto;">
                    <input type="text" placeholder="Search problems..." id="problem-search" oninput="ProblemsModule.filterProblems()">
                    <button class="btn btn-sm btn-secondary">Search</button>
                </div>
            </div>
            <div class="page-content">
                <div class="table-container" id="problems-table-container">
                    ${this.renderProblemsTable()}
                </div>
            </div>
        `;
    },

    /**
     * Render the problems table
     */
    renderProblemsTable() {
        const filteredProblems = this.getFilteredProblems();

        if (filteredProblems.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">?</div>
                    <div class="empty-state-title">No Problems Found</div>
                    <div class="empty-state-text">No problems match the current filter criteria</div>
                </div>
            `;
        }

        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width:30px"><input type="checkbox" id="problems-select-all" onchange="ProblemsModule.toggleSelectAll()"></th>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Category</th>
                        <th>Linked Incidents</th>
                        <th>Assigned To</th>
                        <th>Updated</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredProblems.map(prb => `
                        <tr class="${this.selectedIds.has(prb.id) ? 'row-selected' : ''}">
                            <td onclick="event.stopPropagation()"><input type="checkbox" class="row-check-problems" value="${prb.id}" onchange="ProblemsModule.toggleSelection('${prb.id}')" ${this.selectedIds.has(prb.id) ? 'checked' : ''}></td>
                            <td class="cell-id">${prb.id}</td>
                            <td>${Utils.escapeHtml(prb.title)}</td>
                            <td><span class="badge ${this.getStatusBadgeClass(prb.status)}">${prb.status}</span></td>
                            <td><span class="badge ${this.getPriorityBadgeClass(prb.priority)}">${prb.priority}</span></td>
                            <td>${Utils.escapeHtml(prb.category)}</td>
                            <td>${prb.linkedIncidents ? prb.linkedIncidents.length : 0}</td>
                            <td>${Utils.escapeHtml(prb.assignedTo)}</td>
                            <td class="cell-date">${this.formatDateTime(prb.updatedAt)}</td>
                            <td class="cell-actions">
                                <button class="btn btn-sm btn-secondary" onclick="ProblemsModule.viewProblem('${prb.id}')">View</button>
                                ${prb.status === 'Under Investigation' ? `<button class="btn btn-sm btn-warning" onclick="ProblemsModule.convertToKnownError('${prb.id}')">Known Error</button>` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    /**
     * Get filtered problems based on current filters
     */
    getFilteredProblems() {
        const statusFilter = document.getElementById('filter-problem-status')?.value || this.currentFilters.status;
        const priorityFilter = document.getElementById('filter-problem-priority')?.value || this.currentFilters.priority;
        const searchFilter = document.getElementById('problem-search')?.value?.toLowerCase() || '';

        return ITSMData.problems.filter(prb => {
            const matchStatus = !statusFilter || prb.status === statusFilter;
            const matchPriority = !priorityFilter || prb.priority === priorityFilter;
            const matchSearch = !searchFilter ||
                prb.title.toLowerCase().includes(searchFilter) ||
                prb.id.toLowerCase().includes(searchFilter) ||
                (prb.description && prb.description.toLowerCase().includes(searchFilter));
            return matchStatus && matchPriority && matchSearch;
        });
    },

    /**
     * Filter problems and refresh the table
     */
    filterProblems() {
        this.currentFilters.status = document.getElementById('filter-problem-status')?.value || '';
        this.currentFilters.priority = document.getElementById('filter-problem-priority')?.value || '';

        const tableContainer = document.getElementById('problems-table-container');
        if (tableContainer) {
            tableContainer.innerHTML = this.renderProblemsTable();
        }
    },

    /**
     * Create a new problem
     */
    createNewProblem() {
        showModal(`
            <div class="modal-header">
                <span>+ Create New Problem</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 600px; max-height: 70vh; overflow-y: auto;">
                <div class="form-group">
                    <label class="form-label required">Title</label>
                    <input type="text" class="form-control" id="prb-title" placeholder="Brief title describing the problem">
                </div>
                <div class="form-group">
                    <label class="form-label required">Description</label>
                    <textarea class="form-control" id="prb-description" rows="4" placeholder="Detailed description of the problem..."></textarea>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <div class="form-group">
                        <label class="form-label">Priority</label>
                        <select class="form-control" id="prb-priority">
                            <option value="P3">P3 - Medium</option>
                            <option value="P2">P2 - High</option>
                            <option value="P4">P4 - Low</option>
                            <option value="P1">P1 - Critical</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <select class="form-control" id="prb-category">
                            ${this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Assigned To</label>
                    <select class="form-control" id="prb-assigned-to">
                        ${this.teams.map(team => `<option value="${team}">${team}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Initial Workaround (Optional)</label>
                    <textarea class="form-control" id="prb-workaround" rows="2" placeholder="Temporary workaround if available..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Affected Assets</label>
                    ${this.renderAssetMultiSelect([])}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="ProblemsModule.submitNewProblem()">Create Problem</button>
            </div>
        `);
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
                            ${asset.id} - ${Utils.escapeHtml(asset.name)} <span style="color: var(--text-muted);">(${Utils.escapeHtml(asset.type)})</span>
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
     * Submit new problem
     */
    async submitNewProblem() {
        const title = document.getElementById('prb-title').value.trim();
        const description = document.getElementById('prb-description').value.trim();
        const priority = document.getElementById('prb-priority').value;
        const category = document.getElementById('prb-category').value;
        const assignedTo = document.getElementById('prb-assigned-to').value;
        const workaround = document.getElementById('prb-workaround').value.trim();
        const affectedAssets = this.getSelectedAssets();

        if (!title) { showToast('Title is required', 'error'); return; }
        if (!description) { showToast('Description is required', 'error'); return; }

        try {
            const result = await ITSMApi.createProblem({
                title, description, priority, category,
                linkedIncidents: [],
                affectedAssets,
                assignedTo
            });
            if (result.success) {
                closeModal();
                showToast(`Problem ${result.data.id} created successfully`, 'success');
                if (typeof currentModule !== 'undefined' && currentModule === 'problems') {
                    renderModule('problems');
                }
            } else {
                showToast(result.error || 'Failed to create problem', 'error');
            }
        } catch (err) {
            showToast('Failed to create problem: ' + err.message, 'error');
        }
    },

    /**
     * Create problem from an existing incident
     */
    createProblemFromIncident(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>Create Problem from ${incidentId}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 600px; max-height: 70vh; overflow-y: auto;">
                <div style="padding: var(--spacing-md); background: var(--bg-secondary); margin-bottom: var(--spacing-md); border-radius: 4px;">
                    <strong>Source Incident: ${incident.id}</strong>
                    <div style="font-size: 12px; margin-top: 4px;">${Utils.escapeHtml(incident.title)}</div>
                </div>
                <div class="form-group">
                    <label class="form-label required">Problem Title</label>
                    <input type="text" class="form-control" id="prb-title" value="${Utils.escapeHtml(incident.title)}" placeholder="Brief title describing the problem">
                </div>
                <div class="form-group">
                    <label class="form-label required">Description</label>
                    <textarea class="form-control" id="prb-description" rows="4" placeholder="Detailed description of the problem...">${Utils.escapeHtml(incident.description)}</textarea>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <div class="form-group">
                        <label class="form-label">Priority</label>
                        <select class="form-control" id="prb-priority">
                            ${this.priorities.map(p => `
                                <option value="${p}" ${p === incident.priority ? 'selected' : ''}>${p}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <select class="form-control" id="prb-category">
                            ${this.categories.map(cat => `
                                <option value="${cat}" ${cat === incident.category ? 'selected' : ''}>${cat}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Assigned To</label>
                    <select class="form-control" id="prb-assigned-to">
                        ${this.teams.map(team => `
                            <option value="${team}" ${team === incident.assignedTo ? 'selected' : ''}>${team}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Initial Workaround (Optional)</label>
                    <textarea class="form-control" id="prb-workaround" rows="2" placeholder="Temporary workaround if available..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Affected Assets</label>
                    ${this.renderAssetMultiSelect(incident.affectedAsset ? [incident.affectedAsset] : [])}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="ProblemsModule.submitProblemFromIncident('${incidentId}')">Create Problem</button>
            </div>
        `);
    },

    /**
     * Submit problem created from incident
     */
    async submitProblemFromIncident(incidentId) {
        const title = document.getElementById('prb-title').value.trim();
        const description = document.getElementById('prb-description').value.trim();
        const priority = document.getElementById('prb-priority').value;
        const category = document.getElementById('prb-category').value;
        const assignedTo = document.getElementById('prb-assigned-to').value;
        const affectedAssets = this.getSelectedAssets();

        if (!title) { showToast('Title is required', 'error'); return; }
        if (!description) { showToast('Description is required', 'error'); return; }

        try {
            const result = await ITSMApi.createProblem({
                title, description, priority, category,
                linkedIncidents: [incidentId],
                affectedAssets,
                assignedTo
            });
            if (result.success) {
                closeModal();
                showToast(`Problem ${result.data.id} created from ${incidentId}`, 'success');
            } else {
                showToast(result.error || 'Failed to create problem', 'error');
            }
        } catch (err) {
            showToast('Failed to create problem: ' + err.message, 'error');
        }
    },

    /**
     * View problem details
     */
    viewProblem(problemId) {
        const problem = ITSMData.problems.find(p => p.id === problemId);
        if (!problem) {
            showToast('Problem not found', 'error');
            return;
        }
        if (typeof updateHash === 'function') updateHash('problems', problemId);

        const linkedIncidentsList = this.renderLinkedIncidents(problem);
        const affectedAssetsList = this.renderAffectedAssets(problem);
        const actionButtons = this.getActionButtons(problem);

        showModal(`
            <div class="modal-header">
                <span>${problem.id}: ${Utils.escapeHtml(problem.title)}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 750px; max-height: 75vh; overflow-y: auto;">
                <!-- Status Bar -->
                <div style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div>
                        <strong>Status:</strong>
                        <span class="badge ${this.getStatusBadgeClass(problem.status)}">${problem.status}</span>
                    </div>
                    <div>
                        <strong>Priority:</strong>
                        <span class="badge ${this.getPriorityBadgeClass(problem.priority)}">${problem.priority}</span>
                    </div>
                    <div>
                        <strong>Category:</strong>
                        <span>${Utils.escapeHtml(problem.category)}</span>
                    </div>
                    <div>
                        <strong>Assigned To:</strong>
                        <span>${Utils.escapeHtml(problem.assignedTo)}</span>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="tabs">
                    <div class="tab-item active" onclick="ProblemsModule.showProblemTab('details')">Details</div>
                    <div class="tab-item" onclick="ProblemsModule.showProblemTab('root-cause')">Root Cause Analysis</div>
                    <div class="tab-item" onclick="ProblemsModule.showProblemTab('incidents')">Linked Incidents (${problem.linkedIncidents ? problem.linkedIncidents.length : 0})</div>
                    <div class="tab-item" onclick="ProblemsModule.showProblemTab('assets')">Affected Assets (${problem.affectedAssets ? problem.affectedAssets.length : 0})</div>
                </div>

                <!-- Details Tab -->
                <div class="tab-content active" id="tab-details">
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" rows="4" readonly>${Utils.escapeHtml(problem.description)}</textarea>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                        <div class="form-group">
                            <label class="form-label">Created</label>
                            <input type="text" class="form-control" value="${this.formatDateTime(problem.createdAt)}" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Last Updated</label>
                            <input type="text" class="form-control" value="${this.formatDateTime(problem.updatedAt)}" readonly>
                        </div>
                    </div>
                    ${problem.assignee ? `
                    <div class="form-group">
                        <label class="form-label">Assignee</label>
                        <input type="text" class="form-control" value="${Utils.escapeHtml(problem.assignee)}" readonly>
                    </div>
                    ` : ''}
                </div>

                <!-- Root Cause Analysis Tab -->
                <div class="tab-content" id="tab-root-cause">
                    <div class="form-group">
                        <label class="form-label">Root Cause ${problem.status === 'Known Error' || problem.status === 'Resolved' ? '' : '(Not yet identified)'}</label>
                        <textarea class="form-control" rows="4" readonly placeholder="Root cause has not been identified yet">${Utils.escapeHtml(problem.rootCause || '')}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Workaround</label>
                        <textarea class="form-control" rows="3" readonly placeholder="No workaround documented">${Utils.escapeHtml(problem.workaround || '')}</textarea>
                    </div>
                    ${problem.status === 'Under Investigation' ? `
                    <div style="margin-top: var(--spacing-md);">
                        <button class="btn btn-warning" onclick="ProblemsModule.convertToKnownError('${problem.id}')">Convert to Known Error</button>
                    </div>
                    ` : ''}
                </div>

                <!-- Linked Incidents Tab -->
                <div class="tab-content" id="tab-incidents">
                    <div style="margin-bottom: var(--spacing-md);">
                        <button class="btn btn-sm btn-primary" onclick="ProblemsModule.linkIncidents('${problem.id}')">Link Incidents</button>
                    </div>
                    ${linkedIncidentsList}
                </div>

                <!-- Affected Assets Tab -->
                <div class="tab-content" id="tab-assets">
                    ${affectedAssetsList}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                ${actionButtons}
            </div>
        `);
    },

    /**
     * Show problem tab
     */
    showProblemTab(tabId) {
        document.querySelectorAll('.modal-body .tab-item').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.modal-body .tab-content').forEach(c => c.classList.remove('active'));

        event.target.classList.add('active');
        document.getElementById(`tab-${tabId}`).classList.add('active');
    },

    /**
     * Render linked incidents list
     */
    renderLinkedIncidents(problem) {
        if (!problem.linkedIncidents || problem.linkedIncidents.length === 0) {
            return '<div class="empty-state"><div class="empty-state-text">No linked incidents</div></div>';
        }

        return `
            <div style="border: 1px solid var(--border-color); border-radius: 4px;">
                ${problem.linkedIncidents.map(incId => {
                    const incident = ITSMData.incidents.find(i => i.id === incId);
                    const title = incident ? incident.title : 'Loading...';
                    const status = incident ? incident.status : 'Unknown';
                    const category = incident ? incident.category : '';
                    return `
                        <div style="padding: var(--spacing-sm); border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${incId}</strong>: ${Utils.escapeHtml(title)}
                                <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                                    <span class="badge ${status.toLowerCase().replace(' ', '-')}">${status}</span>
                                    ${category ? `<span style="margin-left: 8px;">${Utils.escapeHtml(category)}</span>` : ''}
                                </div>
                            </div>
                            <div>
                                ${incident ? `<button class="btn btn-sm btn-secondary" onclick="openIncidentDetail('${incId}'); closeModal();">View</button>` : ''}
                                <button class="btn btn-sm btn-danger" onclick="ProblemsModule.unlinkIncident('${problem.id}', '${incId}')">Unlink</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    /**
     * Render affected assets list
     */
    renderAffectedAssets(problem) {
        if (!problem.affectedAssets || problem.affectedAssets.length === 0) {
            return '<div class="empty-state"><div class="empty-state-text">No affected assets</div></div>';
        }

        return `
            <div style="border: 1px solid var(--border-color); border-radius: 4px;">
                ${problem.affectedAssets.map(assetId => {
                    const asset = ITSMData.assets.find(a => a.id === assetId);
                    if (!asset) return `<div style="padding: var(--spacing-sm);">${assetId} (Asset not found)</div>`;
                    return `
                        <div style="padding: var(--spacing-sm); border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${asset.id}</strong>: ${Utils.escapeHtml(asset.name)}
                                <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                                    Type: ${Utils.escapeHtml(asset.type)} | Status:
                                    <span style="color: ${asset.status === 'Active' ? 'var(--accent-green)' : asset.status === 'Warning' ? 'var(--accent-orange)' : 'var(--accent-red)'};">
                                        ${asset.status}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-secondary" onclick="ProblemsModule.viewAsset('${asset.id}')">View</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    /**
     * View asset (placeholder - would integrate with AssetsModule)
     */
    viewAsset(assetId) {
        const asset = ITSMData.assets.find(a => a.id === assetId);
        if (!asset) {
            showToast('Asset not found', 'error');
            return;
        }
        showToast(`Viewing asset ${assetId}: ${asset.name}`, 'info');
    },

    /**
     * Get action buttons based on problem status
     */
    getActionButtons(problem) {
        const buttons = [];

        switch (problem.status) {
            case 'Open':
                buttons.push(`<button class="btn btn-primary" onclick="ProblemsModule.startInvestigation('${problem.id}')">Start Investigation</button>`);
                break;
            case 'Under Investigation':
                buttons.push(`<button class="btn btn-warning" onclick="ProblemsModule.convertToKnownError('${problem.id}')">Convert to Known Error</button>`);
                break;
            case 'Known Error':
                buttons.push(`<button class="btn btn-success" onclick="ProblemsModule.resolveProblem('${problem.id}')">Resolve Problem</button>`);
                break;
        }

        return buttons.join(' ');
    },

    /**
     * Start investigation on a problem
     */
    async startInvestigation(problemId) {
        try {
            const result = await ITSMApi.updateProblemStatus(problemId, 'Under Investigation');
            if (result.success) {
                closeModal();
                showToast(`${problemId} is now under investigation`, 'success');
                if (typeof currentModule !== 'undefined' && currentModule === 'problems') {
                    renderModule('problems');
                }
            } else {
                showToast(result.error || 'Failed to start investigation', 'error');
            }
        } catch (err) {
            showToast('Failed to start investigation: ' + err.message, 'error');
        }
    },

    /**
     * Convert problem to Known Error
     */
    convertToKnownError(problemId) {
        const problem = ITSMData.problems.find(p => p.id === problemId);
        if (!problem) {
            showToast('Problem not found', 'error');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>Convert to Known Error: ${problemId}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 550px;">
                <div style="padding: var(--spacing-md); background: var(--bg-secondary); margin-bottom: var(--spacing-md); border-radius: 4px;">
                    <strong>${Utils.escapeHtml(problem.title)}</strong>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                        Priority: ${problem.priority} | Category: ${Utils.escapeHtml(problem.category)}
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label required">Root Cause</label>
                    <textarea class="form-control" id="ke-root-cause" rows="4" placeholder="Describe the identified root cause of this problem...">${Utils.escapeHtml(problem.rootCause || '')}</textarea>
                </div>

                <div class="form-group">
                    <label class="form-label required">Workaround</label>
                    <textarea class="form-control" id="ke-workaround" rows="3" placeholder="Describe the workaround for affected users...">${Utils.escapeHtml(problem.workaround || '')}</textarea>
                </div>

                <div style="padding: var(--spacing-sm); background: rgba(255, 193, 7, 0.1); border: 1px solid var(--accent-orange); border-radius: 4px;">
                    <strong style="color: var(--accent-orange);">Known Error Status</strong>
                    <p style="margin: 4px 0 0 0; font-size: 12px;">
                        A Known Error indicates that the root cause has been identified and a workaround is available,
                        but a permanent fix may still be pending.
                    </p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="ProblemsModule.viewProblem('${problemId}')">Back</button>
                <button class="btn btn-warning" onclick="ProblemsModule.confirmKnownError('${problemId}')">Convert to Known Error</button>
            </div>
        `);
    },

    /**
     * Confirm conversion to Known Error
     */
    async confirmKnownError(problemId) {
        const rootCause = document.getElementById('ke-root-cause').value.trim();
        const workaround = document.getElementById('ke-workaround').value.trim();

        if (!rootCause) { showToast('Root cause is required', 'error'); return; }
        if (!workaround) { showToast('Workaround is required', 'error'); return; }

        try {
            const result = await ITSMApi.updateProblemRootCause(problemId, rootCause, workaround, true);
            if (result.success) {
                closeModal();
                showToast(`${problemId} converted to Known Error`, 'success');
                if (typeof currentModule !== 'undefined' && currentModule === 'problems') {
                    renderModule('problems');
                }
            } else {
                showToast(result.error || 'Failed to convert to Known Error', 'error');
            }
        } catch (err) {
            showToast('Failed to convert to Known Error: ' + err.message, 'error');
        }
    },

    /**
     * Resolve a problem
     */
    resolveProblem(problemId) {
        const problem = ITSMData.problems.find(p => p.id === problemId);
        if (!problem) {
            showToast('Problem not found', 'error');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>Resolve Problem: ${problemId}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 500px;">
                <div style="padding: var(--spacing-md); background: var(--bg-secondary); margin-bottom: var(--spacing-md); border-radius: 4px;">
                    <strong>${Utils.escapeHtml(problem.title)}</strong>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                        Status: ${problem.status} | Linked Incidents: ${problem.linkedIncidents ? problem.linkedIncidents.length : 0}
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Root Cause</label>
                    <textarea class="form-control" rows="3" readonly>${Utils.escapeHtml(problem.rootCause || 'Not documented')}</textarea>
                </div>

                <div class="form-group">
                    <label class="form-label required">Resolution Notes</label>
                    <textarea class="form-control" id="resolve-notes" rows="3" placeholder="Describe the permanent fix or resolution..."></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Resolution Code</label>
                    <select class="form-control" id="resolve-code">
                        <option value="Permanent Fix">Permanent Fix Applied</option>
                        <option value="Workaround Accepted">Workaround Accepted as Solution</option>
                        <option value="Not Reproducible">Cannot Reproduce</option>
                        <option value="Duplicate">Duplicate Problem</option>
                        <option value="No Action">No Action Required</option>
                    </select>
                </div>

                <div style="padding: var(--spacing-sm); background: rgba(var(--green-rgb), 0.1); border: 1px solid var(--accent-green); border-radius: 4px;">
                    <strong style="color: var(--accent-green);">Resolution Confirmation</strong>
                    <p style="margin: 4px 0 0 0; font-size: 12px;">
                        Resolving this problem will mark it as completed. Linked incidents should be reviewed separately.
                    </p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="ProblemsModule.viewProblem('${problemId}')">Back</button>
                <button class="btn btn-success" onclick="ProblemsModule.confirmResolve('${problemId}')">Resolve Problem</button>
            </div>
        `);
    },

    /**
     * Confirm problem resolution
     */
    async confirmResolve(problemId) {
        const resolveNotes = document.getElementById('resolve-notes').value.trim();
        const resolveCode = document.getElementById('resolve-code').value;

        if (!resolveNotes) { showToast('Resolution notes are required', 'error'); return; }

        try {
            const result = await ITSMApi.updateProblemStatus(problemId, 'Resolved');
            if (result.success) {
                // Also save resolution details
                await ITSMApi.saveEntity('problems', problemId, {
                    resolutionCode: resolveCode,
                    resolutionNotes: resolveNotes,
                    resolvedAt: new Date().toISOString()
                });
                closeModal();
                showToast(`${problemId} has been resolved`, 'success');
                if (typeof currentModule !== 'undefined' && currentModule === 'problems') {
                    renderModule('problems');
                }
            } else {
                showToast(result.error || 'Failed to resolve problem', 'error');
            }
        } catch (err) {
            showToast('Failed to resolve problem: ' + err.message, 'error');
        }
    },

    /**
     * Link incidents to a problem
     */
    linkIncidents(problemId) {
        const problem = ITSMData.problems.find(p => p.id === problemId);
        if (!problem) {
            showToast('Problem not found', 'error');
            return;
        }

        // Get incidents that are not already linked
        const availableIncidents = ITSMData.incidents.filter(inc =>
            !problem.linkedIncidents || !problem.linkedIncidents.includes(inc.id)
        );

        showModal(`
            <div class="modal-header">
                <span>Link Incidents to ${problemId}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 600px; max-height: 60vh; overflow-y: auto;">
                <div class="form-group">
                    <label class="form-label">Search Incidents</label>
                    <input type="text" class="form-control" id="link-incident-search" placeholder="Search by ID or summary..." oninput="ProblemsModule.filterLinkableIncidents('${problemId}')">
                </div>

                <div class="form-group">
                    <label class="form-label">Select Incidents to Link</label>
                    <div id="linkable-incidents-list" style="max-height: 300px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 4px;">
                        ${this.renderLinkableIncidents(availableIncidents, problemId)}
                    </div>
                </div>

                <div style="font-size: 11px; color: var(--text-muted); margin-top: var(--spacing-sm);">
                    ${availableIncidents.length} incident(s) available for linking
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="ProblemsModule.viewProblem('${problemId}')">Back</button>
                <button class="btn btn-primary" onclick="ProblemsModule.confirmLinkIncidents('${problemId}')">Link Selected</button>
            </div>
        `);
    },

    /**
     * Render linkable incidents list
     */
    renderLinkableIncidents(incidents, problemId) {
        if (incidents.length === 0) {
            return '<div style="padding: var(--spacing-md); text-align: center; color: var(--text-muted);">No incidents available for linking</div>';
        }

        return incidents.map(inc => `
            <div style="padding: var(--spacing-sm); border-bottom: 1px solid var(--border-light);">
                <div class="form-check" style="display: flex; align-items: flex-start;">
                    <input type="checkbox" id="link-inc-${inc.id}" value="${inc.id}" class="link-incident-checkbox" style="margin-top: 3px;">
                    <label for="link-inc-${inc.id}" style="cursor: pointer; margin-left: 8px; flex: 1;">
                        <strong>${inc.id}</strong>: ${Utils.escapeHtml(inc.title)}
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                            <span class="badge ${inc.status.toLowerCase().replace(' ', '-')}">${inc.status}</span>
                            <span style="margin-left: 8px;">Priority: ${inc.priority}</span>
                            <span style="margin-left: 8px;">Category: ${Utils.escapeHtml(inc.category)}</span>
                        </div>
                    </label>
                </div>
            </div>
        `).join('');
    },

    /**
     * Filter linkable incidents
     */
    filterLinkableIncidents(problemId) {
        const problem = ITSMData.problems.find(p => p.id === problemId);
        if (!problem) return;

        const searchTerm = document.getElementById('link-incident-search').value.toLowerCase();
        const availableIncidents = ITSMData.incidents.filter(inc => {
            const notLinked = !problem.linkedIncidents || !problem.linkedIncidents.includes(inc.id);
            const matchesSearch = !searchTerm ||
                inc.id.toLowerCase().includes(searchTerm) ||
                inc.title.toLowerCase().includes(searchTerm);
            return notLinked && matchesSearch;
        });

        const container = document.getElementById('linkable-incidents-list');
        if (container) {
            container.innerHTML = this.renderLinkableIncidents(availableIncidents, problemId);
        }
    },

    /**
     * Confirm linking selected incidents
     */
    async confirmLinkIncidents(problemId) {
        const checkboxes = document.querySelectorAll('.link-incident-checkbox:checked');
        const selectedIncidents = Array.from(checkboxes).map(cb => cb.value);

        if (selectedIncidents.length === 0) {
            showToast('Please select at least one incident to link', 'warning');
            return;
        }

        try {
            for (const incId of selectedIncidents) {
                await ITSMApi.linkIncidentToProblem(problemId, incId);
            }
            showToast(`${selectedIncidents.length} incident(s) linked to ${problemId}`, 'success');
            this.viewProblem(problemId);
        } catch (err) {
            showToast('Failed to link incidents: ' + err.message, 'error');
        }
    },

    /**
     * Unlink an incident from a problem
     */
    async unlinkIncident(problemId, incidentId) {
        const problem = ITSMData.problems.find(p => p.id === problemId);
        if (!problem || !problem.linkedIncidents) {
            showToast('Problem not found', 'error');
            return;
        }

        try {
            const result = await ITSMApi.unlinkIncidentFromProblem(problemId, incidentId);
            if (result.success) {
                showToast(`${incidentId} unlinked from ${problemId}`, 'success');
            } else {
                showToast(result.error || 'Failed to unlink incident', 'error');
            }
            this.viewProblem(problemId);
        } catch (err) {
            showToast('Failed to unlink incident: ' + err.message, 'error');
        }
    },

    // ── Selection & Bulk Operations ──

    toggleSelection(id) {
        if (this.selectedIds.has(id)) this.selectedIds.delete(id);
        else this.selectedIds.add(id);
        const row = document.querySelector(`.row-check-problems[value="${id}"]`);
        if (row) row.closest('tr').classList.toggle('row-selected', this.selectedIds.has(id));
        this.updateSelectAll();
        this.updateBulkActions();
    },

    toggleSelectAll() {
        const filtered = this.getFilteredProblems();
        const allChecked = filtered.length > 0 && filtered.every(p => this.selectedIds.has(p.id));
        filtered.forEach(p => {
            if (allChecked) this.selectedIds.delete(p.id); else this.selectedIds.add(p.id);
        });
        document.querySelectorAll('.row-check-problems').forEach(cb => {
            cb.checked = this.selectedIds.has(cb.value);
            cb.closest('tr').classList.toggle('row-selected', cb.checked);
        });
        this.updateSelectAll();
        this.updateBulkActions();
    },

    updateSelectAll() {
        const el = document.getElementById('problems-select-all');
        if (!el) return;
        const filtered = this.getFilteredProblems();
        const count = filtered.filter(p => this.selectedIds.has(p.id)).length;
        el.checked = count === filtered.length && filtered.length > 0;
        el.indeterminate = count > 0 && count < filtered.length;
    },

    updateBulkActions() {
        const el = document.getElementById('problems-bulk-actions');
        if (!el) return;
        const n = this.selectedIds.size;
        el.innerHTML = n > 0
            ? `<button class="btn btn-danger btn-sm" onclick="ProblemsModule.deleteSelected()">Delete Selected (${n})</button>`
            : '';
    },

    async refreshData() {
        const btn = document.querySelector('#problems-bulk-actions')?.closest('.toolbar')?.querySelector('.btn-refresh');
        if (btn) btn.classList.add('refreshing');
        try {
            await ITSMApi.loadCollection('problems');
            this.selectedIds.clear();
            const container = document.getElementById('problems-table-container');
            if (container) container.innerHTML = this.renderProblemsTable();
            if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
            showToast('Problems refreshed', 'success');
        } catch (err) {
            showToast('Failed to refresh: ' + err.message, 'error');
        } finally {
            if (btn) btn.classList.remove('refreshing');
        }
    },

    deleteSelected() {
        const ids = Array.from(this.selectedIds);
        if (ids.length === 0) return;
        showModal(`
            <div class="modal-header"><span>Delete ${ids.length} Problem${ids.length !== 1 ? 's' : ''}</span><button class="panel-close" onclick="closeModal()">x</button></div>
            <div class="modal-body" style="width:450px;">
                <p>Are you sure you want to permanently delete:</p>
                <div style="margin:var(--spacing-sm) 0;padding:var(--spacing-sm);background:var(--bg-secondary);border-radius:4px;max-height:150px;overflow-y:auto;font-family:monospace;font-size:12px;">${ids.join(', ')}</div>
                <p style="color:#cc4444;font-size:12px;">This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-danger" onclick="ProblemsModule.confirmDeleteSelected()">Delete</button>
            </div>
        `);
    },

    async confirmDeleteSelected() {
        const ids = Array.from(this.selectedIds);
        closeModal();
        try {
            const result = await ITSMApi.bulkDelete('problems', ids);
            if (result.success) {
                this.selectedIds.clear();
                const container = document.getElementById('problems-table-container');
                if (container) container.innerHTML = this.renderProblemsTable();
                if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
                showToast(`Deleted ${result.deleted.length} problem(s)`, 'success');
            }
        } catch (err) {
            showToast('Failed to delete: ' + err.message, 'error');
        }
    }
};

// Export module to window
window.ProblemsModule = ProblemsModule;

// Global render function for module system
window.renderProblems = function() {
    return ProblemsModule.renderProblems();
};

// Override or expose functions globally for onclick handlers
window.createProblemFromIncident = function(incidentId) {
    ProblemsModule.createProblemFromIncident(incidentId);
};
