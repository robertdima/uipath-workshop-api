/**
 * ITSM Console - Utility Functions Module
 */

const Utils = {
    // Date formatting
    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    formatDateTime(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    },

    formatDateTimeInput(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().slice(0, 16);
    },

    // Generate IDs
    generateId(prefix, array) {
        const maxNum = array.reduce((max, item) => {
            const num = parseInt(item.id.replace(prefix + '-', ''));
            return num > max ? num : max;
        }, 0);
        return `${prefix}-${String(maxNum + 1).padStart(3, '0')}`;
    },

    // SLA Badge rendering
    renderSLABadge(incident) {
        if (incident.status === 'Resolved' || incident.status === 'Closed') {
            return '<span class="sla-timer sla-ok">Completed</span>';
        }

        const now = new Date();
        const sla = new Date(incident.slaTarget);
        const diff = sla - now;

        if (diff < 0) {
            return '<span class="sla-timer sla-breach">BREACHED</span>';
        } else if (diff < 3600000) {
            return '<span class="sla-timer sla-warning">< 1h</span>';
        } else {
            const hours = Math.floor(diff / 3600000);
            return `<span class="sla-timer sla-ok">${hours}h</span>`;
        }
    },

    // File icons
    getFileIcon(type) {
        const icons = {
            'log': '📄',
            'screenshot': '🖼️',
            'dump': '💾',
            'pdf': '📕',
            'doc': '📘',
            'image': '🖼️',
            'default': '📎'
        };
        return icons[type] || icons.default;
    },

    // Status badge HTML
    getStatusBadge(status) {
        const statusClass = status.toLowerCase().replace(/\s+/g, '-');
        return `<span class="badge badge-${statusClass}">${status}</span>`;
    },

    // Priority badge HTML
    getPriorityBadge(priority) {
        return `<span class="badge priority-${priority.toLowerCase()}">${priority}</span>`;
    },

    // Add audit log entry - no-op: audit logging is now handled server-side by the API
    addAuditLog(actor, action, target, details) {
        // Server-side API creates audit entries automatically
    },

    // Escape HTML (safe for both element content and quoted attribute values)
    escapeHtml(text) {
        if (text == null) return '';
        const str = String(text);
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },

    // Debounce function for search inputs
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Deep clone object
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Check if object is empty
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    },

    // Truncate text
    truncate(text, length = 50) {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    }
};

window.Utils = Utils;

/**
 * Initialise draggable split-pane resizers.
 * Call after rendering any view that contains .split-pane.
 * Safe to call multiple times — only binds resizers that exist in the DOM.
 */
function initSplitResizers() {
    document.querySelectorAll('.split-resizer').forEach(resizer => {
        if (resizer._bound) return;
        resizer._bound = true;

        resizer.addEventListener('mousedown', function (e) {
            e.preventDefault();
            const pane = resizer.closest('.split-pane');
            const left = pane.querySelector('.split-left');
            if (!pane || !left) return;

            resizer.classList.add('dragging');
            const startX = e.clientX;
            const startW = left.getBoundingClientRect().width;

            function onMove(ev) {
                const newW = Math.max(200, Math.min(startW + ev.clientX - startX, pane.clientWidth - 200));
                left.style.width = newW + 'px';
                left.style.flexShrink = '0';
            }
            function onUp() {
                resizer.classList.remove('dragging');
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    });
}
window.initSplitResizers = initSplitResizers;
