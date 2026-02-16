/**
 * Email Templates Module
 * Provides email template management, preview, and simulated sending functionality
 */

const EmailModule = {
    // Email templates with placeholders
    templates: {
        'initial-response': {
            id: 'initial-response',
            name: 'Initial Response',
            subject: 'Re: {{incident_id}} - {{summary}}',
            body: `Dear {{customer_name}},

Thank you for contacting our IT Support team. We have received your request and created incident {{incident_id}} to track your issue.

Summary: {{summary}}
Current Status: {{status}}
Assigned Technician: {{technician_name}}

We are currently reviewing your request and will provide an update as soon as possible. If you have any additional information that might help us resolve this issue faster, please reply to this email.

Best regards,
{{technician_name}}
IT Support Team`
        },
        'status-update': {
            id: 'status-update',
            name: 'Status Update',
            subject: 'Status Update: {{incident_id}} - {{summary}}',
            body: `Dear {{customer_name}},

We wanted to provide you with an update on your incident {{incident_id}}.

Summary: {{summary}}
Previous Status: {{previous_status}}
Current Status: {{status}}
Assigned Technician: {{technician_name}}

Our team is actively working on resolving your issue. We will continue to keep you informed of any progress.

If you have any questions or additional information to share, please don't hesitate to reply to this email.

Best regards,
{{technician_name}}
IT Support Team`
        },
        'resolution-notification': {
            id: 'resolution-notification',
            name: 'Resolution Notification',
            subject: 'Resolved: {{incident_id}} - {{summary}}',
            body: `Dear {{customer_name}},

We are pleased to inform you that your incident {{incident_id}} has been resolved.

Summary: {{summary}}
Status: {{status}}
Resolved By: {{technician_name}}

Resolution Details:
{{resolution}}

If you experience any further issues or have questions about this resolution, please don't hesitate to contact us. You may reopen this incident within 7 days if the issue persists.

Thank you for your patience and understanding.

Best regards,
{{technician_name}}
IT Support Team`
        },
        'follow-up-request': {
            id: 'follow-up-request',
            name: 'Follow-up Request',
            subject: 'Information Needed: {{incident_id}} - {{summary}}',
            body: `Dear {{customer_name}},

We are working on your incident {{incident_id}} and require additional information to proceed.

Summary: {{summary}}
Current Status: {{status}}
Assigned Technician: {{technician_name}}

Could you please provide the following information:
- [Specify the information needed]
- [Any relevant screenshots or error messages]
- [Steps to reproduce the issue, if applicable]

Please reply to this email at your earliest convenience. If we do not hear from you within 5 business days, this incident may be closed due to inactivity.

Thank you for your cooperation.

Best regards,
{{technician_name}}
IT Support Team`
        },
        'escalation-notice': {
            id: 'escalation-notice',
            name: 'Escalation Notice',
            subject: 'Escalation Notice: {{incident_id}} - {{summary}}',
            body: `Dear {{customer_name}},

We wanted to inform you that your incident {{incident_id}} has been escalated to our senior technical team for further investigation.

Summary: {{summary}}
Current Status: {{status}}
Previous Technician: {{technician_name}}
Escalation Reason: {{escalation_reason}}

Our senior team will review your case with high priority. You can expect an update within the next 24 hours.

We apologize for any inconvenience this issue may have caused and appreciate your patience as we work to resolve it.

Best regards,
{{technician_name}}
IT Support Team`
        }
    },

    // Store sent email history
    emailHistory: [],

    // Currently selected template
    currentTemplate: null,
    currentIncidentId: null,

    /**
     * Initialize the email module
     */
    init() {
        // Load email history from localStorage
        const savedHistory = localStorage.getItem('itsm_email_history');
        if (savedHistory) {
            try {
                this.emailHistory = JSON.parse(savedHistory);
            } catch (e) {
                console.error('Failed to load email history:', e);
                this.emailHistory = [];
            }
        }
        console.log('EmailModule initialized');
    },

    /**
     * Get all available templates
     * @returns {Array} Array of template objects
     */
    getTemplates() {
        return Object.values(this.templates).map(t => ({
            id: t.id,
            name: t.name,
            subject: t.subject
        }));
    },

    /**
     * Get a specific template by ID
     * @param {string} templateId - Template identifier
     * @returns {Object|null} Template object or null
     */
    getTemplate(templateId) {
        return this.templates[templateId] || null;
    },

    /**
     * Open email dialog with template selector
     * @param {string} recipientEmail - Recipient's email address
     * @param {string} incidentId - Incident ID
     */
    openEmailDialog(recipientEmail, incidentId) {
        this.currentIncidentId = incidentId;

        // Get incident data
        const incident = this.getIncidentData(incidentId);
        if (!incident) {
            if (typeof showToast === 'function') {
                showToast('Incident not found', 'error');
            }
            return;
        }

        const modalContent = `
            <div class="email-dialog">
                <div class="email-header">
                    <h3><i class="fas fa-envelope"></i> Send Email</h3>
                    <p class="email-subtitle">Incident: ${incidentId}</p>
                </div>

                <div class="email-form">
                    <div class="form-group">
                        <label for="email-recipient">To:</label>
                        <input type="email" id="email-recipient" class="form-control"
                               value="${recipientEmail || incident.customer_email || ''}"
                               placeholder="recipient@example.com">
                    </div>

                    <div class="form-group">
                        <label for="email-template">Template:</label>
                        <select id="email-template" class="form-control" onchange="EmailModule.selectTemplate(this.value, '${incidentId}')">
                            <option value="">-- Select a template --</option>
                            ${this.getTemplates().map(t =>
                                `<option value="${t.id}">${t.name}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="email-subject">Subject:</label>
                        <input type="text" id="email-subject" class="form-control"
                               placeholder="Email subject">
                    </div>

                    <div class="form-group">
                        <label for="email-body">Message:</label>
                        <textarea id="email-body" class="form-control" rows="12"
                                  placeholder="Select a template or write your message..."></textarea>
                    </div>

                    <div class="email-placeholders">
                        <details>
                            <summary><i class="fas fa-info-circle"></i> Available Placeholders</summary>
                            <div class="placeholder-list">
                                <code>{{incident_id}}</code> - Incident ID<br>
                                <code>{{customer_name}}</code> - Customer name<br>
                                <code>{{summary}}</code> - Incident summary<br>
                                <code>{{status}}</code> - Current status<br>
                                <code>{{technician_name}}</code> - Assigned technician<br>
                                <code>{{resolution}}</code> - Resolution notes<br>
                                <code>{{previous_status}}</code> - Previous status<br>
                                <code>{{escalation_reason}}</code> - Escalation reason
                            </div>
                        </details>
                    </div>
                </div>

                <div class="email-actions">
                    <button class="btn btn-secondary" onclick="closeModal()">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button class="btn btn-info" onclick="EmailModule.previewEmail()">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                    <button class="btn btn-primary" onclick="EmailModule.sendEmail()">
                        <i class="fas fa-paper-plane"></i> Send Email
                    </button>
                </div>
            </div>
        `;

        if (typeof showModal === 'function') {
            showModal('Send Email', modalContent, { size: 'large' });
        }
    },

    /**
     * Select a template and populate the form
     * @param {string} templateId - Template identifier
     * @param {string} incidentId - Incident ID
     */
    selectTemplate(templateId, incidentId) {
        if (!templateId) {
            document.getElementById('email-subject').value = '';
            document.getElementById('email-body').value = '';
            this.currentTemplate = null;
            return;
        }

        const template = this.getTemplate(templateId);
        if (!template) {
            if (typeof showToast === 'function') {
                showToast('Template not found', 'error');
            }
            return;
        }

        this.currentTemplate = template;
        const incident = this.getIncidentData(incidentId || this.currentIncidentId);

        // Fill placeholders
        const subject = this.fillPlaceholders(template.subject, incident);
        const body = this.fillPlaceholders(template.body, incident);

        document.getElementById('email-subject').value = subject;
        document.getElementById('email-body').value = body;
    },

    /**
     * Preview email with filled placeholders
     * @param {string} templateId - Optional template ID (uses current if not provided)
     * @param {string} incidentId - Optional incident ID (uses current if not provided)
     */
    previewEmail(templateId, incidentId) {
        const subject = document.getElementById('email-subject')?.value || '';
        const body = document.getElementById('email-body')?.value || '';
        const recipient = document.getElementById('email-recipient')?.value || '';

        if (!subject || !body) {
            if (typeof showToast === 'function') {
                showToast('Please fill in subject and message', 'warning');
            }
            return;
        }

        const previewContent = `
            <div class="email-preview">
                <div class="preview-header">
                    <h4><i class="fas fa-eye"></i> Email Preview</h4>
                </div>

                <div class="preview-meta">
                    <p><strong>To:</strong> ${this.escapeHtml(recipient)}</p>
                    <p><strong>Subject:</strong> ${this.escapeHtml(subject)}</p>
                </div>

                <div class="preview-divider"></div>

                <div class="preview-body">
                    <pre class="email-content">${this.escapeHtml(body)}</pre>
                </div>

                <div class="preview-actions">
                    <button class="btn btn-secondary" onclick="EmailModule.closePreview()">
                        <i class="fas fa-arrow-left"></i> Back to Edit
                    </button>
                    <button class="btn btn-primary" onclick="EmailModule.sendEmail()">
                        <i class="fas fa-paper-plane"></i> Send Email
                    </button>
                </div>
            </div>
        `;

        // Show preview in a new modal or update existing
        if (typeof showModal === 'function') {
            showModal('Email Preview', previewContent, { size: 'large' });
        }
    },

    /**
     * Close preview and return to email editor
     */
    closePreview() {
        // Re-open the email dialog with current data
        const recipient = document.getElementById('email-recipient')?.value || '';
        this.openEmailDialog(recipient, this.currentIncidentId);
    },

    /**
     * Send email (simulated)
     * @param {string} recipientEmail - Optional recipient (uses form value if not provided)
     * @param {string} incidentId - Optional incident ID (uses current if not provided)
     */
    sendEmail(recipientEmail, incidentId) {
        const recipient = recipientEmail || document.getElementById('email-recipient')?.value;
        const subject = document.getElementById('email-subject')?.value;
        const body = document.getElementById('email-body')?.value;
        const targetIncidentId = incidentId || this.currentIncidentId;

        // Validation
        if (!recipient) {
            if (typeof showToast === 'function') {
                showToast('Please enter a recipient email', 'error');
            }
            return;
        }

        if (!this.isValidEmail(recipient)) {
            if (typeof showToast === 'function') {
                showToast('Please enter a valid email address', 'error');
            }
            return;
        }

        if (!subject) {
            if (typeof showToast === 'function') {
                showToast('Please enter a subject', 'error');
            }
            return;
        }

        if (!body) {
            if (typeof showToast === 'function') {
                showToast('Please enter a message', 'error');
            }
            return;
        }

        // Create email record
        const emailRecord = {
            id: this.generateEmailId(),
            incidentId: targetIncidentId,
            recipient: recipient,
            subject: subject,
            body: body,
            templateUsed: this.currentTemplate?.name || 'Custom',
            sentAt: new Date().toISOString(),
            sentBy: this.getCurrentUser()
        };

        // Add to email history
        this.emailHistory.push(emailRecord);
        this.saveEmailHistory();

        // Add note to incident
        this.addEmailNoteToIncident(targetIncidentId, emailRecord);

        // Log to audit
        this.logToAudit(targetIncidentId, emailRecord);

        // Close modal and show success message
        if (typeof closeModal === 'function') {
            closeModal();
        }

        if (typeof showToast === 'function') {
            showToast(`Email sent successfully to ${recipient}`, 'success');
        }

        // Reset current template
        this.currentTemplate = null;
        this.currentIncidentId = null;
    },

    /**
     * Fill placeholders in template text
     * @param {string} text - Template text with placeholders
     * @param {Object} incident - Incident data
     * @returns {string} Text with placeholders filled
     */
    fillPlaceholders(text, incident) {
        if (!text || !incident) return text;

        const placeholders = {
            '{{incident_id}}': incident.id || incident.incident_id || '',
            '{{customer_name}}': incident.customer_name || incident.customerName || 'Valued Customer',
            '{{summary}}': incident.summary || incident.title || '',
            '{{status}}': incident.status || '',
            '{{technician_name}}': incident.assigned_to || incident.assignedTo || 'Support Team',
            '{{resolution}}': incident.resolution || incident.resolution_notes || 'N/A',
            '{{previous_status}}': incident.previous_status || incident.previousStatus || 'N/A',
            '{{escalation_reason}}': incident.escalation_reason || incident.escalationReason || 'Requires senior technical expertise',
            '{{customer_email}}': incident.customer_email || incident.customerEmail || '',
            '{{priority}}': incident.priority || '',
            '{{category}}': incident.category || '',
            '{{created_date}}': incident.created_at || incident.createdAt || ''
        };

        let result = text;
        for (const [placeholder, value] of Object.entries(placeholders)) {
            result = result.replace(new RegExp(this.escapeRegex(placeholder), 'g'), value);
        }

        return result;
    },

    /**
     * Get incident data by ID
     * @param {string} incidentId - Incident ID
     * @returns {Object|null} Incident data or null
     */
    getIncidentData(incidentId) {
        // Try to get from global incidents array
        if (typeof window.incidents !== 'undefined' && Array.isArray(window.incidents)) {
            const incident = window.incidents.find(inc =>
                inc.id === incidentId || inc.incident_id === incidentId
            );
            if (incident) return incident;
        }

        // Try to get from IncidentModule
        if (typeof window.IncidentModule !== 'undefined' &&
            typeof window.IncidentModule.getIncident === 'function') {
            return window.IncidentModule.getIncident(incidentId);
        }

        // Try to get from DataModule
        if (typeof window.DataModule !== 'undefined' &&
            typeof window.DataModule.getIncident === 'function') {
            return window.DataModule.getIncident(incidentId);
        }

        // Return mock data if nothing found (for testing)
        return {
            id: incidentId,
            incident_id: incidentId,
            customer_name: 'Customer',
            summary: 'Incident Summary',
            status: 'Open',
            assigned_to: 'Support Team',
            resolution: ''
        };
    },

    /**
     * Get current user name
     * @returns {string} Current user name
     */
    getCurrentUser() {
        // Try to get from AuthModule
        if (typeof window.AuthModule !== 'undefined' &&
            typeof window.AuthModule.getCurrentUser === 'function') {
            const user = window.AuthModule.getCurrentUser();
            return user?.name || user?.username || 'System';
        }

        // Try to get from global currentUser
        if (typeof window.currentUser !== 'undefined') {
            return window.currentUser?.name || window.currentUser?.username || 'System';
        }

        return 'System';
    },

    /**
     * Add email note to incident
     * @param {string} incidentId - Incident ID
     * @param {Object} emailRecord - Email record
     */
    addEmailNoteToIncident(incidentId, emailRecord) {
        const noteText = `Email sent to ${emailRecord.recipient}\nSubject: ${emailRecord.subject}\nTemplate: ${emailRecord.templateUsed}`;

        // Try to add via NotesModule
        if (typeof window.NotesModule !== 'undefined' &&
            typeof window.NotesModule.addNote === 'function') {
            window.NotesModule.addNote(incidentId, noteText, 'email');
            return;
        }

        // Try to add via IncidentModule
        if (typeof window.IncidentModule !== 'undefined' &&
            typeof window.IncidentModule.addNote === 'function') {
            window.IncidentModule.addNote(incidentId, noteText);
            return;
        }

        // Store in localStorage as fallback
        const notesKey = `itsm_incident_notes_${incidentId}`;
        const notes = JSON.parse(localStorage.getItem(notesKey) || '[]');
        notes.push({
            id: Date.now(),
            text: noteText,
            type: 'email',
            createdAt: new Date().toISOString(),
            createdBy: this.getCurrentUser()
        });
        localStorage.setItem(notesKey, JSON.stringify(notes));
    },

    /**
     * Log email to audit trail
     * @param {string} incidentId - Incident ID
     * @param {Object} emailRecord - Email record
     */
    logToAudit(incidentId, emailRecord) {
        const auditEntry = {
            action: 'email_sent',
            incidentId: incidentId,
            details: {
                recipient: emailRecord.recipient,
                subject: emailRecord.subject,
                template: emailRecord.templateUsed
            },
            timestamp: emailRecord.sentAt,
            user: emailRecord.sentBy
        };

        // Try to log via AuditModule
        if (typeof window.AuditModule !== 'undefined' &&
            typeof window.AuditModule.log === 'function') {
            window.AuditModule.log(auditEntry);
            return;
        }

        // Store in localStorage as fallback
        const auditKey = 'itsm_audit_log';
        const auditLog = JSON.parse(localStorage.getItem(auditKey) || '[]');
        auditLog.push(auditEntry);
        localStorage.setItem(auditKey, JSON.stringify(auditLog));

        console.log('Audit log entry:', auditEntry);
    },

    /**
     * Get email history for an incident
     * @param {string} incidentId - Incident ID (optional, returns all if not provided)
     * @returns {Array} Array of email records
     */
    getEmailHistory(incidentId) {
        if (incidentId) {
            return this.emailHistory.filter(email => email.incidentId === incidentId);
        }
        return [...this.emailHistory];
    },

    /**
     * Save email history to localStorage
     */
    saveEmailHistory() {
        try {
            localStorage.setItem('itsm_email_history', JSON.stringify(this.emailHistory));
        } catch (e) {
            console.error('Failed to save email history:', e);
        }
    },

    /**
     * Generate unique email ID
     * @returns {string} Unique email ID
     */
    generateEmailId() {
        return 'EMAIL-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Validate email address
     * @param {string} email - Email address
     * @returns {boolean} True if valid
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Escape special regex characters
     * @param {string} string - String to escape
     * @returns {string} Escaped string
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * Clear email history (for testing/admin)
     */
    clearEmailHistory() {
        this.emailHistory = [];
        localStorage.removeItem('itsm_email_history');
        console.log('Email history cleared');
    },

    /**
     * Show email history dialog for an incident
     * @param {string} incidentId - Incident ID
     */
    showEmailHistory(incidentId) {
        const history = this.getEmailHistory(incidentId);

        let historyHtml;
        if (history.length === 0) {
            historyHtml = '<p class="no-history">No emails have been sent for this incident.</p>';
        } else {
            historyHtml = `
                <div class="email-history-list">
                    ${history.map(email => `
                        <div class="email-history-item">
                            <div class="email-history-header">
                                <span class="email-date">${new Date(email.sentAt).toLocaleString()}</span>
                                <span class="email-template-badge">${email.templateUsed}</span>
                            </div>
                            <div class="email-history-details">
                                <p><strong>To:</strong> ${this.escapeHtml(email.recipient)}</p>
                                <p><strong>Subject:</strong> ${this.escapeHtml(email.subject)}</p>
                                <p><strong>Sent by:</strong> ${this.escapeHtml(email.sentBy)}</p>
                            </div>
                            <button class="btn btn-sm btn-secondary" onclick="EmailModule.viewEmailDetail('${email.id}')">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        const modalContent = `
            <div class="email-history-dialog">
                <div class="email-history-header">
                    <h3><i class="fas fa-history"></i> Email History</h3>
                    <p class="email-subtitle">Incident: ${incidentId}</p>
                </div>
                ${historyHtml}
                <div class="email-history-actions">
                    <button class="btn btn-secondary" onclick="closeModal()">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        `;

        if (typeof showModal === 'function') {
            showModal('Email History', modalContent, { size: 'medium' });
        }
    },

    /**
     * View detailed email content
     * @param {string} emailId - Email record ID
     */
    viewEmailDetail(emailId) {
        const email = this.emailHistory.find(e => e.id === emailId);
        if (!email) {
            if (typeof showToast === 'function') {
                showToast('Email not found', 'error');
            }
            return;
        }

        const detailContent = `
            <div class="email-detail-dialog">
                <div class="email-detail-meta">
                    <p><strong>Sent:</strong> ${new Date(email.sentAt).toLocaleString()}</p>
                    <p><strong>To:</strong> ${this.escapeHtml(email.recipient)}</p>
                    <p><strong>Subject:</strong> ${this.escapeHtml(email.subject)}</p>
                    <p><strong>Template:</strong> ${email.templateUsed}</p>
                    <p><strong>Sent by:</strong> ${this.escapeHtml(email.sentBy)}</p>
                </div>
                <div class="email-detail-divider"></div>
                <div class="email-detail-body">
                    <pre class="email-content">${this.escapeHtml(email.body)}</pre>
                </div>
                <div class="email-detail-actions">
                    <button class="btn btn-secondary" onclick="EmailModule.showEmailHistory('${email.incidentId}')">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <button class="btn btn-secondary" onclick="closeModal()">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        `;

        if (typeof showModal === 'function') {
            showModal('Email Detail', detailContent, { size: 'large' });
        }
    }
};

// Initialize module when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EmailModule.init());
} else {
    EmailModule.init();
}

// Export to global scope
window.EmailModule = EmailModule;
