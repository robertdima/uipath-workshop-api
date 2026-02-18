/**
 * ITSM Console - Linking Module
 * Provides functionality to link incidents to changes, problems, parent incidents, assets, and KB articles
 */

const LinkingModule = {
    // Link types
    linkTypes: {
        change: { label: 'Change Request', icon: '🔄', idPrefix: 'CHG-', dataSource: 'changes' },
        problem: { label: 'Problem', icon: '🔧', idPrefix: 'PRB-', dataSource: 'problems' },
        incident: { label: 'Incident', icon: '🎫', idPrefix: 'INC-', dataSource: 'incidents' },
        asset: { label: 'Asset', icon: '🖥️', idPrefix: '', dataSource: 'assets' },
        kb: { label: 'KB Article', icon: '📚', idPrefix: 'KB-', dataSource: 'knowledgeArticles' }
    },

    /**
     * Initialize linking fields on incident if they don't exist
     * @param {object} incident - The incident object to initialize
     */
    initIncidentLinks: function(incident) {
        if (!incident.linkedChanges) incident.linkedChanges = [];
        if (!incident.linkedProblem) incident.linkedProblem = null;
        if (!incident.parentIncident) incident.parentIncident = null;
        if (!incident.childIncidents) incident.childIncidents = [];
        if (!incident.linkedKB) incident.linkedKB = [];
        if (!incident.linkedAssets) incident.linkedAssets = [];
    },

    /**
     * Link a change request to an incident
     * @param {string} incidentId - The incident ID
     * @param {string} changeId - The change ID to link
     */
    linkChangeToIncident: function(incidentId, changeId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return false;
        }

        const change = ITSMData.changes.find(c => c.id === changeId);
        if (!change) {
            showToast('Change request not found', 'error');
            return false;
        }

        this.initIncidentLinks(incident);

        if (incident.linkedChanges.includes(changeId)) {
            showToast(`${changeId} is already linked to this incident`, 'warning');
            return false;
        }

        incident.linkedChanges.push(changeId);
        incident.updatedAt = new Date().toISOString();

        // Add system note
        const noteEntry = {
            type: 'system',
            author: 'System',
            content: `Change request ${changeId} (${change.title}) linked to incident`,
            timestamp: new Date().toISOString()
        };
        incident.notes.push(noteEntry);

        // Add audit log
        this.addAuditLog('Change Linked', incidentId, `Linked ${changeId}: ${change.title}`);

        showToast(`${changeId} linked to ${incidentId}`, 'success');
        return true;
    },

    /**
     * Unlink a change request from an incident
     * @param {string} incidentId - The incident ID
     * @param {string} changeId - The change ID to unlink
     */
    unlinkChangeFromIncident: function(incidentId, changeId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident || !incident.linkedChanges) return false;

        const index = incident.linkedChanges.indexOf(changeId);
        if (index > -1) {
            incident.linkedChanges.splice(index, 1);
            incident.updatedAt = new Date().toISOString();

            this.addAuditLog('Change Unlinked', incidentId, `Unlinked ${changeId}`);
            showToast(`${changeId} unlinked from incident`, 'success');

            this.refreshRelatedItemsPanel(incidentId);
            return true;
        }
        return false;
    },

    /**
     * Link a problem to an incident
     * @param {string} incidentId - The incident ID
     * @param {string} problemId - The problem ID to link
     */
    linkProblemToIncident: function(incidentId, problemId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return false;
        }

        const problem = ITSMData.problems.find(p => p.id === problemId);
        if (!problem) {
            showToast('Problem not found', 'error');
            return false;
        }

        this.initIncidentLinks(incident);

        if (incident.linkedProblem === problemId) {
            showToast(`${problemId} is already linked to this incident`, 'warning');
            return false;
        }

        // Unlink previous problem if exists
        const previousProblem = incident.linkedProblem;
        incident.linkedProblem = problemId;
        incident.updatedAt = new Date().toISOString();

        // Also update problem's linked incidents
        if (!problem.linkedIncidents) problem.linkedIncidents = [];
        if (!problem.linkedIncidents.includes(incidentId)) {
            problem.linkedIncidents.push(incidentId);
        }

        // Add system note
        const noteEntry = {
            type: 'system',
            author: 'System',
            content: `Problem ${problemId} (${problem.title}) linked to incident`,
            timestamp: new Date().toISOString()
        };
        incident.notes.push(noteEntry);

        this.addAuditLog('Problem Linked', incidentId, `Linked ${problemId}: ${problem.title}${previousProblem ? ` (replaced ${previousProblem})` : ''}`);

        showToast(`${problemId} linked to ${incidentId}`, 'success');
        return true;
    },

    /**
     * Unlink problem from an incident
     * @param {string} incidentId - The incident ID
     */
    unlinkProblemFromIncident: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident || !incident.linkedProblem) return false;

        const problemId = incident.linkedProblem;
        const problem = ITSMData.problems.find(p => p.id === problemId);

        // Remove from problem's linked incidents
        if (problem && problem.linkedIncidents) {
            const idx = problem.linkedIncidents.indexOf(incidentId);
            if (idx > -1) problem.linkedIncidents.splice(idx, 1);
        }

        incident.linkedProblem = null;
        incident.updatedAt = new Date().toISOString();

        this.addAuditLog('Problem Unlinked', incidentId, `Unlinked ${problemId}`);
        showToast(`Problem unlinked from incident`, 'success');

        this.refreshRelatedItemsPanel(incidentId);
        return true;
    },

    /**
     * Set parent incident for an incident
     * @param {string} incidentId - The child incident ID
     * @param {string} parentIncidentId - The parent incident ID
     */
    setParentIncident: function(incidentId, parentIncidentId) {
        if (incidentId === parentIncidentId) {
            showToast('An incident cannot be its own parent', 'error');
            return false;
        }

        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        const parentIncident = ITSMData.incidents.find(i => i.id === parentIncidentId);

        if (!incident) {
            showToast('Incident not found', 'error');
            return false;
        }

        if (!parentIncident) {
            showToast('Parent incident not found', 'error');
            return false;
        }

        // Check for circular reference
        if (this.wouldCreateCircularReference(incidentId, parentIncidentId)) {
            showToast('Cannot create circular parent/child relationship', 'error');
            return false;
        }

        this.initIncidentLinks(incident);
        this.initIncidentLinks(parentIncident);

        // Remove from previous parent's children if exists
        if (incident.parentIncident) {
            const previousParent = ITSMData.incidents.find(i => i.id === incident.parentIncident);
            if (previousParent && previousParent.childIncidents) {
                const idx = previousParent.childIncidents.indexOf(incidentId);
                if (idx > -1) previousParent.childIncidents.splice(idx, 1);
            }
        }

        // Set new parent
        incident.parentIncident = parentIncidentId;
        incident.updatedAt = new Date().toISOString();

        // Add to parent's children
        if (!parentIncident.childIncidents.includes(incidentId)) {
            parentIncident.childIncidents.push(incidentId);
        }

        // Add system note
        const noteEntry = {
            type: 'system',
            author: 'System',
            content: `Set as child of ${parentIncidentId} (${parentIncident.title})`,
            timestamp: new Date().toISOString()
        };
        incident.notes.push(noteEntry);

        this.addAuditLog('Parent Incident Set', incidentId, `Parent set to ${parentIncidentId}`);

        showToast(`${incidentId} linked as child of ${parentIncidentId}`, 'success');
        return true;
    },

    /**
     * Remove parent incident relationship
     * @param {string} incidentId - The child incident ID
     */
    removeParentIncident: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident || !incident.parentIncident) return false;

        const parentId = incident.parentIncident;
        const parentIncident = ITSMData.incidents.find(i => i.id === parentId);

        // Remove from parent's children
        if (parentIncident && parentIncident.childIncidents) {
            const idx = parentIncident.childIncidents.indexOf(incidentId);
            if (idx > -1) parentIncident.childIncidents.splice(idx, 1);
        }

        incident.parentIncident = null;
        incident.updatedAt = new Date().toISOString();

        this.addAuditLog('Parent Incident Removed', incidentId, `Removed parent ${parentId}`);
        showToast('Parent incident relationship removed', 'success');

        this.refreshRelatedItemsPanel(incidentId);
        return true;
    },

    /**
     * Check if setting parent would create circular reference
     * @param {string} childId - Child incident ID
     * @param {string} parentId - Potential parent ID
     * @returns {boolean} True if would create circular reference
     */
    wouldCreateCircularReference: function(childId, parentId) {
        let currentId = parentId;
        const visited = new Set();

        while (currentId) {
            if (visited.has(currentId)) return true;
            if (currentId === childId) return true;

            visited.add(currentId);
            const current = ITSMData.incidents.find(i => i.id === currentId);
            currentId = current && current.parentIncident ? current.parentIncident : null;
        }

        return false;
    },

    /**
     * Link an asset to an incident
     * @param {string} incidentId - The incident ID
     * @param {string} assetId - The asset ID to link
     */
    linkAssetToIncident: function(incidentId, assetId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return false;
        }

        const asset = ITSMData.assets.find(a => a.id === assetId);
        if (!asset) {
            showToast('Asset not found', 'error');
            return false;
        }

        this.initIncidentLinks(incident);

        // Check primary affected asset
        if (incident.affectedAsset === assetId) {
            showToast(`${assetId} is already the primary affected asset`, 'warning');
            return false;
        }

        if (incident.linkedAssets.includes(assetId)) {
            showToast(`${assetId} is already linked to this incident`, 'warning');
            return false;
        }

        incident.linkedAssets.push(assetId);
        incident.updatedAt = new Date().toISOString();

        this.addAuditLog('Asset Linked', incidentId, `Linked asset ${assetId}: ${asset.name}`);
        showToast(`${assetId} linked to ${incidentId}`, 'success');
        return true;
    },

    /**
     * Unlink an asset from an incident
     * @param {string} incidentId - The incident ID
     * @param {string} assetId - The asset ID to unlink
     */
    unlinkAssetFromIncident: function(incidentId, assetId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident || !incident.linkedAssets) return false;

        const index = incident.linkedAssets.indexOf(assetId);
        if (index > -1) {
            incident.linkedAssets.splice(index, 1);
            incident.updatedAt = new Date().toISOString();

            this.addAuditLog('Asset Unlinked', incidentId, `Unlinked asset ${assetId}`);
            showToast(`Asset unlinked from incident`, 'success');

            this.refreshRelatedItemsPanel(incidentId);
            return true;
        }
        return false;
    },

    /**
     * Link a KB article to an incident (wraps existing functionality)
     * @param {string} incidentId - The incident ID
     * @param {string} kbId - The KB article ID
     */
    linkKBToIncident: function(incidentId, kbId) {
        // Use existing IncidentsModule method if available
        if (typeof IncidentsModule !== 'undefined' && IncidentsModule.linkKBToIncident) {
            IncidentsModule.linkKBToIncident(incidentId, kbId);
        } else {
            const incident = ITSMData.incidents.find(i => i.id === incidentId);
            if (!incident) {
                showToast('Incident not found', 'error');
                return false;
            }

            const kb = ITSMData.knowledgeArticles.find(k => k.id === kbId);
            if (!kb) {
                showToast('KB article not found', 'error');
                return false;
            }

            if (!incident.linkedKB) incident.linkedKB = [];

            if (incident.linkedKB.includes(kbId)) {
                showToast(`${kbId} is already linked to this incident`, 'warning');
                return false;
            }

            incident.linkedKB.push(kbId);
            incident.updatedAt = new Date().toISOString();

            this.addAuditLog('KB Article Linked', incidentId, `Linked ${kbId}: ${kb.title}`);
            showToast(`${kbId} linked to ${incidentId}`, 'success');
        }
        return true;
    },

    /**
     * Unlink a KB article from an incident
     * @param {string} incidentId - The incident ID
     * @param {string} kbId - The KB article ID
     */
    unlinkKBFromIncident: function(incidentId, kbId) {
        // Use existing IncidentsModule method if available
        if (typeof IncidentsModule !== 'undefined' && IncidentsModule.unlinkKB) {
            IncidentsModule.unlinkKB(incidentId, kbId);
        } else {
            const incident = ITSMData.incidents.find(i => i.id === incidentId);
            if (!incident || !incident.linkedKB) return false;

            const index = incident.linkedKB.indexOf(kbId);
            if (index > -1) {
                incident.linkedKB.splice(index, 1);
                incident.updatedAt = new Date().toISOString();

                this.addAuditLog('KB Article Unlinked', incidentId, `Unlinked ${kbId}`);
                showToast(`KB article unlinked from incident`, 'success');
            }
        }
        this.refreshRelatedItemsPanel(incidentId);
        return true;
    },

    /**
     * Render the Related Items panel for an incident
     * @param {string} incidentId - The incident ID
     * @returns {string} HTML string for the related items panel
     */
    renderRelatedItemsPanel: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) return '<div class="empty-state"><div class="empty-state-text">Incident not found</div></div>';

        this.initIncidentLinks(incident);

        // Get counts for section headers
        const changeCount = incident.linkedChanges ? incident.linkedChanges.length : 0;
        const problemCount = incident.linkedProblem ? 1 : 0;
        const parentChildCount = (incident.parentIncident ? 1 : 0) + (incident.childIncidents ? incident.childIncidents.length : 0);
        const assetCount = (incident.affectedAsset ? 1 : 0) + (incident.linkedAssets ? incident.linkedAssets.length : 0);
        const kbCount = incident.linkedKB ? incident.linkedKB.length : 0;

        return `
            <div class="related-items-panel">
                <!-- Add Link Button -->
                <div style="margin-bottom: var(--spacing-md);">
                    <button class="btn btn-primary btn-sm" onclick="LinkingModule.showAddLinkModal('${incidentId}')">
                        + Add Link
                    </button>
                </div>

                <!-- Related Changes Section -->
                <div class="related-section" style="margin-bottom: var(--spacing-md);">
                    <div class="related-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
                        <h4 style="margin: 0;">🔄 Related Changes (${changeCount})</h4>
                    </div>
                    ${this.renderLinkedChanges(incident)}
                </div>

                <!-- Related Problem Section -->
                <div class="related-section" style="margin-bottom: var(--spacing-md);">
                    <div class="related-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
                        <h4 style="margin: 0;">🔧 Related Problem (${problemCount})</h4>
                    </div>
                    ${this.renderLinkedProblem(incident)}
                </div>

                <!-- Parent/Child Incidents Section -->
                <div class="related-section" style="margin-bottom: var(--spacing-md);">
                    <div class="related-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
                        <h4 style="margin: 0;">🎫 Parent/Child Incidents (${parentChildCount})</h4>
                    </div>
                    ${this.renderParentChildIncidents(incident)}
                </div>

                <!-- Linked Assets Section -->
                <div class="related-section" style="margin-bottom: var(--spacing-md);">
                    <div class="related-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
                        <h4 style="margin: 0;">🖥️ Linked Assets (${assetCount})</h4>
                    </div>
                    ${this.renderLinkedAssets(incident)}
                </div>

                <!-- Linked KB Articles Section -->
                <div class="related-section">
                    <div class="related-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
                        <h4 style="margin: 0;">📚 Linked KB Articles (${kbCount})</h4>
                    </div>
                    ${this.renderLinkedKBArticles(incident)}
                </div>
            </div>
        `;
    },

    /**
     * Render linked changes section
     * @param {object} incident - The incident object
     * @returns {string} HTML string
     */
    renderLinkedChanges: function(incident) {
        if (!incident.linkedChanges || incident.linkedChanges.length === 0) {
            return '<div style="color: var(--text-muted); font-size: 12px; padding: var(--spacing-sm); background: var(--bg-secondary); border-radius: 4px;">No linked changes</div>';
        }

        return incident.linkedChanges.map(changeId => {
            const change = ITSMData.changes.find(c => c.id === changeId);
            if (!change) return '';

            const statusClass = this.getStatusBadgeClass(change.status);
            return `
                <div class="linked-item card" style="margin-bottom: var(--spacing-xs);">
                    <div class="card-body" style="padding: var(--spacing-sm); display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <div>
                                <strong style="color: var(--accent-blue); cursor: pointer;" onclick="ChangesModule.viewChange('${change.id}')">${change.id}</strong>
                                <span class="badge ${statusClass}" style="margin-left: var(--spacing-xs);">${change.status}</span>
                            </div>
                            <div style="font-size: 11px; color: var(--text-muted);">${change.title}</div>
                        </div>
                        <button class="btn btn-sm btn-danger" onclick="LinkingModule.unlinkChangeFromIncident('${incident.id}', '${change.id}')" title="Remove link">×</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Render linked problem section
     * @param {object} incident - The incident object
     * @returns {string} HTML string
     */
    renderLinkedProblem: function(incident) {
        if (!incident.linkedProblem) {
            return '<div style="color: var(--text-muted); font-size: 12px; padding: var(--spacing-sm); background: var(--bg-secondary); border-radius: 4px;">No linked problem</div>';
        }

        const problem = ITSMData.problems.find(p => p.id === incident.linkedProblem);
        if (!problem) {
            return '<div style="color: var(--text-muted); font-size: 12px; padding: var(--spacing-sm); background: var(--bg-secondary); border-radius: 4px;">Problem not found</div>';
        }

        const statusClass = this.getProblemStatusBadgeClass(problem.status);
        return `
            <div class="linked-item card">
                <div class="card-body" style="padding: var(--spacing-sm); display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <div>
                            <strong style="color: var(--accent-blue); cursor: pointer;" onclick="LinkingModule.viewProblem('${problem.id}')">${problem.id}</strong>
                            <span class="badge ${statusClass}" style="margin-left: var(--spacing-xs);">${problem.status}</span>
                        </div>
                        <div style="font-size: 11px; color: var(--text-muted);">${problem.title}</div>
                        ${problem.workaround ? `<div style="font-size: 10px; color: var(--accent-orange); margin-top: 2px;">Workaround available</div>` : ''}
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="LinkingModule.unlinkProblemFromIncident('${incident.id}')" title="Remove link">×</button>
                </div>
            </div>
        `;
    },

    /**
     * Render parent/child incidents section
     * @param {object} incident - The incident object
     * @returns {string} HTML string
     */
    renderParentChildIncidents: function(incident) {
        let html = '';
        let hasContent = false;

        // Parent incident
        if (incident.parentIncident) {
            hasContent = true;
            const parent = ITSMData.incidents.find(i => i.id === incident.parentIncident);
            if (parent) {
                html += `
                    <div class="linked-item card" style="margin-bottom: var(--spacing-xs);">
                        <div class="card-body" style="padding: var(--spacing-sm); display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <div>
                                    <span style="color: var(--text-muted); font-size: 10px;">PARENT:</span>
                                    <strong style="color: var(--accent-blue); cursor: pointer; margin-left: var(--spacing-xs);" onclick="selectIncident('${parent.id}')">${parent.id}</strong>
                                    <span class="badge badge-${parent.status.toLowerCase().replace(' ', '-')}" style="margin-left: var(--spacing-xs);">${parent.status}</span>
                                </div>
                                <div style="font-size: 11px; color: var(--text-muted);">${parent.title}</div>
                            </div>
                            <button class="btn btn-sm btn-danger" onclick="LinkingModule.removeParentIncident('${incident.id}')" title="Remove parent">×</button>
                        </div>
                    </div>
                `;
            }
        }

        // Child incidents
        if (incident.childIncidents && incident.childIncidents.length > 0) {
            hasContent = true;
            incident.childIncidents.forEach(childId => {
                const child = ITSMData.incidents.find(i => i.id === childId);
                if (child) {
                    html += `
                        <div class="linked-item card" style="margin-bottom: var(--spacing-xs);">
                            <div class="card-body" style="padding: var(--spacing-sm); display: flex; justify-content: space-between; align-items: center;">
                                <div style="flex: 1;">
                                    <div>
                                        <span style="color: var(--text-muted); font-size: 10px;">CHILD:</span>
                                        <strong style="color: var(--accent-blue); cursor: pointer; margin-left: var(--spacing-xs);" onclick="selectIncident('${child.id}')">${child.id}</strong>
                                        <span class="badge badge-${child.status.toLowerCase().replace(' ', '-')}" style="margin-left: var(--spacing-xs);">${child.status}</span>
                                    </div>
                                    <div style="font-size: 11px; color: var(--text-muted);">${child.title}</div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            });
        }

        if (!hasContent) {
            return '<div style="color: var(--text-muted); font-size: 12px; padding: var(--spacing-sm); background: var(--bg-secondary); border-radius: 4px;">No parent/child relationships</div>';
        }

        return html;
    },

    /**
     * Render linked assets section
     * @param {object} incident - The incident object
     * @returns {string} HTML string
     */
    renderLinkedAssets: function(incident) {
        let html = '';
        let hasContent = false;

        // Primary affected asset
        if (incident.affectedAsset) {
            hasContent = true;
            const asset = ITSMData.assets.find(a => a.id === incident.affectedAsset);
            if (asset) {
                const statusColor = this.getAssetStatusColor(asset.status);
                html += `
                    <div class="linked-item card" style="margin-bottom: var(--spacing-xs);">
                        <div class="card-body" style="padding: var(--spacing-sm); display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <div>
                                    <span style="color: var(--text-muted); font-size: 10px;">PRIMARY:</span>
                                    <strong style="color: var(--accent-blue); cursor: pointer; margin-left: var(--spacing-xs);" onclick="AssetsModule.viewAsset('${asset.id}')">${asset.id}</strong>
                                    <span style="color: ${statusColor}; margin-left: var(--spacing-xs);">● ${asset.status}</span>
                                </div>
                                <div style="font-size: 11px; color: var(--text-muted);">${asset.name} (${asset.type})</div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        // Additional linked assets
        if (incident.linkedAssets && incident.linkedAssets.length > 0) {
            hasContent = true;
            incident.linkedAssets.forEach(assetId => {
                const asset = ITSMData.assets.find(a => a.id === assetId);
                if (asset) {
                    const statusColor = this.getAssetStatusColor(asset.status);
                    html += `
                        <div class="linked-item card" style="margin-bottom: var(--spacing-xs);">
                            <div class="card-body" style="padding: var(--spacing-sm); display: flex; justify-content: space-between; align-items: center;">
                                <div style="flex: 1;">
                                    <div>
                                        <strong style="color: var(--accent-blue); cursor: pointer;" onclick="AssetsModule.viewAsset('${asset.id}')">${asset.id}</strong>
                                        <span style="color: ${statusColor}; margin-left: var(--spacing-xs);">● ${asset.status}</span>
                                    </div>
                                    <div style="font-size: 11px; color: var(--text-muted);">${asset.name} (${asset.type})</div>
                                </div>
                                <button class="btn btn-sm btn-danger" onclick="LinkingModule.unlinkAssetFromIncident('${incident.id}', '${asset.id}')" title="Remove link">×</button>
                            </div>
                        </div>
                    `;
                }
            });
        }

        if (!hasContent) {
            return '<div style="color: var(--text-muted); font-size: 12px; padding: var(--spacing-sm); background: var(--bg-secondary); border-radius: 4px;">No linked assets</div>';
        }

        return html;
    },

    /**
     * Render linked KB articles section
     * @param {object} incident - The incident object
     * @returns {string} HTML string
     */
    renderLinkedKBArticles: function(incident) {
        if (!incident.linkedKB || incident.linkedKB.length === 0) {
            return '<div style="color: var(--text-muted); font-size: 12px; padding: var(--spacing-sm); background: var(--bg-secondary); border-radius: 4px;">No linked KB articles</div>';
        }

        return incident.linkedKB.map(kbId => {
            const kb = ITSMData.knowledgeArticles.find(k => k.id === kbId);
            if (!kb) return '';

            return `
                <div class="linked-item card" style="margin-bottom: var(--spacing-xs);">
                    <div class="card-body" style="padding: var(--spacing-sm); display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <div>
                                <strong style="color: var(--accent-blue); cursor: pointer;" onclick="KnowledgeModule.viewKBArticle('${kb.id}')">${kb.id}</strong>
                                <span class="badge badge-${kb.status === 'Published' ? 'resolved' : 'pending'}" style="margin-left: var(--spacing-xs);">${kb.status}</span>
                            </div>
                            <div style="font-size: 11px; color: var(--text-muted);">${kb.title}</div>
                        </div>
                        <button class="btn btn-sm btn-danger" onclick="LinkingModule.unlinkKBFromIncident('${incident.id}', '${kb.id}')" title="Remove link">×</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Show modal to add a new link
     * @param {string} incidentId - The incident ID
     */
    showAddLinkModal: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) {
            showToast('Incident not found', 'error');
            return;
        }

        showModal(`
            <div class="modal-header">
                <span>🔗 Add Link to ${incidentId}</span>
                <button class="panel-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body" style="width: 600px; max-height: 70vh; overflow-y: auto;">
                <!-- Link Type Selection -->
                <div class="form-group">
                    <label class="form-label">Link Type</label>
                    <select class="form-control" id="link-type-select" onchange="LinkingModule.onLinkTypeChange('${incidentId}')">
                        <option value="">-- Select Type --</option>
                        <option value="change">🔄 Change Request</option>
                        <option value="problem">🔧 Problem</option>
                        <option value="incident">🎫 Parent Incident</option>
                        <option value="asset">🖥️ Asset</option>
                        <option value="kb">📚 KB Article</option>
                    </select>
                </div>

                <!-- Search Section -->
                <div id="link-search-section" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">Search</label>
                        <div style="display: flex; gap: var(--spacing-sm);">
                            <input type="text" class="form-control" id="link-search-input" placeholder="Search by ID or title..." style="flex: 1;" onkeyup="LinkingModule.performLinkSearch('${incidentId}')">
                            <button class="btn btn-primary" onclick="LinkingModule.performLinkSearch('${incidentId}')">Search</button>
                        </div>
                    </div>

                    <!-- Search Results -->
                    <div id="link-search-results" style="max-height: 300px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-secondary);">
                        <div style="padding: var(--spacing-md); color: var(--text-muted); text-align: center;">
                            Select a link type and search to find items
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        `);
    },

    /**
     * Handle link type selection change
     * @param {string} incidentId - The incident ID
     */
    onLinkTypeChange: function(incidentId) {
        const linkType = document.getElementById('link-type-select').value;
        const searchSection = document.getElementById('link-search-section');
        const searchInput = document.getElementById('link-search-input');
        const resultsContainer = document.getElementById('link-search-results');

        if (!linkType) {
            searchSection.style.display = 'none';
            return;
        }

        searchSection.style.display = 'block';
        searchInput.value = '';
        searchInput.focus();

        // Show suggested items based on type
        this.showSuggestedItems(incidentId, linkType, resultsContainer);
    },

    /**
     * Show suggested items for linking
     * @param {string} incidentId - The incident ID
     * @param {string} linkType - The link type
     * @param {HTMLElement} container - Results container
     */
    showSuggestedItems: function(incidentId, linkType, container) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) return;

        this.initIncidentLinks(incident);

        let items = [];
        let renderFn;

        switch (linkType) {
            case 'change':
                items = ITSMData.changes.filter(c => !incident.linkedChanges.includes(c.id)).slice(0, 10);
                renderFn = (item) => this.renderChangeLinkItem(incidentId, item);
                break;
            case 'problem':
                items = ITSMData.problems.filter(p => p.id !== incident.linkedProblem).slice(0, 10);
                renderFn = (item) => this.renderProblemLinkItem(incidentId, item);
                break;
            case 'incident':
                items = ITSMData.incidents.filter(i =>
                    i.id !== incidentId &&
                    i.id !== incident.parentIncident &&
                    !this.wouldCreateCircularReference(incidentId, i.id)
                ).slice(0, 10);
                renderFn = (item) => this.renderIncidentLinkItem(incidentId, item);
                break;
            case 'asset':
                const existingAssets = [incident.affectedAsset, ...(incident.linkedAssets || [])].filter(Boolean);
                items = ITSMData.assets.filter(a => !existingAssets.includes(a.id)).slice(0, 10);
                renderFn = (item) => this.renderAssetLinkItem(incidentId, item);
                break;
            case 'kb':
                items = ITSMData.knowledgeArticles.filter(k => !incident.linkedKB.includes(k.id)).slice(0, 10);
                renderFn = (item) => this.renderKBLinkItem(incidentId, item);
                break;
        }

        if (items.length === 0) {
            container.innerHTML = '<div style="padding: var(--spacing-md); color: var(--text-muted); text-align: center;">No available items to link</div>';
            return;
        }

        container.innerHTML = items.map(renderFn).join('');
    },

    /**
     * Perform search for items to link
     * @param {string} incidentId - The incident ID
     */
    performLinkSearch: function(incidentId) {
        const linkType = document.getElementById('link-type-select').value;
        const searchTerm = document.getElementById('link-search-input').value.toLowerCase().trim();
        const container = document.getElementById('link-search-results');

        if (!linkType) return;

        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) return;

        this.initIncidentLinks(incident);

        let items = [];
        let renderFn;

        switch (linkType) {
            case 'change':
                items = ITSMData.changes.filter(c =>
                    !incident.linkedChanges.includes(c.id) &&
                    (c.id.toLowerCase().includes(searchTerm) || c.title.toLowerCase().includes(searchTerm))
                );
                renderFn = (item) => this.renderChangeLinkItem(incidentId, item);
                break;
            case 'problem':
                items = ITSMData.problems.filter(p =>
                    p.id !== incident.linkedProblem &&
                    (p.id.toLowerCase().includes(searchTerm) || p.title.toLowerCase().includes(searchTerm))
                );
                renderFn = (item) => this.renderProblemLinkItem(incidentId, item);
                break;
            case 'incident':
                items = ITSMData.incidents.filter(i =>
                    i.id !== incidentId &&
                    i.id !== incident.parentIncident &&
                    !this.wouldCreateCircularReference(incidentId, i.id) &&
                    (i.id.toLowerCase().includes(searchTerm) || i.title.toLowerCase().includes(searchTerm))
                );
                renderFn = (item) => this.renderIncidentLinkItem(incidentId, item);
                break;
            case 'asset':
                const existingAssets = [incident.affectedAsset, ...(incident.linkedAssets || [])].filter(Boolean);
                items = ITSMData.assets.filter(a =>
                    !existingAssets.includes(a.id) &&
                    (a.id.toLowerCase().includes(searchTerm) || a.name.toLowerCase().includes(searchTerm))
                );
                renderFn = (item) => this.renderAssetLinkItem(incidentId, item);
                break;
            case 'kb':
                items = ITSMData.knowledgeArticles.filter(k =>
                    !incident.linkedKB.includes(k.id) &&
                    (k.id.toLowerCase().includes(searchTerm) || k.title.toLowerCase().includes(searchTerm) ||
                     k.tags.some(t => t.toLowerCase().includes(searchTerm)))
                );
                renderFn = (item) => this.renderKBLinkItem(incidentId, item);
                break;
        }

        if (items.length === 0) {
            container.innerHTML = '<div style="padding: var(--spacing-md); color: var(--text-muted); text-align: center;">No matching items found</div>';
            return;
        }

        container.innerHTML = items.slice(0, 20).map(renderFn).join('');
    },

    /**
     * Render change link item
     */
    renderChangeLinkItem: function(incidentId, change) {
        const statusClass = this.getStatusBadgeClass(change.status);
        return `
            <div class="link-search-item" style="padding: var(--spacing-sm); border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
                 onmouseover="this.style.background='var(--bg-tertiary)'"
                 onmouseout="this.style.background='transparent'">
                <div style="flex: 1;">
                    <div>
                        <strong>${change.id}</strong>
                        <span class="badge ${statusClass}" style="margin-left: var(--spacing-xs);">${change.status}</span>
                        <span class="badge ${change.type === 'Emergency' ? 'badge-critical' : 'badge-new'}" style="margin-left: var(--spacing-xs);">${change.type}</span>
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted);">${change.title}</div>
                </div>
                <button class="btn btn-sm btn-primary" onclick="LinkingModule.addLink('${incidentId}', 'change', '${change.id}')">Link</button>
            </div>
        `;
    },

    /**
     * Render problem link item
     */
    renderProblemLinkItem: function(incidentId, problem) {
        const statusClass = this.getProblemStatusBadgeClass(problem.status);
        return `
            <div class="link-search-item" style="padding: var(--spacing-sm); border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
                 onmouseover="this.style.background='var(--bg-tertiary)'"
                 onmouseout="this.style.background='transparent'">
                <div style="flex: 1;">
                    <div>
                        <strong>${problem.id}</strong>
                        <span class="badge ${statusClass}" style="margin-left: var(--spacing-xs);">${problem.status}</span>
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted);">${problem.title}</div>
                    ${problem.workaround ? '<div style="font-size: 10px; color: var(--accent-orange);">Workaround available</div>' : ''}
                </div>
                <button class="btn btn-sm btn-primary" onclick="LinkingModule.addLink('${incidentId}', 'problem', '${problem.id}')">Link</button>
            </div>
        `;
    },

    /**
     * Render incident link item (for parent)
     */
    renderIncidentLinkItem: function(incidentId, incident) {
        return `
            <div class="link-search-item" style="padding: var(--spacing-sm); border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
                 onmouseover="this.style.background='var(--bg-tertiary)'"
                 onmouseout="this.style.background='transparent'">
                <div style="flex: 1;">
                    <div>
                        <strong>${incident.id}</strong>
                        <span class="badge badge-${incident.status.toLowerCase().replace(' ', '-')}" style="margin-left: var(--spacing-xs);">${incident.status}</span>
                        <span class="badge priority-${incident.priority.toLowerCase()}" style="margin-left: var(--spacing-xs);">${incident.priority}</span>
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted);">${incident.title}</div>
                </div>
                <button class="btn btn-sm btn-primary" onclick="LinkingModule.addLink('${incidentId}', 'incident', '${incident.id}')">Set as Parent</button>
            </div>
        `;
    },

    /**
     * Render asset link item
     */
    renderAssetLinkItem: function(incidentId, asset) {
        const statusColor = this.getAssetStatusColor(asset.status);
        return `
            <div class="link-search-item" style="padding: var(--spacing-sm); border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
                 onmouseover="this.style.background='var(--bg-tertiary)'"
                 onmouseout="this.style.background='transparent'">
                <div style="flex: 1;">
                    <div>
                        <strong>${asset.id}</strong>
                        <span style="color: ${statusColor}; margin-left: var(--spacing-xs);">● ${asset.status}</span>
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted);">${asset.name} (${asset.type}) - ${asset.location}</div>
                </div>
                <button class="btn btn-sm btn-primary" onclick="LinkingModule.addLink('${incidentId}', 'asset', '${asset.id}')">Link</button>
            </div>
        `;
    },

    /**
     * Render KB article link item
     */
    renderKBLinkItem: function(incidentId, kb) {
        return `
            <div class="link-search-item" style="padding: var(--spacing-sm); border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
                 onmouseover="this.style.background='var(--bg-tertiary)'"
                 onmouseout="this.style.background='transparent'">
                <div style="flex: 1;">
                    <div>
                        <strong>${kb.id}</strong>
                        <span class="badge badge-${kb.status === 'Published' ? 'resolved' : 'pending'}" style="margin-left: var(--spacing-xs);">${kb.status}</span>
                        <span style="color: var(--text-muted); font-size: 10px; margin-left: var(--spacing-xs);">👁 ${kb.views} | 👍 ${kb.helpful}%</span>
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted);">${kb.title}</div>
                    <div style="margin-top: 2px;">
                        ${kb.tags.slice(0, 3).map(tag => `<span class="badge badge-new" style="font-size: 9px; margin-right: 2px;">${tag}</span>`).join('')}
                    </div>
                </div>
                <button class="btn btn-sm btn-primary" onclick="LinkingModule.addLink('${incidentId}', 'kb', '${kb.id}')">Link</button>
            </div>
        `;
    },

    /**
     * Add a link from the search modal
     * @param {string} incidentId - The incident ID
     * @param {string} linkType - The link type
     * @param {string} targetId - The target item ID
     */
    addLink: function(incidentId, linkType, targetId) {
        let success = false;

        switch (linkType) {
            case 'change':
                success = this.linkChangeToIncident(incidentId, targetId);
                break;
            case 'problem':
                success = this.linkProblemToIncident(incidentId, targetId);
                break;
            case 'incident':
                success = this.setParentIncident(incidentId, targetId);
                break;
            case 'asset':
                success = this.linkAssetToIncident(incidentId, targetId);
                break;
            case 'kb':
                success = this.linkKBToIncident(incidentId, targetId);
                break;
        }

        if (success) {
            closeModal();
            this.refreshRelatedItemsPanel(incidentId);
        }
    },

    /**
     * Refresh the related items panel
     * @param {string} incidentId - The incident ID
     */
    refreshRelatedItemsPanel: function(incidentId) {
        const container = document.getElementById('tab-related');
        if (container) {
            container.innerHTML = this.renderRelatedItemsPanel(incidentId);
        }
    },

    /**
     * View problem details modal
     * @param {string} problemId - The problem ID
     */
    viewProblem: function(problemId) {
        const problem = ITSMData.problems.find(p => p.id === problemId);
        if (!problem) {
            showToast('Problem not found', 'error');
            return;
        }

        const statusClass = this.getProblemStatusBadgeClass(problem.status);

        showModal(`
            <div class="modal-header">
                <span>🔧 Problem Details: ${problem.id}</span>
                <button class="panel-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body" style="width: 650px; max-height: 70vh; overflow-y: auto;">
                <div style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-md); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div>
                        <strong>Status:</strong>
                        <span class="badge ${statusClass}">${problem.status}</span>
                    </div>
                    <div>
                        <strong>Priority:</strong>
                        <span class="badge priority-${problem.priority.toLowerCase()}">${problem.priority}</span>
                    </div>
                    <div>
                        <strong>Category:</strong> ${problem.category}
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Title</label>
                    <div style="font-weight: 600;">${problem.title}</div>
                </div>

                <div class="form-group">
                    <label class="form-label">Description</label>
                    <div style="padding: var(--spacing-sm); background: var(--bg-secondary); border-radius: 4px;">${problem.description}</div>
                </div>

                ${problem.rootCause ? `
                <div class="form-group">
                    <label class="form-label" style="color: var(--accent-green);">Root Cause (Identified)</label>
                    <div style="padding: var(--spacing-sm); background: rgba(var(--green-rgb), 0.1); border: 1px solid var(--accent-green); border-radius: 4px;">${problem.rootCause}</div>
                </div>
                ` : ''}

                ${problem.workaround ? `
                <div class="form-group">
                    <label class="form-label" style="color: var(--accent-orange);">Workaround</label>
                    <div style="padding: var(--spacing-sm); background: rgba(var(--orange-rgb), 0.1); border: 1px solid var(--accent-orange); border-radius: 4px;">${problem.workaround}</div>
                </div>
                ` : ''}

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <div class="form-group">
                        <label class="form-label">Assigned To</label>
                        <div>${problem.assignedTo}</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Assignee</label>
                        <div>${problem.assignee || 'Not assigned'}</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Created</label>
                        <div>${this.formatDateTime(problem.createdAt)}</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Updated</label>
                        <div>${this.formatDateTime(problem.updatedAt)}</div>
                    </div>
                </div>

                ${problem.linkedIncidents && problem.linkedIncidents.length > 0 ? `
                <div class="form-group">
                    <label class="form-label">Linked Incidents (${problem.linkedIncidents.length})</label>
                    <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-xs);">
                        ${problem.linkedIncidents.map(incId => `
                            <span class="badge badge-new" style="cursor: pointer;" onclick="closeModal(); selectIncident('${incId}');">${incId}</span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
            </div>
        `);
    },

    // ==================== HELPER FUNCTIONS ====================

    /**
     * Get status badge class for changes
     * @param {string} status - Change status
     * @returns {string} Badge class
     */
    getStatusBadgeClass: function(status) {
        const statusClasses = {
            'Draft': 'badge-new',
            'Pending Approval': 'badge-pending',
            'Approved': 'badge-open',
            'Scheduled': 'badge-in-progress',
            'Implementing': 'badge-in-progress',
            'Implemented': 'badge-resolved',
            'Cancelled': 'badge-closed',
            'Rejected': 'badge-critical',
            'Failed': 'badge-critical'
        };
        return statusClasses[status] || 'badge-new';
    },

    /**
     * Get status badge class for problems
     * @param {string} status - Problem status
     * @returns {string} Badge class
     */
    getProblemStatusBadgeClass: function(status) {
        const statusClasses = {
            'New': 'badge-new',
            'Under Investigation': 'badge-in-progress',
            'Known Error': 'badge-pending',
            'Resolved': 'badge-resolved',
            'Closed': 'badge-closed'
        };
        return statusClasses[status] || 'badge-new';
    },

    /**
     * Get asset status color
     * @param {string} status - Asset status
     * @returns {string} Color value
     */
    getAssetStatusColor: function(status) {
        const colors = {
            'Active': 'var(--accent-green)',
            'Warning': 'var(--accent-orange)',
            'Error': 'var(--accent-red)',
            'Maintenance': 'var(--accent-blue)',
            'Retired': 'var(--text-muted)'
        };
        return colors[status] || 'var(--text-muted)';
    },

    /**
     * Format datetime for display
     * @param {string} dateStr - ISO date string
     * @returns {string} Formatted date string
     */
    formatDateTime: function(dateStr) {
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
     * Add audit log entry
     * @param {string} action - Action performed
     * @param {string} target - Target ID
     * @param {string} details - Details of the action
     */
    addAuditLog: function(action, target, details) {
        // Audit logging handled server-side
    },

    /**
     * Get all links for an incident (useful for export/reporting)
     * @param {string} incidentId - The incident ID
     * @returns {object} Object containing all links
     */
    getAllLinks: function(incidentId) {
        const incident = ITSMData.incidents.find(i => i.id === incidentId);
        if (!incident) return null;

        this.initIncidentLinks(incident);

        return {
            linkedChanges: incident.linkedChanges || [],
            linkedProblem: incident.linkedProblem || null,
            parentIncident: incident.parentIncident || null,
            childIncidents: incident.childIncidents || [],
            linkedAssets: [incident.affectedAsset, ...(incident.linkedAssets || [])].filter(Boolean),
            linkedKB: incident.linkedKB || []
        };
    }
};

// Export to window
window.LinkingModule = LinkingModule;
