/**
 * ITSM Console - Service Catalog Module
 * Provides catalog browsing, service request submission, and request management
 */

const CatalogModule = {
    // Status workflow for service requests
    requestStatuses: ['Draft', 'Pending Approval', 'Approved', 'In Progress', 'Fulfilled', 'Cancelled'],

    // Status badge classes
    statusBadgeClass: {
        'Draft': 'badge-new',
        'Pending Approval': 'badge-open',
        'Approved': 'badge-in-progress',
        'In Progress': 'badge-in-progress',
        'Fulfilled': 'badge-resolved',
        'Cancelled': 'badge-closed'
    },

    /**
     * Generate a unique request ID
     * @returns {string} New request ID
     */
    generateRequestId: function() {
        const existingIds = ITSMData.serviceRequests.map(r => parseInt(r.id.replace('REQ-', '')));
        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        return `REQ-${String(maxId + 1).padStart(3, '0')}`;
    },

    /**
     * Get catalog item by ID
     * @param {string} itemId - Catalog item ID
     * @returns {object|null} Catalog item or null
     */
    getCatalogItem: function(itemId) {
        return ITSMData.catalogItems.find(item => item.id === itemId) || null;
    },

    /**
     * Get service request by ID
     * @param {string} requestId - Request ID
     * @returns {object|null} Service request or null
     */
    getRequest: function(requestId) {
        return ITSMData.serviceRequests.find(r => r.id === requestId) || null;
    },

    /**
     * Get unique categories from catalog items
     * @returns {string[]} Array of unique categories
     */
    getCategories: function() {
        const categories = ITSMData.catalogItems.map(item => item.category);
        return [...new Set(categories)];
    },

    /**
     * Get catalog items grouped by category
     * @returns {object} Object with categories as keys and items as values
     */
    getItemsByCategory: function() {
        const grouped = {};
        ITSMData.catalogItems.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });
        return grouped;
    },

    // ==================== CATALOG BROWSING ====================

    /**
     * Render the main service catalog page
     * @returns {string} HTML string
     */
    renderCatalog: function() {
        const itemsByCategory = this.getItemsByCategory();
        const categories = Object.keys(itemsByCategory);

        return `
            <div class="page-header">
                <div class="page-title">Service Catalog</div>
                <div class="page-subtitle">Browse and request IT services</div>
            </div>
            <div class="toolbar">
                <div class="toolbar-search">
                    <input type="text" placeholder="Search catalog..." id="catalog-search" style="width: 300px;" oninput="CatalogModule.filterCatalog()">
                    <button class="btn btn-sm btn-secondary">Search</button>
                </div>
                <div class="toolbar-group" style="margin-left: var(--spacing-lg);">
                    <select class="form-control" style="width: 150px; padding: 4px;" id="catalog-category-filter" onchange="CatalogModule.filterCatalog()">
                        <option value="">All Categories</option>
                        ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>
                <div class="toolbar-group" style="margin-left: auto;">
                    <button class="btn btn-primary btn-sm" onclick="CatalogModule.showMyRequests()">My Requests</button>
                </div>
            </div>
            <div class="page-content" id="catalog-content">
                ${this.renderCatalogItems(itemsByCategory)}
            </div>
        `;
    },

    /**
     * Render catalog items grouped by category
     * @param {object} itemsByCategory - Items grouped by category
     * @returns {string} HTML string
     */
    renderCatalogItems: function(itemsByCategory) {
        const categories = Object.keys(itemsByCategory);

        if (categories.length === 0) {
            return '<div class="empty-state"><div class="empty-state-text">No catalog items found</div></div>';
        }

        return categories.map(category => `
            <div class="catalog-category" style="margin-bottom: var(--spacing-xl);">
                <h3 style="margin-bottom: var(--spacing-md); padding-bottom: var(--spacing-sm); border-bottom: 1px solid var(--border-light);">
                    ${category}
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--spacing-md);">
                    ${itemsByCategory[category].map(item => this.renderCatalogCard(item)).join('')}
                </div>
            </div>
        `).join('');
    },

    /**
     * Render a single catalog item card
     * @param {object} item - Catalog item
     * @returns {string} HTML string
     */
    renderCatalogCard: function(item) {
        return `
            <div class="card catalog-item-card" style="cursor: pointer;" onclick="CatalogModule.viewCatalogItem('${item.id}')">
                <div class="card-body">
                    <div style="display: flex; align-items: flex-start; gap: var(--spacing-md);">
                        <div><img class="catalog-icon" src="icons/${item.icon}.png" alt=""></div>
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 var(--spacing-xs) 0;">${item.name}</h4>
                            <p style="font-size: 12px; color: var(--text-muted); margin: 0 0 var(--spacing-sm) 0;">
                                ${item.description}
                            </p>
                            <div style="font-size: 11px; color: var(--text-muted);">
                                <span style="margin-right: var(--spacing-md);">Fulfillment: ${item.fulfillmentTime}</span>
                                <span>Cost: ${item.cost}</span>
                            </div>
                            <div style="margin-top: var(--spacing-sm);">
                                ${item.approvalRequired
                                    ? '<span class="badge badge-open">Approval Required</span>'
                                    : '<span class="badge badge-resolved">Auto-Approved</span>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Filter catalog items based on search and category
     */
    filterCatalog: function() {
        const searchTerm = document.getElementById('catalog-search')?.value?.toLowerCase() || '';
        const categoryFilter = document.getElementById('catalog-category-filter')?.value || '';

        let filteredItems = ITSMData.catalogItems;

        if (searchTerm) {
            filteredItems = filteredItems.filter(item =>
                item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm)
            );
        }

        if (categoryFilter) {
            filteredItems = filteredItems.filter(item => item.category === categoryFilter);
        }

        // Group filtered items by category
        const grouped = {};
        filteredItems.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });

        const contentArea = document.getElementById('catalog-content');
        if (contentArea) {
            contentArea.innerHTML = this.renderCatalogItems(grouped);
        }
    },

    /**
     * View catalog item details
     * @param {string} itemId - Catalog item ID
     */
    viewCatalogItem: function(itemId) {
        const item = this.getCatalogItem(itemId);
        if (!item) {
            showToast('Catalog item not found', 'error');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span><img class="modal-icon" src="icons/${item.icon}.png" alt=""> ${item.name}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 600px;">
                <div style="margin-bottom: var(--spacing-lg);">
                    <p>${item.description}</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
                    <div>
                        <label class="form-label" style="color: var(--text-muted);">Category</label>
                        <div>${item.category}</div>
                    </div>
                    <div>
                        <label class="form-label" style="color: var(--text-muted);">Fulfillment Time</label>
                        <div>${item.fulfillmentTime}</div>
                    </div>
                    <div>
                        <label class="form-label" style="color: var(--text-muted);">Cost</label>
                        <div>${item.cost}</div>
                    </div>
                    <div>
                        <label class="form-label" style="color: var(--text-muted);">Approval</label>
                        <div>${item.approvalRequired ? 'Required' : 'Auto-Approved'}</div>
                    </div>
                </div>
                <div style="background: var(--bg-secondary); padding: var(--spacing-md); border-radius: 4px;">
                    <strong>Required Information:</strong>
                    <ul style="margin: var(--spacing-sm) 0 0 0; padding-left: 20px;">
                        ${item.fields.map(field => `
                            <li>${Utils.escapeHtml(field.label)}${field.required ? ' *' : ''}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                <button class="btn btn-primary" onclick="CatalogModule.showRequestForm('${item.id}')">Request This Service</button>
            </div>
        `);
    },

    // ==================== REQUEST SUBMISSION ====================

    /**
     * Show the request submission form
     * @param {string} itemId - Catalog item ID
     */
    showRequestForm: function(itemId) {
        const item = this.getCatalogItem(itemId);
        if (!item) {
            showToast('Catalog item not found', 'error');
            return;
        }

        // Detect wizard-style items (fields with step property)
        const hasSteps = item.fields.some(f => f.step !== undefined);
        if (hasSteps) {
            this.showWizardForm(itemId);
            return;
        }

        const currentUser = ITSMData.currentUser;

        showModal(`
            <div class="modal-header">
                <span>Request: ${item.name}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 600px; max-height: 70vh; overflow-y: auto;">
                <form id="service-request-form">
                    <input type="hidden" id="req-catalog-item" value="${item.id}">

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
                        <div class="form-group">
                            <label class="form-label">Requested By</label>
                            <input type="text" class="form-control" value="${currentUser.email}" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Requested For</label>
                            <input type="email" class="form-control" id="req-requested-for" value="${currentUser.email}" placeholder="Enter email">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Priority</label>
                            <select class="form-control" id="req-priority">
                                <option value="Low">Low</option>
                                <option value="Normal" selected>Normal</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="color: var(--text-muted);">Estimated Fulfillment</label>
                            <input type="text" class="form-control" value="${item.fulfillmentTime}" readonly>
                        </div>
                    </div>

                    <hr style="border: none; border-top: 1px solid var(--border-light); margin: var(--spacing-lg) 0;">

                    <h4 style="margin-bottom: var(--spacing-md);">Service Details</h4>

                    ${item.fields.map(field => this.renderFormField(field)).join('')}

                    ${item.approvalRequired ? `
                        <div style="background: rgba(255, 193, 7, 0.1); padding: var(--spacing-md); border-radius: 4px; margin-top: var(--spacing-lg);">
                            <strong style="color: var(--accent-orange);">Approval Required</strong>
                            <p style="margin: var(--spacing-xs) 0 0 0; font-size: 12px;">
                                This request requires approval before it can be fulfilled.
                            </p>
                        </div>
                    ` : ''}
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-secondary" onclick="CatalogModule.saveAsDraft('${item.id}')">Save as Draft</button>
                <button class="btn btn-primary" onclick="CatalogModule.submitRequest('${item.id}')">Submit Request</button>
            </div>
        `);
    },

    /**
     * Render a form field based on field definition
     * @param {object} field - Field definition
     * @returns {string} HTML string
     */
    renderFormField: function(field) {
        const requiredAttr = field.required ? 'required' : '';
        const requiredClass = field.required ? 'required' : '';

        let fieldHtml = '';

        switch (field.type) {
            case 'select':
                fieldHtml = `
                    <select class="form-control" id="field-${field.name}" ${requiredAttr}>
                        <option value="">-- Select --</option>
                        ${(field.options || []).map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                    </select>
                `;
                break;

            case 'textarea':
                fieldHtml = `
                    <textarea class="form-control" id="field-${field.name}" rows="3" placeholder="Enter ${field.label.toLowerCase()}..." ${requiredAttr}></textarea>
                `;
                break;

            case 'date':
                fieldHtml = `
                    <input type="date" class="form-control" id="field-${field.name}" ${requiredAttr}>
                `;
                break;

            case 'email':
                fieldHtml = `
                    <input type="email" class="form-control" id="field-${field.name}" placeholder="email@example.com" ${requiredAttr}>
                `;
                break;

            case 'checkbox':
                fieldHtml = `
                    <div class="consent-check">
                        <input type="checkbox" id="field-${field.name}" ${requiredAttr}>
                        <label for="field-${field.name}">${Utils.escapeHtml(field.label)}</label>
                    </div>
                `;
                return `
                    <div class="form-group" id="group-${field.name}"${field.showWhen ? ` data-show-when-field="${field.showWhen.field}" data-show-when-equals="${field.showWhen.equals}" style="display:none;"` : ''}>
                        ${fieldHtml}
                    </div>
                `;

            case 'file':
                fieldHtml = `
                    <input type="file" class="form-control" id="field-${field.name}" multiple>
                `;
                break;

            case 'text':
            default:
                fieldHtml = `
                    <input type="text" class="form-control" id="field-${field.name}" placeholder="Enter ${field.label.toLowerCase()}..." ${requiredAttr}>
                `;
                break;
        }

        const showWhenAttrs = field.showWhen
            ? ` data-show-when-field="${field.showWhen.field}" data-show-when-equals="${field.showWhen.equals}" style="display:none;"`
            : '';

        return `
            <div class="form-group" id="group-${field.name}"${showWhenAttrs}>
                <label class="form-label ${requiredClass}">${Utils.escapeHtml(field.label)}</label>
                ${fieldHtml}
            </div>
        `;
    },

    /**
     * Collect form data from the request form
     * @param {string} itemId - Catalog item ID
     * @returns {object|null} Form data object or null if validation fails
     */
    collectFormData: function(itemId) {
        // If wizard is active, return wizard data
        if (this._wizardState && this._wizardState.itemId === itemId) {
            return this._wizardState.formData;
        }

        const item = this.getCatalogItem(itemId);
        if (!item) return null;

        const formData = {};
        let isValid = true;

        item.fields.forEach(field => {
            // Skip hidden conditional fields
            const group = document.getElementById(`group-${field.name}`);
            if (group && group.style.display === 'none') return;

            const element = document.getElementById(`field-${field.name}`);
            if (element) {
                let value;
                if (field.type === 'checkbox') {
                    value = element.checked;
                } else if (field.type === 'file') {
                    value = element.files && element.files.length > 0
                        ? Array.from(element.files).map(f => f.name).join(', ')
                        : '';
                } else {
                    value = element.value.trim();
                }
                formData[field.name] = value;

                if (field.required && !value) {
                    element.style.borderColor = 'var(--accent-red)';
                    isValid = false;
                } else {
                    element.style.borderColor = '';
                }
            }
        });

        if (!isValid) {
            showToast('Please fill in all required fields', 'error');
            return null;
        }

        return formData;
    },

    /**
     * Save request as draft
     * @param {string} itemId - Catalog item ID
     */
    saveAsDraft: async function(itemId) {
        const item = this.getCatalogItem(itemId);
        if (!item) {
            showToast('Catalog item not found', 'error');
            return;
        }

        const requestedFor = document.getElementById('req-requested-for')?.value || ITSMData.currentUser.email;
        const priority = document.getElementById('req-priority')?.value || 'Normal';

        // Collect form data without validation
        let formData = {};
        if (this._wizardState && this._wizardState.itemId === itemId) {
            // Collect current step data first
            this.collectWizardStepData(this._wizardState.currentStep);
            formData = { ...this._wizardState.formData };
        } else {
            item.fields.forEach(field => {
                const element = document.getElementById(`field-${field.name}`);
                if (element) {
                    if (field.type === 'checkbox') {
                        formData[field.name] = element.checked;
                    } else if (field.type === 'file') {
                        formData[field.name] = element.files && element.files.length > 0
                            ? Array.from(element.files).map(f => f.name).join(', ') : '';
                    } else {
                        formData[field.name] = element.value.trim();
                    }
                }
            });
        }

        // Find requester details
        const requester = (ITSMData.customers || []).find(c => c.email === requestedFor);

        const newRequest = {
            id: this.generateRequestId(),
            catalogItem: itemId,
            catalogItemName: item.name,
            title: `${item.name} Request`,
            description: item.description,
            requestedBy: ITSMData.currentUser.email,
            requestedByName: ITSMData.currentUser.name || ITSMData.currentUser.username,
            requestedFor: requestedFor,
            requestedForName: requester ? requester.name : requestedFor,
            requestedForDepartment: requester ? requester.department : '',
            requestedForLocation: requester ? requester.location : '',
            requestedForVip: requester ? requester.vip : false,
            category: item.category,
            priority: priority,
            impact: 'Low',
            urgency: 'Low',
            status: 'Draft',
            formData: formData,
            approvalRequired: item.approvalRequired,
            approver: null,
            approverName: null,
            approvalDate: null,
            approvalComments: '',
            rejectionReason: null,
            assignmentGroup: null,
            assignedTo: null,
            assigneeName: null,
            slaTarget: null,
            slaMet: null,
            expectedFulfillment: item.fulfillmentTime,
            estimatedCost: item.cost,
            actualCost: null,
            fulfillmentDate: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            submittedAt: null,
            closedAt: null,
            notes: [],
            attachments: [],
            linkedIncidents: [],
            linkedChanges: [],
            linkedKB: [],
            watchList: [],
            additionalCommentsNotify: []
        };

        // Save via API - use createRequest which handles server-side storage
        try {
            const result = await ITSMApi.createRequest({
                catalogItem: itemId,
                requestedBy: newRequest.requestedBy,
                requestedByName: newRequest.requestedByName,
                requestedFor: newRequest.requestedFor,
                requestedForName: newRequest.requestedForName,
                requestedForDepartment: newRequest.requestedForDepartment,
                requestedForLocation: newRequest.requestedForLocation,
                requestedForVip: newRequest.requestedForVip,
                description: newRequest.description,
                priority: newRequest.priority,
                formData: newRequest.formData
            });
            if (result.success) {
                // Set status to Draft via update
                await ITSMApi.updateRequestStatus(result.data.id, 'Draft');
                closeModal();
                showToast(`Draft ${result.data.id} saved`, 'success');
                if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
            } else {
                showToast(result.error || 'Failed to save draft', 'error');
            }
        } catch (err) {
            showToast('Failed to save draft: ' + err.message, 'error');
        }
    },

    /**
     * Submit a new service request
     * @param {string} itemId - Catalog item ID
     */
    submitRequest: async function(itemId) {
        const item = this.getCatalogItem(itemId);
        if (!item) {
            showToast('Catalog item not found', 'error');
            return;
        }

        const requestedFor = document.getElementById('req-requested-for')?.value?.trim();
        const priority = document.getElementById('req-priority')?.value || 'Normal';

        if (!requestedFor) {
            showToast('Please specify who this request is for', 'error');
            return;
        }

        const formData = this.collectFormData(itemId);
        if (!formData) return;

        // Determine initial status and approver
        const status = item.approvalRequired ? 'Pending Approval' : 'Approved';
        const approver = item.approvalRequired ? this.determineApprover(requestedFor) : null;
        const approverName = approver ? (ITSMData.customers || []).find(c => c.email === approver)?.name || approver : null;

        // Find requester details
        const requester = (ITSMData.customers || []).find(c => c.email === requestedFor);

        // Calculate SLA target
        const slaHours = { 'Critical': 4, 'High': 8, 'Normal': 24, 'Low': 48 };
        const slaTarget = new Date(Date.now() + (slaHours[priority] || 24) * 3600000).toISOString();

        const now = new Date().toISOString();
        const newRequest = {
            id: this.generateRequestId(),
            catalogItem: itemId,
            catalogItemName: item.name,
            title: `${item.name} Request`,
            description: item.description,
            requestedBy: ITSMData.currentUser.email,
            requestedByName: ITSMData.currentUser.name || ITSMData.currentUser.username,
            requestedFor: requestedFor,
            requestedForName: requester ? requester.name : requestedFor,
            requestedForDepartment: requester ? requester.department : '',
            requestedForLocation: requester ? requester.location : '',
            requestedForVip: requester ? requester.vip : false,
            category: item.category,
            priority: priority,
            impact: 'Low',
            urgency: 'Low',
            status: status,
            formData: formData,
            approvalRequired: item.approvalRequired,
            approver: approver,
            approverName: approverName,
            approvalDate: item.approvalRequired ? null : now,
            approvalComments: '',
            rejectionReason: null,
            assignmentGroup: item.approvalRequired ? null : this.determineAssignment(item),
            assignedTo: null,
            assigneeName: null,
            slaTarget: slaTarget,
            slaMet: null,
            expectedFulfillment: item.fulfillmentTime,
            estimatedCost: item.cost,
            actualCost: null,
            fulfillmentDate: null,
            createdAt: now,
            updatedAt: now,
            submittedAt: now,
            closedAt: null,
            notes: [{
                type: 'system',
                visibility: 'customer',
                author: 'System',
                content: `Service request submitted for ${item.name}`,
                timestamp: now
            }],
            attachments: [],
            linkedIncidents: [],
            linkedChanges: [],
            linkedKB: [],
            watchList: [requestedFor],
            additionalCommentsNotify: [requestedFor]
        };

        try {
            const result = await ITSMApi.createRequest({
                catalogItem: itemId,
                requestedBy: newRequest.requestedBy,
                requestedByName: newRequest.requestedByName,
                requestedFor: newRequest.requestedFor,
                requestedForName: newRequest.requestedForName,
                requestedForDepartment: newRequest.requestedForDepartment,
                requestedForLocation: newRequest.requestedForLocation,
                requestedForVip: newRequest.requestedForVip,
                description: newRequest.description,
                priority: newRequest.priority,
                formData: newRequest.formData,
                assignmentGroup: newRequest.assignmentGroup,
                approver: newRequest.approver,
                approverName: newRequest.approverName
            });
            if (result.success) {
                closeModal();
                showToast(`Request ${result.data.id} submitted successfully`, 'success');
                if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
            } else {
                showToast(result.error || 'Failed to submit request', 'error');
            }
        } catch (err) {
            showToast('Failed to submit request: ' + err.message, 'error');
        }
    },

    /**
     * Determine the approver for a request
     * @param {string} requestedFor - Email of the person the request is for
     * @returns {string} Approver email
     */
    determineApprover: function(requestedFor) {
        // Try to find the manager of the person
        const customer = ITSMData.customers.find(c => c.email === requestedFor);
        if (customer && customer.manager) {
            return customer.manager;
        }
        // Default to a generic manager
        return 'lisa.wong@acme.com';
    },

    /**
     * Determine the team assignment for a request
     * @param {object} item - Catalog item
     * @returns {string} Team name
     */
    determineAssignment: function(item) {
        const categoryTeams = {
            'Hardware': 'Service Desk',
            'Software': 'Application Support',
            'Access': 'Identity Team',
            'Security': 'Security Team'
        };
        return categoryTeams[item.category] || 'Service Desk';
    },

    // ==================== WIZARD ENGINE ====================

    _wizardState: null,

    showWizardForm: function(itemId) {
        const item = this.getCatalogItem(itemId);
        if (!item) { showToast('Catalog item not found', 'error'); return; }

        // Determine steps from fields
        const stepNums = [...new Set(item.fields.filter(f => f.step !== undefined).map(f => f.step))].sort((a, b) => a - b);
        const totalSteps = stepNums.length;
        const stepLabels = item.stepLabels || stepNums.map(n => `Step ${n}`);

        this._wizardState = {
            itemId: itemId,
            currentStep: stepNums[0],
            totalSteps: totalSteps,
            stepNums: stepNums,
            stepLabels: stepLabels,
            formData: {}
        };

        this.renderWizardModal(itemId);
    },

    renderWizardModal: function(itemId) {
        const item = this.getCatalogItem(itemId);
        const ws = this._wizardState;

        showModal(`
            <div class="modal-header">
                <span><img class="modal-icon" src="icons/${item.icon}.png" alt=""> ${item.name}</span>
                <button class="panel-close" onclick="closeModal(); CatalogModule._wizardState = null;">x</button>
            </div>
            <div class="wizard-steps">
                ${this.renderStepIndicator(ws.currentStep, ws.stepNums, ws.stepLabels)}
            </div>
            <div class="modal-body wizard-body" style="width: 650px;" id="wizard-body">
                ${this.renderWizardStep(itemId)}
            </div>
            <div class="modal-footer" id="wizard-footer">
                ${this.renderWizardFooter(itemId)}
            </div>
        `);

        this.attachConditionalListeners();
    },

    renderStepIndicator: function(currentStep, stepNums, stepLabels) {
        return stepNums.map((stepNum, i) => {
            let cls = 'pending';
            if (stepNum === currentStep) cls = 'active';
            else if (stepNum < currentStep) cls = 'completed';
            const connector = i < stepNums.length - 1 ? '<div class="wizard-step-connector"></div>' : '';
            return `
                <div class="wizard-step ${cls}">
                    <div class="wizard-step-number">${cls === 'completed' ? '&#10003;' : (i + 1)}</div>
                    <span>${stepLabels[i] || 'Step ' + (i + 1)}</span>
                </div>
                ${connector}
            `;
        }).join('');
    },

    renderWizardStep: function(itemId) {
        const item = this.getCatalogItem(itemId);
        const ws = this._wizardState;
        const currentStep = ws.currentStep;
        const isLastStep = currentStep === ws.stepNums[ws.stepNums.length - 1];

        let html = '';

        // If last step, render review summary of all prior steps first
        if (isLastStep) {
            html += this.renderReviewStep(itemId);
        }

        // Render fields for current step
        const stepFields = item.fields.filter(f => f.step === currentStep);
        if (stepFields.length > 0 && isLastStep) {
            html += '<div class="wizard-section-title" style="margin-top: var(--spacing-lg);">Additional Information</div>';
        }
        stepFields.forEach(field => {
            const savedValue = ws.formData[field.name];
            if (savedValue !== undefined && savedValue !== '') {
                html += this.renderFormFieldWithValue(field, savedValue);
            } else {
                html += this.renderFormField(field);
            }
        });

        return html;
    },

    renderReviewStep: function(itemId) {
        const item = this.getCatalogItem(itemId);
        const ws = this._wizardState;
        // Show all prior steps in summary cards
        const priorSteps = ws.stepNums.filter(s => s < ws.currentStep);
        let html = '<div class="wizard-section-title">Review Your Submission</div>';

        priorSteps.forEach((stepNum, i) => {
            const stepFields = item.fields.filter(f => f.step === stepNum);
            const label = ws.stepLabels[i] || 'Step ' + (i + 1);
            html += `<div class="review-step-card">
                <div class="review-step-card-header">${Utils.escapeHtml(label)}</div>
                <div class="review-step-card-body">`;
            stepFields.forEach(field => {
                // Skip hidden conditional fields
                if (field.showWhen && !this.isFieldVisibleFromData(field)) return;
                const val = ws.formData[field.name];
                const displayVal = val === true ? 'Yes' : val === false ? 'No' : (val || '-');
                html += `<div class="review-row">
                    <div class="review-row-label">${Utils.escapeHtml(field.label)}</div>
                    <div class="review-row-value">${Utils.escapeHtml(displayVal)}</div>
                </div>`;
            });
            html += '</div></div>';
        });

        return html;
    },

    renderWizardFooter: function(itemId) {
        const ws = this._wizardState;
        const isFirst = ws.currentStep === ws.stepNums[0];
        const isLast = ws.currentStep === ws.stepNums[ws.stepNums.length - 1];

        let html = '';
        html += `<button class="btn btn-secondary" onclick="closeModal(); CatalogModule._wizardState = null;">Cancel</button>`;
        html += `<button class="btn btn-secondary" onclick="CatalogModule.saveWizardAsDraft('${itemId}')">Save as Draft</button>`;
        if (!isFirst) {
            html += `<button class="btn btn-secondary" onclick="CatalogModule.wizardBack('${itemId}')">Back</button>`;
        }
        if (isLast) {
            html += `<button class="btn btn-primary" onclick="CatalogModule.submitWizardRequest('${itemId}')">Submit Request</button>`;
        } else {
            html += `<button class="btn btn-primary" onclick="CatalogModule.wizardNext('${itemId}')">Next</button>`;
        }
        return html;
    },

    wizardNext: function(itemId) {
        const ws = this._wizardState;
        if (!this.validateWizardStep(ws.currentStep, itemId)) return;
        this.collectWizardStepData(ws.currentStep);
        const idx = ws.stepNums.indexOf(ws.currentStep);
        if (idx < ws.stepNums.length - 1) {
            ws.currentStep = ws.stepNums[idx + 1];
            this.renderWizardModal(itemId);
        }
    },

    wizardBack: function(itemId) {
        const ws = this._wizardState;
        this.collectWizardStepData(ws.currentStep);
        const idx = ws.stepNums.indexOf(ws.currentStep);
        if (idx > 0) {
            ws.currentStep = ws.stepNums[idx - 1];
            this.renderWizardModal(itemId);
        }
    },

    validateWizardStep: function(stepNum, itemId) {
        const item = this.getCatalogItem(itemId);
        const stepFields = item.fields.filter(f => f.step === stepNum);
        let isValid = true;

        stepFields.forEach(field => {
            if (!field.required) return;

            // Skip hidden conditional fields
            const group = document.getElementById(`group-${field.name}`);
            if (group && group.style.display === 'none') return;

            const el = document.getElementById(`field-${field.name}`);
            if (!el) return;

            let value;
            if (field.type === 'checkbox') {
                value = el.checked;
            } else {
                value = el.value ? el.value.trim() : '';
            }

            if (!value) {
                el.style.borderColor = 'var(--accent-red)';
                isValid = false;
            } else {
                el.style.borderColor = '';
            }
        });

        if (!isValid) {
            showToast('Please fill in all required fields', 'error');
        }
        return isValid;
    },

    collectWizardStepData: function(stepNum) {
        const item = this.getCatalogItem(this._wizardState.itemId);
        const stepFields = item.fields.filter(f => f.step === stepNum);

        stepFields.forEach(field => {
            const el = document.getElementById(`field-${field.name}`);
            if (!el) return;

            // Skip hidden conditional fields
            const group = document.getElementById(`group-${field.name}`);
            if (group && group.style.display === 'none') return;

            if (field.type === 'checkbox') {
                this._wizardState.formData[field.name] = el.checked;
            } else if (field.type === 'file') {
                if (el.files && el.files.length > 0) {
                    this._wizardState.formData[field.name] = Array.from(el.files).map(f => f.name).join(', ');
                }
            } else {
                this._wizardState.formData[field.name] = el.value ? el.value.trim() : '';
            }
        });
    },

    attachConditionalListeners: function() {
        const item = this.getCatalogItem(this._wizardState.itemId);
        const stepFields = item.fields.filter(f => f.step === this._wizardState.currentStep);

        // Find all fields that control conditional visibility
        const controllerNames = new Set();
        stepFields.forEach(field => {
            if (field.showWhen) controllerNames.add(field.showWhen.field);
            if (field.dependsOn) controllerNames.add(field.dependsOn);
        });

        controllerNames.forEach(name => {
            const el = document.getElementById(`field-${name}`);
            if (el) {
                el.addEventListener('change', () => {
                    this.updateConditionalVisibility();
                    this.updateDynamicOptions(item);
                });
            }
        });

        // Run initial visibility check
        this.updateConditionalVisibility();
        this.updateDynamicOptions(item);
    },

    updateConditionalVisibility: function() {
        const groups = document.querySelectorAll('[data-show-when-field]');
        groups.forEach(group => {
            const controlField = group.getAttribute('data-show-when-field');
            const requiredValue = group.getAttribute('data-show-when-equals');
            const controlEl = document.getElementById(`field-${controlField}`);

            if (controlEl) {
                const match = requiredValue.split('|').some(v => controlEl.value === v);
                if (match) {
                    group.style.display = '';
                } else {
                    group.style.display = 'none';
                    // Clear hidden field values
                    const input = group.querySelector('input, select, textarea');
                    if (input) {
                        if (input.type === 'checkbox') input.checked = false;
                        else input.value = '';
                    }
                }
            }
        });
    },

    updateDynamicOptions: function(item) {
        const stepFields = item.fields.filter(f => f.step === this._wizardState.currentStep);

        stepFields.forEach(field => {
            if (!field.optionsMap || !field.dependsOn) return;
            const parentEl = document.getElementById(`field-${field.dependsOn}`);
            if (!parentEl) return;

            const parentVal = parentEl.value;
            const options = field.optionsMap[parentVal];
            const el = document.getElementById(`field-${field.name}`);
            const group = document.getElementById(`group-${field.name}`);
            if (!el || !group) return;

            if (!options) {
                // No options for this parent value — hide
                group.style.display = 'none';
                return;
            }

            group.style.display = '';

            if (options.includes('_other')) {
                // Check if current value triggers "Other" text input
                // _other means: if the user picks "Other", swap to text input
            }

            // If the element is a <select>, rebuild its options
            if (el.tagName === 'SELECT') {
                const currentVal = el.value;
                el.innerHTML = '<option value="">-- Select --</option>' +
                    options.filter(o => o !== '_other').map(o => `<option value="${o}" ${o === currentVal ? 'selected' : ''}>${o}</option>`).join('') +
                    (options.includes('_other') ? '<option value="_other">Other (specify)</option>' : '');

                // Handle _other swap
                if (options.includes('_other')) {
                    const otherInputId = `field-${field.name}-other`;
                    let otherInput = document.getElementById(otherInputId);
                    if (!otherInput) {
                        const wrapper = document.createElement('div');
                        wrapper.id = `${field.name}-other-wrapper`;
                        wrapper.style.display = 'none';
                        wrapper.style.marginTop = '6px';
                        wrapper.innerHTML = `<input type="text" class="form-control" id="${otherInputId}" placeholder="Please specify...">`;
                        el.parentNode.appendChild(wrapper);
                    }
                    // Toggle other input
                    el.addEventListener('change', function handler() {
                        const w = document.getElementById(`${field.name}-other-wrapper`);
                        if (w) w.style.display = el.value === '_other' ? '' : 'none';
                    });
                    // Check initial state
                    const w = document.getElementById(`${field.name}-other-wrapper`);
                    if (w) w.style.display = el.value === '_other' ? '' : 'none';
                }
            }
        });
    },

    isFieldVisibleFromData: function(field) {
        if (!field.showWhen) return true;
        const controlVal = this._wizardState.formData[field.showWhen.field];
        return field.showWhen.equals.split('|').some(v => controlVal === v);
    },

    submitWizardRequest: async function(itemId) {
        const item = this.getCatalogItem(itemId);
        const ws = this._wizardState;
        if (!item || !ws) return;

        // Validate current step
        if (!this.validateWizardStep(ws.currentStep, itemId)) return;
        this.collectWizardStepData(ws.currentStep);

        const formData = { ...ws.formData };
        // Handle _other fields — merge "Other" text values
        item.fields.forEach(field => {
            if (formData[field.name] === '_other') {
                const otherVal = formData[`${field.name}-other`] || document.getElementById(`field-${field.name}-other`)?.value || '';
                formData[field.name] = otherVal ? `Other: ${otherVal}` : 'Other';
            }
        });

        const requestedFor = formData.reporter_email || ITSMData.currentUser.email;
        const priority = formData.severity || 'Normal';

        try {
            const result = await ITSMApi.createRequest({
                catalogItem: itemId,
                requestedBy: ITSMData.currentUser.email,
                requestedByName: ITSMData.currentUser.name || ITSMData.currentUser.username,
                requestedFor: requestedFor,
                requestedForName: formData.reporter_name || ITSMData.currentUser.name,
                requestedForDepartment: '',
                requestedForLocation: '',
                requestedForVip: false,
                description: formData.description || item.description,
                priority: priority,
                formData: formData,
                assignmentGroup: this.determineAssignment(item)
            });
            if (result.success) {
                this._wizardState = null;
                closeModal();
                showToast(`Request ${result.data.id} submitted successfully`, 'success');
                if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
            } else {
                showToast(result.error || 'Failed to submit request', 'error');
            }
        } catch (err) {
            showToast('Failed to submit request: ' + err.message, 'error');
        }
    },

    saveWizardAsDraft: async function(itemId) {
        const item = this.getCatalogItem(itemId);
        const ws = this._wizardState;
        if (!item || !ws) return;

        this.collectWizardStepData(ws.currentStep);
        const formData = { ...ws.formData };
        const requestedFor = formData.reporter_email || ITSMData.currentUser.email;

        try {
            const result = await ITSMApi.createRequest({
                catalogItem: itemId,
                requestedBy: ITSMData.currentUser.email,
                requestedByName: ITSMData.currentUser.name || ITSMData.currentUser.username,
                requestedFor: requestedFor,
                requestedForName: formData.reporter_name || ITSMData.currentUser.name,
                requestedForDepartment: '',
                requestedForLocation: '',
                requestedForVip: false,
                description: item.description,
                priority: formData.severity || 'Normal',
                formData: formData
            });
            if (result.success) {
                await ITSMApi.updateRequestStatus(result.data.id, 'Draft');
                this._wizardState = null;
                closeModal();
                showToast(`Draft ${result.data.id} saved`, 'success');
                if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
            } else {
                showToast(result.error || 'Failed to save draft', 'error');
            }
        } catch (err) {
            showToast('Failed to save draft: ' + err.message, 'error');
        }
    },

    // ==================== MY REQUESTS ====================

    /**
     * Show the My Requests page
     */
    showMyRequests: function() {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = this.renderMyRequests();
            this.setupRequestFilters();
        }
    },

    /**
     * Render the My Requests page
     * @returns {string} HTML string
     */
    renderMyRequests: function() {
        const currentUserEmail = ITSMData.currentUser.email;

        // Get requests for current user (requested by or requested for)
        const myRequests = ITSMData.serviceRequests.filter(r =>
            r.requestedBy === currentUserEmail || r.requestedFor === currentUserEmail
        );

        // Get requests pending approval from current user
        const pendingApprovals = ITSMData.serviceRequests.filter(r =>
            r.approver === currentUserEmail && r.status === 'Pending Approval'
        );

        return `
            <div class="page-header">
                <div class="page-title">My Service Requests</div>
                <div class="page-subtitle">Track and manage your service requests</div>
            </div>
            <div class="toolbar">
                <div class="toolbar-group">
                    <button class="btn btn-primary btn-sm" onclick="setActiveModule('service-catalog')">Browse Catalog</button>
                </div>
                <div class="toolbar-separator"></div>
                <div class="toolbar-group">
                    <select class="form-control" style="width: 150px; padding: 4px;" id="request-status-filter" onchange="CatalogModule.filterRequests()">
                        <option value="">All Statuses</option>
                        ${this.requestStatuses.map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>
                </div>
                <div class="toolbar-search" style="margin-left: auto;">
                    <input type="text" placeholder="Search requests..." id="request-search" oninput="CatalogModule.filterRequests()">
                </div>
            </div>
            <div class="page-content">
                ${pendingApprovals.length > 0 ? `
                    <div class="card" style="margin-bottom: var(--spacing-lg); border-left: 4px solid var(--accent-orange);">
                        <div class="card-header">
                            <span>Pending Your Approval (${pendingApprovals.length})</span>
                        </div>
                        <div class="card-body" style="padding: 0;">
                            <div class="table-container">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Service</th>
                                            <th>Requested By</th>
                                            <th>Requested For</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${pendingApprovals.map(req => {
                                            const item = this.getCatalogItem(req.catalogItem);
                                            return `
                                                <tr>
                                                    <td class="cell-id">${req.id}</td>
                                                    <td>${item ? item.name : req.catalogItem}</td>
                                                    <td>${Utils.escapeHtml(req.requestedBy)}</td>
                                                    <td>${Utils.escapeHtml(req.requestedFor)}</td>
                                                    <td class="cell-date">${formatDateTime(req.createdAt)}</td>
                                                    <td class="cell-actions">
                                                        <button class="btn btn-sm btn-success" onclick="CatalogModule.approveRequest('${req.id}')">Approve</button>
                                                        <button class="btn btn-sm btn-danger" onclick="CatalogModule.rejectRequest('${req.id}')">Reject</button>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <div class="card">
                    <div class="card-header">
                        <span>My Requests (${myRequests.length})</span>
                    </div>
                    <div class="card-body" style="padding: 0;">
                        <div id="requests-list">
                            ${this.renderRequestsTable(myRequests)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render the requests table
     * @param {array} requests - Array of requests
     * @returns {string} HTML string
     */
    renderRequestsTable: function(requests) {
        if (requests.length === 0) {
            return '<div class="empty-state"><div class="empty-state-text">No requests found</div></div>';
        }

        return `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Service</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Requested For</th>
                            <th>Created</th>
                            <th>Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${requests.map(req => {
                            const item = this.getCatalogItem(req.catalogItem);
                            const statusClass = this.statusBadgeClass[req.status] || 'badge-new';
                            return `
                                <tr class="clickable" onclick="CatalogModule.viewRequestDetails('${req.id}')">
                                    <td class="cell-id">${req.id}</td>
                                    <td>
                                        ${item ? `${item.icon} ${item.name}` : req.catalogItem}
                                    </td>
                                    <td><span class="badge ${statusClass}">${req.status}</span></td>
                                    <td>${req.priority}</td>
                                    <td>${Utils.escapeHtml(req.requestedFor)}</td>
                                    <td class="cell-date">${formatDateTime(req.createdAt)}</td>
                                    <td class="cell-date">${formatDateTime(req.updatedAt)}</td>
                                    <td class="cell-actions" onclick="event.stopPropagation();">
                                        <button class="btn btn-sm btn-secondary" onclick="CatalogModule.viewRequestDetails('${req.id}')">View</button>
                                        ${req.status === 'Draft' ? `
                                            <button class="btn btn-sm btn-primary" onclick="CatalogModule.editDraft('${req.id}')">Edit</button>
                                        ` : ''}
                                        ${['Draft', 'Pending Approval'].includes(req.status) ? `
                                            <button class="btn btn-sm btn-danger" onclick="CatalogModule.cancelRequest('${req.id}')">Cancel</button>
                                        ` : ''}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    /**
     * Setup request filter listeners
     */
    setupRequestFilters: function() {
        // Filters are handled via onchange/oninput attributes
    },

    /**
     * Filter requests based on search and status
     */
    filterRequests: function() {
        const searchTerm = document.getElementById('request-search')?.value?.toLowerCase() || '';
        const statusFilter = document.getElementById('request-status-filter')?.value || '';
        const currentUserEmail = ITSMData.currentUser.email;

        let requests = ITSMData.serviceRequests.filter(r =>
            r.requestedBy === currentUserEmail || r.requestedFor === currentUserEmail
        );

        if (searchTerm) {
            requests = requests.filter(req => {
                const item = this.getCatalogItem(req.catalogItem);
                return req.id.toLowerCase().includes(searchTerm) ||
                    (item && item.name.toLowerCase().includes(searchTerm)) ||
                    req.requestedFor.toLowerCase().includes(searchTerm);
            });
        }

        if (statusFilter) {
            requests = requests.filter(req => req.status === statusFilter);
        }

        const listContainer = document.getElementById('requests-list');
        if (listContainer) {
            listContainer.innerHTML = this.renderRequestsTable(requests);
        }
    },

    // ==================== REQUEST DETAILS ====================

    /**
     * View request details
     * @param {string} requestId - Request ID
     */
    viewRequestDetails: function(requestId) {
        const request = this.getRequest(requestId);
        if (!request) {
            showToast('Request not found', 'error');
            return;
        }

        const item = this.getCatalogItem(request.catalogItem);
        const statusClass = this.statusBadgeClass[request.status] || 'badge-new';
        const currentUserEmail = ITSMData.currentUser.email;
        const isApprover = request.approver === currentUserEmail && request.status === 'Pending Approval';

        showModal(`
            <div class="modal-header">
                <span>${request.id} - ${item ? item.name : 'Service Request'}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 650px; max-height: 70vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                    <span class="badge ${statusClass}" style="font-size: 14px; padding: 6px 12px;">${request.status}</span>
                    <span style="color: var(--text-muted);">Priority: ${request.priority}</span>
                </div>

                <div class="card" style="margin-bottom: var(--spacing-lg);">
                    <div class="card-header">Request Information</div>
                    <div class="card-body">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                            <div>
                                <label class="form-label" style="color: var(--text-muted);">Requested By</label>
                                <div>${Utils.escapeHtml(request.requestedBy)}</div>
                            </div>
                            <div>
                                <label class="form-label" style="color: var(--text-muted);">Requested For</label>
                                <div>${Utils.escapeHtml(request.requestedFor)}</div>
                            </div>
                            <div>
                                <label class="form-label" style="color: var(--text-muted);">Created</label>
                                <div>${formatDateTime(request.createdAt)}</div>
                            </div>
                            <div>
                                <label class="form-label" style="color: var(--text-muted);">Last Updated</label>
                                <div>${formatDateTime(request.updatedAt)}</div>
                            </div>
                            ${request.approver ? `
                                <div>
                                    <label class="form-label" style="color: var(--text-muted);">Approver</label>
                                    <div>${Utils.escapeHtml(request.approver)}</div>
                                </div>
                            ` : ''}
                            ${request.assignedTo ? `
                                <div>
                                    <label class="form-label" style="color: var(--text-muted);">Assigned To</label>
                                    <div>${Utils.escapeHtml(request.assignedTo)}</div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                ${item ? `
                    <div class="card" style="margin-bottom: var(--spacing-lg);">
                        <div class="card-header">Service Details</div>
                        <div class="card-body">
                            <div style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
                                <span style="font-size: 24px;">${item.icon}</span>
                                <div>
                                    <strong>${item.name}</strong>
                                    <div style="font-size: 12px; color: var(--text-muted);">${item.description}</div>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                                <div>
                                    <label class="form-label" style="color: var(--text-muted);">Category</label>
                                    <div>${item.category}</div>
                                </div>
                                <div>
                                    <label class="form-label" style="color: var(--text-muted);">Fulfillment Time</label>
                                    <div>${item.fulfillmentTime}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <div class="card">
                    <div class="card-header">Form Data</div>
                    <div class="card-body">
                        ${Object.keys(request.formData).length > 0 ? `
                            <table style="width: 100%;">
                                ${Object.entries(request.formData).map(([key, value]) => {
                                    const fieldDef = item ? item.fields.find(f => f.name === key) : null;
                                    const label = fieldDef ? fieldDef.label : key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                    return `
                                        <tr>
                                            <td style="padding: 4px 0; color: var(--text-muted); width: 40%;">${Utils.escapeHtml(label)}:</td>
                                            <td style="padding: 4px 0;">${Utils.escapeHtml(value || '-')}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </table>
                        ` : '<div style="color: var(--text-muted);">No form data</div>'}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                ${isApprover ? `
                    <button class="btn btn-danger" onclick="CatalogModule.rejectRequest('${request.id}')">Reject</button>
                    <button class="btn btn-success" onclick="CatalogModule.approveRequest('${request.id}')">Approve</button>
                ` : ''}
                ${request.status === 'Draft' ? `
                    <button class="btn btn-primary" onclick="CatalogModule.submitDraft('${request.id}')">Submit Request</button>
                ` : ''}
            </div>
        `);
    },

    // ==================== REQUEST ACTIONS ====================

    /**
     * Edit a draft request
     * @param {string} requestId - Request ID
     */
    editDraft: function(requestId) {
        const request = this.getRequest(requestId);
        if (!request || request.status !== 'Draft') {
            showToast('Cannot edit this request', 'error');
            return;
        }

        const item = this.getCatalogItem(request.catalogItem);
        if (!item) {
            showToast('Catalog item not found', 'error');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>Edit Draft: ${item.name}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 600px; max-height: 70vh; overflow-y: auto;">
                <form id="edit-request-form">
                    <input type="hidden" id="edit-req-id" value="${request.id}">

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
                        <div class="form-group">
                            <label class="form-label">Requested By</label>
                            <input type="text" class="form-control" value="${Utils.escapeHtml(request.requestedBy)}" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Requested For</label>
                            <input type="email" class="form-control" id="edit-req-requested-for" value="${Utils.escapeHtml(request.requestedFor)}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Priority</label>
                            <select class="form-control" id="edit-req-priority">
                                <option value="Low" ${request.priority === 'Low' ? 'selected' : ''}>Low</option>
                                <option value="Normal" ${request.priority === 'Normal' ? 'selected' : ''}>Normal</option>
                                <option value="High" ${request.priority === 'High' ? 'selected' : ''}>High</option>
                            </select>
                        </div>
                    </div>

                    <hr style="border: none; border-top: 1px solid var(--border-light); margin: var(--spacing-lg) 0;">

                    <h4 style="margin-bottom: var(--spacing-md);">Service Details</h4>

                    ${item.fields.map(field => this.renderFormFieldWithValue(field, request.formData[field.name])).join('')}
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-secondary" onclick="CatalogModule.updateDraft('${request.id}')">Save Draft</button>
                <button class="btn btn-primary" onclick="CatalogModule.submitDraft('${request.id}')">Submit Request</button>
            </div>
        `);
    },

    /**
     * Render a form field with a pre-filled value
     * @param {object} field - Field definition
     * @param {string} value - Current value
     * @returns {string} HTML string
     */
    renderFormFieldWithValue: function(field, value) {
        const requiredAttr = field.required ? 'required' : '';
        const requiredClass = field.required ? 'required' : '';
        value = value || '';

        let fieldHtml = '';

        switch (field.type) {
            case 'select':
                fieldHtml = `
                    <select class="form-control" id="field-${field.name}" ${requiredAttr}>
                        <option value="">-- Select --</option>
                        ${(field.options || []).map(opt => `<option value="${Utils.escapeHtml(opt)}" ${opt === value ? 'selected' : ''}>${Utils.escapeHtml(opt)}</option>`).join('')}
                    </select>
                `;
                break;

            case 'textarea':
                fieldHtml = `
                    <textarea class="form-control" id="field-${field.name}" rows="3" ${requiredAttr}>${Utils.escapeHtml(value)}</textarea>
                `;
                break;

            case 'date':
                fieldHtml = `
                    <input type="date" class="form-control" id="field-${field.name}" value="${Utils.escapeHtml(value)}" ${requiredAttr}>
                `;
                break;

            case 'email':
                fieldHtml = `
                    <input type="email" class="form-control" id="field-${field.name}" value="${Utils.escapeHtml(value)}" ${requiredAttr}>
                `;
                break;

            case 'checkbox':
                fieldHtml = `
                    <div class="consent-check">
                        <input type="checkbox" id="field-${field.name}" ${value ? 'checked' : ''}>
                        <label for="field-${field.name}">${Utils.escapeHtml(field.label)}</label>
                    </div>
                `;
                return `
                    <div class="form-group" id="group-${field.name}">
                        ${fieldHtml}
                    </div>
                `;

            case 'file':
                fieldHtml = `
                    <input type="file" class="form-control" id="field-${field.name}" multiple>
                    ${value ? `<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Previously: ${Utils.escapeHtml(value)}</div>` : ''}
                `;
                break;

            case 'text':
            default:
                fieldHtml = `
                    <input type="text" class="form-control" id="field-${field.name}" value="${Utils.escapeHtml(value)}" ${requiredAttr}>
                `;
                break;
        }

        return `
            <div class="form-group" id="group-${field.name}">
                <label class="form-label ${requiredClass}">${Utils.escapeHtml(field.label)}</label>
                ${fieldHtml}
            </div>
        `;
    },

    /**
     * Update a draft request
     * @param {string} requestId - Request ID
     */
    updateDraft: function(requestId) {
        const request = this.getRequest(requestId);
        if (!request || request.status !== 'Draft') {
            showToast('Cannot update this request', 'error');
            return;
        }

        const item = this.getCatalogItem(request.catalogItem);
        if (!item) return;

        const requestedFor = document.getElementById('edit-req-requested-for')?.value || request.requestedFor;
        const priority = document.getElementById('edit-req-priority')?.value || request.priority;

        // Collect form data
        const formData = {};
        item.fields.forEach(field => {
            const element = document.getElementById(`field-${field.name}`);
            if (element) {
                formData[field.name] = element.value.trim();
            }
        });

        // Update request
        request.requestedFor = requestedFor;
        request.priority = priority;
        request.formData = formData;
        request.updatedAt = new Date().toISOString();

        // Audit logging handled server-side

        closeModal();
        showToast(`Draft ${request.id} updated`, 'success');
        this.showMyRequests();
    },

    /**
     * Submit a draft request
     * @param {string} requestId - Request ID
     */
    submitDraft: function(requestId) {
        const request = this.getRequest(requestId);
        if (!request || request.status !== 'Draft') {
            showToast('Cannot submit this request', 'error');
            return;
        }

        const item = this.getCatalogItem(request.catalogItem);
        if (!item) {
            showToast('Catalog item not found', 'error');
            return;
        }

        // Check if editing, collect current form values
        const requestedForEl = document.getElementById('edit-req-requested-for');
        if (requestedForEl) {
            request.requestedFor = requestedForEl.value || request.requestedFor;
            request.priority = document.getElementById('edit-req-priority')?.value || request.priority;

            // Collect form data
            item.fields.forEach(field => {
                const element = document.getElementById(`field-${field.name}`);
                if (element) {
                    request.formData[field.name] = element.value.trim();
                }
            });
        }

        // Validate required fields
        let isValid = true;
        item.fields.forEach(field => {
            if (field.required && !request.formData[field.name]) {
                isValid = false;
            }
        });

        if (!isValid) {
            showToast('Please fill in all required fields before submitting', 'error');
            return;
        }

        // Update status
        request.status = item.approvalRequired ? 'Pending Approval' : 'Approved';
        request.approver = item.approvalRequired ? this.determineApprover(request.requestedFor) : null;
        request.assignedTo = item.approvalRequired ? null : this.determineAssignment(item);
        request.updatedAt = new Date().toISOString();

        // Audit logging handled server-side

        closeModal();
        showToast(`Request ${request.id} submitted successfully`, 'success');
        this.showMyRequests();
    },

    /**
     * Cancel a request
     * @param {string} requestId - Request ID
     */
    cancelRequest: function(requestId) {
        const request = this.getRequest(requestId);
        if (!request) {
            showToast('Request not found', 'error');
            return;
        }

        if (!['Draft', 'Pending Approval'].includes(request.status)) {
            showToast('Cannot cancel this request', 'error');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>Cancel Request ${requestId}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 400px;">
                <p>Are you sure you want to cancel this request?</p>
                <div class="form-group">
                    <label class="form-label">Reason (optional)</label>
                    <textarea class="form-control" id="cancel-reason" rows="3" placeholder="Enter cancellation reason..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">No, Keep Request</button>
                <button class="btn btn-danger" onclick="CatalogModule.confirmCancelRequest('${requestId}')">Yes, Cancel Request</button>
            </div>
        `);
    },

    /**
     * Confirm cancellation of a request
     * @param {string} requestId - Request ID
     */
    confirmCancelRequest: function(requestId) {
        const request = this.getRequest(requestId);
        if (!request) return;

        const reason = document.getElementById('cancel-reason')?.value || 'No reason provided';

        request.status = 'Cancelled';
        request.updatedAt = new Date().toISOString();

        // Audit logging handled server-side

        closeModal();
        showToast(`Request ${requestId} has been cancelled`, 'success');
        this.showMyRequests();
    },

    // ==================== APPROVAL ACTIONS ====================

    /**
     * Approve a request
     * @param {string} requestId - Request ID
     */
    approveRequest: function(requestId) {
        const request = this.getRequest(requestId);
        if (!request || request.status !== 'Pending Approval') {
            showToast('Cannot approve this request', 'error');
            return;
        }

        if (request.approver !== ITSMData.currentUser.email) {
            showToast('You are not authorized to approve this request', 'error');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>Approve Request ${requestId}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 400px;">
                <p>Are you sure you want to approve this request?</p>
                <div class="form-group">
                    <label class="form-label">Comments (optional)</label>
                    <textarea class="form-control" id="approval-comments" rows="3" placeholder="Enter any comments..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-success" onclick="CatalogModule.confirmApproveRequest('${requestId}')">Approve</button>
            </div>
        `);
    },

    /**
     * Confirm approval of a request
     * @param {string} requestId - Request ID
     */
    confirmApproveRequest: function(requestId) {
        const request = this.getRequest(requestId);
        if (!request) return;

        const comments = document.getElementById('approval-comments')?.value || '';
        const item = this.getCatalogItem(request.catalogItem);

        request.status = 'Approved';
        request.assignedTo = this.determineAssignment(item);
        request.updatedAt = new Date().toISOString();

        // Audit logging handled server-side

        closeModal();
        showToast(`Request ${requestId} has been approved`, 'success');
        this.showMyRequests();
    },

    /**
     * Reject a request
     * @param {string} requestId - Request ID
     */
    rejectRequest: function(requestId) {
        const request = this.getRequest(requestId);
        if (!request || request.status !== 'Pending Approval') {
            showToast('Cannot reject this request', 'error');
            return;
        }

        if (request.approver !== ITSMData.currentUser.email) {
            showToast('You are not authorized to reject this request', 'error');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>Reject Request ${requestId}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 400px;">
                <p>Are you sure you want to reject this request?</p>
                <div class="form-group">
                    <label class="form-label required">Rejection Reason</label>
                    <textarea class="form-control" id="rejection-reason" rows="3" placeholder="Enter reason for rejection..." required></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-danger" onclick="CatalogModule.confirmRejectRequest('${requestId}')">Reject</button>
            </div>
        `);
    },

    /**
     * Confirm rejection of a request
     * @param {string} requestId - Request ID
     */
    confirmRejectRequest: function(requestId) {
        const request = this.getRequest(requestId);
        if (!request) return;

        const reason = document.getElementById('rejection-reason')?.value?.trim();

        if (!reason) {
            showToast('Please provide a rejection reason', 'error');
            return;
        }

        request.status = 'Cancelled';
        request.updatedAt = new Date().toISOString();

        // Audit logging handled server-side

        closeModal();
        showToast(`Request ${requestId} has been rejected`, 'warning');
        this.showMyRequests();
    },

    // ==================== FULFILLMENT ACTIONS ====================

    /**
     * Start fulfillment of an approved request
     * @param {string} requestId - Request ID
     */
    startFulfillment: function(requestId) {
        const request = this.getRequest(requestId);
        if (!request || request.status !== 'Approved') {
            showToast('Cannot start fulfillment for this request', 'error');
            return;
        }

        request.status = 'In Progress';
        request.updatedAt = new Date().toISOString();

        // Audit logging handled server-side

        showToast(`Fulfillment started for ${requestId}`, 'success');
    },

    /**
     * Complete fulfillment of a request
     * @param {string} requestId - Request ID
     */
    completeFulfillment: function(requestId) {
        const request = this.getRequest(requestId);
        if (!request || request.status !== 'In Progress') {
            showToast('Cannot complete this request', 'error');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>Complete Request ${requestId}</span>
                <button class="panel-close" onclick="closeModal()">x</button>
            </div>
            <div class="modal-body" style="width: 400px;">
                <p>Mark this request as fulfilled?</p>
                <div class="form-group">
                    <label class="form-label">Fulfillment Notes</label>
                    <textarea class="form-control" id="fulfillment-notes" rows="3" placeholder="Enter any fulfillment notes..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-success" onclick="CatalogModule.confirmCompleteFulfillment('${requestId}')">Complete</button>
            </div>
        `);
    },

    /**
     * Confirm completion of fulfillment
     * @param {string} requestId - Request ID
     */
    confirmCompleteFulfillment: function(requestId) {
        const request = this.getRequest(requestId);
        if (!request) return;

        const notes = document.getElementById('fulfillment-notes')?.value || '';

        request.status = 'Fulfilled';
        request.updatedAt = new Date().toISOString();

        // Audit logging handled server-side

        closeModal();
        showToast(`Request ${requestId} has been fulfilled`, 'success');
    }
};

// Export to window
window.CatalogModule = CatalogModule;

// Convenience functions for global access
window.renderCatalog = function() {
    return CatalogModule.renderCatalog();
};

window.renderMyRequests = function() {
    return CatalogModule.renderMyRequests();
};
