/**
 * ITSM Console - API Service Layer
 * Centralizes all HTTP calls to the backend API.
 * Populates ITSMData (local cache) from API responses.
 * Falls back to hardcoded data.js if API is unreachable.
 */

const ITSMApi = (() => {
    const BASE_URL = ''; // same-origin

    // Map frontend ITSMData keys -> json-server collection routes
    const COLLECTION_MAP = {
        incidents:         '/itsm_incidents',
        changes:           '/itsm_changes',
        serviceRequests:   '/itsm_requests',
        problems:          '/itsm_problems',
        assets:            '/itsm_assets',
        knowledgeArticles: '/itsm_knowledge',
        catalogItems:      '/itsm_catalog',
        teams:             '/itsm_teams',
        technicians:       '/itsm_technicians',
        customers:         '/itsm_customers',
        notifications:     '/itsm_notifications',
        auditLog:          '/itsm_audit_log',
        policies:          '/itsm_policies',
        runbooks:          '/itsm_runbooks',
        slaConfigs:        '/itsm_sla_configs',
        emailTemplates:    '/itsm_email_templates'
    };

    // ─── HTTP helpers ───

    async function _fetch(url, options = {}) {
        const opts = {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        };
        try {
            const res = await fetch(BASE_URL + url, opts);
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                const msg = body.error || body.message || `HTTP ${res.status}`;
                throw new Error(msg);
            }
            return await res.json();
        } catch (err) {
            if (err.message && !err.message.startsWith('HTTP')) {
                // network error or parse error
                console.error(`[ITSMApi] ${opts.method || 'GET'} ${url}:`, err.message);
            }
            throw err;
        }
    }

    function _get(url)            { return _fetch(url); }
    function _post(url, data)     { return _fetch(url, { method: 'POST', body: JSON.stringify(data) }); }
    function _patch(url, data)    { return _fetch(url, { method: 'PATCH', body: JSON.stringify(data) }); }
    function _put(url, data)      { return _fetch(url, { method: 'PUT', body: JSON.stringify(data) }); }

    // ─── Collection loading ───

    async function loadAll() {
        try {
            const keys = Object.keys(COLLECTION_MAP);
            const results = await Promise.all(
                keys.map(key => _get(COLLECTION_MAP[key]).catch(() => null))
            );

            let loaded = 0;
            keys.forEach((key, i) => {
                if (results[i] !== null) {
                    ITSMData[key] = results[i];
                    loaded++;
                }
            });

            // Load dashboard stats and merge into ITSMData.dashboardStats
            try {
                const dashRes = await _get('/api/itsm/dashboard/stats');
                if (dashRes.success && dashRes.data) {
                    mergeDashboardStats(dashRes.data);
                }
            } catch (_) {
                // compute from loaded data instead
                computeDashboardStats();
            }

            console.log(`[ITSMApi] Loaded ${loaded}/${keys.length} collections from API`);
            return loaded > 0;
        } catch (err) {
            console.warn('[ITSMApi] loadAll failed, using offline data:', err.message);
            return false;
        }
    }

    async function loadCollection(key) {
        const route = COLLECTION_MAP[key];
        if (!route) { console.warn(`[ITSMApi] Unknown collection: ${key}`); return false; }
        try {
            const data = await _get(route);
            ITSMData[key] = data;
            return true;
        } catch (err) {
            console.warn(`[ITSMApi] Failed to load ${key}:`, err.message);
            return false;
        }
    }

    function mergeDashboardStats(apiStats) {
        const stats = ITSMData.dashboardStats;
        if (apiStats.incidents) {
            stats.incidents.open = apiStats.incidents.open;
            stats.incidents.total = apiStats.incidents.total;
            if (apiStats.incidents.byPriority) {
                stats.incidents.byPriority = apiStats.incidents.byPriority;
            } else if (apiStats.incidents.p1 !== undefined) {
                stats.incidents.byPriority = stats.incidents.byPriority || {};
                stats.incidents.byPriority.P1 = apiStats.incidents.p1;
            }
            if (apiStats.incidents.slaCompliance !== undefined) {
                stats.incidents.slaCompliance = apiStats.incidents.slaCompliance;
            }
            if (apiStats.incidents.avgResolutionTime !== undefined) {
                stats.incidents.avgResolutionTime = apiStats.incidents.avgResolutionTime;
            }
        }
        if (apiStats.changes) {
            stats.changes.pending = apiStats.changes.pending;
            stats.changes.scheduled = apiStats.changes.scheduled;
            stats.changes.total = apiStats.changes.total;
            if (apiStats.changes.successRate !== undefined) {
                stats.changes.successRate = apiStats.changes.successRate;
            }
        }
        if (apiStats.requests) {
            stats.requests = stats.requests || {};
            stats.requests.open = apiStats.requests.open;
            stats.requests.pendingApproval = apiStats.requests.pendingApproval;
            stats.requests.total = apiStats.requests.total;
        }
        if (apiStats.problems) {
            stats.problems = stats.problems || {};
            stats.problems.open = apiStats.problems.open;
            stats.problems.knownErrors = apiStats.problems.knownErrors;
            stats.problems.total = apiStats.problems.total;
        }
        if (apiStats.assets) {
            stats.assets.total = apiStats.assets.total;
            stats.assets.active = apiStats.assets.active;
            stats.assets.warning = apiStats.assets.warning || 0;
            stats.assets.error = apiStats.assets.error || 0;
        }
    }

    function computeDashboardStats() {
        const stats = ITSMData.dashboardStats;
        const incs = ITSMData.incidents || [];
        stats.incidents.open = incs.filter(i => !['Resolved', 'Closed'].includes(i.status)).length;
        stats.incidents.total = incs.length;
        const byP = {};
        incs.forEach(i => { byP[i.priority] = (byP[i.priority] || 0) + 1; });
        stats.incidents.byPriority = byP;

        const chgs = ITSMData.changes || [];
        stats.changes.pending = chgs.filter(c => c.status === 'Pending Approval').length;
        stats.changes.scheduled = chgs.filter(c => c.status === 'Scheduled').length;
        stats.changes.total = chgs.length;

        const reqs = ITSMData.serviceRequests || [];
        stats.requests = stats.requests || {};
        stats.requests.open = reqs.filter(r => !['Fulfilled', 'Closed', 'Cancelled', 'Rejected'].includes(r.status)).length;
        stats.requests.pendingApproval = reqs.filter(r => r.status === 'Pending Approval').length;
        stats.requests.total = reqs.length;

        const assets = ITSMData.assets || [];
        stats.assets.total = assets.length;
        stats.assets.active = assets.filter(a => a.status === 'Active').length;
        stats.assets.warning = assets.filter(a => a.status === 'Warning').length;
        stats.assets.error = assets.filter(a => a.status === 'Error').length;
    }

    // ─── Incidents ───

    async function createIncident(data) {
        const payload = {
            summary: data.summary,
            description: data.description,
            callerEmail: data.callerEmail,
            callerName: data.callerName,
            callerPhone: data.callerPhone,
            callerDepartment: data.callerDepartment,
            callerLocation: data.callerLocation || data.location,
            callerVip: data.callerVip || data.isVip || false,
            openedBy: ITSMData.currentUser.username,
            openedByName: ITSMData.currentUser.name,
            contactType: data.contactType || 'phone',
            category: data.category,
            subcategory: data.subcategory,
            impact: data.impact,
            urgency: data.urgency,
            businessService: data.businessService || data.service,
            assignmentGroup: data.assignmentGroup,
            assignee: data.assigneeId || data.assignee,
            assigneeName: data.assigneeName,
            configurationItem: data.configurationItem || data.configItem
        };
        const result = await _post('/api/itsm/incidents', payload);
        if (result.success) {
            await loadCollection('incidents');
        }
        return result;
    }

    async function updateIncidentStatus(id, status) {
        const result = await _patch(`/api/itsm/incidents/${id}/status`, { status });
        if (result.success) await loadCollection('incidents');
        return result;
    }

    async function addIncidentNote(id, noteData) {
        const result = await _post(`/api/itsm/incidents/${id}/notes`, {
            content: noteData.content,
            type: noteData.type || 'internal',
            author: noteData.author || ITSMData.currentUser.name
        });
        if (result.success) await loadCollection('incidents');
        return result;
    }

    async function assignIncident(id, assignData) {
        const result = await _post(`/api/itsm/incidents/${id}/assign`, {
            assignmentGroup: assignData.assignmentGroup,
            assignee: assignData.assignee || assignData.assigneeId,
            assigneeName: assignData.assigneeName
        });
        if (result.success) await loadCollection('incidents');
        return result;
    }

    async function escalateIncident(id) {
        const result = await _post(`/api/itsm/incidents/${id}/escalate`, {});
        if (result.success) await loadCollection('incidents');
        return result;
    }

    async function resolveIncident(id, resolutionCode, resolutionNotes) {
        const result = await _post(`/api/itsm/incidents/${id}/resolve`, {
            resolutionCode, resolutionNotes
        });
        if (result.success) await loadCollection('incidents');
        return result;
    }

    async function linkIncident(id, targetId, linkType) {
        const result = await _post(`/api/itsm/incidents/${id}/link`, { targetId, linkType });
        if (result.success) await loadCollection('incidents');
        return result;
    }

    async function saveEntity(collection, id, data) {
        const route = COLLECTION_MAP[collection];
        if (!route) throw new Error(`Unknown collection: ${collection}`);
        const result = await _patch(`${route}/${id}`, data);
        await loadCollection(collection);
        return result;
    }

    // ─── Changes ───

    async function createChange(data) {
        const result = await _post('/api/itsm/changes', {
            title: data.title,
            description: data.description,
            type: data.type,
            risk: data.risk,
            priority: data.priority,
            category: data.category,
            subcategory: data.subcategory,
            requestedBy: ITSMData.currentUser.username,
            requesterName: ITSMData.currentUser.name,
            requesterEmail: data.requesterEmail,
            requesterDept: data.requesterDept,
            assignedTo: data.assignedTo,
            assignee: data.assignee,
            implementer: data.implementer,
            impact: data.impact,
            affectedUsers: data.affectedUsers,
            affectedServices: data.affectedServices,
            affectedAssets: data.affectedAssets,
            outageRequired: data.outageRequired,
            outageDuration: data.outageDuration,
            justification: data.justification,
            implementationPlan: data.implementationPlan,
            testPlan: data.testPlan,
            rollbackPlan: data.rollbackPlan,
            relatedIncident: data.relatedIncident,
            scheduledStart: data.scheduledStart,
            scheduledEnd: data.scheduledEnd,
            changeWindow: data.changeWindow,
            notifyRecipients: data.notifyRecipients,
            communicationNotes: data.communicationNotes
        });
        if (result.success) await loadCollection('changes');
        return result;
    }

    async function updateChangeStatus(id, status) {
        const result = await _patch(`/api/itsm/changes/${id}/status`, { status });
        if (result.success) await loadCollection('changes');
        return result;
    }

    async function approveChange(id, approver, comments) {
        const result = await _post(`/api/itsm/changes/${id}/approve`, {
            approver: approver || ITSMData.currentUser.name,
            comments
        });
        if (result.success) await loadCollection('changes');
        return result;
    }

    async function rejectChange(id, reason, approver) {
        const result = await _post(`/api/itsm/changes/${id}/reject`, {
            reason,
            approver: approver || ITSMData.currentUser.name
        });
        if (result.success) await loadCollection('changes');
        return result;
    }

    async function implementChange(id) {
        const result = await _post(`/api/itsm/changes/${id}/implement`, {});
        if (result.success) await loadCollection('changes');
        return result;
    }

    async function completeChange(id, success, failureReason) {
        const result = await _post(`/api/itsm/changes/${id}/complete`, {
            success, failureReason
        });
        if (result.success) await loadCollection('changes');
        return result;
    }

    // ─── Service Requests ───

    async function createRequest(data) {
        const result = await _post('/api/itsm/requests', {
            catalogItem: data.catalogItem,
            requestedBy: data.requestedBy || ITSMData.currentUser.username,
            requestedByName: data.requestedByName || ITSMData.currentUser.name,
            requestedFor: data.requestedFor,
            requestedForName: data.requestedForName,
            requestedForDepartment: data.requestedForDepartment,
            requestedForLocation: data.requestedForLocation,
            requestedForVip: data.requestedForVip,
            description: data.description,
            priority: data.priority,
            impact: data.impact,
            urgency: data.urgency,
            formData: data.formData,
            assignmentGroup: data.assignmentGroup,
            approver: data.approver,
            approverName: data.approverName
        });
        if (result.success) await loadCollection('serviceRequests');
        return result;
    }

    async function updateRequestStatus(id, status) {
        const result = await _patch(`/api/itsm/requests/${id}/status`, { status });
        if (result.success) await loadCollection('serviceRequests');
        return result;
    }

    async function approveRequest(id, approver, comments) {
        const result = await _post(`/api/itsm/requests/${id}/approve`, {
            approver: approver || ITSMData.currentUser.name,
            comments
        });
        if (result.success) await loadCollection('serviceRequests');
        return result;
    }

    async function rejectRequest(id, reason, approver) {
        const result = await _post(`/api/itsm/requests/${id}/reject`, {
            reason,
            approver: approver || ITSMData.currentUser.name
        });
        if (result.success) await loadCollection('serviceRequests');
        return result;
    }

    async function fulfillRequest(id, notes, actualCost) {
        const result = await _post(`/api/itsm/requests/${id}/fulfill`, {
            notes, actualCost
        });
        if (result.success) await loadCollection('serviceRequests');
        return result;
    }

    async function assignRequest(id, assignData) {
        const result = await _post(`/api/itsm/requests/${id}/assign`, {
            assignmentGroup: assignData.assignmentGroup,
            assignee: assignData.assignee,
            assigneeName: assignData.assigneeName
        });
        if (result.success) await loadCollection('serviceRequests');
        return result;
    }

    async function addRequestNote(id, noteData) {
        const result = await _post(`/api/itsm/requests/${id}/notes`, {
            content: noteData.content,
            type: noteData.type || 'internal',
            author: noteData.author || ITSMData.currentUser.name
        });
        if (result.success) await loadCollection('serviceRequests');
        return result;
    }

    // ─── Problems ───

    async function createProblem(data) {
        const result = await _post('/api/itsm/problems', {
            title: data.title,
            description: data.description,
            priority: data.priority,
            category: data.category,
            linkedIncidents: data.linkedIncidents,
            affectedAssets: data.affectedAssets,
            assignedTo: data.assignedTo,
            assignee: data.assignee,
            assigneeName: data.assigneeName
        });
        if (result.success) await loadCollection('problems');
        return result;
    }

    async function updateProblemStatus(id, status) {
        const result = await _patch(`/api/itsm/problems/${id}/status`, { status });
        if (result.success) await loadCollection('problems');
        return result;
    }

    async function updateProblemRootCause(id, rootCause, workaround, convertToKnownError) {
        const result = await _patch(`/api/itsm/problems/${id}/root-cause`, {
            rootCause, workaround, convertToKnownError
        });
        if (result.success) await loadCollection('problems');
        return result;
    }

    async function linkIncidentToProblem(problemId, incidentId) {
        const result = await _post(`/api/itsm/problems/${problemId}/link-incident`, { incidentId });
        if (result.success) {
            await Promise.all([loadCollection('problems'), loadCollection('incidents')]);
        }
        return result;
    }

    // ─── Assets ───

    async function createAsset(data) {
        const result = await _post('/api/itsm/assets', {
            name: data.name,
            type: data.type,
            owner: data.owner,
            ownerName: data.ownerName,
            location: data.location,
            os: data.os,
            manufacturer: data.manufacturer,
            model: data.model,
            serialNumber: data.serialNumber,
            purchaseDate: data.purchaseDate,
            warrantyExpiry: data.warrantyExpiry,
            ipAddress: data.ipAddress
        });
        if (result.success) await loadCollection('assets');
        return result;
    }

    async function updateAssetStatus(id, status) {
        const result = await _patch(`/api/itsm/assets/${id}/status`, { status });
        if (result.success) await loadCollection('assets');
        return result;
    }

    // ─── Knowledge Base ───

    async function createKBArticle(data) {
        const result = await _post('/api/itsm/knowledge', {
            title: data.title,
            content: data.content,
            category: data.category,
            author: ITSMData.currentUser.username,
            authorName: ITSMData.currentUser.name,
            tags: data.tags,
            applicability: data.applicability
        });
        if (result.success) await loadCollection('knowledgeArticles');
        return result;
    }

    async function publishKBArticle(id) {
        const result = await _patch(`/api/itsm/knowledge/${id}/publish`, {});
        if (result.success) await loadCollection('knowledgeArticles');
        return result;
    }

    async function archiveKBArticle(id) {
        const result = await _patch(`/api/itsm/knowledge/${id}/archive`, {});
        if (result.success) await loadCollection('knowledgeArticles');
        return result;
    }

    async function viewKBArticle(id) {
        return _post(`/api/itsm/knowledge/${id}/view`, {});
    }

    async function markKBHelpful(id) {
        return _post(`/api/itsm/knowledge/${id}/helpful`, {});
    }

    // ─── Notifications ───

    async function markNotificationRead(id) {
        const result = await _patch(`/api/itsm/notifications/${id}/read`, {});
        if (result.success) await loadCollection('notifications');
        return result;
    }

    async function markAllNotificationsRead() {
        const result = await _post('/api/itsm/notifications/mark-all-read', {
            recipientId: ITSMData.currentUser.id
        });
        if (result.success) await loadCollection('notifications');
        return result;
    }

    // ─── Dashboard ───

    async function loadDashboardStats() {
        try {
            const result = await _get('/api/itsm/dashboard/stats');
            if (result.success) {
                mergeDashboardStats(result.data);
                return true;
            }
        } catch (_) {
            computeDashboardStats();
        }
        return false;
    }

    // ─── Reset ───

    async function resetDemoData() {
        const result = await _post('/api/itsm/reset', {});
        if (result.success) {
            await loadAll();
        }
        return result;
    }

    // ─── Audit Log ───

    async function loadRecentAuditLog() {
        try {
            const result = await _get('/api/itsm/audit-log/recent');
            if (result.success) {
                ITSMData.auditLog = result.data;
                return true;
            }
        } catch (_) {}
        return false;
    }

    // ─── Public API ───

    return {
        loadAll,
        loadCollection,
        loadDashboardStats,
        computeDashboardStats,
        loadRecentAuditLog,

        // Incidents
        createIncident,
        updateIncidentStatus,
        addIncidentNote,
        assignIncident,
        escalateIncident,
        resolveIncident,
        linkIncident,

        // Generic entity save (json-server PATCH)
        saveEntity,

        // Changes
        createChange,
        updateChangeStatus,
        approveChange,
        rejectChange,
        implementChange,
        completeChange,

        // Service Requests
        createRequest,
        updateRequestStatus,
        approveRequest,
        rejectRequest,
        fulfillRequest,
        assignRequest,
        addRequestNote,

        // Problems
        createProblem,
        updateProblemStatus,
        updateProblemRootCause,
        linkIncidentToProblem,

        // Assets
        createAsset,
        updateAssetStatus,

        // Knowledge Base
        createKBArticle,
        publishKBArticle,
        archiveKBArticle,
        viewKBArticle,
        markKBHelpful,

        // Notifications
        markNotificationRead,
        markAllNotificationsRead,

        // Reset
        resetDemoData
    };
})();
