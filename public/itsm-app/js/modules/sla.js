/**
 * SLA Module - SLA Indicators and Management
 * Provides SLA visualization, breach detection, and SLA-related utilities
 */

const SLAModule = {
    // SLA thresholds for color coding
    thresholds: {
        green: 0.5,   // > 50% time remaining
        yellow: 0.25, // > 25% time remaining
        red: 0       // > 0% time remaining (approaching breach)
        // black = breached (negative time)
    },

    /**
     * Calculate SLA status for an incident
     * @param {Object} incident - The incident object with createdAt and slaTarget
     * @returns {Object} SLA status with time remaining, percentage, and status color
     */
    calculateSLA: function(incident) {
        if (!incident.slaTarget) {
            return { status: 'none', color: 'gray', text: 'No SLA', percentage: null, remaining: null };
        }

        const now = new Date();
        const created = new Date(incident.createdAt);
        const target = new Date(incident.slaTarget);

        // If resolved, check if it was within SLA
        if (incident.status === 'Resolved' || incident.status === 'Closed') {
            const resolved = incident.resolvedAt ? new Date(incident.resolvedAt) : now;
            if (resolved <= target) {
                return {
                    status: 'met',
                    color: 'green',
                    text: 'SLA Met',
                    percentage: 100,
                    remaining: null,
                    resolvedWithin: this.formatDuration(target - resolved)
                };
            } else {
                return {
                    status: 'breached',
                    color: 'black',
                    text: 'SLA Breached',
                    percentage: 0,
                    remaining: null,
                    breachedBy: this.formatDuration(resolved - target)
                };
            }
        }

        // Calculate time remaining
        const totalDuration = target - created;
        const elapsed = now - created;
        const remaining = target - now;
        const percentage = Math.max(0, (remaining / totalDuration) * 100);

        // Determine status
        let status, color, text;
        if (remaining < 0) {
            status = 'breached';
            color = 'black';
            text = `Breached by ${this.formatDuration(Math.abs(remaining))}`;
        } else if (percentage <= this.thresholds.red * 100) {
            status = 'critical';
            color = 'red';
            text = this.formatDuration(remaining) + ' remaining';
        } else if (percentage <= this.thresholds.yellow * 100) {
            status = 'warning';
            color = 'yellow';
            text = this.formatDuration(remaining) + ' remaining';
        } else {
            status = 'healthy';
            color = 'green';
            text = this.formatDuration(remaining) + ' remaining';
        }

        return {
            status,
            color,
            text,
            percentage: Math.round(percentage),
            remaining,
            target: target.toISOString()
        };
    },

    /**
     * Format duration in human-readable format
     */
    formatDuration: function(ms) {
        const totalMinutes = Math.floor(Math.abs(ms) / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;
            return `${days}d ${remainingHours}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    },

    /**
     * Render SLA badge for an incident
     */
    renderSLABadge: function(incident, size = 'normal') {
        const sla = this.calculateSLA(incident);
        const sizeClass = size === 'small' ? 'sla-badge-sm' : '';

        if (sla.status === 'none') {
            return `<span class="sla-badge sla-none ${sizeClass}">No SLA</span>`;
        }

        return `<span class="sla-badge sla-${sla.color} ${sizeClass}" title="SLA Target: ${incident.slaTarget}">
            ${sla.text}
        </span>`;
    },

    /**
     * Render SLA timer widget (for incident detail)
     */
    renderSLATimer: function(incident) {
        const sla = this.calculateSLA(incident);

        if (sla.status === 'none') {
            return `<div class="sla-timer sla-none">
                <div class="sla-timer-icon">⏱️</div>
                <div class="sla-timer-text">No SLA defined</div>
            </div>`;
        }

        const progressWidth = Math.min(100, Math.max(0, sla.percentage || 0));
        const targetDate = new Date(incident.slaTarget);
        const targetFormatted = targetDate.toLocaleString();

        return `<div class="sla-timer sla-${sla.color}">
            <div class="sla-timer-header">
                <span class="sla-timer-icon">${this.getStatusIcon(sla.status)}</span>
                <span class="sla-timer-label">SLA Status</span>
            </div>
            <div class="sla-timer-value">${sla.text}</div>
            <div class="sla-progress-bar">
                <div class="sla-progress-fill sla-${sla.color}" style="width: ${progressWidth}%"></div>
            </div>
            <div class="sla-timer-target">Target: ${targetFormatted}</div>
        </div>`;
    },

    /**
     * Get icon for SLA status
     */
    getStatusIcon: function(status) {
        switch (status) {
            case 'healthy': return '✅';
            case 'warning': return '⚠️';
            case 'critical': return '🔴';
            case 'breached': return '❌';
            case 'met': return '✅';
            default: return '⏱️';
        }
    },

    /**
     * Get all incidents at risk of SLA breach
     */
    getAtRiskIncidents: function() {
        return ITSMData.incidents.filter(inc => {
            if (inc.status === 'Resolved' || inc.status === 'Closed') return false;
            const sla = this.calculateSLA(inc);
            return sla.status === 'warning' || sla.status === 'critical';
        });
    },

    /**
     * Get all breached incidents
     */
    getBreachedIncidents: function() {
        return ITSMData.incidents.filter(inc => {
            const sla = this.calculateSLA(inc);
            return sla.status === 'breached';
        });
    },

    /**
     * Render SLA dashboard widget
     */
    renderSLAWidget: function() {
        const atRisk = this.getAtRiskIncidents();
        const breached = this.getBreachedIncidents();
        const openIncidents = ITSMData.incidents.filter(i =>
            i.status !== 'Resolved' && i.status !== 'Closed'
        );

        return `<div class="widget sla-widget">
            <div class="widget-header">
                <span>⏱️ SLA Status</span>
            </div>
            <div class="widget-body">
                <div class="sla-summary">
                    <div class="sla-stat ${breached.length > 0 ? 'sla-alert' : ''}">
                        <div class="sla-stat-value">${breached.length}</div>
                        <div class="sla-stat-label">Breached</div>
                    </div>
                    <div class="sla-stat ${atRisk.length > 0 ? 'sla-warning' : ''}">
                        <div class="sla-stat-value">${atRisk.length}</div>
                        <div class="sla-stat-label">At Risk</div>
                    </div>
                    <div class="sla-stat">
                        <div class="sla-stat-value">${openIncidents.length - breached.length - atRisk.length}</div>
                        <div class="sla-stat-label">On Track</div>
                    </div>
                </div>
                ${breached.length > 0 || atRisk.length > 0 ? this.renderUrgentList(breached, atRisk) : ''}
            </div>
        </div>`;
    },

    /**
     * Render urgent incidents list
     */
    renderUrgentList: function(breached, atRisk) {
        const urgent = [...breached, ...atRisk].slice(0, 3);

        return `<div class="sla-urgent-list">
            <div class="sla-urgent-header">Requires Attention</div>
            ${urgent.map(inc => {
                const sla = this.calculateSLA(inc);
                return `<div class="sla-urgent-item" onclick="openIncidentDetail('${inc.id}')">
                    <span class="sla-urgent-id">${inc.id}</span>
                    <span class="sla-urgent-summary">${inc.summary.substring(0, 30)}...</span>
                    <span class="sla-badge sla-${sla.color} sla-badge-sm">${sla.status === 'breached' ? 'BREACHED' : sla.text}</span>
                </div>`;
            }).join('')}
        </div>`;
    },

    /**
     * Add SLA filter options to incident filters
     */
    getSLAFilterOptions: function() {
        return `
            <option value="">All SLA Status</option>
            <option value="breached">Breached</option>
            <option value="at-risk">At Risk</option>
            <option value="on-track">On Track</option>
        `;
    },

    /**
     * Filter incidents by SLA status
     */
    filterBySLA: function(incidents, slaFilter) {
        if (!slaFilter) return incidents;

        return incidents.filter(inc => {
            const sla = this.calculateSLA(inc);
            switch (slaFilter) {
                case 'breached':
                    return sla.status === 'breached';
                case 'at-risk':
                    return sla.status === 'warning' || sla.status === 'critical';
                case 'on-track':
                    return sla.status === 'healthy' || sla.status === 'none';
                default:
                    return true;
            }
        });
    }
};

// Export to window
window.SLAModule = SLAModule;
