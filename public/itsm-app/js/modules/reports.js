/**
 * ITSM Console - Reports Module
 */

const ReportsModule = {
    // Generate Incident Summary Report
    generateIncidentSummary() {
        const incidents = ITSMData.incidents;
        const stats = {
            total: incidents.length,
            byStatus: {},
            byPriority: {},
            byCategory: {},
            avgResolutionTime: 0,
            slaBreaches: 0
        };

        let totalResolutionTime = 0;
        let resolvedCount = 0;

        incidents.forEach(inc => {
            // By status
            stats.byStatus[inc.status] = (stats.byStatus[inc.status] || 0) + 1;
            // By priority
            stats.byPriority[inc.priority] = (stats.byPriority[inc.priority] || 0) + 1;
            // By category
            stats.byCategory[inc.category] = (stats.byCategory[inc.category] || 0) + 1;
            // SLA breaches
            if (new Date(inc.slaTarget) < new Date() && inc.status !== 'Resolved' && inc.status !== 'Closed') {
                stats.slaBreaches++;
            }
            // Resolution time
            if (inc.resolvedAt) {
                totalResolutionTime += new Date(inc.resolvedAt) - new Date(inc.createdAt);
                resolvedCount++;
            }
        });

        if (resolvedCount > 0) {
            stats.avgResolutionTime = Math.round(totalResolutionTime / resolvedCount / 3600000 * 10) / 10; // hours
        }

        this.showReport('Incident Summary Report', `
            <div class="widget-grid" style="margin-bottom: var(--spacing-lg);">
                <div class="widget">
                    <div class="widget-header">Total Incidents</div>
                    <div class="widget-body widget-stat">
                        <div class="widget-stat-value">${stats.total}</div>
                    </div>
                </div>
                <div class="widget">
                    <div class="widget-header">SLA Breaches</div>
                    <div class="widget-body widget-stat">
                        <div class="widget-stat-value" style="color: var(--accent-red);">${stats.slaBreaches}</div>
                    </div>
                </div>
                <div class="widget">
                    <div class="widget-header">Avg Resolution</div>
                    <div class="widget-body widget-stat">
                        <div class="widget-stat-value">${stats.avgResolutionTime}h</div>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg);">
                <div class="card">
                    <div class="card-header">By Status</div>
                    <div class="card-body">
                        ${Object.entries(stats.byStatus).map(([status, count]) => `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>${Utils.getStatusBadge(status)}</span>
                                <strong>${count}</strong>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">By Priority</div>
                    <div class="card-body">
                        ${Object.entries(stats.byPriority).sort().map(([priority, count]) => `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>${Utils.getPriorityBadge(priority)}</span>
                                <strong>${count}</strong>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="card" style="grid-column: span 2;">
                    <div class="card-header">By Category</div>
                    <div class="card-body">
                        <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-md);">
                            ${Object.entries(stats.byCategory).map(([cat, count]) => `
                                <div style="background: var(--bg-secondary); padding: 8px 16px; border-radius: 4px;">
                                    <strong>${cat}</strong>: ${count}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `);
    },

    // Generate SLA Compliance Report
    generateSLAReport() {
        const incidents = ITSMData.incidents;
        const now = new Date();

        let withinSLA = 0;
        let breached = 0;
        let atRisk = 0; // Less than 1 hour remaining

        incidents.forEach(inc => {
            if (inc.status === 'Resolved' || inc.status === 'Closed') {
                withinSLA++;
            } else {
                const sla = new Date(inc.slaTarget);
                const diff = sla - now;
                if (diff < 0) {
                    breached++;
                } else if (diff < 3600000) {
                    atRisk++;
                } else {
                    withinSLA++;
                }
            }
        });

        const total = incidents.length;
        const complianceRate = total > 0 ? Math.round((withinSLA / total) * 100) : 100;

        this.showReport('SLA Compliance Report', `
            <div class="widget-grid" style="margin-bottom: var(--spacing-lg);">
                <div class="widget">
                    <div class="widget-header">Compliance Rate</div>
                    <div class="widget-body widget-stat">
                        <div class="widget-stat-value" style="color: ${complianceRate >= 90 ? 'var(--accent-green)' : complianceRate >= 70 ? 'var(--accent-orange)' : 'var(--accent-red)'};">${complianceRate}%</div>
                    </div>
                </div>
                <div class="widget">
                    <div class="widget-header">Within SLA</div>
                    <div class="widget-body widget-stat">
                        <div class="widget-stat-value" style="color: var(--accent-green);">${withinSLA}</div>
                    </div>
                </div>
                <div class="widget">
                    <div class="widget-header">At Risk (< 1h)</div>
                    <div class="widget-body widget-stat">
                        <div class="widget-stat-value" style="color: var(--accent-orange);">${atRisk}</div>
                    </div>
                </div>
                <div class="widget">
                    <div class="widget-header">Breached</div>
                    <div class="widget-body widget-stat">
                        <div class="widget-stat-value" style="color: var(--accent-red);">${breached}</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">Breached & At-Risk Incidents</div>
                <div class="card-body" style="padding: 0;">
                    <table class="data-table">
                        <thead>
                            <tr><th>ID</th><th>Summary</th><th>Priority</th><th>SLA Status</th><th>Target</th></tr>
                        </thead>
                        <tbody>
                            ${incidents.filter(i => {
                                if (i.status === 'Resolved' || i.status === 'Closed') return false;
                                const diff = new Date(i.slaTarget) - now;
                                return diff < 3600000;
                            }).map(inc => `
                                <tr>
                                    <td class="cell-id">${inc.id}</td>
                                    <td>${Utils.truncate(inc.summary, 40)}</td>
                                    <td>${Utils.getPriorityBadge(inc.priority)}</td>
                                    <td>${Utils.renderSLABadge(inc)}</td>
                                    <td class="cell-date">${Utils.formatDateTime(inc.slaTarget)}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="5" style="text-align: center;">No breached or at-risk incidents</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `);
    },

    // Generate Team Performance Report
    generateTeamPerformance() {
        const incidents = ITSMData.incidents;
        const teamStats = {};

        incidents.forEach(inc => {
            const team = inc.assignedTo || 'Unassigned';
            if (!teamStats[team]) {
                teamStats[team] = { total: 0, resolved: 0, open: 0, p1: 0 };
            }
            teamStats[team].total++;
            if (inc.status === 'Resolved' || inc.status === 'Closed') {
                teamStats[team].resolved++;
            } else {
                teamStats[team].open++;
            }
            if (inc.priority === 'P1') {
                teamStats[team].p1++;
            }
        });

        this.showReport('Team Performance Report', `
            <div class="card">
                <div class="card-header">Performance by Team</div>
                <div class="card-body" style="padding: 0;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Team</th>
                                <th>Total</th>
                                <th>Open</th>
                                <th>Resolved</th>
                                <th>P1 Critical</th>
                                <th>Resolution Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(teamStats).map(([team, stats]) => {
                                const rate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
                                return `
                                    <tr>
                                        <td><strong>${team}</strong></td>
                                        <td>${stats.total}</td>
                                        <td>${stats.open}</td>
                                        <td>${stats.resolved}</td>
                                        <td>${stats.p1}</td>
                                        <td>
                                            <span style="color: ${rate >= 70 ? 'var(--accent-green)' : 'var(--accent-orange)'};">
                                                ${rate}%
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `);
    },

    // Generate Change Success Rate Report
    generateChangeReport() {
        const changes = ITSMData.changes;
        const stats = {
            total: changes.length,
            implemented: 0,
            failed: 0,
            pending: 0,
            scheduled: 0,
            byType: {},
            byRisk: {}
        };

        changes.forEach(chg => {
            if (chg.status === 'Implemented') stats.implemented++;
            else if (chg.status === 'Failed') stats.failed++;
            else if (chg.status === 'Pending Approval') stats.pending++;
            else if (chg.status === 'Scheduled') stats.scheduled++;

            stats.byType[chg.type] = (stats.byType[chg.type] || 0) + 1;
            stats.byRisk[chg.risk] = (stats.byRisk[chg.risk] || 0) + 1;
        });

        const successRate = stats.implemented + stats.failed > 0
            ? Math.round((stats.implemented / (stats.implemented + stats.failed)) * 100)
            : 100;

        this.showReport('Change Success Rate Report', `
            <div class="widget-grid" style="margin-bottom: var(--spacing-lg);">
                <div class="widget">
                    <div class="widget-header">Success Rate</div>
                    <div class="widget-body widget-stat">
                        <div class="widget-stat-value" style="color: ${successRate >= 90 ? 'var(--accent-green)' : 'var(--accent-orange)'};">${successRate}%</div>
                    </div>
                </div>
                <div class="widget">
                    <div class="widget-header">Total Changes</div>
                    <div class="widget-body widget-stat">
                        <div class="widget-stat-value">${stats.total}</div>
                    </div>
                </div>
                <div class="widget">
                    <div class="widget-header">Pending Approval</div>
                    <div class="widget-body widget-stat">
                        <div class="widget-stat-value">${stats.pending}</div>
                    </div>
                </div>
                <div class="widget">
                    <div class="widget-header">Scheduled</div>
                    <div class="widget-body widget-stat">
                        <div class="widget-stat-value">${stats.scheduled}</div>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg);">
                <div class="card">
                    <div class="card-header">By Type</div>
                    <div class="card-body">
                        ${Object.entries(stats.byType).map(([type, count]) => `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span class="badge ${type === 'Emergency' ? 'badge-critical' : 'badge-new'}">${type}</span>
                                <strong>${count}</strong>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">By Risk Level</div>
                    <div class="card-body">
                        ${Object.entries(stats.byRisk).map(([risk, count]) => `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span class="badge ${risk === 'High' ? 'badge-critical' : risk === 'Medium' ? 'badge-open' : 'badge-resolved'}">${risk}</span>
                                <strong>${count}</strong>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `);
    },

    // Show report modal
    showReport(title, content) {
        Modals.show(`
            <div class="modal-header">
                <span>📊 ${title}</span>
                <button class="panel-close" onclick="Modals.close()">×</button>
            </div>
            <div class="modal-body" style="max-width: 900px; max-height: 80vh; overflow-y: auto;">
                ${content}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="Modals.close()">Close</button>
                <button class="btn btn-primary" onclick="ReportsModule.exportReport('${title}')">📥 Export CSV</button>
            </div>
        `);
    },

    // Export report (simulated)
    exportReport(reportName) {
        Toast.show(`Exporting ${reportName}...`, 'info');
        setTimeout(() => {
            Toast.show(`${reportName} exported successfully`, 'success');
        }, 1000);
    },

    // Render reports page
    render() {
        return `
            <div class="page-header">
                <div class="page-title">📈 Reports</div>
                <div class="page-subtitle">Service Desk Analytics and Reports</div>
            </div>
            <div class="page-content">
                <div class="widget-grid">
                    <div class="card" style="cursor: pointer;" onclick="ReportsModule.generateIncidentSummary()">
                        <div class="card-body" style="text-align: center; padding: var(--spacing-xl);">
                            <div style="font-size: 32px; margin-bottom: var(--spacing-sm);">📊</div>
                            <strong>Incident Summary Report</strong>
                            <p style="font-size: 11px; color: var(--text-muted);">Weekly incident statistics</p>
                        </div>
                    </div>
                    <div class="card" style="cursor: pointer;" onclick="ReportsModule.generateSLAReport()">
                        <div class="card-body" style="text-align: center; padding: var(--spacing-xl);">
                            <div style="font-size: 32px; margin-bottom: var(--spacing-sm);">⏱️</div>
                            <strong>SLA Compliance Report</strong>
                            <p style="font-size: 11px; color: var(--text-muted);">SLA performance metrics</p>
                        </div>
                    </div>
                    <div class="card" style="cursor: pointer;" onclick="ReportsModule.generateTeamPerformance()">
                        <div class="card-body" style="text-align: center; padding: var(--spacing-xl);">
                            <div style="font-size: 32px; margin-bottom: var(--spacing-sm);">👥</div>
                            <strong>Team Performance</strong>
                            <p style="font-size: 11px; color: var(--text-muted);">Technician workload analysis</p>
                        </div>
                    </div>
                    <div class="card" style="cursor: pointer;" onclick="ReportsModule.generateChangeReport()">
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
};

window.ReportsModule = ReportsModule;
