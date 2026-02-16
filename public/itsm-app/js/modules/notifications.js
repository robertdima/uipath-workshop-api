/**
 * ITSM Console - Enhanced Notifications Module
 * Provides notification bell, dropdown panel, SLA warnings, and notification management
 */

const NotificationsModule = {
    // Notification type configurations
    notificationTypes: {
        'sla-warning': {
            icon: '⚠️',
            color: 'var(--accent-orange)',
            title: 'SLA Warning'
        },
        'sla-breached': {
            icon: '🔴',
            color: 'var(--accent-red)',
            title: 'SLA Breached'
        },
        'assignment': {
            icon: '👤',
            color: 'var(--accent-blue)',
            title: 'Assignment'
        },
        'cab-approval': {
            icon: '📋',
            color: 'var(--accent-purple)',
            title: 'CAB Approval'
        },
        'change-scheduled': {
            icon: '📅',
            color: 'var(--accent-blue)',
            title: 'Change Scheduled'
        },
        'escalation': {
            icon: '⬆️',
            color: 'var(--accent-orange)',
            title: 'Escalation'
        }
    },

    // Panel state
    panelOpen: false,

    // SLA check interval ID
    slaCheckInterval: null,

    /**
     * Initialize the notifications module
     */
    init: function() {
        // Start SLA monitoring
        this.startSLAMonitoring();

        // Setup click outside listener to close panel
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notifications-panel');
            const bell = document.getElementById('notification-bell');
            if (panel && this.panelOpen && !panel.contains(e.target) && !bell?.contains(e.target)) {
                this.closePanel();
            }
        });
    },

    /**
     * Get unread notifications count
     * @returns {number} Count of unread notifications
     */
    getUnreadCount: function() {
        return ITSMData.notifications.filter(n => !n.read).length;
    },

    /**
     * Render the notification bell icon with badge for the header
     * @returns {string} HTML string for the bell icon
     */
    renderBellIcon: function() {
        const unreadCount = this.getUnreadCount();
        return `
            <div class="notification-bell-container" id="notification-bell" onclick="NotificationsModule.togglePanel(event)">
                <span class="notification-bell-icon">🔔</span>
                ${unreadCount > 0 ? `
                    <span class="notification-badge" id="notification-count">${unreadCount > 99 ? '99+' : unreadCount}</span>
                ` : ''}
            </div>
        `;
    },

    /**
     * Update the notification badge count
     */
    updateBadge: function() {
        const count = this.getUnreadCount();
        const badge = document.getElementById('notification-count');
        const container = document.getElementById('notification-bell');

        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        } else if (count > 0 && container) {
            // Badge doesn't exist but we have notifications - re-render
            const badgeHtml = `<span class="notification-badge" id="notification-count">${count > 99 ? '99+' : count}</span>`;
            container.insertAdjacentHTML('beforeend', badgeHtml);
        }
    },

    /**
     * Toggle the notifications panel
     * @param {Event} event - Click event
     */
    togglePanel: function(event) {
        if (event) {
            event.stopPropagation();
        }

        if (this.panelOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    },

    /**
     * Open the notifications dropdown panel
     */
    openPanel: function() {
        // Close any existing panel first
        this.closePanel();

        const bellContainer = document.getElementById('notification-bell');
        if (!bellContainer) return;

        const notifications = ITSMData.notifications.slice(0, 10); // Show max 10 recent

        const panelHtml = `
            <div class="notifications-panel" id="notifications-panel">
                <div class="notifications-panel-header">
                    <span class="notifications-panel-title">Notifications</span>
                    ${notifications.length > 0 ? `
                        <button class="notifications-dismiss-all" onclick="NotificationsModule.dismissAll(event)">
                            Clear All
                        </button>
                    ` : ''}
                </div>
                <div class="notifications-panel-body">
                    ${notifications.length === 0 ? `
                        <div class="notifications-empty">
                            <div class="notifications-empty-icon">🔔</div>
                            <div class="notifications-empty-text">No notifications</div>
                        </div>
                    ` : notifications.map(n => this.renderNotificationItem(n)).join('')}
                </div>
                ${notifications.length > 0 ? `
                    <div class="notifications-panel-footer">
                        <button class="notifications-mark-read" onclick="NotificationsModule.markAllRead(event)">
                            Mark All as Read
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        bellContainer.insertAdjacentHTML('afterend', panelHtml);
        this.panelOpen = true;
    },

    /**
     * Close the notifications panel
     */
    closePanel: function() {
        const panel = document.getElementById('notifications-panel');
        if (panel) {
            panel.remove();
        }
        this.panelOpen = false;
    },

    /**
     * Render a single notification item
     * @param {Object} notification - The notification object
     * @returns {string} HTML string for the notification item
     */
    renderNotificationItem: function(notification) {
        const config = this.notificationTypes[notification.type] || {
            icon: 'ℹ️',
            color: 'var(--text-muted)',
            title: 'Notification'
        };

        const timeAgo = this.formatTimeAgo(notification.timestamp);

        return `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}"
                 onclick="NotificationsModule.handleClick('${notification.id}', '${notification.link || ''}')">
                <div class="notification-item-icon" style="color: ${config.color}">
                    ${config.icon}
                </div>
                <div class="notification-item-content">
                    <div class="notification-item-title ${notification.read ? '' : 'unread'}">
                        ${notification.title}
                    </div>
                    <div class="notification-item-message">
                        ${notification.message}
                    </div>
                    <div class="notification-item-time">
                        ${timeAgo}
                    </div>
                </div>
                ${!notification.read ? '<div class="notification-item-dot"></div>' : ''}
            </div>
        `;
    },

    /**
     * Format timestamp as relative time
     * @param {string} timestamp - ISO timestamp
     * @returns {string} Relative time string
     */
    formatTimeAgo: function(timestamp) {
        const now = new Date();
        const then = new Date(timestamp);
        const diff = now - then;

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    /**
     * Handle notification click - mark as read and navigate
     * @param {string} notificationId - The notification ID
     * @param {string} link - The linked item ID
     */
    handleClick: function(notificationId, link) {
        // Mark as read
        this.markAsRead(notificationId);

        // Close panel
        this.closePanel();

        // Navigate to linked item
        if (link) {
            this.navigateToItem(link);
        }
    },

    /**
     * Navigate to a linked item
     * @param {string} link - The item ID (e.g., INC-001, CHG-457)
     */
    navigateToItem: function(link) {
        if (!link) return;

        if (link.startsWith('INC-')) {
            // Navigate to incident
            if (typeof setActiveModule === 'function') {
                setActiveModule('incidents');
            }
            setTimeout(() => {
                if (typeof selectIncident === 'function') {
                    selectIncident(link);
                }
            }, 100);
        } else if (link.startsWith('CHG-')) {
            // Navigate to change
            if (typeof setActiveModule === 'function') {
                setActiveModule('changes');
            }
            setTimeout(() => {
                if (typeof ChangesModule !== 'undefined') {
                    ChangesModule.viewChange(link);
                }
            }, 100);
        } else if (link.startsWith('PRB-')) {
            // Navigate to problem
            if (typeof setActiveModule === 'function') {
                setActiveModule('problems');
            }
        } else if (link.startsWith('REQ-')) {
            // Navigate to service request
            if (typeof setActiveModule === 'function') {
                setActiveModule('catalog');
            }
        }
    },

    /**
     * Mark a notification as read
     * @param {string} notificationId - The notification ID
     */
    markAsRead: function(notificationId) {
        const notification = ITSMData.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.updateBadge();
        }
    },

    /**
     * Mark all notifications as read
     * @param {Event} event - Click event
     */
    markAllRead: function(event) {
        if (event) {
            event.stopPropagation();
        }

        ITSMData.notifications.forEach(n => n.read = true);
        this.updateBadge();
        this.closePanel();

        if (typeof showToast === 'function') {
            showToast('All notifications marked as read', 'success');
        } else if (typeof Toast !== 'undefined') {
            Toast.success('All notifications marked as read');
        }
    },

    /**
     * Dismiss all notifications (clear)
     * @param {Event} event - Click event
     */
    dismissAll: function(event) {
        if (event) {
            event.stopPropagation();
        }

        // Clear all notifications
        ITSMData.notifications = [];
        this.updateBadge();
        this.closePanel();

        if (typeof showToast === 'function') {
            showToast('All notifications cleared', 'success');
        } else if (typeof Toast !== 'undefined') {
            Toast.success('All notifications cleared');
        }
    },

    /**
     * Add a new notification
     * @param {string} type - Notification type (sla-warning, sla-breached, assignment, cab-approval, change-scheduled, escalation)
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {string} link - Link to related item (e.g., INC-001)
     * @param {boolean} showToastNotification - Whether to show a toast notification
     * @returns {Object} The created notification
     */
    add: function(type, title, message, link = '', showToastNotification = true) {
        // Generate unique ID
        const maxId = ITSMData.notifications.reduce((max, n) => {
            const num = parseInt(n.id.replace('NOTIF-', '') || '0');
            return num > max ? num : max;
        }, 0);

        const newNotification = {
            id: `NOTIF-${String(maxId + 1).padStart(3, '0')}`,
            type: type,
            title: title,
            message: message,
            link: link,
            timestamp: new Date().toISOString(),
            read: false
        };

        // Add to beginning of array
        ITSMData.notifications.unshift(newNotification);

        // Update badge
        this.updateBadge();

        // Refresh panel if open
        if (this.panelOpen) {
            this.closePanel();
            this.openPanel();
        }

        // Show toast notification
        if (showToastNotification) {
            const config = this.notificationTypes[type] || { title: 'Notification' };
            if (typeof showToast === 'function') {
                showToast(message, type === 'sla-breached' ? 'error' : (type === 'sla-warning' ? 'warning' : 'info'));
            } else if (typeof Toast !== 'undefined') {
                if (type === 'sla-breached') {
                    Toast.error(message);
                } else if (type === 'sla-warning') {
                    Toast.warning(message);
                } else {
                    Toast.info(message);
                }
            }
        }

        return newNotification;
    },

    /**
     * Remove a notification
     * @param {string} notificationId - The notification ID to remove
     */
    remove: function(notificationId) {
        const index = ITSMData.notifications.findIndex(n => n.id === notificationId);
        if (index > -1) {
            ITSMData.notifications.splice(index, 1);
            this.updateBadge();
        }
    },

    /**
     * Start SLA monitoring - check for SLA warnings periodically
     * @param {number} intervalMs - Check interval in milliseconds (default: 60000 = 1 minute)
     */
    startSLAMonitoring: function(intervalMs = 60000) {
        // Clear any existing interval
        if (this.slaCheckInterval) {
            clearInterval(this.slaCheckInterval);
        }

        // Run initial check
        this.checkSLAWarnings();

        // Set up periodic checks
        this.slaCheckInterval = setInterval(() => {
            this.checkSLAWarnings();
        }, intervalMs);
    },

    /**
     * Stop SLA monitoring
     */
    stopSLAMonitoring: function() {
        if (this.slaCheckInterval) {
            clearInterval(this.slaCheckInterval);
            this.slaCheckInterval = null;
        }
    },

    /**
     * Check for SLA warnings and generate notifications
     */
    checkSLAWarnings: function() {
        if (!ITSMData || !ITSMData.incidents) return;

        const now = new Date();

        ITSMData.incidents.forEach(incident => {
            // Skip resolved/closed incidents
            if (incident.status === 'Resolved' || incident.status === 'Closed') return;

            // Skip incidents without SLA
            if (!incident.slaTarget) return;

            const slaTarget = new Date(incident.slaTarget);
            const timeRemaining = slaTarget - now;

            // Calculate SLA thresholds based on total SLA time
            const created = new Date(incident.createdAt);
            const totalTime = slaTarget - created;
            const warningThreshold = totalTime * 0.25; // 25% remaining = warning

            // Check for breach
            if (timeRemaining < 0) {
                // SLA breached - check if we already have a breach notification
                if (!this.hasNotification('sla-breached', incident.id)) {
                    this.add(
                        'sla-breached',
                        'SLA Breached',
                        `${incident.id} has breached its SLA`,
                        incident.id,
                        true
                    );
                }
            }
            // Check for warning (< 25% time remaining)
            else if (timeRemaining < warningThreshold) {
                // SLA at risk - check if we already have a warning notification
                if (!this.hasNotification('sla-warning', incident.id) && !this.hasNotification('sla-breached', incident.id)) {
                    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
                    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

                    let timeStr;
                    if (hoursRemaining > 0) {
                        timeStr = `${hoursRemaining}h ${minutesRemaining}m`;
                    } else {
                        timeStr = `${minutesRemaining}m`;
                    }

                    this.add(
                        'sla-warning',
                        'SLA Warning',
                        `${incident.id} is at risk of breaching SLA (${timeStr} remaining)`,
                        incident.id,
                        true
                    );
                }
            }
        });
    },

    /**
     * Check if a notification already exists for a specific type and link
     * @param {string} type - Notification type
     * @param {string} link - Linked item ID
     * @returns {boolean} Whether notification exists
     */
    hasNotification: function(type, link) {
        return ITSMData.notifications.some(n => n.type === type && n.link === link);
    },

    /**
     * Add assignment notification
     * @param {string} itemId - The assigned item ID
     * @param {string} itemTitle - The item title/summary
     * @param {string} assignedTo - Who it was assigned to
     */
    addAssignmentNotification: function(itemId, itemTitle, assignedTo) {
        // Only notify if assigned to current user
        if (assignedTo === ITSMData.currentUser?.username ||
            assignedTo === ITSMData.currentUser?.team) {
            this.add(
                'assignment',
                'New Assignment',
                `${itemId} has been assigned to you: ${itemTitle}`,
                itemId,
                true
            );
        }
    },

    /**
     * Add CAB approval notification
     * @param {string} changeId - The change ID
     * @param {string} changeTitle - The change title
     */
    addCABApprovalNotification: function(changeId, changeTitle) {
        this.add(
            'cab-approval',
            'CAB Approval Needed',
            `${changeId} requires CAB approval: ${changeTitle}`,
            changeId,
            true
        );
    },

    /**
     * Add change scheduled notification
     * @param {string} changeId - The change ID
     * @param {string} changeTitle - The change title
     * @param {string} scheduledTime - When the change is scheduled
     */
    addChangeScheduledNotification: function(changeId, changeTitle, scheduledTime) {
        const scheduleDate = new Date(scheduledTime);
        const scheduleStr = scheduleDate.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        this.add(
            'change-scheduled',
            'Change Scheduled',
            `${changeId} is scheduled for ${scheduleStr}: ${changeTitle}`,
            changeId,
            true
        );
    },

    /**
     * Add escalation notification
     * @param {string} itemId - The escalated item ID
     * @param {string} itemTitle - The item title
     * @param {string} escalatedTo - Team/person escalated to
     */
    addEscalationNotification: function(itemId, itemTitle, escalatedTo) {
        this.add(
            'escalation',
            'Escalation',
            `${itemId} has been escalated to ${escalatedTo}: ${itemTitle}`,
            itemId,
            true
        );
    },

    /**
     * Show notifications in a modal panel (legacy support)
     */
    showPanel: function() {
        const notifications = ITSMData.notifications;

        if (typeof Modals !== 'undefined') {
            Modals.show(`
                <div class="modal-header">
                    <span>🔔 Notifications</span>
                    <button class="panel-close" onclick="Modals.close()">×</button>
                </div>
                <div class="modal-body" style="width: 500px; max-height: 500px; overflow-y: auto; padding: 0;">
                    ${notifications.length === 0 ? `
                        <div class="empty-state" style="padding: var(--spacing-xl);">
                            <div class="empty-state-icon">🔔</div>
                            <div class="empty-state-title">No notifications</div>
                            <div class="empty-state-text">You're all caught up!</div>
                        </div>
                    ` : `
                        ${notifications.map(n => {
                            const config = this.notificationTypes[n.type] || { icon: 'ℹ️', color: 'var(--text-muted)' };
                            return `
                                <div class="notification-item ${n.read ? '' : 'unread'}"
                                     onclick="NotificationsModule.handleClick('${n.id}', '${n.link || ''}'); Modals.close();"
                                     style="padding: var(--spacing-md); border-bottom: 1px solid var(--border-light); cursor: pointer; background: ${n.read ? 'transparent' : 'var(--bg-panel)'};">
                                    <div style="display: flex; align-items: start; gap: var(--spacing-sm);">
                                        <span style="font-size: 20px; color: ${config.color};">${config.icon}</span>
                                        <div style="flex: 1;">
                                            <div style="font-weight: ${n.read ? 'normal' : 'bold'}; margin-bottom: 4px;">
                                                ${n.title}
                                            </div>
                                            <div style="font-size: 11px; color: var(--text-secondary);">
                                                ${n.message}
                                            </div>
                                            <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">
                                                ${this.formatTimeAgo(n.timestamp)}
                                            </div>
                                        </div>
                                        ${!n.read ? '<span style="width: 8px; height: 8px; background: var(--accent-blue); border-radius: 50%;"></span>' : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    `}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="NotificationsModule.dismissAll(); Modals.close();">Clear All</button>
                    <button class="btn btn-secondary" onclick="NotificationsModule.markAllRead(); Modals.close();">Mark All Read</button>
                    <button class="btn btn-primary" onclick="Modals.close()">Close</button>
                </div>
            `);
        }
    },

    /**
     * Get icon for notification type (legacy support)
     * @param {string} type - Notification type
     * @returns {string} Icon emoji
     */
    getIcon: function(type) {
        const config = this.notificationTypes[type];
        return config ? config.icon : 'ℹ️';
    },

    /**
     * Get notifications summary for dashboard widget
     * @returns {Object} Summary object with counts
     */
    getSummary: function() {
        const notifications = ITSMData.notifications;
        const unread = notifications.filter(n => !n.read).length;
        const slaWarnings = notifications.filter(n => n.type === 'sla-warning' && !n.read).length;
        const slaBreaches = notifications.filter(n => n.type === 'sla-breached' && !n.read).length;
        const assignments = notifications.filter(n => n.type === 'assignment' && !n.read).length;
        const cabApprovals = notifications.filter(n => n.type === 'cab-approval' && !n.read).length;

        return {
            total: notifications.length,
            unread: unread,
            slaWarnings: slaWarnings,
            slaBreaches: slaBreaches,
            assignments: assignments,
            cabApprovals: cabApprovals
        };
    },

    /**
     * Render a notification widget for the dashboard
     * @returns {string} HTML string for the widget
     */
    renderWidget: function() {
        const summary = this.getSummary();
        const recent = ITSMData.notifications.slice(0, 5);

        return `
            <div class="widget notification-widget">
                <div class="widget-header">
                    <span>🔔 Notifications</span>
                    <span class="widget-badge">${summary.unread} unread</span>
                </div>
                <div class="widget-body">
                    ${summary.slaBreaches > 0 ? `
                        <div class="notification-alert alert-danger">
                            <span class="alert-icon">🔴</span>
                            <span>${summary.slaBreaches} SLA breach${summary.slaBreaches > 1 ? 'es' : ''}</span>
                        </div>
                    ` : ''}
                    ${summary.slaWarnings > 0 ? `
                        <div class="notification-alert alert-warning">
                            <span class="alert-icon">⚠️</span>
                            <span>${summary.slaWarnings} SLA warning${summary.slaWarnings > 1 ? 's' : ''}</span>
                        </div>
                    ` : ''}
                    ${summary.cabApprovals > 0 ? `
                        <div class="notification-alert alert-info">
                            <span class="alert-icon">📋</span>
                            <span>${summary.cabApprovals} pending CAB approval${summary.cabApprovals > 1 ? 's' : ''}</span>
                        </div>
                    ` : ''}
                    <div class="notification-recent-list">
                        ${recent.length === 0 ? `
                            <div class="notification-empty-small">No recent notifications</div>
                        ` : recent.map(n => {
                            const config = this.notificationTypes[n.type] || { icon: 'ℹ️' };
                            return `
                                <div class="notification-recent-item ${n.read ? '' : 'unread'}"
                                     onclick="NotificationsModule.handleClick('${n.id}', '${n.link || ''}')">
                                    <span class="notification-recent-icon">${config.icon}</span>
                                    <span class="notification-recent-text">${n.message.substring(0, 40)}${n.message.length > 40 ? '...' : ''}</span>
                                    <span class="notification-recent-time">${this.formatTimeAgo(n.timestamp)}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div class="widget-footer">
                    <button class="btn btn-sm btn-secondary" onclick="NotificationsModule.showPanel()">
                        View All
                    </button>
                </div>
            </div>
        `;
    }
};

// Export to window
window.NotificationsModule = NotificationsModule;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    NotificationsModule.init();
});

// Backwards compatibility - legacy function names
window.showNotifications = function() {
    NotificationsModule.showPanel();
};
