/**
 * ITSM Console - Audit Log Module
 */

const AuditLogModule = {
    // Filter state
    filters: {
        actor: '',
        action: '',
        dateFrom: '',
        dateTo: ''
    },

    // Render audit log page (re-fetch from API)
    render() {
        // Fire-and-forget refresh of audit log from API
        ITSMApi.loadRecentAuditLog().then(() => {
            const content = document.getElementById('audit-log-content');
            if (content) {
                content.innerHTML = this.renderTable(ITSMData.auditLog);
            }
        }).catch(() => {});

        return `
            <div class="page-header">
                <div class="page-title"><img class="page-icon" src="icons/audit.png" alt=""> Audit Log</div>
                <div class="page-subtitle">System activity and change history</div>
            </div>
            <div class="toolbar">
                <div class="toolbar-group">
                    <input type="text" placeholder="Filter by actor..." id="audit-actor" style="width: 150px; padding: 4px;" oninput="AuditLogModule.applyFilters()">
                    <select class="form-control" style="width: 150px; padding: 4px;" id="audit-action" onchange="AuditLogModule.applyFilters()">
                        <option value="">All Actions</option>
                        <option>Incident Created</option>
                        <option>Incident Updated</option>
                        <option>Incident Resolved</option>
                        <option>Change Created</option>
                        <option>Change Approved</option>
                        <option>KB Article Created</option>
                        <option>Runbook Executed</option>
                    </select>
                </div>
                <div class="toolbar-group" style="margin-left: var(--spacing-md);">
                    <label style="font-size: 11px; margin-right: 4px;">From:</label>
                    <input type="date" id="audit-date-from" style="padding: 4px;" onchange="AuditLogModule.applyFilters()">
                    <label style="font-size: 11px; margin: 0 4px;">To:</label>
                    <input type="date" id="audit-date-to" style="padding: 4px;" onchange="AuditLogModule.applyFilters()">
                </div>
                <div class="toolbar-group" style="margin-left: auto;">
                    <button class="btn btn-sm btn-secondary" onclick="AuditLogModule.clearFilters()">Clear Filters</button>
                    <button class="btn btn-sm btn-primary" onclick="AuditLogModule.exportCSV()">📥 Export CSV</button>
                </div>
            </div>
            <div class="page-content" id="audit-log-content">
                ${this.renderTable(ITSMData.auditLog)}
            </div>
        `;
    },

    renderTable(logs) {
        if (logs.length === 0) {
            return '<div class="empty-state"><div class="empty-state-icon">📝</div><div class="empty-state-title">No audit entries found</div></div>';
        }

        return `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 150px;">Timestamp</th>
                            <th style="width: 150px;">Actor</th>
                            <th style="width: 150px;">Action</th>
                            <th style="width: 100px;">Target</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${logs.map(log => `
                            <tr>
                                <td class="cell-date">${Utils.formatDateTime(log.timestamp)}</td>
                                <td>${log.actor}</td>
                                <td><span class="badge badge-new">${log.action}</span></td>
                                <td class="cell-id">${log.target}</td>
                                <td>${log.details}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: var(--spacing-md); font-size: 11px; color: var(--text-muted);">
                Showing ${logs.length} entries
            </div>
        `;
    },

    applyFilters() {
        const actor = document.getElementById('audit-actor')?.value?.toLowerCase() || '';
        const action = document.getElementById('audit-action')?.value || '';
        const dateFrom = document.getElementById('audit-date-from')?.value || '';
        const dateTo = document.getElementById('audit-date-to')?.value || '';

        const filtered = ITSMData.auditLog.filter(log => {
            const matchActor = !actor || log.actor.toLowerCase().includes(actor);
            const matchAction = !action || log.action === action;

            let matchDateFrom = true;
            let matchDateTo = true;

            if (dateFrom) {
                matchDateFrom = new Date(log.timestamp) >= new Date(dateFrom);
            }
            if (dateTo) {
                matchDateTo = new Date(log.timestamp) <= new Date(dateTo + 'T23:59:59');
            }

            return matchActor && matchAction && matchDateFrom && matchDateTo;
        });

        document.getElementById('audit-log-content').innerHTML = this.renderTable(filtered);
    },

    clearFilters() {
        document.getElementById('audit-actor').value = '';
        document.getElementById('audit-action').value = '';
        document.getElementById('audit-date-from').value = '';
        document.getElementById('audit-date-to').value = '';
        this.applyFilters();
    },

    exportCSV() {
        const logs = ITSMData.auditLog;
        const headers = ['Timestamp', 'Actor', 'Action', 'Target', 'Details'];
        const rows = logs.map(log => [
            log.timestamp,
            log.actor,
            log.action,
            log.target,
            log.details
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        Toast.success('Audit log exported successfully');
    }
};

window.AuditLogModule = AuditLogModule;
