/**
 * Customers Module - Customer/Contact Database Management
 * Provides customer lookup, contact information, and VIP handling
 */

const CustomersModule = {
    /**
     * Find customer by email
     */
    findByEmail: function(email) {
        if (!email || !ITSMData.customers) return null;
        return ITSMData.customers.find(c => c.email.toLowerCase() === email.toLowerCase());
    },

    /**
     * Find customer by ID
     */
    findById: function(customerId) {
        if (!customerId || !ITSMData.customers) return null;
        return ITSMData.customers.find(c => c.id === customerId);
    },

    /**
     * Get customer for an incident
     */
    getCustomerForIncident: function(incident) {
        if (!incident || !incident.reporter) return null;
        return this.findByEmail(incident.reporter);
    },

    /**
     * Get manager information for a customer
     */
    getManager: function(customer) {
        if (!customer || !customer.manager) return null;
        return this.findByEmail(customer.manager);
    },

    /**
     * Render customer panel for incident detail
     */
    renderCustomerPanel: function(incident) {
        const customer = this.getCustomerForIncident(incident);

        if (!customer) {
            return `<div class="customer-panel customer-unknown">
                <div class="customer-panel-header">
                    <span class="customer-icon">👤</span>
                    <span>Reporter Information</span>
                </div>
                <div class="customer-panel-body">
                    <div class="customer-email">${incident.reporter || 'Unknown'}</div>
                    <div class="customer-note">No customer record found</div>
                </div>
            </div>`;
        }

        const manager = this.getManager(customer);

        return `<div class="customer-panel ${customer.vip ? 'customer-vip' : ''}">
            <div class="customer-panel-header">
                <span class="customer-icon">${customer.vip ? '⭐' : '👤'}</span>
                <span>Customer Information</span>
                ${customer.vip ? '<span class="vip-badge">VIP</span>' : ''}
            </div>
            <div class="customer-panel-body">
                <div class="customer-name">${customer.name}</div>
                <div class="customer-details">
                    <div class="customer-detail-row">
                        <span class="detail-icon">📧</span>
                        <span>${customer.email}</span>
                    </div>
                    <div class="customer-detail-row">
                        <span class="detail-icon">📞</span>
                        <span>${customer.phone}</span>
                    </div>
                    <div class="customer-detail-row">
                        <span class="detail-icon">🏢</span>
                        <span>${customer.department}</span>
                    </div>
                    <div class="customer-detail-row">
                        <span class="detail-icon">📍</span>
                        <span>${customer.location}</span>
                    </div>
                    ${customer.preferredContact ? `
                    <div class="customer-detail-row">
                        <span class="detail-icon">💬</span>
                        <span>Prefers: ${customer.preferredContact}</span>
                    </div>` : ''}
                </div>
                ${manager ? `
                <div class="customer-manager">
                    <div class="manager-label">Manager</div>
                    <div class="manager-name">${manager.name}</div>
                    <div class="manager-email">${manager.email}</div>
                </div>` : ''}
                <div class="customer-actions">
                    <button class="btn btn-sm btn-secondary" onclick="CustomersModule.callCustomer('${customer.id}')">
                        📞 Call
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="CustomersModule.emailCustomer('${customer.id}', '${incident.id}')">
                        📧 Email
                    </button>
                    ${manager ? `
                    <button class="btn btn-sm btn-warning" onclick="CustomersModule.escalateToManager('${customer.id}', '${incident.id}')">
                        ⬆️ Escalate to Manager
                    </button>` : ''}
                </div>
                ${customer.recentTickets && customer.recentTickets.length > 0 ? `
                <div class="customer-history">
                    <div class="history-label">Recent Tickets</div>
                    <div class="history-list">
                        ${customer.recentTickets.slice(0, 3).map(ticketId => {
                            const ticket = ITSMData.incidents.find(i => i.id === ticketId);
                            if (!ticket) return '';
                            return `<div class="history-item" onclick="openIncidentDetail('${ticketId}')">
                                <span class="history-id">${ticketId}</span>
                                <span class="history-summary">${ticket.summary.substring(0, 25)}...</span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>` : ''}
            </div>
        </div>`;
    },

    /**
     * Simulate calling customer
     */
    callCustomer: function(customerId) {
        const customer = this.findById(customerId);
        if (!customer) {
            showToast('Customer not found', 'error');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>📞 Calling ${customer.name}</span>
                <button class="panel-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body" style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">📞</div>
                <div style="font-size: 24px; margin-bottom: 10px;">${customer.name}</div>
                <div style="font-size: 18px; color: var(--text-secondary);">${customer.phone}</div>
                <div style="margin-top: 30px; color: var(--text-secondary);">
                    Initiating call via softphone...
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger" onclick="closeModal()">End Call</button>
            </div>
        `);

        // Audit logging handled server-side

        showToast(`Calling ${customer.name}...`, 'info');
    },

    /**
     * Open email dialog for customer
     */
    emailCustomer: function(customerId, incidentId) {
        const customer = this.findById(customerId);
        if (!customer) {
            showToast('Customer not found', 'error');
            return;
        }

        // Delegate to EmailModule if available
        if (typeof EmailModule !== 'undefined' && EmailModule.openEmailDialog) {
            EmailModule.openEmailDialog(customer.email, incidentId);
        } else {
            showModal(`
                <div class="modal-header">
                    <span>📧 Email ${customer.name}</span>
                    <button class="panel-close" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">To</label>
                        <input type="email" class="form-control" value="${customer.email}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Subject</label>
                        <input type="text" class="form-control" id="email-subject"
                            value="Re: ${incidentId ? incidentId + ' - ' : ''}Your Support Request">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Message</label>
                        <textarea class="form-control" id="email-body" rows="8" placeholder="Enter your message..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="CustomersModule.sendEmail('${customerId}', '${incidentId}')">Send Email</button>
                </div>
            `);
        }
    },

    /**
     * Send email (simulated)
     */
    sendEmail: function(customerId, incidentId) {
        const customer = this.findById(customerId);
        const subject = document.getElementById('email-subject')?.value || '';
        const body = document.getElementById('email-body')?.value || '';

        if (!body.trim()) {
            showToast('Please enter a message', 'error');
            return;
        }

        // Audit logging handled server-side

        // Add note to incident if applicable
        if (incidentId) {
            const incident = ITSMData.incidents.find(i => i.id === incidentId);
            if (incident) {
                incident.notes.push({
                    type: 'customer',
                    visibility: 'customer-visible',
                    author: ITSMData.currentUser.username,
                    content: `Email sent to ${customer.email}:\n\nSubject: ${subject}\n\n${body}`,
                    timestamp: new Date().toISOString()
                });
            }
        }

        closeModal();
        showToast(`Email sent to ${customer.name}`, 'success');
    },

    /**
     * Escalate to manager
     */
    escalateToManager: function(customerId, incidentId) {
        const customer = this.findById(customerId);
        const manager = this.getManager(customer);

        if (!manager) {
            showToast('Manager information not available', 'error');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>⬆️ Escalate to Manager</span>
                <button class="panel-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="escalation-info">
                    <p>This will notify <strong>${manager.name}</strong> (${manager.email}) about ${incidentId}.</p>
                </div>
                <div class="form-group">
                    <label class="form-label">Escalation Reason</label>
                    <textarea class="form-control" id="escalation-reason" rows="4"
                        placeholder="Please provide a reason for the escalation..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-warning" onclick="CustomersModule.confirmEscalation('${customerId}', '${incidentId}')">
                    Confirm Escalation
                </button>
            </div>
        `);
    },

    /**
     * Confirm manager escalation
     */
    confirmEscalation: function(customerId, incidentId) {
        const customer = this.findById(customerId);
        const manager = this.getManager(customer);
        const reason = document.getElementById('escalation-reason')?.value || '';

        if (!reason.trim()) {
            showToast('Please provide an escalation reason', 'error');
            return;
        }

        // Audit logging handled server-side

        // Add note to incident
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (incident) {
            incident.notes.push({
                type: 'system',
                author: 'System',
                content: `Escalated to manager ${manager.name}. Reason: ${reason}`,
                timestamp: new Date().toISOString()
            });
        }

        // Add notification
        if (typeof NotificationsModule !== 'undefined' && NotificationsModule.addNotification) {
            NotificationsModule.addNotification({
                type: 'escalation',
                title: 'Incident Escalated',
                message: `${incidentId} escalated to ${manager.name}`,
                link: incidentId
            });
        }

        closeModal();
        showToast(`Escalated to ${manager.name}`, 'success');

        // Refresh incident detail if visible
        if (typeof IncidentsModule !== 'undefined' && IncidentsModule.refreshIncidentDetail) {
            IncidentsModule.refreshIncidentDetail(incidentId);
        }
    },

    /**
     * Render VIP badge
     */
    renderVIPBadge: function(email) {
        const customer = this.findByEmail(email);
        if (!customer || !customer.vip) return '';
        return '<span class="vip-badge-sm" title="VIP Customer">⭐</span>';
    },

    /**
     * Search customers
     */
    searchCustomers: function(query) {
        if (!query || !ITSMData.customers) return [];
        const searchTerm = query.toLowerCase();

        return ITSMData.customers.filter(c =>
            c.name.toLowerCase().includes(searchTerm) ||
            c.email.toLowerCase().includes(searchTerm) ||
            c.department.toLowerCase().includes(searchTerm)
        );
    }
};

// Export to window
window.CustomersModule = CustomersModule;
