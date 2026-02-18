/**
 * ITSM Console - Assets/CMDB Module
 * Complete asset management functionality
 */

const AssetsModule = {
    // Asset type options
    assetTypes: ['Server', 'Workstation', 'Network', 'Printer', 'Mobile', 'Other'],

    // Asset status options with colors
    assetStatuses: {
        'Active': { color: 'var(--accent-green)', icon: '●' },
        'Warning': { color: 'var(--accent-orange)', icon: '●' },
        'Error': { color: 'var(--accent-red)', icon: '●' },
        'Maintenance': { color: 'var(--accent-blue, #4a9eff)', icon: '●' },
        'Retired': { color: 'var(--text-muted)', icon: '○' }
    },

    /**
     * 1. Search assets by ID, name, owner, or location
     * @param {string} query - Search query string
     * @returns {Array} - Filtered assets array
     */
    searchAssets(query) {
        if (!query || query.trim() === '') {
            return ITSMData.assets;
        }

        const searchTerm = query.toLowerCase().trim();

        return ITSMData.assets.filter(asset => {
            return (
                asset.id.toLowerCase().includes(searchTerm) ||
                asset.name.toLowerCase().includes(searchTerm) ||
                asset.owner.toLowerCase().includes(searchTerm) ||
                asset.location.toLowerCase().includes(searchTerm)
            );
        });
    },

    /**
     * 2. Filter assets by type and re-render table
     * @param {string} type - Asset type to filter by (empty for all)
     */
    filterAssetsByType(type) {
        let filteredAssets;

        if (!type || type === '') {
            filteredAssets = ITSMData.assets;
        } else {
            filteredAssets = ITSMData.assets.filter(asset => asset.type === type);
        }

        // Also apply current search filter if exists
        const searchInput = document.getElementById('asset-search');
        if (searchInput && searchInput.value.trim() !== '') {
            const searchTerm = searchInput.value.toLowerCase().trim();
            filteredAssets = filteredAssets.filter(asset => {
                return (
                    asset.id.toLowerCase().includes(searchTerm) ||
                    asset.name.toLowerCase().includes(searchTerm) ||
                    asset.owner.toLowerCase().includes(searchTerm) ||
                    asset.location.toLowerCase().includes(searchTerm)
                );
            });
        }

        // Re-render the table body
        const tableBody = document.getElementById('assets-table-body');
        if (tableBody) {
            tableBody.innerHTML = this.renderAssetsTableBody(filteredAssets);
        }
    },

    /**
     * 3. Render HTML for assets table (complete table structure)
     * @param {Array} assets - Array of assets to render
     * @returns {string} - HTML string for the table
     */
    renderAssetsTable(assets) {
        if (!assets || assets.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">🖥️</div>
                    <div class="empty-state-title">No Assets Found</div>
                    <div class="empty-state-text">No assets match your search criteria</div>
                </div>
            `;
        }

        return `
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
                            <th>OS</th>
                            <th>Last Seen</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="assets-table-body">
                        ${this.renderAssetsTableBody(assets)}
                    </tbody>
                </table>
            </div>
        `;
    },

    /**
     * Render just the table body rows (for re-rendering on filter/search)
     * @param {Array} assets - Array of assets to render
     * @returns {string} - HTML string for table rows
     */
    renderAssetsTableBody(assets) {
        if (!assets || assets.length === 0) {
            return `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        No assets found matching your criteria
                    </td>
                </tr>
            `;
        }

        return assets.map(asset => {
            const statusInfo = this.assetStatuses[asset.status] || this.assetStatuses['Active'];
            return `
                <tr class="clickable" onclick="AssetsModule.viewAsset('${asset.id}')">
                    <td class="cell-id">${asset.id}</td>
                    <td>${asset.name}</td>
                    <td>${asset.type}</td>
                    <td>
                        <span style="color: ${statusInfo.color};">${statusInfo.icon}</span>
                        ${asset.status}
                    </td>
                    <td>${asset.owner}</td>
                    <td>${asset.location}</td>
                    <td>${asset.os || 'N/A'}</td>
                    <td class="cell-date">${this.formatDateTime(asset.lastSeen)}</td>
                    <td class="cell-actions" onclick="event.stopPropagation();">
                        <button class="btn btn-sm btn-secondary" onclick="AssetsModule.viewAsset('${asset.id}')">View</button>
                        <button class="btn btn-sm btn-secondary" onclick="AssetsModule.editAsset('${asset.id}')">Edit</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * 4. View detailed asset modal
     * @param {string} assetId - Asset ID to view
     */
    viewAsset(assetId) {
        const asset = ITSMData.assets.find(a => a.id === assetId);
        if (!asset) {
            showToast('Asset not found', 'error');
            return;
        }

        // Get related incidents
        const relatedIncidents = ITSMData.incidents.filter(inc => inc.affectedAsset === assetId);

        // Get related changes
        const relatedChanges = ITSMData.changes.filter(chg =>
            chg.affectedAssets && chg.affectedAssets.includes(assetId)
        );

        const statusInfo = this.assetStatuses[asset.status] || this.assetStatuses['Active'];

        const modalContent = `
            <div class="modal-header">
                <span><img class="modal-icon" src="icons/desktop.png" alt=""> Asset Details: ${asset.id}</span>
                <button class="panel-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body" style="width: 700px; max-height: 70vh; overflow-y: auto;">
                <!-- Asset Properties -->
                <div class="card" style="margin-bottom: var(--spacing-md);">
                    <div class="card-header">
                        <span>Asset Information</span>
                        <span style="color: ${statusInfo.color}; font-weight: bold;">
                            ${statusInfo.icon} ${asset.status}
                        </span>
                    </div>
                    <div class="card-body">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                            <div class="form-group">
                                <label class="form-label">Asset ID</label>
                                <div style="font-weight: bold;">${asset.id}</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Name</label>
                                <div>${asset.name}</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Type</label>
                                <div>${asset.type}</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Operating System</label>
                                <div>${asset.os || 'N/A'}</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Owner</label>
                                <div>${asset.owner}</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Location</label>
                                <div>${asset.location}</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Last Seen</label>
                                <div>${this.formatDateTime(asset.lastSeen)}</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Status</label>
                                <div>
                                    <span style="color: ${statusInfo.color};">${statusInfo.icon}</span>
                                    ${asset.status}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Related Incidents -->
                <div class="card" style="margin-bottom: var(--spacing-md);">
                    <div class="card-header">
                        <span>Related Incidents (${relatedIncidents.length})</span>
                    </div>
                    <div class="card-body" style="padding: ${relatedIncidents.length > 0 ? '0' : 'var(--spacing-md)'};">
                        ${relatedIncidents.length > 0 ? `
                            <table class="data-table" style="margin: 0;">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Summary</th>
                                        <th>Status</th>
                                        <th>Priority</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${relatedIncidents.map(inc => `
                                        <tr class="clickable" onclick="closeModal(); openIncidentDetail('${inc.id}');">
                                            <td class="cell-id">${inc.id}</td>
                                            <td>${inc.title}</td>
                                            <td><span class="badge badge-${inc.status.toLowerCase().replace(' ', '-')}">${inc.status}</span></td>
                                            <td><span class="badge priority-${inc.priority.toLowerCase()}">${inc.priority}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : '<div style="color: var(--text-muted); text-align: center;">No related incidents</div>'}
                    </div>
                </div>

                <!-- Related Changes -->
                <div class="card">
                    <div class="card-header">
                        <span>Related Changes (${relatedChanges.length})</span>
                    </div>
                    <div class="card-body" style="padding: ${relatedChanges.length > 0 ? '0' : 'var(--spacing-md)'};">
                        ${relatedChanges.length > 0 ? `
                            <table class="data-table" style="margin: 0;">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Title</th>
                                        <th>Status</th>
                                        <th>Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${relatedChanges.map(chg => `
                                        <tr class="clickable" onclick="closeModal(); viewChange('${chg.id}');">
                                            <td class="cell-id">${chg.id}</td>
                                            <td>${chg.title}</td>
                                            <td><span class="badge badge-${chg.status.toLowerCase().replace(' ', '-')}">${chg.status}</span></td>
                                            <td><span class="badge ${chg.type === 'Emergency' ? 'badge-critical' : 'badge-new'}">${chg.type}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : '<div style="color: var(--text-muted); text-align: center;">No related changes</div>'}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                <button class="btn btn-primary" onclick="closeModal(); AssetsModule.editAsset('${asset.id}');">Edit Asset</button>
                <button class="btn btn-warning" onclick="closeModal(); AssetsModule.createIncidentForAsset('${asset.id}');">Create Incident for Asset</button>
            </div>
        `;

        showModal(modalContent);
    },

    /**
     * 5. Create new asset modal
     */
    createAsset() {
        // Generate next asset ID
        const nextId = this.generateAssetId();

        const modalContent = `
            <div class="modal-header">
                <span><img class="modal-icon" src="icons/desktop.png" alt=""> Create New Asset</span>
                <button class="panel-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body" style="width: 500px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <div class="form-group">
                        <label class="form-label">Asset ID</label>
                        <input type="text" class="form-control" id="new-asset-id" value="${nextId}" placeholder="Auto-generated or custom">
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Name</label>
                        <input type="text" class="form-control" id="new-asset-name" placeholder="Asset name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Type</label>
                        <select class="form-control" id="new-asset-type">
                            ${this.assetTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Status</label>
                        <select class="form-control" id="new-asset-status">
                            ${Object.keys(this.assetStatuses).map(status =>
                                `<option value="${status}" ${status === 'Active' ? 'selected' : ''}>${status}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Owner</label>
                        <input type="text" class="form-control" id="new-asset-owner" placeholder="Owner name or email">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Location</label>
                        <input type="text" class="form-control" id="new-asset-location" placeholder="Physical location">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Operating System</label>
                    <input type="text" class="form-control" id="new-asset-os" placeholder="e.g., Windows 11, iOS 17, Cisco IOS">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="AssetsModule.submitCreateAsset()">Create Asset</button>
            </div>
        `;

        showModal(modalContent);
    },

    /**
     * Submit the create asset form
     */
    async submitCreateAsset() {
        const name = document.getElementById('new-asset-name').value.trim();
        const type = document.getElementById('new-asset-type').value;
        const status = document.getElementById('new-asset-status').value;
        const owner = document.getElementById('new-asset-owner').value.trim();
        const location = document.getElementById('new-asset-location').value.trim();
        const os = document.getElementById('new-asset-os').value.trim();

        if (!name) { showToast('Asset name is required', 'error'); return; }

        try {
            const result = await ITSMApi.createAsset({
                name, type, owner: owner || 'Unassigned',
                location: location || 'Unknown', os: os || 'N/A'
            });
            if (result.success) {
                closeModal();
                showToast(`Asset ${result.data.id} created successfully`, 'success');
                if (typeof currentModule !== 'undefined' && currentModule === 'assets') {
                    renderModule('assets');
                    this.setupAssetSearch();
                }
            } else {
                showToast(result.error || 'Failed to create asset', 'error');
            }
        } catch (err) {
            showToast('Failed to create asset: ' + err.message, 'error');
        }
    },

    /**
     * 6. Edit asset modal (pre-filled form)
     * @param {string} assetId - Asset ID to edit
     */
    editAsset(assetId) {
        const asset = ITSMData.assets.find(a => a.id === assetId);
        if (!asset) {
            showToast('Asset not found', 'error');
            return;
        }

        const modalContent = `
            <div class="modal-header">
                <span><img class="modal-icon" src="icons/desktop.png" alt=""> Edit Asset: ${asset.id}</span>
                <button class="panel-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body" style="width: 500px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <div class="form-group">
                        <label class="form-label">Asset ID</label>
                        <input type="text" class="form-control" id="edit-asset-id" value="${asset.id}" readonly style="background: var(--bg-secondary);">
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Name</label>
                        <input type="text" class="form-control" id="edit-asset-name" value="${asset.name}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Type</label>
                        <select class="form-control" id="edit-asset-type">
                            ${this.assetTypes.map(type =>
                                `<option value="${type}" ${type === asset.type ? 'selected' : ''}>${type}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Status</label>
                        <select class="form-control" id="edit-asset-status">
                            ${Object.keys(this.assetStatuses).map(status =>
                                `<option value="${status}" ${status === asset.status ? 'selected' : ''}>${status}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Owner</label>
                        <input type="text" class="form-control" id="edit-asset-owner" value="${asset.owner}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Location</label>
                        <input type="text" class="form-control" id="edit-asset-location" value="${asset.location}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Operating System</label>
                    <input type="text" class="form-control" id="edit-asset-os" value="${asset.os || ''}">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger" onclick="AssetsModule.deleteAsset('${asset.id}')" style="margin-right: auto;">Delete</button>
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="AssetsModule.submitEditAsset('${asset.id}')">Save Changes</button>
            </div>
        `;

        showModal(modalContent);
    },

    /**
     * Submit the edit asset form
     * @param {string} assetId - Asset ID being edited
     */
    async submitEditAsset(assetId) {
        const name = document.getElementById('edit-asset-name').value.trim();
        const type = document.getElementById('edit-asset-type').value;
        const status = document.getElementById('edit-asset-status').value;
        const owner = document.getElementById('edit-asset-owner').value.trim();
        const location = document.getElementById('edit-asset-location').value.trim();
        const os = document.getElementById('edit-asset-os').value.trim();

        if (!name) { showToast('Asset name is required', 'error'); return; }

        try {
            await ITSMApi.saveEntity('assets', assetId, {
                name, type, status,
                owner: owner || 'Unassigned',
                location: location || 'Unknown',
                os: os || 'N/A'
            });
            closeModal();
            showToast(`Asset ${assetId} updated successfully`, 'success');
            if (typeof currentModule !== 'undefined' && currentModule === 'assets') {
                renderModule('assets');
                this.setupAssetSearch();
            }
        } catch (err) {
            showToast('Failed to update asset: ' + err.message, 'error');
        }
    },

    /**
     * 7. Delete asset with confirmation
     * @param {string} assetId - Asset ID to delete
     */
    deleteAsset(assetId) {
        const asset = ITSMData.assets.find(a => a.id === assetId);
        if (!asset) {
            showToast('Asset not found', 'error');
            return;
        }

        // Check for related incidents
        const relatedIncidents = ITSMData.incidents.filter(inc => inc.affectedAsset === assetId);
        const relatedChanges = ITSMData.changes.filter(chg =>
            chg.affectedAssets && chg.affectedAssets.includes(assetId)
        );

        let warningMessage = '';
        if (relatedIncidents.length > 0 || relatedChanges.length > 0) {
            warningMessage = `<p style="color: var(--accent-orange); margin-top: var(--spacing-md);">
                <strong>Warning:</strong> This asset has ${relatedIncidents.length} related incident(s) and ${relatedChanges.length} related change(s).
            </p>`;
        }

        const modalContent = `
            <div class="modal-header">
                <span>⚠️ Delete Asset</span>
                <button class="panel-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body" style="min-width: 400px;">
                <p>Are you sure you want to delete asset <strong>${assetId}</strong> (${asset.name})?</p>
                ${warningMessage}
                <div style="margin-top: var(--spacing-md); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <p style="margin-bottom: var(--spacing-sm);"><strong>Choose action:</strong></p>
                    <div class="form-check" style="margin-bottom: var(--spacing-xs);">
                        <input type="radio" name="delete-action" id="action-retire" value="retire" checked>
                        <label for="action-retire">Mark as Retired (recommended)</label>
                    </div>
                    <div class="form-check">
                        <input type="radio" name="delete-action" id="action-delete" value="delete">
                        <label for="action-delete">Permanently delete from CMDB</label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-danger" onclick="AssetsModule.confirmDeleteAsset('${assetId}')">Confirm</button>
            </div>
        `;

        showModal(modalContent);
    },

    /**
     * Confirm and execute delete/retire action
     * @param {string} assetId - Asset ID to delete/retire
     */
    async confirmDeleteAsset(assetId) {
        const action = document.querySelector('input[name="delete-action"]:checked')?.value || 'retire';

        try {
            if (action === 'retire') {
                await ITSMApi.updateAssetStatus(assetId, 'Retired');
                showToast(`Asset ${assetId} marked as Retired`, 'success');
            } else {
                // For permanent delete, set status to Decommissioned (no delete endpoint)
                await ITSMApi.updateAssetStatus(assetId, 'Decommissioned');
                showToast(`Asset ${assetId} permanently deleted`, 'success');
            }

            closeModal();
            if (typeof currentModule !== 'undefined' && currentModule === 'assets') {
                renderModule('assets');
                this.setupAssetSearch();
            }
        } catch (err) {
            showToast('Failed to delete/retire asset: ' + err.message, 'error');
        }
    },

    /**
     * 8. Create incident for a specific asset
     * @param {string} assetId - Asset ID to pre-select
     */
    createIncidentForAsset(assetId) {
        const asset = ITSMData.assets.find(a => a.id === assetId);
        if (!asset) {
            showToast('Asset not found', 'error');
            return;
        }

        const modalContent = `
            <div class="modal-header">
                <span>🎫 Create Incident for Asset: ${assetId}</span>
                <button class="panel-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body" style="width: 550px;">
                <div class="card" style="margin-bottom: var(--spacing-md); background: var(--bg-secondary);">
                    <div class="card-body" style="padding: var(--spacing-sm);">
                        <strong>Asset:</strong> ${asset.name} (${asset.id})<br>
                        <small style="color: var(--text-muted);">${asset.type} | ${asset.location} | Owner: ${asset.owner}</small>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label required">Summary</label>
                    <input type="text" class="form-control" id="asset-inc-summary" placeholder="Brief description of the issue">
                </div>
                <div class="form-group">
                    <label class="form-label required">Description</label>
                    <textarea class="form-control" id="asset-inc-description" rows="4" placeholder="Detailed description of the issue..."></textarea>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <select class="form-control" id="asset-inc-category">
                            <option value="Hardware" ${asset.type === 'Printer' || asset.type === 'Workstation' ? 'selected' : ''}>Hardware</option>
                            <option value="Network" ${asset.type === 'Network' ? 'selected' : ''}>Network</option>
                            <option value="Application">Application</option>
                            <option value="Infrastructure" ${asset.type === 'Server' ? 'selected' : ''}>Infrastructure</option>
                            <option value="Email">Email</option>
                            <option value="Identity">Identity</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Priority</label>
                        <select class="form-control" id="asset-inc-priority">
                            <option value="P3">P3 - Medium</option>
                            <option value="P4">P4 - Low</option>
                            <option value="P2" ${asset.status === 'Error' ? 'selected' : ''}>P2 - High</option>
                            <option value="P1">P1 - Critical</option>
                        </select>
                    </div>
                </div>
                <input type="hidden" id="asset-inc-asset-id" value="${assetId}">
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="AssetsModule.submitIncidentForAsset()">Create Incident</button>
            </div>
        `;

        showModal(modalContent);
    },

    /**
     * Submit incident created for asset
     */
    async submitIncidentForAsset() {
        const title = document.getElementById('asset-inc-summary').value.trim();
        const description = document.getElementById('asset-inc-description').value.trim();
        const category = document.getElementById('asset-inc-category').value;
        const priority = document.getElementById('asset-inc-priority').value;
        const assetId = document.getElementById('asset-inc-asset-id').value;

        if (!title || !description) {
            showToast('Please fill in required fields', 'error');
            return;
        }

        try {
            const result = await ITSMApi.createIncident({
                title, description, category,
                subcategory: 'General',
                impact: 3, urgency: 3,
                assignmentGroup: 'Service Desk',
                configurationItem: assetId
            });
            if (result.success) {
                closeModal();
                showToast(`Incident ${result.data.id} created for asset ${assetId}`, 'success');
            } else {
                showToast(result.error || 'Failed to create incident', 'error');
            }
        } catch (err) {
            showToast('Failed to create incident: ' + err.message, 'error');
        }
    },

    /**
     * 9. Setup event listeners for search and type filter
     */
    setupAssetSearch() {
        const searchInput = document.getElementById('asset-search');
        const typeFilter = document.getElementById('asset-type-filter');

        if (searchInput) {
            // Debounce search for better performance
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const query = e.target.value;
                    const typeValue = typeFilter ? typeFilter.value : '';
                    this.applyFilters(query, typeValue);
                }, 300);
            });
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                const typeValue = e.target.value;
                const searchQuery = searchInput ? searchInput.value : '';
                this.applyFilters(searchQuery, typeValue);
            });
        }
    },

    /**
     * Apply both search and type filters
     * @param {string} searchQuery - Search query string
     * @param {string} typeFilter - Type filter value
     */
    applyFilters(searchQuery, typeFilter) {
        let filteredAssets = ITSMData.assets;

        // Apply type filter
        if (typeFilter && typeFilter !== '') {
            filteredAssets = filteredAssets.filter(asset => asset.type === typeFilter);
        }

        // Apply search filter
        if (searchQuery && searchQuery.trim() !== '') {
            const searchTerm = searchQuery.toLowerCase().trim();
            filteredAssets = filteredAssets.filter(asset => {
                return (
                    asset.id.toLowerCase().includes(searchTerm) ||
                    asset.name.toLowerCase().includes(searchTerm) ||
                    asset.owner.toLowerCase().includes(searchTerm) ||
                    asset.location.toLowerCase().includes(searchTerm)
                );
            });
        }

        // Re-render the table body
        const tableBody = document.getElementById('assets-table-body');
        if (tableBody) {
            tableBody.innerHTML = this.renderAssetsTableBody(filteredAssets);
        }
    },

    /**
     * 10. Get asset picker HTML for use in other forms
     * @param {string} selectedAssetId - Currently selected asset ID (optional)
     * @param {string} inputId - ID for the input element (default: 'asset-picker')
     * @returns {string} - HTML string for asset picker component
     */
    getAssetPicker(selectedAssetId = '', inputId = 'asset-picker') {
        const selectedAsset = selectedAssetId ? ITSMData.assets.find(a => a.id === selectedAssetId) : null;

        return `
            <div class="asset-picker" style="position: relative;">
                <input type="text"
                       class="form-control"
                       id="${inputId}"
                       placeholder="Search assets by ID, name, or owner..."
                       value="${selectedAsset ? `${selectedAsset.id} - ${selectedAsset.name}` : ''}"
                       autocomplete="off">
                <input type="hidden" id="${inputId}-value" value="${selectedAssetId}">
                <div id="${inputId}-dropdown" class="asset-picker-dropdown" style="
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    max-height: 200px;
                    overflow-y: auto;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    z-index: 1000;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                "></div>
            </div>
            <script>
                (function() {
                    const input = document.getElementById('${inputId}');
                    const hiddenInput = document.getElementById('${inputId}-value');
                    const dropdown = document.getElementById('${inputId}-dropdown');

                    input.addEventListener('focus', function() {
                        showAssetDropdown('${inputId}', '');
                    });

                    input.addEventListener('input', function() {
                        showAssetDropdown('${inputId}', this.value);
                    });

                    input.addEventListener('blur', function() {
                        setTimeout(() => dropdown.style.display = 'none', 200);
                    });
                })();
            </script>
        `;
    },

    /**
     * Show asset dropdown with filtered results
     * @param {string} inputId - Input element ID
     * @param {string} query - Search query
     */
    showAssetDropdown(inputId, query) {
        const dropdown = document.getElementById(`${inputId}-dropdown`);
        if (!dropdown) return;

        const filteredAssets = this.searchAssets(query).slice(0, 10); // Limit to 10 results

        if (filteredAssets.length === 0) {
            dropdown.innerHTML = `
                <div style="padding: 10px; color: var(--text-muted); text-align: center;">
                    No assets found
                </div>
            `;
        } else {
            dropdown.innerHTML = filteredAssets.map(asset => {
                const statusInfo = this.assetStatuses[asset.status] || this.assetStatuses['Active'];
                return `
                    <div class="asset-picker-item"
                         style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid var(--border-light);"
                         onmouseover="this.style.background='var(--bg-secondary)'"
                         onmouseout="this.style.background='transparent'"
                         onclick="AssetsModule.selectAssetFromPicker('${inputId}', '${asset.id}')">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>
                                <strong>${asset.id}</strong> - ${asset.name}
                            </span>
                            <span style="color: ${statusInfo.color}; font-size: 10px;">
                                ${statusInfo.icon} ${asset.status}
                            </span>
                        </div>
                        <div style="font-size: 11px; color: var(--text-muted);">
                            ${asset.type} | ${asset.location}
                        </div>
                    </div>
                `;
            }).join('');
        }

        dropdown.style.display = 'block';
    },

    /**
     * Select an asset from the picker dropdown
     * @param {string} inputId - Input element ID
     * @param {string} assetId - Selected asset ID
     */
    selectAssetFromPicker(inputId, assetId) {
        const input = document.getElementById(inputId);
        const hiddenInput = document.getElementById(`${inputId}-value`);
        const dropdown = document.getElementById(`${inputId}-dropdown`);

        const asset = ITSMData.assets.find(a => a.id === assetId);
        if (asset) {
            input.value = `${asset.id} - ${asset.name}`;
            hiddenInput.value = asset.id;
        }

        if (dropdown) {
            dropdown.style.display = 'none';
        }
    },

    // ==================== HELPER FUNCTIONS ====================

    /**
     * Generate next asset ID
     * @returns {string} - Generated asset ID
     */
    generateAssetId() {
        const maxNum = ITSMData.assets.reduce((max, asset) => {
            const match = asset.id.match(/ASSET-(\d+)/);
            if (match) {
                const num = parseInt(match[1]);
                return num > max ? num : max;
            }
            return max;
        }, 0);
        return `ASSET-${String(maxNum + 1).padStart(3, '0')}`;
    },

    /**
     * Generate next incident ID
     * @returns {string} - Generated incident ID
     */
    generateIncidentId() {
        const maxNum = ITSMData.incidents.reduce((max, inc) => {
            const match = inc.id.match(/INC-(\d+)/);
            if (match) {
                const num = parseInt(match[1]);
                return num > max ? num : max;
            }
            return max;
        }, 0);
        return `INC-${String(maxNum + 1).padStart(3, '0')}`;
    },

    /**
     * Calculate SLA target based on priority
     * @param {string} priority - Incident priority
     * @returns {string} - ISO date string for SLA target
     */
    calculateSLATarget(priority) {
        const now = new Date();
        const hours = {
            'P1': 4,
            'P2': 8,
            'P3': 24,
            'P4': 48
        };
        const targetHours = hours[priority] || 24;
        return new Date(now.getTime() + targetHours * 3600000).toISOString();
    },

    /**
     * Format date/time for display
     * @param {string} dateStr - ISO date string
     * @returns {string} - Formatted date string
     */
    formatDateTime(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Render the full Assets page
     * @returns {string} - HTML for the assets page
     */
    renderAssetsPage() {
        return `
            <div class="page-header">
                <div class="page-title"><img class="page-icon" src="icons/desktop.png" alt=""> Assets / CMDB</div>
                <div class="page-subtitle">Configuration Management Database</div>
            </div>
            <div class="toolbar">
                <div class="toolbar-group">
                    <button class="btn btn-primary btn-sm" onclick="AssetsModule.createAsset()">+ New Asset</button>
                </div>
                <div class="toolbar-separator"></div>
                <div class="toolbar-search">
                    <input type="text" placeholder="Search assets..." id="asset-search" style="width: 250px;">
                    <button class="btn btn-sm btn-secondary" onclick="AssetsModule.applyFilters(document.getElementById('asset-search').value, document.getElementById('asset-type-filter').value)">🔍</button>
                </div>
                <div class="toolbar-group" style="margin-left: var(--spacing-md);">
                    <select class="form-control" id="asset-type-filter" style="width: 130px; padding: 4px;">
                        <option value="">All Types</option>
                        ${this.assetTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="page-content">
                ${this.renderAssetsTable(ITSMData.assets)}
            </div>
        `;
    }
};

// Make showAssetDropdown accessible globally for the picker
window.showAssetDropdown = function(inputId, query) {
    AssetsModule.showAssetDropdown(inputId, query);
};

// Export module to window
window.AssetsModule = AssetsModule;
