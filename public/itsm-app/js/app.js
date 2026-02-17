/**
 * ITSM Console - Main Application
 */

// State
let currentModule = 'dashboard';
let selectedIncident = null;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupClock();
    updateSidebarBadges();
    renderModule('dashboard');
    loadRecentActivity();
}

function updateSidebarBadges() {
    // Update incidents badge - count open incidents (not Resolved or Closed)
    const openIncidents = ITSMData.incidents.filter(inc =>
        inc.status !== 'Resolved' && inc.status !== 'Closed'
    ).length;
    const incidentsBadge = document.getElementById('incidents-badge');
    if (incidentsBadge) {
        incidentsBadge.textContent = openIncidents;
        incidentsBadge.style.display = openIncidents > 0 ? 'inline-block' : 'none';
    }
}

// ==================== NAVIGATION ====================

function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const moduleKey = this.getAttribute('data-module');
            if (moduleKey) {
                setActiveModule(moduleKey);
            }
        });
    });
}

function setActiveModule(moduleKey) {
    // Update nav state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.querySelector(`[data-module="${moduleKey}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }

    currentModule = moduleKey;
    renderModule(moduleKey);
}

// ==================== MODULE RENDERING ====================

function renderModule(moduleKey) {
    const contentArea = document.getElementById('content-area');

    const modules = {
        'dashboard': renderDashboard,
        'incidents': renderIncidents,
        'my-tickets': renderMyTickets,
        'knowledge-base': renderKnowledgeBase,
        'runbooks': renderRunbooks,
        'changes': renderChanges,
        'cab-calendar': renderCABCalendar,
        'assets': renderAssets,
        'policies': renderPolicies,
        'reports': renderReports,
        'audit-log': renderAuditLog,
        'settings': renderSettings,
        'demo-reset': renderDemoReset,
        'problems': renderProblems,
        'service-catalog': renderServiceCatalog,
        'my-requests': renderMyRequests
    };

    const renderFn = modules[moduleKey];
    if (renderFn) {
        contentArea.innerHTML = renderFn();
        // Post-render setup
        if (moduleKey === 'incidents') {
            setupIncidentListeners();
        }
        // Setup asset search listeners when assets module is loaded
        if (moduleKey === 'assets' && typeof AssetsModule !== 'undefined') {
            AssetsModule.setupAssetSearch();
        }
        // Setup knowledge base search listeners when KB module is loaded
        if (moduleKey === 'knowledge-base' && typeof KnowledgeModule !== 'undefined') {
            KnowledgeModule.setupKBSearch();
        }
    } else {
        contentArea.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🚧</div><div class="empty-state-title">Module not found</div></div>`;
    }
}

// ==================== DASHBOARD ====================

function renderDashboard() {
    const stats = ITSMData.dashboardStats;

    return `
        <div class="page-header">
            <div class="page-title">📊 Service Desk Dashboard</div>
            <div class="page-subtitle">Real-time overview of IT service operations</div>
        </div>
        <div class="page-content">
            <!-- Stats Widgets -->
            <div class="widget-grid">
                <div class="widget">
                    <div class="widget-header">Open Incidents</div>
                    <div class="widget-body widget-stat">
                        <div class="widget-stat-value">${stats.incidents.open}</div>
                        <div class="widget-stat-label">Requiring Action</div>
                    </div>
                </div>
                <div class="widget">
                    <div class="widget-header">P1 Critical</div>
                    <div class="widget-body widget-stat">
                        <div class="widget-stat-value" style="color: var(--priority-p1);">${stats.incidents.byPriority.P1}</div>
                        <div class="widget-stat-label">High Priority</div>
                    </div>
                </div>
                <div class="widget">
                    <div class="widget-header">SLA Compliance</div>
                    <div class="widget-body widget-stat">
                        <div class="widget-stat-value" style="color: ${stats.incidents.slaCompliance >= 90 ? 'var(--accent-green)' : 'var(--accent-orange)'};">${stats.incidents.slaCompliance}%</div>
                        <div class="widget-stat-label">This Week</div>
                    </div>
                </div>
                <div class="widget">
                    <div class="widget-header">Pending Changes</div>
                    <div class="widget-body widget-stat">
                        <div class="widget-stat-value">${stats.changes.pending}</div>
                        <div class="widget-stat-label">Awaiting Approval</div>
                    </div>
                </div>
            </div>

            <!-- Recent Incidents Table -->
            <div class="card" style="margin-top: var(--spacing-lg);">
                <div class="card-header">
                    <span>🎫 Recent Incidents</span>
                    <button class="btn btn-sm btn-secondary" onclick="setActiveModule('incidents')">View All</button>
                </div>
                <div class="card-body" style="padding: 0;">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Priority</th>
                                    <th>Summary</th>
                                    <th>Status</th>
                                    <th>Assigned To</th>
                                    <th>SLA</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${ITSMData.incidents.slice(0, 5).map(inc => `
                                    <tr class="clickable" onclick="openIncidentDetail('${inc.id}')">
                                        <td class="cell-id">${inc.id}</td>
                                        <td><span class="badge priority-${inc.priority.toLowerCase()}">${inc.priority}</span></td>
                                        <td>${inc.summary}</td>
                                        <td><span class="badge badge-${inc.status.toLowerCase().replace(' ', '-')}">${inc.status}</span></td>
                                        <td>${inc.assignedTo}</td>
                                        <td>${renderSLABadge(inc)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Asset Status -->
            <div class="card">
                <div class="card-header">
                    <span>🖥️ Asset Health</span>
                </div>
                <div class="card-body">
                    <div style="display: flex; gap: var(--spacing-lg);">
                        <div><span style="color: var(--accent-green);">●</span> Active: ${stats.assets.active}</div>
                        <div><span style="color: var(--accent-orange);">●</span> Warning: ${stats.assets.warning}</div>
                        <div><span style="color: var(--accent-red);">●</span> Error: ${stats.assets.error}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ==================== INCIDENTS ====================

function renderIncidents() {
    return `
        <div class="split-pane">
            <!-- Left: Incident List -->
            <div class="split-left">
                <div class="toolbar">
                    <div class="toolbar-group">
                        <button class="btn btn-primary btn-sm" onclick="createNewIncident()">+ New Incident</button>
                    </div>
                    <div class="toolbar-separator"></div>
                    <div class="toolbar-group">
                        <select class="form-control" style="width: 120px; padding: 4px;" id="filter-status">
                            <option value="">All Status</option>
                            <option value="New">New</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Pending">Pending</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                        <select class="form-control" style="width: 100px; padding: 4px;" id="filter-priority">
                            <option value="">All Priority</option>
                            <option value="P1">P1 - Critical</option>
                            <option value="P2">P2 - High</option>
                            <option value="P3">P3 - Medium</option>
                            <option value="P4">P4 - Low</option>
                        </select>
                    </div>
                    <div class="toolbar-search" style="margin-left: auto;">
                        <input type="text" placeholder="Search incidents..." id="incident-search">
                        <button class="btn btn-sm btn-secondary">🔍</button>
                    </div>
                </div>
                <div class="split-content" id="incident-list">
                    ${renderIncidentList()}
                </div>
            </div>

            <!-- Right: Incident Detail -->
            <div class="split-right">
                <div class="split-header" id="detail-header">Select an incident to view details</div>
                <div class="split-content" id="incident-detail">
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <div class="empty-state-title">No Incident Selected</div>
                        <div class="empty-state-text">Click on an incident from the list to view details</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderIncidentList() {
    return ITSMData.incidents.map(inc => `
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
    `).join('');
}

function setupIncidentListeners() {
    document.getElementById('filter-status')?.addEventListener('change', filterIncidents);
    document.getElementById('filter-priority')?.addEventListener('change', filterIncidents);
    document.getElementById('incident-search')?.addEventListener('input', filterIncidents);
}

function filterIncidents() {
    const statusFilter = document.getElementById('filter-status')?.value || '';
    const priorityFilter = document.getElementById('filter-priority')?.value || '';
    const searchFilter = document.getElementById('incident-search')?.value?.toLowerCase() || '';

    const filtered = ITSMData.incidents.filter(inc => {
        const matchStatus = !statusFilter || inc.status === statusFilter;
        const matchPriority = !priorityFilter || inc.priority === priorityFilter;
        const matchSearch = !searchFilter ||
            inc.summary.toLowerCase().includes(searchFilter) ||
            inc.id.toLowerCase().includes(searchFilter);
        return matchStatus && matchPriority && matchSearch;
    });

    document.getElementById('incident-list').innerHTML = filtered.length > 0
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

function selectIncident(incidentId) {
    selectedIncident = incidentId;

    // Update list selection
    document.querySelectorAll('.ticket-row').forEach(row => {
        row.classList.remove('selected');
    });
    document.querySelector(`[data-incident-id="${incidentId}"]`)?.classList.add('selected');

    // Render detail using IncidentsModule if available, otherwise fall back to renderIncidentDetail
    const incident = ITSMData.incidents.find(i => i.id === incidentId);
    if (incident) {
        document.getElementById('detail-header').textContent = `${incident.id} - ${incident.summary}`;
        // Use the enhanced IncidentsModule form if available
        if (typeof IncidentsModule !== 'undefined' && IncidentsModule.renderIncidentForm) {
            document.getElementById('incident-detail').innerHTML = IncidentsModule.renderIncidentForm(incident);
        } else {
            document.getElementById('incident-detail').innerHTML = renderIncidentDetail(incident);
        }
    }
}

function renderIncidentDetail(inc) {
    return `
        <div style="padding: var(--spacing-md);">
            <!-- Tabs -->
            <div class="tabs">
                <div class="tab-item active" onclick="showTab('details')">Details</div>
                <div class="tab-item" onclick="showTab('notes')">Notes (${inc.notes.length})</div>
                <div class="tab-item" onclick="showTab('attachments')">Attachments (${inc.attachments.length})</div>
                <div class="tab-item" onclick="showTab('related')">Related</div>
            </div>

            <!-- Details Tab -->
            <div class="tab-content active" id="tab-details">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select class="form-control" id="inc-status">
                            <option ${inc.status === 'New' ? 'selected' : ''}>New</option>
                            <option ${inc.status === 'Open' ? 'selected' : ''}>Open</option>
                            <option ${inc.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option ${inc.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option ${inc.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                            <option ${inc.status === 'Closed' ? 'selected' : ''}>Closed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Priority</label>
                        <select class="form-control" id="inc-priority">
                            <option ${inc.priority === 'P1' ? 'selected' : ''}>P1 - Critical</option>
                            <option ${inc.priority === 'P2' ? 'selected' : ''}>P2 - High</option>
                            <option ${inc.priority === 'P3' ? 'selected' : ''}>P3 - Medium</option>
                            <option ${inc.priority === 'P4' ? 'selected' : ''}>P4 - Low</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <input type="text" class="form-control" value="${inc.category}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Subcategory</label>
                        <input type="text" class="form-control" value="${inc.subcategory}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Assigned To</label>
                        <select class="form-control">
                            <option>${inc.assignedTo}</option>
                            <option>Service Desk</option>
                            <option>Network Team</option>
                            <option>Application Support</option>
                            <option>Server Team</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Affected Asset</label>
                        <input type="text" class="form-control" value="${inc.affectedAsset || 'N/A'}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Reporter</label>
                        <input type="text" class="form-control" value="${inc.reporter}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">SLA Target</label>
                        <input type="text" class="form-control" value="${formatDateTime(inc.slaTarget)}" readonly>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" rows="4" readonly>${inc.description}</textarea>
                </div>
                <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-md);">
                    <button class="btn btn-primary" onclick="saveIncident('${inc.id}')">💾 Save Changes</button>
                    <button class="btn btn-success" onclick="resolveIncident('${inc.id}')">✓ Resolve</button>
                    <button class="btn btn-warning" onclick="escalateIncident('${inc.id}')">⬆ Escalate</button>
                </div>
            </div>

            <!-- Notes Tab -->
            <div class="tab-content" id="tab-notes">
                <div style="margin-bottom: var(--spacing-md);">
                    <textarea class="form-control" placeholder="Add a note..." rows="3" id="new-note"></textarea>
                    <div style="margin-top: var(--spacing-sm);">
                        <button class="btn btn-primary btn-sm" onclick="addNote('${inc.id}')">Add Note</button>
                        <button class="btn btn-secondary btn-sm">Add Internal Note</button>
                    </div>
                </div>
                <div style="border-top: 1px solid var(--border-light); padding-top: var(--spacing-md);">
                    ${inc.notes.map(note => `
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
                    <button class="btn btn-primary btn-sm" onclick="uploadAttachment('${inc.id}')">📎 Upload File</button>
                </div>
                ${inc.attachments.length > 0 ? `
                    <div class="attachment-list">
                        ${inc.attachments.map(att => `
                            <div class="attachment-item">
                                <span class="attachment-icon">${getFileIcon(att.type)}</span>
                                <span>${att.name}</span>
                                <span style="color: var(--text-muted);">(${att.size})</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="empty-state"><div class="empty-state-text">No attachments</div></div>'}
            </div>

            <!-- Related Tab -->
            <div class="tab-content" id="tab-related">
                <h4 style="margin-bottom: var(--spacing-md);">Linked Knowledge Articles</h4>
                ${inc.linkedKB.length > 0 ? inc.linkedKB.map(kbId => {
                    const kb = ITSMData.knowledgeArticles.find(k => k.id === kbId);
                    return kb ? `
                        <div class="card" style="margin-bottom: var(--spacing-sm);">
                            <div class="card-body" style="padding: var(--spacing-sm);">
                                <strong>${kb.id}</strong>: ${kb.title}
                                <button class="btn btn-sm btn-secondary" style="float: right;" onclick="viewKBArticle('${kb.id}')">View</button>
                            </div>
                        </div>
                    ` : '';
                }).join('') : '<div class="empty-state"><div class="empty-state-text">No linked articles. <a href="#" onclick="searchKB()">Search KB</a></div></div>'}
            </div>
        </div>
    `;
}

function showTab(tabId) {
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(`tab-${tabId}`).classList.add('active');
}

// ==================== MY TICKETS ====================

function renderMyTickets() {
    const myTickets = ITSMData.incidents.filter(i => i.assignee === ITSMData.currentUser.username);

    return `
        <div class="page-header">
            <div class="page-title">📋 My Assigned Tickets</div>
            <div class="page-subtitle">Incidents assigned to ${ITSMData.currentUser.name}</div>
        </div>
        <div class="page-content">
            ${myTickets.length > 0 ? `
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Priority</th>
                                <th>Summary</th>
                                <th>Status</th>
                                <th>SLA</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${myTickets.map(inc => `
                                <tr>
                                    <td class="cell-id">${inc.id}</td>
                                    <td><span class="badge priority-${inc.priority.toLowerCase()}">${inc.priority}</span></td>
                                    <td>${inc.summary}</td>
                                    <td><span class="badge badge-${inc.status.toLowerCase().replace(' ', '-')}">${inc.status}</span></td>
                                    <td>${renderSLABadge(inc)}</td>
                                    <td class="cell-actions">
                                        <button class="btn btn-sm btn-secondary" onclick="openIncidentDetail('${inc.id}')">View</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<div class="empty-state"><div class="empty-state-icon">✓</div><div class="empty-state-title">No tickets assigned</div></div>'}
        </div>
    `;
}

// ==================== KNOWLEDGE BASE ====================

function renderKnowledgeBase() {
    // Use KnowledgeModule if available for enhanced functionality
    if (typeof KnowledgeModule !== 'undefined' && KnowledgeModule.renderKnowledgeBasePage) {
        return KnowledgeModule.renderKnowledgeBasePage();
    }

    // Fallback to basic rendering if module not loaded
    return `
        <div class="page-header">
            <div class="page-title">📚 Knowledge Base</div>
            <div class="page-subtitle">Search and browse knowledge articles for issue resolution</div>
        </div>
        <div class="toolbar">
            <div class="toolbar-search">
                <input type="text" placeholder="Search knowledge base..." id="kb-search" style="width: 300px;">
                <button class="btn btn-primary btn-sm">🔍 Search</button>
            </div>
            <div class="toolbar-group" style="margin-left: var(--spacing-lg);">
                <select class="form-control" style="width: 150px; padding: 4px;">
                    <option value="">All Categories</option>
                    <option>Network</option>
                    <option>Application</option>
                    <option>Hardware</option>
                    <option>Infrastructure</option>
                </select>
            </div>
        </div>
        <div class="page-content">
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: var(--spacing-md);">
                ${ITSMData.knowledgeArticles.map(kb => `
                    <div class="card">
                        <div class="card-header">
                            <span>${kb.id}</span>
                            <span class="badge badge-${kb.status === 'Published' ? 'resolved' : 'pending'}">${kb.status}</span>
                        </div>
                        <div class="card-body">
                            <h4 style="margin-bottom: var(--spacing-sm);">${kb.title}</h4>
                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: var(--spacing-sm);">
                                <span>📁 ${kb.category}</span> ·
                                <span>👁 ${kb.views} views</span> ·
                                <span>👍 ${kb.helpful}% helpful</span>
                            </div>
                            <div style="margin-bottom: var(--spacing-sm);">
                                ${kb.tags.slice(0, 3).map(tag => `<span class="badge badge-new" style="margin-right: 4px;">${tag}</span>`).join('')}
                            </div>
                            <button class="btn btn-sm btn-primary" onclick="viewKBArticle('${kb.id}')">View Article</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// viewKBArticle and insertKBToIncident are provided by KnowledgeModule
// See js/modules/knowledge.js for the full implementation
// The functions are exposed globally via window.viewKBArticle and window.insertKBToIncident

// ==================== CHANGES ====================

function renderChanges() {
    // Use ChangesModule if available
    if (typeof ChangesModule !== 'undefined' && typeof renderChangesWithModule !== 'undefined') {
        const html = renderChangesWithModule();
        // Setup filter listeners after a short delay to ensure DOM is ready
        setTimeout(() => {
            if (typeof ChangesModule.setupFilterListeners === 'function') {
                ChangesModule.setupFilterListeners();
            }
        }, 100);
        return html;
    }

    // Fallback to basic rendering
    return `
        <div class="page-header">
            <div class="page-title">🔄 Change Requests</div>
            <div class="page-subtitle">Manage change requests and approvals</div>
        </div>
        <div class="toolbar">
            <button class="btn btn-primary btn-sm" onclick="createNewChange()">+ New Change Request</button>
        </div>
        <div class="page-content">
            <div class="table-container">
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
                        ${ITSMData.changes.map(chg => `
                            <tr>
                                <td class="cell-id">${chg.id}</td>
                                <td>${chg.title}</td>
                                <td><span class="badge ${chg.type === 'Emergency' ? 'badge-critical' : 'badge-new'}">${chg.type}</span></td>
                                <td><span class="badge ${chg.risk === 'High' ? 'badge-critical' : chg.risk === 'Medium' ? 'badge-open' : 'badge-resolved'}">${chg.risk}</span></td>
                                <td><span class="badge badge-${chg.status.toLowerCase().replace(' ', '-')}">${chg.status}</span></td>
                                <td class="cell-date">${formatDateTime(chg.scheduledStart)}</td>
                                <td>${chg.cabRequired ? '✓ Yes' : 'No'}</td>
                                <td class="cell-actions">
                                    <button class="btn btn-sm btn-secondary" onclick="viewChange('${chg.id}')">View</button>
                                    ${chg.cabRequired && !chg.cabApproval ? '<button class="btn btn-sm btn-warning">Approve</button>' : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ==================== ASSETS ====================

function renderAssets() {
    // Use AssetsModule if available, otherwise fallback to basic rendering
    if (typeof AssetsModule !== 'undefined' && AssetsModule.renderAssetsPage) {
        return AssetsModule.renderAssetsPage();
    }

    // Fallback basic rendering
    return `
        <div class="page-header">
            <div class="page-title">🖥️ Assets / CMDB</div>
            <div class="page-subtitle">Configuration Management Database</div>
        </div>
        <div class="toolbar">
            <div class="toolbar-search">
                <input type="text" placeholder="Search assets..." style="width: 250px;">
                <button class="btn btn-sm btn-secondary">🔍</button>
            </div>
            <div class="toolbar-group" style="margin-left: var(--spacing-lg);">
                <select class="form-control" style="width: 120px; padding: 4px;">
                    <option value="">All Types</option>
                    <option>Server</option>
                    <option>Workstation</option>
                    <option>Network</option>
                    <option>Printer</option>
                    <option>Mobile</option>
                </select>
            </div>
        </div>
        <div class="page-content">
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Asset ID</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Owner</th>
                            <th>Location</th>
                            <th>Last Seen</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ITSMData.assets.map(asset => `
                            <tr class="clickable">
                                <td class="cell-id">${asset.id}</td>
                                <td>${asset.name}</td>
                                <td>${asset.type}</td>
                                <td>
                                    <span style="color: ${asset.status === 'Active' ? 'var(--accent-green)' : asset.status === 'Warning' ? 'var(--accent-orange)' : 'var(--accent-red)'};">●</span>
                                    ${asset.status}
                                </td>
                                <td>${asset.owner}</td>
                                <td>${asset.location}</td>
                                <td class="cell-date">${formatDateTime(asset.lastSeen)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ==================== POLICIES ====================

function renderPolicies() {
    return `
        <div class="page-header">
            <div class="page-title">📜 Policies</div>
            <div class="page-subtitle">IT Governance and Compliance Policies</div>
        </div>
        <div class="page-content">
            ${ITSMData.policies.map(policy => `
                <div class="card">
                    <div class="card-header">
                        <span>${policy.id}: ${policy.title}</span>
                        <span class="badge badge-new">v${policy.version}</span>
                    </div>
                    <div class="card-body">
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: var(--spacing-md);">
                            Category: ${policy.category} · Effective: ${policy.effectiveDate}
                        </div>
                        ${policy.sections.map(section => `
                            <div style="margin-bottom: var(--spacing-md); padding: var(--spacing-sm); background: var(--bg-secondary);">
                                <strong>Section ${section.number}: ${section.title}</strong>
                                <p style="margin-top: var(--spacing-xs); font-size: 12px;">${section.content}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ==================== OTHER MODULES ====================

function renderRunbooks() {
    // Use RunbooksModule if available
    if (typeof RunbooksModule !== 'undefined' && RunbooksModule.render) {
        return RunbooksModule.render();
    }
    return `
        <div class="page-header">
            <div class="page-title">📖 Runbooks</div>
            <div class="page-subtitle">Standard Operating Procedures</div>
        </div>
        <div class="page-content">
            <div class="empty-state">
                <div class="empty-state-icon">📖</div>
                <div class="empty-state-title">Runbooks Module</div>
                <div class="empty-state-text">Step-by-step procedures linked to automation</div>
            </div>
        </div>
    `;
}

function renderCABCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Get first day and total days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Get scheduled changes for this month
    const scheduledChanges = ITSMData.changes.filter(chg => {
        if (!chg.scheduledStart) return false;
        const start = new Date(chg.scheduledStart);
        return start.getMonth() === month && start.getFullYear() === year;
    });

    // Build calendar grid
    const calendarDays = [];
    let dayCount = 1;

    for (let week = 0; week < 6; week++) {
        const weekDays = [];
        for (let day = 0; day < 7; day++) {
            if (week === 0 && day < firstDay) {
                weekDays.push({ day: null, changes: [] });
            } else if (dayCount > daysInMonth) {
                weekDays.push({ day: null, changes: [] });
            } else {
                const dayChanges = scheduledChanges.filter(chg => {
                    const start = new Date(chg.scheduledStart);
                    return start.getDate() === dayCount;
                });
                weekDays.push({ day: dayCount, changes: dayChanges, isToday: dayCount === now.getDate() });
                dayCount++;
            }
        }
        calendarDays.push(weekDays);
        if (dayCount > daysInMonth) break;
    }

    // CAB Meeting days (Tuesdays and Thursdays)
    const cabMeetings = [];
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        if (date.getDay() === 2 || date.getDay() === 4) { // Tuesday or Thursday
            cabMeetings.push(d);
        }
    }

    return `
        <div class="page-header">
            <div class="page-title">📅 CAB Calendar</div>
            <div class="page-subtitle">Change Advisory Board Schedule</div>
        </div>
        <div class="toolbar">
            <button class="btn btn-primary btn-sm" onclick="createNewChange()">+ Schedule Change</button>
            <div class="toolbar-separator"></div>
            <div class="toolbar-group">
                <span class="badge badge-open" style="margin-right: 8px;">● Standard</span>
                <span class="badge badge-critical" style="margin-right: 8px;">● Emergency</span>
                <span class="badge badge-new" style="margin-right: 8px;">● Normal</span>
                <span style="background: #e3f2fd; padding: 4px 8px; border-radius: 4px; font-size: 11px;">📋 CAB Meeting</span>
            </div>
        </div>
        <div class="page-content">
            <div class="card">
                <div class="card-header">
                    <span>${monthName}</span>
                    <span style="font-size: 11px; color: var(--text-muted);">${scheduledChanges.length} changes scheduled</span>
                </div>
                <div class="card-body" style="padding: 0;">
                    <table class="data-table" style="table-layout: fixed;">
                        <thead>
                            <tr>
                                <th style="text-align: center;">Sun</th>
                                <th style="text-align: center;">Mon</th>
                                <th style="text-align: center;">Tue</th>
                                <th style="text-align: center;">Wed</th>
                                <th style="text-align: center;">Thu</th>
                                <th style="text-align: center;">Fri</th>
                                <th style="text-align: center;">Sat</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${calendarDays.map(week => `
                                <tr>
                                    ${week.map((cell, dayIndex) => `
                                        <td style="height: 90px; vertical-align: top; padding: 4px; ${cell.isToday ? 'background: rgba(0, 120, 212, 0.1);' : ''} ${cell.day === null ? 'background: var(--bg-secondary);' : ''}">
                                            ${cell.day ? `
                                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                                    <span style="font-weight: ${cell.isToday ? 'bold' : 'normal'}; ${cell.isToday ? 'color: var(--accent-blue);' : ''}">${cell.day}</span>
                                                    ${cabMeetings.includes(cell.day) ? '<span style="font-size: 10px; background: #e3f2fd; padding: 2px 4px; border-radius: 2px;">CAB</span>' : ''}
                                                </div>
                                                <div style="font-size: 10px;">
                                                    ${cell.changes.slice(0, 2).map(chg => `
                                                        <div style="margin-bottom: 2px; padding: 2px 4px; border-radius: 2px; cursor: pointer; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
                                                            background: ${chg.type === 'Emergency' ? 'rgba(255, 71, 87, 0.2)' : chg.type === 'Standard' ? 'rgba(46, 213, 115, 0.2)' : 'rgba(0, 120, 212, 0.2)'};"
                                                            onclick="viewChange('${chg.id}')" title="${chg.title}">
                                                            ${chg.id}: ${chg.title.substring(0, 15)}...
                                                        </div>
                                                    `).join('')}
                                                    ${cell.changes.length > 2 ? `<div style="color: var(--text-muted);">+${cell.changes.length - 2} more</div>` : ''}
                                                </div>
                                            ` : ''}
                                        </td>
                                    `).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Upcoming Changes List -->
            <div class="card" style="margin-top: var(--spacing-lg);">
                <div class="card-header">Upcoming Changes This Week</div>
                <div class="card-body" style="padding: 0;">
                    ${scheduledChanges.length > 0 ? `
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Type</th>
                                    <th>Scheduled</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${scheduledChanges.slice(0, 5).map(chg => `
                                    <tr>
                                        <td class="cell-id">${chg.id}</td>
                                        <td>${chg.title}</td>
                                        <td><span class="badge ${chg.type === 'Emergency' ? 'badge-critical' : 'badge-new'}">${chg.type}</span></td>
                                        <td class="cell-date">${formatDateTime(chg.scheduledStart)}</td>
                                        <td><span class="badge badge-${chg.status.toLowerCase().replace(' ', '-')}">${chg.status}</span></td>
                                        <td class="cell-actions">
                                            <button class="btn btn-sm btn-secondary" onclick="viewChange('${chg.id}')">View</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<div class="empty-state"><div class="empty-state-text">No changes scheduled this month</div></div>'}
                </div>
            </div>
        </div>
    `;
}

function renderReports() {
    // Use ReportsModule if available
    if (typeof ReportsModule !== 'undefined' && ReportsModule.render) {
        return ReportsModule.render();
    }
    return `
        <div class="page-header">
            <div class="page-title">📈 Reports</div>
            <div class="page-subtitle">Service Desk Analytics and Reports</div>
        </div>
        <div class="page-content">
            <div class="widget-grid">
                <div class="card" style="cursor: pointer;">
                    <div class="card-body" style="text-align: center; padding: var(--spacing-xl);">
                        <div style="font-size: 32px; margin-bottom: var(--spacing-sm);">📊</div>
                        <strong>Incident Summary Report</strong>
                        <p style="font-size: 11px; color: var(--text-muted);">Weekly incident statistics</p>
                    </div>
                </div>
                <div class="card" style="cursor: pointer;">
                    <div class="card-body" style="text-align: center; padding: var(--spacing-xl);">
                        <div style="font-size: 32px; margin-bottom: var(--spacing-sm);">⏱️</div>
                        <strong>SLA Compliance Report</strong>
                        <p style="font-size: 11px; color: var(--text-muted);">SLA performance metrics</p>
                    </div>
                </div>
                <div class="card" style="cursor: pointer;">
                    <div class="card-body" style="text-align: center; padding: var(--spacing-xl);">
                        <div style="font-size: 32px; margin-bottom: var(--spacing-sm);">👥</div>
                        <strong>Team Performance</strong>
                        <p style="font-size: 11px; color: var(--text-muted);">Technician workload analysis</p>
                    </div>
                </div>
                <div class="card" style="cursor: pointer;">
                    <div class="card-body" style="text-align: center; padding: var(--spacing-xl);">
                        <div style="font-size: 32px; margin-bottom: var(--spacing-sm);">🔄</div>
                        <strong>Change Success Rate</strong>
                        <p style="font-size: 11px; color: var(--text-muted);">Change management metrics</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderAuditLog() {
    // Use AuditLogModule if available
    if (typeof AuditLogModule !== 'undefined' && AuditLogModule.render) {
        return AuditLogModule.render();
    }
    return `
        <div class="page-header">
            <div class="page-title">📝 Audit Log</div>
            <div class="page-subtitle">System activity and change history</div>
        </div>
        <div class="page-content">
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Actor</th>
                            <th>Action</th>
                            <th>Target</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ITSMData.auditLog.map(log => `
                            <tr>
                                <td class="cell-date">${formatDateTime(log.timestamp)}</td>
                                <td>${log.actor}</td>
                                <td>${log.action}</td>
                                <td class="cell-id">${log.target}</td>
                                <td>${log.details}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderSettings() {
    // Use SettingsModule if available
    if (typeof SettingsModule !== 'undefined' && SettingsModule.render) {
        return SettingsModule.render();
    }
    return `
        <div class="page-header">
            <div class="page-title">⚙️ Settings</div>
            <div class="page-subtitle">System Configuration</div>
        </div>
        <div class="page-content">
            <div class="card">
                <div class="card-header">User Preferences</div>
                <div class="card-body">
                    <div class="form-group">
                        <label class="form-label">Default View</label>
                        <select class="form-control" style="width: 200px;">
                            <option>Dashboard</option>
                            <option>My Tickets</option>
                            <option>Incidents</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Notifications</label>
                        <div class="form-check">
                            <input type="checkbox" checked> <label>Email notifications</label>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" checked> <label>Browser notifications</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderDemoReset() {
    return `
        <div class="page-header">
            <div class="page-title">🔃 Reset Demo Data</div>
            <div class="page-subtitle">Restore demo environment to initial state</div>
        </div>
        <div class="page-content">
            <div class="card">
                <div class="card-body" style="text-align: center; padding: var(--spacing-xl);">
                    <div style="font-size: 48px; margin-bottom: var(--spacing-md);">⚠️</div>
                    <h3>Reset Demo Environment</h3>
                    <p style="color: var(--text-muted); margin: var(--spacing-md) 0;">
                        This will reset all incidents, changes, and other data to their initial demo state.
                        This action cannot be undone.
                    </p>
                    <button class="btn btn-danger btn-lg" onclick="resetDemoData()">Reset All Demo Data</button>
                </div>
            </div>
        </div>
    `;
}

// ==================== UTILITY FUNCTIONS ====================

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateTime(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function renderSLABadge(incident) {
    if (incident.status === 'Resolved' || incident.status === 'Closed') {
        return '<span class="sla-timer sla-ok">Completed</span>';
    }

    const now = new Date();
    const sla = new Date(incident.slaTarget);
    const diff = sla - now;

    if (diff < 0) {
        return '<span class="sla-timer sla-breach">BREACHED</span>';
    } else if (diff < 3600000) { // Less than 1 hour
        return '<span class="sla-timer sla-warning">< 1h</span>';
    } else {
        const hours = Math.floor(diff / 3600000);
        return `<span class="sla-timer sla-ok">${hours}h</span>`;
    }
}

function getFileIcon(type) {
    const icons = {
        'log': '📄',
        'screenshot': '🖼️',
        'dump': '💾',
        'pdf': '📕',
        'default': '📎'
    };
    return icons[type] || icons.default;
}

function setupClock() {
    function updateClock() {
        const now = new Date();
        document.getElementById('current-time').textContent =
            now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    updateClock();
    setInterval(updateClock, 60000);
}

function loadRecentActivity() {
    const activityList = document.getElementById('recent-activity');
    if (!activityList) return;

    activityList.innerHTML = ITSMData.auditLog.slice(0, 5).map(log => `
        <div class="activity-item system" style="padding: 6px; margin-bottom: 6px; font-size: 10px;">
            <div><strong>${log.action}</strong></div>
            <div style="color: var(--text-muted);">${log.target} - ${formatDate(log.timestamp)}</div>
        </div>
    `).join('');
}

// ==================== MODAL FUNCTIONS ====================

function showModal(content) {
    document.getElementById('modal-container').innerHTML = content;
    document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

// ==================== ACTION FUNCTIONS ====================

function createNewIncident() {
    // Build customer options from ITSMData
    const customerOptions = (ITSMData.customers || []).map(c =>
        `<option value="${c.email}" data-name="${c.name}" data-phone="${c.phone || ''}" data-vip="${c.vip || false}" data-dept="${c.department || ''}" data-location="${c.location || ''}">${c.name} (${c.email})</option>`
    ).join('');

    // Build team options
    const teamOptions = (ITSMData.teams || []).map(t =>
        `<option value="${t.name}">${t.name}</option>`
    ).join('');

    // Build asset options
    const assetOptions = (ITSMData.assets || []).map(a =>
        `<option value="${a.id}">${a.id} - ${a.name}</option>`
    ).join('');

    showModal(`
        <div class="modal-header">
            <span>🎫 Create New Incident</span>
            <button class="panel-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body" style="width: 700px; max-height: 75vh; overflow-y: auto;">
            <!-- Caller Information Section -->
            <div style="background: var(--bg-secondary); padding: var(--spacing-md); margin-bottom: var(--spacing-md); border-radius: 4px;">
                <h4 style="margin-bottom: var(--spacing-sm); font-size: 12px; color: var(--text-muted);">CALLER INFORMATION</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                        <label class="form-label required">Caller</label>
                        <select class="form-control" id="new-inc-caller" onchange="populateCallerDetails()">
                            <option value="">-- Select Caller --</option>
                            <option value="manual">+ Enter Manually</option>
                            ${customerOptions}
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                        <label class="form-label">Caller Name</label>
                        <input type="text" class="form-control" id="new-inc-caller-name" placeholder="Full name">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--spacing-md);">
                    <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" id="new-inc-caller-email" placeholder="email@company.com">
                    </div>
                    <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                        <label class="form-label">Phone</label>
                        <input type="tel" class="form-control" id="new-inc-caller-phone" placeholder="+1-555-0123">
                    </div>
                    <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                        <label class="form-label">Location</label>
                        <input type="text" class="form-control" id="new-inc-location" placeholder="Building A, Floor 2">
                    </div>
                </div>
                <div id="vip-indicator" style="display: none; margin-top: var(--spacing-xs);">
                    <span class="badge" style="background: gold; color: black;">⭐ VIP Customer</span>
                </div>
            </div>

            <!-- Incident Details Section -->
            <div style="background: var(--bg-secondary); padding: var(--spacing-md); margin-bottom: var(--spacing-md); border-radius: 4px;">
                <h4 style="margin-bottom: var(--spacing-sm); font-size: 12px; color: var(--text-muted);">INCIDENT DETAILS</h4>
                <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                    <label class="form-label required">Short Description</label>
                    <input type="text" class="form-control" id="new-inc-summary" placeholder="Brief summary of the issue (max 160 chars)" maxlength="160">
                </div>
                <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                    <label class="form-label required">Description</label>
                    <textarea class="form-control" id="new-inc-description" rows="4" placeholder="Detailed description of the issue, including error messages, steps to reproduce, and any troubleshooting already attempted..."></textarea>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--spacing-md);">
                    <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                        <label class="form-label">Category</label>
                        <select class="form-control" id="new-inc-category" onchange="updateSubcategories()">
                            <option value="Network">Network</option>
                            <option value="Application">Application</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Email">Email</option>
                            <option value="Infrastructure">Infrastructure</option>
                            <option value="Identity">Identity</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                        <label class="form-label">Subcategory</label>
                        <select class="form-control" id="new-inc-subcategory">
                            <option value="Connectivity">Connectivity</option>
                            <option value="Performance">Performance</option>
                            <option value="Access">Access</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                        <label class="form-label">Affected Service</label>
                        <select class="form-control" id="new-inc-service">
                            <option value="">-- Select Service --</option>
                            <option value="VPN">VPN Service</option>
                            <option value="Email">Email / Exchange</option>
                            <option value="Active Directory">Active Directory</option>
                            <option value="File Services">File Services</option>
                            <option value="Print Services">Print Services</option>
                            <option value="ERP">ERP System</option>
                            <option value="CRM">CRM System</option>
                            <option value="Website">Corporate Website</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Classification Section -->
            <div style="background: var(--bg-secondary); padding: var(--spacing-md); margin-bottom: var(--spacing-md); border-radius: 4px;">
                <h4 style="margin-bottom: var(--spacing-sm); font-size: 12px; color: var(--text-muted);">CLASSIFICATION</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--spacing-md);">
                    <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                        <label class="form-label">Impact</label>
                        <select class="form-control" id="new-inc-impact" onchange="calculatePriority()">
                            <option value="3">3 - Low (Single user)</option>
                            <option value="2" selected>2 - Medium (Department)</option>
                            <option value="1">1 - High (Enterprise-wide)</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                        <label class="form-label">Urgency</label>
                        <select class="form-control" id="new-inc-urgency" onchange="calculatePriority()">
                            <option value="3">3 - Low (No deadline)</option>
                            <option value="2" selected>2 - Medium (Work affected)</option>
                            <option value="1">1 - High (Work stopped)</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                        <label class="form-label">Priority (Calculated)</label>
                        <select class="form-control" id="new-inc-priority" style="font-weight: bold;">
                            <option value="P4">P4 - Low</option>
                            <option value="P3" selected>P3 - Medium</option>
                            <option value="P2">P2 - High</option>
                            <option value="P1">P1 - Critical</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Assignment Section -->
            <div style="background: var(--bg-secondary); padding: var(--spacing-md); margin-bottom: var(--spacing-md); border-radius: 4px;">
                <h4 style="margin-bottom: var(--spacing-sm); font-size: 12px; color: var(--text-muted);">ASSIGNMENT</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                        <label class="form-label">Assignment Group</label>
                        <select class="form-control" id="new-inc-assignment-group" onchange="updateAssigneeOptions()">
                            <option value="Service Desk">Service Desk</option>
                            ${teamOptions}
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                        <label class="form-label">Assigned To</label>
                        <select class="form-control" id="new-inc-assignee">
                            <option value="">-- Unassigned --</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Additional Information Section -->
            <div style="background: var(--bg-secondary); padding: var(--spacing-md); border-radius: 4px;">
                <h4 style="margin-bottom: var(--spacing-sm); font-size: 12px; color: var(--text-muted);">ADDITIONAL INFORMATION</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                        <label class="form-label">Configuration Item</label>
                        <select class="form-control" id="new-inc-ci">
                            <option value="">-- Select CI --</option>
                            ${assetOptions}
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                        <label class="form-label">Callback Required</label>
                        <select class="form-control" id="new-inc-callback">
                            <option value="no">No</option>
                            <option value="yes">Yes - Call customer when resolved</option>
                        </select>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">Attachments</label>
                    <input type="file" class="form-control" id="new-inc-attachments" multiple>
                    <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Attach screenshots, log files, or other relevant documents</div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitNewIncident()">Create Incident</button>
        </div>
    `);

    // Initialize assignee options
    updateAssigneeOptions();
}

// Helper function to populate caller details when selected from dropdown
function populateCallerDetails() {
    const callerSelect = document.getElementById('new-inc-caller');
    const selectedOption = callerSelect.options[callerSelect.selectedIndex];

    if (callerSelect.value === '' || callerSelect.value === 'manual') {
        document.getElementById('new-inc-caller-name').value = '';
        document.getElementById('new-inc-caller-email').value = '';
        document.getElementById('new-inc-caller-phone').value = '';
        document.getElementById('new-inc-location').value = '';
        document.getElementById('vip-indicator').style.display = 'none';
        return;
    }

    document.getElementById('new-inc-caller-name').value = selectedOption.dataset.name || '';
    document.getElementById('new-inc-caller-email').value = callerSelect.value;
    document.getElementById('new-inc-caller-phone').value = selectedOption.dataset.phone || '';
    document.getElementById('new-inc-location').value = selectedOption.dataset.location || '';

    // Show VIP indicator if applicable
    const isVip = selectedOption.dataset.vip === 'true';
    document.getElementById('vip-indicator').style.display = isVip ? 'block' : 'none';

    // Auto-increase urgency for VIP customers
    if (isVip) {
        document.getElementById('new-inc-urgency').value = '1';
        calculatePriority();
    }
}

// Helper function to update subcategories based on category
function updateSubcategories() {
    const category = document.getElementById('new-inc-category').value;
    const subcategorySelect = document.getElementById('new-inc-subcategory');

    const subcategories = {
        'Network': ['Connectivity', 'VPN', 'DNS', 'Firewall', 'WiFi', 'Other'],
        'Application': ['Crash', 'Performance', 'Login', 'Feature Request', 'Bug', 'Other'],
        'Hardware': ['Desktop', 'Laptop', 'Printer', 'Monitor', 'Peripheral', 'Other'],
        'Email': ['Delivery', 'Access', 'Calendar', 'Outlook', 'Mobile', 'Other'],
        'Infrastructure': ['Server', 'Storage', 'Database', 'Backup', 'Cloud', 'Other'],
        'Identity': ['Password', 'Account Locked', 'Permissions', 'MFA', 'SSO', 'Other']
    };

    const options = subcategories[category] || ['General', 'Other'];
    subcategorySelect.innerHTML = options.map(s => `<option value="${s}">${s}</option>`).join('');
}

// Helper function to calculate priority from impact and urgency
function calculatePriority() {
    const impact = parseInt(document.getElementById('new-inc-impact').value);
    const urgency = parseInt(document.getElementById('new-inc-urgency').value);

    // Priority matrix: Impact x Urgency
    // 1,1 = P1 | 1,2 = P2 | 1,3 = P2
    // 2,1 = P2 | 2,2 = P3 | 2,3 = P3
    // 3,1 = P3 | 3,2 = P3 | 3,3 = P4

    let priority;
    const score = impact + urgency;

    if (score <= 2) priority = 'P1';
    else if (score <= 3) priority = 'P2';
    else if (score <= 5) priority = 'P3';
    else priority = 'P4';

    document.getElementById('new-inc-priority').value = priority;
}

// Helper function to update assignee options based on selected team
function updateAssigneeOptions() {
    const teamName = document.getElementById('new-inc-assignment-group').value;
    const assigneeSelect = document.getElementById('new-inc-assignee');

    // Find team members
    const team = (ITSMData.teams || []).find(t => t.name === teamName);
    const memberIds = team ? team.members : [];

    // Get technician details
    const technicians = (ITSMData.technicians || []).filter(t =>
        memberIds.includes(t.id) || teamName === 'Service Desk'
    );

    assigneeSelect.innerHTML = '<option value="">-- Unassigned --</option>' +
        technicians.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
}

function submitNewIncident() {
    // Get all form values
    const callerEmail = document.getElementById('new-inc-caller-email').value.trim();
    const callerName = document.getElementById('new-inc-caller-name').value.trim();
    const callerPhone = document.getElementById('new-inc-caller-phone').value.trim();
    const location = document.getElementById('new-inc-location').value.trim();
    const summary = document.getElementById('new-inc-summary').value.trim();
    const description = document.getElementById('new-inc-description').value.trim();
    const category = document.getElementById('new-inc-category').value;
    const subcategory = document.getElementById('new-inc-subcategory').value;
    const service = document.getElementById('new-inc-service').value;
    const impact = document.getElementById('new-inc-impact').value;
    const urgency = document.getElementById('new-inc-urgency').value;
    const priority = document.getElementById('new-inc-priority').value;
    const assignmentGroup = document.getElementById('new-inc-assignment-group').value;
    const assignee = document.getElementById('new-inc-assignee').value;
    const configItem = document.getElementById('new-inc-ci').value;
    const callbackRequired = document.getElementById('new-inc-callback').value === 'yes';

    // Process attachments
    const attachmentsInput = document.getElementById('new-inc-attachments');
    const attachments = [];
    if (attachmentsInput && attachmentsInput.files && attachmentsInput.files.length > 0) {
        const formatSize = (bytes) => {
            if (bytes < 1024) return bytes + 'B';
            if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + 'KB';
            return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
        };
        const getFileType = (filename) => {
            const ext = filename.split('.').pop().toLowerCase();
            const typeMap = {
                'pdf': 'document', 'doc': 'document', 'docx': 'document',
                'txt': 'text', 'log': 'log',
                'png': 'screenshot', 'jpg': 'screenshot', 'jpeg': 'screenshot', 'gif': 'screenshot', 'bmp': 'screenshot',
                'zip': 'archive', 'rar': 'archive', '7z': 'archive',
                'dmp': 'dump', 'mdmp': 'dump'
            };
            return typeMap[ext] || 'file';
        };

        for (let i = 0; i < attachmentsInput.files.length; i++) {
            const file = attachmentsInput.files[i];
            attachments.push({
                name: file.name,
                type: getFileType(file.name),
                size: formatSize(file.size),
                uploadedBy: ITSMData.currentUser.username,
                uploadedAt: new Date().toISOString()
            });
        }
    }

    // Validation
    if (!summary) {
        showToast('Please enter a short description', 'error');
        return;
    }
    if (!description) {
        showToast('Please enter a detailed description', 'error');
        return;
    }
    if (!callerEmail && !callerName) {
        showToast('Please provide caller information', 'error');
        return;
    }

    // Calculate SLA based on priority
    const slaHours = { 'P1': 1, 'P2': 4, 'P3': 8, 'P4': 24 };
    const slaTarget = new Date(Date.now() + (slaHours[priority] || 8) * 3600000).toISOString();

    // Find assignee name if assigned
    let assigneeName = null;
    if (assignee) {
        const tech = (ITSMData.technicians || []).find(t => t.id === assignee);
        assigneeName = tech ? tech.name : null;
    }

    // Check if caller is VIP
    const customer = (ITSMData.customers || []).find(c => c.email === callerEmail);
    const isVip = customer ? customer.vip : false;

    // Find customer ID if available
    const callerCustomer = (ITSMData.customers || []).find(c => c.email === callerEmail);

    // Create new incident
    const newId = `INC-${String(ITSMData.incidents.length + 1).padStart(3, '0')}`;
    const newIncident = {
        id: newId,
        summary: summary,
        description: description,
        // Caller Information
        caller: callerCustomer ? callerCustomer.id : null,
        callerName: callerName,
        callerEmail: callerEmail,
        callerPhone: callerPhone,
        callerDepartment: callerCustomer ? callerCustomer.department : '',
        callerLocation: location || (callerCustomer ? callerCustomer.location : ''),
        callerVip: isVip,
        // Opened By
        openedBy: ITSMData.currentUser.username,
        openedByName: ITSMData.currentUser.name || ITSMData.currentUser.username,
        contactType: 'phone', // Default to phone
        // Classification
        category: category,
        subcategory: subcategory,
        businessService: service || null,
        impact: parseInt(impact),
        urgency: parseInt(urgency),
        priority: priority,
        // Status
        status: 'New',
        // Assignment
        assignmentGroup: assignmentGroup,
        assignedTo: assignmentGroup,
        assignee: assigneeName,
        assigneeName: assigneeName,
        assigneeId: assignee || null,
        // Configuration Item
        configurationItem: configItem || null,
        affectedAsset: configItem || null,
        // Legacy fields for compatibility
        reporter: callerEmail || callerName,
        reporterName: callerName,
        reporterPhone: callerPhone,
        reporterEmail: callerEmail,
        location: location,
        isVip: isVip,
        callbackRequired: callbackRequired,
        configItem: configItem || null,
        // Timestamps
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: ITSMData.currentUser.username,
        slaTarget: slaTarget,
        // Watch list and notifications
        watchList: [],
        additionalCommentsNotify: callerEmail ? [callerEmail] : [],
        workNotesNotify: [],
        // Attachments and notes
        attachments: attachments,
        notes: [],
        linkedKB: [],
        linkedChanges: [],
        linkedProblems: []
    };

    ITSMData.incidents.unshift(newIncident);

    // Add audit log entry
    if (ITSMData.auditLog) {
        ITSMData.auditLog.unshift({
            timestamp: new Date().toISOString(),
            actor: ITSMData.currentUser.username,
            action: 'Incident Created',
            target: newId,
            details: `Created ${priority} incident: ${summary}`
        });
    }

    // Add notification
    if (typeof NotificationsModule !== 'undefined') {
        NotificationsModule.add({
            type: 'incident',
            title: 'Incident Created',
            message: `${newId}: ${summary}`,
            relatedId: newId
        });
    }

    closeModal();
    showToast(`Incident ${newId} created successfully`, 'success');
    updateSidebarBadges();

    if (currentModule === 'incidents') {
        renderModule('incidents');
        // Auto-select the new incident
        setTimeout(() => selectIncident(newId), 100);
    }
}

function saveIncident(incidentId) {
    if (typeof IncidentsModule !== 'undefined' && IncidentsModule.saveIncident) {
        IncidentsModule.saveIncident(incidentId);
    } else {
        showToast('Changes saved successfully', 'success');
    }
}

function resolveIncident(incidentId) {
    if (typeof IncidentsModule !== 'undefined' && IncidentsModule.resolveIncident) {
        IncidentsModule.resolveIncident(incidentId);
    } else {
        showToast(`Incident ${incidentId} marked as resolved`, 'success');
    }
}

function escalateIncident(incidentId) {
    if (typeof IncidentsModule !== 'undefined' && IncidentsModule.escalateIncident) {
        IncidentsModule.escalateIncident(incidentId);
    } else {
        showToast(`Incident ${incidentId} escalated`, 'warning');
    }
}

function addNote(incidentId, isInternal) {
    if (typeof IncidentsModule !== 'undefined' && IncidentsModule.addNote) {
        IncidentsModule.addNote(incidentId, isInternal);
    } else {
        const noteContent = document.getElementById('new-note')?.value;
        if (noteContent) {
            showToast('Note added successfully', 'success');
            document.getElementById('new-note').value = '';
        }
    }
}

function uploadAttachment(incidentId) {
    if (typeof IncidentsModule !== 'undefined' && IncidentsModule.uploadAttachment) {
        IncidentsModule.uploadAttachment(incidentId);
    } else {
        showToast('File upload dialog would open here', 'info');
    }
}

function createNewChange() {
    if (typeof ChangesModule !== 'undefined' && ChangesModule.createNewChange) {
        ChangesModule.createNewChange();
    } else {
        showToast('Create Change Request form would open here', 'info');
    }
}

function viewChange(changeId) {
    if (typeof ChangesModule !== 'undefined' && ChangesModule.viewChange) {
        ChangesModule.viewChange(changeId);
    } else {
        showToast(`Viewing change ${changeId}`, 'info');
    }
}

function openIncidentDetail(incidentId) {
    setActiveModule('incidents');
    setTimeout(() => selectIncident(incidentId), 100);
}

// ==================== PROBLEMS MODULE ====================

function renderProblems() {
    if (typeof ProblemsModule !== 'undefined' && ProblemsModule.renderProblems) {
        return ProblemsModule.renderProblems();
    }
    return `
        <div class="page-header">
            <h1 class="page-title">Problems</h1>
        </div>
        <div class="page-content">
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-title">Problems Module Loading...</div>
            </div>
        </div>
    `;
}

// ==================== SERVICE CATALOG MODULE ====================

function renderServiceCatalog() {
    if (typeof CatalogModule !== 'undefined' && CatalogModule.renderCatalog) {
        return CatalogModule.renderCatalog();
    }
    return `
        <div class="page-header">
            <h1 class="page-title">Service Catalog</h1>
        </div>
        <div class="page-content">
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <div class="empty-state-title">Service Catalog Loading...</div>
            </div>
        </div>
    `;
}

function renderMyRequests() {
    if (typeof CatalogModule !== 'undefined' && CatalogModule.renderMyRequests) {
        return CatalogModule.renderMyRequests();
    }
    return `
        <div class="page-header">
            <h1 class="page-title">My Requests</h1>
        </div>
        <div class="page-content">
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <div class="empty-state-title">Requests Module Loading...</div>
            </div>
        </div>
    `;
}

function resetDemoData() {
    if (confirm('Are you sure you want to reset all demo data?')) {
        showToast('Demo data has been reset', 'success');
        location.reload();
    }
}

function toggleRightPanel() {
    document.getElementById('right-panel').classList.toggle('hidden');
}

function showSessionInfo() {
    showToast('Session info: tech.support | Role: Technician | Team: Service Desk', 'info');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/';
    }
}

// ==================== TOAST NOTIFICATIONS ====================

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Close modal on overlay click
document.getElementById('modal-overlay')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});
