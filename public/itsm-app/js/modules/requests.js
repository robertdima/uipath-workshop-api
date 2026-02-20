/**
 * ITSM Console - Service Requests Module
 * First-class ticket type for service requests with full lifecycle management
 */

const RequestsModule = {
    // Selection state
    selectedIds: new Set(),

    // Status workflow
    statuses: ['Draft', 'Submitted', 'Pending Approval', 'Approved', 'Rejected', 'In Progress', 'Fulfilled', 'Closed', 'Cancelled'],

    // Status badge classes (reuse existing CSS classes)
    statusBadgeClass: {
        'Draft': 'badge-new',
        'Submitted': 'badge-new',
        'Pending Approval': 'badge-open',
        'Approved': 'badge-in-progress',
        'Rejected': 'badge-closed',
        'In Progress': 'badge-in-progress',
        'Fulfilled': 'badge-resolved',
        'Closed': 'badge-closed',
        'Cancelled': 'badge-closed'
    },

    // Priority levels
    priorities: ['Low', 'Normal', 'High', 'Critical'],

    // Currently selected request
    selectedRequest: null,

    /**
     * Generate a unique request ID
     */
    generateRequestId: function() {
        const existingIds = ITSMData.serviceRequests.map(r => parseInt(r.id.replace('REQ-', '')));
        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        return `REQ-${String(maxId + 1).padStart(3, '0')}`;
    },

    /**
     * Get request by ID
     */
    getRequest: function(requestId) {
        return ITSMData.serviceRequests.find(r => r.id === requestId) || null;
    },

    /**
     * Get filtered requests based on current filters
     */
    getFilteredRequests: function() {
        let requests = [...ITSMData.serviceRequests];
        const statusFilter = document.getElementById('req-filter-status')?.value || '';
        const categoryFilter = document.getElementById('req-filter-category')?.value || '';
        const searchTerm = document.getElementById('req-search')?.value?.toLowerCase() || '';

        if (statusFilter) requests = requests.filter(r => r.status === statusFilter);
        if (categoryFilter) requests = requests.filter(r => r.category === categoryFilter);
        if (searchTerm) {
            requests = requests.filter(r =>
                r.id.toLowerCase().includes(searchTerm) ||
                r.title.toLowerCase().includes(searchTerm) ||
                r.requestedByName.toLowerCase().includes(searchTerm) ||
                (r.catalogItemName || '').toLowerCase().includes(searchTerm)
            );
        }

        return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    // ==================== RENDERING ====================

    /**
     * Render the main requests page (split-pane layout)
     */
    renderRequestsPage: function() {
        return `
            <div class="split-pane">
                <div class="split-left">
                    <div class="toolbar">
                        <div class="toolbar-group">
                            <button class="btn btn-primary btn-sm" onclick="RequestsModule.showCreateRequest()">+ New Request</button>
                            <button class="btn btn-secondary btn-sm btn-refresh" onclick="RequestsModule.refreshData()" title="Refresh data from server"><img src="icons/refresh-alt.png" alt=""> Refresh</button>
                            <span id="requests-bulk-actions"></span>
                        </div>
                        <div class="toolbar-separator"></div>
                        <div class="toolbar-group">
                            <select class="form-control" style="width: 140px; padding: 4px;" id="req-filter-status" onchange="RequestsModule.refreshList()">
                                <option value="">All Status</option>
                                ${this.statuses.map(s => `<option value="${s}">${s}</option>`).join('')}
                            </select>
                            <select class="form-control" style="width: 120px; padding: 4px;" id="req-filter-category" onchange="RequestsModule.refreshList()">
                                <option value="">All Categories</option>
                                <option value="Hardware">Hardware</option>
                                <option value="Software">Software</option>
                                <option value="Access">Access</option>
                                <option value="Logistics">Logistics</option>
                                <option value="Facilities">Facilities</option>
                                <option value="Security">Security</option>
                            </select>
                        </div>
                        <div class="toolbar-search" style="margin-left: auto;">
                            <input type="text" placeholder="Search requests..." id="req-search" oninput="RequestsModule.refreshList()">
                        </div>
                    </div>
                    <div class="split-content" id="request-list">
                        ${this.renderRequestList()}
                    </div>
                </div>
                <div class="split-right">
                    <div class="split-header" id="req-detail-header">Select a request to view details</div>
                    <div class="split-content" id="request-detail">
                        <div class="empty-state">
                            <div class="empty-state-icon">📋</div>
                            <div class="empty-state-title">No Request Selected</div>
                            <div class="empty-state-text">Click on a request from the list to view details</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render request list rows
     */
    renderRequestList: function() {
        const requests = this.getFilteredRequests();
        if (requests.length === 0) {
            return '<div class="empty-state"><div class="empty-state-text">No requests found</div></div>';
        }
        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width:30px"><input type="checkbox" id="requests-select-all" onchange="RequestsModule.toggleSelectAll()"></th>
                        <th>ID</th>
                        <th>Service</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Requester</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    ${requests.map(r => `
                        <tr class="clickable ${this.selectedRequest === r.id ? 'selected' : ''} ${this.selectedIds.has(r.id) ? 'row-selected' : ''}" onclick="RequestsModule.selectRequest('${r.id}')">
                            <td onclick="event.stopPropagation()"><input type="checkbox" class="row-check-requests" value="${r.id}" onchange="RequestsModule.toggleSelection('${r.id}')" ${this.selectedIds.has(r.id) ? 'checked' : ''}></td>
                            <td class="cell-id">${r.id}</td>
                            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${r.catalogItemName || r.title}">${r.catalogItemName || r.title}</td>
                            <td><span class="badge ${this.statusBadgeClass[r.status] || 'badge-new'}">${r.status}</span></td>
                            <td>${r.priority}</td>
                            <td>${r.requestedByName}</td>
                            <td>${new Date(r.createdAt).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    /**
     * Refresh the list after filter changes
     */
    refreshList: function() {
        const listEl = document.getElementById('request-list');
        if (listEl) listEl.innerHTML = this.renderRequestList();
    },

    /**
     * Select a request and show its details
     */
    selectRequest: function(requestId) {
        this.selectedRequest = requestId;
        this.refreshList();
        const request = this.getRequest(requestId);
        if (!request) return;

        const headerEl = document.getElementById('req-detail-header');
        const detailEl = document.getElementById('request-detail');
        if (headerEl) headerEl.innerHTML = `${request.id} - ${request.catalogItemName || request.title}`;
        if (detailEl) detailEl.innerHTML = this.renderRequestDetail(request);
    },

    /**
     * Render request detail view
     */
    renderRequestDetail: function(r) {
        const catItem = ITSMData.catalogItems.find(c => c.id === r.catalogItem);
        const sla = typeof SLAModule !== 'undefined' ? SLAModule.calculateSLA(r) : null;

        return `
            <div style="padding: var(--spacing-md);">
                <!-- Action Bar -->
                <div style="display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-md); flex-wrap: wrap;">
                    ${this.renderActionButtons(r)}
                </div>

                <!-- Status & Priority -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
                    <div>
                        <label class="form-label" style="color: var(--text-muted);">Status</label>
                        <div><span class="badge ${this.statusBadgeClass[r.status]}">${r.status}</span></div>
                    </div>
                    <div>
                        <label class="form-label" style="color: var(--text-muted);">Priority</label>
                        <div>${r.priority}</div>
                    </div>
                    <div>
                        <label class="form-label" style="color: var(--text-muted);">Category</label>
                        <div>${r.category}</div>
                    </div>
                </div>

                <!-- Request Info -->
                <div class="card" style="margin-bottom: var(--spacing-md);">
                    <div class="card-header"><span>Request Information</span></div>
                    <div class="card-body">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                            <div>
                                <label class="form-label" style="color: var(--text-muted);">Catalog Item</label>
                                <div>${r.catalogItemName || 'N/A'}</div>
                            </div>
                            <div>
                                <label class="form-label" style="color: var(--text-muted);">Expected Fulfillment</label>
                                <div>${r.expectedFulfillment || 'N/A'}</div>
                            </div>
                            <div>
                                <label class="form-label" style="color: var(--text-muted);">Estimated Cost</label>
                                <div>${r.estimatedCost || 'N/A'}</div>
                            </div>
                            <div>
                                <label class="form-label" style="color: var(--text-muted);">Actual Cost</label>
                                <div>${r.actualCost || 'N/A'}</div>
                            </div>
                        </div>
                        ${r.description ? `<div style="margin-top: var(--spacing-md);"><label class="form-label" style="color: var(--text-muted);">Description</label><div>${r.description}</div></div>` : ''}
                    </div>
                </div>

                <!-- Requester Info -->
                <div class="card" style="margin-bottom: var(--spacing-md);">
                    <div class="card-header"><span>Requester Information</span></div>
                    <div class="card-body">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                            <div>
                                <label class="form-label" style="color: var(--text-muted);">Requested By</label>
                                <div>${r.requestedByName} ${r.requestedForVip ? '<span class="badge" style="background: gold; color: black;">VIP</span>' : ''}</div>
                            </div>
                            <div>
                                <label class="form-label" style="color: var(--text-muted);">Requested For</label>
                                <div>${r.requestedForName || r.requestedFor}</div>
                            </div>
                            <div>
                                <label class="form-label" style="color: var(--text-muted);">Department</label>
                                <div>${r.requestedForDepartment || 'N/A'}</div>
                            </div>
                            <div>
                                <label class="form-label" style="color: var(--text-muted);">Location</label>
                                <div>${r.requestedForLocation || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Form Data -->
                ${r.formData && Object.keys(r.formData).length > 0 ? `
                <div class="card" style="margin-bottom: var(--spacing-md);">
                    <div class="card-header"><span>Service Details</span></div>
                    <div class="card-body">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                            ${Object.entries(r.formData).map(([key, value]) => {
                                const field = catItem ? catItem.fields.find(f => f.name === key) : null;
                                const label = field ? field.label : key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                return `<div><label class="form-label" style="color: var(--text-muted);">${label}</label><div style="white-space: pre-wrap;">${value || 'N/A'}</div></div>`;
                            }).join('')}
                        </div>
                    </div>
                </div>` : ''}

                <!-- Approval Info -->
                ${r.approvalRequired ? `
                <div class="card" style="margin-bottom: var(--spacing-md);">
                    <div class="card-header"><span>Approval</span></div>
                    <div class="card-body">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                            <div>
                                <label class="form-label" style="color: var(--text-muted);">Approver</label>
                                <div>${r.approverName || r.approver || 'Not assigned'}</div>
                            </div>
                            <div>
                                <label class="form-label" style="color: var(--text-muted);">Approval Date</label>
                                <div>${r.approvalDate ? new Date(r.approvalDate).toLocaleString() : 'Pending'}</div>
                            </div>
                            ${r.approvalComments ? `<div style="grid-column: 1 / -1;"><label class="form-label" style="color: var(--text-muted);">Comments</label><div>${r.approvalComments}</div></div>` : ''}
                            ${r.rejectionReason ? `<div style="grid-column: 1 / -1;"><label class="form-label" style="color: var(--text-muted);">Rejection Reason</label><div style="color: var(--accent-red);">${r.rejectionReason}</div></div>` : ''}
                        </div>
                    </div>
                </div>` : ''}

                <!-- Assignment -->
                <div class="card" style="margin-bottom: var(--spacing-md);">
                    <div class="card-header"><span>Assignment</span></div>
                    <div class="card-body">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                            <div>
                                <label class="form-label" style="color: var(--text-muted);">Assignment Group</label>
                                <div>${r.assignmentGroup || 'Unassigned'}</div>
                            </div>
                            <div>
                                <label class="form-label" style="color: var(--text-muted);">Assigned To</label>
                                <div>${r.assigneeName || 'Unassigned'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Timestamps -->
                <div class="card" style="margin-bottom: var(--spacing-md);">
                    <div class="card-header"><span>Timeline</span></div>
                    <div class="card-body">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                            <div>
                                <label class="form-label" style="color: var(--text-muted);">Created</label>
                                <div>${new Date(r.createdAt).toLocaleString()}</div>
                            </div>
                            <div>
                                <label class="form-label" style="color: var(--text-muted);">Last Updated</label>
                                <div>${new Date(r.updatedAt).toLocaleString()}</div>
                            </div>
                            ${r.fulfillmentDate ? `<div><label class="form-label" style="color: var(--text-muted);">Fulfilled</label><div>${new Date(r.fulfillmentDate).toLocaleString()}</div></div>` : ''}
                            ${r.closedAt ? `<div><label class="form-label" style="color: var(--text-muted);">Closed</label><div>${new Date(r.closedAt).toLocaleString()}</div></div>` : ''}
                            ${r.slaTarget ? `<div><label class="form-label" style="color: var(--text-muted);">SLA Target</label><div>${new Date(r.slaTarget).toLocaleString()}</div></div>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Notes -->
                <div class="card" style="margin-bottom: var(--spacing-md);">
                    <div class="card-header">
                        <span>Activity & Notes (${r.notes.length})</span>
                        ${!['Closed', 'Cancelled'].includes(r.status) ? `<button class="btn btn-sm btn-secondary" onclick="RequestsModule.showAddNoteModal('${r.id}')">Add Note</button>` : ''}
                    </div>
                    <div class="card-body" style="max-height: 300px; overflow-y: auto;">
                        ${r.notes.length === 0 ? '<div style="color: var(--text-muted);">No notes yet</div>' :
                        [...r.notes].reverse().map(note => `
                            <div style="padding: var(--spacing-sm); margin-bottom: var(--spacing-sm); border-left: 3px solid ${note.type === 'customer' ? 'var(--accent-green)' : note.type === 'system' ? 'var(--accent-blue)' : 'var(--accent-orange)'}; background: var(--bg-secondary);">
                                <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>${note.author} (${note.type})</span>
                                    <span>${new Date(note.timestamp).toLocaleString()}</span>
                                </div>
                                <div style="font-size: 13px;">${note.content}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render action buttons based on current status
     */
    renderActionButtons: function(r) {
        const buttons = [];
        switch (r.status) {
            case 'Draft':
                buttons.push(`<button class="btn btn-primary btn-sm" onclick="RequestsModule.submitRequest('${r.id}')">Submit</button>`);
                buttons.push(`<button class="btn btn-secondary btn-sm" onclick="RequestsModule.cancelRequest('${r.id}')">Cancel</button>`);
                break;
            case 'Submitted':
                if (r.approvalRequired) {
                    buttons.push(`<button class="btn btn-primary btn-sm" onclick="RequestsModule.approveRequest('${r.id}')">Approve</button>`);
                    buttons.push(`<button class="btn btn-secondary btn-sm" onclick="RequestsModule.rejectRequest('${r.id}')">Reject</button>`);
                }
                buttons.push(`<button class="btn btn-secondary btn-sm" onclick="RequestsModule.cancelRequest('${r.id}')">Cancel</button>`);
                break;
            case 'Pending Approval':
                buttons.push(`<button class="btn btn-primary btn-sm" onclick="RequestsModule.approveRequest('${r.id}')">Approve</button>`);
                buttons.push(`<button class="btn btn-secondary btn-sm" onclick="RequestsModule.rejectRequest('${r.id}')">Reject</button>`);
                break;
            case 'Approved':
                buttons.push(`<button class="btn btn-primary btn-sm" onclick="RequestsModule.startFulfillment('${r.id}')">Start Fulfillment</button>`);
                buttons.push(`<button class="btn btn-secondary btn-sm" onclick="RequestsModule.showAssignModal('${r.id}')">Assign</button>`);
                buttons.push(`<button class="btn btn-secondary btn-sm" onclick="RequestsModule.cancelRequest('${r.id}')">Cancel</button>`);
                break;
            case 'In Progress':
                buttons.push(`<button class="btn btn-primary btn-sm" onclick="RequestsModule.fulfillRequest('${r.id}')">Mark Fulfilled</button>`);
                buttons.push(`<button class="btn btn-secondary btn-sm" onclick="RequestsModule.showAssignModal('${r.id}')">Reassign</button>`);
                buttons.push(`<button class="btn btn-secondary btn-sm" onclick="RequestsModule.cancelRequest('${r.id}')">Cancel</button>`);
                break;
            case 'Fulfilled':
                buttons.push(`<button class="btn btn-primary btn-sm" onclick="RequestsModule.closeRequest('${r.id}')">Close</button>`);
                break;
            case 'Rejected':
                buttons.push(`<button class="btn btn-secondary btn-sm" onclick="RequestsModule.resubmitRequest('${r.id}')">Resubmit as Draft</button>`);
                break;
        }
        return buttons.join('');
    },

    // ==================== STATUS TRANSITIONS ====================

    submitRequest: async function(requestId) {
        const r = this.getRequest(requestId);
        if (!r) return;
        const newStatus = r.approvalRequired ? 'Pending Approval' : 'Submitted';
        try {
            await ITSMApi.updateRequestStatus(requestId, newStatus);
            showToast(`${r.id} submitted successfully`, 'success');
            this.selectRequest(requestId);
            if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
        } catch (err) {
            showToast('Failed to submit request: ' + err.message, 'error');
        }
    },

    approveRequest: function(requestId) {
        const r = this.getRequest(requestId);
        if (!r) return;
        showModal(`
            <div class="modal-header"><span>Approve ${r.id}</span><button class="panel-close" onclick="closeModal()">x</button></div>
            <div class="modal-body" style="width: 400px;">
                <div class="form-group">
                    <label class="form-label">Comments (optional)</label>
                    <textarea class="form-control" id="approve-comments" rows="3" placeholder="Approval comments..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="RequestsModule.confirmApprove('${requestId}')">Approve</button>
            </div>
        `);
    },

    confirmApprove: async function(requestId) {
        const comments = document.getElementById('approve-comments')?.value || 'Approved';
        try {
            await ITSMApi.approveRequest(requestId, ITSMData.currentUser.name, comments);
            closeModal();
            showToast(`${requestId} approved`, 'success');
            this.selectRequest(requestId);
            if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
        } catch (err) {
            showToast('Failed to approve request: ' + err.message, 'error');
        }
    },

    rejectRequest: function(requestId) {
        const r = this.getRequest(requestId);
        if (!r) return;
        showModal(`
            <div class="modal-header"><span>Reject ${r.id}</span><button class="panel-close" onclick="closeModal()">x</button></div>
            <div class="modal-body" style="width: 400px;">
                <div class="form-group">
                    <label class="form-label required">Rejection Reason</label>
                    <textarea class="form-control" id="reject-reason" rows="3" placeholder="Reason for rejection..." required></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" style="background: var(--accent-red);" onclick="RequestsModule.confirmReject('${requestId}')">Reject</button>
            </div>
        `);
    },

    confirmReject: async function(requestId) {
        const reason = document.getElementById('reject-reason')?.value;
        if (!reason) { showToast('Rejection reason is required', 'error'); return; }
        try {
            await ITSMApi.rejectRequest(requestId, reason, ITSMData.currentUser.name);
            closeModal();
            showToast(`${requestId} rejected`, 'info');
            this.selectRequest(requestId);
            if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
        } catch (err) {
            showToast('Failed to reject request: ' + err.message, 'error');
        }
    },

    startFulfillment: async function(requestId) {
        try {
            await ITSMApi.updateRequestStatus(requestId, 'In Progress');
            showToast(`${requestId} fulfillment started`, 'success');
            this.selectRequest(requestId);
            if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
        } catch (err) {
            showToast('Failed to start fulfillment: ' + err.message, 'error');
        }
    },

    fulfillRequest: async function(requestId) {
        try {
            await ITSMApi.fulfillRequest(requestId, 'Request fulfilled');
            showToast(`${requestId} fulfilled`, 'success');
            this.selectRequest(requestId);
            if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
        } catch (err) {
            showToast('Failed to fulfill request: ' + err.message, 'error');
        }
    },

    closeRequest: async function(requestId) {
        try {
            await ITSMApi.updateRequestStatus(requestId, 'Closed');
            showToast(`${requestId} closed`, 'success');
            this.selectRequest(requestId);
            if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
        } catch (err) {
            showToast('Failed to close request: ' + err.message, 'error');
        }
    },

    cancelRequest: async function(requestId) {
        if (!confirm('Are you sure you want to cancel this request?')) return;
        try {
            await ITSMApi.updateRequestStatus(requestId, 'Cancelled');
            showToast(`${requestId} cancelled`, 'info');
            this.selectRequest(requestId);
            if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
        } catch (err) {
            showToast('Failed to cancel request: ' + err.message, 'error');
        }
    },

    resubmitRequest: function(requestId) {
        const r = this.getRequest(requestId);
        if (!r) return;
        r.status = 'Draft';
        r.rejectionReason = null;
        r.updatedAt = new Date().toISOString();
        r.notes.push({ type: 'system', visibility: 'technicians-only', author: 'System', content: 'Request reverted to draft for resubmission', timestamp: r.updatedAt });
        showToast(`${r.id} reverted to draft`, 'info');
        this.selectRequest(requestId);
    },

    // ==================== ASSIGNMENT ====================

    showAssignModal: function(requestId) {
        const r = this.getRequest(requestId);
        if (!r) return;
        const teams = ITSMData.teams;
        showModal(`
            <div class="modal-header"><span>Assign ${r.id}</span><button class="panel-close" onclick="closeModal()">x</button></div>
            <div class="modal-body" style="width: 450px;">
                <div class="form-group">
                    <label class="form-label">Assignment Group</label>
                    <select class="form-control" id="assign-group" onchange="RequestsModule.updateTechnicianOptions()">
                        ${teams.map(t => `<option value="${t.name}" ${r.assignmentGroup === t.name ? 'selected' : ''}>${t.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Assigned To</label>
                    <select class="form-control" id="assign-tech">
                        <option value="">-- Unassigned --</option>
                        ${ITSMData.technicians.map(t => `<option value="${t.id}" data-team="${t.team}" ${r.assignedTo === t.id ? 'selected' : ''}>${t.name} (${t.team})</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="RequestsModule.confirmAssign('${requestId}')">Assign</button>
            </div>
        `);
        this.updateTechnicianOptions();
    },

    updateTechnicianOptions: function() {
        const group = document.getElementById('assign-group')?.value;
        const techSelect = document.getElementById('assign-tech');
        if (!techSelect) return;
        const options = techSelect.querySelectorAll('option[data-team]');
        options.forEach(opt => {
            opt.style.display = !group || opt.dataset.team === group ? '' : 'none';
        });
    },

    confirmAssign: async function(requestId) {
        const group = document.getElementById('assign-group')?.value;
        const techId = document.getElementById('assign-tech')?.value;
        const tech = techId ? ITSMData.technicians.find(t => t.id === techId) : null;
        try {
            await ITSMApi.assignRequest(requestId, {
                assignmentGroup: group,
                assignee: techId || null,
                assigneeName: tech ? tech.name : null
            });
            closeModal();
            showToast(`${requestId} assigned to ${tech ? tech.name : group}`, 'success');
            this.selectRequest(requestId);
        } catch (err) {
            showToast('Failed to assign request: ' + err.message, 'error');
        }
    },

    // ==================== NOTES ====================

    showAddNoteModal: function(requestId) {
        showModal(`
            <div class="modal-header"><span>Add Note to ${requestId}</span><button class="panel-close" onclick="closeModal()">x</button></div>
            <div class="modal-body" style="width: 450px;">
                <div class="form-group">
                    <label class="form-label">Note Type</label>
                    <select class="form-control" id="note-type">
                        <option value="internal">Internal Note (technicians only)</option>
                        <option value="customer">Customer Update (visible to requester)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label required">Content</label>
                    <textarea class="form-control" id="note-content" rows="4" placeholder="Enter note..." required></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="RequestsModule.addNote('${requestId}')">Add Note</button>
            </div>
        `);
    },

    addNote: async function(requestId) {
        const content = document.getElementById('note-content')?.value;
        if (!content) { showToast('Note content is required', 'error'); return; }
        const type = document.getElementById('note-type')?.value || 'internal';
        try {
            await ITSMApi.addRequestNote(requestId, { content, type });
            closeModal();
            showToast('Note added', 'success');
            this.selectRequest(requestId);
        } catch (err) {
            showToast('Failed to add note: ' + err.message, 'error');
        }
    },

    // ==================== CREATE REQUEST ====================

    showCreateRequest: function() {
        setActiveModule('service-catalog');
    },

    // ==================== MY REQUESTS ====================

    renderMyRequests: function() {
        const myRequests = ITSMData.serviceRequests.filter(r =>
            r.requestedBy === ITSMData.currentUser.email ||
            r.requestedFor === ITSMData.currentUser.email
        );

        return `
            <div class="page-header">
                <div class="page-title">My Requests</div>
                <div class="page-subtitle">Service requests you have submitted or are requested for you</div>
            </div>
            <div class="page-content">
                ${myRequests.length === 0 ? '<div class="empty-state"><div class="empty-state-text">No requests found</div></div>' : `
                <table class="data-table">
                    <thead>
                        <tr><th>ID</th><th>Service</th><th>Status</th><th>Priority</th><th>Created</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${myRequests.map(r => `
                            <tr>
                                <td class="cell-id">${r.id}</td>
                                <td>${r.catalogItemName || r.title}</td>
                                <td><span class="badge ${this.statusBadgeClass[r.status]}">${r.status}</span></td>
                                <td>${r.priority}</td>
                                <td>${new Date(r.createdAt).toLocaleDateString()}</td>
                                <td><button class="btn btn-sm btn-secondary" onclick="setActiveModule('requests'); setTimeout(() => RequestsModule.selectRequest('${r.id}'), 100);">View</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`}
            </div>
        `;
    },

    // ==================== AUDIT LOG ====================

    addAuditLog: function(action, target, details) {
        // No-op: audit logging is now handled server-side by the API
    },

    // ── Selection & Bulk Operations ──

    toggleSelection: function(id) {
        if (this.selectedIds.has(id)) this.selectedIds.delete(id);
        else this.selectedIds.add(id);
        this.updateSelectAll();
        this.updateBulkActions();
        this.refreshList();
    },

    toggleSelectAll: function() {
        const filtered = this.getFilteredRequests();
        const allChecked = filtered.length > 0 && filtered.every(r => this.selectedIds.has(r.id));
        filtered.forEach(r => { if (allChecked) this.selectedIds.delete(r.id); else this.selectedIds.add(r.id); });
        this.updateSelectAll();
        this.updateBulkActions();
        this.refreshList();
    },

    updateSelectAll: function() {
        const el = document.getElementById('requests-select-all');
        if (!el) return;
        const filtered = this.getFilteredRequests();
        const count = filtered.filter(r => this.selectedIds.has(r.id)).length;
        el.checked = count === filtered.length && filtered.length > 0;
        el.indeterminate = count > 0 && count < filtered.length;
    },

    updateBulkActions: function() {
        const el = document.getElementById('requests-bulk-actions');
        if (!el) return;
        const n = this.selectedIds.size;
        el.innerHTML = n > 0
            ? `<button class="btn btn-danger btn-sm" onclick="RequestsModule.deleteSelected()">Delete Selected (${n})</button>`
            : '';
    },

    refreshData: async function() {
        const btn = document.querySelector('.btn-refresh');
        if (btn) btn.classList.add('refreshing');
        try {
            await ITSMApi.loadCollection('serviceRequests');
            this.selectedIds.clear();
            this.refreshList();
            if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
            showToast('Requests refreshed', 'success');
        } catch (err) {
            showToast('Failed to refresh: ' + err.message, 'error');
        } finally {
            if (btn) btn.classList.remove('refreshing');
        }
    },

    deleteSelected: function() {
        const ids = Array.from(this.selectedIds);
        if (ids.length === 0) return;
        showModal(`
            <div class="modal-header"><span>Delete ${ids.length} Request${ids.length !== 1 ? 's' : ''}</span><button class="panel-close" onclick="closeModal()">x</button></div>
            <div class="modal-body" style="width:450px;">
                <p>Are you sure you want to permanently delete:</p>
                <div style="margin:var(--spacing-sm) 0;padding:var(--spacing-sm);background:var(--bg-secondary);border-radius:4px;max-height:150px;overflow-y:auto;font-family:monospace;font-size:12px;">${ids.join(', ')}</div>
                <p style="color:#cc4444;font-size:12px;">This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-danger" onclick="RequestsModule.confirmDeleteSelected()">Delete</button>
            </div>
        `);
    },

    confirmDeleteSelected: async function() {
        const ids = Array.from(this.selectedIds);
        closeModal();
        try {
            const result = await ITSMApi.bulkDelete('requests', ids);
            if (result.success) {
                this.selectedIds.clear();
                this.selectedRequest = null;
                this.refreshList();
                const detail = document.getElementById('request-detail');
                if (detail) detail.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">No Request Selected</div></div>';
                if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
                showToast(`Deleted ${result.deleted.length} request(s)`, 'success');
            }
        } catch (err) {
            showToast('Failed to delete: ' + err.message, 'error');
        }
    }
};

// Make globally available
window.RequestsModule = RequestsModule;
